import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { DebtDetailModal } from './DebtDetailModal';

export interface DebtRow {
  id: string;
  amount: number;
  paid_amount: number;
  currency: string;
  due_date: string | null;
  status: 'active' | 'paid';
  comment: string | null;
  created_at: string;
}

interface Props {
  debt: DebtRow;
  clientId: string;
  onChanged: () => void;
  readOnly?: boolean;
}

export function DebtItem({ debt, clientId, onChanged, readOnly }: Props) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);

  const remaining = Math.max(Number(debt.amount) - Number(debt.paid_amount || 0), 0);
  const overdue =
    debt.status === 'active' &&
    remaining > 0 &&
    !!debt.due_date &&
    new Date(debt.due_date) < new Date(new Date().toDateString());

  return (
    <>
      <div
        className="card"
        onClick={() => setShowDetail(true)}
        style={{
          opacity: debt.status === 'paid' ? 0.6 : 1,
          borderColor: overdue ? 'var(--color-danger)' : 'var(--color-border)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="amount" style={{ fontSize: 15 }}>
            {Number(debt.amount).toLocaleString()} {debt.currency}
            {debt.paid_amount > 0 && debt.status === 'active' && (
              <span style={{ fontSize: 12, color: 'var(--color-success)', marginLeft: 8 }}>
                {t('clientDetail.paidSoFar', { amount: Number(debt.paid_amount).toLocaleString() })}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
            {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : new Date(debt.created_at).toLocaleDateString()}
            {debt.comment ? ` — ${debt.comment}` : ''}
          </div>
        </div>
        <ChevronRight size={16} color="var(--color-text-muted)" />
      </div>

      {showDetail && (
        <DebtDetailModal
          debt={debt}
          clientId={clientId}
          readOnly={readOnly}
          onClose={() => setShowDetail(false)}
          onChanged={onChanged}
        />
      )}
    </>
  );
}
