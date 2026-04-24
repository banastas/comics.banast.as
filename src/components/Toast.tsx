import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X, type LucideIcon } from 'lucide-react';
import { useToastStore, type ToastType } from '../stores/toastStore';

const iconMap: Record<ToastType, LucideIcon> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap: Record<ToastType, string> = {
  success: 'text-emerald-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6 max-sm:left-4 max-sm:right-4 max-sm:items-center">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated border border-slate-700/50 shadow-card-hover backdrop-blur-sm max-w-sm w-full ${
              toast.exiting ? 'animate-toast-out' : 'animate-toast-in'
            }`}
          >
            <Icon size={18} className={colorMap[toast.type]} />
            <span className="text-sm text-slate-200 flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
