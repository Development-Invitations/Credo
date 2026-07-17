import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RotateCcw, X, Printer, Coins } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import { useApp } from '../context/AppContext';
import { DebtRow } from './DebtItem';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { ContractPrintView } from './ContractPrintView';

interface PaymentRow {
  id: string;
  amount: number;
  paid_at: string;
}

interface Props {
  debt: DebtRow;
  clientId: string;
  readOnly?: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function DebtDetailModal({ debt, clientId, readOnly, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { documentsModuleEnabled } = useApp();
  const [showPrint, setShowPrint] = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartial, setShowPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const remaining = Math.max(Number(debt.amount) - Number(debt.paid_amount || 0), 0);
  const overdue =
    debt.status === 'active' &&
    remaining > 0 &&
    !!debt.due_date &&
    new Date(debt.due_date) < new Date(new Date().toDateString());

  async function load() {
    const { data } = await supabase
      .from('debt_payments')
      .select('id, amount, paid_at')
      .eq('debt_id', debt.id)
      .order('paid_at', { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debt.id]);

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
    await supabase.from('debts').update({ status: 'paid', paid_amount: debt.amount }).eq('id', debt.id);
    await recordPayment(remaining);
    await load();
    onChanged();
  }

  async function markActive() {
    await supabase.from('debts').update({ status: 'active' }).eq('id', debt.id);
    onChanged();
  }

  async function handlePartialPayment(e: React.FormEvent) {
    e.preventDefault();
    const paid = Number(partialAmount) || 0;
    if (paid <= 0) {
      showToast(t('toast.enterAmount'), 'error');
      return;
    }
    const newPaidAmount = Math.min(Number(debt.paid_amount || 0) + paid, Number(debt.amount));
    const newStatus = newPaidAmount >= Number(debt.amount) ? 'paid' : 'active';
    await supabase.from('debts').update({ paid_amount: newPaidAmount, status: newStatus }).eq('id', debt.id);
    await recordPayment(paid);
    setShowPartial(false);
    setPartialAmount('');
    await load();
    onChanged();
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
        zIndex: 160,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 440, maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div className="amount" style={{ fontSize: 22, fontWeight: 700 }}>
              {Number(debt.amount).toLocaleString()} {debt.currency}
            </div>
            {debt.debt_number != null && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {t('debtDetail.debtNumber')} №{debt.debt_number}
              </div>
            )}
            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 20,
                background: overdue ? 'var(--color-danger)' : debt.status === 'active' ? 'var(--color-accent)' : 'var(--color-success)',
                color: '#fff',
              }}
            >
              {overdue ? t('dashboard.statusOverdue') : debt.status === 'active' ? t('dashboard.statusActive') : t('dashboard.statusPaid')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="card" style={{ background: 'var(--color-surface-hover)', marginBottom: 16, display: 'grid', gap: 6, fontSize: 13 }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('debtDetail.takenOn')}: </span>
            {new Date(debt.created_at).toLocaleDateString()}
          </div>
          {debt.due_date && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>{t('debtDetail.dueDate')}: </span>
              {new Date(debt.due_date).toLocaleDateString()}
            </div>
          )}
          {debt.paid_amount > 0 && debt.status === 'active' && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>{t('debtDetail.paidSoFarLabel')}: </span>
              <span style={{ color: 'var(--color-success)' }}>
                {Number(debt.paid_amount).toLocaleString()} {debt.currency}
              </span>
              {' · '}
              <span style={{ color: 'var(--color-text-muted)' }}>{t('debtDetail.remaining')}: </span>
              {remaining.toLocaleString()} {debt.currency}
            </div>
          )}
          {debt.comment && (
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>{t('debtorForm.comment')}: </span>
              {debt.comment}
            </div>
          )}
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {debt.status === 'active' && (
              <Button
                variant="secondary"
                onClick={() => setShowPartial((v) => !v)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Coins size={15} />
                {t('clientDetail.partialPayment')}
              </Button>
            )}
            <Button onClick={() => setShowConfirm(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {debt.status === 'active' ? <CheckCircle2 size={15} /> : <RotateCcw size={15} />}
              {debt.status === 'active' ? t('clientDetail.markPaid') : t('clientDetail.markActive')}
            </Button>
          </div>
        )}

        {documentsModuleEnabled && (
          <Button
            variant="secondary"
            onClick={() => setShowPrint(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}
          >
            <Printer size={15} />
            {t('documents.printContractButton')}
          </Button>
        )}

        {showPartial && !readOnly && (
          <form onSubmit={handlePartialPayment} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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

        <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{t('debtDetail.paymentsHistory')}</h4>
        {!loading && payments.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
            {t('debtDetail.noPayments')}
          </div>
        )}
        <div style={{ display: 'grid', gap: 6 }}>
          {payments.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                background: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
              }}
            >
              <span>{new Date(p.paid_at).toLocaleString()}</span>
              <span className="amount">
                {Number(p.amount).toLocaleString()} {debt.currency}
              </span>
            </div>
          ))}
        </div>

        {showConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 170,
            }}
            onClick={() => setShowConfirm(false)}
          >
            <div className="card" style={{ maxWidth: 360, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: 10 }}>
                {debt.status === 'active' ? t('clientDetail.confirmMarkPaidTitle') : t('clientDetail.confirmMarkActiveTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
                {debt.status === 'active'
                  ? t('clientDetail.confirmMarkPaidText', { amount: Number(debt.amount).toLocaleString(), currency: debt.currency })
                  : t('clientDetail.confirmMarkActiveText', { amount: Number(debt.amount).toLocaleString(), currency: debt.currency })}
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                  {t('debtorForm.cancel')}
                </Button>
                <Button
                  onClick={async () => {
                    if (debt.status === 'active') await markFullyPaid();
                    else await markActive();
                    setShowConfirm(false);
                  }}
                >
                  {t('credit.confirmActionButton')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPrint && (
        <ContractPrintView
          type="debt"
          vars={{
            number: debt.debt_number != null ? String(debt.debt_number) : debt.id.slice(0, 8).toUpperCase(),
            city: localStorage.getItem('docCity') || '',
            date: new Date().toLocaleDateString(),
            amount: Number(debt.amount).toLocaleString(),
            currency: debt.currency,
            takenDate: new Date(debt.created_at).toLocaleDateString(),
            dueDate: debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '',
            comment: debt.comment ?? '',
            companyName: localStorage.getItem('docCompanyName') || '',
            companyDetails: localStorage.getItem('docCompanyDetails') || '',
          }}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
