-- Recurring category budgets. Existing category budget data is intentionally
-- discarded so this migration can replace the earlier month-specific schema.
drop table if exists public.category_budgets;

-- Clerk's user ID is stored in user_id and must match the authenticated JWT
-- sub claim through the policies below.
create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);

create index if not exists category_budgets_user_idx
  on public.category_budgets (user_id);

drop index if exists public.category_budgets_user_month_idx;

alter table public.category_budgets enable row level security;

drop policy if exists "Users can read their category budgets" on public.category_budgets;
create policy "Users can read their category budgets"
  on public.category_budgets for select
  using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "Users can create their category budgets" on public.category_budgets;
create policy "Users can create their category budgets"
  on public.category_budgets for insert
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "Users can update their category budgets" on public.category_budgets;
create policy "Users can update their category budgets"
  on public.category_budgets for update
  using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "Users can delete their category budgets" on public.category_budgets;
create policy "Users can delete their category budgets"
  on public.category_budgets for delete
  using ((auth.jwt() ->> 'sub') = user_id);
