import React from 'react';
import {
  Download,
  X,
  Zap,
  Smartphone,
  BadgeCheck,
  Share,
  Plus,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallPrompt: React.FC = () => {
  const { showPrompt, isIOS, promptInstall, dismissPrompt } = usePWAInstall();

  if (!showPrompt) return null;

  return (
    <>
      {/* Subtle Backdrop */}
      <div
        onClick={dismissPrompt}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[99] animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* 1. MOBILE BOTTOM SHEET (Screen < 768px)                                   */}
      {/* ========================================================================= */}
      <div
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[24px] border-t border-slate-200 shadow-2xl p-5 animate-in slide-in-from-bottom duration-300 max-w-md mx-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Pasang SiBiMa di perangkat Anda"
      >
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        {/* Top Right Close Button */}
        <div className="flex justify-end -mt-2 -mr-1">
          <button
            type="button"
            onClick={dismissPrompt}
            title="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors min-h-[32px] min-w-[32px]"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Brand & Heading */}
        <div className="flex items-start gap-3.5 -mt-2">
          <img
            src="/assets/app-logo.png"
            alt="SiBiMa"
            className="w-12 h-12 rounded-xl object-contain flex-shrink-0 shadow-2xs border border-slate-100"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Pasang SiBiMa di perangkat Anda
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Akses bimbingan akademik lebih cepat langsung dari layar utama.
            </p>
          </div>
        </div>

        {/* iOS Safari Guide (if on iOS) */}
        {isIOS ? (
          <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center">
              Petunjuk Pemasangan di iPhone / iPad:
            </p>
            <div className="flex items-center justify-around gap-2 text-center text-xs">
              <div className="flex-1 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Share className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="inline-block px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Langkah 1
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Ketuk tombol <strong>Share</strong> di Safari
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mb-4" />

              <div className="flex-1 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="inline-block px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Langkah 2
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Pilih <strong>Add to Home Screen</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3 Compact Benefits */
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 my-3.5">
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Zap className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                Akses lebih cepat
              </span>
            </div>

            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Smartphone className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                Tampilan seperti aplikasi
              </span>
            </div>

            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <BadgeCheck className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                Tetap nyaman digunakan
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isIOS ? (
            <button
              type="button"
              onClick={dismissPrompt}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-2xs transition-colors"
            >
              Mengerti
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={promptInstall}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install SiBiMa</span>
              </button>

              <button
                type="button"
                onClick={dismissPrompt}
                className="w-full h-10 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center transition-colors"
              >
                Nanti saja
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP / TABLET COMPACT MODAL (Screen >= 768px)                       */}
      {/* ========================================================================= */}
      <div
        className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 z-[100] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Pasang SiBiMa di perangkat Anda"
      >
        {/* Header with Logo & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/app-logo.png"
              alt="SiBiMa"
              className="w-8 h-8 rounded-lg object-contain shadow-2xs"
            />
            <span className="text-sm font-bold text-slate-900">SiBiMa</span>
          </div>
          <button
            type="button"
            onClick={dismissPrompt}
            title="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Pasang SiBiMa di perangkat Anda
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Akses bimbingan akademik lebih cepat langsung dari layar utama perangkat Anda.
            </p>
          </div>

          {/* Benefits in Vertical Compact Rows */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="font-semibold text-slate-700">Akses lebih cepat</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="font-semibold text-slate-700">Tampilan seperti aplikasi</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="font-semibold text-slate-700">Tetap nyaman digunakan</span>
            </div>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={dismissPrompt}
            className="py-2.5 px-4 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors min-h-[42px]"
          >
            Nanti saja
          </button>
          <button
            type="button"
            onClick={promptInstall}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-colors min-h-[42px]"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install SiBiMa</span>
          </button>
        </div>
      </div>
    </>
  );
};
