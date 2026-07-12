import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CheckCircle2, AlertTriangle, RotateCw } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { friendlyErrorMessage, logError } from '../lib/errorLog';
import { Button } from './Button';

export function UpdateProgressOverlay() {
  const { t } = useTranslation();
  const { downloadStatus, downloadProgress, downloadError, latestVersion, installNow, dismissDownload, startDownload } = useUI();

  const friendlyError = useMemo(
    () => (downloadError ? friendlyErrorMessage(downloadError, t) : null),
    [downloadError, t]
  );

  useEffect(() => {
    if (downloadStatus === 'error' && downloadError) {
      logError('update_download', new Error(downloadError));
    }
  }, [downloadStatus, downloadError]);

  if (downloadStatus === 'idle') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background:
          'radial-gradient(ellipse at top, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 55%), var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 34,
          fontWeight: 700,
          color: 'var(--color-accent)',
          letterSpacing: '-0.02em',
          marginBottom: 6,
        }}
      >
        Credo
      </div>
      {latestVersion && (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 36 }}>
          {t('update.updatingTo', { version: latestVersion.version })}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 560 }}>
        {downloadStatus === 'downloading' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Download size={30} color="var(--color-accent)" />
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 20 }}>
              {downloadProgress}%
            </div>
            <div
              style={{
                width: '100%',
                height: 14,
                borderRadius: 999,
                background: 'var(--color-border)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${downloadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))',
                  transition: 'width 0.25s ease',
                  borderRadius: 999,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                    width: '50%',
                    animation: 'launcher-shimmer 1.4s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{t('update.downloading')}</div>
          </div>
        )}

        {downloadStatus === 'downloaded' && (
          <div className="card" style={{ textAlign: 'center', boxShadow: 'var(--shadow-elevated)', padding: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle2 size={28} color="var(--color-success)" />
            </div>
            <h2 style={{ marginBottom: 10, fontSize: 18 }}>{t('update.readyTitle')}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>{t('update.readyText')}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={dismissDownload}>
                {t('update.later')}
              </Button>
              <Button onClick={installNow}>{t('update.restartNow')}</Button>
            </div>
          </div>
        )}

        {downloadStatus === 'error' && (
          <div className="card" style={{ textAlign: 'center', boxShadow: 'var(--shadow-elevated)', padding: 32 }}>
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
              <AlertTriangle size={28} color="var(--color-danger)" />
            </div>
            <h2 style={{ marginBottom: 10, fontSize: 18 }}>{t('update.errorTitle')}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>{friendlyError}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={dismissDownload}>
                {t('update.later')}
              </Button>
              <Button onClick={startDownload} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCw size={14} />
                {t('update.retry')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* "Что нового" — заполняет экран, пока идёт загрузка, как в лаунчерах игр */}
      {downloadStatus === 'downloading' && latestVersion?.release_notes && (
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 560,
            marginTop: 36,
            maxHeight: 220,
            overflowY: 'auto',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 8 }}>
            {t('update.whatsNew', { version: latestVersion.version })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {latestVersion.release_notes}
          </div>
        </div>
      )}

      <style>{`
        @keyframes launcher-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
