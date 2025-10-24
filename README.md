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
  created_at timestamp with time zone not null default now()
);

insert into public.rounds (name, soft_cap, raised, investors, roi, status)
values ('Ramen Cat Tee', 10000, 4200, 21, 2.3, 'Active');
```

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

## Security Notes
- The anon key is public by design; rotate keys periodically.
- Keep write operations server‑side with service role keys if/when collecting payments or sensitive updates.
