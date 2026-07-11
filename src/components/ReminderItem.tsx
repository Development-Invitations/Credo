import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Button } from './Button';

interface Props {
  id: string;
  remindAt: string;
  message: string | null;
  isDone: boolean;
  debtorName?: string;
  onChanged: () => void;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReminderItem({ id, remindAt, message, isDone, debtorName, onChanged }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [editRemindAt, setEditRemindAt] = useState(toLocalInputValue(remindAt));
  const [editMessage, setEditMessage] = useState(message ?? '');

  const isOverdue = !isDone && new Date(remindAt).getTime() < Date.now();

  async function toggleDone() {
    await supabase.from('reminders').update({ is_done: !isDone }).eq('id', id);
    onChanged();
  }

  async function saveEdit() {
    await supabase
      .from('reminders')
      .update({ remind_at: new Date(editRemindAt).toISOString(), message: editMessage || null })
      .eq('id', id);
    setEditing(false);
    onChanged();
  }

  async function handleDelete() {
    if (!window.confirm(t('reminders.confirmDelete') ?? '')) return;
    await supabase.from('reminders').delete().eq('id', id);
    onChanged();
  }

  if (editing) {
    return (
      <div className="card" style={{ display: 'grid', gap: 8 }}>
        <Input type="datetime-local" value={editRemindAt} onChange={(e) => setEditRemindAt(e.target.value)} />
        <Input value={editMessage} onChange={(e) => setEditMessage(e.target.value)} placeholder={t('reminders.message') ?? ''} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            {t('debtorForm.cancel')}
          </Button>
          <Button onClick={saveEdit}>{t('reminders.save')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isDone ? 0.55 : 1,
        borderColor: isOverdue ? 'var(--color-danger)' : 'var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Checkbox checked={isDone} onChange={toggleDone} />
        <div>
          {debtorName && <div style={{ fontSize: 13 }}>{debtorName}</div>}
          <div style={{ fontSize: 12, color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            {new Date(remindAt).toLocaleString()}
            {message ? ` — ${message}` : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        <IconBtn onClick={() => setEditing(true)}>
          <Pencil size={15} />
        </IconBtn>
        <IconBtn onClick={handleDelete} danger>
          <Trash2 size={15} />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? 'var(--color-danger)' : 'var(--color-text-muted)',
        padding: 6,
        display: 'flex',
      }}
    >
      {children}
    </button>
  );
}
