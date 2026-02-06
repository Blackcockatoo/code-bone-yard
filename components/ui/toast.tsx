'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { ...options, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
  error: 'bg-red-900/90 border-red-500 text-red-100',
  warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
  info: 'bg-blue-900/90 border-blue-500 text-blue-100',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '\u2714',
  error: '\u2716',
  warning: '\u26A0',
  info: '\u2139',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-slide-in rounded-lg border p-4 shadow-lg backdrop-blur-sm
            ${variantStyles[toast.variant]}
          `}
          onClick={() => onDismiss(toast.id)}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{variantIcons[toast.variant]}</span>
            <div className="flex-1">
              <div className="font-semibold text-sm">{toast.title}</div>
              {toast.description && (
                <div className="text-xs opacity-90 mt-1">{toast.description}</div>
              )}
            </div>
            <button
              className="text-white/60 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
            >
              \u2715
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
