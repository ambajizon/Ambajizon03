/**
 * RN Media Gifts & Crafts - Demo Store Setup Script (correctly handles shopkeepers FK)
 * 
 * Schema: stores.shopkeeper_id -> public.shopkeepers(id) -> auth.users(id)
 * So we must: 1) create auth user, 2) insert shopkeepers row, 3) insert/update stores row
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\0e446e7b-b7ae-49a0-a960-eef0b61038ef';
const EMAIL = 'rnmedia123@gmail.com';
const PASSWORD = 'Sunday123';

function findImage(key) {
    const files = fs.readdirSync(IMAGES_DIR);
    const match = files.find(f => f.startsWith(key) && f.endsWith('.png'));
    if (!match) throw new Error(`Image not found for key: ${key}`);
    return path.join(IMAGES_DIR, match);
}

async function upload(localPath, publicId) {
    console.log(`  ↑ ${path.basename(localPath)}`);
    const r = await cloudinary.uploader.upload(localPath, {
        public_id: `ambajizon/rnmedia/${publicId}`,
        overwrite: true,
        resource_type: 'image',
    });
    console.log(`  ✓ ${r.secure_url}`);
    return r.secure_url;
}

async function main() {
    const log = [];
    console.log('\n🚀 RN Media Demo Store Setup\n');

    // ── 1. Auth User ───────────────────────────────────────────────────────
    console.log('[1] Auth user...');
    let userId;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users.find(u => u.email === EMAIL);
    if (existing) {
        userId = existing.id;
        await supabase.auth.admin.updateUserById(userId, { password: PASSWORD });
        console.log(`  ✓ Found (${userId})`);
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email: EMAIL, password: PASSWORD, email_confirm: true,
            user_metadata: { full_name: 'RN Media', role: 'shopkeeper' }
        });
        if (error) throw new Error(`Auth: ${error.message}`);
        userId = data.user.id;
        console.log(`  ✓ Created (${userId})`);
    }
    log.push(`✓ Auth user: ${EMAIL} (${userId})`);

    // ── 2. Shopkeepers row ─────────────────────────────────────────────────
    console.log('\n[2] Shopkeepers profile...');
    const { data: existingShopkeeper } = await supabase
        .from('shopkeepers').select('id').eq('id', userId).maybeSingle();
    if (existingShopkeeper) {
        console.log('  ✓ Shopkeeper profile already exists');
    } else {
        const { error } = await supabase.from('shopkeepers').insert({
            id: userId,
            email: EMAIL,
            subscription_status: 'trial',
        });
        if (error) throw new Error(`Shopkeepers insert: ${error.message}`);
        console.log('  ✓ Shopkeeper profile created');
    }
    log.push(`✓ Shopkeeper profile`);

    // ── 3. Upload branding ─────────────────────────────────────────────────
    console.log('\n[3] Uploading branding...');
    const logoUrl = await upload(findImage('rnmedia_logo'), 'logo');
    const bannerUrl = await upload(findImage('rnmedia_hero_banner'), 'banner');
    log.push(`✓ Logo: ${logoUrl}`);
    log.push(`✓ Banner: ${bannerUrl}`);

    // ── 4. Store ───────────────────────────────────────────────────────────
    console.log('\n[4] Store setup...');
    const themeConfig = {
        tagline: 'Unique Gifts & Memories from India',
        footer_text: 'Visit us for authentic Indian handicrafts and souvenirs',
        phone_number: '9876543210',
        whatsapp_number: '919876543210',
        shop_timing: '10:00 AM - 8:00 PM',
        location_url: 'https://maps.google.com/?q=Ambaji+Gujarat',
        hero_banner_url: bannerUrl,
        hero_image_url: bannerUrl,
        hero_title: 'RN Media Gifts & Crafts',
        hero_subtitle: 'Authentic Indian Souvenirs',
        hero_cta_text: 'Shop Now',
        primary_color: '#1A237E',
        font_style: 'sans',
        social_links: {
            instagram: '@rnmediagifts',
            facebook: 'RNMediaGifts',
            x: '', youtube: ''
        },
        show_exclusive: true,
        show_flash_sale: true,
        show_sales_zone: true,
        show_categories: true,
        payment_settings: { cod_enabled: true }
    };

    const { data: existingStore } = await supabase
        .from('stores').select('id').eq('shopkeeper_id', userId).maybeSingle();

    let storeId;
    const storeData = {
        shopkeeper_id: userId,
        name: 'RN Media Gifts & Crafts',
        slug: 'rnmedia-gifts',
        logo_url: logoUrl,
        primary_color: '#1A237E',
        font_family: 'inter',
        theme_config: themeConfig,
    };

    if (existingStore) {
        storeId = existingStore.id;
        const { error } = await supabase.from('stores').update(storeData).eq('id', storeId);
        if (error) console.log(`  Warning: ${error.message}`);
        console.log(`  ✓ Updated (${storeId})`);
    } else {
        const { data, error } = await supabase.from('stores').insert(storeData).select('id').single();
        if (error) throw new Error(`Store insert: ${error.message}`);
        storeId = data.id;
        console.log(`  ✓ Created (${storeId})`);
    }
    log.push(`✓ Store: rnmedia-gifts (${storeId})`);

    // ── 5. Categories ──────────────────────────────────────────────────────
    console.log('\n[5] Categories...');
    const catDefs = [
        { name: 'Handicrafts', key: 'category_handicrafts' },
        { name: 'Jewellery', key: 'category_jewellery' },
        { name: 'Souvenirs', key: 'category_souvenirs' },
    ];
    const catIds = {};
    for (let i = 0; i < catDefs.length; i++) {
        const c = catDefs[i];
        const imgUrl = await upload(findImage(c.key), `cat-${c.name.toLowerCase()}`);
        const { data: ex } = await supabase.from('categories')
            .select('id').eq('store_id', storeId).eq('name', c.name).maybeSingle();
        if (ex) {
            await supabase.from('categories').update({ image_url: imgUrl, is_enabled: true, sort_order: i }).eq('id', ex.id);
            catIds[c.name] = ex.id;
        } else {
            const { data, error } = await supabase.from('categories').insert({
                store_id: storeId, name: c.name, image_url: imgUrl, is_enabled: true, sort_order: i
            }).select('id').single();
            if (error) { console.log(`  ✗ ${c.name}: ${error.message}`); continue; }
            catIds[c.name] = data.id;
        }
        console.log(`  ✓ ${c.name}`);
        log.push(`✓ Category: ${c.name}`);
    }

    // ── 6. Products ────────────────────────────────────────────────────────
    console.log('\n[6] Products...');
    const prods = [
        {
            name: 'Handcrafted Wooden Elephant',
            cat: 'Handicrafts', price: 349, mrp: 499, stock: 50, badge: 'Hot',
            display_section: 'exclusive', key: 'product_wooden_elephant',
            description: 'Beautiful hand carved wooden elephant, perfect souvenir from India. Crafted by local artisans.'
        },
        {
            name: 'Traditional Brass Necklace',
            cat: 'Jewellery', price: 599, mrp: 799, stock: 30, badge: 'New',
            display_section: 'flash_sale', key: 'product_brass_necklace',
            description: 'Elegant traditional brass necklace with intricate Indian designs. Perfect gift for loved ones.'
        },
        {
            name: 'India Memory Gift Box',
            cat: 'Souvenirs', price: 899, mrp: 1199, stock: 20, badge: 'Limited',
            display_section: 'sales_zone', key: 'product_gift_box',
            description: 'Curated gift box with authentic Indian souvenirs. Includes miniature Taj Mahal, spices, and handicraft item.'
        }
    ];

    for (const p of prods) {
        const imgUrl = await upload(findImage(p.key), `prod-${p.name.toLowerCase().replace(/\s+/g, '-')}`);
        const payload = {
            store_id: storeId,
            category_id: catIds[p.cat],
            name: p.name, description: p.description,
            images: [imgUrl], price: p.price, mrp: p.mrp, stock: p.stock,
            badge: p.badge, display_section: p.display_section, is_enabled: true,
        };
        const { data: ex } = await supabase.from('products')
            .select('id').eq('store_id', storeId).eq('name', p.name).maybeSingle();
        if (ex) {
            await supabase.from('products').update(payload).eq('id', ex.id);
        } else {
            const { error } = await supabase.from('products').insert(payload);
            if (error) { console.log(`  ✗ ${p.name}: ${error.message}`); continue; }
        }
        console.log(`  ✓ ${p.name} (₹${p.price})`);
        log.push(`✓ Product: ${p.name} ₹${p.price}`);
    }

    // ── Report ─────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(55));
    console.log('✅ SETUP COMPLETE');
    console.log('='.repeat(55));
    log.forEach(l => console.log(l));
    console.log(`\n🌐 http://localhost:3000/rnmedia-gifts`);
    console.log(`🏪 http://localhost:3000/rnmedia-gifts/shop`);
    console.log(`🔑 ${EMAIL} / ${PASSWORD}`);
    console.log(`📊 http://localhost:3000/dashboard`);

    fs.writeFileSync('rnmedia_setup_result.json', JSON.stringify({ storeId, userId, logoUrl, bannerUrl, catIds, log }, null, 2));
    console.log('\n📄 Saved: rnmedia_setup_result.json');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
