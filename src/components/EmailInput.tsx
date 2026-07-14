import React from 'react';
import { Input } from './Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function EmailInput({ value, onChange, placeholder }: Props) {
  const invalid = value.length > 0 && !EMAIL_RE.test(value);
  return (
    <Input
      type="email"
      inputMode="email"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value.trim())}
      style={invalid ? { borderColor: 'var(--color-danger)' } : undefined}
    />
  );
}
