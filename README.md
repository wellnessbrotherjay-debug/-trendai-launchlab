# TrendAI LaunchLab

Premium, cinematic Next.js 14 + Tailwind landing page wired to Supabase for real‑time investment rounds.

## Quick Start

1. Install and run
   - `npm install`
   - `npm run dev`
   - Open `http://localhost:3000`

2. Environment (.env.local)
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...` (server-only, for API routes)

3. Supabase SQL (create table + seed)
```sql
-- Enable UUID generation if needed
create extension if not exists pgcrypto;

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  soft_cap numeric not null,
  raised numeric not null,
  investors integer not null default 0,
  roi numeric not null default 0,
  status text not null default 'Active',
  created_at timestamp with time zone not null default now(),
  -- mock flow fields
  pledged bigint default 0,
  investor_count int default 0,
  payments_enabled boolean default false,
  countdown_end timestamptz
);

insert into public.rounds (name, soft_cap, raised, investors, roi, status)
values ('Ramen Cat Tee', 10000, 4200, 21, 2.3, 'Active');
```

### Trends table (for carousel)
```sql
create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  name text,
  ai_confidence numeric,
  velocity_score numeric,
  projected_roi numeric,
  source text,
  description text,
  image_url text,
  created_at timestamptz default now()
);
```

### Products table (link a real product to each trend)
```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references public.trends(id) on delete cascade,
  name text,
  image_url text,
  supplier_url text,
  sku text,
  supplier_cost numeric,
  shipping_cost numeric,
  sale_price numeric,
  fees_pct numeric,  -- platform/payment fees percent (e.g., 6.5)
  moq int,
  notes text,
  created_at timestamptz default now()
);

-- Example seed rows (replace with real items once researched)
insert into public.trends (id, name, ai_confidence, projected_roi, description, image_url)
values
  ('00000000-0000-0000-0000-0000000000e1', 'EcoGlow Candle', 92, 3.2, 'Eco decor trend', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'),
  ('00000000-0000-0000-0000-0000000000e2', 'ZenCat Hoodie', 90, 3.1, 'Pet hoodie boom', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'),
  ('00000000-0000-0000-0000-0000000000e3', 'SmartGrip Bottle', 87, 2.9, 'Smart bottle craze', 'https://images.unsplash.com/photo-1514994939321-levy?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');

insert into public.products (trend_id, name, image_url, supplier_url, sku, supplier_cost, shipping_cost, sale_price, fees_pct, moq, notes)
values
  ('00000000-0000-0000-0000-0000000000e1', 'EcoGlow Soy Candle', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', 'https://example-supplier.com/candle', 'ECO-CND-001', 4.20, 1.20, 22.00, 6.5, 200, 'Recycled glass jar, vanilla + sandalwood'),
  ('00000000-0000-0000-0000-0000000000e2', 'ZenCat Hoodie', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop', 'https://example-supplier.com/zencat', 'CAT-HDY-200', 9.50, 3.50, 39.00, 6.5, 150, 'S-XXL, soft fleece, ear hoodie'),
  ('00000000-0000-0000-0000-0000000000e3', 'SmartGrip Bottle', 'https://images.unsplash.com/photo-1514994939321-levy?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://example-supplier.com/bottle', 'SGB-500', 6.80, 2.40, 34.00, 6.5, 300, 'Magnetic cap, flow sensor');
```

After inserting, the homepage carousel will show images, and clicking a card opens a details page with the product image and pricing breakdown (supplier cost, shipping, fees, profit, margin%).

4. Realtime
   - Supabase → Database → Replication → Realtime → enable for `public.rounds`.

5. Row Level Security (RLS)
   - If RLS is ON for `public.rounds`, allow anonymous reads only:
```sql
alter table public.rounds enable row level security;
create policy allow_anon_read on public.rounds for select using (true);
```
   - Do NOT add insert/update policies for `anon` unless you intend to allow public writes.

## Local Development
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Start: `npm start`

## Deploy (Vercel)
1. Push to GitHub
2. Import repo into Vercel
3. Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy, then add a custom domain in Vercel → Domains

## Tech
- Next.js 14 (App Router)
- Tailwind CSS 3
- Supabase JS client with realtime channel subscription

## Files
- `app/page.tsx` – Cinematic homepage + Supabase integration
- `app/layout.tsx` – Root layout + metadata
- `app/globals.css` – Tailwind base/utilities
- `tailwind.config.ts`, `postcss.config.js` – Tailwind setup
 - `app/api/reserve/route.ts` – reserve (atomic via RPC)
 - `app/api/cancel-reservation/route.ts` – cancel (atomic via RPC)
 - `app/api/admin/settle-mock/route.ts` – settle mock funded (via RPC)
 - `components/ReserveModal.tsx` – modal to reserve without payment

## DB functions (RPC) for atomic updates
Create these Postgres functions for transactional updates:

```sql
-- Reservations table for mock flow (if not created yet)
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  user_id uuid null references auth.users(id),
  amount int not null check (amount >= 0),
  created_at timestamptz default now(),
  status text default 'reserved'
);

-- 1) Reserve: create reservation + increment counters atomically
create or replace function reserve_transaction(
  p_round_id uuid,
  p_user_id uuid,
  p_amount int
) returns json as $$
declare r record;
begin
  insert into public.reservations (round_id, user_id, amount)
  values (p_round_id, p_user_id, p_amount);
  update public.rounds
  set pledged = coalesce(pledged,0) + p_amount,
      investor_count = coalesce(investor_count,0) + 1
  where id = p_round_id
  returning * into r;
  return to_json(r);
end;
$$ language plpgsql security definer;

-- 2) Cancel reservation and decrement counters
create or replace function cancel_reservation_transaction(
  p_reservation_id uuid
) returns json as $$
declare r record; v_round uuid; v_amount int;
begin
  select round_id, amount into v_round, v_amount from public.reservations where id = p_reservation_id;
  update public.reservations set status = 'cancelled' where id = p_reservation_id;
  update public.rounds
  set pledged = greatest(0, coalesce(pledged,0) - coalesce(v_amount,0)),
      investor_count = greatest(0, coalesce(investor_count,0) - 1)
  where id = v_round
  returning * into r;
  return to_json(r);
end;
$$ language plpgsql security definer;

-- 3) Settle mock if pledged >= soft_cap
create or replace function settle_mock_round(p_round_id uuid) returns json as $$
declare r record;
begin
  update public.rounds
  set status = case when pledged >= soft_cap then 'mock_funded' else status end
  where id = p_round_id
  returning * into r;
  return to_json(r);
end;
$$ language plpgsql security definer;
```

## Security Notes
- The anon key is public by design; rotate keys periodically.
- Keep write operations server‑side with service role keys if/when collecting payments or sensitive updates.
