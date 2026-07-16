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
 * Маски телефона под конкретные страны — по выбранному языку интерфейса.
 * '9' в шаблоне — место для цифры, остальные символы выводятся как есть.
 */
export const PHONE_MASK_TEMPLATES: Record<string, string> = {
  ru: '+7 (999) 999-99-99',
  uz: '+998 (99) 999-99-99',
  tj: '+992 (99) 999-99-99',
  kz: '+7 (999) 999-99-99',
  kg: '+996 (999) 999-999',
};

export function phoneExample(lang: string): string {
  return PHONE_MASK_TEMPLATES[lang] ?? PHONE_MASK_TEMPLATES.ru;
}

/** Форматирует телефон под маску текущего языка интерфейса, по мере набора цифр. */
export function formatPhoneDisplay(raw: string, lang: string = 'ru'): string {
  if (!raw || !raw.trim()) return '';

  const template = PHONE_MASK_TEMPLATES[lang] ?? PHONE_MASK_TEMPLATES.ru;
  const prefixDigits = template.split('(')[0].replace(/\D/g, ''); // код страны, например "998"

  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith(prefixDigits)) digits = digits.slice(prefixDigits.length);

  let result = '';
  let di = 0;
  for (const ch of template) {
    if (ch === '9') {
      if (di >= digits.length) break;
      result += digits[di];
      di++;
    } else {
      result += ch;
    }
  }
  return result;
}
