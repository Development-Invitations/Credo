export type InterestType = 'none' | 'flat' | 'reducing';

export interface ScheduleItem {
  dueDate: string; // YYYY-MM-DD
  amount: number;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Строит график платежей.
 * - none: сумма делится поровну на весь срок, без процента.
 * - flat: процент считается один раз от всей суммы за весь срок (rate% годовых * срок/12),
 *   итог (тело + проценты) делится поровну по месяцам.
 * - reducing: аннуитетный платёж (как в банке) — одинаковый платёж каждый месяц,
 *   проценты каждый раз считаются от остатка основного долга.
 */
export function buildSchedule(
  principal: number,
  interestType: InterestType,
  annualRatePercent: number,
  termMonths: number,
  startDate: string
): ScheduleItem[] {
  const items: ScheduleItem[] = [];

  if (termMonths <= 0) return items;

  if (interestType === 'none') {
    const monthly = Math.round((principal / termMonths) * 100) / 100;
    for (let i = 1; i <= termMonths; i++) {
      const amount = i === termMonths ? principal - monthly * (termMonths - 1) : monthly;
      items.push({ dueDate: addMonths(startDate, i), amount: Math.round(amount * 100) / 100 });
    }
    return items;
  }

  if (interestType === 'flat') {
    const totalInterest = principal * (annualRatePercent / 100) * (termMonths / 12);
    const total = principal + totalInterest;
    const monthly = Math.round((total / termMonths) * 100) / 100;
    for (let i = 1; i <= termMonths; i++) {
      const amount = i === termMonths ? total - monthly * (termMonths - 1) : monthly;
      items.push({ dueDate: addMonths(startDate, i), amount: Math.round(amount * 100) / 100 });
    }
    return items;
  }

  // reducing — аннуитет
  const monthlyRate = annualRatePercent / 100 / 12;
  let balance = principal;

  if (monthlyRate === 0) {
    return buildSchedule(principal, 'none', 0, termMonths, startDate);
  }

  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  for (let i = 1; i <= termMonths; i++) {
    const interestPart = balance * monthlyRate;
    let principalPart = payment - interestPart;
    if (i === termMonths) principalPart = balance; // последний платёж закрывает остаток без округлений
    const amount = i === termMonths ? principalPart + interestPart : payment;
    balance -= principalPart;
    items.push({ dueDate: addMonths(startDate, i), amount: Math.round(amount * 100) / 100 });
  }

  return items;
}
