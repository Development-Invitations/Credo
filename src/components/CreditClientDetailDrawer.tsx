import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Copy, Landmark } from 'lucide-react';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { supabase } from '../lib/supabaseClient';
import { CreditAccordionItem, CreditData } from './CreditAccordionItem';
import { CreateCreditModal } from './CreateCreditModal';
import { useApp } from '../context/AppContext';

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
  const { currency } = useApp();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCredit, setShowCreateCredit] = useState(false);
  const callingEnabled = localStorage.getItem('callingEnabled') === 'true';

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
      <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 8, fontSize: 13 }}>
        {client?.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{client.phone}</span>
            {callingEnabled && (
              <button
                onClick={() => window.open(`tel:${client.phone!.replace(/\s/g, '')}`)}
                title={t('clientDetail.call') ?? ''}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Phone size={14} />
              </button>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(client.phone!)}
              title={t('clientDetail.copyPhone') ?? ''}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Copy size={14} />
            </button>
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

      <Button
        onClick={() => setShowCreateCredit(true)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}
      >
        <Landmark size={16} />
        {t('credit.createButton')}
      </Button>

      <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--color-text-muted)' }}>{t('credit.creditsHistory')}</h3>

      {!loading && credits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
          {t('credit.noCredits')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {credits.map((c) => (
          <CreditAccordionItem key={c.id} credit={c} onChanged={load} hideDebtorName />
        ))}
      </div>

      {showCreateCredit && (
        <CreateCreditModal
          debtorId={clientId}
          defaultCurrency={currency}
          onClose={() => setShowCreateCredit(false)}
          onCreated={load}
        />
      )}
    </Drawer>
  );
}
