import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { translateAuthError } from '../lib/authErrors';
import { Button } from './Button';
import { Input } from './Input';
import { PhoneInput } from './PhoneInput';
import { EmailInput } from './EmailInput';
import { ErrorBanner } from './ErrorBanner';

interface Props {
  onClose: () => void;
  onCreated: (newClientId: string) => void;
}

/** Создание карточки клиента (должника) — без суммы, суммы дозаписываются отдельно как долги. */
export function AddDebtorModal({ onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      .from('debtors')
      .insert({ user_id: user.id, full_name: fullName, phone: phone || null, email: email || null, comment: comment || null })
      .select('id')
      .single();

    setSaving(false);

    if (error) {
      setError(translateAuthError(error.message, t));
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
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 420, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>{t('debtorForm.title')}</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
          <Input
            placeholder={t('debtorForm.fullName') ?? ''}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <PhoneInput placeholder={t('debtorForm.phone') ?? ''} value={phone} onChange={setPhone} required />
          <EmailInput placeholder={t('debtorForm.email') ?? ''} value={email} onChange={setEmail} required />
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
