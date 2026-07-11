import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { playNotificationSound } from '../lib/sound';
import { useAppVersion } from '../hooks/useAppVersion';

export interface OverdueDebtor {
  id: string; // id записи долга (для ключа списка)
  debtorId: string; // id клиента (для открытия его напоминаний)
  full_name: string;
  amount: number; // остаток к оплате
  currency: string;
  due_date: string | null;
}

export interface DueReminder {
  id: string;
  debtor_id: string;
  debtor_name: string;
  remind_at: string;
  message: string | null;
}

interface UIContextValue {
  openRemindersDebtorId: string | null;
  requestOpenReminders: (debtorId: string) => void;
  clearOpenReminders: () => void;

  overdueDebtors: OverdueDebtor[];
  dueReminders: DueReminder[];
  notificationsCount: number;
  refreshNotifications: () => void;
  notificationsError: string | null;

  currentVersion: string;
  latestVersion: { version: string; download_url: string; release_notes: string | null } | null;
  updateAvailable: boolean;
  hasUnseenUpdate: boolean;
  markUpdateSeen: () => void;

  changelogRequested: boolean;
  requestChangelog: () => void;
  clearChangelogRequest: () => void;

  downloadStatus: 'idle' | 'downloading' | 'downloaded' | 'error';
  downloadProgress: number;
  downloadError: string | null;
  startDownload: () => void;
  installNow: () => void;
  dismissDownload: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

const FALLBACK_POLL_MS = 20000;

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [openRemindersDebtorId, setOpenRemindersDebtorId] = useState<string | null>(null);
  const [overdueDebtors, setOverdueDebtors] = useState<OverdueDebtor[]>([]);
  const [dueReminders, setDueReminders] = useState<DueReminder[]>([]);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const prevCountRef = useRef(0);
  const firstRunRef = useRef(true);
  const preciseTimerRef = useRef<number | null>(null);

  const { currentVersion, latestVersion, updateAvailable } = useAppVersion();
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(localStorage.getItem('lastSeenVersion'));
  const hasUnseenUpdate = updateAvailable && !!latestVersion && latestVersion.version !== lastSeenVersion;
  const markUpdateSeen = useCallback(() => {
    if (latestVersion) {
      localStorage.setItem('lastSeenVersion', latestVersion.version);
      setLastSeenVersion(latestVersion.version);
    }
  }, [latestVersion]);

  const [changelogRequested, setChangelogRequested] = useState(false);

  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    window.electronAPI?.onUpdateProgress?.((percent) => setDownloadProgress(Math.round(percent)));
    window.electronAPI?.onUpdateDownloaded?.(() => setDownloadStatus('downloaded'));
    window.electronAPI?.onUpdateError?.((message) => {
      setDownloadStatus('error');
      setDownloadError(message);
    });
  }, []);

  const startDownload = useCallback(async () => {
    if (!window.electronAPI?.downloadUpdate) {
      // Не в Electron (например веб-версия для разработки) — просто открываем ссылку в браузере
      if (latestVersion) window.open(latestVersion.download_url, '_blank');
      return;
    }
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    setDownloadError(null);
    const result = await window.electronAPI.downloadUpdate();
    if (result && result.ok === false) {
      setDownloadStatus('error');
      setDownloadError(result.error ?? null);
    }
  }, [latestVersion]);

  const installNow = useCallback(() => {
    window.electronAPI?.installUpdate?.();
  }, []);

  const dismissDownload = useCallback(() => {
    setDownloadStatus('idle');
    setDownloadError(null);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    // Просроченные долги (учитывая частичное погашение — берём только с положительным остатком)
    const { data: overdueDebts, error: overdueError } = await supabase
      .from('debts')
      .select('id, debtor_id, amount, paid_amount, currency, due_date, debtors!inner(full_name, archived_at)')
      .eq('status', 'active')
      .lt('due_date', today)
      .is('debtors.archived_at', null);

    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('id, debtor_id, remind_at, message, debtors(full_name)')
      .eq('is_done', false)
      .lte('remind_at', nowIso);

    const { data: nextUpcoming } = await supabase
      .from('reminders')
      .select('remind_at')
      .eq('is_done', false)
      .gt('remind_at', nowIso)
      .order('remind_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (overdueError || remindersError) {
      // eslint-disable-next-line no-console
      console.error('Notifications fetch error:', overdueError, remindersError);
      setNotificationsError(
        (overdueError || remindersError)?.message.includes('column') ||
          (overdueError || remindersError)?.message.includes('does not exist') ||
          (overdueError || remindersError)?.message.includes('relation')
          ? 'db_migration_missing'
          : 'generic'
      );
    } else {
      setNotificationsError(null);
    }

    const overdueList = (overdueDebts ?? [])
      .map((d: any) => ({
        id: d.id,
        debtorId: d.debtor_id,
        full_name: d.debtors?.full_name ?? '',
        amount: Number(d.amount) - Number(d.paid_amount || 0),
        currency: d.currency,
        due_date: d.due_date,
      }))
      .filter((d) => d.amount > 0);

    const reminderList = (reminders ?? []).map((r: any) => ({
      id: r.id,
      debtor_id: r.debtor_id,
      debtor_name: r.debtors?.full_name ?? '',
      remind_at: r.remind_at,
      message: r.message,
    }));

    setOverdueDebtors(overdueList);
    setDueReminders(reminderList);

    const newCount = overdueList.length + reminderList.length;
    if (!firstRunRef.current && newCount > prevCountRef.current) {
      playNotificationSound();
    }
    firstRunRef.current = false;
    prevCountRef.current = newCount;

    if (preciseTimerRef.current) window.clearTimeout(preciseTimerRef.current);
    if (nextUpcoming?.remind_at) {
      const delay = Math.max(500, new Date(nextUpcoming.remind_at).getTime() - Date.now() + 500);
      preciseTimerRef.current = window.setTimeout(refreshNotifications, delay);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, FALLBACK_POLL_MS);
    return () => {
      clearInterval(interval);
      if (preciseTimerRef.current) window.clearTimeout(preciseTimerRef.current);
    };
  }, [refreshNotifications]);

  return (
    <UIContext.Provider
      value={{
        openRemindersDebtorId,
        requestOpenReminders: setOpenRemindersDebtorId,
        clearOpenReminders: () => setOpenRemindersDebtorId(null),
        overdueDebtors,
        dueReminders,
        notificationsCount: overdueDebtors.length + dueReminders.length + (hasUnseenUpdate ? 1 : 0),
        refreshNotifications,
        notificationsError,
        currentVersion,
        latestVersion,
        updateAvailable,
        hasUnseenUpdate,
        markUpdateSeen,
        changelogRequested,
        requestChangelog: () => setChangelogRequested(true),
        clearChangelogRequest: () => setChangelogRequested(false),
        downloadStatus,
        downloadProgress,
        downloadError,
        startDownload,
        installNow,
        dismissDownload,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI должен использоваться внутри UIProvider');
  return ctx;
}
