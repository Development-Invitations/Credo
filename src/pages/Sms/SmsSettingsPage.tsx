import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Mail } from 'lucide-react';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';

const DEFAULT_DEBT_TEMPLATE = 'Здравствуйте, {{name}}! Напоминаем о долге {{amount}} {{currency}}. Срок оплаты: {{date}}.';
const DEFAULT_CREDIT_TEMPLATE = 'Здравствуйте, {{name}}! Ближайший платёж по кредиту {{account}} — {{amount}} {{currency}} до {{date}}.';

export function SmsSettingsPage() {
  const { t } = useTranslation();
  const [destination, setDestination] = useState(localStorage.getItem('smsDestination') || 'phone');

  const [provider, setProvider] = useState(localStorage.getItem('smsProvider') || 'eskiz');
  const [senderPhone, setSenderPhone] = useState(localStorage.getItem('smsSenderPhone') || '');
  const [smsLogin, setSmsLogin] = useState(localStorage.getItem('smsLogin') || '');
  const [smsPassword, setSmsPassword] = useState(localStorage.getItem('smsPassword') || '');
  const [smsDebtTemplate, setSmsDebtTemplate] = useState(localStorage.getItem('smsDebtTemplate') || DEFAULT_DEBT_TEMPLATE);
  const [smsCreditTemplate, setSmsCreditTemplate] = useState(localStorage.getItem('smsCreditTemplate') || DEFAULT_CREDIT_TEMPLATE);

  const [smtpHost, setSmtpHost] = useState(localStorage.getItem('emailSmtpHost') || '');
  const [smtpPort, setSmtpPort] = useState(localStorage.getItem('emailSmtpPort') || '587');
  const [emailLogin, setEmailLogin] = useState(localStorage.getItem('emailLogin') || '');
  const [emailPassword, setEmailPassword] = useState(localStorage.getItem('emailPassword') || '');
  const [emailFromName, setEmailFromName] = useState(localStorage.getItem('emailFromName') || 'Credo');
  const [emailDebtTemplate, setEmailDebtTemplate] = useState(localStorage.getItem('emailDebtTemplate') || DEFAULT_DEBT_TEMPLATE);
  const [emailCreditTemplate, setEmailCreditTemplate] = useState(localStorage.getItem('emailCreditTemplate') || DEFAULT_CREDIT_TEMPLATE);

  function set(key: string, value: string, setter: (v: string) => void) {
    setter(value);
    localStorage.setItem(key, value);
  }

  function changeDestination(v: string) {
    setDestination(v);
    localStorage.setItem('smsDestination', v);
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.sms')}
        <HelpTooltip text={t('help.sms')} width={300} />
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => changeDestination('phone')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: destination === 'phone' ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            background: destination === 'phone' ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={15} />
          {t('settings.smsDestPhone')}
        </button>
        <button
          onClick={() => changeDestination('email')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: destination === 'email' ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            background: destination === 'email' ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          <Mail size={15} />
          {t('settings.smsDestEmail')}
        </button>
      </div>

      {destination === 'phone' ? (
        <>
          <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.smsProvider')}
              </label>
              <Select
                value={provider}
                onChange={(v) => set('smsProvider', v, setProvider)}
                options={[
                  { value: 'eskiz', label: 'Eskiz.uz ' + t('settings.smsRecommended') },
                  { value: 'playmobile', label: 'PlayMobile' },
                  { value: 'other', label: t('settings.smsProviderOther') },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.smsSenderPhone')}
              </label>
              <Input placeholder="+998901234567" value={senderPhone} onChange={(e) => set('smsSenderPhone', e.target.value, setSenderPhone)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.smsLogin')}
              </label>
              <Input value={smsLogin} onChange={(e) => set('smsLogin', e.target.value, setSmsLogin)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.smsPassword')}
              </label>
              <Input type="password" value={smsPassword} onChange={(e) => set('smsPassword', e.target.value, setSmsPassword)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('settings.smsTemplateDebt')}
            </label>
            <textarea
              className="input"
              rows={3}
              value={smsDebtTemplate}
              onChange={(e) => set('smsDebtTemplate', e.target.value, setSmsDebtTemplate)}
              style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }}
            />
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('settings.smsTemplateCredit')}
            </label>
            <textarea
              className="input"
              rows={3}
              value={smsCreditTemplate}
              onChange={(e) => set('smsCreditTemplate', e.target.value, setSmsCreditTemplate)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>{t('settings.smsTemplateHint')}</p>
          </div>
        </>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                  {t('settings.emailSmtpHost')}
                </label>
                <Input placeholder="smtp.gmail.com" value={smtpHost} onChange={(e) => set('emailSmtpHost', e.target.value, setSmtpHost)} />
              </div>
              <div style={{ width: 90 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                  {t('settings.emailSmtpPort')}
                </label>
                <Input value={smtpPort} onChange={(e) => set('emailSmtpPort', e.target.value, setSmtpPort)} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.emailLogin')}
              </label>
              <Input value={emailLogin} onChange={(e) => set('emailLogin', e.target.value, setEmailLogin)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.emailPassword')}
              </label>
              <Input type="password" value={emailPassword} onChange={(e) => set('emailPassword', e.target.value, setEmailPassword)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('settings.emailFromName')}
              </label>
              <Input value={emailFromName} onChange={(e) => set('emailFromName', e.target.value, setEmailFromName)} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('settings.smsTemplateDebt')}
            </label>
            <textarea
              className="input"
              rows={4}
              value={emailDebtTemplate}
              onChange={(e) => set('emailDebtTemplate', e.target.value, setEmailDebtTemplate)}
              style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }}
            />
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('settings.smsTemplateCredit')}
            </label>
            <textarea
              className="input"
              rows={4}
              value={emailCreditTemplate}
              onChange={(e) => set('emailCreditTemplate', e.target.value, setEmailCreditTemplate)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>{t('settings.smsTemplateHint')}</p>
          </div>
        </>
      )}

      <div className="card" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{t('settings.smsNotConnected')}</p>
      </div>
    </div>
  );
}
