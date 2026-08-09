-- Upgrade an entries table created from the earlier date/time schema.
alter table public.entries
  add column if not exists occurred_at timestamp without time zone;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'entries'
      and column_name = 'date'
  ) then
    execute $migration$
      update public.entries
      set occurred_at = (date::text || ' ' || coalesce(time::text, '00:00:00'))::timestamp
      where occurred_at is null
    $migration$;
  end if;
end $$;

alter table public.entries
  alter column occurred_at set not null;

alter table public.entries
  drop column if exists date,
  drop column if exists time;

drop index if exists public.entries_user_date_idx;
create index if not exists entries_user_occurred_at_idx
  on public.entries (user_id, occurred_at desc);
