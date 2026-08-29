import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, checked, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              'w-4 h-4 rounded border transition-colors flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-blue-500/20',
              checked
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-300 peer-hover:border-slate-400',
              className
            )}
          >
            {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
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

Checkbox.displayName = 'Checkbox';
