-- Phase 9: Admin Panel Schema

-- 1. Admin Payment Settings (for collecting subscriptions)
CREATE TABLE IF NOT EXISTS admin_payment_settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Singleton
    gateway_type TEXT DEFAULT 'razorpay',
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT, -- Encrypted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (id = 1)
);

-- 2. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopkeeper_id UUID REFERENCES auth.users(id) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('onboarding', 'yearly')),
    amount NUMERIC NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin Notes (on Shopkeepers)
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopkeeper_id UUID REFERENCES auth.users(id) NOT NULL,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trial Extensions Audit
CREATE TABLE IF NOT EXISTS trial_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopkeeper_id UUID REFERENCES auth.users(id) NOT NULL,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    extended_to TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Admin Payment Settings
ALTER TABLE admin_payment_settings ENABLE ROW LEVEL SECURITY;
-- Only admin can read/write.
-- BUT, server-side actions (using service role or logic) need access.
-- We'll allow 'admin' role to manage.
CREATE POLICY "Admins manage payment settings" ON admin_payment_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscriptions" ON subscriptions
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Shopkeepers read own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = shopkeeper_id);


-- Admin Notes
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notes" ON admin_notes
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

-- Trial Extensions
ALTER TABLE trial_extensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage trial extensions" ON trial_extensions
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );
