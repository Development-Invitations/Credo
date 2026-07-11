import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { Button } from './Button';

export function UpdateProgressOverlay() {
  const { t } = useTranslation();
  const { downloadStatus, downloadProgress, downloadError, installNow, dismissDownload } = useUI();

  if (downloadStatus === 'idle') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background:
          'radial-gradient(ellipse at top, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 55%), rgba(8, 9, 13, 0.96)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 440, width: '90%', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-accent)',
            letterSpacing: '-0.02em',
            marginBottom: 28,
          }}
        >
          Credo
        </div>

        <div className="card" style={{ boxShadow: 'var(--shadow-elevated)', padding: 32 }}>
          {downloadStatus === 'downloading' && (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <Download size={28} color="var(--color-accent)" />
              </div>
              <h2 style={{ marginBottom: 4, fontSize: 18 }}>{t('update.downloading')}</h2>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-accent)', margin: '10px 0 18px' }}>
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
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                      width: '50%',
                      animation: 'launcher-shimmer 1.4s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {downloadStatus === 'downloaded' && (
            <>
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
            </>
          )}

          {downloadStatus === 'error' && (
            <>
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
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
                {downloadError || t('update.errorText')}
              </p>
              <Button variant="secondary" onClick={dismissDownload}>
                {t('update.later')}
              </Button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes launcher-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
