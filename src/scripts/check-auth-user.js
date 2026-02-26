require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('Checking Auth Users...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.log('Error listing users:', error.message);
        return;
    }

    const targetEmail = 'amit.audit@test.com';
    const found = users.find(u => u.email === targetEmail);

    if (found) {
        console.log('User FOUND:', found.email);
        console.log('ID:', found.id);
        console.log('Confirmed:', found.email_confirmed_at ? 'YES' : 'NO');

        // Check if customer record exists
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('auth_user_id', found.id)
            .single();

        console.log('Customer Record:', customer ? 'FOUND' : 'MISSING');
    } else {
        console.log('User NOT FOUND:', targetEmail);
    }
}

checkUser();
