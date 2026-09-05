create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0 check (saved_amount >= 0),
  target_date date,
  icon text not null default '✈️',
  priority integer not null default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_deposits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount numeric not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  source text not null default 'manual' check (source in ('manual', 'automatic')),
  month_key text,
  note text
);

create unique index if not exists savings_deposits_auto_month_idx on public.savings_deposits (user_id, goal_id, month_key) where source = 'automatic';
create index if not exists savings_goals_user_idx on public.savings_goals (user_id, priority);
create index if not exists savings_deposits_user_idx on public.savings_deposits (user_id, occurred_at desc);

alter table public.savings_goals enable row level security;
alter table public.savings_deposits enable row level security;

drop policy if exists "Users can manage their savings goals" on public.savings_goals;
create policy "Users can manage their savings goals" on public.savings_goals for all using ((auth.jwt() ->> 'sub') = user_id) with check ((auth.jwt() ->> 'sub') = user_id);
drop policy if exists "Users can manage their savings deposits" on public.savings_deposits;
create policy "Users can manage their savings deposits" on public.savings_deposits for all using ((auth.jwt() ->> 'sub') = user_id) with check ((auth.jwt() ->> 'sub') = user_id);
