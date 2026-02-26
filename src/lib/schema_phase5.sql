-- Add branding fields to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6', -- Default blue-500
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'inter';

-- Ensure slug is indexed for performance
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- RLS Policies for Public Access (if not already covered)
-- We need to ensure public can read stores, categories, products

-- Stores: Public can view any store
DROP POLICY IF EXISTS "Public can view stores" ON stores;
CREATE POLICY "Public can view stores"
ON stores FOR SELECT
USING (true);

-- Categories: Public can view enabled categories
DROP POLICY IF EXISTS "Public can view enabled categories" ON categories;
CREATE POLICY "Public can view enabled categories"
ON categories FOR SELECT
USING (is_enabled = true);

-- Subcategories: Public can view enabled subcategories
DROP POLICY IF EXISTS "Public can view enabled subcategories" ON subcategories;
CREATE POLICY "Public can view enabled subcategories"
ON subcategories FOR SELECT
USING (is_enabled = true);

-- Products: Public can view enabled products
DROP POLICY IF EXISTS "Public can view enabled products" ON products;
CREATE POLICY "Public can view enabled products"
ON products FOR SELECT
USING (is_enabled = true);
