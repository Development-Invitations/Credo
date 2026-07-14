import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from './Drawer';
import { supabase } from '../lib/supabaseClient';
import { CreditAccordionItem, CreditData } from './CreditAccordionItem';

interface ClientInfo {
  full_name: string;
  phone: string | null;
  email: string | null;
  passport_data: string | null;
  address: string | null;
}

interface Props {
  clientId: string;
  onClose: () => void;
  onChanged: () => void;
}

export function CreditClientDetailDrawer({ clientId, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: clientData } = await supabase
      .from('credit_clients')
      .select('full_name, phone, email, passport_data, address')
      .eq('id', clientId)
      .maybeSingle();
    setClient(clientData ?? null);

    const { data: creditsData } = await supabase
      .from('credits')
      .select('id, credit_number, account_number, principal_amount, currency, interest_type, interest_rate, term_months')
      .eq('debtor_id', clientId)
      .order('created_at', { ascending: false });

    const creditIds = (creditsData ?? []).map((c) => c.id);
    let paymentsData: any[] = [];
    let eventsData: any[] = [];
    if (creditIds.length > 0) {
      const { data: pData } = await supabase
        .from('credit_payments')
        .select('id, credit_id, due_date, expected_amount, paid_amount, is_confirmed')
        .in('credit_id', creditIds)
        .order('due_date', { ascending: true });
      paymentsData = pData ?? [];

      const { data: eData } = await supabase
        .from('credit_events')
        .select('id, credit_id, description, created_at')
        .in('credit_id', creditIds)
        .order('created_at', { ascending: false });
      eventsData = eData ?? [];
    }

    const paymentsByCredit: Record<string, any[]> = {};
    for (const p of paymentsData) (paymentsByCredit[p.credit_id] ??= []).push(p);
    const eventsByCredit: Record<string, any[]> = {};
    for (const e of eventsData) (eventsByCredit[e.credit_id] ??= []).push(e);

    setCredits(
      (creditsData ?? []).map((c) => ({
        ...c,
        debtor_name: clientData?.full_name ?? '',
        payments: paymentsByCredit[c.id] ?? [],
        events: eventsByCredit[c.id] ?? [],
      }))
    );
    setLoading(false);
    onChanged();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <Drawer open onClose={onClose} title={client?.full_name ?? ''}>
      <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 6, fontSize: 13 }}>
        {client?.phone && (
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('debtorForm.phone')}: </span>
            {client.phone}
          </div>
        )}
        {client?.email && (
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('debtorForm.email')}: </span>
            {client.email}
          </div>
        )}
        {client?.passport_data && (
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.passportData')}: </span>
            {client.passport_data}
          </div>
        )}
        {client?.address && (
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('credit.address')}: </span>
            {client.address}
          </div>
        )}
        {!client?.phone && !client?.email && !client?.passport_data && !client?.address && (
          <div style={{ color: 'var(--color-text-muted)' }}>{t('credit.noExtraData')}</div>
        )}
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--color-text-muted)' }}>{t('credit.creditsHistory')}</h3>

      {!loading && credits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
          {t('credit.noCredits')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {credits.map((c) => (
          <CreditAccordionItem key={c.id} credit={c} onChanged={load} />
        ))}
      </div>
    </Drawer>
  );
}
