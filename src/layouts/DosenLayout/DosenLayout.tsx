import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  School,
  UsersRound,
  BookOpenCheck,
  MessagesSquare,
  History,
  FileText,
  Bell,
  UserRound,
  LogOut,
  CalendarDays,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { store } from '../../lib/store';

export const DosenLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeYear = store.getActiveAcademicYear();
  const pendingConsultations = store.getIndividualRequests().filter(
    (r) => r.lecturer_id === user?.id && (r.status === 'DIAJUKAN' || r.status === 'DIPROSES')
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'DA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. DESKTOP / TABLET SIDEBAR (Dark Navy 260px) */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-[260px] bg-[#0c1322] text-slate-300 flex flex-col border-r border-[#1a2337] transition-transform duration-200 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Area */}
        <div className="h-[64px] px-5 flex items-center gap-3 border-b border-[#1a2337]">
          <img
            src="/assets/app-logo.png"
            alt="Si-BimAk"
            className="w-8 h-8 rounded-lg object-contain flex-shrink-0 shadow-xs"
          />
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight truncate">
              Si-BimAk
            </h1>
            <p className="text-[10.5px] text-slate-400 font-medium tracking-wide leading-tight truncate">
              Bimbingan Akademik
            </p>
          </div>
        </div>

        {/* Navigation List Area */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
          {/* Section 1: UTAMA */}
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Utama
            </div>
            <NavLink
              to="/dosen/dashboard"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                }`
              }
            >
              <LayoutDashboard className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Section 2: BIMBINGAN KELAS */}
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Bimbingan Kelas
            </div>
            <div className="space-y-1">
              <NavLink
                to="/dosen/kelas"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <School className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                <span>Kelas Bimbingan</span>
              </NavLink>

              <NavLink
                to="/dosen/mahasiswa"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <UsersRound className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                <span>Mahasiswa Bimbingan</span>
              </NavLink>

              <NavLink
                to="/dosen/bimbingan-kelas"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <BookOpenCheck className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                <span>Bimbingan Kelas</span>
              </NavLink>
            </div>
          </div>

          {/* Section 3: BIMBINGAN INDIVIDU */}
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Bimbingan Individu
            </div>
            <div className="space-y-1">
              <NavLink
                to="/dosen/bimbingan-individu"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MessagesSquare className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                  <span className="truncate">Bimbingan Individu</span>
                </div>
                {pendingConsultations > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex-shrink-0">
                    {pendingConsultations}
                  </span>
                )}
              </NavLink>
            </div>
          </div>

          {/* Section 4: LAPORAN */}
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Laporan
            </div>
            <div className="space-y-1">
              <NavLink
                to="/dosen/riwayat"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <History className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                <span>Riwayat Bimbingan</span>
              </NavLink>

              <NavLink
                to="/report/formulir?studentId=usr-mhs-1"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]'
                  }`
                }
              >
                <FileText className="w-[18px] h-[18px] stroke-[1.8] flex-shrink-0" />
                <span>Laporan & Form</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Profile Card & Logout Area */}
        <div className="p-3 border-t border-[#1a2337] bg-[#090e1a] relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-2 rounded-lg bg-[#111a2e] border border-[#1e2a47] hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs flex-shrink-0">
                {getInitials(user?.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-white truncate leading-tight">
                  {user?.full_name || 'Ahmad Asep Suhendi'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                  Dosen PA • NIDN 0411099202
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Topbar */}
        <header className="no-print bg-white border-b border-slate-200/90 h-[70px] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 stroke-[1.8]" />
            </button>

            <div>
              <h2 className="text-[16px] sm:text-[17px] font-bold text-slate-900 leading-tight truncate">
                Selamat datang, {user?.full_name || 'Ahmad Asep Suhendi'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate hidden sm:block">
                Kelola bimbingan akademik kelas dan konsultasi individual mahasiswa Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs text-slate-700 font-medium shadow-2xs">
              <CalendarDays className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
              <span className="font-semibold">{activeYear?.name || 'Tahun Akademik 2026/2027 Ganjil'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 stroke-[1.8]" />
            </div>

            <button
              title="Notifikasi"
              className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9.5px] font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                3
              </span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 shadow-2xs">
              <UserRound className="w-3.5 h-3.5 text-slate-600 stroke-[1.8]" />
              <span className="uppercase text-[11px] tracking-wide">DOSEN PA</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 stroke-[1.8]" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
