import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldOff, Undo2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Button } from '../../components/Button';

interface BlacklistedClient {
  id: string;
  full_name: string;
  phone: string | null;
  blacklist_reason: string | null;
  blacklisted_at: string | null;
}

export function BlacklistPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<BlacklistedClient[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from('debtors')
      .select('id, full_name, phone, blacklist_reason, blacklisted_at')
      .eq('is_blacklisted', true)
      .order('blacklisted_at', { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function removeFromBlacklist(id: string) {
    await supabase.from('debtors').update({ is_blacklisted: false, blacklist_reason: null, blacklisted_at: null }).eq('id', id);
    load();
  }

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.blacklist')}
        <HelpTooltip text={t('help.blacklist')} />
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>{t('blacklist.explainer')}</p>

      {!loading && clients.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {t('blacklist.empty')}
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {clients.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--color-danger)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldOff size={16} color="var(--color-danger)" />
              <div>
                <div>{c.full_name}</div>
                {c.phone && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.phone}</div>}
                {c.blacklist_reason && (
                  <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 2 }}>{c.blacklist_reason}</div>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={() => removeFromBlacklist(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Undo2 size={15} />
              {t('blacklist.remove')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
