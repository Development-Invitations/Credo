import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, Coins } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AmountInput } from './AmountInput';
import { Button } from './Button';

export interface DebtRow {
  id: string;
  amount: number;
  paid_amount: number;
  currency: string;
  due_date: string | null;
  status: 'active' | 'paid';
  comment: string | null;
  created_at: string;
}

interface Props {
  debt: DebtRow;
  clientId: string;
  onChanged: () => void;
  readOnly?: boolean;
}

export function DebtItem({ debt, clientId, onChanged, readOnly }: Props) {
  const { t } = useTranslation();
  const [showPartial, setShowPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  const remaining = Math.max(Number(debt.amount) - Number(debt.paid_amount || 0), 0);
  const overdue =
    debt.status === 'active' &&
    remaining > 0 &&
    !!debt.due_date &&
    new Date(debt.due_date) < new Date(new Date().toDateString());

  async function recordPayment(paidAmount: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || paidAmount <= 0) return;
    await supabase.from('debt_payments').insert({
      debt_id: debt.id,
      debtor_id: clientId,
      user_id: user.id,
      amount: paidAmount,
    });
  }

  async function markFullyPaid() {
    const toPay = remaining;
    await supabase.from('debts').update({ status: 'paid', paid_amount: debt.amount }).eq('id', debt.id);
    await recordPayment(toPay);
    onChanged();
  }

  async function markActive() {
    await supabase.from('debts').update({ status: 'active' }).eq('id', debt.id);
    onChanged();
  }

  async function handlePartialPayment(e: React.FormEvent) {
    e.preventDefault();
    const paid = Number(partialAmount) || 0;
    if (paid <= 0) return;
    const newPaidAmount = Math.min(Number(debt.paid_amount || 0) + paid, Number(debt.amount));
    const newStatus = newPaidAmount >= Number(debt.amount) ? 'paid' : 'active';
    await supabase.from('debts').update({ paid_amount: newPaidAmount, status: newStatus }).eq('id', debt.id);
    await recordPayment(paid);
    setShowPartial(false);
    setPartialAmount('');
    onChanged();
  }

  return (
    <div
      className="card"
      style={{
        opacity: debt.status === 'paid' ? 0.6 : 1,
        borderColor: overdue ? 'var(--color-danger)' : 'var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="amount" style={{ fontSize: 15 }}>
            {Number(debt.amount).toLocaleString()} {debt.currency}
            {debt.paid_amount > 0 && debt.status === 'active' && (
              <span style={{ fontSize: 12, color: 'var(--color-success)', marginLeft: 8 }}>
                {t('clientDetail.paidSoFar', { amount: Number(debt.paid_amount).toLocaleString() })}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : new Date(debt.created_at).toLocaleDateString()}
            {debt.comment ? ` — ${debt.comment}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {!readOnly && debt.status === 'active' && (
            <IconBtn onClick={() => setShowPartial((v) => !v)} title={t('clientDetail.partialPayment') ?? ''}>
              <Coins size={16} />
            </IconBtn>
          )}
          {!readOnly && (
            <IconBtn
              onClick={debt.status === 'active' ? markFullyPaid : markActive}
              title={debt.status === 'active' ? t('clientDetail.markPaid') : t('clientDetail.markActive')}
            >
              {debt.status === 'active' ? <CheckCircle2 size={16} /> : <RotateCcw size={16} />}
            </IconBtn>
          )}
        </div>
      </div>

      {showPartial && !readOnly && (
        <form onSubmit={handlePartialPayment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <AmountInput
            value={partialAmount}
            onChange={setPartialAmount}
            placeholder={t('clientDetail.partialPaymentAmount') ?? ''}
            style={{ flex: 1 }}
          />
          <Button type="submit" style={{ padding: '8px 14px' }}>
            {t('reminders.save')}
          </Button>
        </form>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-muted)',
        padding: 6,
        display: 'flex',
      }}
    >
      {children}
    </button>
  );
}
