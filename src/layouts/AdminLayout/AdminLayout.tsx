import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  UserRoundCog,
  GraduationCap,
  School,
  CalendarDays,
  GitBranch,
  Bell,
  UserRound,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { store } from '../../lib/store';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeYear = store.getActiveAcademicYear();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. LIGHT PROFESSIONAL SAAS SIDEBAR (260px) */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 w-[260px] bg-white text-slate-700 flex flex-col border-r border-slate-200/90 shadow-2xs transition-transform duration-200 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Area */}
        <div className="h-[70px] px-5 flex items-center gap-3 border-b border-slate-100">
          <img
            src="/assets/app-logo.png"
            alt="SiBiMa"
            className="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-2xs"
          />
          <div className="min-w-0">
            <h1 className="text-[16px] font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              SiBiMa
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
              Administrator Master
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Utama
            </div>
            <NavLink
              to="/admin/dashboard"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Master Akademik
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/dosen"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <UserRoundCog className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>Data Dosen PA</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/mahasiswa"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <GraduationCap className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>Data Mahasiswa</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/kelas"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <School className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>Data Kelas</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/tahun-akademik"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <CalendarDays className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>Tahun Akademik</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/plotting"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all select-none ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <GitBranch className={`w-[18px] h-[18px] stroke-[1.8] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>Plotting Dosen PA</span>
                  </>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                {getInitials(user?.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-slate-900 truncate leading-tight">
                  {user?.full_name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5 leading-tight">
                  Super Administrator
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        {/* Topbar Header */}
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
                Panel Kontrol Administrator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate hidden sm:block">
                Manajemen data master bimbingan akademik, dosen PA, mahasiswa, dan plotting kelas.
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
                2
              </span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 shadow-2xs">
              <UserRound className="w-3.5 h-3.5 text-slate-600 stroke-[1.8]" />
              <span className="uppercase text-[11px] tracking-wide">ADMINISTRATOR</span>
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
