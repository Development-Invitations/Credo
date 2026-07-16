import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Button } from '../../components/Button';
import { AddCreditClientModal } from '../../components/AddCreditClientModal';
import { CreditsListContent } from './CreditsListContent';

export function CreditsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddClient, setShowAddClient] = useState(false);
  const [openClientId, setOpenClientId] = useState<string | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openAdd) setShowAddClient(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('sidebar.credits')}
          <HelpTooltip text={t('help.credits')} />
        </h1>
        <Button onClick={() => setShowAddClient(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          {t('credit.addClientButton')}
        </Button>
      </div>

      <CreditsListContent refreshKey={refreshKey} openClientId={openClientId} />

      {showAddClient && (
        <AddCreditClientModal
          onClose={() => setShowAddClient(false)}
          onCreated={(newId) => {
            setRefreshKey((k) => k + 1);
            setOpenClientId(newId);
          }}
        />
      )}
    </div>
  );
}
