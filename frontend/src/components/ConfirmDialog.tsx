import { useEffect } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="clip-corner animate-slide-in w-full max-w-md bg-nitro p-px" onClick={(e) => e.stopPropagation()}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          className="clip-corner flex flex-col gap-4 bg-panel p-8"
        >
          <p className="font-mono text-sm text-nitro">{'// CONFIRM'}</p>
          <h2 id="confirm-title" className="font-display text-2xl font-black">{title}</h2>
          <p id="confirm-message" className="text-lg text-muted">{message}</p>
          <div className="mt-2 flex gap-3">
            <button
              autoFocus
              onClick={onConfirm}
              className="clip-btn min-h-12 flex-1 bg-nitro font-display text-sm font-bold tracking-widest text-ink transition hover:brightness-110"
            >
              {confirmLabel}
            </button>
            <button onClick={onCancel} className="min-h-12 border border-line px-6 font-mono text-sm text-muted hover:text-fg">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}