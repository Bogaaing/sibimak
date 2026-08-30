import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { UserRound, LockKeyhole, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [identifier, setIdentifier] = useState('2210114001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (role: 'mahasiswa' | 'dosen') => {
    setActiveRole(role);
    setError(null);
    if (role === 'mahasiswa') {
      setIdentifier('2210114001');
    } else {
      setIdentifier('ahmad.asep@unpam.ac.id');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeRole === 'mahasiswa') {
        switchDemoRole('mahasiswa', 'usr-mhs-1');
        navigate('/mahasiswa');
      } else {
        switchDemoRole('dosen', 'usr-dosen-1');
        navigate('/dosen');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      {/* Compact Centered Authentication Card */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <img
            src="/assets/app-logo.png"
            alt="Si-BimAk"
            className="w-12 h-12 rounded-xl mx-auto object-contain shadow-2xs"
          />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Si-BimAk
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              Sistem Informasi Bimbingan Akademik
            </p>
          </div>
        </div>

        {/* Compact Role Switcher */}
        <div className="p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/70 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange('mahasiswa')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-bold transition-all select-none ${
              activeRole === 'mahasiswa'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserRound className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Mahasiswa</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('dosen')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-bold transition-all select-none ${
              activeRole === 'dosen'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserRound className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Dosen</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium leading-tight">
            {error}
          </div>
        )}

        {/* Compact Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Identifier Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">
              {activeRole === 'mahasiswa' ? 'NIM' : 'Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserRound className="w-3.5 h-3.5 stroke-[1.8]" />
              </div>
              <input
                type={activeRole === 'mahasiswa' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeRole === 'mahasiswa'
                    ? 'Masukkan NIM Anda'
                    : 'Masukkan email Anda'
                }
                className="w-full pl-8.5 pr-3 py-2 min-h-[38px] text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockKeyhole className="w-3.5 h-3.5 stroke-[1.8]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full pl-8.5 pr-9 py-2 min-h-[38px] text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 stroke-[1.8]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.8]" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[10.5px] text-slate-400 font-medium leading-tight">
            Sistem Informasi Bimbingan Akademik Si-BimAk
          </p>
        </div>
      </div>
    </div>
  );
};
