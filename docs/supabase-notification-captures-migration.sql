-- Raw notification captures, separate from parsed financial entries.
-- Apply in the existing Exodo Supabase project's SQL editor.
begin;

create table if not exists public.notification_captures (
  user_id text not null,
  device_id text not null,
  event_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  received_at timestamptz not null default now(),
  primary key (user_id, device_id, event_id),
  constraint notification_capture_identity_matches check (
    payload ?& array['device_id', 'event_id']
    and payload ->> 'device_id' = device_id
    and payload ->> 'event_id' = event_id
  )
);

alter table public.notification_captures enable row level security;
revoke all on table public.notification_captures from public, anon, authenticated, service_role;
grant select, insert on table public.notification_captures to service_role;

commit;

-- Rollback before accepting real captures only:
-- drop table public.notification_captures;
-- After accepting captures, preserve/export their data before any rollback.
