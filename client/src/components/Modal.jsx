import { useEffect } from 'react';
import { X } from 'lucide-react';
export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => { if (!open) return; const key = (event) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></header><div className="modal-body">{children}</div></section></div>;
}
