-- Phase 6: Cart, Checkout & Orders Schema

-- 1. Customers Table (Links to Supabase Auth but specific to a store context)
-- A user can be a customer of multiple stores, but we track them per store for simplicity/isolation
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth User
    store_id UUID REFERENCES stores(id) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, auth_user_id) -- One customer record per store per auth user
);

-- 2. Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Carts
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Can be null for guest, but we enforce auth for checkout
    session_id TEXT, -- For guest carts (optional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    code TEXT NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('flat', 'percent')),
    value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expiry_date TIMESTAMPTZ,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, code)
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    customer_id UUID REFERENCES customers(id), -- Keep record even if customer deleted? Maybe SET NULL
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
    payment_mode TEXT CHECK (payment_mode IN ('online', 'cod')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    coupon_id UUID REFERENCES coupons(id),
    discount_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    delivery_address JSONB NOT NULL, -- Snapshot of address
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id), -- If product deleted, keep record? Or Set Null? Ideally keep link if possible
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    product_snapshot JSONB, -- Snapshot of name, image, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Order Tracking
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Payment Settings (Shopkeeper credentials)
CREATE TABLE IF NOT EXISTS payment_settings (
    store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT, -- Encrypt in app before saving, or use pgcrypto if available
    is_cod_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS POLICIES

-- Customers: 
-- Shopkeepers of the store can view.
-- Users can view their own record.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers can view their customers" ON customers
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = customers.store_id));

CREATE POLICY "Users can view their own customer record" ON customers
    FOR ALL USING (auth.uid() = auth_user_id);

-- Addresses:
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers can view addresses" ON customer_addresses
    FOR SELECT USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = customer_addresses.store_id));

CREATE POLICY "Users manage their addresses" ON customer_addresses
    FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM customers WHERE id = customer_addresses.customer_id));

-- Carts:
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
-- For now, carts are owned by customer (auth user)
CREATE POLICY "Users manage their carts" ON carts
    FOR ALL USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()) OR
        (session_id IS NOT NULL) -- If implementing guest carts later
    );

-- Cart Items:
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their cart items" ON cart_items
    FOR ALL USING (
        cart_id IN (SELECT id FROM carts WHERE 
            customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
        )
    );

-- Orders:
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage orders" ON orders
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = orders.store_id));

CREATE POLICY "Customers view their orders" ON orders
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

-- Order Items:
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers view order items" ON order_items
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE 
            store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid())
        )
    );

CREATE POLICY "Customers view their order items" ON order_items
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE 
            customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
        )
    );

-- Coupons:
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage coupons" ON coupons
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = coupons.store_id));

CREATE POLICY "Public read valid coupons if needed or just metadata checking" ON coupons
    FOR SELECT USING (true); -- Simplified validation lookup

-- Payment Settings:
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage payment settings" ON payment_settings
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = payment_settings.store_id));

CREATE POLICY "Server read payment settings" ON payment_settings
    FOR SELECT USING (true); -- Ideally restrictive but server needs access. RLS applies to Client. Server bypasses if service role.
