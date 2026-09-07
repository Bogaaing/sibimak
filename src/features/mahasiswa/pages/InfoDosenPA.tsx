import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  UserRound, 
  Mail, 
  Phone, 
  FileText, 
  MessagesSquare, 
  CheckCircle2,
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { mahasiswaService, StudentFullData } from '../../../services/mahasiswa.service';

export const InfoDosenPA: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const [studentData, setStudentData] = useState<StudentFullData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const loadData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await mahasiswaService.getStudentAcademicData(studentId);
      setStudentData(data);
    } catch (err: any) {
      console.error('Error loading profile data:', err);
      setError('Gagal memuat data profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentStudent = studentData?.student;
  const myClass = studentData?.academicClass;
  const lecturer = studentData?.advisorLecturer;

  // Initials helper
  const studentInitials = useMemo(() => {
    const name = user?.full_name || currentStudent?.profile?.full_name;
    if (!name) return 'M';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [user, currentStudent]);

  const lecturerInitials = useMemo(() => {
    const name = lecturer?.profile?.full_name;
    if (!name) return 'PA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [lecturer]);

  const emailText = lecturer?.profile?.email || '';
  const phoneText = lecturer?.profile?.phone_number || '';

  const handleCopyEmail = () => {
    if (!emailText) return;
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const studentName = user?.full_name || currentStudent?.profile?.full_name || 'Mahasiswa';
  const nim = currentStudent?.nim || '-';
  const studyProgram = myClass?.study_program || '-';

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-4 sm:space-y-5 pb-6 animate-pulse">
        <div className="flex items-center justify-between gap-3 pt-1 pb-1">
          <div className="space-y-2 w-1/2">
            <div className="h-8 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-40 bg-slate-200 rounded-[24px]"></div>
        <div className="h-64 bg-slate-200 rounded-[24px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white p-8 rounded-[24px] border border-rose-200 text-center shadow-2xs space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto stroke-[2]" />
          <h4 className="text-sm font-bold text-slate-800">{error}</h4>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-5 pb-6">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER (JUDUL HALAMAN & 3D GRADUATE AVATAR)       */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-1">
        <div className="space-y-1 min-w-0 flex-1 pr-2">
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Profil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Informasi akun dan data akademik Anda.
          </p>
        </div>

        {/* 3D Student Illustration with Soft Circular Disc */}
        <div className="flex-shrink-0 relative w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center">
          <div className="absolute inset-0 m-auto w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-[#DCEAFB]/80 pointer-events-none" />
          <img
            src="/assets/student-avatar-3d.png"
            alt="Profil Mahasiswa"
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 object-contain select-none pointer-events-none drop-shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARD PROFIL MAHASISWA                                  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <UserRound className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              PROFIL MAHASISWA
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#ECFDF5] text-[#16A34A] border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            Mahasiswa Aktif
          </span>
        </div>

        {/* Body Row: Square Avatar + Details */}
        <div className="flex items-center gap-4 pt-1">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-xs flex-shrink-0">
            {studentInitials}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug truncate">
              {studentName}
            </h2>

            <div className="space-y-0.5 text-xs">
              <div className="flex items-center text-slate-500">
                <span className="w-24 text-slate-400 font-medium">NIM</span>
                <span className="mr-2">:</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {nim}
                </span>
              </div>
              <div className="flex items-center text-slate-500">
                <span className="w-24 text-slate-400 font-medium">Program Studi</span>
                <span className="mr-2">:</span>
                <span className="font-semibold text-slate-700 truncate">
                  {studyProgram}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DOSEN PEMBIMBING AKADEMIK & KONTAK                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <UserRound className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              DOSEN PEMBIMBING AKADEMIK
            </span>
          </div>

          {lecturer ? (
            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-blue-100/60 shadow-2xs">
              Terplotting
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 shadow-2xs">
              Belum terplotting
            </span>
          )}
        </div>

        {lecturer ? (
          <div className="space-y-4">
            {/* Lecturer Identity Row: Dark Avatar + Name & NIDN */}
            <div className="flex items-center gap-4 pt-1">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#111827] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-xs flex-shrink-0">
                {lecturerInitials}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-snug break-words">
                  {getLecturerFullName(lecturer)}
                </h3>

                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center text-slate-500">
                    <span className="w-24 text-slate-400 font-medium">NIDN</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold text-slate-700 font-mono">
                      {lecturer.nidn || '-'}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <span className="w-24 text-slate-400 font-medium">Program Studi</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold text-slate-700 truncate">
                      {lecturer.department || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards: Email & WhatsApp */}
            <div className="space-y-2.5 pt-1">
              {/* Email Resmi */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                      EMAIL RESMI
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-snug mt-1 truncate">
                      {emailText || 'Email belum tersedia'}
                    </p>
                  </div>
                </div>

                {emailText && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    title="Salin Email"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                    ) : (
                      <Copy className="w-4 h-4 stroke-[2]" />
                    )}
                  </button>
                )}
              </div>

              {/* WhatsApp */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                      WHATSAPP
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-snug mt-1 truncate">
                      {phoneText || 'Nomor telepon belum tersedia'}
                    </p>
                  </div>
                </div>

                {phoneText && (
                  <a
                    href={`https://wa.me/62${phoneText.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Hubungi via WhatsApp"
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-100/80 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2]" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons: Primary & Secondary */}
            <div className="pt-2 space-y-2.5">
              {/* Primary: Ajukan Konsultasi */}
              <Link
                to="/mahasiswa/konsultasi"
                className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessagesSquare className="w-4.5 h-4.5 stroke-[2]" />
                <span>Ajukan Konsultasi</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>

              {/* Secondary: Form Bimbingan */}
              {studentId && (
                <Link
                  to={`/report/formulir?studentId=${studentId}`}
                  className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-4.5 h-4.5 text-slate-600 stroke-[2]" />
                  <span>Form Bimbingan</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 stroke-[2]" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Dosen Pembimbing Akademik Belum Terplotting"
            description="Anda belum memiliki Dosen Pembimbing Akademik yang terplotting. Silakan hubungi bagian tata usaha program studi Anda."
          />
        )}
      </div>
    </div>
  );
};
