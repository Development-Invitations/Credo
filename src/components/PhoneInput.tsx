import React, { useState } from 'react';
import { Input } from './Input';
import { formatPhoneDisplay } from '../lib/masks';
import { COUNTRY_FORMATS, getCountryFormat } from '../lib/countryFormats';

interface Props {
  value: string;
  onChange: (formatted: string) => void;
  placeholder?: string;
  required?: boolean;
  country?: string;
  onCountryChange?: (code: string) => void;
}

export function PhoneInput({ value, onChange, placeholder, required, country: controlledCountry, onCountryChange }: Props) {
  const [internalCountry, setInternalCountry] = useState(localStorage.getItem('docsCountry') || 'uz');
  const country = controlledCountry ?? internalCountry;

  function changeCountry(code: string) {
    if (onCountryChange) {
      onCountryChange(code);
    } else {
      setInternalCountry(code);
      localStorage.setItem('docsCountry', code);
    }
    // Пересчитываем уже введённый номер под новую маску
    onChange(formatPhoneDisplay(value, code));
  }

  const fmt = getCountryFormat(country);

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <select
        className="input"
        value={country}
        onChange={(e) => changeCountry(e.target.value)}
        style={{ width: 78, flexShrink: 0, padding: '8px 6px', textAlign: 'center', fontSize: 12 }}
      >
        {COUNTRY_FORMATS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flagLabel}
          </option>
        ))}
      </select>
      <Input
        type="tel"
        required={required}
        placeholder={placeholder || fmt.phoneTemplate}
        value={value}
        onChange={(e) => onChange(formatPhoneDisplay(e.target.value, country))}
        style={{ flex: 1 }}
      />
    </div>
  );
}
