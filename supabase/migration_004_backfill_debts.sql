-- Выполнить ОДИН РАЗ в SQL Editor. Переносит старые суммы (записанные раньше прямо
-- в debtors.amount) в новую таблицу debts как их первую запись долга.
-- Безопасно запускать повторно — если долг для клиента уже перенесён, вставки не будет.

insert into public.debts (debtor_id, user_id, amount, currency, due_date, status, comment, created_at)
select
  d.id,
  d.user_id,
  d.amount,
  coalesce(d.currency, 'UZS'),
  d.due_date,
  case when d.status = 'paid' then 'paid' else 'active' end,
  d.comment,
  d.created_at
from public.debtors d
where d.amount is not null
  and d.amount > 0
  and not exists (select 1 from public.debts x where x.debtor_id = d.id);
