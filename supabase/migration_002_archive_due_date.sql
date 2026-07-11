-- Выполнить ОДИН РАЗ в SQL Editor, если таблица debtors уже была создана раньше
-- (добавляет срок долга и возможность архивировать должника без удаления истории).

alter table public.debtors add column if not exists due_date date;
alter table public.debtors add column if not exists archived_at timestamptz;
