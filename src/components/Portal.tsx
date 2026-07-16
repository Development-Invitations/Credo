import { createPortal } from 'react-dom';

/**
 * Рендерит children напрямую в document.body, а не в текущем месте DOM-дерева.
 * Нужен для модалок/подтверждений, которые иначе могут "обрезаться" или смещаться,
 * если вложены глубоко внутри прокручиваемых контейнеров (например, внутри выезжающей
 * панели клиента, которая сама находится внутри прокручиваемой области страницы).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}
