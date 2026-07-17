-- v0.2.3
-- Выполнить в Supabase → SQL Editor одним куском.

-- Собственный числовой номер у каждого долга/расписки (например 100001),
-- по аналогии с credit_number у кредитов. Раньше в печатной расписке
-- использовался обрезок технического UUID — теперь у долга появляется
-- нормальный сквозной номер документа, видимый и в карточке, и в списке.
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

-- Не забудь выполнить это после того, как соберёшь установщик и зальёшь его
-- в GitHub Releases под тегом v0.2.3 (ссылка ниже ссылается именно на этот тег,
-- а не на v0.2.2 — proверь при публикации).
insert into public.app_versions (version, download_url, release_notes)
values (
  '0.2.3',
  'https://github.com/Development-Invitations/Credo/releases/download/v0.2.3/Credo-Setup-0.2.3.exe',
  'Что нового в 0.2.3:

Исправления:
• Карточка кредитного клиента не открывалась, если у него ещё не было ни одного кредита — теперь открывается всегда, можно сразу оформить первый кредит.
• У долга (расписки) появился собственный номер документа — виден в списке, в карточке и в напечатанном документе.
• Исправлена маска телефона для Узбекистана и Кыргызстана — раньше код страны съедал часть введённого номера и номер выводился неправильно.
• Поле выбора страны в номере телефона расширено — код страны больше не обрезается.

Улучшения:
• Шрифт документов заменён на Times New Roman, заголовки разделов выделяются — договор выглядит как настоящий юридический бланк.
• В расписку и договор займа добавлены пункты: пеня за просрочку (0,1% в день, не более 10% от суммы), форс-мажор, согласие на обработку персональных данных.'
);

