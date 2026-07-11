import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, Home, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useUI } from '../../context/UIContext';
import { NotificationsPanel } from '../NotificationsPanel';

interface Props {
  userName: string;
  onOpenSettings: () => void;
}

export function AppHeader({ userName, onOpenSettings }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notificationsCount, hasUnseenUpdate } = useUI();
  const [notifOpen, setNotifOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 64,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <div style={{ fontSize: 15 }}>
        {t('header.greeting')}, <strong>{userName || '...'}</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconButton title={t('header.home')} onClick={() => navigate('/profile')}>
          <Home size={19} />
        </IconButton>

        <div ref={wrapRef} style={{ position: 'relative' }}>
          <IconButton title={t('header.notifications')} onClick={() => setNotifOpen((v) => !v)}>
            <span
              style={{
                display: 'inline-flex',
                animation: notificationsCount > 0 ? 'bell-shake 1.8s ease-in-out infinite' : 'none',
              }}
            >
              <Bell size={19} />
            </span>
            {notificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'var(--color-danger)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 999,
                  minWidth: 15,
                  height: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}
              >
                {notificationsCount}
              </span>
            )}
          </IconButton>
          {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <IconButton title={t('header.settings')} onClick={onOpenSettings}>
          <SettingsIcon size={19} />
          {hasUnseenUpdate && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                animation: 'pulse-dot 1.6s ease-in-out infinite',
              }}
            />
          )}
        </IconButton>

        <IconButton
          title={t('header.signOut')}
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/login');
          }}
          danger
        >
          <LogOut size={19} />
        </IconButton>
      </div>

      <style>{`
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          5% { transform: rotate(-14deg); }
          10% { transform: rotate(12deg); }
          15% { transform: rotate(-8deg); }
          20% { transform: rotate(6deg); }
          25% { transform: rotate(0deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 55%, transparent); }
          50% { transform: scale(1.15); opacity: 0.85; box-shadow: 0 0 0 4px transparent; }
        }
      `}</style>
    </header>
  );
}

function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color: danger ? 'var(--color-danger)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-hover)';
        if (!danger) e.currentTarget.style.color = 'var(--color-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = danger ? 'var(--color-danger)' : 'var(--color-text-muted)';
      }}
    >
      {children}
    </button>
  );
}
