import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  style?: React.CSSProperties;
}

export function Select({ value, onChange, options, style }: Props) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ appearance: 'none', paddingRight: 32, width: '100%' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
