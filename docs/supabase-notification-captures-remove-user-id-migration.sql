-- For an existing notification_captures table that still has user_id.
-- Apply before deploying the single-user receiver.
-- Capture payloads, types, received timestamps, and access grants stay unchanged.
-- Duplicate device/event pairs cause the transaction to fail without deleting rows.
begin;

alter table public.notification_captures
  drop constraint if exists notification_captures_pkey,
  drop column if exists user_id,
  add constraint notification_captures_pkey primary key (device_id, event_id);

commit;

-- Removing user_id discards its values. Export them first if they are needed
-- for a future rollback; they cannot be reconstructed from this migration.
