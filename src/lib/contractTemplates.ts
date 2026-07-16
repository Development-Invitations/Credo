export const DEFAULT_DEBT_CONTRACT_TEMPLATE = `РАСПИСКА О ДОЛГЕ №{{number}}

г. {{city}}                                                              {{date}}

Я, нижеподписавшийся(аяся) _________________________ (Ф.И.О. получателя, заполняется вручную),
подтверждаю, что получил(а) от {{companyName}} денежные средства в размере:

{{amount}} {{currency}}

Дата получения: {{takenDate}}
Срок возврата: {{dueDate}}
Комментарий: {{comment}}

Обязуюсь вернуть указанную сумму в полном объёме в установленный срок.

Займодавец: {{companyName}}
{{companyDetails}}

Получатель (подпись): _________________________
(заполняется получателем собственноручно)

Займодавец (подпись): _________________________`;

export const DEFAULT_CREDIT_CONTRACT_TEMPLATE = `ДОГОВОР ЗАЙМА №{{number}}

г. {{city}}                                                              {{date}}

{{companyName}}, именуемый(ая) в дальнейшем "Займодавец", с одной стороны, и
_________________________ (Ф.И.О. получателя, заполняется вручную), именуемый(ая) в
дальнейшем "Заёмщик", с другой стороны, заключили настоящий договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА
Займодавец передаёт Заёмщику заём в размере {{amount}} {{currency}}, а Заёмщик обязуется
вернуть указанную сумму в порядке и сроки, установленные настоящим договором.

2. УСЛОВИЯ ЗАЙМА
Номер кредита: {{number}}
Сумма займа: {{amount}} {{currency}}
Тип процента: {{interestType}}
Процентная ставка: {{rate}}
Срок займа: {{term}}
Дата выдачи: {{takenDate}}
Ежемесячный платёж: {{monthlyPayment}} {{currency}}

3. ДАННЫЕ ЗАЁМЩИКА
Паспортные данные: {{passport}}
Адрес: {{address}}
Телефон: {{phone}}

4. РЕКВИЗИТЫ СТОРОН

Займодавец: {{companyName}}
{{companyDetails}}
Подпись: _________________________

Заёмщик: _________________________
(Ф.И.О. и подпись заполняются получателем собственноручно)
Подпись: _________________________`;

export interface ContractVars {
  number: string | number;
  city?: string;
  date: string;
  amount: string;
  currency: string;
  takenDate: string;
  dueDate?: string;
  comment?: string;
  companyName: string;
  companyDetails?: string;
  interestType?: string;
  rate?: string;
  term?: string;
  monthlyPayment?: string;
  passport?: string;
  address?: string;
  phone?: string;
}

/** Подставляет переменные {{ключ}} в текст шаблона. Отсутствующие значения — пустая строка. */
export function fillTemplate(template: string, vars: ContractVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = (vars as any)[key];
    return v !== undefined && v !== null && v !== '' ? String(v) : '—';
  });
}
