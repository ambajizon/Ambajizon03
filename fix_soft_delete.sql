ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted boolean default false;
