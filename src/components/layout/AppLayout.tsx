import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { useUI } from '../../context/UIContext';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { Drawer } from '../Drawer';
import { SettingsPanelContent } from '../SettingsPanelContent';
import { UpdateBanner } from '../UpdateBanner';
import { UIProvider } from '../../context/UIContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const { changelogRequested } = useUI();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as Record<string, unknown> | undefined;
      const full = (meta?.full_name as string) || data.user?.email || '';
      setUserName(full.split(' ')[0] || full);
    });
  }, []);

  useEffect(() => {
    if (changelogRequested) setSettingsOpen(true);
  }, [changelogRequested]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader userName={userName} onOpenSettings={() => setSettingsOpen(true)} />
      <UpdateBanner />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AppSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>

      <AppFooter />

      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t('settings.title')}>
        <SettingsPanelContent />
      </Drawer>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <LayoutInner>{children}</LayoutInner>
    </UIProvider>
  );
}
