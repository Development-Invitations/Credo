import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, children }: Props) {
  // Держим компонент смонтированным чуть дольше закрытия, чтобы доиграла анимация выезда
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
      <div
        onTransitionEnd={() => {
          if (!open) setMounted(false);
        }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 380,
          maxWidth: '90vw',
          background: 'var(--color-bg-elevated)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-elevated)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ fontSize: 16 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
