require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkStore() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const email = 'rajesh@ambajizon.com';

    // Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found.');
        return;
    }

    const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('shopkeeper_id', user.id)
        .single();

    if (error) {
        console.log('Error fetching store:', error.message);
    } else {
        const fs = require('fs');

        setTimeout(() => {
            const output = `STORE_NAME=${store ? store.name : 'NULL'}\nSTORE_SLUG=${store ? store.slug : 'NULL'}\nPHONE=${store ? store.phone_number : 'NULL'}\nLOGO=${store ? store.logo_url : 'NULL'}\n`;
            fs.writeFileSync('store_result.txt', output);
            console.log('Result written to store_result.txt');
        }, 2000);
    }
}

checkStore();
