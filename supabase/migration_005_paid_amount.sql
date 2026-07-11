-- Добавляет учёт частичного погашения долга (сколько уже оплачено),
-- не удаляя и не искажая исходную сумму долга — вся история остаётся.
alter table public.debts add column if not exists paid_amount numeric(12,2) not null default 0;
