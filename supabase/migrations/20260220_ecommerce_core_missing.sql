-- E-Commerce Core Tables Recovery Script
-- It appears the checkout tables are missing from the Supabase instance.
-- Run this in the Supabase SQL Editor if these tables do not exist.

CREATE TABLE IF NOT EXISTS carts (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) not null,
    customer_id uuid references public.customers(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS cart_items (
    id uuid default gen_random_uuid() primary key,
    cart_id uuid references public.carts(id) not null,
    product_id uuid references public.products(id) not null,
    quantity integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) not null,
    store_id uuid references public.stores(id) not null,
    full_name text not null,
    phone text not null,
    address_line1 text not null,
    city text not null,
    state text not null,
    pincode text not null,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) not null,
    customer_id uuid references public.customers(id) not null,
    address_id uuid references public.customer_addresses(id),
    status text not null default 'pending',
    payment_mode text,
    payment_method text,
    payment_status text not null default 'pending',
    subtotal numeric,
    total_amount numeric not null,
    delivery_address jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) not null,
    product_id uuid references public.products(id) not null,
    quantity integer not null,
    price_at_purchase numeric,
    price_at_time numeric,
    product_snapshot jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS order_tracking (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) not null,
    status text not null,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: Ensure you run `NOTIFY pgrst, 'reload schema';` after executing this to refresh the API.
