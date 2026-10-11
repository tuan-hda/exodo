-- Apply after the original notification_captures migration, before deploying
-- the type-aware receiver. Existing rows and old writers default to notification.
begin;

alter table public.notification_captures
  add column if not exists type text not null default 'notification'
  constraint notification_capture_type_check check (type in ('notification', 'mail'));

commit;

-- Verify existing rows are notification and only notification/mail are allowed:
-- select type, count(*) from public.notification_captures group by type;
-- Application rollback: redeploy the previous receiver and retain this column.
-- Its default keeps old inserts working; do not drop the column or stored data.
