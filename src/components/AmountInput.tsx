import React from 'react';
import { Input } from './Input';
import { formatAmountDisplay } from '../lib/masks';

interface Props {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export function AmountInput({ value, onChange, placeholder, required, style }: Props) {
  return (
    <Input
      inputMode="decimal"
      placeholder={placeholder}
      required={required}
      style={style}
      value={formatAmountDisplay(value)}
      onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
    />
  );
}
