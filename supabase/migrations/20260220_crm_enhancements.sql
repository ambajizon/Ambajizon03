-- Add columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS source text 
  check (source in 
  ('tourist','referral','social','walk-in','other'))
  default 'tourist',
ADD COLUMN IF NOT EXISTS star_rating integer 
  default 0 check (star_rating between 0 and 5),
ADD COLUMN IF NOT EXISTS is_banned boolean 
  default false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS cod_blocked boolean 
  default false,
ADD COLUMN IF NOT EXISTS cod_block_reason text,
ADD COLUMN IF NOT EXISTS loyalty_points 
  integer default 0,
ADD COLUMN IF NOT EXISTS auto_tag text 
  default 'new';

-- Communication log table
CREATE TABLE IF NOT EXISTS customer_communications (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id),
  store_id uuid references stores(id),
  type text check (type in 
    ('whatsapp','call','note','email')),
  message text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Loyalty points log table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id),
  store_id uuid references stores(id),
  points integer not null,
  type text check (type in ('earned','redeemed')),
  order_id uuid, -- removed references orders(id) since it doesn't exist yet
  note text,
  created_at timestamp with time zone default now()
);

-- Customer segments table
CREATE TABLE IF NOT EXISTS customer_segments (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id),
  name text not null,
  filters jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- RLS for new tables
ALTER TABLE customer_communications 
  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shopkeeper manages communications"
ON customer_communications FOR ALL
USING (store_id IN (
  SELECT id FROM stores 
  WHERE shopkeeper_id = auth.uid()
));

ALTER TABLE loyalty_transactions 
  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shopkeeper manages loyalty"
ON loyalty_transactions FOR ALL
USING (store_id IN (
  SELECT id FROM stores 
  WHERE shopkeeper_id = auth.uid()
));

ALTER TABLE customer_segments 
  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shopkeeper manages segments"
ON customer_segments FOR ALL
USING (store_id IN (
  SELECT id FROM stores 
  WHERE shopkeeper_id = auth.uid()
));
