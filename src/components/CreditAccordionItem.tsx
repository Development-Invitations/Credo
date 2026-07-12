import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, CheckCircle2, Circle, AlertTriangle, Undo2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './Button';
import { Input } from './Input';

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
}

type ConfirmAction =
  | { type: 'pay'; items: CreditPayment[] }
  | { type: 'undo'; item: CreditPayment }
  | { type: 'early'; items: CreditPayment[] };

export function CreditAccordionItem({ credit: c, onChanged }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [periodCount, setPeriodCount] = useState('1');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
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
        }}
      >
        <div>
          <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {overdue && <AlertTriangle size={14} color="var(--color-danger)" />}
            {c.debtor_name}
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {c.account_number ? `${c.account_number} · ` : ''}
            {t(`credit.interest_${c.interest_type}`)}
            {c.interest_type !== 'none' ? ` · ${c.interest_rate}%` : ''} · {c.term_months} {t('credit.months')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="amount" style={{ fontSize: 14 }}>
            {Number(c.principal_amount).toLocaleString()} {c.currency}
          </span>
          <span style={{ fontSize: 12, color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            {paidCount}/{c.payments.length}
          </span>
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </div>
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

          <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '12px 0 8px' }}>{t('credit.scheduleTitle')}</h4>
          <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
            {sorted.map((p) => {
              const isOverduePayment = !p.is_confirmed && p.due_date < today;
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-hover)',
                    opacity: p.is_confirmed ? 0.6 : 1,
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
              <div style={{ display: 'grid', gap: 4 }}>
                {c.events.map((ev) => (
                  <div key={ev.id} style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ev.description}</span>
                    <span>{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
    </div>
  );
}
