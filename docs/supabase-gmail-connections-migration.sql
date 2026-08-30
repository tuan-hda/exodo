-- Phase 1 Gmail OAuth connection. Refresh tokens are server-only and must
-- never be selected by browser clients.
create table if not exists public.gmail_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  gmail_email text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz,
  last_history_id text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gmail_connections enable row level security;
