create extension if not exists pgcrypto;

create table if not exists public.gps_test_sessions (
  id uuid primary key default gen_random_uuid(),
  device_key text not null default 'default',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz null,
  first_fix_at timestamptz null,
  ttff_ms bigint null,
  last_valid_at timestamptz null,
  last_valid_lat double precision null,
  last_valid_lng double precision null,
  stub_lat double precision null,
  stub_lng double precision null,
  open_outage_start_at timestamptz null,
  open_outage_reason text null,
  outage_count integer not null default 0,
  outage_total_ms bigint not null default 0,
  outage_max_ms bigint not null default 0
);

create table if not exists public.gps_test_outages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.gps_test_sessions(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_ms bigint not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_gps_test_sessions_created_at
  on public.gps_test_sessions(created_at);

create index if not exists idx_gps_test_sessions_last_seen_at
  on public.gps_test_sessions(last_seen_at);

create index if not exists idx_gps_test_outages_session_id
  on public.gps_test_outages(session_id);

create index if not exists idx_gps_test_outages_start_at
  on public.gps_test_outages(start_at);

create or replace function public.gps_test_now()
returns timestamptz
language sql
stable
as $$
  select now();
$$;
