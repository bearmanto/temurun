-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ========== PRODUCTS ==========
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price integer not null check (price >= 0),
  description text not null default '',
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== PRODUCT IMAGES ==========
create table if not exists public.product_images (
  id bigserial primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_sort_idx
  on public.product_images (product_id, sort);

-- ========== RLS (read-only public) ==========
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Allow anyone (anon) to read products & images
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Allow read of products') then
    create policy "Allow read of products" on public.products for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'product_images' and policyname = 'Allow read of product_images') then
    create policy "Allow read of product_images" on public.product_images for select using (true);
  end if;
end $$;

-- ========== SEED (safe to re-run) ==========
insert into public.products (slug, name, price, description, is_new)
values
  ('signature-sourdough', 'Signature Sourdough', 45000, 'Classic sourdough with deep, tangy profile and caramelized crust. 24h fermentation.', false),
  ('country-loaf', 'Country Loaf', 50000, 'Rustic daily loaf with open crumb and thin crackly crust.', false),
  ('garlic-bread', 'Garlic Bread', 35000, 'Fragrant garlic butter baked into a soft pull-apart loaf.', true),
  ('choco-babka', 'Chocolate Babka', 65000, 'Rich chocolate swirls in tender dough with syrup glaze.', true),
  ('cinnamon-roll', 'Cinnamon Roll (2 pcs)', 30000, 'Soft rolls with cinnamon-sugar spirals and a light vanilla glaze.', false),
  ('croissant', 'Butter Croissant (2 pcs)', 38000, 'Layered, flaky croissants made with cultured butter.', false),
  ('brownies', 'Fudgy Brownies', 55000, 'Dense, fudgy brownies with crackly tops and deep cocoa flavor.', false),
  ('banana-bread', 'Banana Bread', 42000, 'Moist banana loaf with a hint of cinnamon.', false)
on conflict (slug) do nothing;

-- Attach one placeholder image each (swap to Supabase Storage later)
with p as (
  select id, slug from public.products
)
insert into public.product_images (product_id, url, sort)
select p.id,
  case p.slug
    when 'signature-sourdough' then 'https://picsum.photos/id/1080/800/800'
    when 'country-loaf' then 'https://picsum.photos/id/1060/800/800'
    when 'garlic-bread' then 'https://picsum.photos/id/1084/800/800'
    when 'choco-babka' then 'https://picsum.photos/id/1081/800/800'
    when 'cinnamon-roll' then 'https://picsum.photos/id/1082/800/800'
    when 'croissant' then 'https://picsum.photos/id/1083/800/800'
    when 'brownies' then 'https://picsum.photos/id/1059/800/800'
    when 'banana-bread' then 'https://picsum.photos/id/1050/800/800'
    else 'https://picsum.photos/seed/temurun/800/800'
  end as url,
  0 as sort
from p
on conflict do nothing;

-- ===========================================
-- ORDERS (write from client via anon, server action validates)
-- ===========================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  subtotal integer not null default 0,
  total integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  slug text not null,
  name text not null,
  price integer not null,
  qty integer not null check (qty > 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
begin
  -- SELECT/INSERT only; block update/delete for anon
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_select') then
    create policy "orders_select" on public.orders for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert') then
    create policy "orders_insert" on public.orders for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='order_items' and policyname='order_items_select') then
    create policy "order_items_select" on public.order_items for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='order_items' and policyname='order_items_insert') then
    create policy "order_items_insert" on public.order_items for insert with check (true);
  end if;
end $$;

-- Constrain orders.status to allowed values (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('pending','confirmed','delivered','cancelled'));
  end if;
end $$;
