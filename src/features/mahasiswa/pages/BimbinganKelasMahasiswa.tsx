import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
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
  RefreshCw,
} from 'lucide-react';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { AttendanceStatus } from '../../../types/database.types';
import { 
  mahasiswaService, 
  StudentFullData, 
  StudentClassSessionItem 
} from '../../../services/mahasiswa.service';

export const BimbinganKelasMahasiswa: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id;

  const [studentData, setStudentData] = useState<StudentFullData | null>(null);
  const [classSessions, setClassSessions] = useState<StudentClassSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const loadData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const academicData = await mahasiswaService.getStudentAcademicData(studentId);
      setStudentData(academicData);

      const classId = academicData.student?.class_id || undefined;
      const sessions = await mahasiswaService.getClassGuidanceSessions(studentId, classId);
      setClassSessions(sessions);
    } catch (err: any) {
      console.error('Error loading class guidance sessions:', err);
      setError('Gagal memuat data bimbingan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSaveConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !studentId) return;

    setIsSubmitting(true);
    try {
      await mahasiswaService.confirmClassGuidanceAttendance(
        selectedSessionId,
        studentId,
        confirmForm.attendance_status,
        confirmForm.student_notes
      );
      setIsConfirmModalOpen(false);
      // Refresh list to show updated status
      const classId = studentData?.student?.class_id || undefined;
      const updatedSessions = await mahasiswaService.getClassGuidanceSessions(studentId, classId);
      setClassSessions(updatedSessions);
    } catch (err: any) {
      alert('Gagal menyimpan konfirmasi: ' + (err.message || 'Terjadi kesalahan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const academicClass = studentData?.academicClass;
  const activeAcademicYear = studentData?.activeAcademicYear;
  const lecturer = studentData?.advisorLecturer;

  // Split topic description into list items if multiline, otherwise single text
  const parseTopics = (text: string) => {
    if (!text) return [];
    return text
      .split(/\n+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-5 pb-6">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#EEF5FF] border border-[#E0EDFD] p-5 sm:p-6 shadow-2xs">
        {/* Circular soft blue disc background behind 3D illustration */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#DCEAFB] pointer-events-none" />

        {/* Back Button (Circle top left) */}
        <div className="relative z-10 mb-2.5">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/dashboard')}
            className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* 2-Column: Title/Subtitle (Left) + 3D Illustration (Right) */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1 pr-2">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Bimbingan Kelas
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-[210px] sm:max-w-xs">
              Konfirmasi kehadiran dan sampaikan catatan atau pertanyaan untuk setiap sesi bimbingan.
            </p>
          </div>

          {/* 3D Toga & Book Asset */}
          <div className="flex-shrink-0 relative">
            <img
              src="/assets/buku-toga.png"
              alt="Bimbingan Kelas"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain pointer-events-none select-none drop-shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARD DETAIL BIMBINGAN / LIST                           */}
      {/* ========================================================= */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="bg-white rounded-[26px] border border-slate-100 p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-10 bg-slate-200 rounded-xl"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-2xs space-y-3">
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
        ) : classSessions.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-[26px] border border-slate-200 text-center shadow-2xs space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto stroke-[1.8]" />
            <h4 className="text-sm font-bold text-slate-800">Belum ada jadwal bimbingan.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Saat ini belum ada agenda bimbingan kelas yang dijadwalkan oleh Dosen Pembimbing Akademik Anda.
            </p>
          </div>
        ) : (
          classSessions.map(({ session, participant }) => {
            const attendanceStatus = participant?.attendance_status || 'BELUM_KONFIRMASI';
            const topics = parseTopics(session.topic_description);

            return (
              <div
                key={session.id}
                className="bg-white rounded-[26px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4 sm:space-y-5"
              >
                {/* A. HEADER ROW (Kelas, Tanggal, HADIR) */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  {/* Left: Badge Kelas */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-blue-100/70 shadow-2xs">
                    <Users className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Kelas {academicClass?.name || 'Reguler'}</span>
                  </div>

                  {/* Center: Tanggal & Semester */}
                  <div className="flex items-center gap-2 text-left">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 stroke-[1.8]" />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] leading-tight">
                        {formatDate(session.session_date, 'dd MMMM yyyy')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                        {activeAcademicYear?.name || 'Tahun Akademik Berjalan'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Kehadiran */}
                  <div>
                    {attendanceStatus === 'HADIR' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ECFDF5] text-[#16A34A] border border-emerald-100 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        HADIR
                      </span>
                    ) : attendanceStatus === 'BELUM_KONFIRMASI' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 stroke-[2.2]" />
                        BELUM KONFIRMASI
                      </span>
                    ) : attendanceStatus === 'IZIN' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                        IZIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                        TIDAK HADIR
                      </span>
                    )}
                  </div>
                </div>

                {/* B. JUDUL BIMBINGAN */}
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                    {session.title}
                  </h2>
                </div>

                {/* C. TOPIK & PEMBAHASAN */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-100/90 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-blue-100/80 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      TOPIK & PEMBAHASAN
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {topics.length > 0 ? (
                      topics.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#E0EDFF] text-[#2563EB] font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-[13px] text-slate-700 font-medium leading-normal">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        {session.topic_description || 'Belum ada rincian pembahasan khusus.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* D. INFORMASI DETAIL (3 Information Cards) */}
                <div className="space-y-2.5">
                  {/* 1. TEMPAT / MEDIA */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100/90 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        TEMPAT / MEDIA
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug mt-1 truncate">
                        {session.venue_or_link || 'Diumumkan oleh Dosen PA'}
                      </p>
                    </div>
                  </div>

                  {/* 2. WAKTU */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100/90 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4.5 h-4.5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        WAKTU
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug mt-1 truncate">
                        {formatDate(session.session_date, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* 3. PEMBIMBING */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100/90 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-4.5 h-4.5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        PEMBIMBING
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug mt-1 truncate">
                        {lecturer ? getLecturerFullName(lecturer) : 'Belum terplotting'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* E. ACTION BUTTONS */}
                <div className="pt-2 space-y-2.5">
                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenConfirm(session.id, attendanceStatus, participant?.student_notes)}
                    className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <CalendarCheck className="w-4.5 h-4.5 stroke-[2]" />
                    <span>Konfirmasi Kehadiran</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>

                  {/* Secondary Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenNotes(session.title, participant?.student_notes, participant?.lecturer_feedback)}
                    className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-4.5 h-4.5 text-slate-600 stroke-[2]" />
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
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Konfirmasi'}
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
