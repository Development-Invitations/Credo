import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, CheckCircle2, Circle, AlertTriangle, Undo2, Zap, Printer } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { Input } from './Input';
import { ContractPrintView } from './ContractPrintView';

export interface CreditPayment {
  id: string;
  due_date: string;
  expected_amount: number;
  paid_amount: number;
  is_confirmed: boolean;
}

export interface CreditEvent {
  id: string;
  description: string | null;
  created_at: string;
}

export interface CreditData {
  id: string;
  credit_number: number | null;
  debtor_name: string;
  account_number: string | null;
  principal_amount: number;
  currency: string;
  interest_type: string;
  interest_rate: number;
  term_months: number;
  payments: CreditPayment[];
  events: CreditEvent[];
}

interface Props {
  credit: CreditData;
  onChanged: () => void;
  hideDebtorName?: boolean;
}

type ConfirmAction =
  | { type: 'pay'; items: CreditPayment[] }
  | { type: 'undo'; item: CreditPayment }
  | { type: 'early'; items: CreditPayment[] };

export function CreditAccordionItem({ credit: c, onChanged, hideDebtorName }: Props) {
  const { t } = useTranslation();
  const { documentsModuleEnabled } = useApp();
  const [showPrint, setShowPrint] = useState(false);
  const [open, setOpen] = useState(false);
  const [periodCount, setPeriodCount] = useState('1');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [viewPayment, setViewPayment] = useState<CreditPayment | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...c.payments].sort((a, b) => a.due_date.localeCompare(b.due_date));
  const unconfirmed = sorted.filter((p) => !p.is_confirmed);
  const confirmed = sorted.filter((p) => p.is_confirmed);
  const paidCount = confirmed.length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = unconfirmed.length > 0 && unconfirmed[0].due_date < today;
  const lastConfirmed = confirmed[confirmed.length - 1] ?? null;

  const n = Math.max(1, Math.min(Number(periodCount) || 1, unconfirmed.length));

  async function logEvent(description: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('credit_events').insert({ credit_id: c.id, user_id: user.id, event_type: 'action', description });
  }

  async function executeConfirmAction() {
    if (!confirmAction) return;
    setBusy(true);

    if (confirmAction.type === 'pay' || confirmAction.type === 'early') {
      for (const item of confirmAction.items) {
        await supabase
          .from('credit_payments')
          .update({ is_confirmed: true, paid_amount: item.expected_amount, confirmed_at: new Date().toISOString() })
          .eq('id', item.id);
      }
      const total = confirmAction.items.reduce((s, i) => s + Number(i.expected_amount), 0);
      await logEvent(
        confirmAction.type === 'early'
          ? t('credit.eventEarlyRepayment', { count: confirmAction.items.length, amount: total, currency: c.currency })
          : t('credit.eventPaidBatch', { count: confirmAction.items.length, amount: total, currency: c.currency })
      );
    } else if (confirmAction.type === 'undo') {
      await supabase
        .from('credit_payments')
        .update({ is_confirmed: false, paid_amount: 0, confirmed_at: null })
        .eq('id', confirmAction.item.id);
      await logEvent(
        t('credit.eventUnconfirmed', {
          date: new Date(confirmAction.item.due_date).toLocaleDateString(),
          amount: confirmAction.item.expected_amount,
        })
      );
    }

    setBusy(false);
    setConfirmAction(null);
    onChanged();
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: overdue ? 'var(--color-danger)' : 'var(--color-border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text)',
          textAlign: 'left',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {!hideDebtorName && (
            <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {overdue && <AlertTriangle size={14} color="var(--color-danger)" />}
              {c.debtor_name}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            {hideDebtorName && overdue && <AlertTriangle size={14} color="var(--color-danger)" />}
            <span className="amount" style={{ fontSize: 15 }}>
              {Number(c.principal_amount).toLocaleString()} {c.currency}
            </span>
            <span style={{ fontSize: 12, color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {paidCount}/{c.payments.length}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {c.credit_number ? `№${c.credit_number} · ` : ''}
            {t(`credit.interest_${c.interest_type}`)}
            {c.interest_type !== 'none' ? ` · ${c.interest_rate}%` : ''} · {c.term_months} {t('credit.months')}
          </div>
        </div>
        <ChevronDown
          size={16}
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)' }}>
          {unconfirmed.length > 0 && (
            <div style={{ margin: '14px 0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('credit.periodLabel')}</span>
              <Input
                type="number"
                min="1"
                max={unconfirmed.length}
                value={periodCount}
                onChange={(e) => setPeriodCount(e.target.value)}
                style={{ width: 64 }}
              />
              <Button
                onClick={() => setConfirmAction({ type: 'pay', items: unconfirmed.slice(0, n) })}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle2 size={15} />
                {t('credit.payNext', { count: n })}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmAction({ type: 'early', items: unconfirmed })}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Zap size={15} />
                {t('credit.earlyRepayment')}
              </Button>
              {lastConfirmed && (
                <Button
                  variant="secondary"
                  onClick={() => setConfirmAction({ type: 'undo', item: lastConfirmed })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Undo2 size={15} />
                  {t('credit.undoLast')}
                </Button>
              )}
            </div>
          )}

          {documentsModuleEnabled && (
            <div style={{ margin: unconfirmed.length > 0 ? '0 0 14px' : '14px 0' }}>
              <Button
                variant="secondary"
                onClick={() => setShowPrint(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={15} />
                {t('documents.printContractButton')}
              </Button>
            </div>
          )}

          <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '12px 0 8px' }}>{t('credit.scheduleTitle')}</h4>
          <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
            {sorted.map((p) => {
              const isOverduePayment = !p.is_confirmed && p.due_date < today;
              return (
                <div
                  key={p.id}
                  onClick={() => setViewPayment(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-hover)',
                    opacity: p.is_confirmed ? 0.6 : 1,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.is_confirmed ? (
                      <CheckCircle2 size={16} color="var(--color-success)" />
                    ) : (
                      <Circle size={16} color={isOverduePayment ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
                    )}
                    <span style={{ fontSize: 13, color: isOverduePayment ? 'var(--color-danger)' : 'var(--color-text)' }}>
                      {new Date(p.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="amount" style={{ fontSize: 13 }}>
                    {Number(p.expected_amount).toLocaleString()} {c.currency}
                  </span>
                </div>
              );
            })}
          </div>

          {c.events.length > 0 && (
            <>
              <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '12px 0 8px' }}>{t('credit.eventsTitle')}</h4>
              <div style={{ display: 'grid', gap: 6 }}>
                {c.events.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text)',
                      background: 'var(--color-surface-hover)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                    }}
                  >
                    <div>{ev.description}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 2 }}>
                      {new Date(ev.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {viewPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 195,
          }}
          onClick={() => setViewPayment(null)}
        >
          <div className="card" style={{ maxWidth: 360, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>{t('credit.paymentDetailTitle')}</h3>
            <div className="card" style={{ background: 'var(--color-surface-hover)', display: 'grid', gap: 6, fontSize: 13, marginBottom: 16 }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('debtDetail.dueDate')}: </span>
                {new Date(viewPayment.due_date).toLocaleDateString()}
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.totalLabel')}: </span>
                <span className="amount">
                  {Number(viewPayment.expected_amount).toLocaleString()} {c.currency}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.statusLabel')}: </span>
                <span style={{ color: viewPayment.is_confirmed ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {viewPayment.is_confirmed ? t('credit.confirmedStatus') : t('credit.unconfirmedStatus')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setViewPayment(null)}>
                {t('debtorForm.cancel')}
              </Button>
              <Button
                onClick={() => {
                  const p = viewPayment;
                  setViewPayment(null);
                  setConfirmAction(p.is_confirmed ? { type: 'undo', item: p } : { type: 'pay', items: [p] });
                }}
              >
                {viewPayment.is_confirmed ? t('credit.undoLast') : t('credit.confirmActionButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => !busy && setConfirmAction(null)}
        >
          <div className="card" style={{ maxWidth: 380, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>
              {confirmAction.type === 'undo' ? t('credit.confirmUndoTitle') : t('credit.confirmPayTitle')}
            </h3>
            {confirmAction.type === 'undo' ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
                {t('credit.confirmUndoText', {
                  date: new Date(confirmAction.item.due_date).toLocaleDateString(),
                  amount: confirmAction.item.expected_amount,
                  currency: c.currency,
                })}
              </p>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>
                  {confirmAction.type === 'early' ? t('credit.confirmEarlyText') : t('credit.confirmPayText', { count: confirmAction.items.length })}
                </p>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', maxHeight: 120, overflowY: 'auto' }}>
                  {confirmAction.items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{new Date(it.due_date).toLocaleDateString()}</span>
                      <span className="amount">
                        {Number(it.expected_amount).toLocaleString()} {c.currency}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700, fontSize: 13 }}>
                  <span>{t('credit.totalLabel')}</span>
                  <span className="amount">
                    {confirmAction.items.reduce((s, i) => s + Number(i.expected_amount), 0).toLocaleString()} {c.currency}
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={busy}>
                {t('debtorForm.cancel')}
              </Button>
              <Button onClick={executeConfirmAction} disabled={busy}>
                {busy ? '...' : t('credit.confirmActionButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPrint && (
        <ContractPrintView
          type="credit"
          vars={{
            number: c.credit_number ?? c.id.slice(0, 8).toUpperCase(),
            city: localStorage.getItem('docCity') || '',
            date: new Date().toLocaleDateString(),
            amount: Number(c.principal_amount).toLocaleString(),
            currency: c.currency,
            takenDate: sorted[0] ? new Date(sorted[0].due_date).toLocaleDateString() : new Date().toLocaleDateString(),
            interestType: t(`credit.interest_${c.interest_type}`),
            rate: c.interest_type !== 'none' ? `${c.interest_rate}%` : '0%',
            term: `${c.term_months} ${t('credit.months')}`,
            monthlyPayment: sorted[0] ? Number(sorted[0].expected_amount).toLocaleString() : '',
            companyName: localStorage.getItem('docCompanyName') || '',
            companyDetails: localStorage.getItem('docCompanyDetails') || '',
          }}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
