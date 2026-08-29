import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Sparkles, ShieldCheck, UserCheck, GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@kampus.ac.id');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email);
      // Determine redirection based on email or role
      if (email.includes('admin')) navigate('/admin');
      else if (email.includes('dosen') || email.includes('ratna')) navigate('/dosen');
      else navigate('/mahasiswa');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'dosen' | 'mahasiswa', specificId?: string) => {
    switchDemoRole(role, specificId);
    if (role === 'admin') navigate('/admin');
    else if (role === 'dosen') navigate('/dosen');
    else navigate('/mahasiswa');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Si-BimAk</h1>
          <p className="text-xs text-slate-400 font-medium">Sistem Informasi Bimbingan Akademik</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Masuk ke Akun</h2>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan akun akademik Anda untuk mengelola proses bimbingan.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Kampus / Akun
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kampus.ac.id"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Akses Cepat Mode Demo
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500 border border-slate-700 text-left transition-all group"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                <p className="font-bold text-xs text-white mt-1">Admin</p>
                <p className="text-[10px] text-slate-400">Master Data</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dosen', 'usr-dosen-1')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500 border border-slate-700 text-left transition-all group"
              >
                <UserCheck className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                <p className="font-bold text-xs text-white mt-1">Dosen PA</p>
                <p className="text-[10px] text-slate-400">Dr. Budi (SI-5A)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mahasiswa', 'usr-mhs-1')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:border-emerald-500 border border-slate-700 text-left transition-all group"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                <p className="font-bold text-xs text-white mt-1">Mahasiswa</p>
                <p className="text-[10px] text-slate-400">Ahmad Fauzi</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-xs text-slate-500">
          Dilindungi oleh Supabase Auth & PostgreSQL Row Level Security (RLS)
        </div>
      </div>
    </div>
  );
};
