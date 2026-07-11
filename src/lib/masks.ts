/** Форматирует число с разделителями разрядов для отображения при вводе суммы: 12345 -> "12 345" */
export function formatAmountDisplay(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
  const parts = cleaned.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.length > 1 ? `${intPart}.${parts[1].slice(0, 2)}` : intPart;
}

/** Убирает форматирование, оставляя чистое число для сохранения в БД */
export function parseAmount(display: string): number {
  const cleaned = display.replace(/\s/g, '').replace(',', '.');
  return Number(cleaned) || 0;
}

/**
 * Простая универсальная маска телефона под формат стран СНГ: "+998 90 123 45 67".
 * Не привязана к одной стране — просто группирует цифры после кода в блоки 2-3-2-2,
 * что покрывает большинство номеров региона (UZ/RU/TJ/KZ/KG).
 */
export function formatPhoneDisplay(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, '');
  const hasPlus = digits.startsWith('+');
  digits = digits.replace(/\+/g, '');
  if (hasPlus) digits = digits;

  digits = digits.slice(0, 15);

  // код страны — первые 1-3 цифры (эвристика: 1 если начинается на 7, иначе 3)
  const ccLen = digits.startsWith('7') ? 1 : 3;
  const cc = digits.slice(0, ccLen);
  const rest = digits.slice(ccLen);

  const groups = [];
  let i = 0;
  const pattern = [2, 3, 2, 2];
  for (const len of pattern) {
    if (i >= rest.length) break;
    groups.push(rest.slice(i, i + len));
    i += len;
  }
  if (i < rest.length) groups.push(rest.slice(i));

  const body = groups.filter(Boolean).join(' ');
  return `${hasPlus || digits.length > 0 ? '+' : ''}${cc}${body ? ' ' + body : ''}`.trim();
}
