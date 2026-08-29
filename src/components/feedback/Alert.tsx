import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />,
  };

  const variants = {
    success: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
    error: 'bg-rose-50/80 border-rose-200 text-rose-950',
    warning: 'bg-amber-50/80 border-amber-200 text-amber-950',
    info: 'bg-blue-50/80 border-blue-200 text-blue-950',
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border text-xs leading-relaxed',
        variants[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
};
