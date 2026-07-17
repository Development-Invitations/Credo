import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BellRing, Phone, Copy, ShieldOff, Pencil, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { Input } from './Input';
import { DebtItem, DebtRow } from './DebtItem';
import { AddDebtModal } from './AddDebtModal';
import { RemindersModal } from './RemindersModal';
import { HelpTooltip } from './HelpTooltip';
import { EditDebtorModal } from './EditDebtorModal';

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
  const [showBlacklistPrompt, setShowBlacklistPrompt] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const callingEnabled = localStorage.getItem('callingEnabled') === 'true';

  // Локальная копия данных клиента — обновляется сразу после редактирования,
  // не дожидаясь перезагрузки списка у родителя.
  const [info, setInfo] = useState({
    full_name: clientName,
    phone: clientPhone,
    email: null as string | null,
    comment: null as string | null,
  });

  async function loadClientInfo() {
    const { data } = await supabase
      .from('debtors')
      .select('full_name, phone, email, comment')
      .eq('id', clientId)
      .maybeSingle();
    if (data) setInfo(data as any);
  }

  async function sendToBlacklist() {
    await supabase
      .from('debtors')
      .update({ is_blacklisted: true, blacklist_reason: blacklistReason || null, blacklisted_at: new Date().toISOString() })
      .eq('id', clientId);
    setShowBlacklistPrompt(false);
    onDebtsChanged();
    onClose();
  }

  async function load() {
    const { data } = await supabase
      .from('debts')
      .select('id, debt_number, amount, paid_amount, currency, due_date, status, comment, created_at')
      .eq('debtor_id', clientId)
      .order('created_at', { ascending: false });
    setDebts((data as any) ?? []);
    setLoading(false);
    onDebtsChanged();
  }

  useEffect(() => {
    load();
    loadClientInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <Drawer open onClose={onClose} title={info.full_name}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {info.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={14} />
              <span>{info.phone}</span>
              {callingEnabled && (
                <button
                  onClick={() => window.open(`tel:${info.phone!.replace(/\s/g, '')}`)}
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
                onClick={() => navigator.clipboard.writeText(info.phone!)}
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
          {info.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={14} />
              <span>{info.email}</span>
            </div>
          )}
          {info.comment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={14} />
              <span>{info.comment}</span>
            </div>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowEdit(true)}
            title={t('clientDetail.editTitle') ?? ''}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 8,
              flexShrink: 0,
            }}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

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
          <Button
            variant="secondary"
            onClick={() => setShowReminders(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <BellRing size={16} />
          </Button>
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

      {!readOnly && (
        <button
          onClick={() => setShowBlacklistPrompt(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 20,
            padding: 0,
          }}
        >
          <ShieldOff size={14} />
          {t('blacklist.sendButton')}
        </button>
      )}

      {showBlacklistPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
          }}
          onClick={() => setShowBlacklistPrompt(false)}
        >
          <div className="card" style={{ width: 360, boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>{t('blacklist.confirmTitle')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>{t('blacklist.confirmText')}</p>
            <Input
              placeholder={t('blacklist.reasonPlaceholder') ?? ''}
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowBlacklistPrompt(false)}>
                {t('debtorForm.cancel')}
              </Button>
              <Button
                onClick={sendToBlacklist}
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                {t('blacklist.confirmButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddDebt && (
        <AddDebtModal
          debtorId={clientId}
          defaultCurrency={defaultCurrency}
          onClose={() => setShowAddDebt(false)}
          onCreated={load}
        />
      )}

      {showReminders && (
        <RemindersModal debtorId={clientId} debtorName={info.full_name} onClose={() => setShowReminders(false)} />
      )}

      {showEdit && (
        <EditDebtorModal
          clientId={clientId}
          initialFullName={info.full_name}
          initialPhone={info.phone}
          initialEmail={info.email}
          initialComment={info.comment}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setInfo((prev) => ({ ...prev, ...updated }));
            onDebtsChanged();
          }}
        />
      )}
    </Drawer>
  );
}
