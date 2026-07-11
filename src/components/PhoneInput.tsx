import React from 'react';
import { Input } from './Input';
import { formatPhoneDisplay } from '../lib/masks';

interface Props {
  value: string;
  onChange: (formatted: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder }: Props) {
  return (
    <Input
      type="tel"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(formatPhoneDisplay(e.target.value))}
    />
  );
}
