import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { store } from '../../../lib/store';
import { BookOpen, Calendar, MapPin, CheckCircle2, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../../lib/utils';
import { AttendanceStatus } from '../../../types/database.types';

export const BimbinganKelasMahasiswa: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = store.getStudents().find(s => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const [participations, setParticipations] = useState(() =>
    store.getParticipants().filter(p => p.student_id === studentId)
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

    setParticipations(store.getParticipants().filter(p => p.student_id === studentId));
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Bimbingan Kelas (Pengarahan Dosen PA)"
        description="Konfirmasi kehadiran dan sampaikan catatan atau pertanyaan untuk agenda bimbingan kelas."
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900 leading-relaxed">
            Kegiatan bimbingan kelas dijadwalkan oleh Dosen PA untuk seluruh mahasiswa di kelas Anda (<strong>Kelas {currentStudent?.class?.name}</strong>). Pastikan Anda melakukan konfirmasi kehadiran dan menuliskan catatan/pertanyaan sebelum sesi dimulai.
          </div>
        </div>

        <div className="space-y-4">
          {participations.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              Belum ada agenda bimbingan kelas yang dijadwalkan oleh Dosen PA Anda.
            </div>
          ) : (
            participations.map((p) => {
              const session = store.getClassSessions().find(cs => cs.id === p.session_id);
              if (!session) return null;

              return (
                <Card key={p.id} className="hover:border-slate-300 transition-all">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                            Kelas {session.assignment?.class?.name}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {formatDate(session.session_date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1.5">{session.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(p.attendance_status)}`}>
                          {p.attendance_status}
                        </span>
                        <Button
                          size="sm"
                          variant={p.attendance_status === 'BELUM_KONFIRMASI' ? 'primary' : 'outline'}
                          onClick={() => handleOpenConfirm(session.id, p.attendance_status, p.student_notes)}
                          className="text-xs"
                        >
                          {p.attendance_status === 'BELUM_KONFIRMASI' ? 'Konfirmasi Kehadiran' : 'Ubah Respon'}
                        </Button>
                      </div>
                    </div>

                    <div className="py-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Topik & Pembahasan:
                        </h4>
                        <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {session.topic_description}
                        </p>
                      </div>

                      {session.venue_or_link && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>Tempat / Media: <strong>{session.venue_or_link}</strong></span>
                        </div>
                      )}

                      {/* Student Submitted Notes */}
                      {p.student_notes && (
                        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            Catatan / Pertanyaan Anda:
                          </span>
                          <p className="text-amber-800 leading-relaxed">{p.student_notes}</p>
                        </div>
                      )}

                      {/* Feedback from Lecturer */}
                      {p.lecturer_feedback && (
                        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
                          <span className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                            Tanggapan dari Dosen PA:
                          </span>
                          <p className="text-blue-800 leading-relaxed">{p.lecturer_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Kehadiran & Catatan */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Kehadiran & Catatan Mahasiswa"
      >
        <form onSubmit={handleSaveConfirm} className="space-y-4">
          <Select
            label="Pilih Status Kehadiran *"
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
            <label className="block text-sm font-medium text-slate-700">
              Catatan, Pertanyaan, atau Kendala untuk Dosen PA
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan pertanyaan materi, progres studi, kendala KRS, atau persiapan yang ingin dikonsultasikan..."
              value={confirmForm.student_notes}
              onChange={(e) =>
                setConfirmForm({ ...confirmForm, student_notes: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Catatan ini akan langsung diterima dan dapat ditanggapi oleh Dosen PA Anda.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Konfirmasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
