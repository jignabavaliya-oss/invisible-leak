-- The Invisible Leak — Supabase schema
-- Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists "uuid-ossp";

create table if not exists workspaces (
  id           text primary key,
  name         text not null,
  description  text,
  budget_usd   numeric not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists line_items (
  id                  uuid primary key default uuid_generate_v4(),
  resource_id         text not null,
  kind                text not null,
  name                text not null,
  workspace_id        text references workspaces(id),
  inferred_workspace  text,
  cost_usd            numeric not null default 0,
  daily_cost_usd      numeric not null default 0,
  utilization         numeric not null default 0,
  attached            boolean not null default true,
  last_used_days      integer not null default 0,
  region              text,
  provider            text,
  created_at          timestamptz not null default now(),
  observed_at         timestamptz not null default now()
);

create index if not exists line_items_workspace_idx on line_items(workspace_id);
create index if not exists line_items_kind_idx      on line_items(kind);

create table if not exists ai_insights (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  text not null references workspaces(id),
  summary       text not null,
  forecast_eom  numeric,
  generated_at  timestamptz not null default now()
);

create index if not exists ai_insights_ws_idx on ai_insights(workspace_id, generated_at desc);

create table if not exists resolutions (
  id            uuid primary key default uuid_generate_v4(),
  resource_id   text not null,
  reason        text not null,
  command       text not null,
  status        text not null default 'queued', -- queued | applied | dismissed
  created_at    timestamptz not null default now()
);
