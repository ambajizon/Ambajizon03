-- Run this in your Supabase SQL Editor
-- Shipping columns (safe if already run before)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_partner text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS tracking_url text,
ADD COLUMN IF NOT EXISTS estimated_delivery date,
ADD COLUMN IF NOT EXISTS shipping_note text;

-- Cancellation columns (new)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_by text default 'shopkeeper';
