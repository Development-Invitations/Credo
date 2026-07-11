import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { translateAuthError } from '../lib/authErrors';
import { CURRENCIES } from '../lib/currency';
import { Button } from './Button';
import { Input } from './Input';
import { AmountInput } from './AmountInput';
import { Select } from './Select';
import { ErrorBanner } from './ErrorBanner';

interface Props {
  debtorId: string;
  defaultCurrency: string;
  onClose: () => void;
  onCreated: () => void;
}

export function AddDebtModal({ debtorId, defaultCurrency, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [dueDate, setDueDate] = useState('');
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

    const { error } = await supabase.from('debts').insert({
      debtor_id: debtorId,
      user_id: user.id,
      amount: Number(amount) || 0,
      currency,
      due_date: dueDate || null,
      comment: comment || null,
      status: 'active',
    });

    setSaving(false);

    if (error) {
      setError(translateAuthError(error.message, t));
      return;
    }

    onCreated();
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
        zIndex: 120,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 400, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>{t('debtForm.title')}</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <AmountInput
              placeholder={t('debtorForm.amount') ?? ''}
              value={amount}
              onChange={setAmount}
              required
              style={{ flex: 1 }}
            />
            <Select
              value={currency}
              onChange={setCurrency}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              style={{ width: 110 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('debtorForm.dueDate')}
            </label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
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
