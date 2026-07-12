import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, Users, Wallet, Landmark } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export function ProfilePage() {
  const { t } = useTranslation();
  const { creditModuleEnabled } = useApp();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [clientsCount, setClientsCount] = useState(0);
  const [debtsCount, setDebtsCount] = useState(0);
  const [creditsCount, setCreditsCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? '');
      setCreatedAt(user.created_at ?? null);

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      setFullName(profile?.full_name || (user.user_metadata?.full_name as string) || '');

      const { count: cCount } = await supabase.from('debtors').select('id', { count: 'exact', head: true }).is('archived_at', null);
      setClientsCount(cCount ?? 0);

      const { count: dCount } = await supabase.from('debts').select('id', { count: 'exact', head: true });
      setDebtsCount(dCount ?? 0);

      const { count: crCount } = await supabase.from('credits').select('id', { count: 'exact', head: true });
      setCreditsCount(crCount ?? 0);

      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = fullName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24 }}>{t('profile.title')}</h1>

      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {initials || <User size={24} />}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
            {t('profile.fullName')}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Button onClick={handleSave} disabled={saving}>
              {saved ? t('profile.saved') : t('profile.save')}
            </Button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          <Mail size={16} color="var(--color-text-muted)" />
          {email}
        </div>
        {createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Calendar size={16} color="var(--color-text-muted)" />
            {t('profile.memberSince')}: {new Date(createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{loading ? '…' : clientsCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('sidebar.debtors')}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wallet size={20} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{loading ? '…' : debtsCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('report.totalDebts')}</div>
          </div>
        </div>
        {creditModuleEnabled && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Landmark size={20} color="var(--color-accent)" />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{loading ? '…' : creditsCount}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t('sidebar.credits')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
