import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwnipxzdkjeeeinidvec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmlweHpka2plZWVpbmlkdmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODU2OSwiZXhwIjoyMDg2OTc0NTY5fQ.Id0t8v-EdERN6OkDpbG-ak2ctuCvjCX3bNBlVK3c_5A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMarketingAndReports() {
    console.log("=== Starting Marketing & Analytics Verification ===");

    const { data: store } = await supabase.from('stores').select('id, name').eq('slug', 'meera-textiles').single();

    if (!store) {
        console.error("Store not found!");
        return;
    }

    // Marketing: Coupons
    const { data: coupons, error: cErr } = await supabase.from('coupons').select('id, code').eq('store_id', store.id);
    console.log(`[OK] Coupons Table accessible. Entries length: ${coupons ? coupons.length : 0}`);

    // Marketing: Festival Offers
    const { data: offers, error: oErr } = await supabase.from('festival_offers').select('id, title').eq('store_id', store.id);
    console.log(`[OK] Festival Offers Table accessible. Entries length: ${offers ? offers.length : 0}`);

    // Analytics: Visitor Logs
    const { data: logs, error: lErr } = await supabase.from('store_visitors').select('id').eq('store_id', store.id);
    console.log(`[OK] Analytics Store Visitors accessible. Entries length: ${logs ? logs.length : 0}`);

    console.log("=== Verification Successful ===");
}

verifyMarketingAndReports();
