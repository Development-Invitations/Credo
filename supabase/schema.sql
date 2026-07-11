-- Выполнить в Supabase → SQL Editor
-- Скрипт идемпотентный: можно запускать повторно без ошибок,
-- если что-то уже было создано раньше.

-- Профиль пользователя (доп. поля к auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  language text default 'ru' check (language in ('ru','uz','tj','kz','kg')),
  theme text default 'dark' check (theme in ('dark','light')),
  created_at timestamptz default now()
);

-- Должники
create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text,
  amount numeric(12,2) not null default 0,
  currency text default 'UZS',
  comment text,
  status text default 'active' check (status in ('active','paid','overdue')),
  due_date date,
  archived_at timestamptz,
  created_at timestamptz default now()
);

-- Долги (операции) — один клиент может иметь много записей долга по отдельности.
-- Поля amount/currency/status/due_date/comment в самой таблице debtors — устаревшие,
-- оставлены для совместимости, но больше не используются в интерфейсе.
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  currency text default 'UZS',
  due_date date,
  status text default 'active' check (status in ('active','paid')),
  comment text,
  created_at timestamptz default now()
);

-- История платежей — каждый платёж отдельной записью, для полного отчёта
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.debts(id) on delete cascade not null,
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Напоминания по должникам
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid references public.debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  remind_at timestamptz not null,
  message text,
  is_done boolean default false,
  created_at timestamptz default now()
);

-- Версии приложения — для проверки обновлений в модуле настроек
create table if not exists public.app_versions (
  id int primary key generated always as identity,
  version text not null,
  download_url text not null,
  release_notes text,
  released_at timestamptz default now()
);

-- Row Level Security: каждый видит только свои данные
alter table public.profiles enable row level security;
alter table public.debtors enable row level security;
alter table public.reminders enable row level security;
alter table public.app_versions enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "debtors_all_own" on public.debtors;
drop policy if exists "reminders_all_own" on public.reminders;
drop policy if exists "app_versions_select_all" on public.app_versions;
drop policy if exists "debts_all_own" on public.debts;
drop policy if exists "debt_payments_all_own" on public.debt_payments;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "debtors_all_own" on public.debtors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders_all_own" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Версии приложения читают все, пишет только сервисная роль (из админки/CI)
create policy "app_versions_select_all" on public.app_versions for select using (true);
create policy "debts_all_own" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debt_payments_all_own" on public.debt_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
