import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { UserRound, LockKeyhole, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-900">
      {/* Centered Authentication Card */}
      <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/assets/app-logo.png"
            alt="Si-BimAk"
            className="w-16 h-16 rounded-2xl mx-auto object-contain shadow-2xs"
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Si-BimAk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Informasi Bimbingan Akademik
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange('mahasiswa')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all select-none ${
              activeRole === 'mahasiswa'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserRound className="w-4 h-4 stroke-[1.8]" />
            <span>Mahasiswa</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('dosen')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all select-none ${
              activeRole === 'dosen'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserRound className="w-4 h-4 stroke-[1.8]" />
            <span>Dosen</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input (NIM for Mahasiswa, Email for Dosen) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {activeRole === 'mahasiswa' ? 'NIM' : 'Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserRound className="w-4 h-4 stroke-[1.8]" />
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
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] text-xs sm:text-[13px] rounded-lg bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LockKeyhole className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-xs sm:text-[13px] rounded-lg bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.8]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[46px] flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-[13px] rounded-lg shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4 stroke-[1.8]" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Sistem Informasi Bimbingan Akademik Si-BimAk
          </p>
        </div>
      </div>
    </div>
  );
};
