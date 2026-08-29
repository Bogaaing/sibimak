import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { House, BookOpenCheck, MessagesSquare, UserRound, Bell } from 'lucide-react';
import { store } from '../../lib/store';

export const MahasiswaLayout: React.FC = () => {
  const activeYear = store.getActiveAcademicYear();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans pb-[76px]">
      {/* 1. TOP MOBILE HEADER */}
      <header className="no-print bg-white border-b border-slate-200/90 h-[58px] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/app-logo.png"
            alt="Si-BimAk"
            className="w-7 h-7 rounded-lg object-contain flex-shrink-0 shadow-xs"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
              Si-BimAk
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden xs:inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {activeYear?.name ? activeYear.name.split(' ')[2] || 'Ganjil' : 'Ganjil'}
          </span>

          <button
            title="Notifikasi"
            className="relative p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA (Centered on Desktop/Tablet, Full Width on Mobile) */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around h-[68px] max-w-md mx-auto sm:max-w-xl sm:rounded-t-2xl">
        {/* Tab 1: Beranda */}
        <NavLink
          to="/mahasiswa/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors select-none ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          <House className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10.5px] leading-tight">Beranda</span>
        </NavLink>

        {/* Tab 2: Bimbingan */}
        <NavLink
          to="/mahasiswa/bimbingan"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors select-none ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          <BookOpenCheck className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10.5px] leading-tight">Bimbingan</span>
        </NavLink>

        {/* Tab 3: Konsultasi */}
        <NavLink
          to="/mahasiswa/konsultasi"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors select-none ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          <MessagesSquare className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10.5px] leading-tight">Konsultasi</span>
        </NavLink>

        {/* Tab 4: Profil */}
        <NavLink
          to="/mahasiswa/profil"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors select-none ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          <UserRound className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10.5px] leading-tight">Profil</span>
        </NavLink>
      </nav>
    </div>
  );
};
