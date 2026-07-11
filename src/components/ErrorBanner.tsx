import React from 'react';

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'color-mix(in srgb, var(--color-danger) 14%, var(--color-surface))',
        border: '1px solid color-mix(in srgb, var(--color-danger) 40%, transparent)',
        color: 'var(--color-danger)',
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      <span style={{ flexShrink: 0 }}>⚠</span>
      <span>{children}</span>
    </div>
  );
}
