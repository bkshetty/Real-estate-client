import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg max-h-[90vh] flex flex-col font-outfit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-xl font-playfair font-medium tracking-wide text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Confirm / danger modal */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-rose-900/20 w-full max-w-sm p-6 space-y-4 font-outfit">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div className="pt-1">
            <h3 className="font-playfair text-lg text-white font-medium tracking-wide">{title || 'Confirm Delete'}</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{message || 'This action cannot be undone.'}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm uppercase tracking-wider font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-5 py-2.5 text-sm uppercase tracking-wider font-semibold text-slate-900 bg-rose-400 rounded-lg hover:bg-rose-300 hover:shadow-[0_0_15px_rgba(251,113,133,0.4)] transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
