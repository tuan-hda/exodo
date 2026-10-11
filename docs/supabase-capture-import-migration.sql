-- Run once in Supabase SQL editor before using v2's Add selected action.
-- Imports and cutoff deletion commit together. Deleted raw captures cannot
-- be recovered by rollback; export them first if you need a backup.
begin;

create or replace function public.capture_source_time(p_payload jsonb, p_received_at timestamptz)
returns timestamptz language plpgsql stable set search_path = '' as $$
begin
  if coalesce(p_payload ->> 'captured_at', '') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$' then
    return p_received_at;
  end if;
  return coalesce((p_payload ->> 'captured_at')::timestamptz, p_received_at);
exception when invalid_datetime_format or datetime_field_overflow then
  return p_received_at;
end;
$$;

create or replace function public.import_captures(p_user_id text, p_items jsonb)
returns jsonb language plpgsql set search_path = '' as $$
declare
  item jsonb;
  capture public.notification_captures%rowtype;
  cutoff timestamptz;
  source_time timestamptz;
  deleted_count integer;
begin
  if p_user_id is null or p_user_id = '' or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 200 then
    raise exception 'Invalid capture import';
  end if;

  -- Serialize imports with capture delivery until save and deletion commit.
  lock table public.notification_captures in share row exclusive mode;
  for item in select value from jsonb_array_elements(p_items) loop
    select * into capture from public.notification_captures
      where device_id = item ->> 'device_id' and event_id = item ->> 'event_id';
    if not found or capture.payload <> item -> 'payload' then
      raise exception 'Selected capture changed or no longer exists';
    end if;
    source_time := public.capture_source_time(capture.payload, capture.received_at);
    cutoff := greatest(cutoff, source_time);

    insert into public.entries (id, user_id, type, amount, occurred_at, title, category)
    values (
      item -> 'entry' ->> 'id', p_user_id, item -> 'entry' ->> 'type',
      (item -> 'entry' ->> 'amount')::numeric,
      (item -> 'entry' ->> 'occurredAt')::timestamp,
      item -> 'entry' ->> 'title', item -> 'entry' ->> 'category'
    ) on conflict (id) do nothing;
  end loop;

  delete from public.notification_captures
    where public.capture_source_time(payload, received_at) <= cutoff;
  get diagnostics deleted_count = row_count;
  return jsonb_build_object('imported', jsonb_array_length(p_items), 'deleted', deleted_count, 'cutoff', cutoff);
end;
$$;

revoke all on function public.capture_source_time(jsonb, timestamptz) from public, anon, authenticated;
revoke all on function public.import_captures(text, jsonb) from public, anon, authenticated;
grant execute on function public.capture_source_time(jsonb, timestamptz) to service_role;
grant execute on function public.import_captures(text, jsonb) to service_role;
grant delete on public.notification_captures to service_role;
grant select, insert on public.entries to service_role;
commit;

-- Roll back code access only (does not undo imported entries/deleted captures):
-- drop function public.import_captures(text, jsonb);
-- drop function public.capture_source_time(jsonb, timestamptz);
-- revoke delete on public.notification_captures from service_role;
