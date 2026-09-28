alter table public.google_connections
  add column if not exists last_imported_at timestamptz;
