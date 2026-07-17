import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  text: string;
  width?: number;
}

export function HelpTooltip({ text, width = 280 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(width);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Пересчитываем позицию так, чтобы подсказка не вылезала за правый край окна —
  // иначе у элементов ближе к правому краю (например, у крайней карточки на "Главной")
  // тултип создавал горизонтальную прокрутку всей страницы.
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const margin = 16;
    const rect = btnRef.current.getBoundingClientRect();
    const w = Math.min(width, window.innerWidth - margin * 2);
    const overflowRight = rect.left + w - (window.innerWidth - margin);
    const left = overflowRight > 0 ? -overflowRight : 0;
    setTooltipWidth(w);
    setOffsetLeft(left);
  }, [open, width]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          display: 'flex',
          padding: 2,
        }}
        title="?"
      >
        <HelpCircle size={16} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: offsetLeft,
            width: tooltipWidth,
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-elevated)',
            padding: 12,
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            zIndex: 80,
            boxSizing: 'border-box',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
