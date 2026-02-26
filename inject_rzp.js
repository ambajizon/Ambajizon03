require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const encrypt = (text) => process.env.ENCRYPTION_KEY ? CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString() : '';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function injectKeys() {
    const { data: store } = await supabase.from('stores').select('id').eq('slug', 'rajesh-handicrafts').single();
    if (!store) return console.log("Store not found");
    const storeId = store.id;

    const { data: existing } = await supabase.from('payment_settings').select('*').eq('store_id', storeId).single();

    if (existing) {
        await supabase.from('payment_settings').update({
            razorpay_key_id: 'rzp_test_1MBZ2z9F9w123p', // Dummy Test key format
            razorpay_key_secret: encrypt('dummy_secret_do_not_use'),
            is_cod_enabled: true
        }).eq('store_id', storeId);
    } else {
        await supabase.from('payment_settings').insert({
            store_id: storeId,
            razorpay_key_id: 'rzp_test_1MBZ2z9F9w123p',
            razorpay_key_secret: encrypt('dummy_secret_do_not_use'),
            is_cod_enabled: true
        });
    }
    console.log("Successfully injected Razorpay configuration for test store.");
}

injectKeys();
