import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2 } from 'lucide-react';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import {
  DEFAULT_DEBT_CONTRACT_TEMPLATE,
  DEFAULT_CREDIT_CONTRACT_TEMPLATE,
  fillTemplate,
} from '../../lib/contractTemplates';

export function DocumentsSettingsPage() {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState(localStorage.getItem('docCompanyName') || '');
  const [companyDetails, setCompanyDetails] = useState(localStorage.getItem('docCompanyDetails') || '');
  const [city, setCity] = useState(localStorage.getItem('docCity') || '');
  const [stampImage, setStampImage] = useState(localStorage.getItem('docStampImage') || '');
  const [debtTemplate, setDebtTemplate] = useState(localStorage.getItem('docDebtTemplate') || DEFAULT_DEBT_CONTRACT_TEMPLATE);
  const [creditTemplate, setCreditTemplate] = useState(localStorage.getItem('docCreditTemplate') || DEFAULT_CREDIT_CONTRACT_TEMPLATE);
  const [previewType, setPreviewType] = useState<'debt' | 'credit'>('debt');
  const fileRef = useRef<HTMLInputElement>(null);

  function save(key: string, value: string, setter: (v: string) => void) {
    setter(value);
    localStorage.setItem(key, value);
  }

  function handleStampUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setStampImage(dataUrl);
      localStorage.setItem('docStampImage', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function removeStamp() {
    setStampImage('');
    localStorage.removeItem('docStampImage');
  }

  const sampleVars = {
    number: previewType === 'debt' ? '000123' : '90000001',
    city: city || 'Ташкент',
    date: new Date().toLocaleDateString(),
    amount: '5 000 000',
    currency: 'UZS',
    takenDate: new Date().toLocaleDateString(),
    dueDate: '01.12.2026',
    comment: 'Пример комментария',
    companyName: companyName || t('documents.sampleCompanyName'),
    companyDetails: companyDetails || t('documents.sampleCompanyDetails'),
    interestType: t('credit.interest_flat'),
    rate: '24%',
    term: '12 мес.',
    monthlyPayment: '450 000',
    passport: 'AD 1234567',
    address: 'г. Фергана, ул. Примерная 1',
    phone: '+998 90 123 45 67',
  };

  const previewText = fillTemplate(previewType === 'debt' ? debtTemplate : creditTemplate, sampleVars);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.documents')}
        <HelpTooltip text={t('help.documents')} width={300} />
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ fontSize: 14 }}>{t('documents.companySection')}</h3>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('documents.companyName')}
              </label>
              <Input value={companyName} onChange={(e) => save('docCompanyName', e.target.value, setCompanyName)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('documents.companyDetails')}
              </label>
              <textarea
                className="input"
                rows={2}
                value={companyDetails}
                onChange={(e) => save('docCompanyDetails', e.target.value, setCompanyDetails)}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {t('documents.city')}
              </label>
              <Input value={city} onChange={(e) => save('docCity', e.target.value, setCity)} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>{t('documents.stampSection')}</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('documents.stampHint')}</p>
            {stampImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={stampImage} alt="stamp" style={{ width: 90, height: 90, objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-sm)' }} />
                <Button variant="secondary" onClick={removeStamp} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={14} />
                  {t('documents.removeStamp')}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={14} />
                {t('documents.uploadStamp')}
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleStampUpload} style={{ display: 'none' }} />
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>{t('documents.debtTemplateTitle')}</h3>
            <textarea
              className="input"
              rows={8}
              value={debtTemplate}
              onChange={(e) => save('docDebtTemplate', e.target.value, setDebtTemplate)}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>{t('documents.creditTemplateTitle')}</h3>
            <textarea
              className="input"
              rows={10}
              value={creditTemplate}
              onChange={(e) => save('docCreditTemplate', e.target.value, setCreditTemplate)}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div className="card" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{t('documents.variablesHint')}</p>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              onClick={() => setPreviewType('debt')}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: '1px solid var(--color-border)',
                background: previewType === 'debt' ? 'var(--color-accent)' : 'transparent',
                color: previewType === 'debt' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {t('report.tabDebts')}
            </button>
            <button
              onClick={() => setPreviewType('credit')}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: '1px solid var(--color-border)',
                background: previewType === 'credit' ? 'var(--color-accent)' : 'transparent',
                color: previewType === 'credit' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {t('report.tabCredits')}
            </button>
          </div>
          <div
            className="card"
            style={{
              background: '#fff',
              color: '#1a1a1a',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Georgia, serif',
              fontSize: 12.5,
              lineHeight: 1.7,
              minHeight: 400,
            }}
          >
            {previewText}
            {stampImage && (
              <div style={{ marginTop: 16 }}>
                <img src={stampImage} alt="stamp" style={{ width: 80, opacity: 0.85 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
