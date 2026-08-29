import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  message: string;
  description?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  description,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    warning: 'border-amber-200 bg-white',
    info: 'border-blue-200 bg-white',
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-3.5 rounded-xl border shadow-lg max-w-sm w-full animate-in slide-in-from-top-2 duration-150',
        borders[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 leading-tight">{message}</p>
        {description && (
          <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
