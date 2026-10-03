create table if not exists public.savings_automation_state (
  user_id text primary key,
  last_calculated_month text not null check (last_calculated_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

alter table public.savings_automation_state enable row level security;

drop policy if exists "Users can manage their savings automation state" on public.savings_automation_state;
create policy "Users can manage their savings automation state"
  on public.savings_automation_state for all
  using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

-- Treat months with existing automatic contributions as already calculated.
insert into public.savings_automation_state (user_id, last_calculated_month)
select user_id, max(month_key)
from public.savings_deposits
where source = 'automatic' and month_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
group by user_id
on conflict (user_id) do nothing;
