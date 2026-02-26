-- Phase 10: Analytics & Logistics

-- 1. Store Analytics (Daily Rollup)
CREATE TABLE IF NOT EXISTS store_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    date DATE NOT NULL,
    visitor_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, date) -- Ensure one record per day per store
);

-- 2. Shipping Settings (Shiprocket)
CREATE TABLE IF NOT EXISTS shipping_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL UNIQUE,
    shiprocket_email TEXT,
    shiprocket_password TEXT, -- Encrypted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wisthlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- RLS POLICIES

-- Analytics
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shopkeepers view own analytics" ON store_analytics
    FOR SELECT USING (
        store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid())
    );
-- Inserting/Updating analytics usually done by server actions with elevated privileges 
-- or we allow public to increment visitor (with constraints)?
-- Better to handle analytics updates via SECURITY DEFINER functions or server-side actions.
-- For now, we'll allow shopkeeper to read. Public interaction (visits) handled via server logic.

-- Shipping Settings
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shopkeepers manage shipping settings" ON shipping_settings
    FOR ALL USING (
        store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid())
    );

-- Wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers manage their wishlist" ON wishlists
    FOR ALL USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

-- Helper Function: Increment Visitor
CREATE OR REPLACE FUNCTION increment_store_visit(target_store_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO store_analytics (store_id, date, visitor_count)
    VALUES (target_store_id, CURRENT_DATE, 1)
    ON CONFLICT (store_id, date)
    DO UPDATE SET visitor_count = store_analytics.visitor_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- This function allows tracking without exposing table write access to public
