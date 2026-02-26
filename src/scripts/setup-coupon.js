require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg'); // Try using pg if available

async function setupCoupon() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const databaseUrl = process.env.DATABASE_URL; // Check if this exists

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('Setting up Coupon AMBAJI10...');

    // 1. Get Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', 'rajesh-handicrafts')
        .single();

    if (storeError || !store) {
        console.log('Store not found:', storeError ? storeError.message : 'No data');
        return;
    }
    console.log('Store ID:', store.id);

    // 2. Try Insert Coupon
    const couponData = {
        store_id: store.id,
        code: 'AMBAJI10',
        discount_type: 'percent',
        value: 10,
        min_order_amount: 500,
        max_uses: 100,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
        .from('coupons')
        .insert(couponData);

    if (insertError) {
        console.log('Insert failed:', insertError.message);

        if (insertError.message.includes('relation "public.coupons" does not exist') || insertError.code === '42P01') {
            console.log('Table missing. Attempting to create table...');

            if (!databaseUrl) {
                console.log('No DATABASE_URL found. Cannot create table via SQL.');
                return;
            }

            try {
                const client = new Client({ connectionString: databaseUrl });
                await client.connect();

                await client.query(`
                CREATE TABLE IF NOT EXISTS public.coupons (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    store_id UUID REFERENCES public.stores(id) NOT NULL,
                    code TEXT NOT NULL,
                    discount_type TEXT DEFAULT 'percent',
                    value NUMERIC NOT NULL,
                    min_order_amount NUMERIC DEFAULT 0,
                    max_uses INTEGER,
                    expiry_date TIMESTAMPTZ,
                    used_count INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(store_id, code)
                );
                ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
                CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);
                CREATE POLICY "Shopkeeper manage coupons" ON public.coupons FOR ALL USING (
                    store_id IN (SELECT id FROM public.stores WHERE shopkeeper_id = auth.uid())
                );
              `);

                console.log('Table created successfully.');
                await client.end();

                // Retry Insert
                const { error: retryError } = await supabase.from('coupons').insert(couponData);
                if (retryError) console.log('Retry failed:', retryError.message);
                else console.log('Coupon created successfully after table creation.');

            } catch (dbError) {
                console.log('Direct DB connection failed:', dbError.message);
            }
        }
    } else {
        console.log('Coupon AMBAJI10 created/verified successfully.');
    }
}

setupCoupon();
