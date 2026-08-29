import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  BookOpen, 
  MessageSquare, 
  History, 
  FileText, 
  LogOut,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Calendar,
  Settings,
  ShieldCheck,
  User
} from 'lucide-react';
import { store } from '../../lib/store';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const lecturerProfile = store.getLecturers().find(l => l.id === user?.id);
  const pendingConsultations = store.getIndividualRequests().filter(
    r => r.lecturer_id === user?.id && (r.status === 'DIAJUKAN' || r.status === 'DIPROSES')
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation schema based on role
  const renderNavSections = () => {
    if (user?.role === 'dosen') {
      return (
        <div className="space-y-4">
          {/* Section 1: UTAMA */}
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Utama
            </div>
            <NavLink
              to="/dosen"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span>Kelas Bimbingan</span>
              </NavLink>

              <NavLink
                to="/dosen/mahasiswa"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Mahasiswa Bimbingan</span>
              </NavLink>

              <NavLink
                to="/dosen/bimbingan-kelas"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
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
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Bimbingan Individu</span>
                </div>
                {pendingConsultations > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex-shrink-0">
                    {pendingConsultations}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/report/formulir?studentId=usr-mhs-1"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Laporan & Form</span>
              </NavLink>
            </div>
          </div>
        </div>
      );
    }

    if (user?.role === 'admin') {
      return (
        <div className="space-y-4">
          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Utama
            </div>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div>
            <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
              Master Akademik
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/dosen"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <UserCheck className="w-4 h-4" />
                <span>Data Dosen PA</span>
              </NavLink>
              <NavLink
                to="/admin/mahasiswa"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <GraduationCap className="w-4 h-4" />
                <span>Data Mahasiswa</span>
              </NavLink>
              <NavLink
                to="/admin/kelas"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                <span>Data Kelas</span>
              </NavLink>
              <NavLink
                to="/admin/tahun-akademik"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                <span>Tahun Akademik</span>
              </NavLink>
              <NavLink
                to="/admin/plotting-pa"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span>Plotting Dosen PA</span>
              </NavLink>
            </div>
          </div>
        </div>
      );
    }

    // Mahasiswa
    return (
      <div className="space-y-4">
        <div>
          <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
            Utama
          </div>
          <NavLink
            to="/mahasiswa"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div>
          <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
            Bimbingan Saya
          </div>
          <div className="space-y-1">
            <NavLink
              to="/mahasiswa/dosen-pa"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <UserCheck className="w-4 h-4" />
              <span>Informasi Dosen PA</span>
            </NavLink>
            <NavLink
              to="/mahasiswa/bimbingan-kelas"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Bimbingan Kelas</span>
            </NavLink>
            <NavLink
              to="/mahasiswa/bimbingan-individu"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bimbingan Individu</span>
            </NavLink>
            <NavLink
              to="/mahasiswa/histori"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>Riwayat & Formulir</span>
            </NavLink>
          </div>
        </div>
      </div>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <aside className="no-print w-[260px] bg-[#0c1322] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-[#1a2337] select-none z-30 flex-shrink-0 font-sans">
      {/* 1. Brand Area */}
      <div className="h-[64px] px-5 flex items-center gap-3 border-b border-[#1a2337]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0 tracking-wide">
          SB
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight truncate">
            Si-BimAk
          </h1>
          <p className="text-[10.5px] text-slate-400 font-medium tracking-wide leading-tight truncate">
            Bimbingan Akademik
          </p>
        </div>
      </div>

      {/* 2. Navigation List Area */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
        {renderNavSections()}
      </div>

      {/* 3. Compact User Profile & Popover */}
      <div className="p-3 border-t border-[#1a2337] bg-[#090e1a] relative">
        {isProfileOpen && (
          <div className="absolute bottom-[72px] left-3 right-3 bg-[#111a2e] border border-[#1e2a47] rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="px-3 py-2 border-b border-[#1e2a47]">
              <p className="font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { setIsProfileOpen(false); }}
              className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#1a2640] hover:text-white transition-colors"
            >
              Profil Saya
            </button>
            <button
              onClick={() => { setIsProfileOpen(false); }}
              className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#1a2640] hover:text-white transition-colors"
            >
              Pengaturan Akun
            </button>
          </div>
        )}

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
                {user?.full_name}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                {user?.role === 'dosen'
                  ? `Dosen PA • NIDN ${lecturerProfile?.nidn || '0411099202'}`
                  : user?.role?.toUpperCase()}
              </p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </div>

        {/* 4. Logout Action */}
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
