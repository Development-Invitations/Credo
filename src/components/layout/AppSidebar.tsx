import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Users, Archive, BellRing, BarChart3 } from 'lucide-react';

const navItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
  background: isActive ? 'var(--color-accent)' : 'transparent',
  textDecoration: 'none',
  transition: 'background 0.15s ease, color 0.15s ease',
});

export function AppSidebar() {
  const { t } = useTranslation();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
        <Users size={18} />
        {t('sidebar.debtors')}
      </NavLink>
      <NavLink to="/reminders" style={({ isActive }) => navItemStyle(isActive)}>
        <BellRing size={18} />
        {t('sidebar.reminders')}
      </NavLink>
      <NavLink to="/archive" style={({ isActive }) => navItemStyle(isActive)}>
        <Archive size={18} />
        {t('sidebar.archive')}
      </NavLink>
      <NavLink to="/reports" style={({ isActive }) => navItemStyle(isActive)}>
        <BarChart3 size={18} />
        {t('sidebar.report')}
      </NavLink>
    </aside>
  );
}
