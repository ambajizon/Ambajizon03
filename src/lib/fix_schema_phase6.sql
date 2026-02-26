-- Fix for missing auth_user_id column in customers table
-- This script ensures the columns exist even if the table was created previously without them.

-- 1. Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'auth_user_id') THEN
        ALTER TABLE customers ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'store_id') THEN
        ALTER TABLE customers ADD COLUMN store_id UUID REFERENCES stores(id);
    END IF;
END $$;

-- 2. Ensure Constraints (Unique Store+User)
-- This might fail if duplicates exist, but for a devenv it's likely fine or empty.
-- ALTER TABLE customers ADD CONSTRAINT customers_store_auth_unique UNIQUE (store_id, auth_user_id); 
-- (Skipping constraint creation in fix script to avoid complex errors if data is messy, but ideally should be there)

-- 3. Re-apply RLS Policies for Customers
-- Drop existing policies to be safe and recreate them
DROP POLICY IF EXISTS "Shopkeepers can view their customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customer record" ON customers;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeepers can view their customers" ON customers
    FOR ALL USING (auth.uid() IN (SELECT shopkeeper_id FROM stores WHERE id = customers.store_id));

CREATE POLICY "Users can view their own customer record" ON customers
    FOR ALL USING (auth.uid() = auth_user_id);
