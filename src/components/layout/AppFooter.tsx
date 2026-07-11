import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    electronAPI?: { getAppVersion: () => Promise<string> };
  }
}

export function AppFooter() {
  const [version, setVersion] = useState('0.1.0');

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setVersion);
  }, []);

  return (
    <footer
      style={{
        height: 36,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
        fontSize: 12,
        color: 'var(--color-text-muted)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-accent)' }}>
        Credo
      </span>
      <span>· v{version}</span>
    </footer>
  );
}
