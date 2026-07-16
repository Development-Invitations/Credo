import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, X } from 'lucide-react';
import { Button } from './Button';
import {
  DEFAULT_DEBT_CONTRACT_TEMPLATE,
  DEFAULT_CREDIT_CONTRACT_TEMPLATE,
  fillTemplate,
  ContractVars,
} from '../lib/contractTemplates';

interface Props {
  type: 'debt' | 'credit';
  vars: ContractVars;
  onClose: () => void;
}

export function ContractPrintView({ type, vars, onClose }: Props) {
  const { t } = useTranslation();
  const template =
    localStorage.getItem(type === 'debt' ? 'docDebtTemplate' : 'docCreditTemplate') ||
    (type === 'debt' ? DEFAULT_DEBT_CONTRACT_TEMPLATE : DEFAULT_CREDIT_CONTRACT_TEMPLATE);
  const stampImage = localStorage.getItem('docStampImage') || '';
  const text = fillTemplate(template, vars);

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
