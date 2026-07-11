import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface PaymentRow {
  amount: number;
  paid_at: string;
}

export interface DebtWithPayments {
  id: string;
  amount: number;
  paid_amount: number;
  currency: string;
  due_date: string | null;
  status: 'active' | 'paid';
  comment: string | null;
  created_at: string;
  payments: PaymentRow[];
}

export interface ReminderRow {
  id: string;
  remind_at: string;
  message: string | null;
  is_done: boolean;
}

interface Props {
  clientName: string;
  archived: boolean;
  debts: DebtWithPayments[];
  reminders: ReminderRow[];
}

function overdueInfo(debt: DebtWithPayments, t: (k: string) => string) {
  if (!debt.due_date) return null;
  const due = new Date(debt.due_date);
  const remaining = Math.max(Number(debt.amount) - Number(debt.paid_amount || 0), 0);

  if (debt.status === 'active' && remaining > 0 && due < new Date(new Date().toDateString())) {
    return { late: true, text: t('report.currentlyOverdue') };
  }
  if (debt.status === 'paid' && debt.payments.length > 0) {
    const lastPaid = debt.payments.reduce((max, p) => (new Date(p.paid_at) > new Date(max) ? p.paid_at : max), debt.payments[0].paid_at);
    if (new Date(lastPaid) > due) {
      return { late: true, text: t('report.paidLate') };
    }
  }
  return { late: false, text: t('report.onTime') };
}

export function ClientReportRow({ clientName, archived, debts, reminders }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const hasCurrentOverdue = debts.some((d) => {
    const remaining = Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
    return d.status === 'active' && remaining > 0 && !!d.due_date && new Date(d.due_date) < new Date(new Date().toDateString());
  });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderColor: hasCurrentOverdue ? 'var(--color-danger)' : 'var(--color-border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text)',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasCurrentOverdue && <AlertTriangle size={14} color="var(--color-danger)" />}
          {clientName}
          {archived && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '1px 8px' }}>
              {t('sidebar.archive')}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12 }}>
          {t('report.debtsCount', { count: debts.length })}
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)' }}>
          {debts.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '12px 0' }}>{t('clientDetail.noDebts')}</div>
          )}

          {debts.map((d) => {
            const info = overdueInfo(d, t);
            const remaining = Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
            return (
              <div key={d.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="amount" style={{ fontSize: 14 }}>
                    {Number(d.amount).toLocaleString()} {d.currency}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: d.status === 'paid' ? 'var(--color-success)' : 'var(--color-accent)',
                      color: '#fff',
                    }}
                  >
                    {d.status === 'paid' ? t('dashboard.statusPaid') : t('dashboard.statusActive')}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  {t('report.dueDateLabel')}: {d.due_date ? new Date(d.due_date).toLocaleDateString() : '—'}
                  {' · '}
                  {t('report.remainingLabel')}: {remaining.toLocaleString()} {d.currency}
                  {d.comment ? ` · ${d.comment}` : ''}
                </div>

                {info && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6, color: info.late ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {info.late ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                    {info.text}
                  </div>
                )}

                {d.payments.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    <div style={{ marginBottom: 2 }}>{t('report.paymentsLabel')}:</div>
                    {d.payments.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 8 }}>
                        <span>{new Date(p.paid_at).toLocaleString()}</span>
                        <span className="amount">
                          {Number(p.amount).toLocaleString()} {d.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {reminders.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{t('report.remindersLabel')}:</div>
              {reminders.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingLeft: 8, marginBottom: 2 }}>
                  <span style={{ color: r.is_done ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
                    {new Date(r.remind_at).toLocaleString()}
                    {r.message ? ` — ${r.message}` : ''}
                  </span>
                  <span style={{ color: r.is_done ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {r.is_done ? t('report.reminderDone') : t('report.reminderPending')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
