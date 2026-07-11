import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { supabase } from '../lib/supabaseClient';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { CURRENCIES } from '../lib/currency';
import { THEMES } from '../lib/themes';
import { History, X } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { isSoundEnabled } from '../lib/sound';
import { Button } from './Button';
import { SettingsRow } from './SettingsRow';
import { ErrorBanner } from './ErrorBanner';

export function SettingsPanelContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, currency, setCurrency, suggestedCurrencyForLanguage } =
    useApp();
  const {
    currentVersion,
    latestVersion,
    updateAvailable,
    hasUnseenUpdate,
    markUpdateSeen,
    changelogRequested,
    clearChangelogRequest,
    startDownload,
  } = useUI();
  const [currencyPrompt, setCurrencyPrompt] = useState<{ lang: string; suggested: string } | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [callingOn, setCallingOn] = useState(localStorage.getItem('callingEnabled') === 'true');

  function toggleSound(checked: boolean) {
    setSoundOn(checked);
    localStorage.setItem('soundEnabled', checked ? 'true' : 'false');
  }

  function toggleCalling(checked: boolean) {
    setCallingOn(checked);
    localStorage.setItem('callingEnabled', checked ? 'true' : 'false');
  }
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelog, setChangelog] = useState<{ version: string; released_at: string; release_notes: string | null }[]>([]);

  async function openChangelog() {
    setShowChangelog(true);
    markUpdateSeen();
    const { data } = await supabase
      .from('app_versions')
      .select('version, released_at, release_notes')
      .order('released_at', { ascending: false });
    setChangelog(data ?? []);
  }

  // Если журнал запрошен кликом из колокольчика уведомлений — открываем сразу
  useEffect(() => {
    if (changelogRequested) {
      openChangelog();
      clearChangelogRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changelogRequested]);

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

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>{t('settings.soundToggle')}</span>
        <Checkbox checked={soundOn} onChange={toggleSound} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>{t('settings.callingToggle')}</span>
          <Checkbox checked={callingOn} onChange={toggleCalling} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.5 }}>
          {t('settings.callingHint')}
        </p>
      </div>

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
            <Button onClick={startDownload} style={{ width: '100%' }}>
              {t('settings.downloadUpdate')}
            </Button>
          </div>
        )}
        <button
          onClick={openChangelog}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 12,
            padding: 0,
            position: 'relative',
          }}
        >
          <History size={14} />
          {t('settings.changelogButton')}
          {hasUnseenUpdate && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                animation: 'settings-pulse-dot 1.6s ease-in-out infinite',
              }}
            />
          )}
        </button>
      </div>

      <style>{`
        @keyframes settings-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

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

      {showChangelog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
          }}
          onClick={() => setShowChangelog(false)}
        >
          <div
            className="card"
            style={{ width: 560, maxHeight: '82vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={17} color="var(--color-accent)" />
                {t('changelog.title')}
              </h3>
              <button
                onClick={() => setShowChangelog(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>
            {changelog.length === 0 && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                {t('changelog.empty')}
              </div>
            )}
            <div style={{ display: 'grid', gap: 10 }}>
              {changelog.map((v, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    border: i === 0 ? '1px solid var(--color-accent)' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: i === 0 ? 'var(--color-accent)' : 'var(--color-text)',
                      }}
                    >
                      v{v.version}
                      {i === 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 20,
                            background: 'var(--color-accent)',
                            color: 'var(--color-accent-text)',
                          }}
                        >
                          {t('changelog.latest')}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {new Date(v.released_at).toLocaleDateString()}
                    </span>
                  </div>
                  {v.release_notes && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {v.release_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
