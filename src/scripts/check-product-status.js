require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkProduct() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use Anon Key to simulate public access
    const supabase = createClient(supabaseUrl, anonKey);

    console.log('Checking Product Status...');

    // 1. Get Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, slug')
        .eq('slug', 'rajesh-handicrafts')
        .single();

    if (storeError || !store) {
        console.log('Store not found:', storeError ? storeError.message : 'No data');
        return;
    }
    console.log(`Store: ${store.slug} (${store.id})`);

    // 2. Get Product (Admin/Service Role would see all, but let's see what Anon sees if RLS is on)
    // Actually, let's use Service Role to inspect the TRUTH first.
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: product, error: prodError } = await serviceClient
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .ilike('name', '%Wooden Elephant 2%')
        .single();

    if (prodError) {
        console.log('Product "Wooden Elephant 2" NOT FOUND in DB for this store:', prodError.message);
    } else {
        console.log('Product Found (DB Truth):');
        console.log(`- ID: ${product.id}`);
        console.log(`- Enabled: ${product.is_enabled}`);
        console.log(`- Stock: ${product.stock}`);
        console.log(`- Section: ${product.display_section}`);
        console.log(`- Store ID: ${product.store_id}`);
    }

    // 3. Test Public Query (RLS Check)
    console.log('Testing Public Query (RLS)...');
    const { data: publicProducts, error: pubError } = await supabase
        .from('products')
        .select('id, name')
        .eq('store_id', store.id)
        .eq('is_enabled', true);

    if (pubError) {
        console.log('Public Query Error:', pubError.message);
    } else {
        console.log(`Public Query returned ${publicProducts.length} products.`);
        if (publicProducts.length === 0) console.log('WARNING: Public query returned 0 items despite product existing.');
    }
    // 4. Check Categories
    const { data: categories } = await supabase.from('categories').select('id, name').eq('store_id', store.id);
    console.log('Store Categories:', categories);

    if (product) {
        const match = categories.find(c => c.id === product.category_id);
        console.log(`Product Category ID: ${product.category_id}`);
        console.log(`Matched Category Name: ${match ? match.name : 'MISMATCH/NULL'}`);
    }
}

checkProduct();
