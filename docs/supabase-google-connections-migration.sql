-- Google OAuth connection. Refresh tokens are server-only and must
-- never be selected by browser clients. Application writes encrypt them with
-- AES-256-GCM using GOOGLE_TOKEN_ENCRYPTION_KEY stored outside the database.
begin;

create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  google_email text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz,
  last_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_connections enable row level security;

-- Access is restricted to the application's server client.
revoke all on table public.google_connections from public, anon, authenticated;
grant select, insert, update, delete on table public.google_connections to service_role;

commit;
