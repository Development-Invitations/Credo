import React from 'react';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
      <input type="checkbox" className="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
