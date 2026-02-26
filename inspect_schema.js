require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: store } = await supabase.from('stores').select('*').limit(1).single();
    const { data: cat } = await supabase.from('categories').select('*').limit(1).single();
    const { data: prod } = await supabase.from('products').select('*').limit(1).single();

    const result = {
        store_columns: store ? Object.keys(store) : [],
        cat_columns: cat ? Object.keys(cat) : [],
        prod_columns: prod ? Object.keys(prod) : [],
        sample_store: store,
        sample_prod: prod
    };
    fs.writeFileSync('schema_out.json', JSON.stringify(result, null, 2));
    console.log('Schema written to schema_out.json');
    console.log('STORE COLUMNS:', (store ? Object.keys(store) : []).join(', '));
    console.log('CATEGORY COLUMNS:', (cat ? Object.keys(cat) : []).join(', '));
    console.log('PRODUCT COLUMNS:', (prod ? Object.keys(prod) : []).join(', '));
}
main().catch(e => console.error(e.message));
