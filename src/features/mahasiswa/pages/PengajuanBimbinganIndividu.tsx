import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, MessageSquare, UserCheck, Send, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate, getLecturerFullName, getStatusBadgeClass } from '../../../lib/utils';
import { IndividualGuidanceRequest } from '../../../types/database.types';

export const PengajuanBimbinganIndividu: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = store.getStudents().find(s => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const assignment = store.getAssignments().find(a => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;
  const activeYear = store.getActiveAcademicYear();

  const [requests, setRequests] = useState(() =>
    store.getIndividualRequests().filter((r) => r.student_id === studentId)
  );

  const [selectedRequest, setSelectedRequest] = useState<IndividualGuidanceRequest | null>(
    requests[0] || null
  );

  const [messages, setMessages] = useState(() =>
    selectedRequest ? store.getMessages(selectedRequest.id) : []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    initial_problem: '',
  });

  const handleSelectRequest = (req: IndividualGuidanceRequest) => {
    setSelectedRequest(req);
    setMessages(store.getMessages(req.id));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !lecturer || !activeYear) {
      alert('Data Dosen PA atau Tahun Akademik tidak tersedia.');
      return;
    }
    if (!formData.title || !formData.initial_problem) {
      alert('Mohon isi Topik dan Masalah yang ingin dikonsultasikan!');
      return;
    }

    const created = store.createIndividualRequest({
      student_id: studentId,
      lecturer_id: lecturer.id,
      academic_year_id: activeYear.id,
      title: formData.title,
      initial_problem: formData.initial_problem,
    });

    const updated = store.getIndividualRequests().filter((r) => r.student_id === studentId);
    setRequests(updated);
    setSelectedRequest(created);
    setMessages([]);
    setIsModalOpen(false);
    setFormData({ title: '', initial_problem: '' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !user || !newMessage.trim()) return;

    store.sendMessage(selectedRequest.id, user.id, newMessage.trim());
    setMessages(store.getMessages(selectedRequest.id));
    setNewMessage('');
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Bimbingan Individu (Konsultasi Personal)"
        description="Ajukan konsultasi pribadi kepada Dosen PA Anda terkait studi, skripsi, atau kendala akademik."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Dosen PA: {lecturer ? getLecturerFullName(lecturer) : 'Belum Ditentukan'}
              </h4>
              <p className="text-xs text-slate-500">
                Setiap pengajuan bimbingan individu akan langsung terhubung ke Dosen PA Anda.
              </p>
            </div>
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajukan Bimbingan Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Riwayat Pengajuan Anda ({requests.length})
            </h4>

            {requests.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Anda belum pernah mengajukan bimbingan individu. Silakan klik "Ajukan Bimbingan Baru".
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(req.created_at, 'dd/MM/yyyy')}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">{req.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                      "{req.initial_problem}"
                    </p>

                    {req.guidance_date && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Jadwal: {formatDate(req.guidance_date)}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Request Detail & Chat Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRequest ? (
              <>
                <Card>
                  <CardHeader className="bg-slate-50/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedRequest.status)}`}>
                          STATUS: {selectedRequest.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Diajukan: {formatDate(selectedRequest.created_at, 'dd MMMM yyyy, HH:mm')}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2">{selectedRequest.title}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Permasalahan yang Dikonsultasikan:
                      </h5>
                      <p className="text-sm text-slate-800 mt-1 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 leading-relaxed">
                        {selectedRequest.initial_problem}
                      </p>
                    </div>

                    {selectedRequest.guidance_date && (
                      <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-lg text-xs flex items-center gap-2 text-blue-900">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Jadwal Bimbingan Tatap Muka / Online: <strong>{formatDate(selectedRequest.guidance_date)}</strong></span>
                      </div>
                    )}

                    {selectedRequest.action_plan && (
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                        <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                          Arahan & Rencana Tindak Lanjut dari Dosen PA:
                        </h5>
                        <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                          {selectedRequest.action_plan}
                        </p>
                      </div>
                    )}

                    {selectedRequest.final_notes && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Catatan Akhir / Hasil Bimbingan:
                        </h5>
                        <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                          {selectedRequest.final_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Discussion timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Percakapan & Catatan Konsultasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {messages.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                          Belum ada pesan. Anda dapat menuliskan pertanyaan atau berkas tambahan di bawah.
                        </p>
                      ) : (
                        messages.map((m) => {
                          const isMe = m.sender_profile_id === user?.id;
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[11px] font-semibold text-slate-700">
                                  {m.sender?.full_name} ({m.sender?.role})
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatDate(m.created_at, 'dd/MM HH:mm')}
                                </span>
                              </div>
                              <div
                                className={`p-3 rounded-2xl text-xs max-w-lg leading-relaxed ${
                                  isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Send message form */}
                    <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis pesan atau update progres ke Dosen PA..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 py-2 px-3.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button type="submit" size="sm" className="gap-1 text-xs">
                        <Send className="w-3.5 h-3.5" />
                        Kirim
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
                Pilih riwayat pengajuan di sebelah kiri atau buat pengajuan bimbingan baru.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Ajukan Bimbingan Individu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulir Pengajuan Bimbingan Individu"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Ditujukan kepada Dosen PA: <strong>{lecturer ? getLecturerFullName(lecturer) : '-'}</strong>
            </span>
          </div>

          <Input
            label="Topik / Judul Bimbingan *"
            placeholder="Contoh: Konsultasi Pemilihan Topik Skripsi & Magang"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Uraian Masalah / Hal yang Ingin Dikonsultasikan *
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan secara rinci latar belakang masalah, kendala studi, atau kebutuhan arahan..."
              value={formData.initial_problem}
              onChange={(e) => setFormData({ ...formData, initial_problem: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Kirim Pengajuan Bimbingan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
