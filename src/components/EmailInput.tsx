import React, { useMemo, useState } from 'react';
import { Input } from './Input';

const COMMON_DOMAINS = ['gmail.com', 'mail.ru', 'yandex.ru', 'yandex.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yahoo.com', 'bk.ru', 'inbox.ru'];

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EmailInput({ value, onChange, placeholder }: Props) {
  const [focused, setFocused] = useState(false);

  const atIndex = value.indexOf('@');
  const localPart = atIndex >= 0 ? value.slice(0, atIndex) : value;
  const typedDomain = atIndex >= 0 ? value.slice(atIndex + 1) : '';

  const suggestions = useMemo(() => {
    if (atIndex < 0 || !localPart) return [];
    return COMMON_DOMAINS.filter((d) => d.startsWith(typedDomain)).slice(0, 5);
  }, [atIndex, localPart, typedDomain]);

  const showDropdown = focused && atIndex >= 0 && suggestions.length > 0 && !suggestions.includes(typedDomain);

  return (
    <div style={{ position: 'relative' }}>
      <Input
        type="email"
        inputMode="email"
        placeholder={placeholder || 'test@gmail.com'}
        value={value}
        onChange={(e) => onChange(e.target.value.trim().toLowerCase())}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-elevated)',
            zIndex: 60,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => onChange(`${localPart}@${domain}`)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 13,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {localPart}@{domain}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
