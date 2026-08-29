import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Calendar, ChevronDown, Menu } from 'lucide-react';
import { store } from '../../lib/store';

interface HeaderProps {
  title?: string;
  description?: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, description, onMenuToggle }) => {
  const { user } = useAuth();
  const activeYear = store.getActiveAcademicYear();

  return (
    <header className="no-print bg-white border-b border-slate-200/90 h-[72px] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left Header / Welcome Greeting */}
      <div className="flex items-center gap-3.5 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h2 className="text-[17px] font-bold text-slate-900 leading-tight truncate">
            {title || `Selamat datang, ${user?.full_name}`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">
            {description || 'Kelola bimbingan akademik kelas dan konsultasi individual mahasiswa Anda.'}
          </p>
        </div>
      </div>

      {/* Right Controls: Academic Year Selector, Notification, Role Dropdown */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {/* Academic Year Dropdown Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs text-slate-700 font-medium shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold">{activeYear?.name || 'Tahun Akademik 2026/2027 Ganjil'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Notifications with Badge */}
        <button
          title="Notifikasi"
          className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9.5px] font-bold flex items-center justify-center border-2 border-white shadow-2xs">
            3
          </span>
        </button>

        {/* Role Pill Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 shadow-2xs">
          <span className="uppercase text-[11px] tracking-wide">
            {user?.role === 'dosen' ? 'DOSEN PA' : user?.role}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
};
