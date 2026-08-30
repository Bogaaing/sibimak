import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { store } from '../../../lib/store';
import { 
  UserRound, 
  Mail, 
  Phone, 
  School, 
  CalendarDays, 
  FileText, 
  MessagesSquare, 
  LogOut, 
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';

export const InfoDosenPA: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id;

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const currentStudent = store.getStudents().find(s => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const assignment = store.getAssignments().find(a => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 1. STUDENT IDENTITY OVERVIEW CARD */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Profil Mahasiswa
          </span>
          <Badge variant="success" size="sm">
            Mahasiswa Aktif
          </Badge>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 border-2 border-blue-500 flex items-center justify-center text-white font-extrabold text-base shadow-2xs flex-shrink-0">
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'AF'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
              {user?.full_name || 'Ahmad Fauzi'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NIM: {currentStudent?.nim || '2210114001'}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              {currentStudent?.class?.study_program || 'S1 Sistem Informasi'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-medium text-slate-400 block">Kelas</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">{currentStudent?.class?.name || 'SI-5A'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10.5px] font-medium text-slate-400 block">Program</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">{currentStudent?.program_type || 'Reguler'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10.5px] font-medium text-slate-400 block">Angkatan</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">{currentStudent?.entry_year || '2024'}</span>
          </div>
        </div>
      </div>

      {/* 2. DOSEN PA INFORMATION CARD */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Dosen Pembimbing Akademik (PA)
          </span>
          <Badge variant="default" size="sm">
            Terplotting
          </Badge>
        </div>

        {lecturer ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-2xs">
                AA
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
                  {getLecturerFullName(lecturer)}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  NIDN: {lecturer.nidn} • {lecturer.department}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[1.8]" />
                <div className="min-w-0">
                  <span className="text-[10.5px] text-slate-400 block">Email Resmi</span>
                  <span className="font-semibold text-slate-800 truncate block">{lecturer.profile?.email || 'ahmad.asep@unpam.ac.id'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[1.8]" />
                <div className="min-w-0">
                  <span className="text-[10.5px] text-slate-400 block">Kontak / WhatsApp</span>
                  <span className="font-semibold text-slate-800 truncate block">{lecturer.profile?.phone_number || '0851.5977.4347'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                to="/mahasiswa/konsultasi"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors text-center"
              >
                <MessagesSquare className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>Ajukan Konsultasi</span>
              </Link>
              <Link
                to="/report/formulir?studentId=usr-mhs-1"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors text-center"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                <span>Form Bimbingan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            Dosen Pembimbing Akademik belum di-plotting untuk kelas Anda.
          </div>
        )}
      </div>

      {/* 3. LOGOUT ACTION SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Akun & Keamanan
        </span>
        
        <button
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors select-none"
        >
          <LogOut className="w-4 h-4 stroke-[1.8]" />
          <span>Keluar dari Akun Si-BimAk</span>
        </button>
      </div>

      {/* Confirmation Dialog for Logout */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Keluar Akun"
        message="Apakah Anda yakin ingin keluar dari sesi Si-BimAk pada perangkat ini?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
