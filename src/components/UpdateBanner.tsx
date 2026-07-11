import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import { useAppVersion } from '../hooks/useAppVersion';

export function UpdateBanner() {
  const { t } = useTranslation();
  const { updateAvailable, latestVersion } = useAppVersion();
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  if (!updateAvailable || !latestVersion) return null;
  if (dismissedVersion === latestVersion.version) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 20px',
        background: 'color-mix(in srgb, var(--color-accent) 16%, var(--color-bg-elevated))',
        borderBottom: '1px solid var(--color-border)',
        fontSize: 13,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Download size={15} color="var(--color-accent)" />
        {t('update.available', { version: latestVersion.version })}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => window.open(latestVersion.download_url, '_blank')}
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {t('settings.downloadUpdate')}
        </button>
        <button
          onClick={() => setDismissedVersion(latestVersion.version)}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
