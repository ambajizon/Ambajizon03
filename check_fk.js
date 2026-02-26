require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Check if shopkeepers table exists and what columns it has
    const { data: sk, error: skErr } = await supabase.from('shopkeepers').select('*').limit(2);
    console.log('SHOPKEEPERS:', JSON.stringify(sk, null, 2));
    if (skErr) console.log('SHOPKEEPERS ERROR:', skErr.message);

    // Check users table
    const { data: users, error: usersErr } = await supabase.from('users').select('*').limit(2);
    console.log('USERS:', JSON.stringify(users, null, 2));
    if (usersErr) console.log('USERS ERROR:', usersErr.message);

    // Check profiles table
    const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(2);
    console.log('PROFILES:', JSON.stringify(profiles, null, 2));
    if (profErr) console.log('PROFILES ERROR:', profErr.message);

    // List all tables
    const { data: tables } = await supabase.rpc('get_tables').catch(() => ({ data: null }));
    if (tables) console.log('TABLES via RPC:', tables);

    const result = { sk, users, profiles };
    fs.writeFileSync('fk_check.json', JSON.stringify(result, null, 2));
}
main().catch(e => console.error(e.message));
