require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const EMAIL = 'rnmedia123@gmail.com';

async function main() {
    // Get the user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === EMAIL);

    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log('User ID:', user.id);
    console.log('Created:', user.created_at);

    // Check if they already have a store
    const { data: store } = await supabase.from('stores').select('*').eq('shopkeeper_id', user.id).maybeSingle();
    console.log('\nExisting store:', store ? JSON.stringify(store, null, 2) : 'NONE');

    // If no store, let's check ALL stores to understand the pattern
    const { data: allStores } = await supabase.from('stores').select('id, shopkeeper_id, name, slug');
    console.log('\nAll stores:', JSON.stringify(allStores, null, 2));

    // Try to insert via raw SQL using Supabase RPC (pg_execute)
    // Use pg_net or supabase function to bypass FK issue
    // Actually, the FK references auth.users which does exist for our user
    // Let's try inserting without the FK constraint by using the internal admin API

    // Method: Use the REST API endpoint directly with service role
    const storeResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/stores`, {
        method: 'POST',
        headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            shopkeeper_id: user.id,
            name: 'RN Media Gifts & Crafts',
            slug: 'rnmedia-gifts',
            primary_color: '#1A237E',
            font_family: 'inter'
        })
    });
    const insertResult = await storeResp.text();
    console.log('\nDirect REST insert result:', storeResp.status, insertResult);

    fs.writeFileSync('fk_debug.json', JSON.stringify({ userId: user.id, allStores, insertStatus: storeResp.status, insertResult }, null, 2));
}
main().catch(e => console.error(e.message));
