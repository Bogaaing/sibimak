import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  UserRound, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Landmark
} from 'lucide-react';
import { Checkbox } from '../../../components/ui/Checkbox';

export const Login: React.FC = () => {
  const { user, isLoading: isAuthLoading, loginWithNIM, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [identifier, setIdentifier] = useState('2210114001');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto redirect if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'dosen') navigate('/dosen/dashboard', { replace: true });
      else if (user.role === 'mahasiswa') navigate('/mahasiswa/dashboard', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

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
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-slate-100 font-sans text-slate-900 flex flex-col justify-between select-none">
      {/* 1. FULL VIEWPORT CAMPUS BACKGROUND IMAGE (CRISP, ZOOMED-OUT, CLEAR ARCHITECTURE) */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_28%] lg:bg-[center_32%] bg-no-repeat z-0"
        style={{ backgroundImage: `url('/assets/unpam-campus.jpg')` }}
      />

      {/* 2. SUBTLE FOCUSED GRADIENT (SOFT ON LEFT TEXT AREA, CLEAR ON CAMPUS & CARD) */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/55 to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/30 z-0 pointer-events-none" />

      {/* 3. BOTTOM-RIGHT ACADEMIC BLUE CURVE & DOT MATRIX ACCENT */}
      <div className="absolute bottom-0 right-0 w-[55vw] h-[50vh] min-w-[420px] min-h-[320px] pointer-events-none z-0 hidden sm:block">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 700 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Cyan/Sky Accent Layer */}
          <path 
            d="M50 500 C 260 400, 420 270, 700 160 L 700 210 C 440 310, 280 430, 80 500 Z" 
            fill="#60A5FA" 
            fillOpacity="0.45" 
          />
          {/* Main Academic Blue Sweep */}
          <path 
            d="M80 500 C 280 410, 440 280, 700 185 L 700 500 Z" 
            fill="#1D4ED8" 
          />
          <path 
            d="M100 500 C 300 420, 450 300, 700 205 L 700 500 Z" 
            fill="#2563EB" 
          />
        </svg>

        {/* Floating Dot Matrix inside the Blue Zone */}
        <div 
          className="absolute bottom-8 right-12 w-44 h-24 opacity-35 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px)`,
            backgroundSize: '12px 12px'
          }}
        />
      </div>

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 py-6 sm:py-8 flex-1 flex flex-col justify-between">
        {/* UPPER & MIDDLE WORKSPACE */}
        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 my-auto">
          {/* LEFT SIDE: BRANDING & WELCOME MESSAGE (POSITIONED TOGETHER AT TOP-LEFT) */}
          <div className="w-full lg:max-w-md xl:max-w-lg space-y-6 pt-2 lg:pt-0 lg:-mt-16 xl:-mt-24">
            {/* Upper-Left Branding */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/app-logo.png"
                alt="SiBiMa"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shadow-2xs flex-shrink-0"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  SiBiMa
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight">
                  Sistem Informasi Bimbingan Akademik
                </p>
              </div>
            </div>

            {/* Welcome Headline & Description directly below the logo */}
            <div className="space-y-2 pt-2 sm:pt-4">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.2]">
                Selamat datang kembali!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm sm:max-w-md">
                Masuk untuk mengakses Sistem Informasi Bimbingan Akademik <strong className="text-[#2563EB] font-bold">SiBiMa</strong>.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: COMPACT AUTHENTICATION CARD (~400px) */}
          <div className="w-full max-w-[390px] sm:max-w-[405px] lg:mr-4 xl:mr-8 flex-shrink-0 mx-auto lg:mx-0">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.10)] p-6 sm:p-7 space-y-4">
              {/* Role Switcher Pill (42px) */}
              <div className="h-[42px] p-1 bg-[#F1F5F9] rounded-xl border border-slate-200/70 flex items-center gap-1">
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

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-tight animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Input NIM / Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    {activeRole === 'mahasiswa' ? 'NIM' : 'Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <input
                      type={activeRole === 'mahasiswa' ? 'text' : 'email'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeRole === 'mahasiswa' ? '2210114001' : 'dosen@unpam.ac.id'}
                      required
                      className="w-full h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
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
                      placeholder="••••••••••"
                      required
                      className="w-full h-[44px] pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors shadow-2xs"
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

                {/* Remember Me */}
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
                  className="w-full h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                    atau
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Alternate / Institutional Account Button */}
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
                  className="w-full h-[42px] rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <Landmark className="w-4 h-4 text-slate-500" />
                  <span>Masuk dengan Akun Institusi</span>
                </button>
              </form>

              {/* Card Footer Help Note */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 leading-tight">
                  Butuh bantuan? Hubungi <span className="font-semibold text-[#2563EB] cursor-pointer hover:underline">administrator program studi Anda.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT FOOTER (BOTTOM-LEFT) */}
        <div className="pt-4 text-center sm:text-left">
          <p className="text-[11.5px] text-slate-500 font-medium tracking-tight">
            © 2026 Sistem informasi - Universitas pamulang
          </p>
        </div>
      </div>
    </div>
  );
};
