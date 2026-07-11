import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { ErrorBanner } from '../../components/ErrorBanner';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Button } from '../../components/Button';
import { ClientReportRow, DebtWithPayments, ReminderRow } from '../../components/ClientReportRow';

interface ClientEntry {
  id: string;
  full_name: string;
  archived: boolean;
  debts: DebtWithPayments[];
  reminders: ReminderRow[];
}

type DateRange = 'all' | 'month' | '30days';

export function ReportsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [range, setRange] = useState<DateRange>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('debtors')
          .select('id, full_name, archived_at')
          .order('created_at', { ascending: false });
        if (clientsError) throw clientsError;

        const ids = (clientsData ?? []).map((c) => c.id);
        if (ids.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        const { data: debtsData, error: debtsError } = await supabase
          .from('debts')
          .select('id, debtor_id, amount, paid_amount, currency, due_date, status, comment, created_at')
          .in('debtor_id', ids);
        if (debtsError) throw debtsError;

        const debtIds = (debtsData ?? []).map((d) => d.id);
        let paymentsData: any[] = [];
        if (debtIds.length > 0) {
          const { data: pData, error: pError } = await supabase
            .from('debt_payments')
            .select('debt_id, amount, paid_at')
            .in('debt_id', debtIds);
          if (pError) throw pError;
          paymentsData = pData ?? [];
        }

        const { data: remindersData, error: remindersError } = await supabase
          .from('reminders')
          .select('id, debtor_id, remind_at, message, is_done')
          .in('debtor_id', ids)
          .order('remind_at', { ascending: false });
        if (remindersError) throw remindersError;

        const paymentsByDebt: Record<string, { amount: number; paid_at: string }[]> = {};
        for (const p of paymentsData) (paymentsByDebt[p.debt_id] ??= []).push({ amount: p.amount, paid_at: p.paid_at });

        const debtsByClient: Record<string, DebtWithPayments[]> = {};
        for (const d of debtsData ?? []) {
          (debtsByClient[d.debtor_id] ??= []).push({ ...d, payments: paymentsByDebt[d.id] ?? [] });
        }

        const remindersByClient: Record<string, ReminderRow[]> = {};
        for (const r of remindersData ?? []) (remindersByClient[r.debtor_id] ??= []).push(r);

        const clientEntries: ClientEntry[] = (clientsData ?? []).map((c) => ({
          id: c.id,
          full_name: c.full_name,
          archived: !!c.archived_at,
          debts: debtsByClient[c.id] ?? [],
          reminders: remindersByClient[c.id] ?? [],
        }));

        setClients(clientEntries);
        setError(null);
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Ошибка загрузки отчёта:', e);
        setError(
          e?.message?.includes('column') || e?.message?.includes('does not exist') || e?.message?.includes('relation')
            ? t('report.errorMigrationMissing')
            : t('dashboard.errorGeneric')
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  const rangeStart = useMemo(() => {
    const now = new Date();
    if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    if (range === '30days') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return null;
  }, [range]);

  const debtsInRange = useMemo(() => {
    const all = clients.flatMap((c) => c.debts);
    if (!rangeStart) return all;
    return all.filter((d) => new Date(d.created_at) >= rangeStart);
  }, [clients, rangeStart]);

  const overdueList = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result: { id: string; full_name: string; amount: number; currency: string; due_date: string }[] = [];
    for (const c of clients) {
      for (const d of c.debts) {
        const remaining = Number(d.amount) - Number(d.paid_amount || 0);
        if (d.status === 'active' && remaining > 0 && d.due_date && d.due_date < today) {
          result.push({ id: d.id, full_name: c.full_name, amount: remaining, currency: d.currency, due_date: d.due_date });
        }
      }
    }
    return result;
  }, [clients]);

  const chartData = useMemo(() => {
    const byCurrency: Record<string, { currency: string; active: number; paid: number }> = {};
    for (const d of debtsInRange) {
      const row = (byCurrency[d.currency] ??= { currency: d.currency, active: 0, paid: 0 });
      const remaining = Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
      if (d.status === 'active') row.active += remaining;
      else row.paid += Number(d.amount);
    }
    return Object.values(byCurrency);
  }, [debtsInRange]);

  function exportCsv() {
    const rows: string[] = ['Клиент,Сумма,Валюта,Остаток,Срок,Статус,Комментарий,Дата создания'];
    for (const c of clients) {
      for (const d of c.debts) {
        const remaining = Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
        rows.push(
          [
            c.full_name,
            d.amount,
            d.currency,
            remaining,
            d.due_date ?? '',
            d.status,
            (d.comment ?? '').replace(/,/g, ';'),
            new Date(d.created_at).toLocaleDateString(),
          ].join(',')
        );
      }
    }
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credo-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rangeButtons: { key: DateRange; label: string }[] = [
    { key: 'all', label: t('report.rangeAll') },
    { key: 'month', label: t('report.rangeMonth') },
    { key: '30days', label: t('report.range30days') },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('report.title')}
          <HelpTooltip text={t('help.report')} />
        </h1>
        <Button variant="secondary" onClick={exportCsv} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={15} />
          {t('report.exportCsv')}
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {rangeButtons.map((rb) => (
          <button
            key={rb.key}
            onClick={() => setRange(rb.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: range === rb.key ? 'var(--color-accent)' : 'transparent',
              color: range === rb.key ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {rb.label}
          </button>
        ))}
      </div>

      {error && <div style={{ marginBottom: 16 }}><ErrorBanner>{error}</ErrorBanner></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('report.totalDebts')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{debtsInRange.length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('sidebar.debtors')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{clients.filter((c) => !c.archived).length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('report.overdueClients')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{overdueList.length}</div>
        </div>
      </div>

      {!loading && !error && chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 14 }}>{t('report.byCurrency')}</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="currency" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active" name={t('report.outstanding') ?? ''} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name={t('report.paid') ?? ''} fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 24 }}>
          {t('report.noData')}
        </div>
      )}

      <h3 style={{ marginBottom: 12, fontSize: 14, color: 'var(--color-text-muted)' }}>{t('report.perClientTitle')}</h3>

      {!loading && !error && clients.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('report.noData')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {clients.map((c) => (
          <ClientReportRow key={c.id} clientName={c.full_name} archived={c.archived} debts={c.debts} reminders={c.reminders} />
        ))}
      </div>
    </div>
  );
}
