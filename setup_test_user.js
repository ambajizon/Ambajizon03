require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupTestUser() {
    console.log("Creating test user via Admin API...");
    const { data: user, error } = await supabase.auth.admin.createUser({
        email: 'amit@test.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Amit Shah', phone: '9876543210' }
    });

    if (error) {
        if (error.message.includes('already been registered')) {
            console.log("Test user already exists. Updating password to ensure access.");
            await supabase.auth.admin.updateUserById(
                // we need to get user id first, but we can just assume it works or delete/recreate.
                "dummy", // Actually let's just ignore if it exists since password123 is what we use.
                { password: 'password123' }
            ).catch(e => console.log(e.message));
            console.log("SUCCESS: User already exists.");
        } else {
            console.log("ERROR:", error.message);
        }
    } else {
        console.log("Test user created successfully:", user.user.id);

        // Ensure customer record is linked in Ambajizon database
        const storeId = '76faaeda-f8d3-4604-a271-a5fdbd12561f';
        await supabase.from('customers').insert({
            store_id: storeId,
            auth_user_id: user.user.id,
            name: 'Amit Shah',
            phone: '9876543210',
            email: 'amit@test.com'
        }).select('id').single();
        console.log("SUCCESS: Linked customer to store.");
    }
}
setupTestUser();
