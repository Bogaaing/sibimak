import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  UserRound, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  ArrowRight,
  School
} from 'lucide-react';
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
        const loggedInUser = await loginWithEmail(identifier, password);
        if (loggedInUser?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dosen/dashboard');
        }
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
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-slate-900 font-sans text-slate-900 flex flex-col justify-between">
      {/* 1. CAMPUS BACKGROUND IMAGE WITH SUBTLE LIGHT OVERLAY */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('/assets/unpam-campus.jpg')` }}
      />
      {/* Light Overlay Gradient ensuring readability & contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60 backdrop-blur-[1px] z-0" />

      {/* 2. BLUE DECORATIVE SHAPE & DOT MATRIX (BOTTOM-RIGHT) */}
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] pointer-events-none z-0 hidden md:block overflow-hidden">
        {/* Outer Soft Wave */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 transform rotate-12 scale-110" />
        {/* Main Academic Blue Arc */}
        <div className="absolute inset-8 rounded-full bg-[#2563EB] shadow-2xl" />
        {/* Lighter Accent Layer */}
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-blue-400/30" />
        
        {/* Subtle Decorative Dot Matrix */}
        <div 
          className="absolute bottom-16 right-16 w-48 h-32 opacity-25"
          style={{
            backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px)`,
            backgroundSize: '12px 12px'
          }}
        />
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-6 sm:py-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 my-auto">
        {/* LEFT SIDE: BRANDING & WELCOME MESSAGE */}
        <div className="w-full lg:max-w-xl space-y-6 sm:space-y-8 flex flex-col justify-center">
          {/* Upper Left Branding */}
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/app-logo.png"
              alt="SiBiMa"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shadow-2xs flex-shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                SiBiMa
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-tight">
                Sistem Informasi Bimbingan Akademik
              </p>
            </div>
          </div>

          {/* Welcome Headline & Description */}
          <div className="space-y-2 pt-2 sm:pt-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Selamat datang kembali!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
              Masuk untuk mengakses Sistem Informasi Bimbingan Akademik <strong className="text-blue-600 font-bold">SiBiMa</strong>.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: COMPACT AUTHENTICATION CARD (~400px) */}
        <div className="w-full max-w-[390px] sm:max-w-[405px] lg:mr-8 xl:mr-12">
          <div className="bg-white rounded-[22px] border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-4">
            {/* Card Brand Header */}
            <div className="text-center space-y-1">
              <img
                src="/assets/app-logo.png"
                alt="SiBiMa"
                className="w-10 h-10 rounded-xl mx-auto object-contain shadow-2xs mb-1.5"
              />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                SiBiMa
              </h2>
              <p className="text-[11.5px] text-slate-500 font-medium">
                Sistem Informasi Bimbingan Akademik
              </p>
            </div>

            {/* Role Switcher (Compact 44px) */}
            <div className="h-[42px] p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRoleChange('mahasiswa')}
                className={`h-full flex-1 flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all select-none ${
                  activeRole === 'mahasiswa'
                    ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserRound className="w-3.5 h-3.5" />
                <span>Mahasiswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('dosen')}
                className={`h-full flex-1 flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all select-none ${
                  activeRole === 'dosen'
                    ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserRound className="w-3.5 h-3.5" />
                <span>Dosen</span>
              </button>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-tight animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Identifier Input (NIM / Email) */}
              <div className="space-y-1">
                <label className="text-[11.5px] font-semibold text-slate-700 block">
                  {activeRole === 'mahasiswa' ? 'NIM' : 'Email Dosen'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserRound className="w-4 h-4" />
                  </div>
                  <input
                    type={activeRole === 'mahasiswa' ? 'text' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeRole === 'mahasiswa' ? 'Contoh: 2210114001' : 'Contoh: dosen@unpam.ac.id'}
                    required
                    className="w-full h-[44px] pl-9.5 pr-3.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[11.5px] font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LockKeyhole className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    required
                    className="w-full h-[44px] pl-9.5 pr-10 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="pt-0.5">
                <Checkbox
                  id="remember-me"
                  label="Ingat saya"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </div>

              {/* Submit Button (44px) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[44px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2.5 text-[10.5px] text-slate-400 font-medium uppercase tracking-wider">
                  atau
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Institutional SSO / Alternate Account Button */}
              <button
                type="button"
                onClick={() => {
                  if (activeRole === 'mahasiswa') {
                    setIdentifier('2210114001');
                    setPassword('password123');
                  } else {
                    setIdentifier('ahmad.asep@unpam.ac.id');
                    setPassword('password123');
                  }
                }}
                className="w-full h-[40px] rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2"
              >
                <School className="w-3.5 h-3.5 text-slate-500" />
                <span>Masuk dengan Akun Institusi</span>
              </button>
            </form>

            {/* Help / Footer inside card */}
            <div className="pt-2 text-center">
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Butuh bantuan? Hubungi <span className="font-semibold text-slate-600">administrator program studi</span> Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PAGE FOOTER (BOTTOM-LEFT) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 pb-4 text-center sm:text-left">
        <p className="text-[11.5px] text-slate-500 font-medium tracking-tight">
          © 2026 Sistem informasi - Universitas pamulang
        </p>
      </div>
    </div>
  );
};
