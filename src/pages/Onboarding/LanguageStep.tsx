import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { OnboardingBrand } from '../../components/OnboardingBrand';
import { SUPPORTED_LANGUAGES } from '../../i18n';

export function LanguageStep() {
  const { t } = useTranslation();
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ margin: '80px auto', maxWidth: 420 }}>
      <OnboardingBrand />
      <div className="card" style={{ textAlign: 'center', boxShadow: 'var(--shadow-elevated)' }}>
      <h1 style={{ marginBottom: 24 }}>{t('onboarding.chooseLanguage')}</h1>

      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {SUPPORTED_LANGUAGES.map((l) => (
          <button
            key={l.code}
            className="btn"
            style={{
              background: language === l.code ? 'var(--color-accent)' : 'var(--color-surface)',
              color: language === l.code ? 'var(--color-accent-text)' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
            onClick={() => setLanguage(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <Button onClick={() => navigate('/onboarding/register')} style={{ width: '100%' }}>
        {t('onboarding.continue')}
      </Button>
      </div>
    </div>
  );
}
