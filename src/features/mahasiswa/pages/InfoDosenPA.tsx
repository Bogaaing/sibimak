import React, { useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { store } from '../../../lib/store';
import { 
  UserRound, 
  Mail, 
  Phone, 
  FileText, 
  MessagesSquare, 
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';
import { EmptyState } from '../../../components/feedback/EmptyState';

export const InfoDosenPA: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = useMemo(() => {
    return store.getStudents().find((s) => s.id === studentId);
  }, [studentId]);

  const myClassId = currentStudent?.class_id;
  const myClass = useMemo(() => {
    if (!myClassId) return currentStudent?.class;
    return store.getClasses().find((c) => c.id === myClassId) || currentStudent?.class;
  }, [myClassId, currentStudent]);

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

  // Initials helper
  const studentInitials = useMemo(() => {
    if (!user?.full_name) return 'AF';
    const parts = user.full_name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.full_name.slice(0, 2).toUpperCase();
  }, [user]);

  const lecturerInitials = useMemo(() => {
    const name = lecturer?.profile?.full_name || 'Ahmad Asep Suhendi';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [lecturer]);

  // Semester helper
  const semesterNumber = useMemo(() => {
    if (myClass?.name) {
      const match = myClass.name.match(/\d+/);
      if (match) return match[0];
    }
    return '5';
  }, [myClass]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-6 max-w-4xl mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Profil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Informasi akun dan data akademik Anda.
        </p>
      </div>

      {/* 2. PROFIL MAHASISWA (IDENTITAS UTAMA) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Profil Mahasiswa
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mahasiswa Aktif
          </span>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 border-2 border-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-2xs flex-shrink-0">
            {studentInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate leading-snug">
              {user?.full_name || 'Ahmad Fauzi'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NIM: {currentStudent?.nim || '2210511045'}
            </p>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              {myClass?.study_program || 'Sistem Informasi'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. DATA AKADEMIK (COMPACT GRID) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Data Akademik
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Kelas</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{myClass?.name || 'SI-5A'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Program</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentStudent?.program_type || 'Reguler'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Program Studi</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{myClass?.study_program || 'Sistem Informasi'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Angkatan</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentStudent?.entry_year || '2024'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Semester</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{semesterNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">Aktif</span>
          </div>
        </div>
      </div>

      {/* 4. DOSEN PEMBIMBING AKADEMIK & KONTAK */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Dosen Pembimbing Akademik
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Terplotting
          </span>
        </div>

        {lecturer ? (
          <div className="space-y-4">
            {/* Lecturer Identity */}
            <div className="flex items-start gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-2xs">
                {lecturerInitials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                  {getLecturerFullName(lecturer)}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  NIDN: {lecturer.nidn || '0411099202'}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Program Studi {lecturer.department || 'Sistem Informasi'}
                </p>
              </div>
            </div>

            {/* Combined Contacts (Email & WhatsApp) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Mail className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Email Resmi</span>
                  <span className="font-semibold text-slate-800 truncate block mt-0.5">
                    {lecturer.profile?.email || 'Dosen02975@unpam.ac.id'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Phone className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp</span>
                  <span className="font-semibold text-slate-800 truncate block mt-0.5">
                    {lecturer.profile?.phone_number || '0851.5977.4347'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
              <Link
                to="/mahasiswa/konsultasi"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors text-center min-h-[46px]"
              >
                <MessagesSquare className="w-4 h-4 stroke-[1.8]" />
                <span>Ajukan Konsultasi</span>
              </Link>
              <Link
                to={`/report/formulir?studentId=${studentId || 'usr-mhs-1'}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors text-center min-h-[46px]"
              >
                <FileText className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                <span>Form Bimbingan</span>
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Dosen Pembimbing Akademik"
            description="Anda belum memiliki Dosen Pembimbing Akademik yang terplotting."
          />
        )}
      </div>
    </div>
  );
};
