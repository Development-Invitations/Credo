import React from 'react';
import { Input } from './Input';
import { formatPhoneDisplay, phoneExample } from '../lib/masks';
import { useApp } from '../context/AppContext';

interface Props {
  value: string;
  onChange: (formatted: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder }: Props) {
  const { language } = useApp();
  return (
    <Input
      type="tel"
      placeholder={placeholder || phoneExample(language)}
      value={value}
      onChange={(e) => onChange(formatPhoneDisplay(e.target.value, language))}
    />
  );
}
