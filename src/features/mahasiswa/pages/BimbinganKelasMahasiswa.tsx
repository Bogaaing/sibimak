import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { store } from '../../../lib/store';
import {
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Clock,
  AlertTriangle,
  UserRound,
  FileCheck
} from 'lucide-react';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { AttendanceStatus } from '../../../types/database.types';

export const BimbinganKelasMahasiswa: React.FC = () => {
  const { user } = useAuth();
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

  const [participations, setParticipations] = useState(() =>
    store.getParticipants().filter((p) => p.student_id === studentId)
  );

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
    if (!text) return [];
    if (text.includes('\n')) {
      return text.split('\n').map((l) => l.trim()).filter(Boolean);
    }
    // Check if text has pattern "a. ... b. ... " or "1. ... 2. ..."
    const regex = /(?:^|\s+)([a-zA-Z0-9]+[\.\)])\s+/;
    if (regex.test(text)) {
      const parts = text.split(/(?:^|\s+)(?=[a-zA-Z0-9]+[\.\)]\s+)/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) return parts;
    }
    return [text];
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      {/* 1. PAGE TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Bimbingan Kelas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Konfirmasi kehadiran dan sampaikan catatan atau pertanyaan untuk setiap sesi bimbingan.
        </p>
      </div>

      {/* 2. INFORMATION PANEL */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5 shadow-2xs">
          <BookOpen className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="text-xs text-[#1E3A8A] leading-relaxed">
          Kegiatan bimbingan kelas dijadwalkan oleh Dosen PA untuk seluruh mahasiswa di kelas Anda (<strong>Kelas {currentStudent?.class?.name || 'SI-5A'}</strong>). Pastikan Anda melakukan konfirmasi kehadiran dan menuliskan catatan atau pertanyaan sebelum sesi dimulai.
        </div>
      </div>

      {/* 3. BIMBINGAN SESSIONS LIST */}
      <div className="space-y-4 sm:space-y-5">
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
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row: Class Badge, Date, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      Kelas {session.assignment?.class?.name || currentStudent?.class?.name || 'SI-5A'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(session.session_date)}
                    </span>
                  </div>

                  <div>
                    {p.attendance_status === 'HADIR' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        HADIR
                      </span>
                    )}
                    {p.attendance_status === 'BELUM_KONFIRMASI' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        BELUM KONFIRMASI
                      </span>
                    )}
                    {p.attendance_status === 'IZIN' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        IZIN
                      </span>
                    )}
                    {p.attendance_status === 'TIDAK_HADIR' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        TIDAK HADIR
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {session.title}
                  </h3>
                </div>

                {/* Topik & Pembahasan */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Topik & Pembahasan
                  </h4>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                    {topicPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail Bimbingan Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  {/* Tempat / Media */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        Tempat / Media
                      </p>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">
                        {session.venue_or_link || 'Ruang Teater FTI / Google Meet'}
                      </p>
                    </div>
                  </div>

                  {/* Waktu */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        Waktu
                      </p>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">
                        {formatDate(session.session_date, 'dd MMM yyyy')} • 10.00–12.00 WIB
                      </p>
                    </div>
                  </div>

                  {/* Pembimbing */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <UserRound className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        Pembimbing
                      </p>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">
                        {lecturer ? getLecturerFullName(lecturer) : 'Ahmad Asep Suhendi, S.Kom., M.Kom.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Submitted Notes (if any) */}
                {p.student_notes && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                      Catatan / Pertanyaan Anda:
                    </span>
                    <p className="text-amber-800 leading-relaxed pl-5">{p.student_notes}</p>
                  </div>
                )}

                {/* Feedback from Lecturer (if any) */}
                {p.lecturer_feedback && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                      Tanggapan dari Dosen PA:
                    </span>
                    <p className="text-blue-800 leading-relaxed pl-5">{p.lecturer_feedback}</p>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {p.validation_status === 'VALID' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        Tervalidasi oleh Dosen PA
                      </span>
                    ) : (
                      <span>Status kehadiran dapat diubah sebelum sesi dimulai.</span>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant={isPending ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleOpenConfirm(session.id, p.attendance_status, p.student_notes)}
                    className="min-h-[44px] px-4 font-bold text-xs shadow-2xs"
                  >
                    {isPending ? 'Konfirmasi Kehadiran' : 'Ubah Respon'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Konfirmasi Kehadiran & Catatan */}
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
    </div>
  );
};
