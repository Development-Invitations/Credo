import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertTriangle, ArrowUpDown, Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { CreditData } from '../../components/CreditAccordionItem';
import { CreditClientDetailDrawer } from '../../components/CreditClientDetailDrawer';
import { Pagination } from '../../components/Pagination';

interface ClientCredits {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  credits: CreditData[];
}

type StatusFilter = 'all' | 'active' | 'overdue' | 'paid' | 'noCredits';
type DateSort = 'newest' | 'oldest';
const PAGE_SIZE = 6;

function clientStatus(c: ClientCredits): Exclude<StatusFilter, 'all'> {
  if (c.credits.length === 0) return 'noCredits';
  const today = new Date().toISOString().slice(0, 10);
  const allPayments = c.credits.flatMap((cr) => cr.payments);
  const unconfirmed = allPayments.filter((p) => !p.is_confirmed);
  if (unconfirmed.some((p) => p.due_date < today)) return 'overdue';
  if (unconfirmed.length > 0) return 'active';
  return 'paid';
}

export function CreditsListContent({ refreshKey, openClientId }: { refreshKey?: number; openClientId?: string | null }) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailClientId, setDetailClientId] = useState<string | null>(null);

  useEffect(() => {
    if (openClientId) setDetailClientId(openClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openClientId]);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [dateSort, setDateSort] = useState<DateSort>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    const { data: debtorsData } = await supabase
      .from('credit_clients')
      .select('id, full_name, phone, created_at')
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    const debtorIds = (debtorsData ?? []).map((d) => d.id);
    let creditsRaw: any[] = [];
    if (debtorIds.length > 0) {
      const { data } = await supabase
        .from('credits')
        .select('id, credit_number, debtor_id, account_number, principal_amount, currency, interest_type, interest_rate, term_months')
        .in('debtor_id', debtorIds);
      creditsRaw = data ?? [];
    }

    const creditIds = creditsRaw.map((c) => c.id);
    let paymentsData: any[] = [];
    let eventsData: any[] = [];
    if (creditIds.length > 0) {
      const { data: pData } = await supabase
        .from('credit_payments')
        .select('id, credit_id, due_date, expected_amount, paid_amount, is_confirmed')
        .in('credit_id', creditIds)
        .order('due_date', { ascending: true });
      paymentsData = pData ?? [];

      const { data: eData } = await supabase
        .from('credit_events')
        .select('id, credit_id, description, created_at')
        .in('credit_id', creditIds)
        .order('created_at', { ascending: false });
      eventsData = eData ?? [];
    }

    const paymentsByCredit: Record<string, any[]> = {};
    for (const p of paymentsData) (paymentsByCredit[p.credit_id] ??= []).push(p);
    const eventsByCredit: Record<string, any[]> = {};
    for (const e of eventsData) (eventsByCredit[e.credit_id] ??= []).push(e);

    const creditsByDebtor: Record<string, CreditData[]> = {};
    for (const c of creditsRaw) {
      (creditsByDebtor[c.debtor_id] ??= []).push({
        id: c.id,
        debtor_name: '',
        credit_number: c.credit_number,
        account_number: c.account_number,
        principal_amount: c.principal_amount,
        currency: c.currency,
        interest_type: c.interest_type,
        interest_rate: c.interest_rate,
        term_months: c.term_months,
        payments: paymentsByCredit[c.id] ?? [],
        events: eventsByCredit[c.id] ?? [],
      });
    }

    setClients(
      (debtorsData ?? []).map((d) => {
        const credits = (creditsByDebtor[d.id] ?? []).map((c) => ({ ...c, debtor_name: d.full_name }));
        return { id: d.id, full_name: d.full_name, phone: d.phone, created_at: d.created_at, credits };
      })
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, dateSort, search]);

  const today = new Date().toISOString().slice(0, 10);

  const counts = useMemo(
    () => ({
      all: clients.length,
      active: clients.filter((c) => clientStatus(c) === 'active').length,
      overdue: clients.filter((c) => clientStatus(c) === 'overdue').length,
      paid: clients.filter((c) => clientStatus(c) === 'paid').length,
      noCredits: clients.filter((c) => clientStatus(c) === 'noCredits').length,
    }),
    [clients]
  );

  const upcomingCount = useMemo(
    () =>
      clients.reduce(
        (sum, c) => sum + c.credits.flatMap((cr) => cr.payments).filter((p) => !p.is_confirmed && p.due_date >= today).length,
        0
      ),
    [clients, today]
  );

  const totalRemainingByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clients) {
      for (const cr of c.credits) {
        for (const p of cr.payments) {
          if (!p.is_confirmed) map[cr.currency] = (map[cr.currency] || 0) + Number(p.expected_amount);
        }
      }
    }
    return Object.entries(map).map(([currency, amount]) => ({ currency, amount }));
  }, [clients]);

  const filteredSorted = useMemo(() => {
    let list = activeTab === 'all' ? clients : clients.filter((c) => clientStatus(c) === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.full_name.toLowerCase().includes(q) || (c.phone ?? '').includes(q));
    }
    list = [...list].sort((a, b) => {
      if (activeTab === 'all') {
        const overdueDiff = Number(clientStatus(b) === 'overdue') - Number(clientStatus(a) === 'overdue');
        if (overdueDiff !== 0) return overdueDiff;
      }
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dateSort === 'newest' ? -diff : diff;
    });
    return list;
  }, [clients, activeTab, search, dateSort]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageClients = filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: t('dashboard.tabAll'), count: counts.all },
    { key: 'active', label: t('dashboard.statusActive'), count: counts.active },
    { key: 'overdue', label: t('dashboard.statusOverdue'), count: counts.overdue },
    { key: 'paid', label: t('dashboard.statusPaid'), count: counts.paid },
    { key: 'noCredits', label: t('credit.noCreditsStatus'), count: counts.noCredits },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('credit.kpiTotalRemaining')}</div>
          {totalRemainingByCurrency.length === 0 ? (
            <div className="amount" style={{ fontSize: 22, fontWeight: 700 }}>0</div>
          ) : (
            totalRemainingByCurrency.map((s) => (
              <div key={s.currency} className="amount" style={{ fontSize: 20, fontWeight: 700 }}>
                {s.amount.toLocaleString()} {s.currency}
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('credit.kpiActive')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{counts.active}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('dashboard.kpiOverdue')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{counts.overdue}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('credit.kpiUpcoming')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent)' }}>{upcomingCount}</div>
        </div>
      </div>

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

      {!loading && filteredSorted.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {search.trim() ? t('dashboard.searchNoResults') : t('credit.noCredits')}
        </div>
      )}

      <div key={`${activeTab}-${dateSort}-${page}`} style={{ display: 'grid', gap: 10 }}>
        {pageClients.map((c) => {
          const status = clientStatus(c);
          const isOverdue = status === 'overdue';
          const sumsMap: Record<string, number> = {};
          for (const cr of c.credits) for (const p of cr.payments) if (!p.is_confirmed) sumsMap[cr.currency] = (sumsMap[cr.currency] || 0) + Number(p.expected_amount);
          const sums = Object.entries(sumsMap);

          return (
            <div
              key={c.id}
              className="card"
              onClick={() => setDetailClientId(c.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderColor: isOverdue ? 'var(--color-danger)' : 'var(--color-border)',
                background: isOverdue ? 'color-mix(in srgb, var(--color-danger) 8%, var(--color-surface))' : 'var(--color-surface)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {isOverdue && <AlertTriangle size={14} color="var(--color-danger)" />}
                  <span>{c.full_name}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background:
                      status === 'overdue' ? 'var(--color-danger)' : status === 'active' ? 'var(--color-accent)' : status === 'noCredits' ? 'var(--color-border)' : 'var(--color-success)',
                    color: status === 'noCredits' ? 'var(--color-text-muted)' : '#fff',
                  }}
                >
                  {status === 'overdue'
                    ? t('dashboard.statusOverdue')
                    : status === 'active'
                    ? t('dashboard.statusActive')
                    : status === 'noCredits'
                    ? t('credit.noCreditsStatus')
                    : t('dashboard.statusPaid')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {sums.length > 0 && (
                  <span className="amount" style={{ fontSize: 15 }}>
                    {sums.map(([cur, amt]) => `${amt.toLocaleString()} ${cur}`).join(' + ')}
                  </span>
                )}
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {detailClientId && (
        <CreditClientDetailDrawer clientId={detailClientId} onClose={() => setDetailClientId(null)} onChanged={load} />
      )}
    </div>
  );
}
