import { TFunction } from 'i18next';

/**
 * Supabase возвращает технические сообщения на английском (иногда с разным текстом
 * в разных версиях API). Здесь мы распознаём самые частые случаи по ключевым словам
 * и подменяем на понятный, локализованный текст в стиле приложения.
 */
export function translateAuthError(message: string, t: TFunction): string {
  const m = message.toLowerCase();

  // "For security purposes, you can only request this after 38 seconds."
  const rateLimitMatch = m.match(/after (\d+) seconds?/);
  if (rateLimitMatch) {
    return t('errors.rateLimited', { seconds: rateLimitMatch[1] });
  }

  if (m.includes('email rate limit') || m.includes('email_send_rate_limited')) {
    return t('errors.emailRateLimit');
  }

  if (m.includes('not confirmed')) {
    return t('errors.emailNotConfirmedGeneric');
  }

  if (m.includes('already registered') || m.includes('already exists')) {
    return t('errors.alreadyRegistered');
  }

  if (m.includes('password') && (m.includes('at least') || m.includes('short') || m.includes('weak'))) {
    return t('errors.weakPassword');
  }

  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return t('errors.invalidCredentials');
  }

  if (m.includes('email') && m.includes('invalid')) {
    return t('errors.invalidEmail');
  }

  if (m.includes('network') || m.includes('fetch')) {
    return t('errors.networkError');
  }

  return t('errors.generic');
}
