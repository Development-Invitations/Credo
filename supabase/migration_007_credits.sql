-- Выполнить в SQL Editor. Модуль "Кредиты" — отдельно от простых долгов:
-- поддерживает процентную ставку, автоматически строит график платежей по датам,
-- и хранит журнал действий (создание, подтверждение каждого платежа).

create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  principal_amount numeric(12,2) not null,
  currency text default 'UZS',
  interest_type text not null default 'none' check (interest_type in ('none','flat','reducing')),
  interest_rate numeric(5,2) not null default 0, -- годовых, в процентах
  term_months int not null,
  start_date date not null,
  status text not null default 'active' check (status in ('active','closed')),
  comment text,
  created_at timestamptz default now()
);

-- Календарь платежей — по одной строке на каждый ожидаемый платёж
create table if not exists public.credit_payments (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid references public.credits(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  due_date date not null,
  expected_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  is_confirmed boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz default now()
);

-- Журнал всех действий по кредиту (создание, подтверждение платежа и т.д.)
create table if not exists public.credit_events (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid references public.credits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.credits enable row level security;
alter table public.credit_payments enable row level security;
alter table public.credit_events enable row level security;

drop policy if exists "credits_all_own" on public.credits;
drop policy if exists "credit_payments_all_own" on public.credit_payments;
drop policy if exists "credit_events_all_own" on public.credit_events;

create policy "credits_all_own" on public.credits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "credit_payments_all_own" on public.credit_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "credit_events_all_own" on public.credit_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
