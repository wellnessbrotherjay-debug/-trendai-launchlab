-- Round economics + caps + helper
alter table if exists rounds
add column if not exists target_profit numeric,
add column if not exists moq integer,
add column if not exists unit_cost numeric,
add column if not exists unit_price numeric,
add column if not exists ad_cost_per_unit numeric,
add column if not exists operations_percentage numeric default 0.10,
add column if not exists company_share numeric default 0.15,
add column if not exists raise_cap numeric,
add column if not exists max_backers integer,
add column if not exists units_required integer,
add column if not exists funding_goal numeric;

-- backings additions
alter table if exists backings
add column if not exists units_purchased int;

-- cache + optional products
create table if not exists trend_sources (
id uuid primary key default gen_random_uuid(),
payload jsonb not null,
created_at timestamptz default now()
);
create table if not exists products (
id uuid primary key default gen_random_uuid(),
trend_name text,
category text,
asin text,
title text,
image_url text,
price numeric,
rating numeric,
reviews_count int,
amazon_url text,
created_at timestamptz default now()
);

-- ad refunds (optional)
create table if not exists ad_spend_refunds (
id uuid primary key default gen_random_uuid(),
round_id uuid references rounds(id) on delete cascade,
backing_id uuid references backings(id) on delete cascade,
refund_amount numeric not null default 0,
created_at timestamptz default now()
);

-- compute function (use after inserting round economics)
create or replace function compute_round_parameters(rid uuid)
returns void language plpgsql as $$
declare
r record;
fees_pct numeric := 0.15;
profit_per_unit numeric;
units_needed integer;
inventory_cost numeric;
marketing_budget numeric;
operations numeric;
goal numeric;
begin
select * into r from rounds where id = rid; if not found then return; end if;
if r.unit_price is null or r.unit_cost is null then return; end if;
profit_per_unit := coalesce(r.unit_price,0) - coalesce(r.unit_cost,0) - (coalesce(r.unit_price,0)*fees_pct) - coalesce(r.ad_cost_per_unit,0);
if profit_per_unit <= 0 then profit_per_unit := 1; end if;
units_needed := greatest(coalesce(r.moq,0), ceil(coalesce(r.target_profit,0)/profit_per_unit)::int);
inventory_cost := units_needed * coalesce(r.unit_cost,0);
marketing_budget := units_needed * coalesce(r.ad_cost_per_unit,0);
operations := coalesce(r.operations_percentage,0.10) * (inventory_cost + marketing_budget);
goal := inventory_cost + marketing_budget + operations;
update rounds set
units_required = units_needed,
funding_goal = goal,
raise_cap = goal * 1.10,
max_backers = ceil((goal * 1.10) / 200.0)
where id = rid;
end; $$;

