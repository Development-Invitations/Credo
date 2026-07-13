import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { CreateCreditModal } from './CreateCreditModal';
import { AddCreditClientModal } from './AddCreditClientModal';
import { Button } from './Button';
import { Input } from './Input';

interface ClientOption {
  id: string;
  full_name: string;
}

export function useQuickCreateCredit(onCreated: () => void, defaultCurrency: string) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  async function reloadClients() {
    const { data } = await supabase
      .from('credit_clients')
      .select('id, full_name')
      .is('archived_at', null)
      .order('full_name', { ascending: true });
    setClients(data ?? []);
  }

  async function openPicker() {
    setSearch('');
    setShowPicker(true);
    await reloadClients();
  }

  const filtered = clients.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));

  const modals = (
    <>
      {showPicker && !selectedClient && !showAddClient && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 130,
          }}
          onClick={() => setShowPicker(false)}
        >
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: 380, boxShadow: 'var(--shadow-elevated)' }}>
            <h3 style={{ marginBottom: 12 }}>{t('credit.pickClientTitle')}</h3>
            <Button
              onClick={() => setShowAddClient(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}
            >
              <Plus size={15} />
              {t('credit.newClientButton')}
            </Button>
            <Input
              placeholder={t('dashboard.searchPlaceholder') ?? ''}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'grid', gap: 6 }}>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {c.full_name}
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  {t('credit.noClientsFound')}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setShowPicker(false)}>
                {t('debtorForm.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddClient && (
        <AddCreditClientModal
          onClose={() => setShowAddClient(false)}
          onCreated={(newId) => {
            setSelectedClient({ id: newId, full_name: '' });
          }}
        />
      )}

      {selectedClient && (
        <CreateCreditModal
          debtorId={selectedClient.id}
          defaultCurrency={defaultCurrency}
          onClose={() => {
            setSelectedClient(null);
            setShowAddClient(false);
            setShowPicker(false);
          }}
          onCreated={onCreated}
        />
      )}
    </>
  );

  return { openPicker, modals };
}
