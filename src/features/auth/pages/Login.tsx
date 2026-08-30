import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { UserRound, LockKeyhole, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Checkbox } from '../../../components/ui/Checkbox';

export const Login: React.FC = () => {
  const { loginWithNIM, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [identifier, setIdentifier] = useState('2210114001');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
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
        await loginWithNIM(identifier, password);
        navigate('/mahasiswa/dashboard');
      } else {
        await loginWithEmail(identifier, password);
        navigate('/dosen/dashboard');
      }
    } catch {
      setError(
        activeRole === 'mahasiswa'
          ? 'NIM atau password yang Anda masukkan salah.'
          : 'Email atau password yang Anda masukkan salah.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-[#0F172A] relative">
      {/* Centered Authentication Card matching reference UI */}
      <div className="w-full max-w-[450px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm p-7 sm:p-9 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/assets/app-logo.png"
            alt="Si-BimAk"
            className="w-16 h-16 rounded-2xl mx-auto object-contain shadow-2xs"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Si-BimAk
            </h1>
            <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-normal">
              Sistem Informasi Bimbingan Akademik
            </p>
          </div>
        </div>

        {/* Role Switcher (Pill Style) */}
        <div className="p-1 bg-[#F1F5F9] rounded-full border border-[#E2E8F0] flex items-center">
          <button
            type="button"
            onClick={() => handleRoleChange('mahasiswa')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs sm:text-[13px] font-semibold transition-all select-none ${
              activeRole === 'mahasiswa'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'text-[#0F172A] hover:text-[#2563EB]'
            }`}
          >
            <UserRound className="w-4 h-4 stroke-[1.8]" />
            <span>Mahasiswa</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('dosen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs sm:text-[13px] font-semibold transition-all select-none ${
              activeRole === 'dosen'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'text-[#0F172A] hover:text-[#2563EB]'
            }`}
          >
            <UserRound className="w-4 h-4 stroke-[1.8]" />
            <span>Dosen</span>
          </button>
        </div>

        {/* Friendly Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input (NIM for Mahasiswa, Email for Dosen) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A]">
              {activeRole === 'mahasiswa' ? 'NIM' : 'Email'}
            </label>
            <div className="relative rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] bg-white transition-all shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
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
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[46px] text-xs sm:text-[13px] text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:outline-none bg-transparent rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A]">
              Password
            </label>
            <div className="relative rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] bg-white transition-all shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <LockKeyhole className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full pl-10 pr-10 py-2.5 min-h-[46px] text-xs sm:text-[13px] text-[#0F172A] font-medium placeholder:text-[#94A3B8] focus:outline-none bg-transparent rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors"
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

          {/* Remember Me Only (No Forgot Password) */}
          <div className="pt-0.5">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label={<span className="text-xs text-[#475569] font-medium">Ingat saya</span>}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-50 select-none active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>
        </form>

        {/* Footer with subtle divider lines */}
        <div className="pt-2">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#E2E8F0]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[#94A3B8] font-medium">
              Sistem Informasi Bimbingan Akademik Si-BimAk
            </span>
            <div className="flex-grow border-t border-[#E2E8F0]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
