import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MessagesSquare,
  FileText,
  AlertTriangle,
  ChevronRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  Calendar,
  Building2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';

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

  // 2. Dosen Pembimbing Akademik Assignment
  const assignment = useMemo(() => {
    if (!myClassId) return undefined;
    return store.getAssignments().find((a) => a.class_id === myClassId && a.is_active);
  }, [myClassId]);

  const lecturer = useMemo(() => {
    if (assignment?.lecturer) return assignment.lecturer;
    if (assignment?.lecturer_id) {
      return store.getLecturers().find((l) => l.id === assignment.lecturer_id);
    }
    return undefined;
  }, [assignment]);

  // 3. Class Guidance Sessions & Student Participations
  const allSessions = useMemo(() => store.getClassSessions(), []);
  const myClassParticipations = useMemo(() => {
    return store.getParticipants().filter((p) => p.student_id === studentId);
  }, [studentId]);

  // 4. Pending Actions (Perlu Tindakan)
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

  // 5. Konsultasi Individu
  const individualRequests = useMemo(() => {
    return store.getIndividualRequests().filter((r) => r.student_id === studentId);
  }, [studentId]);

  // 6. Merged Recent Guidance Records (Max 3 items)
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

  // Lecturer initials helper
  const lecturerInitials = useMemo(() => {
    const name = lecturer?.profile?.full_name || 'Ahmad Asep Suhendi';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [lecturer]);

  // Dynamic Semester calculation or default
  const semesterLabel = useMemo(() => {
    if (myClass?.name) {
      const match = myClass.name.match(/\d+/);
      if (match) return `Semester ${match[0]}`;
    }
    return 'Semester 5';
  }, [myClass]);

  const activeAcademicYear = useMemo(() => {
    return store.getActiveAcademicYear();
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      {/* RESPONSIVE 2-COLUMN GRID (On Desktop) / 1-COLUMN (On Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO, PERLU TINDAKAN, BIMBINGAN TERBARU      */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          
          {/* 1. HERO / IDENTITAS MAHASISWA CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white shadow-xs border border-blue-700">
            {/* Subtle background decorative shapes */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
            <div className="absolute bottom-0 right-10 -mb-6 w-32 h-32 rounded-full bg-blue-500/20 pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/30 text-blue-100 text-[11px] font-bold uppercase tracking-wider border border-blue-400/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Portal Mahasiswa</span>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-100">
                  Selamat datang,
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mt-0.5">
                  {user?.full_name || 'Ahmad Fauzi'}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-blue-100 flex-wrap pt-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white text-blue-700 font-bold shadow-2xs">
                  {myClass?.name || 'SI-5A'}
                </span>
                <span className="text-blue-300">•</span>
                <span className="font-semibold text-white">
                  {myClass?.study_program || 'Sistem Informasi'}
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-blue-100 font-medium">
                  {semesterLabel}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PERLU TINDAKAN (ACTION REQUIRED) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Perlu Tindakan
                </h3>
                {pendingClassGuidances.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {pendingClassGuidances.length}
                  </span>
                )}
              </div>
            </div>

            {pendingClassGuidances.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-normal">
                  Terdapat kegiatan yang membutuhkan konfirmasi Anda.
                </p>

                {pendingClassGuidances.map(({ participant, session }) => (
                  <div
                    key={participant.id}
                    className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 stroke-[2]" />
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {session?.title || 'Persiapan Menghadapi UTS'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 pl-6">
                          {session?.session_date ? formatDate(session.session_date) : '20 Jan 2027'} • Bimbingan Kelas • {myClass?.name || 'SI-5A'}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0">
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
              <div className="py-5 px-4 text-center rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[1.8]" />
                <p className="text-xs font-semibold text-slate-700">
                  Tidak ada tindakan yang perlu dilakukan saat ini.
                </p>
                <p className="text-[11px] text-slate-500">
                  Semua agenda bimbingan dan konfirmasi Anda telah tercatat dengan rapi.
                </p>
              </div>
            )}
          </div>

          {/* 3. BIMBINGAN TERBARU LIST */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bimbingan Terbaru
              </h3>
              <Link
                to="/mahasiswa/bimbingan"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors p-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
              </Link>
            </div>

            {recentGuidanceList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentGuidanceList.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${
                          item.type === 'kelas'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}
                      >
                        {item.type === 'kelas' ? (
                          <BookOpenCheck className="w-4 h-4 stroke-[1.8]" />
                        ) : (
                          <MessagesSquare className="w-4 h-4 stroke-[1.8]" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-[13px] font-bold text-slate-900 truncate leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate leading-normal">
                          {formatDate(item.date)} • {item.category} • {item.classLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.status === 'BELUM_KONFIRMASI' && (
                        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Belum Konfirmasi
                        </span>
                      )}
                      {item.status === 'TERVALIDASI' && (
                        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tervalidasi
                        </span>
                      )}
                      {item.status === 'SELESAI' && (
                        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Selesai
                        </span>
                      )}
                      {(item.status === 'DIAJUKAN' || item.status === 'DIPROSES') && (
                        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                Belum ada aktivitas bimbingan tercatat.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: DOSEN PA & ACADEMIC INFORMATION             */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          
          {/* 4. DOSEN PEMBIMBING AKADEMIK CARD */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dosen Pembimbing Akademik
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aktif
              </span>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-2xs">
                {lecturerInitials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                  {lecturer ? getLecturerFullName(lecturer) : 'Ahmad Asep Suhendi, S.Kom., M.Kom.'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1 leading-normal">
                  NIDN: {lecturer?.nidn || '0411099202'}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Prodi {lecturer?.department || 'Sistem Informasi'}
                </p>
              </div>
            </div>

            {/* Action Buttons (Hubungi Dosen & Form Bimbingan) */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
              <Link
                to="/mahasiswa/konsultasi"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 bg-white text-xs font-bold text-slate-700 hover:text-blue-700 shadow-2xs transition-all text-center min-h-[44px]"
              >
                <MessagesSquare className="w-4 h-4 text-blue-600 stroke-[1.8] flex-shrink-0" />
                <span>Hubungi Dosen</span>
              </Link>
              <Link
                to={`/report/formulir?studentId=${studentId || 'usr-mhs-1'}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold text-slate-700 shadow-2xs transition-all text-center min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-slate-500 stroke-[1.8] flex-shrink-0" />
                <span>Form Bimbingan</span>
              </Link>
            </div>
          </div>

          {/* 5. ACADEMIC OVERVIEW SUMMARY (Desktop Complementary Card) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Informasi Akademik
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tahun Akademik
                </span>
                <span className="font-bold text-slate-800">
                  {activeAcademicYear?.name || '2026/2027 Ganjil'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Program Studi
                </span>
                <span className="font-bold text-slate-800">
                  {myClass?.study_program || 'S1 Sistem Informasi'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  Status Mahasiswa
                </span>
                <Badge variant="success" size="sm">
                  Aktif
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Total Bimbingan Selesai
                </span>
                <span className="font-bold text-blue-600">
                  {myClassParticipations.filter((p) => p.validation_status === 'VALID').length +
                    individualRequests.filter((r) => r.status === 'SELESAI').length}{' '}
                  Sesi
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
