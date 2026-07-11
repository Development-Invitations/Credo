import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { CURRENCIES } from '../../lib/currency';
import { Button } from '../../components/Button';

// Тип для window.electronAPI, объявленного в preload.js
declare global {
  interface Window {
    electronAPI?: { getAppVersion: () => Promise<string> };
  }
}

export function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, currency, setCurrency, suggestedCurrencyForLanguage } =
    useApp();
  const [currentVersion, setCurrentVersion] = useState('0.1.0');
  const [latestVersion, setLatestVersion] = useState<{ version: string; download_url: string } | null>(null);
  // Когда меняем язык и это подразумевает другую валюту — спрашиваем, менять или оставить
  const [currencyPrompt, setCurrencyPrompt] = useState<{ lang: string; suggested: string } | null>(null);

  function handleLanguageClick(lang: string) {
    const suggested = suggestedCurrencyForLanguage(lang);
    if (suggested !== currency) {
      setCurrencyPrompt({ lang, suggested });
    } else {
      setLanguage(lang);
    }
  }

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setCurrentVersion);

    // Проверка последней версии в таблице app_versions Supabase
    supabase
      .from('app_versions')
      .select('version, download_url')
      .order('released_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setLatestVersion(data);
      });
  }, []);

  const updateAvailable = latestVersion && latestVersion.version !== currentVersion;

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/dashboard" className="btn btn-secondary">←</Link>
        <h1>{t('settings.title')}</h1>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>{t('settings.language')}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              className="btn"
              style={{
                background: language === l.code ? 'var(--color-accent)' : 'var(--color-surface)',
                color: language === l.code ? 'var(--color-accent-text)' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
              onClick={() => handleLanguageClick(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>{t('settings.currency')}</h3>
        <select
          className="input"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>{t('settings.theme')}</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              className="radio"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
            />
            {t('settings.themeDark')}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              className="radio"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
            />
            {t('settings.themeLight')}
          </label>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 8 }}>{t('settings.version')}</h3>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: updateAvailable ? 12 : 0 }}>
          v{currentVersion}
        </div>
        {updateAvailable && (
          <div>
            <div style={{ color: 'var(--color-accent)', marginBottom: 8 }}>
              {t('settings.updateAvailable')}: v{latestVersion!.version}
            </div>
            <Button onClick={() => window.open(latestVersion!.download_url, '_blank')}>
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
            zIndex: 50,
          }}
        >
          <div className="card" style={{ maxWidth: 380, boxShadow: 'var(--shadow-elevated)' }}>
            <h3 style={{ marginBottom: 10 }}>{t('settings.currencyPromptTitle')}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {t('settings.currencyPromptText', { currency: currencyPrompt.suggested })}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setLanguage(currencyPrompt.lang);
                  setCurrencyPrompt(null);
                }}
              >
                {t('settings.keepCurrency')}
              </Button>
              <Button
                onClick={() => {
                  setCurrency(currencyPrompt.suggested);
                  setLanguage(currencyPrompt.lang);
                  setCurrencyPrompt(null);
                }}
              >
                {t('settings.changeCurrency')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
