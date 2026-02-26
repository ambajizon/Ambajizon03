require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createQAUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing Supabase credentials');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const email = 'rajesh@ambajizon.com';
    const password = 'Rajesh@123';

    console.log(`Creating user: ${email}...`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Rajesh Patel', role: 'shopkeeper' }
    });

    let userId;

    if (authError) {
        if (authError.message.includes('already been registered') || (authError.status === 422)) {
            console.log('User already exists in Auth. Fetching ID...');
            const { data: listData } = await supabase.auth.admin.listUsers();
            // Pagination handling might be needed if many users, but for dev env it's fine
            const existingUser = listData.users.find(u => u.email === email);
            if (existingUser) {
                userId = existingUser.id;
            } else {
                console.error('Could not find existing user ID');
                process.exit(1);
            }
        } else {
            console.error('Error creating auth user:', authError);
            process.exit(1);
        }
    } else {
        console.log('Auth user created.');
        userId = authData.user.id;
    }

    // 2. Create Shopkeeper Profile
    console.log(`Ensuring shopkeeper profile for ID: ${userId}...`);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    let { error: profileError } = await supabase
        .from('shopkeepers')
        .upsert({
            id: userId,
            email: email,
            subscription_status: 'trial',
            trial_end_date: trialEndDate.toISOString()
        })
        .select()
        .single();

    if (profileError) {
        console.log(`Failed to create profile: ${profileError.message}`);
        process.exit(1);
    }

    console.log('Shopkeeper profile created/updated successfully.');

    // 3. Ensure Store Exists (so Wizard does UPDATE, not INSERT which fails RLS)
    const { data: store, error: storeError } = await supabase.from('stores').select('*').eq('shopkeeper_id', userId).single();

    if (store) {
        console.log(`Store exists: ${store.name}. Resetting name...`);
        const { error: updateError } = await supabase.from('stores').update({
            name: 'Rajesh Store (Pending)',
            slug: `rajesh-store-${Date.now()}` // Temporary slug
        }).eq('id', store.id);

        if (updateError) console.error('Error resetting store:', updateError);
        else console.log('Store reset. Wizard should trigger (Update mode).');
    } else {
        console.log('No store found. Creating placeholder to allow Wizard UPDATE...');
        // Minimal insert - no is_setup_completed
        const { error: insertError } = await supabase.from('stores').insert({
            shopkeeper_id: userId,
            name: 'Rajesh Store (Pending)',
            slug: `rajesh-store-${Date.now()}`
        });

        if (insertError) console.error('Error creating placeholder store:', insertError);
        else console.log('Placeholder store created. Wizard ready (Update mode).');
    }
}

createQAUser();
