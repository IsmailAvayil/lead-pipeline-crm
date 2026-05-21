import React, { useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '../../types/crm';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCRM();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-glow-emerald',
          icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-glow-amber',
          icon: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-glow-rose',
          icon: <AlertCircle size={16} className="text-rose-400 shrink-0" />,
        };
      default:
        return {
          bg: 'bg-indigo-950/90 border-indigo-500/30 text-indigo-100 shadow-glow-primary',
          icon: <Info size={16} className="text-indigo-400 shrink-0" />,
        };
    }
  };

  const styles = getStyle();

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-slideInRight ${styles.bg}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {styles.icon}
        <p className="text-xs font-semibold leading-relaxed truncate">{toast.message}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-indigo-500 text-[10px] font-bold text-white hover:bg-indigo-600 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => onRemove(toast.id)}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Close message"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
