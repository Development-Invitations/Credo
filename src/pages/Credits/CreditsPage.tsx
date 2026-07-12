import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { HelpTooltip } from '../../components/HelpTooltip';
import { CreditAccordionItem, CreditData } from '../../components/CreditAccordionItem';

export function CreditsPage() {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: creditsData } = await supabase
      .from('credits')
      .select('id, account_number, principal_amount, currency, interest_type, interest_rate, term_months, status, debtors(full_name)')
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
        .select('id, credit_id, description, created_at')
        .in('credit_id', ids)
        .order('created_at', { ascending: false });
      eventsData = eData ?? [];
    }

    const paymentsByCredit: Record<string, any[]> = {};
    for (const p of paymentsData) (paymentsByCredit[p.credit_id] ??= []).push(p);
    const eventsByCredit: Record<string, any[]> = {};
    for (const e of eventsData) (eventsByCredit[e.credit_id] ??= []).push(e);

    setCredits(
      (creditsData ?? []).map((c: any) => ({
        id: c.id,
        debtor_name: c.debtors?.full_name ?? '',
        account_number: c.account_number,
        principal_amount: c.principal_amount,
        currency: c.currency,
        interest_type: c.interest_type,
        interest_rate: c.interest_rate,
        term_months: c.term_months,
        payments: paymentsByCredit[c.id] ?? [],
        events: eventsByCredit[c.id] ?? [],
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
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
        {credits.map((c) => (
          <CreditAccordionItem key={c.id} credit={c} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
