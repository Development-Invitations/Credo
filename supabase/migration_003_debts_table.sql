-- Выполнить в SQL Editor. Добавляет отдельную таблицу "долгов" (операций),
-- чтобы одному клиенту можно было записывать сколько угодно долгов по отдельности —
-- это и есть основа для отчётности (история операций, а не одно число на клиента).

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  currency text default 'UZS',
  due_date date,
  status text default 'active' check (status in ('active','paid')),
  comment text,
  created_at timestamptz default now()
);

alter table public.debts enable row level security;

drop policy if exists "debts_all_own" on public.debts;
create policy "debts_all_own" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
