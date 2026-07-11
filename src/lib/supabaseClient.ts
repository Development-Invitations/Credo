import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars отсутствуют. Заполни VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файле .env'
  );
}

// В dev-режиме Vite может заново выполнять этот модуль при горячей перезагрузке (HMR),
// что раньше создавало новый экземпляр клиента и лишний раз запускало обновление сессии —
// при частых правках кода это быстро упиралось в лимит Supabase на обновление токена.
// Держим единственный инстанс на window, чтобы HMR его переиспользовал, а не пересоздавал.
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient;
  }
}

export const supabase: SupabaseClient =
  window.__supabaseClient ??
  (window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }));
