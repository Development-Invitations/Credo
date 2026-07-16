import React from 'react';
import { Input } from './Input';
import { getCountryFormat } from '../lib/countryFormats';

interface Props {
  value: string;
  onChange: (value: string) => void;
  country: string;
  required?: boolean;
}

/**
 * Поле паспортных данных — с примером формата под выбранную страну. Не жёсткая маска
 * (форматы паспортов в разных странах меняются и не всегда документированы одинаково) —
 * просто подсказка-плейсхолдер, ввод остаётся свободным.
 */
export function PassportInput({ value, onChange, country, required }: Props) {
  const fmt = getCountryFormat(country);
  return (
    <Input
      required={required}
      placeholder={fmt.passportPlaceholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
