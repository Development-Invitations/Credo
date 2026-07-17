alter table public.debtors add column if not exists email text;

alter table public.credit_clients add column if not exists passport_data text;
alter table public.credit_clients add column if not exists address text;
alter table public.credit_clients add column if not exists email text;

create sequence if not exists public.credit_number_seq start with 90000001 increment by 1;

alter table public.credits add column if not exists credit_number bigint;
alter table public.credits alter column credit_number set default nextval('public.credit_number_seq');

update public.credits set credit_number = nextval('public.credit_number_seq') where credit_number is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'credits_credit_number_unique'
  ) then
    alter table public.credits add constraint credits_credit_number_unique unique (credit_number);
  end if;
end $$;
