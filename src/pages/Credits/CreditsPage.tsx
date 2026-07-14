import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Button } from '../../components/Button';
import { useQuickCreateCredit } from '../../components/useQuickCreateCredit';
import { CreditsListContent } from './CreditsListContent';

export function CreditsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { currency } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);
  const { openPicker, modals } = useQuickCreateCredit(() => setRefreshKey((k) => k + 1), currency);

  useEffect(() => {
    if ((location.state as any)?.openAdd) openPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('sidebar.credits')}
          <HelpTooltip text={t('help.credits')} />
        </h1>
        <Button onClick={openPicker} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Landmark size={16} />
          {t('credit.createButton')}
        </Button>
      </div>
      <CreditsListContent refreshKey={refreshKey} />
      {modals}
    </div>
  );
}
