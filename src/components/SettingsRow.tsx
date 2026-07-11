import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SettingsRow({ label, value, children, defaultOpen }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text)',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14 }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13 }}>
          {value}
          <ChevronDown
            size={16}
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
          />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}
