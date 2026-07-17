import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { friendlyErrorMessage, logError } from '../lib/errorLog';
import { Button } from './Button';
import { Input } from './Input';
import { PhoneInput } from './PhoneInput';
import { PassportInput } from './PassportInput';
import { EmailInput } from './EmailInput';
import { ErrorBanner } from './ErrorBanner';

interface Props {
  clientId: string;
  initialFullName: string;
  initialPhone: string | null;
  initialEmail: string | null;
  initialPassportData: string | null;
  initialAddress: string | null;
  initialComment: string | null;
  onClose: () => void;
  onSaved: (updated: {
    full_name: string;
    phone: string | null;
    email: string | null;
    passport_data: string | null;
    address: string | null;
    comment: string | null;
  }) => void;
}

/** Редактирование карточки кредитного клиента — данные (телефон, email, паспорт,
 * адрес) можно актуализировать в любой момент, не создавая нового клиента. */
export function EditCreditClientModal({
  clientId,
  initialFullName,
  initialPhone,
  initialEmail,
  initialPassportData,
  initialAddress,
  initialComment,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(initialFullName);
  const [country, setCountry] = useState(localStorage.getItem('docsCountry') || 'uz');
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [passportData, setPassportData] = useState(initialPassportData ?? '');
  const [address, setAddress] = useState(initialAddress ?? '');
  const [comment, setComment] = useState(initialComment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const updated = {
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      passport_data: passportData || null,
      address: address || null,
      comment: comment || null,
    };

    const { error } = await supabase.from('credit_clients').update(updated).eq('id', clientId);

    setSaving(false);

    if (error) {
      logError('update_credit_client', new Error(error.message));
      setError(friendlyErrorMessage(error.message, t));
      return;
    }

    onSaved(updated);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 180,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 420, maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 16 }}>{t('clientDetail.editTitle')}</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
          <Input
            placeholder={t('debtorForm.fullName') ?? ''}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <PhoneInput
            placeholder={t('debtorForm.phone') ?? ''}
            value={phone}
            onChange={setPhone}
            country={country}
            onCountryChange={(c) => {
              setCountry(c);
              localStorage.setItem('docsCountry', c);
            }}
          />
          <EmailInput placeholder={t('debtorForm.email') ?? ''} value={email} onChange={setEmail} />
          <PassportInput value={passportData} onChange={setPassportData} country={country} />
          <Input placeholder={t('credit.address') ?? ''} value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input
            placeholder={t('debtorForm.comment') ?? ''}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('debtorForm.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '...' : t('debtorForm.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
