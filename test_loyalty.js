require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
    console.log("--- Starting Loyalty Points E2E Backend Verify ---");

    // 1. Find a store
    const { data: store } = await supabase.from('stores').select('id, slug').limit(1).single();
    if (!store) return console.log("No store found");
    const storeId = store.id;

    let { data: amit } = await supabase.from('customers').select('*').eq('full_name', 'Amit Tester').limit(1).single();
    if (!amit) {
        const { data: inserted, error: custErr } = await supabase.from('customers').insert({
            store_id: storeId,
            full_name: 'Amit Tester',
            mobile: '9999999999',
            loyalty_points: 0
        }).select().single();
        if (custErr) throw new Error("Error creating Amit: " + JSON.stringify(custErr));
        amit = inserted;
    } else {
        await supabase.from('customers').update({ loyalty_points: 0 }).eq('id', amit.id);
        amit.loyalty_points = 0;
    }

    // Clear previous transactions for clean test
    await supabase.from('loyalty_transactions').delete().eq('customer_id', amit.id);

    // 3. Find a product & create an address
    const { data: product } = await supabase.from('products').select('*').eq('store_id', storeId).limit(1).single();
    if (!product) return console.log("No product found");

    // Helper to simulate createOrder backend logic
    async function simulateOrder(amountToSpend, pointsToRedeem) {
        // Direct insertion bypassing cart since we just want to test order math
        const maxDiscount = amountToSpend * 0.5;
        const computedDiscount = pointsToRedeem / 10;

        if (computedDiscount > maxDiscount) return { error: 'Too many points' };

        const total = Math.max(0, amountToSpend - computedDiscount);

        const { data: order, error: orderErr } = await supabase.from('orders').insert({
            store_id: storeId,
            customer_id: amit.id,
            status: 'pending',
            payment_mode: 'cod',
            payment_status: 'pending',
            subtotal: amountToSpend,
            total_amount: total,
            delivery_address: { full_name: "Amit Tester", city: "Udaipur", phone: "9999999999" }
        }).select().single();
        if (orderErr) {
            require('fs').writeFileSync('test_err.json', JSON.stringify(orderErr, null, 2));
            throw new Error("Order insert failed, check test_err.json");
        }

        const newEarnedPoints = Math.floor(total / 10);
        let pointsDiff = newEarnedPoints - pointsToRedeem;

        if (pointsToRedeem > 0) {
            await supabase.from('loyalty_transactions').insert({
                store_id: storeId, customer_id: amit.id, type: 'redeemed', points: pointsToRedeem, order_id: order.id, note: 'Redeemed'
            });
        }

        if (newEarnedPoints > 0) {
            await supabase.from('loyalty_transactions').insert({
                store_id: storeId, customer_id: amit.id, type: 'earned', points: newEarnedPoints, order_id: order.id, note: 'Earned'
            });
        }

        const { data: updatedCustomer } = await supabase.from('customers').select('loyalty_points').eq('id', amit.id).limit(1).single();
        await supabase.from('customers').update({ loyalty_points: Math.max(0, updatedCustomer.loyalty_points + pointsDiff) }).eq('id', amit.id);

        return { order, newEarnedPoints, total };
    }

    // Test 1: Order 500
    console.log("-> Placing Order 1 (₹500)");
    const res1 = await simulateOrder(500, 0);
    console.log(`Earned: ${res1.newEarnedPoints} points`);

    let { data: c1 } = await supabase.from('customers').select('loyalty_points').eq('id', amit.id).limit(1).single();
    console.log(`Amit's Total Points in CRM: ${c1.loyalty_points} (Expected: 50)`);

    // Test 2: Order 300, redeem 50 points
    console.log("-> Placing Order 2 (₹300, redeeming 50 points)");
    const res2 = await simulateOrder(300, 50);
    console.log(`Order Total after ₹5 discount: ₹${res2.total} (Expected: 295)`);
    console.log(`Earned on new total: ${res2.newEarnedPoints} points (Expected: 29)`);

    let { data: c2 } = await supabase.from('customers').select('loyalty_points').eq('id', amit.id).limit(1).single();
    console.log(`Amit's Final Points in CRM: ${c2.loyalty_points} (Expected: 29)`);

    console.log("-> Checking Transaction Logs");
    const { data: txs } = await supabase.from('loyalty_transactions').select('*').eq('customer_id', amit.id).order('created_at', { ascending: true });
    txs.forEach(t => console.log(`- ${t.type.toUpperCase()}: ${t.points} points. Order: ${t.order_id}`));
}

runTest();
