-- TrendAI LaunchLab v1.8 – Extended Schema
-- Run in Supabase SQL editor. Safe to run multiple times with IF NOT EXISTS guards.

create extension if not exists pgcrypto;

-- Existing core tables are assumed (rounds, trends, products, reservations)
-- Extend rounds with new columns
alter table if exists public.rounds
  add column if not exists risk_tier text,
  add column if not exists ai_rationale text,
  add column if not exists lifecycle text; -- open | paused | funded | settled

-- User profiles
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  risk_pref text,                -- conservative | balanced | aggressive
  auto_compound boolean default false,
  notify_email text,
  created_at timestamptz default now()
);
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);

-- Autopilot actions log
create table if not exists public.autopilot_actions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  action text not null,           -- reallocate_budget | pause_ads | boost_creatives
  details jsonb,
  created_at timestamptz default now()
);

-- Marketplace brands (funded outputs)
create table if not exists public.marketplace_brands (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  name text,
  logo_url text,
  roi numeric,
  status text,                    -- in_flight | active | retired
  investors int default 0,
  created_at timestamptz default now()
);

-- Investor terms and agreements
create table if not exists public.investor_terms (
  id uuid primary key default gen_random_uuid(),
  version text,
  body text,
  created_at timestamptz default now()
);
create table if not exists public.user_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  terms_id uuid references public.investor_terms(id) on delete set null,
  accepted_at timestamptz default now()
);

-- Competitor listings per trend
create table if not exists public.competitor_listings (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references public.trends(id) on delete cascade,
  marketplace text,               -- amazon | tiktok | etsy | etc
  title text,
  url text,
  price numeric,
  rank text,
  data jsonb,
  created_at timestamptz default now()
);

-- Creative results (ads/creatives performance)
create table if not exists public.creative_results (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  creative_id text,
  channel text,                   -- tiktok | ig | yt | meta
  spend numeric,
  reach int,
  clicks int,
  conversions int,
  revenue numeric,
  created_at timestamptz default now()
);

-- Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text,                     -- system | user:<id> | function:<name>
  event text,
  ref jsonb,
  created_at timestamptz default now()
);

-- Alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  kind text,                      -- new_round | soft_cap | milestone | risk_alert | autopilot_change | payout_executed | auto_compound_investment
  payload jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- Round rules
create table if not exists public.round_rules (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  key text,
  value jsonb,
  created_at timestamptz default now()
);

-- Trend forecasts & research
create table if not exists public.trend_forecasts (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references public.trends(id) on delete cascade,
  forecast jsonb,
  ai_summary text,
  created_at timestamptz default now()
);
create table if not exists public.trend_research (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references public.trends(id) on delete cascade,
  sources jsonb,
  ai_notes text,
  created_at timestamptz default now()
);

-- Metrics and milestones
create table if not exists public.round_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  day date,
  spend numeric,
  revenue numeric,
  orders int,
  reach int,
  conversions int,
  created_at timestamptz default now(),
  unique (round_id, day)
);
create table if not exists public.round_milestones (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  title text,
  status text,                    -- planned | in_progress | done
  due_at timestamptz,
  created_at timestamptz default now()
);

-- Payouts
create table if not exists public.round_payouts (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references public.rounds(id) on delete cascade,
  amount numeric,
  executed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Publications for realtime
do $$ begin
  alter publication supabase_realtime add table public.alerts;
exception when duplicate_object then null; end $$;

