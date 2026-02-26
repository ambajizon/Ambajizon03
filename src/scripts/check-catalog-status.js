require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkCatalog() {
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

    console.log('Logged in.');

    // Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) console.log('Cat Error:', catError.message);
    else console.log('Categories:', categories.length, categories.map(c => c.name));

    // Subcategories
    const { data: subcategories, error: subError } = await supabase.from('subcategories').select('*');
    if (subError) console.log('Sub Error:', subError.message);
    else console.log('Subcategories:', subcategories.length, subcategories.map(s => s.name));

    // Try to insert a product directly
    const { data: store } = await supabase.from('stores').select('id').eq('shopkeeper_id', session.user.id).single();
    const { data: cat } = await supabase.from('categories').select('id').eq('name', 'Handicrafts').single();
    if (store && cat) {
        const { error: insertError } = await supabase.from('products').insert({
            store_id: store.id,
            category_id: cat.id,
            name: 'Script Product',
            price: 100,
            stock: 5,
            is_enabled: true
        });
        if (insertError) console.log('Insert Error:', insertError.message);
        else console.log('Insert Success: Script Product created');
    } else {
        console.log('Cannot insert: Store or Category not found', { store, cat });
    }

    // Products
    const { data: products, error: prodError } = await supabase.from('products').select('*');
    if (prodError) console.log('Prod Error:', prodError.message);
    else console.log('Products:', products.length, products.map(p => p.name));

    const output = `CATS=${categories ? categories.length : 0}\nSUBS=${subcategories ? subcategories.length : 0}\nPRODS=${products ? products.length : 0}\n`;
    fs.writeFileSync('catalog_result.txt', output);
}

checkCatalog();
