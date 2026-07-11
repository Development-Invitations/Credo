import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ClientReportRow, DebtWithPayments, ReminderRow } from '../../components/ClientReportRow';

interface ClientEntry {
  id: string;
  full_name: string;
  archived: boolean;
  debts: DebtWithPayments[];
  reminders: ReminderRow[];
}

export function ReportsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [totalDebtsCount, setTotalDebtsCount] = useState(0);
  const [overdueClientsCount, setOverdueClientsCount] = useState(0);
  const [chartData, setChartData] = useState<{ currency: string; active: number; paid: number }[]>([]);
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
        setTotalDebtsCount((debtsData ?? []).length);

        const today = new Date().toISOString().slice(0, 10);
        setOverdueClientsCount(
          clientEntries.filter((c) =>
            c.debts.some((d) => {
              const remaining = Number(d.amount) - Number(d.paid_amount || 0);
              return d.status === 'active' && remaining > 0 && !!d.due_date && d.due_date < today;
            })
          ).length
        );

        const byCurrency: Record<string, { currency: string; active: number; paid: number }> = {};
        for (const d of debtsData ?? []) {
          const row = (byCurrency[d.currency] ??= { currency: d.currency, active: 0, paid: 0 });
          const remaining = Math.max(Number(d.amount) - Number(d.paid_amount || 0), 0);
          if (d.status === 'active') row.active += remaining;
          else row.paid += Number(d.amount);
        }
        setChartData(Object.values(byCurrency));

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

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24 }}>{t('report.title')}</h1>

      {error && <div style={{ marginBottom: 16 }}><ErrorBanner>{error}</ErrorBanner></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('report.totalDebts')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{totalDebtsCount}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('sidebar.debtors')}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{clients.filter((c) => !c.archived).length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6 }}>{t('report.overdueClients')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{overdueClientsCount}</div>
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
