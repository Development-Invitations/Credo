import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { ReminderItem } from '../../components/ReminderItem';

interface ReminderRow {
  id: string;
  remind_at: string;
  message: string | null;
  is_done: boolean;
  debtor_id: string;
  debtors: { full_name: string } | null;
}

export function RemindersPage() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('reminders')
      .select('id, remind_at, message, is_done, debtor_id, debtors(full_name)')
      .order('remind_at', { ascending: true });
    setReminders((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>{t('sidebar.reminders')}</h1>
        <button
          onClick={() => setShowHelp((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            padding: '6px 12px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Info size={15} />
          {t('reminders.howItWorks')}
        </button>
      </div>

      {showHelp && (
        <div className="card" style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: 8 }}>{t('reminders.helpP1')}</p>
          <p style={{ marginBottom: 8 }}>{t('reminders.helpP2')}</p>
          <p>{t('reminders.helpP3')}</p>
        </div>
      )}

      {!loading && reminders.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('reminders.noReminders')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {reminders.map((r) => (
          <ReminderItem
            key={r.id}
            id={r.id}
            remindAt={r.remind_at}
            message={r.message}
            isDone={r.is_done}
            debtorName={r.debtors?.full_name}
            onChanged={load}
          />
        ))}
      </div>
    </div>
  );
}
