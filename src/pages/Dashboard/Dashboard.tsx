import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Archive as ArchiveIcon, AlertTriangle, BellRing, ChevronRight, ArrowUpDown, Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { useUI } from '../../context/UIContext';
import { Button } from '../../components/Button';
import { AddDebtorModal } from '../../components/AddDebtorModal';
import { RemindersModal } from '../../components/RemindersModal';
import { ClientDetailDrawer } from '../../components/ClientDetailDrawer';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Pagination } from '../../components/Pagination';
import { HelpTooltip } from '../../components/HelpTooltip';
import { getExchangeRates, convertToBase } from '../../lib/exchangeRates';

interface ClientRow {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

interface DebtRow {
  id: string;
  debtor_id: string;
  amount: number;
  paid_amount: number;
  currency: string;
  due_date: string | null;
  status: 'active' | 'paid';
}

interface ClientWithTotals extends ClientRow {
  activeDebts: DebtRow[];
  totalDebtsCount: number;
  overdue: boolean;
  currencySums: { currency: string; amount: number }[];
}

type StatusFilter = 'all' | 'active' | 'overdue' | 'paid' | 'noDebts';
type DateSort = 'newest' | 'oldest';

const PAGE_SIZE = 6;

function remainingOf(d: DebtRow) {
  return Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
}

function isDebtOverdue(d: DebtRow) {
  return (
    d.status === 'active' &&
    remainingOf(d) > 0 &&
    !!d.due_date &&
    new Date(d.due_date) < new Date(new Date().toDateString())
  );
}

function clientStatus(c: ClientWithTotals): Exclude<StatusFilter, 'all'> {
  if (c.overdue) return 'overdue';
  if (c.activeDebts.length > 0) return 'active';
  if (c.totalDebtsCount === 0) return 'noDebts';
  return 'paid';
}

export function Dashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const { currency } = useApp();
  const { openRemindersDebtorId, clearOpenReminders, refreshNotifications } = useUI();
  const [clients, setClients] = useState<ClientWithTotals[]>([]);
  const [upcomingRemindersCount, setUpcomingRemindersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openAdd) setShowAddClient(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [remindersFor, setRemindersFor] = useState<ClientRow | null>(null);
  const [detailClient, setDetailClient] = useState<ClientRow | null>(null);

  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [dateSort, setDateSort] = useState<DateSort>('newest');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getExchangeRates(currency).then(setRates);
  }, [currency]);

  async function loadClients() {
    const { data: clientsData, error: clientsError } = await supabase
      .from('debtors')
      .select('id, full_name, phone, created_at')
      .is('archived_at', null)
      .eq('is_blacklisted', false)
      .order('created_at', { ascending: false });

    if (clientsError) {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки клиентов:', clientsError);
      setLoadError(
        clientsError.message.includes('column') ? t('dashboard.errorMigrationMissing') : t('dashboard.errorGeneric')
      );
      setClients([]);
      setLoading(false);
      return;
    }

    const list = clientsData ?? [];
    const ids = list.map((c) => c.id);
    let debts: DebtRow[] = [];

    if (ids.length > 0) {
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('id, debtor_id, amount, paid_amount, currency, due_date, status')
        .in('debtor_id', ids);

      if (debtsError) {
        // eslint-disable-next-line no-console
        console.error('Ошибка загрузки долгов:', debtsError);
        setLoadError(
          debtsError.message.includes('relation') || debtsError.message.includes('does not exist')
            ? t('dashboard.errorDebtsTableMissing')
            : t('dashboard.errorGeneric')
        );
      } else {
        setLoadError(null);
      }
      debts = debtsData ?? [];
    } else {
      setLoadError(null);
    }

    const byClient: Record<string, DebtRow[]> = {};
    for (const d of debts) {
      (byClient[d.debtor_id] ??= []).push(d);
    }

    const withTotals: ClientWithTotals[] = list.map((c) => {
      const clientDebts = byClient[c.id] ?? [];
      const activeDebts = clientDebts.filter((d) => d.status === 'active' && remainingOf(d) > 0);
      const overdue = activeDebts.some(isDebtOverdue);
      const sumsMap: Record<string, number> = {};
      for (const d of activeDebts) sumsMap[d.currency] = (sumsMap[d.currency] || 0) + remainingOf(d);
      const currencySums = Object.entries(sumsMap).map(([currency, amount]) => ({ currency, amount }));
      return { ...c, activeDebts, overdue, currencySums, totalDebtsCount: clientDebts.length };
    });

    setClients(withTotals);
    setLoading(false);
  }

  async function loadUpcomingReminders() {
    const { count } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('is_done', false)
      .gte('remind_at', new Date().toISOString());
    setUpcomingRemindersCount(count ?? 0);
  }

  useEffect(() => {
    loadClients();
    loadUpcomingReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (openRemindersDebtorId && clients.length > 0) {
      const target = clients.find((c) => c.id === openRemindersDebtorId);
      if (target) {
        setRemindersFor(target);
        clearOpenReminders();
      }
    }
  }, [openRemindersDebtorId, clients, clearOpenReminders]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, dateSort, search]);

  async function archiveClient(client: ClientWithTotals) {
    const hasOutstanding = client.currencySums.length > 0;
    if (hasOutstanding && !window.confirm(t('archive.confirmWithDebt') ?? '')) return;
    await supabase.from('debtors').update({ archived_at: new Date().toISOString() }).eq('id', client.id);
    loadClients();
    refreshNotifications();
  }

  const counts = useMemo(
    () => ({
      all: clients.length,
      active: clients.filter((c) => clientStatus(c) === 'active').length,
      overdue: clients.filter((c) => clientStatus(c) === 'overdue').length,
      paid: clients.filter((c) => clientStatus(c) === 'paid').length,
      noDebts: clients.filter((c) => clientStatus(c) === 'noDebts').length,
    }),
    [clients]
  );

  const filteredSorted = useMemo(() => {
    let list = activeTab === 'all' ? clients : clients.filter((c) => clientStatus(c) === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.full_name.toLowerCase().includes(q) || (c.phone ?? '').includes(q));
    }
    list = [...list].sort((a, b) => {
      if (activeTab === 'all') {
        const overdueDiff = Number(b.overdue) - Number(a.overdue);
        if (overdueDiff !== 0) return overdueDiff;
      }
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dateSort === 'newest' ? -diff : diff;
    });
    return list;
  }, [clients, activeTab, dateSort, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageClients = filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalDebt = clients.filter((c) => c.activeDebts.length > 0);
  const kpiTotalsByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clients) for (const s of c.currencySums) map[s.currency] = (map[s.currency] || 0) + s.amount;
    return Object.entries(map).map(([currency, amount]) => ({ currency, amount }));
  }, [clients]);

  const convertedTotal = useMemo(() => {
    if (!rates || kpiTotalsByCurrency.length === 0) return null;
    let sum = 0;
    let anyConverted = false;
    for (const s of kpiTotalsByCurrency) {
      if (s.currency.toUpperCase() === currency.toUpperCase()) {
        sum += s.amount;
        anyConverted = true;
      } else {
        const converted = convertToBase(s.amount, s.currency, rates);
        if (converted !== null) {
          sum += converted;
          anyConverted = true;
        }
      }
    }
    return anyConverted ? sum : null;
  }, [kpiTotalsByCurrency, rates, currency]);

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: t('dashboard.tabAll'), count: counts.all },
    { key: 'active', label: t('dashboard.statusActive'), count: counts.active },
    { key: 'overdue', label: t('dashboard.statusOverdue'), count: counts.overdue },
    { key: 'paid', label: t('dashboard.statusPaid'), count: counts.paid },
    { key: 'noDebts', label: t('dashboard.statusNoDebts'), count: counts.noDebts },
  ];

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1>{t('dashboard.title')}</h1>
          <HelpTooltip text={t('help.dashboard')} />
        </div>
        <Button onClick={() => setShowAddClient(true)}>{t('dashboard.addDebtor')}</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('dashboard.kpiTotalDebt')}</div>
          {kpiTotalsByCurrency.length === 0 ? (
            <div className="amount" style={{ fontSize: 22, fontWeight: 700 }}>0 {currency}</div>
          ) : (
            kpiTotalsByCurrency.map((s) => (
              <div key={s.currency} className="amount" style={{ fontSize: 20, fontWeight: 700 }}>
                {s.amount.toLocaleString()} {s.currency}
              </div>
            ))
          )}
          {kpiTotalsByCurrency.length > 1 && convertedTotal !== null && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              ≈ {Math.round(convertedTotal).toLocaleString()} {currency} <HelpTooltip text={t('dashboard.convertedHint')} width={220} />
            </div>
          )}
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('dashboard.kpiActiveDebtors')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{totalDebt.length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('dashboard.kpiOverdue')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{counts.overdue}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('dashboard.kpiUpcomingReminders')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent)' }}>{upcomingRemindersCount}</div>
        </div>
      </div>

      {loadError && <div style={{ marginBottom: 16 }}><ErrorBanner>{loadError}</ErrorBanner></div>}

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input"
          placeholder={t('dashboard.searchPlaceholder') ?? ''}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Табы по статусам */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: '1px solid var(--color-border)',
                background: activeTab === tab.key ? 'var(--color-accent)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <button
          onClick={() => setDateSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            padding: '7px 12px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <ArrowUpDown size={14} />
          {dateSort === 'newest' ? t('dashboard.sortNewest') : t('dashboard.sortOldest')}
        </button>
      </div>

      {!loading && !loadError && filteredSorted.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {search.trim() ? t('dashboard.searchNoResults') : t('dashboard.noDebtors')}
        </div>
      )}

      <div key={`${activeTab}-${dateSort}-${page}`} style={{ display: 'grid', gap: 10 }}>
        {pageClients.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderColor: c.overdue ? 'var(--color-danger)' : 'var(--color-border)',
              background: c.overdue ? 'color-mix(in srgb, var(--color-danger) 8%, var(--color-surface))' : 'var(--color-surface)',
            }}
            onClick={() => setDetailClient(c)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {c.overdue && <AlertTriangle size={14} color="var(--color-danger)" />}
                <span>{c.full_name}</span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: c.overdue
                    ? 'var(--color-danger)'
                    : c.activeDebts.length > 0
                    ? 'var(--color-accent)'
                    : c.totalDebtsCount === 0
                    ? 'var(--color-border)'
                    : 'var(--color-success)',
                  color: c.totalDebtsCount === 0 && c.activeDebts.length === 0 && !c.overdue ? 'var(--color-text-muted)' : '#fff',
                }}
              >
                {c.overdue
                  ? t('dashboard.statusOverdue')
                  : c.activeDebts.length > 0
                  ? t('dashboard.statusActive')
                  : c.totalDebtsCount === 0
                  ? t('dashboard.statusNoDebts')
                  : t('dashboard.statusPaid')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {c.currencySums.length > 0 && (
                <span className="amount" style={{ fontSize: 15 }}>
                  {c.currencySums.map((s) => `${s.amount.toLocaleString()} ${s.currency}`).join(' + ')}
                </span>
              )}
              <Button
                variant="secondary"
                onClick={() => setRemindersFor(c)}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 10px' }}
                title={t('dashboard.viewReminders') ?? ''}
              >
                <BellRing size={15} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => archiveClient(c)}
                style={{ display: 'flex', alignItems: 'center', padding: '8px 10px' }}
                title={t('archive.archiveAction') ?? ''}
              >
                <ArchiveIcon size={15} />
              </Button>
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showAddClient && (
        <AddDebtorModal
          onClose={() => setShowAddClient(false)}
          onCreated={(newId) => {
            loadClients();
            setDetailClient({ id: newId, full_name: '', phone: null, created_at: new Date().toISOString() });
          }}
        />
      )}

      {remindersFor && (
        <RemindersModal
          debtorId={remindersFor.id}
          debtorName={remindersFor.full_name}
          onClose={() => {
            setRemindersFor(null);
            loadUpcomingReminders();
            refreshNotifications();
          }}
        />
      )}

      {detailClient && (
        <ClientDetailDrawer
          clientId={detailClient.id}
          clientName={clients.find((c) => c.id === detailClient.id)?.full_name || detailClient.full_name}
          clientPhone={clients.find((c) => c.id === detailClient.id)?.phone ?? detailClient.phone}
          defaultCurrency={currency}
          onClose={() => setDetailClient(null)}
          onDebtsChanged={() => {
            loadClients();
            refreshNotifications();
          }}
        />
      )}
    </div>
  );
}
