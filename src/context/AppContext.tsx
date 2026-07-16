import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { LANGUAGE_CURRENCY } from '../lib/currency';
import i18n from '../i18n';

export type Theme = 'dark' | 'light' | 'ocean' | 'forest' | 'sand';

interface AppContextValue {
  session: Session | null;
  loadingSession: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  /** Валюта, которую подразумевает текущий выбранный язык (для подсказки в UI) */
  suggestedCurrencyForLanguage: (lang: string) => string;
  creditModuleEnabled: boolean;
  setCreditModuleEnabled: (v: boolean) => void;
  soundModuleEnabled: boolean;
  setSoundModuleEnabled: (v: boolean) => void;
  callingModuleEnabled: boolean;
  setCallingModuleEnabled: (v: boolean) => void;
  smsModuleEnabled: boolean;
  setSmsModuleEnabled: (v: boolean) => void;
  documentsModuleEnabled: boolean;
  setDocumentsModuleEnabled: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [language, setLanguageState] = useState(
    localStorage.getItem('language') || 'ru'
  );
  const [currency, setCurrencyState] = useState(
    localStorage.getItem('currency') || LANGUAGE_CURRENCY[localStorage.getItem('language') || 'ru']
  );
  const [creditModuleEnabled, setCreditModuleEnabledState] = useState(
    localStorage.getItem('creditModuleEnabled') === 'true'
  );
  const [soundModuleEnabled, setSoundModuleEnabledState] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const [callingModuleEnabled, setCallingModuleEnabledState] = useState(
    localStorage.getItem('callingEnabled') === 'true'
  );
  const [smsModuleEnabled, setSmsModuleEnabledState] = useState(
    localStorage.getItem('smsEnabled') === 'true'
  );
  const [documentsModuleEnabled, setDocumentsModuleEnabledState] = useState(
    localStorage.getItem('documentsModuleEnabled') === 'true'
  );

  // Восстановление сессии при запуске (авто-вход, если пользователь уже входил ранее)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  return (
    <AppContext.Provider
      value={{
        session,
        loadingSession,
        theme,
        setTheme: setThemeState,
        language,
        setLanguage: setLanguageState,
        currency,
        setCurrency: setCurrencyState,
        suggestedCurrencyForLanguage: (lang: string) => LANGUAGE_CURRENCY[lang] ?? 'USD',
        creditModuleEnabled,
        setCreditModuleEnabled: (v: boolean) => {
          setCreditModuleEnabledState(v);
          localStorage.setItem('creditModuleEnabled', v ? 'true' : 'false');
        },
        soundModuleEnabled,
        setSoundModuleEnabled: (v: boolean) => {
          setSoundModuleEnabledState(v);
          localStorage.setItem('soundEnabled', v ? 'true' : 'false');
        },
        callingModuleEnabled,
        setCallingModuleEnabled: (v: boolean) => {
          setCallingModuleEnabledState(v);
          localStorage.setItem('callingEnabled', v ? 'true' : 'false');
        },
        smsModuleEnabled,
        setSmsModuleEnabled: (v: boolean) => {
          setSmsModuleEnabledState(v);
          localStorage.setItem('smsEnabled', v ? 'true' : 'false');
        },
        documentsModuleEnabled,
        setDocumentsModuleEnabled: (v: boolean) => {
          setDocumentsModuleEnabledState(v);
          localStorage.setItem('documentsModuleEnabled', v ? 'true' : 'false');
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp должен использоваться внутри AppProvider');
  return ctx;
}
