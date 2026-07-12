import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { translateAuthError } from '../lib/authErrors';
import { CURRENCIES } from '../lib/currency';
import { buildSchedule, InterestType } from '../lib/creditCalc';
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

export function CreateCreditModal({ debtorId, defaultCurrency, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [interestType, setInterestType] = useState<InterestType>('none');
  const [rate, setRate] = useState('0');
  const [termMonths, setTermMonths] = useState('6');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const p = Number(principal) || 0;
    const term = Number(termMonths) || 0;
    const r = Number(rate) || 0;
    if (p <= 0 || term <= 0) return null;
    const schedule = buildSchedule(p, interestType, r, term, startDate);
    const total = schedule.reduce((s, i) => s + i.amount, 0);
    return { schedule, total, monthly: schedule[0]?.amount ?? 0 };
  }, [principal, termMonths, rate, interestType, startDate]);

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

    const p = Number(principal) || 0;
    const term = Number(termMonths) || 0;
    const r = Number(rate) || 0;

    if (p <= 0 || term <= 0) {
      setError(t('credit.invalidAmounts'));
      setSaving(false);
      return;
    }

    const { data: credit, error: creditError } = await supabase
      .from('credits')
      .insert({
        debtor_id: debtorId,
        user_id: user.id,
        principal_amount: p,
        currency,
        interest_type: interestType,
        interest_rate: r,
        term_months: term,
        start_date: startDate,
        comment: comment || null,
      })
      .select('id')
      .single();

    if (creditError || !credit) {
      setError(translateAuthError(creditError?.message ?? '', t));
      setSaving(false);
      return;
    }

    const schedule = buildSchedule(p, interestType, r, term, startDate);
    const paymentRows = schedule.map((s) => ({
      credit_id: credit.id,
      debtor_id: debtorId,
      user_id: user.id,
      due_date: s.dueDate,
      expected_amount: s.amount,
    }));

    const { error: paymentsError } = await supabase.from('credit_payments').insert(paymentRows);
    if (paymentsError) {
      setError(translateAuthError(paymentsError.message, t));
      setSaving(false);
      return;
    }

    await supabase.from('credit_events').insert({
      credit_id: credit.id,
      user_id: user.id,
      event_type: 'created',
      description: t('credit.eventCreated', { amount: p, currency, term }),
    });

    setSaving(false);
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
        zIndex: 130,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 440, maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 16 }}>{t('credit.createTitle')}</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <AmountInput value={principal} onChange={setPrincipal} placeholder={t('credit.principal') ?? ''} required style={{ flex: 1 }} />
            <Select value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} style={{ width: 100 }} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
              {t('credit.interestType')}
            </label>
            <div style={{ display: 'grid', gap: 6 }}>
              {(['none', 'flat', 'reducing'] as InterestType[]).map((it) => (
                <button
                  type="button"
                  key={it}
                  onClick={() => setInterestType(it)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: interestType === it ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    background: interestType === it ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t(`credit.interest_${it}`)}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{t(`credit.interest_${it}_desc`)}</span>
                </button>
              ))}
            </div>
          </div>

          {interestType !== 'none' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('credit.rate')}
              </label>
              <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('credit.termMonths')}
              </label>
              <Input type="number" min="1" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('credit.startDate')}
              </label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <Input placeholder={t('debtorForm.comment') ?? ''} value={comment} onChange={(e) => setComment(e.target.value)} />

          {preview && (
            <div className="card" style={{ background: 'var(--color-surface-hover)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.previewMonthly')}</span>
                <span className="amount">{preview.monthly.toLocaleString()} {currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.previewTotal')}</span>
                <span className="amount">{Math.round(preview.total).toLocaleString()} {currency}</span>
              </div>
            </div>
          )}

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
