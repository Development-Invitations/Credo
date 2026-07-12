-- Логи ошибок приложения — чтобы можно было увидеть в Supabase, что реально ломается
-- у пользователей, не выпрашивая скриншоты консоли.

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  context text,
  message text,
  stack text,
  created_at timestamptz default now()
);

-- Аккаунтовый номер кредита — читаемый идентификатор, показывается пользователю
alter table public.credits add column if not exists account_number text;

alter table public.error_logs enable row level security;
drop policy if exists "error_logs_insert_own" on public.error_logs;
drop policy if exists "error_logs_select_own" on public.error_logs;
create policy "error_logs_insert_own" on public.error_logs for insert with check (auth.uid() = user_id or user_id is null);
create policy "error_logs_select_own" on public.error_logs for select using (auth.uid() = user_id);
