import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, ServerCrash } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Status = 'ok' | 'offline' | 'server';

const HEALTHY_INTERVAL_MS = 20000;
const UNHEALTHY_INTERVAL_MS = 5000;

export function ConnectivityGuard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('ok');

  const check = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    try {
      const { error } = await supabase.from('app_versions').select('id').limit(1);
      if (error) throw error;
      setStatus('ok');
    } catch {
      setStatus('server');
    }
  }, []);

  useEffect(() => {
    check();
    const onOnline = () => check();
    const onOffline = () => setStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(check, status === 'ok' ? HEALTHY_INTERVAL_MS : UNHEALTHY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check, status]);

  if (status === 'ok') return null;

  const isOffline = status === 'offline';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(8, 9, 13, 0.94)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="card"
        style={{ maxWidth: 440, textAlign: 'center', boxShadow: 'var(--shadow-elevated)', padding: 32 }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--color-danger) 15%, var(--color-surface))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          {isOffline ? <WifiOff size={30} color="var(--color-danger)" /> : <ServerCrash size={30} color="var(--color-danger)" />}
        </div>

        <h2 style={{ marginBottom: 10, fontSize: 19 }}>
          {isOffline ? t('connectivity.offlineTitle') : t('connectivity.serverTitle')}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {isOffline ? t('connectivity.offlineText') : t('connectivity.serverText')}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-accent)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'connectivity-spin 0.8s linear infinite',
            }}
          />
          {t('connectivity.retrying')}
        </div>
      </div>

      <style>{`@keyframes connectivity-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
