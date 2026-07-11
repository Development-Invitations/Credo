import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useUI } from '../context/UIContext';

interface Props {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: Props) {
  const { t } = useTranslation();
  const { overdueDebtors, dueReminders, requestOpenReminders, refreshNotifications } = useUI();

  const isEmpty = overdueDebtors.length === 0 && dueReminders.length === 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 340,
        maxHeight: 420,
        overflowY: 'auto',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        zIndex: 60,
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{t('notifications.title')}</span>
        <button
          onClick={refreshNotifications}
          title={t('notifications.refresh') ?? ''}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {isEmpty && (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          {t('notifications.empty')}
        </div>
      )}

      {overdueDebtors.map((d) => (
        <div
          key={`overdue-${d.id}`}
          onClick={() => {
            requestOpenReminders(d.debtorId);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 6px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <AlertTriangle size={16} color="var(--color-danger)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13 }}>
            <div>{d.full_name}</div>
            <div style={{ color: 'var(--color-danger)', fontSize: 12 }}>
              {t('notifications.overdueSince', { date: d.due_date ? new Date(d.due_date).toLocaleDateString() : '' })}
            </div>
          </div>
        </div>
      ))}

      {dueReminders.map((r) => (
        <div
          key={`reminder-${r.id}`}
          onClick={() => {
            requestOpenReminders(r.debtor_id);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 6px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Clock size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13 }}>
            <div>{r.debtor_name}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {r.message || t('notifications.reminderDue')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
