import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwnipxzdkjeeeinidvec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmlweHpka2plZWVpbmlkdmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODU2OSwiZXhwIjoyMDg2OTc0NTY5fQ.Id0t8v-EdERN6OkDpbG-ak2ctuCvjCX3bNBlVK3c_5A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("=== Starting Backend Verification ===");

    // 1. Get Store
    const { data: store, error: storeErr } = await supabase.from('stores').select('id, name, slug').eq('slug', 'meera-textiles').single();
    if (storeErr || !store) {
        console.error("Store not found:", storeErr);
        return;
    }
    console.log("[OK] Store Found:", store.name);

    // 2. Get the latest order for the store
    const { data: orders, error: orderErr } = await supabase.from('orders')
        .select('*, customers(full_name, email), order_items(*)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(1);

    if (orderErr || !orders || orders.length === 0) {
        console.error("No orders found for this store:", orderErr);
        return;
    }

    const latestOrder = orders[0];
    console.log(`[OK] Latest Order Found: ID = ${latestOrder.id}, Status = ${latestOrder.status}, Total = ${latestOrder.total_amount}`);
    console.log(`[OK] Payment Mode: ${latestOrder.payment_mode}`);
    console.log(`[OK] Customer Detail (CRM relation): ${latestOrder.customers?.full_name} (${latestOrder.customers?.email})`);
    console.log(`[OK] Order Items: ${latestOrder.order_items.length} items attached.`);

    console.log("=== Verification Successful ===");
}

verify();
