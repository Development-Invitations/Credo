import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Landmark, BellRing, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { HelpTooltip } from '../../components/HelpTooltip';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { creditModuleEnabled } = useApp();

  const [debtsCollected, setDebtsCollected] = useState<{ currency: string; amount: number }[]>([]);
  const [creditsCollected, setCreditsCollected] = useState<{ currency: string; amount: number }[]>([]);
  const [creditsProfit, setCreditsProfit] = useState<{ currency: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      // Собрано за долги в этом месяце
      const { data: debtPayments } = await supabase
        .from('debt_payments')
        .select('amount, paid_at, debts(currency)')
        .gte('paid_at', monthStart.toISOString());
      const debtsMap: Record<string, number> = {};
      for (const p of (debtPayments as any[]) ?? []) {
        const cur = p.debts?.currency ?? '?';
        debtsMap[cur] = (debtsMap[cur] || 0) + Number(p.amount);
      }
      setDebtsCollected(Object.entries(debtsMap).map(([currency, amount]) => ({ currency, amount })));

      if (creditModuleEnabled) {
        // Собрано за кредиты в этом месяце (подтверждённые платежи с датой подтверждения в этом месяце)
        const { data: creditPayments } = await supabase
          .from('credit_payments')
          .select('expected_amount, is_confirmed, confirmed_at, credits(currency)')
          .eq('is_confirmed', true)
          .gte('confirmed_at', monthStart.toISOString());
        const creditsMap: Record<string, number> = {};
        for (const p of (creditPayments as any[]) ?? []) {
          const cur = p.credits?.currency ?? '?';
          creditsMap[cur] = (creditsMap[cur] || 0) + Number(p.expected_amount);
        }
        setCreditsCollected(Object.entries(creditsMap).map(([currency, amount]) => ({ currency, amount })));

        // Ожидаемая прибыль по кредитам (проценты) — сумма всего графика минус тело кредита, по всем кредитам
        const { data: allCredits } = await supabase.from('credits').select('id, principal_amount, currency');
        const { data: allPayments } = await supabase.from('credit_payments').select('credit_id, expected_amount');
        const scheduleTotalByCredit: Record<string, number> = {};
        for (const p of allPayments ?? []) scheduleTotalByCredit[p.credit_id] = (scheduleTotalByCredit[p.credit_id] || 0) + Number(p.expected_amount);
        const profitMap: Record<string, number> = {};
        for (const c of allCredits ?? []) {
          const total = scheduleTotalByCredit[c.id] ?? Number(c.principal_amount);
          const profit = total - Number(c.principal_amount);
          if (profit > 0) profitMap[c.currency] = (profitMap[c.currency] || 0) + profit;
        }
        setCreditsProfit(Object.entries(profitMap).map(([currency, amount]) => ({ currency, amount })));
      }

      setLoading(false);
    }
    load();
  }, [creditModuleEnabled]);

  const quickActions = useMemo(() => {
    const actions = [
      { key: 'addDebtor', label: t('dashboard.addDebtor'), icon: Users, onClick: () => navigate('/dashboard', { state: { openAdd: true } }) },
    ];
    if (creditModuleEnabled) {
      actions.push({ key: 'addCredit', label: t('credit.createButton'), icon: Landmark, onClick: () => navigate('/credits', { state: { openAdd: true } }) });
    }
    actions.push({ key: 'reminders', label: t('sidebar.reminders'), icon: BellRing, onClick: () => navigate('/reminders') });
    actions.push({ key: 'report', label: t('sidebar.report'), icon: BarChart3, onClick: () => navigate('/reports') });
    return actions;
  }, [creditModuleEnabled, t, navigate]);

  function renderSums(sums: { currency: string; amount: number }[]) {
    if (sums.length === 0) return <div className="amount" style={{ fontSize: 20, fontWeight: 700 }}>0</div>;
    return sums.map((s) => (
      <div key={s.currency} className="amount" style={{ fontSize: 20, fontWeight: 700 }}>
        {Math.round(s.amount).toLocaleString()} {s.currency}
      </div>
    ));
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.home')}
        <HelpTooltip text={t('help.home')} />
      </h1>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        {quickActions.map((a) => (
          <button
            key={a.key}
            onClick={a.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <a.icon size={17} color="var(--color-accent)" />
            {a.label}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('home.kpiTitle')}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('home.debtsCollectedMonth')}
            <HelpTooltip text={t('home.debtsCollectedHint')} width={240} />
          </div>
          {loading ? '…' : renderSums(debtsCollected)}
        </div>

        {creditModuleEnabled && (
          <>
            <div className="card">
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t('home.creditsCollectedMonth')}
                <HelpTooltip text={t('home.creditsCollectedHint')} width={240} />
              </div>
              {loading ? '…' : renderSums(creditsCollected)}
            </div>
            <div className="card">
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t('home.creditsProfit')}
                <HelpTooltip text={t('home.creditsProfitHint')} width={260} />
              </div>
              {loading ? '…' : renderSums(creditsProfit)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
