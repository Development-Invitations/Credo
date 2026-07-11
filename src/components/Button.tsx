import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className}`} {...rest} />;
}
