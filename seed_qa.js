require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    try {
        console.log("Starting QA seed for 'rajesh-handicrafts'...");

        // 1. Get Store UUID
        const { data: store, error: storeErr } = await supabase
            .from('stores')
            .select('id, shopkeeper_id')
            .eq('slug', 'rajesh-handicrafts')
            .single();

        if (storeErr || !store) {
            console.error("Store not found", storeErr);
            return;
        }
        const storeId = store.id;

        // 2. Update Store Settings
        await supabase.from('stores').update({
            hero_banner_url: 'https://images.unsplash.com/photo-1605367302456-11f84d6235b2?q=80&w=2000&auto=format&fit=crop',
            whatsapp_number: '919876543210',
            phone_number: '+919876543210',
            shop_timing: '10:00 AM - 8:00 PM',
            location_url: 'https://maps.google.com/?q=Rajesh+Handicrafts'
        }).eq('id', storeId);

        // 3. Create Categories
        const categoriesToCreate = ['Handicrafts', 'Jewellery', 'Religious Items'];
        const categoryMap = {};
        for (const catName of categoriesToCreate) {
            let { data: cat } = await supabase.from('categories').select('id').eq('store_id', storeId).eq('name', catName).maybeSingle();
            if (!cat) {
                const res = await supabase.from('categories').insert({
                    store_id: storeId,
                    name: catName,
                    is_enabled: true,
                    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop'
                }).select('id').single();
                if (res.error) throw new Error("Cat insert err: " + JSON.stringify(res.error));
                cat = res.data;
            }
            categoryMap[catName] = cat.id;
        }

        // 4. Create Subcategories
        const subcats = [
            { name: 'Wooden Toys', parent: 'Handicrafts' },
            { name: 'Brass Items', parent: 'Handicrafts' },
            { name: 'Necklaces', parent: 'Jewellery' },
            { name: 'Bangles', parent: 'Jewellery' },
            { name: 'Idols', parent: 'Religious Items' },
            { name: 'Pooja Items', parent: 'Religious Items' },
        ];

        const subcatMap = {};
        for (const sub of subcats) {
            const parentId = categoryMap[sub.parent];
            let { data: existing } = await supabase.from('subcategories').select('id').eq('category_id', parentId).eq('name', sub.name).maybeSingle();
            if (!existing) {
                const res = await supabase.from('subcategories').insert({
                    store_id: storeId,
                    category_id: parentId,
                    name: sub.name,
                    is_enabled: true
                }).select('id').single();
                if (res.error) throw new Error("Subcat insert err: " + JSON.stringify(res.error));
                existing = res.data;
            }
            subcatMap[sub.name] = existing.id;
        }

        // 5. Create Products
        const products = [
            {
                name: 'Wooden Ganesha Idol',
                description: 'Beautifully handcrafted wooden idol.',
                price: 299,
                mrp: 399,
                category_id: categoryMap['Handicrafts'],
                subcategory_id: subcatMap['Wooden Toys'],
                display_section: 'featured',
                is_enabled: true,
                stock: 10,
                images: ['https://images.unsplash.com/photo-1601758174114-e711c0cbaae2?w=800&fit=crop']
            },
            {
                name: 'Brass Diya Set',
                description: 'Traditional brass diya for pooja.',
                price: 150,
                mrp: 200,
                category_id: categoryMap['Religious Items'],
                subcategory_id: subcatMap['Pooja Items'],
                display_section: 'featured',
                is_enabled: true,
                stock: 10,
                images: ['https://images.unsplash.com/photo-1605367302456-11f84d6235b2?w=800&fit=crop']
            }
        ];

        for (const prod of products) {
            const { data: existing } = await supabase.from('products').select('id').eq('store_id', storeId).eq('name', prod.name).maybeSingle();
            if (!existing) {
                const res = await supabase.from('products').insert({
                    store_id: storeId,
                    ...prod
                });
                if (res.error) throw new Error("Prod insert err: " + JSON.stringify(res.error));
            } else {
                const res = await supabase.from('products').update(prod).eq('id', existing.id);
                if (res.error) throw new Error("Prod update err: " + JSON.stringify(res.error));
            }
        }
    } catch (e) {
        require('fs').writeFileSync('seed_err2.json', JSON.stringify({ message: e.message }, null, 2));
    }
}

seed();
