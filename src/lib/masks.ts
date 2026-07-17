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
 * 'X' в шаблоне — место для вводимой цифры, остальные символы (включая цифры
 * кода страны, например "998") выводятся как есть и никогда не заменяются.
 *
 * ВАЖНО: раньше местом для цифры считался символ '9', но код страны у UZ/KG
 * тоже содержит цифры "9" (+998, +996) — из-за этого при вводе номера часть
 * цифр кода страны ошибочно съедалась вводом пользователя, и маска съезжала
 * (например "+998 (99)..." превращалось в "+898 (88)..."). 'X' в коде страны
 * не встречается ни у одной из стран ниже, поэтому конфликта больше нет.
 */
export const PHONE_MASK_TEMPLATES: Record<string, string> = {
  ru: '+7 (XXX) XXX-XX-XX',
  uz: '+998 (XX) XXX-XX-XX',
  tj: '+992 (XX) XXX-XX-XX',
  kz: '+7 (XXX) XXX-XX-XX',
  kg: '+996 (XXX) XXX-XXX',
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
    if (ch === 'X') {
      if (di >= digits.length) break;
      result += digits[di];
      di++;
    } else {
      result += ch;
    }
  }
  return result;
}
