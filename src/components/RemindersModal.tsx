import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { Button } from './Button';
import { Input } from './Input';
import { ReminderItem } from './ReminderItem';

interface Reminder {
  id: string;
  remind_at: string;
  message: string | null;
  is_done: boolean;
}

interface Props {
  debtorId: string;
  debtorName: string;
  onClose: () => void;
}

export function RemindersModal({ debtorId, debtorName, onClose }: Props) {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindAt, setRemindAt] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from('reminders')
      .select('id, remind_at, message, is_done')
      .eq('debtor_id', debtorId)
      .order('remind_at', { ascending: true });
    setReminders(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debtorId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!remindAt) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('reminders').insert({
      debtor_id: debtorId,
      user_id: user.id,
      remind_at: new Date(remindAt).toISOString(),
      message: message || null,
    });

    setRemindAt('');
    setMessage('');
    load();
  }

  return (
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
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 460, maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 4 }}>{t('reminders.title')}</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: 13 }}>{debtorName}</p>

        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
          <Input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
          />
          <Input
            placeholder={t('reminders.message') ?? ''}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" style={{ justifySelf: 'start' }}>
            {t('reminders.addReminder')}
          </Button>
        </form>

        {!loading && reminders.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
            {t('reminders.noReminders')}
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          {reminders.map((r) => (
            <ReminderItem
              key={r.id}
              id={r.id}
              remindAt={r.remind_at}
              message={r.message}
              isDone={r.is_done}
              onChanged={load}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
