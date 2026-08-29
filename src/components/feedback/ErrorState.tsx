import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat menghubungkan ke server. Silakan periksa koneksi atau coba beberapa saat lagi.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-rose-200/80 shadow-2xs space-y-3">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-1">
        <AlertCircle className="w-6 h-6 stroke-[1.8]" />
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-bold text-slate-900 leading-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-normal">{message}</p>
      </div>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-2 flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </Button>
      )}
    </div>
  );
};
