import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArchiveRestore } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { ClientDetailDrawer } from '../../components/ClientDetailDrawer';
import { CreditClientDetailDrawer } from '../../components/CreditClientDetailDrawer';
import { HelpTooltip } from '../../components/HelpTooltip';

interface Client {
  id: string;
  full_name: string;
  phone: string | null;
}

type ArchiveTab = 'debtors' | 'creditClients';

export function ArchivePage() {
  const { t } = useTranslation();
  const { currency } = useApp();
  const [tab, setTab] = useState<ArchiveTab>('debtors');

  const [debtors, setDebtors] = useState<Client[]>([]);
  const [creditClients, setCreditClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailDebtor, setDetailDebtor] = useState<Client | null>(null);
  const [detailCreditClient, setDetailCreditClient] = useState<Client | null>(null);

  async function loadDebtors() {
    const { data } = await supabase
      .from('debtors')
      .select('id, full_name, phone')
      .not('archived_at', 'is', null)
      .order('created_at', { ascending: false });
    setDebtors(data ?? []);
  }

  async function loadCreditClients() {
    const { data } = await supabase
      .from('credit_clients')
      .select('id, full_name, phone')
      .not('archived_at', 'is', null)
      .order('created_at', { ascending: false });
    setCreditClients(data ?? []);
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadDebtors(), loadCreditClients()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function restoreDebtor(id: string) {
    await supabase.from('debtors').update({ archived_at: null }).eq('id', id);
    setDetailDebtor(null);
    loadDebtors();
  }

  async function restoreCreditClient(id: string) {
    await supabase.from('credit_clients').update({ archived_at: null }).eq('id', id);
    setDetailCreditClient(null);
    loadCreditClients();
  }

  const list = tab === 'debtors' ? debtors : creditClients;

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.archive')}
        <HelpTooltip text={t('help.archive')} />
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>{t('archive.explainer')}</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button
          onClick={() => setTab('debtors')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: tab === 'debtors' ? 'var(--color-accent)' : 'transparent',
            color: tab === 'debtors' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {t('archive.tabDebtors')} ({debtors.length})
        </button>
        <button
          onClick={() => setTab('creditClients')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: tab === 'creditClients' ? 'var(--color-accent)' : 'transparent',
            color: tab === 'creditClients' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {t('archive.tabCreditClients')} ({creditClients.length})
        </button>
      </div>

      {!loading && list.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('archive.empty')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {list.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.75, cursor: 'pointer' }}
            onClick={() => (tab === 'debtors' ? setDetailDebtor(c) : setDetailCreditClient(c))}
          >
            <div>
              <div>{c.full_name}</div>
              {c.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.phone}</div>}
            </div>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                if (tab === 'debtors') restoreDebtor(c.id);
                else restoreCreditClient(c.id);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArchiveRestore size={15} />
              {t('archive.restore')}
            </Button>
          </div>
        ))}
      </div>

      {detailDebtor && (
        <ClientDetailDrawer
          clientId={detailDebtor.id}
          clientName={detailDebtor.full_name}
          clientPhone={detailDebtor.phone}
          defaultCurrency={currency}
          readOnly
          onClose={() => setDetailDebtor(null)}
          onDebtsChanged={() => {}}
        />
      )}

      {detailCreditClient && (
        <CreditClientDetailDrawer
          clientId={detailCreditClient.id}
          onClose={() => setDetailCreditClient(null)}
          onChanged={() => {}}
        />
      )}
    </div>
  );
}
