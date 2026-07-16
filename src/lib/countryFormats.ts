export interface CountryFormat {
  code: string;
  flagLabel: string;
  shortLabel: string;
  phoneTemplate: string;
  passportPlaceholder: string;
}

export const COUNTRY_FORMATS: CountryFormat[] = [
  { code: 'uz', flagLabel: "UZ +998", shortLabel: 'UZ', phoneTemplate: '+998 (99) 999-99-99', passportPlaceholder: 'AD 1234567' },
  { code: 'ru', flagLabel: 'RU +7', shortLabel: 'RU', phoneTemplate: '+7 (999) 999-99-99', passportPlaceholder: '12 34 567890' },
  { code: 'tj', flagLabel: 'TJ +992', shortLabel: 'TJ', phoneTemplate: '+992 (99) 999-99-99', passportPlaceholder: 'A1234567' },
  { code: 'kz', flagLabel: 'KZ +7', shortLabel: 'KZ', phoneTemplate: '+7 (999) 999-99-99', passportPlaceholder: 'N12345678' },
  { code: 'kg', flagLabel: 'KG +996', shortLabel: 'KG', phoneTemplate: '+996 (999) 999-999', passportPlaceholder: 'ID1234567' },
];

export function getCountryFormat(code: string): CountryFormat {
  return COUNTRY_FORMATS.find((c) => c.code === code) ?? COUNTRY_FORMATS[0];
}
