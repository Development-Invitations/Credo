import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Checkbox } from '../../components/Checkbox';
import { playNotificationSound, getSoundVolume, getSoundTone, SoundTone } from '../../lib/sound';

const TONES: SoundTone[] = ['chime', 'soft', 'alert'];

export function SoundSettingsPage() {
  const { t } = useTranslation();
  const [volume, setVolume] = useState(getSoundVolume());
  const [tone, setTone] = useState<SoundTone>(getSoundTone());
  const [onOverdue, setOnOverdue] = useState(localStorage.getItem('soundOn_overdue') !== 'false');
  const [onReminders, setOnReminders] = useState(localStorage.getItem('soundOn_reminders') !== 'false');
  const [onUpdate, setOnUpdate] = useState(localStorage.getItem('soundOn_update') !== 'false');

  function changeVolume(v: number) {
    setVolume(v);
    localStorage.setItem('soundVolume', String(v));
  }

  function changeTone(v: SoundTone) {
    setTone(v);
    localStorage.setItem('soundTone', v);
    playNotificationSound(v);
  }

  function toggleCategory(key: 'overdue' | 'reminders' | 'update', value: boolean, setter: (v: boolean) => void) {
    setter(value);
    localStorage.setItem(`soundOn_${key}`, value ? 'true' : 'false');
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.sound')}
        <HelpTooltip text={t('help.sound')} />
      </h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
          {t('settings.soundVolume')}: {volume}%
        </label>
        <input type="range" min="0" max="100" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('settings.soundToneLabel')}</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {TONES.map((tn) => (
            <button
              key={tn}
              onClick={() => changeTone(tn)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: tone === tn ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: tone === tn ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 13 }}>{t(`settings.soundTone_${tn}`)}</span>
              <Volume2 size={15} color="var(--color-text-muted)" />
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('settings.soundEventsLabel')}</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{t('settings.soundOnOverdue')}</span>
            <Checkbox checked={onOverdue} onChange={(v) => toggleCategory('overdue', v, setOnOverdue)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{t('settings.soundOnReminders')}</span>
            <Checkbox checked={onReminders} onChange={(v) => toggleCategory('reminders', v, setOnReminders)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{t('settings.soundOnUpdate')}</span>
            <Checkbox checked={onUpdate} onChange={(v) => toggleCategory('update', v, setOnUpdate)} />
          </div>
        </div>
      </div>
    </div>
  );
}
