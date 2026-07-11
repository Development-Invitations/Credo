-- Выполнить в SQL Editor. Хранит каждый платёж отдельно (а не только итоговую сумму),
-- чтобы в отчёте можно было показать "кто заплатил и когда" по каждому долгу.

create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.debts(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.debt_payments enable row level security;

drop policy if exists "debt_payments_all_own" on public.debt_payments;
create policy "debt_payments_all_own" on public.debt_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
