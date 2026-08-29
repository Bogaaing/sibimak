import React from 'react';
import { clsx } from 'clsx';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id, checked, ...props }, ref) => {
    const radioId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label htmlFor={radioId} className="flex items-start gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={radioId}
            type="radio"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              'w-4 h-4 rounded-full border transition-colors flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-blue-500/20',
              checked
                ? 'border-blue-600'
                : 'bg-white border-slate-300 peer-hover:border-slate-400',
              className
            )}
          >
            {checked && <div className="w-2 h-2 rounded-full bg-blue-600" />}
          </div>
        </div>
        {(label || description) && (
          <div className="text-xs">
            {label && <span className="font-semibold text-slate-800">{label}</span>}
            {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
