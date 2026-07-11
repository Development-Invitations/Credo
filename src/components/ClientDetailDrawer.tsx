import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BellRing } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { DebtItem, DebtRow } from './DebtItem';
import { AddDebtModal } from './AddDebtModal';
import { RemindersModal } from './RemindersModal';

interface Props {
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  defaultCurrency: string;
  readOnly?: boolean;
  onClose: () => void;
  onDebtsChanged: () => void;
}

export function ClientDetailDrawer({ clientId, clientName, clientPhone, defaultCurrency, readOnly, onClose, onDebtsChanged }: Props) {
  const { t } = useTranslation();
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('debts')
      .select('id, amount, paid_amount, currency, due_date, status, comment, created_at')
      .eq('debtor_id', clientId)
      .order('created_at', { ascending: false });
    setDebts((data as any) ?? []);
    setLoading(false);
    onDebtsChanged();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <Drawer open onClose={onClose} title={clientName}>
      {clientPhone && <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>{clientPhone}</div>}

      {readOnly && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            marginBottom: 16,
          }}
        >
          {t('archive.readOnlyNotice')}
        </div>
      )}

      {!readOnly && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Button onClick={() => setShowAddDebt(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={16} />
            {t('clientDetail.addDebt')}
          </Button>
          <Button variant="secondary" onClick={() => setShowReminders(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BellRing size={16} />
          </Button>
        </div>
      )}

      <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--color-text-muted)' }}>{t('clientDetail.debtsHistory')}</h3>

      {!loading && debts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
          {t('clientDetail.noDebts')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {debts.map((d) => (
          <DebtItem key={d.id} debt={d} clientId={clientId} onChanged={load} readOnly={readOnly} />
        ))}
      </div>

      {showAddDebt && (
        <AddDebtModal
          debtorId={clientId}
          defaultCurrency={defaultCurrency}
          onClose={() => setShowAddDebt(false)}
          onCreated={load}
        />
      )}

      {showReminders && (
        <RemindersModal debtorId={clientId} debtorName={clientName} onClose={() => setShowReminders(false)} />
      )}
    </Drawer>
  );
}
