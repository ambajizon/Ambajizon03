-- Phase 8: Marketing & CRM Schema

-- 1. Festival Offers
CREATE TABLE IF NOT EXISTS festival_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    name TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    product_ids JSONB DEFAULT '[]'::jsonb, -- Array of product IDs included in the offer
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Marketing Reminders
CREATE TABLE IF NOT EXISTS marketing_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    trigger_after_days INTEGER NOT NULL DEFAULT 30, -- e.g., 30 days after last order
    message_template TEXT NOT NULL, -- "Hi {customer_name}, we miss you at {store_name}..."
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id) -- One config per store for now
);

-- 3. Update Customers Table for CRM
-- Add tag and notes (notes can be a separate table or jsonb, separate table is cleaner for history)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'New' CHECK (tag IN ('New', 'Regular', 'VIP'));

-- 4. Customer Notes (Internal CRM notes)
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) NOT NULL,
    note TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS POLICIES

-- Festival Offers
ALTER TABLE festival_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage offers" ON festival_offers
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = festival_offers.store_id));

CREATE POLICY "Public read active offers" ON festival_offers
    FOR SELECT USING (is_enabled = true AND now() BETWEEN start_date AND end_date);


-- Marketing Reminders
ALTER TABLE marketing_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage reminders" ON marketing_reminders
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = marketing_reminders.store_id));


-- Customer Notes
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers manage customer notes" ON customer_notes
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = customer_notes.store_id));
