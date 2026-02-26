require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    const storeId = '76faaeda-f8d3-4604-a271-a5fdbd12561f';
    const { data: store } = await supabase.from('stores').select('theme_config').eq('id', storeId).single();
    if (store) {
        store.theme_config.whatsapp_number = '919876543210';
        store.theme_config.phone_number = '9876543210';
        store.theme_config.shop_timing = '10:00 AM - 8:00 PM';
        store.theme_config.location_url = 'https://maps.google.com/?q=Rajesh+Handicrafts';
        await supabase.from('stores').update({ theme_config: store.theme_config }).eq('id', storeId);
        console.log("Fixed theme_config JSONB.");
    }
}
fix();
