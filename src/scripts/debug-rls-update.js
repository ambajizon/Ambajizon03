require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function debugRLS() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, anonKey);

    // Login
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'rajesh@ambajizon.com',
        password: 'Rajesh@123'
    });

    if (loginError) {
        console.log('Login failed:', loginError.message);
        return;
    }

    console.log('Logged in as:', session.user.id);

    // Try to update
    const { data, error } = await supabase
        .from('stores')
        .update({ name: 'Rajesh DEBUG Update' })
        .eq('shopkeeper_id', session.user.id)
        .select();

    if (error) {
        console.log('Update failed:', JSON.stringify(error, null, 2));
        fs.writeFileSync('rls_debug_error.txt', JSON.stringify(error, null, 2));
    } else {
        console.log('Update success:', JSON.stringify(data, null, 2));
        fs.writeFileSync('rls_debug_success.txt', JSON.stringify(data, null, 2));
    }
}

debugRLS();
