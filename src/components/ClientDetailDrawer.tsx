import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, BellRing, Phone, Copy, Landmark, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { DebtItem, DebtRow } from './DebtItem';
import { AddDebtModal } from './AddDebtModal';
import { CreateCreditModal } from './CreateCreditModal';
import { RemindersModal } from './RemindersModal';
import { HelpTooltip } from './HelpTooltip';
import { useApp } from '../context/AppContext';

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
  const navigate = useNavigate();
  const { creditModuleEnabled } = useApp();
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [credits, setCredits] = useState<{ id: string; account_number: string | null; principal_amount: number; currency: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showCreateCredit, setShowCreateCredit] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const callingEnabled = localStorage.getItem('callingEnabled') === 'true';

  async function loadCredits() {
    if (!creditModuleEnabled) return;
    const { data } = await supabase
      .from('credits')
      .select('id, account_number, principal_amount, currency, status')
      .eq('debtor_id', clientId)
      .order('created_at', { ascending: false });
    setCredits(data ?? []);
  }

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
    loadCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <Drawer open onClose={onClose} title={clientName}>
      {clientPhone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
          <span>{clientPhone}</span>
          {callingEnabled && (
            <button
              onClick={() => window.open(`tel:${clientPhone.replace(/\s/g, '')}`)}
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
            onClick={() => navigator.clipboard.writeText(clientPhone)}
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
        <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
          <Button onClick={() => setShowAddDebt(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={16} />
            {t('clientDetail.addDebt')}
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            {creditModuleEnabled && (
              <Button
                variant="secondary"
                onClick={() => setShowCreateCredit(true)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <Landmark size={16} />
                {t('credit.createButton')}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowReminders(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: creditModuleEnabled ? 44 : undefined, flex: creditModuleEnabled ? undefined : 1 }}
            >
              <BellRing size={16} />
            </Button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {t('clientDetail.debtsHistory')}
        <HelpTooltip text={t('help.clientDetail')} width={220} />
      </h3>

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

      {creditModuleEnabled && credits.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, marginTop: 20, marginBottom: 10, color: 'var(--color-text-muted)' }}>
            {t('sidebar.credits')}
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {credits.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate('/credits')}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <div className="amount" style={{ fontSize: 13 }}>
                    {Number(c.principal_amount).toLocaleString()} {c.currency}
                  </div>
                  {c.account_number && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.account_number}</div>
                  )}
                </div>
                <ArrowRight size={15} color="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </>
      )}

      {showAddDebt && (
        <AddDebtModal
          debtorId={clientId}
          defaultCurrency={defaultCurrency}
          onClose={() => setShowAddDebt(false)}
          onCreated={load}
        />
      )}

      {showCreateCredit && (
        <CreateCreditModal
          debtorId={clientId}
          defaultCurrency={defaultCurrency}
          onClose={() => setShowCreateCredit(false)}
          onCreated={loadCredits}
        />
      )}

      {showReminders && (
        <RemindersModal debtorId={clientId} debtorName={clientName} onClose={() => setShowReminders(false)} />
      )}
    </Drawer>
  );
}
