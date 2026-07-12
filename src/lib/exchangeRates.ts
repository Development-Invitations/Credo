interface RatesCache {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

let memoryCache: RatesCache | null = null;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 часов — курс не нужно дёргать чаще

/**
 * Возвращает курс валют относительно базовой валюты (rates[код] = сколько единиц этой
 * валюты в одной единице базовой). Источник — бесплатный, без ключей и лимитов,
 * раздаётся через CDN (обновляется раз в сутки). Если сеть недоступна — вернёт null,
 * и конвертация просто не покажется, без падения приложения.
 */
export async function getExchangeRates(base: string): Promise<Record<string, number> | null> {
  const baseLower = base.toLowerCase();

  if (memoryCache && memoryCache.base === baseLower && Date.now() - memoryCache.fetchedAt < CACHE_TTL) {
    return memoryCache.rates;
  }

  const cachedRaw = localStorage.getItem(`exchangeRates_${baseLower}`);
  if (cachedRaw) {
    try {
      const cached: RatesCache = JSON.parse(cachedRaw);
      if (Date.now() - cached.fetchedAt < CACHE_TTL) {
        memoryCache = cached;
        return cached.rates;
      }
    } catch {
      // игнорируем битый кэш
    }
  }

  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseLower}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${baseLower}.json`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const rates = data[baseLower];
      if (rates) {
        const cache: RatesCache = { base: baseLower, rates, fetchedAt: Date.now() };
        memoryCache = cache;
        localStorage.setItem(`exchangeRates_${baseLower}`, JSON.stringify(cache));
        return rates;
      }
    } catch {
      continue; // пробуем запасной адрес
    }
  }

  return null;
}

/** Переводит сумму из валюты `from` в базовую валюту, для которой были запрошены курсы. */
export function convertToBase(amount: number, from: string, rates: Record<string, number> | null): number | null {
  if (!rates) return null;
  const rate = rates[from.toLowerCase()];
  if (!rate) return null;
  return amount / rate;
}
