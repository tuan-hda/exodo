-- Exodo transaction records. Clerk's user ID is stored in user_id and must
-- match the authenticated JWT sub claim through the policies below.
create table if not exists public.entries (
  id text primary key,
  user_id text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  occurred_at timestamp without time zone not null,
  title text not null default '',
  category text not null default 'Other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_occurred_at_idx
  on public.entries (user_id, occurred_at desc);

alter table public.entries enable row level security;

create policy "Users can read their entries"
  on public.entries for select
  using ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their entries"
  on public.entries for insert
  with check ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their entries"
  on public.entries for update
  using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their entries"
  on public.entries for delete
  using ((auth.jwt() ->> 'sub') = user_id);
