import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Input } from '../../components/Input';

export function CallingSettingsPage() {
  const { t } = useTranslation();
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('callingApiUrl') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('callingApiKey') || '');
  const [callerId, setCallerId] = useState(localStorage.getItem('callingCallerId') || '');

  function save(key: string, value: string, setter: (v: string) => void) {
    setter(value);
    localStorage.setItem(key, value);
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.calling')}
        <HelpTooltip text={t('help.calling')} />
      </h1>

      <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
            {t('settings.callingApiUrl')}
          </label>
          <Input placeholder="https://api.example.com/call" value={apiUrl} onChange={(e) => save('callingApiUrl', e.target.value, setApiUrl)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
            {t('settings.callingApiKey')}
          </label>
          <Input type="password" value={apiKey} onChange={(e) => save('callingApiKey', e.target.value, setApiKey)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
            {t('settings.callingCallerId')}
          </label>
          <Input placeholder="+998901234567" value={callerId} onChange={(e) => save('callingCallerId', e.target.value, setCallerId)} />
        </div>
      </div>

      <div className="card" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{t('settings.callingApiHint')}</p>
      </div>
    </div>
  );
}
