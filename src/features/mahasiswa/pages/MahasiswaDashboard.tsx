import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Link } from 'react-router-dom';
import {
  UserRound,
  MessagesSquare,
  ClipboardCheck,
  BookOpenCheck,
  FileText,
  AlertTriangle,
  ChevronRight,
  Check,
  Clock,
  Send
} from 'lucide-react';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export const MahasiswaDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = store.getStudents().find((s) => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const assignment = store.getAssignments().find((a) => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;

  const myClassParticipations = store.getParticipants().filter((p) => p.student_id === studentId);
  const pendingConfirmation = myClassParticipations.filter(
    (p) => p.attendance_status === 'BELUM_KONFIRMASI'
  );

  return (
    <div className="space-y-5 pb-6">
      {/* 1. STUDENT WELCOME GREETING */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Portal Mahasiswa
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 leading-tight">
          Selamat datang, {user?.full_name || 'Ahmad Fauzi'}
        </h2>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
            {currentStudent?.class?.name || 'SI-5A'}
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-700">
            {currentStudent?.class?.study_program || 'S1 Sistem Informasi'}
          </span>
          <span>•</span>
          <span className="text-slate-500 font-medium">Semester 5</span>
        </div>
      </div>

      {/* 2. DOSEN PEMBIMBING AKADEMIK CARD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Dosen Pembimbing Akademik
          </span>
          <Badge variant="success" size="sm">
            Aktif
          </Badge>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-2xs">
            AA
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
              {lecturer ? getLecturerFullName(lecturer) : 'Ahmad Asep Suhendi, M.Kom.'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NIDN: {lecturer?.nidn || '0411099202'} • Prodi Sistem Informasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <Link
            to="/mahasiswa/konsultasi"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors text-center"
          >
            <MessagesSquare className="w-3.5 h-3.5 text-blue-600 stroke-[1.8]" />
            <span>Hubungi Dosen</span>
          </Link>
          <Link
            to="/report/formulir?studentId=usr-mhs-1"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors text-center"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
            <span>Form Bimbingan</span>
          </Link>
        </div>
      </div>

      {/* 3. PERLU TINDAKAN (ACTION REQUIRED) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 stroke-[1.8]" />
            Perlu Tindakan ({pendingConfirmation.length || 1})
          </h3>
        </div>

        {pendingConfirmation.length > 0 ? (
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Persiapan Menghadapi UTS
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Rabu, 20 Januari 2027 • Bimbingan Kelas SI-5A
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900">
                Belum Konfirmasi
              </span>
            </div>

            <Link
              to="/mahasiswa/bimbingan"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors text-center"
            >
              <ClipboardCheck className="w-4 h-4 stroke-[1.8]" />
              <span>Konfirmasi Kehadiran Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            Tidak ada tindakan yang perlu dilakukan saat ini.
          </div>
        )}
      </div>

      {/* 4. BIMBINGAN TERBARU LIST */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bimbingan Terbaru
          </h3>
          <Link
            to="/mahasiswa/bimbingan"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5 stroke-[1.8]" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Session 1 */}
          <div className="py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                <BookOpenCheck className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate leading-tight">
                  Persiapan Menghadapi UTS
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  20 Jan 2027 • Bimbingan Kelas SI-5A
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
              Belum Konfirmasi
            </span>
          </div>

          {/* Session 2 */}
          <div className="py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate leading-tight">
                  Evaluasi Akademik & KRS Semester 5
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  06 Des 2026 • Paraf Dosen PA: ✓ Valid
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
              Tervalidasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
