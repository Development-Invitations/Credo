import { supabase } from './supabaseClient';

export async function logError(context: string, error: unknown) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('error_logs').insert({ user_id: user?.id ?? null, context, message, stack });
  } catch {
    // логирование не должно ломать основной сценарий
  }
}

/** Превращает техническое сообщение об ошибке в понятную подсказку с решением. */
export function friendlyErrorMessage(raw: string, t: (key: string) => string): string {
  const m = (raw || '').toLowerCase();

  if (m.includes('err_network_changed') || m.includes('err_internet_disconnected') || m.includes('err_connection') || m.includes('net::')) {
    return t('errors.networkChangedFriendly');
  }
  if (m.includes('404')) return t('errors.notFoundFriendly');
  if (m.includes('timeout') || m.includes('timed out')) return t('errors.timeoutFriendly');
  if (m.includes('enotfound') || m.includes('dns')) return t('errors.dnsFriendly');

  return t('errors.genericFriendly');
}
