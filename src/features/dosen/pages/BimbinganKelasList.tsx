import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  Bell
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { ClassGuidanceSession, ClassGuidanceParticipant } from '../../../types/database.types';

export const BimbinganKelasList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const myAssignments = store.getAssignments().filter((a) => a.lecturer_id === lecturerId);
  const myAssignmentIds = myAssignments.map((a) => a.id);

  const [sessions, setSessions] = useState(() =>
    store.getClassSessions().filter((cs) => myAssignmentIds.includes(cs.assignment_id))
  );

  const [selectedSession, setSelectedSession] = useState<ClassGuidanceSession | null>(
    sessions[0] || null
  );

  const [participants, setParticipants] = useState(() =>
    selectedSession ? store.getParticipants().filter((p) => p.session_id === selectedSession.id) : []
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [targetParticipant, setTargetParticipant] = useState<ClassGuidanceParticipant | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    assignment_id: myAssignments[0]?.id || '',
    session_date: new Date().toISOString().split('T')[0],
    title: '',
    topic_description: '',
    venue_or_link: 'Ruang 402 / Google Meet',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectSession = (session: ClassGuidanceSession) => {
    setSelectedSession(session);
    setParticipants(store.getParticipants().filter((p) => p.session_id === session.id));
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignment_id || !formData.title || !formData.topic_description) {
      alert('Mohon lengkapi data sesi bimbingan kelas!');
      return;
    }

    const created = store.createClassSession({
      assignment_id: formData.assignment_id,
      session_date: formData.session_date,
      title: formData.title,
      topic_description: formData.topic_description,
      venue_or_link: formData.venue_or_link,
    });

    const updated = store.getClassSessions().filter((cs) => myAssignmentIds.includes(cs.assignment_id));
    setSessions(updated);
    setSelectedSession(created);
    setParticipants(store.getParticipants().filter((p) => p.session_id === created.id));
    setIsCreateModalOpen(false);
    showToast('Sesi bimbingan kelas berhasil dibuat dan disiarkan ke mahasiswa.');

    setFormData({
      assignment_id: myAssignments[0]?.id || '',
      session_date: new Date().toISOString().split('T')[0],
      title: '',
      topic_description: '',
      venue_or_link: '',
    });
  };

  const handleOpenValidateModal = (p: ClassGuidanceParticipant) => {
    if (p.attendance_status !== 'HADIR') {
      alert('Validasi hanya dapat dilakukan pada mahasiswa dengan status kehadiran HADIR.');
      return;
    }
    setTargetParticipant(p);
    setFeedbackInput(p.lecturer_feedback || '');
    setIsValidateModalOpen(true);
  };

  const handleConfirmValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !targetParticipant || !lecturerId) return;

    store.validateParticipant(
      selectedSession.id,
      targetParticipant.student_id,
      lecturerId,
      feedbackInput.trim() || undefined
    );

    const updatedParticipants = store.getParticipants().filter((p) => p.session_id === selectedSession.id);
    setParticipants(updatedParticipants);
    setIsValidateModalOpen(false);
    showToast(`✓ Bimbingan ${targetParticipant.student?.profile?.full_name} berhasil divalidasi. Paraf Dosen resmi telah aktif.`);
  };

  const handleValidateAllHadir = () => {
    if (!selectedSession || !lecturerId) return;
    const hadirPending = participants.filter(
      (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
    );

    if (hadirPending.length === 0) {
      alert('Tidak ada mahasiswa berstatus HADIR yang belum divalidasi.');
      return;
    }

    if (!window.confirm(`Validasi ${hadirPending.length} mahasiswa berstatus HADIR pada sesi ini?`)) return;

    store.validateAllSessionParticipants(selectedSession.id, lecturerId);
    setParticipants(store.getParticipants().filter((p) => p.session_id === selectedSession.id));
    showToast(`✓ ${hadirPending.length} mahasiswa berstatus HADIR berhasil divalidasi secara massal.`);
  };

  // Participant KPI calculation
  const totalCount = participants.length;
  const hadirCount = participants.filter((p) => p.attendance_status === 'HADIR').length;
  const izinCount = participants.filter((p) => p.attendance_status === 'IZIN').length;
  const tidakHadirCount = participants.filter((p) => p.attendance_status === 'TIDAK_HADIR').length;
  const belumKonfirmasiCount = participants.filter((p) => p.attendance_status === 'BELUM_KONFIRMASI').length;
  const validCount = participants.filter((p) => p.attendance_status === 'HADIR' && p.validation_status === 'VALID').length;

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-md shadow-lg border border-slate-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Header Bar */}
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Agenda Sesi Bimbingan Kelas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih sesi bimbingan untuk melihat rekap kehadiran mahasiswa dan melakukan validasi paraf resmi Dosen PA.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold h-8.5 px-3.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Sesi Kelas Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sessions List Column */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Daftar Sesi ({sessions.length})
            </h4>

            {sessions.length === 0 ? (
              <div className="bg-white p-6 rounded-md border border-slate-200 text-center text-xs text-slate-500">
                Belum ada sesi bimbingan kelas. Silakan buat sesi baru.
              </div>
            ) : (
              sessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-3.5 rounded-md border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Kelas {session.assignment?.class?.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatDate(session.session_date)}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                      {session.title}
                    </h4>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-emerald-700 font-medium">
                        {session.confirmed_count} / {session.participants_count} Terkonfirmasi
                      </span>
                      <span className="font-semibold text-slate-700">
                        {session.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Session Detail & Participant Rekap / Validation Column */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSession ? (
              <>
                {/* Session Header Card */}
                <div className="bg-white rounded-md border border-slate-200 shadow-2xs p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-800 text-white">
                          Kelas {selectedSession.assignment?.class?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedSession.assignment?.class?.study_program}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                        {selectedSession.title}
                      </h3>
                    </div>

                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedSession.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Pokok Pembahasan:
                    </span>
                    <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200/80 font-mono whitespace-pre-line leading-relaxed">
                      {selectedSession.topic_description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-800" />
                      <span>Pelaksanaan: <strong>{formatDate(selectedSession.session_date)}</strong></span>
                    </div>
                    {selectedSession.venue_or_link && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-700" />
                        <span>Tempat / Media: <strong>{selectedSession.venue_or_link}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-Row Attendance Summary Strip */}
                <div className="bg-white rounded-md border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  <div className="p-2.5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Mhs</span>
                    <span className="text-base font-bold text-slate-900">{totalCount}</span>
                  </div>
                  <div className="p-2.5 text-center bg-emerald-50/40">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Hadir</span>
                    <span className="text-base font-bold text-emerald-800">{hadirCount}</span>
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">Izin</span>
                    <span className="text-base font-bold text-purple-700">{izinCount}</span>
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">Tidak Hadir</span>
                    <span className="text-base font-bold text-rose-700">{tidakHadirCount}</span>
                  </div>
                  <div className="p-2.5 text-center col-span-2 sm:col-span-1 bg-blue-50/40">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Tervalidasi</span>
                    <span className="text-base font-bold text-blue-800">{validCount} / {hadirCount}</span>
                  </div>
                </div>

                {/* Participants Rekap & Validation Table */}
                <div className="bg-white rounded-md border border-slate-200 shadow-2xs">
                  <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-800" />
                        Rekapitulasi Kehadiran & Validasi Mahasiswa ({participants.length})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Validasi hanya berlaku untuk mahasiswa berstatus <strong>HADIR</strong>.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleValidateAllHadir}
                      className="text-[11px] h-7 px-2.5 gap-1 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Validasi Semua Hadir
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-semibold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="px-3.5 py-2.5 text-center w-8">No</th>
                          <th className="px-3.5 py-2.5">Mahasiswa</th>
                          <th className="px-3.5 py-2.5 text-center">Kehadiran</th>
                          <th className="px-3.5 py-2.5">Catatan / Respon</th>
                          <th className="px-3.5 py-2.5 text-center">Status Validasi</th>
                          <th className="px-3.5 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {participants.map((p, idx) => {
                          const isHadir = p.attendance_status === 'HADIR';
                          const isValid = isHadir && p.validation_status === 'VALID';
                          const isPending = isHadir && p.validation_status === 'PENDING';
                          const isBelumKonfirmasi = p.attendance_status === 'BELUM_KONFIRMASI';

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors h-9">
                              <td className="px-3.5 py-2 text-center text-slate-400 font-bold text-[11px]">
                                {idx + 1}
                              </td>

                              <td className="px-3.5 py-2">
                                <div className="font-bold text-slate-900 text-xs">
                                  {p.student?.profile?.full_name}
                                </div>
                                <div className="text-[10.5px] font-mono text-slate-500">
                                  NIM: {p.student?.nim}
                                </div>
                              </td>

                              <td className="px-3.5 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  p.attendance_status === 'HADIR' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  p.attendance_status === 'IZIN' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                                  p.attendance_status === 'TIDAK_HADIR' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                  'bg-slate-100 text-slate-600 border-slate-300'
                                }`}>
                                  {p.attendance_status}
                                </span>
                              </td>

                              <td className="px-3.5 py-2 max-w-xs space-y-0.5">
                                {p.student_notes ? (
                                  <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                                    <span className="font-semibold text-slate-900 block text-[10px]">Tanya:</span>
                                    {p.student_notes}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">-</span>
                                )}

                                {p.lecturer_feedback && (
                                  <div className="text-[11px] text-blue-900 bg-blue-50 p-1.5 rounded border border-blue-200">
                                    <span className="font-semibold text-blue-900 block text-[10px]">Dosen:</span>
                                    {p.lecturer_feedback}
                                  </div>
                                )}
                              </td>

                              <td className="px-3.5 py-2 text-center">
                                {isValid ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                    VALID
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    PENDING
                                  </span>
                                ) : (
                                  <span className="text-[10.5px] text-slate-400 font-mono">-</span>
                                )}
                              </td>

                              <td className="px-3.5 py-2 text-right whitespace-nowrap">
                                {isValid ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                      Tervalidasi
                                    </span>
                                    <button
                                      onClick={() => handleOpenValidateModal(p)}
                                      className="text-[10.5px] text-slate-500 hover:text-blue-800 underline ml-1"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : isPending ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenValidateModal(p)}
                                    className="h-7 px-2.5 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-2xs"
                                  >
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Validasi
                                  </Button>
                                ) : isBelumKonfirmasi ? (
                                  <button
                                    onClick={() => alert(`Pengingat telah dikirim ke ${p.student?.profile?.full_name}`)}
                                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1 ml-auto"
                                  >
                                    <Bell className="w-3 h-3" />
                                    Ingatkan
                                  </button>
                                ) : (
                                  <span className="text-[10.5px] text-slate-400 italic">Tidak Hadir</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-md border border-slate-200 text-center text-xs text-slate-500">
                Pilih sesi bimbingan kelas terlebih dahulu.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Validasi Bimbingan Dosen PA (Hanya untuk HADIR) */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title="Validasi Pelaksanaan Bimbingan Mahasiswa"
      >
        <form onSubmit={handleConfirmValidation} className="space-y-3.5">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
            <p className="text-slate-500">Mahasiswa:</p>
            <p className="text-xs font-bold text-slate-900">
              {targetParticipant?.student?.profile?.full_name} ({targetParticipant?.student?.nim})
            </p>
            <p className="text-slate-600">
              Status Kehadiran: <strong className="text-emerald-800 font-bold">{targetParticipant?.attendance_status}</strong>
            </p>
            {targetParticipant?.student_notes && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                <span className="text-slate-500 block font-semibold text-[10.5px]">Catatan Mahasiswa:</span>
                <p className="text-slate-800 italic">"{targetParticipant.student_notes}"</p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Tanggapan / Catatan Feedback Dosen PA (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan arahan, tindak lanjut, atau umpan balik..."
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-800 font-sans"
            />
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Mahasiswa terkonfirmasi <strong>HADIR</strong>. Menekan tombol validasi akan menandai status <strong>VALID</strong> dan otomatis menampilkan paraf resmi Dosen PA pada Formulir Bimbingan Akademik.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsValidateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Validasi Bimbingan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Create Class Guidance Session */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Sesi Bimbingan Kelas Baru"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSession} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Pilih Kelas Target *"
              options={myAssignments.map((a) => ({
                value: a.id,
                label: `Kelas ${a.class?.name} (${a.class?.study_program})`,
              }))}
              value={formData.assignment_id}
              onChange={(e) => setFormData({ ...formData, assignment_id: e.target.value })}
            />

            <Input
              type="date"
              label="Tanggal Pelaksanaan *"
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Tema / Judul Bimbingan *"
            placeholder="Contoh: Persiapan UTS Semester Ganjil"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Topik & Pembahasan (Mendukung butir a, b, c) *
            </label>
            <textarea
              rows={4}
              placeholder="a. Review materi perkuliahan&#10;b. Ketentuan tugas besar&#10;c. Tata tertib UTS"
              value={formData.topic_description}
              onChange={(e) => setFormData({ ...formData, topic_description: e.target.value })}
              className="w-full rounded border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-800 font-mono"
              required
            />
          </div>

          <Input
            label="Tempat / Media Tatap Muka"
            placeholder="Contoh: Ruang 402 / Google Meet"
            value={formData.venue_or_link}
            onChange={(e) => setFormData({ ...formData, venue_or_link: e.target.value })}
          />

          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded text-xs flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-800 mt-0.5 flex-shrink-0" />
            <span>
              Seluruh mahasiswa di kelas terpilih otomatis mendapatkan record kegiatan bimbingan (Status Awal: <strong>BELUM KONFIRMASI / PENDING</strong>) untuk mengisi konfirmasi kehadiran & catatan.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">
              Buat Sesi Bimbingan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
