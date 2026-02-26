DROP POLICY IF EXISTS "Shopkeeper manages own products" ON products;
CREATE POLICY "Shopkeeper manages own products" ON products FOR ALL USING (store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid()));

DROP POLICY IF EXISTS "Shopkeeper manages own categories" ON categories;
CREATE POLICY "Shopkeeper manages own categories" ON categories FOR ALL USING (store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid()));

DROP POLICY IF EXISTS "Shopkeeper manages own subcategories" ON subcategories;
CREATE POLICY "Shopkeeper manages own subcategories" ON subcategories FOR ALL USING (store_id IN (SELECT id FROM stores WHERE shopkeeper_id = auth.uid()));
