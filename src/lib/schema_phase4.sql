-- Phase 4: Product Catalog Schema

-- 5. Categories
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) not null,
  name text not null,
  image_url text,
  is_enabled boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Subcategories
create table if not exists public.subcategories (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) not null,
  category_id uuid references public.categories(id) not null,
  name text not null,
  image_url text,
  is_enabled boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Products
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) not null,
  category_id uuid references public.categories(id) not null,
  subcategory_id uuid references public.subcategories(id),
  name text not null,
  description text,
  images jsonb default '[]'::jsonb, -- Array of image URLs
  price numeric not null,
  mrp numeric,
  stock integer default 0,
  tags text[],
  badge text default 'none', -- none, new, hot, sale, limited
  display_section text default 'none', -- none, home, flash_sale, sales_zone, exclusive
  is_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;

-- Policies for Categories
create policy "Shopkeepers can manage own categories" on public.categories
  for all using (
    exists (
      select 1 from public.stores
      where stores.id = categories.store_id
      and stores.shopkeeper_id = auth.uid()
    )
  );

create policy "Public can view enabled categories" on public.categories
  for select using (is_enabled = true);

-- Policies for Subcategories
create policy "Shopkeepers can manage own subcategories" on public.subcategories
  for all using (
    exists (
      select 1 from public.stores
      where stores.id = subcategories.store_id
      and stores.shopkeeper_id = auth.uid()
    )
  );

create policy "Public can view enabled subcategories" on public.subcategories
  for select using (is_enabled = true);

-- Policies for Products
create policy "Shopkeepers can manage own products" on public.products
  for all using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
      and stores.shopkeeper_id = auth.uid()
    )
  );

create policy "Public can view enabled products" on public.products
  for select using (is_enabled = true);
