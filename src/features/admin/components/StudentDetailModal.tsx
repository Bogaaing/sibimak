import React from 'react';
import { Student } from '../../../types/database.types';
import { store } from '../../../lib/store';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { GraduationCap, School, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!student) return null;

  const currentClass = student.class || store.getClasses().find(c => c.id === student.class_id);
  const assignment = store.getAssignments().find(a => a.class_id === student.class_id);
  const lecturer = assignment?.lecturer;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Informasi Mahasiswa">
      <div className="space-y-5">
        {/* Header Avatar & Identity */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-extrabold text-base shadow-2xs flex-shrink-0">
            {student.profile?.full_name?.slice(0, 2).toUpperCase() || 'MH'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {student.profile?.full_name}
              </h3>
              <Badge variant="success" size="sm">
                Aktif
              </Badge>
            </div>
            <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">
              NIM: {student.nim}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {currentClass?.study_program || 'S1 Sistem Informasi'}
            </p>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 text-[10.5px] block font-medium">Kelas Perwalian</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">Kelas {currentClass?.name || '-'}</span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 text-[10.5px] block font-medium">Tipe Program</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{student.program_type || 'Reguler'}</span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 text-[10.5px] block font-medium">Tahun Masuk (Angkatan)</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{student.entry_year || '2024'}</span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 text-[10.5px] block font-medium">Jenjang</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{currentClass?.academic_level || 'S1'}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Kontak Resmi
          </span>
          <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 stroke-[1.8]" />
              <span className="font-medium text-slate-800">{student.profile?.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-600 stroke-[1.8]" />
              <span className="font-medium text-slate-800">{student.profile?.phone_number || '-'}</span>
            </div>
          </div>
        </div>

        {/* Dosen PA Assigned */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
          <span className="text-[10.5px] font-bold text-blue-700 uppercase tracking-wider block">
            Dosen Pembimbing Akademik (PA)
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {lecturer ? getLecturerFullName(lecturer) : 'Belum diplotting'}
          </p>
          {lecturer && (
            <p className="text-[11px] text-slate-500 font-mono">
              NIDN: {lecturer.nidn} • {lecturer.department}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
