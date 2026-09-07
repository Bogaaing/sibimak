import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MessagesSquare,
  AlertTriangle,
  ChevronRight,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Users,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { formatDate } from '../../../lib/utils';

export const MahasiswaDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  // 1. Data Mahasiswa & Kelas
  const currentStudent = useMemo(() => {
    return store.getStudents().find((s) => s.id === studentId);
  }, [studentId]);

  const myClassId = currentStudent?.class_id;
  const myClass = useMemo(() => {
    if (!myClassId) return currentStudent?.class;
    return store.getClasses().find((c) => c.id === myClassId) || currentStudent?.class;
  }, [myClassId, currentStudent]);

  // 2. Class Guidance Sessions & Student Participations
  const allSessions = useMemo(() => store.getClassSessions(), []);
  const myClassParticipations = useMemo(() => {
    return store.getParticipants().filter((p) => p.student_id === studentId);
  }, [studentId]);

  // 3. Pending Actions (Perlu Tindakan)
  const pendingClassGuidances = useMemo(() => {
    return myClassParticipations
      .filter((p) => p.attendance_status === 'BELUM_KONFIRMASI')
      .map((p) => {
        const session = allSessions.find((s) => s.id === p.session_id);
        return {
          participant: p,
          session,
        };
      })
      .filter((item) => item.session !== undefined);
  }, [myClassParticipations, allSessions]);

  // 4. Konsultasi Individu
  const individualRequests = useMemo(() => {
    return store.getIndividualRequests().filter((r) => r.student_id === studentId);
  }, [studentId]);

  // 5. Merged Recent Guidance Records (Max 3 items)
  interface GuidanceItem {
    id: string;
    title: string;
    date: string;
    category: string;
    type: 'kelas' | 'individu';
    classLabel: string;
    status: 'BELUM_KONFIRMASI' | 'TERVALIDASI' | 'SELESAI' | 'DIAJUKAN' | 'DIPROSES';
    statusLabel: string;
  }

  const recentGuidanceList = useMemo<GuidanceItem[]>(() => {
    const list: GuidanceItem[] = [];

    // Add Class Guidance Sessions
    myClassParticipations.forEach((p) => {
      const session = allSessions.find((s) => s.id === p.session_id);
      if (session) {
        let status: GuidanceItem['status'] = 'TERVALIDASI';
        let statusLabel = 'Tervalidasi';

        if (p.attendance_status === 'BELUM_KONFIRMASI') {
          status = 'BELUM_KONFIRMASI';
          statusLabel = 'Belum Konfirmasi';
        } else if (p.validation_status === 'VALID') {
          status = 'TERVALIDASI';
          statusLabel = 'Tervalidasi';
        } else {
          status = 'TERVALIDASI';
          statusLabel = 'Menunggu Validasi';
        }

        list.push({
          id: session.id,
          title: session.title,
          date: session.session_date,
          category: 'Bimbingan Kelas',
          type: 'kelas',
          classLabel: myClass?.name || 'SI-5A',
          status,
          statusLabel,
        });
      }
    });

    // Add Individual Guidance Requests
    individualRequests.forEach((req) => {
      let status: GuidanceItem['status'] = 'SELESAI';
      let statusLabel = 'Selesai';

      if (req.status === 'SELESAI') {
        status = 'SELESAI';
        statusLabel = 'Selesai';
      } else if (req.status === 'DIAJUKAN') {
        status = 'DIAJUKAN';
        statusLabel = 'Diajukan';
      } else if (req.status === 'DIPROSES') {
        status = 'DIPROSES';
        statusLabel = 'Diproses';
      }

      list.push({
        id: req.id,
        title: req.title,
        date: req.guidance_date || req.created_at,
        category: 'Konsultasi Individu',
        type: 'individu',
        classLabel: myClass?.name || 'SI-5A',
        status,
        statusLabel,
      });
    });

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return list.slice(0, 3);
  }, [myClassParticipations, allSessions, individualRequests, myClass]);

  // Dynamic Semester calculation or default
  const semesterLabel = useMemo(() => {
    if (myClass?.name) {
      const match = myClass.name.match(/\d+/);
      if (match) return `Semester ${match[0]}`;
    }
    return 'Semester 5';
  }, [myClass]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ========================================================= */}
      {/* 1. HERO / IDENTITAS MAHASISWA CARD                       */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] p-5 sm:p-7 text-white shadow-xs border border-blue-600/60">
        {/* UNPAM Campus Background Watermark (Right aligned, subtle opacity) */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-2/5 pointer-events-none overflow-hidden select-none">
          <img
            src="/assets/unpam-hero.jpg"
            alt="UNPAM Campus"
            className="w-full h-full object-cover object-right opacity-25 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D4ED8] via-transparent to-transparent" />
        </div>

        {/* Subtle Decorative Geometric Circles */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-2 -bottom-2 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute right-24 -top-8 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

        {/* Hero Card Content */}
        <div className="relative z-10 space-y-3.5 sm:space-y-4">
          {/* Top Pill: PORTAL MAHASISWA */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wider border border-white/20 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>PORTAL MAHASISWA</span>
          </div>

          {/* Student Name & Greeting */}
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-medium text-blue-100">
              Selamat datang,
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {user?.full_name || 'Ahmad Fauzi'}
            </h2>
            <p className="text-xs text-blue-200/90 italic font-normal pt-0.5">
              "Terus belajar, terus berkembang"
            </p>
          </div>

          {/* Academic Info Badges / Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20 shadow-2xs">
              <Users className="w-3.5 h-3.5 stroke-[2]" />
              <span>{myClass?.name || 'SI-5A'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
              <span>{myClass?.study_program || 'Sistem Informasi'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 stroke-[2]" />
              <span>{semesterLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2 & 3. RESPONSIVE GRID / ORDERING                         */}
      {/* Mobile: Perlu Tindakan (1st), Bimbingan Terbaru (2nd)     */}
      {/* Desktop: Bimbingan Terbaru (7 cols), Perlu Tindakan (5)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* SECTION: BIMBINGAN TERBARU (KONTEN UTAMA) */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-3">
          {/* Header Bimbingan Terbaru */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <BookOpenCheck className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Bimbingan Terbaru
              </h3>
            </div>
            <Link
              to="/mahasiswa/bimbingan"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors p-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
          </div>

          {/* List Card Container */}
          {recentGuidanceList.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
              {recentGuidanceList.map((item) => (
                <Link
                  key={item.id}
                  to={item.type === 'kelas' ? '/mahasiswa/bimbingan' : '/mahasiswa/konsultasi'}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                        item.type === 'kelas'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100/80'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100/80'
                      }`}
                    >
                      {item.type === 'kelas' ? (
                        <BookOpen className="w-4.5 h-4.5 stroke-[1.8]" />
                      ) : (
                        <MessagesSquare className="w-4.5 h-4.5 stroke-[1.8]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                        {item.title}
                      </h4>
                      <div className="text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{formatDate(item.date)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'BELUM_KONFIRMASI' && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Belum Konfirmasi
                      </span>
                    )}
                    {item.status === 'TERVALIDASI' && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tervalidasi
                      </span>
                    )}
                    {item.status === 'SELESAI' && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selesai
                      </span>
                    )}
                    {(item.status === 'DIAJUKAN' || item.status === 'DIPROSES') && (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.statusLabel}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              Belum ada aktivitas bimbingan tercatat.
            </div>
          )}
        </div>

        {/* SECTION: PERLU TINDAKAN */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Perlu Tindakan
              </h3>
              {pendingClassGuidances.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {pendingClassGuidances.length}
                </span>
              )}
            </div>
          </div>

          {pendingClassGuidances.length > 0 ? (
            <div className="space-y-3">
              {pendingClassGuidances.map(({ participant, session }) => (
                <div
                  key={participant.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 stroke-[2]" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {session?.title || 'Persiapan Menghadapi UTS'}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 pl-6">
                        {session?.session_date ? formatDate(session.session_date) : '20 Jan 2027'} • Bimbingan Kelas • {myClass?.name || 'SI-5A'}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0">
                      Belum Konfirmasi
                    </span>
                  </div>

                  <div className="pt-1">
                    <Link
                      to="/mahasiswa/bimbingan"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-2xs transition-colors min-h-[44px]"
                    >
                      <BookOpenCheck className="w-4 h-4 stroke-[2]" />
                      <span>Konfirmasi Kehadiran</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State: Sederhana, compact, semantic success icon */
            <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Tidak Ada Tindakan yang Perlu Dilakukan
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-normal mt-0.5">
                    Semua agenda bimbingan dan konfirmasi Anda telah tercatat dengan rapi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
