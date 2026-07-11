import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { CURRENCIES } from '../lib/currency';
import { THEMES } from '../lib/themes';
import { useAppVersion } from '../hooks/useAppVersion';
import { Button } from './Button';
import { SettingsRow } from './SettingsRow';
import { ErrorBanner } from './ErrorBanner';

export function SettingsPanelContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, currency, setCurrency, suggestedCurrencyForLanguage } =
    useApp();
  const { currentVersion, latestVersion, updateAvailable } = useAppVersion();
  const [currencyPrompt, setCurrencyPrompt] = useState<{ lang: string; suggested: string } | null>(null);

  const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label ?? language;
  const themeLabel = t(`settings.theme_${theme}`);

  function handleLanguageClick(lang: string) {
    const suggested = suggestedCurrencyForLanguage(lang);
    if (suggested !== currency) {
      setCurrencyPrompt({ lang, suggested });
    } else {
      setLanguage(lang);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <SettingsRow label={t('settings.language')} value={languageLabel}>
        <div style={{ display: 'grid', gap: 6 }}>
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageClick(l.code)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: language === l.code ? 'var(--color-accent)' : 'transparent',
                color: language === l.code ? 'var(--color-accent-text)' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label={t('settings.currency')} value={currency}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: '8px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: currency === c ? 'var(--color-accent)' : 'transparent',
                color: currency === c ? 'var(--color-accent-text)' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label={t('settings.theme')} value={themeLabel}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 6px',
                borderRadius: 'var(--radius-sm)',
                border: theme === th.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: th.bg,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: th.accent,
                  display: 'block',
                }}
              />
              <span style={{ fontSize: 11, color: th.id === 'light' || th.id === 'sand' ? '#333' : '#eee' }}>
                {t(`settings.theme_${th.id}`)}
              </span>
            </button>
          ))}
        </div>
      </SettingsRow>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>{t('settings.version')}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>v{currentVersion}</span>
        </div>
        {updateAvailable && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: 8, fontSize: 13 }}>
              {t('settings.updateAvailable')}: v{latestVersion!.version}
            </div>
            <Button onClick={() => window.open(latestVersion!.download_url, '_blank')} style={{ width: '100%' }}>
              {t('settings.downloadUpdate')}
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        style={{ width: '100%', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
        onClick={async () => {
          await supabase.auth.signOut();
          navigate('/login');
        }}
      >
        {t('settings.signOut')}
      </Button>

      {currencyPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div className="card" style={{ maxWidth: 380, boxShadow: 'var(--shadow-elevated)' }}>
            <h3 style={{ marginBottom: 10 }}>{t('settings.currencyPromptTitle')}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {t('settings.currencyPromptText', { currency: currencyPrompt.suggested })}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setLanguage(currencyPrompt.lang); setCurrencyPrompt(null); }}>
                {t('settings.keepCurrency')}
              </Button>
              <Button onClick={() => { setCurrency(currencyPrompt.suggested); setLanguage(currencyPrompt.lang); setCurrencyPrompt(null); }}>
                {t('settings.changeCurrency')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
