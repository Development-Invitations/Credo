import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { translateAuthError } from '../../lib/authErrors';
import { rememberEmail, getRememberedEmail, forgetEmail } from '../../lib/session';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EmailConfirmationWait } from '../../components/EmailConfirmationWait';
import { OnboardingBrand } from '../../components/OnboardingBrand';

export function LoginStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const remembered = getRememberedEmail();
  const [email, setEmail] = useState(remembered ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('confirm')) {
        setAwaitingConfirmation(true);
        return;
      }
      setError(translateAuthError(error.message, t));
      return;
    }

    rememberEmail(email);
    navigate('/dashboard');
  }

  if (awaitingConfirmation) {
    return (
      <EmailConfirmationWait
        email={email}
        password={password}
        onConfirmed={() => {
          rememberEmail(email);
          navigate('/dashboard');
        }}
        onBack={() => setAwaitingConfirmation(false)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <OnboardingBrand />
      <div className="card" style={{ width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-elevated)' }}>
      <h1 style={{ marginBottom: 4, textAlign: 'center' }}>
        {remembered ? t('onboarding.welcomeBack') : t('onboarding.login')}
      </h1>
      {remembered && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 20, fontSize: 14 }}>
          {remembered}
        </p>
      )}

      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
        {!remembered && (
          <Input
            type="email"
            placeholder={t('onboarding.email') ?? ''}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <Input
          type="password"
          placeholder={t('onboarding.password') ?? ''}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus={!!remembered}
          required
        />

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Button type="submit" disabled={loading}>
          {loading ? '...' : t('onboarding.login')}
        </Button>
      </form>

      {remembered && (
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => {
            forgetEmail();
            navigate(0); // перезагружаем шаг, чтобы показать обычный вход
          }}
        >
          {t('onboarding.useAnotherAccount')}
        </button>
      )}

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <Link to="/onboarding" style={{ color: 'var(--color-accent)' }}>
          {t('onboarding.noAccountYet')}
        </Link>
      </p>
      </div>
    </div>
  );
}
