import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpTooltip } from '../../components/HelpTooltip';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import {
  getDefaultDebtTemplate,
  getDefaultCreditTemplate,
  fillTemplate,
} from '../../lib/contractTemplates';

export function DocumentsSettingsPage() {
  const { t } = useTranslation();
  const { language } = useApp();
  const [companyName, setCompanyName] = useState(localStorage.getItem('docCompanyName') || '');
  const [companyDetails, setCompanyDetails] = useState(localStorage.getItem('docCompanyDetails') || '');
  const [city, setCity] = useState(localStorage.getItem('docCity') || '');
  const [stampImage, setStampImage] = useState(localStorage.getItem('docStampImage') || '');
  const [debtTemplate, setDebtTemplate] = useState(localStorage.getItem('docDebtTemplate') || getDefaultDebtTemplate(language));
  const [creditTemplate, setCreditTemplate] = useState(localStorage.getItem('docCreditTemplate') || getDefaultCreditTemplate(language));
  const [customClauses, setCustomClauses] = useState(localStorage.getItem('docCustomClauses') || '');
  const [printSchedule, setPrintSchedule] = useState(localStorage.getItem('docPrintSchedule') !== 'false');
  const [previewType, setPreviewType] = useState<'debt' | 'credit'>('debt');
  const fileRef = useRef<HTMLInputElement>(null);

  function resetDebtTemplate() {
    const def = getDefaultDebtTemplate(language);
    setDebtTemplate(def);
    localStorage.removeItem('docDebtTemplate');
  }

  function resetCreditTemplate() {
    const def = getDefaultCreditTemplate(language);
    setCreditTemplate(def);
    localStorage.removeItem('docCreditTemplate');
  }

  function togglePrintSchedule(v: boolean) {
    setPrintSchedule(v);
    localStorage.setItem('docPrintSchedule', v ? 'true' : 'false');
  }

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
    customClauses: customClauses || t('documents.sampleCustomClause'),
  };

  const previewText = fillTemplate(previewType === 'debt' ? debtTemplate : creditTemplate, sampleVars);

  return (
    <div style={{ maxWidth: 1120, margin: '32px auto', padding: '0 24px 40px' }}>
      <h1 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        {t('sidebar.documents')}
        <HelpTooltip text={t('help.documents')} width={300} />
      </h1>
      <div
        className="card"
        style={{ marginBottom: 24, background: 'color-mix(in srgb, var(--color-danger) 8%, var(--color-surface))', borderColor: 'var(--color-danger)' }}
      >
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{t('documents.legalDisclaimer')}</p>
      </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 14 }}>{t('documents.debtTemplateTitle')}</h3>
              <button
                onClick={resetDebtTemplate}
                title={t('documents.resetToLanguage') ?? ''}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                <RotateCcw size={12} />
                {t('documents.resetToLanguage')}
              </button>
            </div>
            <textarea
              className="input"
              rows={8}
              value={debtTemplate}
              onChange={(e) => save('docDebtTemplate', e.target.value, setDebtTemplate)}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 14 }}>{t('documents.creditTemplateTitle')}</h3>
              <button
                onClick={resetCreditTemplate}
                title={t('documents.resetToLanguage') ?? ''}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                <RotateCcw size={12} />
                {t('documents.resetToLanguage')}
              </button>
            </div>
            <textarea
              className="input"
              rows={10}
              value={creditTemplate}
              onChange={(e) => save('docCreditTemplate', e.target.value, setCreditTemplate)}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13 }}>{t('documents.printScheduleToggle')}</span>
              <Checkbox checked={printSchedule} onChange={togglePrintSchedule} />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 4 }}>{t('documents.customClausesTitle')}</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>{t('documents.customClausesHint')}</p>
            <textarea
              className="input"
              rows={4}
              placeholder={t('documents.sampleCustomClause') ?? ''}
              value={customClauses}
              onChange={(e) => save('docCustomClauses', e.target.value, setCustomClauses)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 4 }}>{t('documents.variablesTitle')}</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('documents.variablesIntro')}</p>
            <div style={{ display: 'grid', gap: 6 }}>
              {[
                'number', 'city', 'date', 'amount', 'currency', 'takenDate', 'dueDate', 'comment',
                'companyName', 'companyDetails', 'interestType', 'rate', 'term', 'monthlyPayment',
                'passport', 'address', 'phone', 'customClauses',
              ].map((key) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12,
                    background: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                  }}
                >
                  <code
                    style={{
                      fontFamily: 'monospace',
                      color: 'var(--color-accent)',
                      background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      flexShrink: 0,
                      minWidth: 130,
                    }}
                  >
                    {`{{${key}}}`}
                  </code>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t(`documents.var_${key}`)}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-accent)', marginTop: 12, lineHeight: 1.6 }}>
              {t('documents.blankSignatureNote')}
            </p>
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
