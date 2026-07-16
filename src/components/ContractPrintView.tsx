import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, X } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import {
  getDefaultDebtTemplate,
  getDefaultCreditTemplate,
  fillTemplate,
  ContractVars,
} from '../lib/contractTemplates';

interface SchedulePayment {
  due_date: string;
  expected_amount: number;
  is_confirmed: boolean;
}

interface Props {
  type: 'debt' | 'credit';
  vars: ContractVars;
  schedule?: SchedulePayment[];
  onClose: () => void;
}

export function ContractPrintView({ type, vars, schedule, onClose }: Props) {
  const { t } = useTranslation();
  const { language } = useApp();
  const template =
    localStorage.getItem(type === 'debt' ? 'docDebtTemplate' : 'docCreditTemplate') ||
    (type === 'debt' ? getDefaultDebtTemplate(language) : getDefaultCreditTemplate(language));
  const stampImage = localStorage.getItem('docStampImage') || '';
  const customClauses = localStorage.getItem('docCustomClauses') || '';
  const printSchedule = localStorage.getItem('docPrintSchedule') !== 'false';
  const text = fillTemplate(template, { ...vars, customClauses: vars.customClauses || customClauses });

  return (
    <div className="contract-overlay" style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#2a2a2a', display: 'flex', flexDirection: 'column' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={16} />
          {t('documents.close')}
        </button>
        <Button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Printer size={15} />
          {t('documents.printButton')}
        </Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: 24 }}>
        <div
          className="contract-page"
          style={{
            background: '#fff',
            color: '#1a1a1a',
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Georgia, serif',
            fontSize: 13,
            lineHeight: 1.8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          {text}

          {type === 'credit' && printSchedule && schedule && schedule.length > 0 && (
            <div style={{ marginTop: 24, pageBreakInside: 'avoid' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('documents.scheduleAppendixTitle')}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #999', padding: '4px 6px' }}>{t('debtDetail.dueDate')}</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #999', padding: '4px 6px' }}>{t('credit.totalLabel')}</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #999', padding: '4px 6px' }}>{t('credit.statusLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((p, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 6px', borderBottom: '1px solid #ddd' }}>{new Date(p.due_date).toLocaleDateString()}</td>
                      <td style={{ padding: '4px 6px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                        {Number(p.expected_amount).toLocaleString()} {vars.currency}
                      </td>
                      <td style={{ padding: '4px 6px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                        {p.is_confirmed ? t('credit.confirmedStatus') : t('credit.unconfirmedStatus')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {stampImage && <img src={stampImage} alt="stamp" style={{ width: 100, marginTop: 24, opacity: 0.85 }} />}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .contract-overlay { position: static !important; background: none !important; }
          body * { visibility: hidden; }
          .contract-page, .contract-page * { visibility: visible; }
          .contract-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
            width: auto !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
