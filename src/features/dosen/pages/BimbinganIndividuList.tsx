import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { MessageSquare, Calendar, UserCheck, Send, CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../../lib/utils';
import { IndividualGuidanceRequest, IndividualGuidanceStatus } from '../../../types/database.types';

export const BimbinganIndividuList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const [requests, setRequests] = useState(() =>
    store.getIndividualRequests().filter((r) => r.lecturer_id === lecturerId)
  );

  const [selectedRequest, setSelectedRequest] = useState<IndividualGuidanceRequest | null>(
    requests[0] || null
  );

  const [messages, setMessages] = useState(() =>
    selectedRequest ? store.getMessages(selectedRequest.id) : []
  );

  const [newMessage, setNewMessage] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: (selectedRequest?.status || 'DIPROSES') as IndividualGuidanceStatus,
    guidance_date: selectedRequest?.guidance_date || new Date().toISOString().split('T')[0],
    action_plan: selectedRequest?.action_plan || '',
    final_notes: selectedRequest?.final_notes || '',
  });

  const handleSelectRequest = (req: IndividualGuidanceRequest) => {
    setSelectedRequest(req);
    setMessages(store.getMessages(req.id));
    setStatusForm({
      status: req.status,
      guidance_date: req.guidance_date || new Date().toISOString().split('T')[0],
      action_plan: req.action_plan || '',
      final_notes: req.final_notes || '',
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !user || !newMessage.trim()) return;

    store.sendMessage(selectedRequest.id, user.id, newMessage.trim());
    setMessages(store.getMessages(selectedRequest.id));
    setNewMessage('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    store.updateIndividualRequestStatus(selectedRequest.id, statusForm.status, {
      guidance_date: statusForm.guidance_date,
      action_plan: statusForm.action_plan,
      final_notes: statusForm.final_notes,
    });

    const updatedRequests = store.getIndividualRequests().filter((r) => r.lecturer_id === lecturerId);
    setRequests(updatedRequests);
    const refreshed = updatedRequests.find((r) => r.id === selectedRequest.id) || null;
    setSelectedRequest(refreshed);
    setIsUpdateModalOpen(false);
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Bimbingan Individu (Konsultasi Personal)"
        description="Kelola dan tanggapi permohonan bimbingan personal dari mahasiswa bimbingan Anda."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of requests */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Permohonan Masuk ({requests.length})
            </h4>

            {requests.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Belum ada permohonan bimbingan individu.
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
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {req.student?.profile?.full_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NIM: {req.student?.nim} • Kelas {req.student?.class?.name}
                    </p>

                    <h5 className="font-semibold text-xs text-slate-800 mt-2 line-clamp-1">{req.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 italic">
                      "{req.initial_problem}"
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Diajukan: {formatDate(req.created_at, 'dd/MM/yyyy')}</span>
                      {req.guidance_date && <span>Jadwal: {formatDate(req.guidance_date, 'dd/MM/yyyy')}</span>}
                    </div>
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
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedRequest.status)}`}>
                            STATUS: {selectedRequest.status}
                          </span>
                          <span className="text-xs text-slate-500">
                            Kelas {selectedRequest.student?.class?.name}
                          </span>
                        </div>
                        <CardTitle className="text-lg mt-2">{selectedRequest.title}</CardTitle>
                        <p className="text-xs text-slate-600 mt-1">
                          Mahasiswa: <strong>{selectedRequest.student?.profile?.full_name}</strong> ({selectedRequest.student?.nim})
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="text-xs gap-1.5"
                      >
                        Update Status / Hasil
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Permasalahan / Hal yang Dikonsultasikan:
                      </h5>
                      <p className="text-sm text-slate-800 mt-1 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 leading-relaxed">
                        {selectedRequest.initial_problem}
                      </p>
                    </div>

                    {selectedRequest.action_plan && (
                      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                        <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Arahan / Rencana Tindak Lanjut:
                        </h5>
                        <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                          {selectedRequest.action_plan}
                        </p>
                      </div>
                    )}

                    {selectedRequest.final_notes && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Catatan Akhir Bimbingan:
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
                      Ruang Diskusi & Catatan Progres
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {messages.map((m) => {
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
                      })}
                    </div>

                    {/* Send message input */}
                    <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis pesan arahan atau balasan konsultasi..."
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
                Pilih permohonan bimbingan individu di sisi kiri.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Update Status & Action Plan */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Status & Catatan Bimbingan"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="Status Bimbingan *"
            options={[
              { value: 'DIAJUKAN', label: 'DIAJUKAN (Menunggu Diproses)' },
              { value: 'DIPROSES', label: 'DIPROSES (Dijadwalkan / Sedang Berlangsung)' },
              { value: 'PERLU_TINDAK_LANJUT', label: 'PERLU TINDAK LANJUT (Membutuhkan Arahan Lanjutan)' },
              { value: 'SELESAI', label: 'SELESAI (Konsultasi Tuntas)' },
              { value: 'DITOLAK', label: 'DITOLAK' },
            ]}
            value={statusForm.status}
            onChange={(e) =>
              setStatusForm({
                ...statusForm,
                status: e.target.value as IndividualGuidanceStatus,
              })
            }
          />

          <Input
            type="date"
            label="Tanggal Pelaksanaan Bimbingan"
            value={statusForm.guidance_date}
            onChange={(e) => setStatusForm({ ...statusForm, guidance_date: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Arahan & Rencana Tindak Lanjut (Action Plan)
            </label>
            <textarea
              rows={3}
              placeholder="Arahan langkah yang perlu diambil oleh mahasiswa..."
              value={statusForm.action_plan}
              onChange={(e) => setStatusForm({ ...statusForm, action_plan: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Catatan Akhir / Hasil Bimbingan
            </label>
            <textarea
              rows={3}
              placeholder="Hasil kesimpulan konsultasi jika sudah selesai..."
              value={statusForm.final_notes}
              onChange={(e) => setStatusForm({ ...statusForm, final_notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
