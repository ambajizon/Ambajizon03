-- Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) not null,
  code text not null,
  type text check (type in ('flat','percent')),
  value numeric not null,
  min_order_amount numeric default 0,
  max_uses integer default 100,
  used_count integer default 0,
  expiry_date timestamp with time zone,
  is_enabled boolean default true,
  created_at timestamp with time zone default now()
);

-- Create Festival Offers Table
CREATE TABLE IF NOT EXISTS festival_offers (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) not null,
  name text not null,
  banner_url text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  product_ids jsonb default '[]'::jsonb,
  is_enabled boolean default true,
  created_at timestamp with time zone default now()
);

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeeper manages own coupons" 
ON coupons FOR ALL 
USING (store_id IN (
  SELECT id FROM stores 
  WHERE shopkeeper_id = auth.uid()
));

ALTER TABLE festival_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopkeeper manages own offers" 
ON festival_offers FOR ALL 
USING (store_id IN (
  SELECT id FROM stores 
  WHERE shopkeeper_id = auth.uid()
));
