import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { HelpTooltip } from '../../components/HelpTooltip';

interface CreditPayment {
  id: string;
  due_date: string;
  expected_amount: number;
  paid_amount: number;
  is_confirmed: boolean;
}

interface CreditEvent {
  id: string;
  event_type: string;
  description: string | null;
  created_at: string;
}

interface CreditRow {
  id: string;
  debtor_name: string;
  principal_amount: number;
  currency: string;
  interest_type: string;
  interest_rate: number;
  term_months: number;
  status: string;
  payments: CreditPayment[];
  events: CreditEvent[];
}

export function CreditsPage() {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const { data: creditsData } = await supabase
      .from('credits')
      .select('id, principal_amount, currency, interest_type, interest_rate, term_months, status, debtors(full_name)')
      .order('created_at', { ascending: false });

    const ids = (creditsData ?? []).map((c: any) => c.id);
    let paymentsData: any[] = [];
    let eventsData: any[] = [];
    if (ids.length > 0) {
      const { data: pData } = await supabase
        .from('credit_payments')
        .select('id, credit_id, due_date, expected_amount, paid_amount, is_confirmed')
        .in('credit_id', ids)
        .order('due_date', { ascending: true });
      paymentsData = pData ?? [];

      const { data: eData } = await supabase
        .from('credit_events')
        .select('id, credit_id, event_type, description, created_at')
        .in('credit_id', ids)
        .order('created_at', { ascending: false });
      eventsData = eData ?? [];
    }

    const paymentsByCredit: Record<string, CreditPayment[]> = {};
    for (const p of paymentsData) (paymentsByCredit[p.credit_id] ??= []).push(p);
    const eventsByCredit: Record<string, CreditEvent[]> = {};
    for (const e of eventsData) (eventsByCredit[e.credit_id] ??= []).push(e);

    setCredits(
      (creditsData ?? []).map((c: any) => ({
        id: c.id,
        debtor_name: c.debtors?.full_name ?? '',
        principal_amount: c.principal_amount,
        currency: c.currency,
        interest_type: c.interest_type,
        interest_rate: c.interest_rate,
        term_months: c.term_months,
        status: c.status,
        payments: paymentsByCredit[c.id] ?? [],
        events: eventsByCredit[c.id] ?? [],
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmPayment(payment: CreditPayment, creditId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('credit_payments')
      .update({
        is_confirmed: !payment.is_confirmed,
        paid_amount: !payment.is_confirmed ? payment.expected_amount : 0,
        confirmed_at: !payment.is_confirmed ? new Date().toISOString() : null,
      })
      .eq('id', payment.id);

    await supabase.from('credit_events').insert({
      credit_id: creditId,
      user_id: user.id,
      event_type: payment.is_confirmed ? 'payment_unconfirmed' : 'payment_confirmed',
      description: t(payment.is_confirmed ? 'credit.eventUnconfirmed' : 'credit.eventConfirmed', {
        date: new Date(payment.due_date).toLocaleDateString(),
        amount: payment.expected_amount,
      }),
    });

    load();
  }

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.credits')}
        <HelpTooltip text={t('help.credits')} />
      </h1>

      {!loading && credits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('credit.noCredits')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {credits.map((c) => {
          const paidCount = c.payments.filter((p) => p.is_confirmed).length;
          const open = openId === c.id;
          return (
            <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenId(open ? null : c.id)}
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
                  <div style={{ marginBottom: 4 }}>{c.debtor_name}</div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {t(`credit.interest_${c.interest_type}`)}
                    {c.interest_type !== 'none' ? ` · ${c.interest_rate}%` : ''} · {c.term_months} {t('credit.months')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="amount" style={{ fontSize: 14 }}>
                    {Number(c.principal_amount).toLocaleString()} {c.currency}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {paidCount}/{c.payments.length}
                  </span>
                  <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </div>
              </button>

              {open && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '12px 0 8px' }}>{t('credit.scheduleTitle')}</h4>
                  <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
                    {c.payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => confirmPayment(p, c.id)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-hover)',
                          cursor: 'pointer',
                          opacity: p.is_confirmed ? 0.65 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {p.is_confirmed ? (
                            <CheckCircle2 size={16} color="var(--color-success)" />
                          ) : (
                            <Circle size={16} color="var(--color-text-muted)" />
                          )}
                          <span style={{ fontSize: 13 }}>{new Date(p.due_date).toLocaleDateString()}</span>
                        </div>
                        <span className="amount" style={{ fontSize: 13 }}>
                          {Number(p.expected_amount).toLocaleString()} {c.currency}
                        </span>
                      </div>
                    ))}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
