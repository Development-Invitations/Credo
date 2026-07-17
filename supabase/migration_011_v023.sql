create sequence if not exists public.debt_number_seq start with 100001 increment by 1;

alter table public.debts add column if not exists debt_number bigint;
alter table public.debts alter column debt_number set default nextval('public.debt_number_seq');

update public.debts set debt_number = nextval('public.debt_number_seq') where debt_number is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'debts_debt_number_unique'
  ) then
    alter table public.debts add constraint debts_debt_number_unique unique (debt_number);
  end if;
end $$;