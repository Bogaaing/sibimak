import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (role: 'admin' | 'dosen' | 'mahasiswa', specificId?: string) => {
    switchDemoRole(role, specificId);
    if (role === 'admin') navigate('/admin');
    else if (role === 'dosen') navigate('/dosen');
    else if (role === 'mahasiswa') navigate('/mahasiswa');
  };

  return (
    <div className="no-print bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold tracking-wide text-slate-300 uppercase text-[11px]">SiBiMa Interactive Switcher:</span>
        <span className="text-slate-400">
          Login aktif: <strong className="text-white font-medium">{user?.full_name} ({user?.role?.toUpperCase()})</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 text-[11px] mr-1">Ganti Peran:</span>
        
        <button
          onClick={() => handleSwitch('admin', 'usr-admin-1')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            user?.role === 'admin' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </button>

        <button
          onClick={() => handleSwitch('dosen', 'usr-dosen-1')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            user?.role === 'dosen' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Dosen PA (Ahmad Asep Suhendi)
        </button>

        <button
          onClick={() => handleSwitch('mahasiswa', 'usr-mhs-1')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            user?.id === 'usr-mhs-1' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Mhs (Ahmad Fauzi)
        </button>

        <button
          onClick={() => handleSwitch('mahasiswa', 'usr-mhs-2')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            user?.id === 'usr-mhs-2' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Mhs (Siti)
        </button>
      </div>
    </div>
  );
};
