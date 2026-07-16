import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { translateAuthError } from '../../lib/authErrors';
import { rememberEmail } from '../../lib/session';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EmailConfirmationWait } from '../../components/EmailConfirmationWait';
import { OnboardingBrand } from '../../components/OnboardingBrand';

export function RegisterStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Если Supabase требует подтверждение email — показываем экран ожидания
  // вместо ошибки, и держим введённые email/пароль, чтобы дальше тихо
  // проверять готовность и автоматически войти после подтверждения.
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      setError(translateAuthError(error.message, t));
      return;
    }

    if (data.session) {
      // Подтверждение email отключено в проекте — сессия выдаётся сразу.
      rememberEmail(email);
      navigate('/home');
      return;
    }

    // Сессии нет, но ошибки тоже нет — значит аккаунт создан и ждёт подтверждения письма.
    setAwaitingConfirmation(true);
  }

  if (awaitingConfirmation) {
    return (
      <EmailConfirmationWait
        email={email}
        password={password}
        onConfirmed={() => {
          rememberEmail(email);
          navigate('/home');
        }}
        onBack={() => setAwaitingConfirmation(false)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <OnboardingBrand />
      <div className="card" style={{ width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-elevated)' }}>
      <h1 style={{ marginBottom: 24, textAlign: 'center' }}>{t('onboarding.createAccount')}</h1>

      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 12 }}>
        <Input
          placeholder={t('onboarding.fullName') ?? ''}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder={t('onboarding.email') ?? ''}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t('onboarding.password') ?? ''}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Button type="submit" disabled={loading}>
          {loading ? '...' : t('onboarding.register')}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <Link to="/login" style={{ color: 'var(--color-accent)' }}>
          {t('onboarding.alreadyHaveAccount')}
        </Link>
      </p>
      </div>
    </div>
  );
}
