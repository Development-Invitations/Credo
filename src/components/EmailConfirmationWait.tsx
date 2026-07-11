import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { translateAuthError } from '../lib/authErrors';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';

interface Props {
  email: string;
  password: string;
  onConfirmed: () => void;
  onBack: () => void;
}

const POLL_INTERVAL_MS = 4000;
const RESEND_COOLDOWN_S = 60;

export function EmailConfirmationWait({ email, password, onConfirmed, onBack }: Props) {
  const { t } = useTranslation();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);
  const stoppedRef = useRef(false);

  // Тихо пытаемся войти каждые несколько секунд. Пока письмо не подтверждено,
  // Supabase будет отвечать "Email not confirmed" — это ожидаемо, не показываем как ошибку.
  // Как только пользователь перейдёт по ссылке в письме, попытка входа сработает
  // и мы автоматически окажемся в личном кабинете.
  useEffect(() => {
    stoppedRef.current = false;

    async function poll() {
      if (stoppedRef.current) return;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data.session) {
        onConfirmed();
        return;
      }
      if (error && !error.message.toLowerCase().includes('confirm')) {
        // Другая ошибка (например неверный пароль) — прекращаем тихий опрос
        stoppedRef.current = true;
        return;
      }
      timerRef.current = window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    const timerRef = { current: 0 as number };
    poll();

    return () => {
      stoppedRef.current = true;
      window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  async function handleResend() {
    setResendError(null);
    setResendSent(false);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setResendError(translateAuthError(error.message, t));
      return;
    }
    setResendSent(true);
    setResendCooldown(RESEND_COOLDOWN_S);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: 'var(--shadow-elevated)' }}>
      <div
        style={{
          width: 40,
          height: 40,
          margin: '0 auto 16px',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ marginBottom: 10, fontSize: 20 }}>{t('onboarding.confirmEmailTitle')}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
        {t('onboarding.confirmEmailText', { email })}
      </p>

      {resendError && <div style={{ marginBottom: 12 }}><ErrorBanner>{resendError}</ErrorBanner></div>}
      {resendSent && !resendError && (
        <p style={{ color: 'var(--color-success)', fontSize: 13, marginBottom: 12 }}>
          {t('onboarding.confirmEmailResent')}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button variant="secondary" onClick={onBack}>
          {t('onboarding.backToForm')}
        </Button>
        <Button onClick={handleResend} disabled={resendCooldown > 0}>
          {resendCooldown > 0
            ? t('onboarding.resendCooldown', { seconds: resendCooldown })
            : t('onboarding.resendEmail')}
        </Button>
      </div>
      </div>
    </div>
  );
}
