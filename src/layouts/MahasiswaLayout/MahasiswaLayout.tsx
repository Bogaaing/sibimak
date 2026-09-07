import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  House,
  BookOpenCheck,
  MessagesSquare,
  UserRound,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { store } from '../../lib/store';
import { useAuth } from '../../hooks/useAuth';
import { PWAInstallPrompt } from '../../components/pwa/PWAInstallPrompt';

export const MahasiswaLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const studentId = user?.id;
  const currentStudent = store.getStudents().find((s) => s.id === studentId);
  const myClass = currentStudent?.class || store.getClasses().find((c) => c.id === currentStudent?.class_id);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AF';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. TOP MOBILE & DESKTOP HEADER WITH SAFE AREA */}
      <header
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50 shadow-2xs"
      >
        {/* Left: App Brand & Logo */}
        <Link to="/mahasiswa/dashboard" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              SiBiMa
            </h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight leading-none mt-1 hidden xs:block">
              Sistem Bimbingan Mahasiswa
            </p>
          </div>
        </Link>

        {/* Right Controls: Notification & User Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Notification Button (40x40px, min 44x44px touch target) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileMenuOpen(false);
              }}
              title="Notifikasi"
              className="relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EA580C] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifikasi Terbaru
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    2 Baru
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <Link
                    to="/mahasiswa/bimbingan"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-3.5 block hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900">
                      Pengarahan Bimbingan Kelas
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dosen PA menjadwalkan agenda bimbingan kelas. Silakan konfirmasi kehadiran Anda.
                    </p>
                  </Link>
                  <Link
                    to="/mahasiswa/konsultasi"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-3.5 block hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900">
                      Tanggapan Konsultasi Individu
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dosen PA telah memberikan tanggapan pada konsultasi Anda.
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Avatar Button (40x40px, min 44x44px touch target) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotifOpen(false);
              }}
              title="Menu Profil"
              className="w-10 h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <span>{getInitials(user?.full_name)}</span>
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    NIM: {currentStudent?.nim || '2022010101'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {myClass?.name || 'SI-5A'}
                    </span>
                    <span className="text-[10.5px] text-slate-500">Mahasiswa</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/mahasiswa/profil"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <UserRound className="w-4 h-4 text-slate-400" />
                    <span>Profil Saya</span>
                  </Link>

                  <Link
                    to="/mahasiswa/dosen-pa"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>Informasi Dosen PA</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA (Clean Content Offset & Bottom Safe Area) */}
      <main
        style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}
        className="flex-1 w-full max-w-6xl mx-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
      >
        <Outlet />
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR WITH SAFE AREA */}
      <nav
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] px-3 py-1.5 flex items-center justify-around h-16"
      >
        {/* Tab 1: Beranda */}
        <NavLink
          to="/mahasiswa/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all select-none min-h-[44px] ${
              isActive
                ? 'text-[#2563EB] font-bold bg-blue-50/80'
                : 'text-[#94A3B8] hover:text-slate-600 font-medium'
            }`
          }
        >
          <House className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-tight">Beranda</span>
        </NavLink>

        {/* Tab 2: Bimbingan */}
        <NavLink
          to="/mahasiswa/bimbingan"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all select-none min-h-[44px] ${
              isActive
                ? 'text-[#2563EB] font-bold bg-blue-50/80'
                : 'text-[#94A3B8] hover:text-slate-600 font-medium'
            }`
          }
        >
          <BookOpenCheck className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-tight">Bimbingan</span>
        </NavLink>

        {/* Tab 3: Konsultasi */}
        <NavLink
          to="/mahasiswa/konsultasi"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all select-none min-h-[44px] ${
              isActive
                ? 'text-[#2563EB] font-bold bg-blue-50/80'
                : 'text-[#94A3B8] hover:text-slate-600 font-medium'
            }`
          }
        >
          <MessagesSquare className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-tight">Konsultasi</span>
        </NavLink>

        {/* Tab 4: Profil */}
        <NavLink
          to="/mahasiswa/profil"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all select-none min-h-[44px] ${
              isActive
                ? 'text-[#2563EB] font-bold bg-blue-50/80'
                : 'text-[#94A3B8] hover:text-slate-600 font-medium'
            }`
          }
        >
          <UserRound className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] leading-tight">Profil</span>
        </NavLink>
      </nav>

      {/* 4. PWA INSTALL PROMPT (CUSTOM BOTTOM SHEET / MODAL) */}
      <PWAInstallPrompt />
    </div>
  );
};
