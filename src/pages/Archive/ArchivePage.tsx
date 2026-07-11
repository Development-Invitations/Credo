import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArchiveRestore } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { ClientDetailDrawer } from '../../components/ClientDetailDrawer';

interface Client {
  id: string;
  full_name: string;
  phone: string | null;
}

export function ArchivePage() {
  const { t } = useTranslation();
  const { currency } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  async function load() {
    const { data } = await supabase
      .from('debtors')
      .select('id, full_name, phone')
      .not('archived_at', 'is', null)
      .order('created_at', { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function restore(id: string) {
    await supabase.from('debtors').update({ archived_at: null }).eq('id', id);
    setDetailClient(null);
    load();
  }

  return (
    <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 8 }}>{t('sidebar.archive')}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>{t('archive.explainer')}</p>

      {!loading && clients.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('archive.empty')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {clients.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.75, cursor: 'pointer' }}
            onClick={() => setDetailClient(c)}
          >
            <div>
              <div>{c.full_name}</div>
              {c.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.phone}</div>}
            </div>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                restore(c.id);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArchiveRestore size={15} />
              {t('archive.restore')}
            </Button>
          </div>
        ))}
      </div>

      {detailClient && (
        <ClientDetailDrawer
          clientId={detailClient.id}
          clientName={detailClient.full_name}
          clientPhone={detailClient.phone}
          defaultCurrency={currency}
          readOnly
          onClose={() => setDetailClient(null)}
          onDebtsChanged={() => {}}
        />
      )}
    </div>
  );
}
