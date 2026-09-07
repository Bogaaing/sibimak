import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { store } from '../../../lib/store';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Clock,
  UserRound,
  CalendarCheck,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { AttendanceStatus } from '../../../types/database.types';

export const BimbinganKelasMahasiswa: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id;

  const currentStudent = useMemo(() => {
    return store.getStudents().find((s) => s.id === studentId);
  }, [studentId]);

  const myClassId = currentStudent?.class_id;
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

  const activeAcademicYear = useMemo(() => {
    return store.getActiveAcademicYear();
  }, []);

  const [participations, setParticipations] = useState(() =>
    store.getParticipants().filter((p) => p.student_id === studentId)
  );

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedNotesData, setSelectedNotesData] = useState<{
    sessionTitle: string;
    studentNotes?: string | null;
    lecturerFeedback?: string | null;
  } | null>(null);

  const [confirmForm, setConfirmForm] = useState({
    attendance_status: 'HADIR' as AttendanceStatus,
    student_notes: '',
  });

  const handleOpenConfirm = (sessionId: string, currentStatus: AttendanceStatus, currentNotes?: string | null) => {
    setSelectedSessionId(sessionId);
    setConfirmForm({
      attendance_status: currentStatus === 'BELUM_KONFIRMASI' ? 'HADIR' : currentStatus,
      student_notes: currentNotes || '',
    });
    setIsConfirmModalOpen(true);
  };

  const handleOpenNotes = (sessionTitle: string, studentNotes?: string | null, lecturerFeedback?: string | null) => {
    setSelectedNotesData({
      sessionTitle,
      studentNotes,
      lecturerFeedback,
    });
    setIsNotesModalOpen(true);
  };

  const handleSaveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !studentId) return;

    store.updateParticipantAttendance(
      selectedSessionId,
      studentId,
      confirmForm.attendance_status,
      confirmForm.student_notes
    );

    setParticipations(store.getParticipants().filter((p) => p.student_id === studentId));
    setIsConfirmModalOpen(false);
  };

  // Helper to format topic description points cleanly
  const formatTopicPoints = (text?: string | null) => {
    if (!text) {
      return [
        'Perkenalan',
        'Penyampaian tata tertib sebagai mahasiswa baru',
        'Motivasi supaya Nilai bagus dan Lulus tepat waktu',
      ];
    }
    if (text.includes('\n')) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) return lines;
    }
    const regex = /(?:^|\s+)([a-zA-Z0-9]+[\.\)])\s+/;
    if (regex.test(text)) {
      const parts = text.split(/(?:^|\s+)(?=[a-zA-Z0-9]+[\.\)]\s+)/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) return parts;
    }
    return [text];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* ========================================================= */}
      {/* 1. HERO / PAGE HEADER (Soft Blue Gradient & 3D Illustration) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/20 border border-blue-100/70 p-5 sm:p-6 shadow-2xs">
        {/* Soft Circular Decorative Background Glow */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-blue-200/40 blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-10 w-28 h-28 rounded-full bg-indigo-200/30 blur-xl pointer-events-none" />

        {/* Back Button (Circle top left) */}
        <div className="relative z-10 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/dashboard')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Header Content & 3D Illustration */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bimbingan Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm sm:max-w-md leading-relaxed">
              Konfirmasi kehadiran dan sampaikan catatan atau pertanyaan untuk setiap sesi bimbingan.
            </p>
          </div>

          {/* 3D Toga & Book Illustration */}
          <div className="flex-shrink-0 relative hidden xs:block">
            <img
              src="/assets/buku-toga.png"
              alt="Bimbingan Kelas"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-sm pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARD DETAIL BIMBINGAN LIST                             */}
      {/* ========================================================= */}
      <div className="space-y-5">
        {participations.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center shadow-2xs space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto stroke-[1.8]" />
            <h4 className="text-sm font-bold text-slate-800">Belum Ada Sesi Bimbingan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada agenda bimbingan kelas yang dijadwalkan oleh Dosen PA Anda saat ini.
            </p>
          </div>
        ) : (
          participations.map((p) => {
            const session = store.getClassSessions().find((cs) => cs.id === p.session_id);
            if (!session) return null;

            const isPending = p.attendance_status === 'BELUM_KONFIRMASI';
            const topicPoints = formatTopicPoints(session.topic_description);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-4 sm:space-y-5"
              >
                {/* 3. BAGIAN ATAS CARD: BADGE KELAS, TANGGAL & SEMESTER, STATUS KEHADIRAN */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    {/* Badge Kelas */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100/80 shadow-2xs">
                      <Users className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Kelas {session.assignment?.class?.name || currentStudent?.class?.name || 'SI-5A'}</span>
                    </div>

                    {/* Tanggal & Informasi Semester */}
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {formatDate(session.session_date, 'dd MMMM yyyy')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                          {activeAcademicYear?.name ? `Semester ${activeAcademicYear.name}` : 'Semester Ganjil 2024/2025'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Kehadiran Badge */}
                  <div>
                    {p.attendance_status === 'HADIR' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        HADIR
                      </span>
                    )}
                    {p.attendance_status === 'BELUM_KONFIRMASI' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" />
                        BELUM KONFIRMASI
                      </span>
                    )}
                    {p.attendance_status === 'IZIN' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                        IZIN
                      </span>
                    )}
                    {p.attendance_status === 'TIDAK_HADIR' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                        TIDAK HADIR
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. JUDUL BIMBINGAN & DESKRIPSI SINGKAT */}
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {session.title || 'Pengarahan Awal & Tata Tertib Akademik'}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sesi awal untuk memberikan pengenalan, penyampaian tata tertib, serta motivasi dalam menjalani perkuliahan.
                  </p>
                </div>

                {/* 5. TOPIK & PEMBAHASAN (SECTION NUMBERED LIST) */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-100/90 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 stroke-[2]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Topik & Pembahasan
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-0.5">
                    {topicPoints.map((point, index) => {
                      const cleanPoint = point.replace(/^[a-zA-Z0-9]+[\.\)]\s*/, '');
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs text-slate-700 leading-relaxed pt-0.5">
                            {cleanPoint}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. INFORMASI BIMBINGAN (3 INFORMATION ROWS) */}
                <div className="space-y-2.5">
                  {/* Tempat / Media */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        Tempat / Media
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mt-1 truncate">
                        {session.venue_or_link || 'Ruang Teater FTI / Google Meet'}
                      </p>
                    </div>
                  </div>

                  {/* Waktu */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4.5 h-4.5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        Waktu
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mt-1 truncate">
                        {formatDate(session.session_date, 'dd MMM yyyy')} • 10.00–12.00 WIB
                      </p>
                    </div>
                  </div>

                  {/* Pembimbing */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-4.5 h-4.5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        Pembimbing
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mt-1 truncate">
                        {lecturer ? getLecturerFullName(lecturer) : 'Ahmad Asep Suhendi, S.Kom., M.Kom.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. ACTION BUTTONS (PRIMARY & SECONDARY) */}
                <div className="pt-2 space-y-2.5">
                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenConfirm(session.id, p.attendance_status, p.student_notes)}
                    className="w-full h-11 sm:h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4 stroke-[2]" />
                    <span>{isPending ? 'Konfirmasi Kehadiran' : 'Ubah Konfirmasi Kehadiran'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>

                  {/* Secondary Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenNotes(session.title, p.student_notes, p.lecturer_feedback)}
                    className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500 stroke-[2]" />
                    <span>Lihat Catatan Bimbingan</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 stroke-[2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: KONFIRMASI KEHADIRAN & CATATAN                   */}
      {/* ========================================================= */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Kehadiran Bimbingan Kelas"
      >
        <form onSubmit={handleSaveConfirm} className="space-y-4 pt-1">
          <Select
            label="Status Kehadiran *"
            options={[
              { value: 'HADIR', label: 'Hadir' },
              { value: 'IZIN', label: 'Izin' },
              { value: 'TIDAK_HADIR', label: 'Tidak Hadir' },
            ]}
            value={confirmForm.attendance_status}
            onChange={(e) =>
              setConfirmForm({
                ...confirmForm,
                attendance_status: e.target.value as AttendanceStatus,
              })
            }
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Catatan atau Pertanyaan untuk Dosen PA (Opsional)
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan pertanyaan materi, progres studi, kendala KRS, atau persiapan yang ingin disampaikan..."
              value={confirmForm.student_notes}
              onChange={(e) =>
                setConfirmForm({ ...confirmForm, student_notes: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Catatan ini akan langsung diterima dan dapat ditanggapi oleh Dosen PA Anda.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button type="submit" className="min-h-[44px]">
              Simpan Konfirmasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: LIHAT CATATAN & FEEDBACK BIMBINGAN              */}
      {/* ========================================================= */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="Catatan Bimbingan"
      >
        <div className="space-y-4 pt-1">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sesi Bimbingan
            </h4>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {selectedNotesData?.sessionTitle}
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Student Notes */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                Catatan / Pertanyaan Anda:
              </span>
              <p className="text-amber-800 leading-relaxed pl-5">
                {selectedNotesData?.studentNotes || 'Belum ada catatan yang Anda tuliskan untuk sesi ini.'}
              </p>
            </div>

            {/* Lecturer Feedback */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                Tanggapan dari Dosen PA:
              </span>
              <p className="text-blue-800 leading-relaxed pl-5">
                {selectedNotesData?.lecturerFeedback || 'Belum ada tanggapan khusus dari Dosen PA untuk sesi ini.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="button"
              onClick={() => setIsNotesModalOpen(false)}
              className="min-h-[44px] px-5"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
