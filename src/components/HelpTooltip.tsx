import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  text: string;
  width?: number;
}

export function HelpTooltip({ text, width = 280 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          display: 'flex',
          padding: 2,
        }}
        title="?"
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-elevated)',
            padding: 12,
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            zIndex: 80,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
