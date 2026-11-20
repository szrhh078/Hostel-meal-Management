import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

type Props = { title: string; subtitle?: string; error?: string; onClose: () => void; onSubmit: (e: FormEvent) => void; children: ReactNode; submitLabel: ReactNode; busy?: boolean };

/** Accessible form modal shared by the Bazar and Advances pages. */
export default function Modal({ title, subtitle, error, onClose, onSubmit, children, submitLabel, busy }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('input, select')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title} onSubmit={onSubmit}>
        <div className="modal-head">
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="auth-message error" role="alert">{error}</div>}
        {children}
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={busy}>{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
