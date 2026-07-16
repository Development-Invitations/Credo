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
  onClose: () => void;
  onCreated: (newClientId: string) => void;
}

/** Создание клиента для кредита — полностью отдельная база от клиентов долгов,
 * с расширенными данными (паспорт, адрес), так как кредит — более формальный продукт. */
export function AddCreditClientModal({ onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState(localStorage.getItem('docsCountry') || 'uz');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passportData, setPassportData] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t('errors.sessionExpired'));
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('credit_clients')
      .insert({
        user_id: user.id,
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        passport_data: passportData || null,
        address: address || null,
        comment: comment || null,
      })
      .select('id')
      .single();

    setSaving(false);

    if (error) {
      logError('create_credit_client', new Error(error.message));
      setError(friendlyErrorMessage(error.message, t));
      return;
    }

    onCreated(data.id);
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
        zIndex: 140,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 420, maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 16 }}>{t('credit.newClientTitle')}</h3>
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
            required
            country={country}
            onCountryChange={(c) => {
              setCountry(c);
              localStorage.setItem('docsCountry', c);
            }}
          />
          <EmailInput placeholder={t('debtorForm.email') ?? ''} value={email} onChange={setEmail} required />
          <PassportInput value={passportData} onChange={setPassportData} country={country} required />
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
