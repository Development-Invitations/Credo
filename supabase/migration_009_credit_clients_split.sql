-- Выполнить в SQL Editor одним куском.
-- Создаёт ПОЛНОСТЬЮ независимую таблицу клиентов для кредитов — отдельную от debtors
-- (клиентов долгов). Существующие кредиты не теряются: для каждого уникального
-- debtor_id, на который уже ссылались кредиты, создаётся клиент-кредитор с тем же id
-- (поэтому внешние ключи в credits/credit_payments продолжают работать без изменений),
-- но дальше эти две карточки живут независимо друг от друга.

create table if not exists public.credit_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text,
  comment text,
  archived_at timestamptz,
  is_blacklisted boolean not null default false,
  blacklist_reason text,
  blacklisted_at timestamptz,
  created_at timestamptz default now()
);

alter table public.credit_clients enable row level security;
drop policy if exists "credit_clients_all_own" on public.credit_clients;
create policy "credit_clients_all_own" on public.credit_clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Переносим данные для уже существующих кредитов (если такие есть), сохраняя тот же id,
-- чтобы внешние ключи credits.debtor_id / credit_payments.debtor_id остались валидными.
insert into public.credit_clients (id, user_id, full_name, phone, comment, created_at)
select distinct d.id, d.user_id, d.full_name, d.phone, d.comment, d.created_at
from public.debtors d
where d.id in (select distinct debtor_id from public.credits)
on conflict (id) do nothing;

-- Переключаем внешние ключи credits/credit_payments на новую таблицу credit_clients
alter table public.credits drop constraint if exists credits_debtor_id_fkey;
alter table public.credits add constraint credits_debtor_id_fkey
  foreign key (debtor_id) references public.credit_clients(id) on delete cascade;

alter table public.credit_payments drop constraint if exists credit_payments_debtor_id_fkey;
alter table public.credit_payments add constraint credit_payments_debtor_id_fkey
  foreign key (debtor_id) references public.credit_clients(id) on delete cascade;

-- Чёрный список для клиентов долгов (debtors) — те же поля, что и у credit_clients выше
alter table public.debtors add column if not exists is_blacklisted boolean not null default false;
alter table public.debtors add column if not exists blacklist_reason text;
alter table public.debtors add column if not exists blacklisted_at timestamptz;
