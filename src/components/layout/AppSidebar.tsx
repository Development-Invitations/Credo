import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Users, Archive, BellRing, BarChart3, Landmark, Volume2, Phone, MessageSquare, ShieldOff, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  const { creditModuleEnabled, soundModuleEnabled, callingModuleEnabled, smsModuleEnabled } = useApp();

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <NavLink to="/home" style={({ isActive }) => navItemStyle(isActive)}>
        <Home size={18} />
        {t('sidebar.home')}
      </NavLink>
      <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
        <Users size={18} />
        {t('sidebar.debtors')}
      </NavLink>
      {creditModuleEnabled && (
        <NavLink to="/credits" style={({ isActive }) => navItemStyle(isActive)}>
          <Landmark size={18} />
          {t('sidebar.credits')}
        </NavLink>
      )}
      <NavLink to="/reminders" style={({ isActive }) => navItemStyle(isActive)}>
        <BellRing size={18} />
        {t('sidebar.reminders')}
      </NavLink>
      {soundModuleEnabled && (
        <NavLink to="/sound" style={({ isActive }) => navItemStyle(isActive)}>
          <Volume2 size={18} />
          {t('sidebar.sound')}
        </NavLink>
      )}
      {callingModuleEnabled && (
        <NavLink to="/calling" style={({ isActive }) => navItemStyle(isActive)}>
          <Phone size={18} />
          {t('sidebar.calling')}
        </NavLink>
      )}
      {smsModuleEnabled && (
        <NavLink to="/sms" style={({ isActive }) => navItemStyle(isActive)}>
          <MessageSquare size={18} />
          {t('sidebar.sms')}
        </NavLink>
      )}
      <NavLink to="/archive" style={({ isActive }) => navItemStyle(isActive)}>
        <Archive size={18} />
        {t('sidebar.archive')}
      </NavLink>
      <NavLink to="/blacklist" style={({ isActive }) => navItemStyle(isActive)}>
        <ShieldOff size={18} />
        {t('sidebar.blacklist')}
      </NavLink>
      <NavLink to="/reports" style={({ isActive }) => navItemStyle(isActive)}>
        <BarChart3 size={18} />
        {t('sidebar.report')}
      </NavLink>
    </aside>
  );
}
