require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const storeId = '76faaeda-f8d3-4604-a271-a5fdbd12561f';
    const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
    const { data: cats } = await supabase.from('categories').select('*').eq('store_id', storeId);
    const { data: subcats } = await supabase.from('subcategories').select('*');
    const { data: prods } = await supabase.from('products').select('*').eq('store_id', storeId);

    const output = {
        store,
        cats,
        subcats,
        prods
    };
    fs.writeFileSync('db_output.json', JSON.stringify(output, null, 2));
}

run();
