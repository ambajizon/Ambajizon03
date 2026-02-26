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
        if (authError.message.includes('already been registered')) {
            console.log('User already exists in Auth. Fetching ID...');
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingUser = listData.users.find((u: any) => u.email === email);
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

    const { error: profileError } = await supabase
        .from('shopkeepers')
        .upsert({
            id: userId,
            email: email,
            full_name: 'Rajesh Patel',
            subscription_status: 'trial',
            trial_end_date: trialEndDate.toISOString()
        })
        .select()
        .single();

    if (profileError) {
        console.error('Error creating profile:', profileError);
        process.exit(1);
    }

    console.log('Shopkeeper profile created/updated successfully.');

    // 3. Check for Store
    const { data: store } = await supabase.from('stores').select('*').eq('shopkeeper_id', userId).single();
    if (store) {
        console.log(`Store already exists: ${store.name} (${store.slug})`);
    } else {
        console.log('No store found. Dashboard should trigger wizard.');
    }
}

createQAUser();
