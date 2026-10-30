-- RX MOD: digital products and purchase access tables.
-- Applied to the connected RX-MOD Supabase project on 2026-10-30.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  thumbnail_url text,
  price_paise integer not null default 0 check (price_paise >= 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise >= price_paise),
  delivery_type text not null default 'download' check (delivery_type in ('download','manual')),
  file_path text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.product_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  amount_paise integer not null check (amount_paise > 0),
  payment_reference text,
  proof_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.product_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, product_id)
);
create index if not exists products_published_created_idx on public.products (is_published, created_at desc);
create index if not exists product_requests_user_created_idx on public.product_purchase_requests (user_id, created_at desc);
create index if not exists product_requests_status_created_idx on public.product_purchase_requests (status, created_at desc);
create index if not exists product_access_user_idx on public.product_access (user_id) where revoked_at is null;
alter table public.products enable row level security;
alter table public.product_purchase_requests enable row level security;
alter table public.product_access enable row level security;
drop policy if exists "published products readable" on public.products;
create policy "published products readable" on public.products for select to anon, authenticated using (is_published or (select public.is_rxmod_admin()));
drop policy if exists "admin manages products" on public.products;
create policy "admin manages products" on public.products for all to authenticated using ((select public.is_rxmod_admin())) with check ((select public.is_rxmod_admin()));
drop policy if exists "customer reads own product requests" on public.product_purchase_requests;
create policy "customer reads own product requests" on public.product_purchase_requests for select to authenticated using (user_id = (select auth.uid()) or (select public.is_rxmod_admin()));
drop policy if exists "customer submits own product requests" on public.product_purchase_requests;
create policy "customer submits own product requests" on public.product_purchase_requests for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending' and reviewed_by is null and reviewed_at is null);
drop policy if exists "admin reviews product requests" on public.product_purchase_requests;
create policy "admin reviews product requests" on public.product_purchase_requests for update to authenticated using ((select public.is_rxmod_admin())) with check ((select public.is_rxmod_admin()));
drop policy if exists "user reads own product access" on public.product_access;
create policy "user reads own product access" on public.product_access for select to authenticated using (user_id = (select auth.uid()) or (select public.is_rxmod_admin()));
drop policy if exists "admin manages product access" on public.product_access;
create policy "admin manages product access" on public.product_access for all to authenticated using ((select public.is_rxmod_admin())) with check ((select public.is_rxmod_admin()));
