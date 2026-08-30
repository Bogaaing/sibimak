import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { 
  Plus, 
  MessageSquare, 
  FileText, 
  Info, 
  Paperclip, 
  Send, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/utils';
import { IndividualGuidanceRequest, IndividualGuidanceStatus } from '../../../types/database.types';

export const BimbinganIndividuList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const [requests, setRequests] = useState(() =>
    store.getIndividualRequests().filter((r) => r.lecturer_id === lecturerId)
  );

  // Status Tab Filter: 'SEMUA' | 'MENUNGGU' | 'DIPROSES' | 'SELESAI'
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'MENUNGGU' | 'DIPROSES' | 'SELESAI'>('SEMUA');

  // Filter requests by tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'MENUNGGU') return req.status === 'DIAJUKAN';
    if (activeTab === 'DIPROSES') return req.status === 'DIPROSES' || req.status === 'PERLU_TINDAK_LANJUT';
    if (activeTab === 'SELESAI') return req.status === 'SELESAI' || req.status === 'DITOLAK';
    return true; // SEMUA
  });

  const [selectedRequest, setSelectedRequest] = useState<IndividualGuidanceRequest | null>(
    filteredRequests[0] || requests[0] || null
  );

  const [messages, setMessages] = useState(() =>
    selectedRequest ? store.getMessages(selectedRequest.id) : []
  );

  const [newMessage, setNewMessage] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isNewConsultModalOpen, setIsNewConsultModalOpen] = useState(false);

  // Status update form state
  const [statusForm, setStatusForm] = useState({
    status: (selectedRequest?.status || 'DIPROSES') as IndividualGuidanceStatus,
    guidance_date: selectedRequest?.guidance_date || new Date().toISOString().split('T')[0],
    action_plan: selectedRequest?.action_plan || '',
    final_notes: selectedRequest?.final_notes || '',
  });

  // New consultation form state
  const studentsInMyClasses = store.getStudents().filter(s => 
    store.getAssignments().some(a => a.lecturer_id === lecturerId && a.class_id === s.class_id)
  );

  const [newConsultForm, setNewConsultForm] = useState({
    student_id: studentsInMyClasses[0]?.id || '',
    title: '',
    initial_problem: '',
    guidance_date: new Date().toISOString().split('T')[0]
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

  const handleCreateNewConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsultForm.student_id || !newConsultForm.title || !newConsultForm.initial_problem || !lecturerId) {
      alert('Mohon lengkapi formulir konsultasi.');
      return;
    }

    const activeYear = store.getActiveAcademicYear();

    store.createIndividualRequest({
      student_id: newConsultForm.student_id,
      lecturer_id: lecturerId,
      academic_year_id: activeYear?.id || 'ay-1',
      title: newConsultForm.title,
      initial_problem: newConsultForm.initial_problem,
      guidance_date: newConsultForm.guidance_date
    });

    const updatedRequests = store.getIndividualRequests().filter((r) => r.lecturer_id === lecturerId);
    setRequests(updatedRequests);
    if (updatedRequests.length > 0) {
      handleSelectRequest(updatedRequests[updatedRequests.length - 1]);
    }
    setIsNewConsultModalOpen(false);
    setNewConsultForm({
      student_id: studentsInMyClasses[0]?.id || '',
      title: '',
      initial_problem: '',
      guidance_date: new Date().toISOString().split('T')[0]
    });
  };

  // Status badge styling helper
  const renderStatusBadge = (status: IndividualGuidanceStatus) => {
    switch (status) {
      case 'DIAJUKAN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Menunggu
          </span>
        );
      case 'DIPROSES':
      case 'PERLU_TINDAK_LANJUT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            Diproses
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            Selesai
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'DIAJUKAN').length;
  const inProgressCount = requests.filter(r => r.status === 'DIPROSES' || r.status === 'PERLU_TINDAK_LANJUT').length;

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Bimbingan Individu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            Kelola konsultasi dan bimbingan akademik mahasiswa.
          </p>
        </div>

        <button
          onClick={() => setIsNewConsultModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Konsultasi Baru</span>
        </button>
      </div>

      {/* 2. MAIN TWO-PANEL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: DAFTAR PERMOHONAN (~32%) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4 flex flex-col justify-between min-h-[580px]">
          <div className="space-y-3.5">
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Permohonan ({filteredRequests.length})
            </h2>

            {/* Compact Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveTab('SEMUA')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'SEMUA'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Semua
              </button>

              <button
                onClick={() => setActiveTab('MENUNGGU')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'MENUNGGU'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Menunggu</span>
                {pendingCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'MENUNGGU' ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('DIPROSES')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'DIPROSES'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Diproses</span>
                {inProgressCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'DIPROSES' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {inProgressCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('SELESAI')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'SELESAI'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Selesai
              </button>
            </div>

            {/* List Items */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">
                  Belum ada permohonan bimbingan individu.
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  const studentName = req.student?.profile?.full_name || 'Mahasiswa';
                  const studentNim = req.student?.nim || '-';
                  const studentClass = req.student?.class?.name || '05SIFM003';

                  return (
                    <div
                      key={req.id}
                      onClick={() => handleSelectRequest(req)}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-white border-2 border-blue-600 shadow-2xs'
                          : 'bg-white border border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 uppercase truncate">
                          {studentName}
                        </span>
                        {renderStatusBadge(req.status)}
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono">
                        NIM: {studentNim} • Kelas {studentClass}
                      </p>

                      <h3 className="font-semibold text-xs text-slate-800 line-clamp-1">
                        {req.title}
                      </h3>

                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(req.created_at, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Left Panel Pagination Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              Menampilkan {filteredRequests.length > 0 ? 1 : 0} dari {filteredRequests.length} permohonan
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded-lg border border-slate-200 text-slate-400 bg-white opacity-50 cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                1
              </button>
              <button
                disabled
                className="p-1 rounded-lg border border-slate-200 text-slate-400 bg-white opacity-50 cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CONSULTATION DETAIL (~68%) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-5">
          {selectedRequest ? (
            <>
              {/* Top Header Information & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      STATUS: {selectedRequest.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Kelas {selectedRequest.student?.class?.name || '05SIFM003'}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 uppercase tracking-tight pt-1">
                    {selectedRequest.title}
                  </h2>

                  <p className="text-xs text-slate-600 font-medium">
                    Mahasiswa: <strong className="text-slate-900 uppercase">{selectedRequest.student?.profile?.full_name}</strong> ({selectedRequest.student?.nim})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="text-xs font-bold py-2 px-3.5 shadow-2xs"
                  >
                    Update Status / Hasil
                  </Button>

                  <button
                    title="Opsi Lainnya"
                    className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>
              </div>

              {/* Section 1: Permasalahan / Hal yang Dikonsultasikan */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-slate-700 stroke-[1.8]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    PERMASALAHAN / HAL YANG DIKONSULTASIKAN
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1">
                  {selectedRequest.initial_problem}
                </p>
              </div>

              {/* Section 2: Arahan / Rencana Tindak Lanjut */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    ARAHAN / RENCANA TINDAK LANJUT
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1">
                  {selectedRequest.action_plan || 'Belum ada arahan tindak lanjut yang diberikan. Silakan gunakan tombol Update Status / Hasil untuk mengisi arahan.'}
                </p>
              </div>

              {/* Section 3: Ruang Diskusi & Catatan Progres */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                  <span>RUANG DISKUSI & CATATAN PROGRES</span>
                </div>

                {/* Conversation Timeline */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3.5 min-h-[160px] max-h-[280px] overflow-y-auto shadow-2xs">
                  {messages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Belum ada percakapan. Tulis pesan pertama di bawah.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_profile_id === user?.id;
                      const senderName = m.sender?.full_name || (isMe ? 'Ahmad Asep Suhendi' : selectedRequest.student?.profile?.full_name);
                      const senderRole = isMe ? 'dosen' : 'mahasiswa';

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-slate-400 font-medium mb-1">
                            {senderName} ({senderRole}) {formatDate(m.created_at, 'dd/MM HH:mm')}
                          </div>
                          <div
                            className={`p-3 text-xs leading-relaxed max-w-[85%] ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-xl shadow-2xs'
                                : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-xl'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Composer */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tulis pesan arahan atau balasan konsultasi..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 py-2.5 px-3.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium shadow-2xs"
                  />

                  <button
                    type="button"
                    title="Lampirkan Dokumen"
                    className="p-2.5 text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Paperclip className="w-4 h-4 stroke-[1.8]" />
                  </button>

                  <Button type="submit" className="gap-1.5 text-xs font-bold py-2.5 px-4 shadow-2xs">
                    <Send className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Kirim</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-24 text-center space-y-2 text-slate-500">
              <p className="text-sm font-semibold text-slate-700">Pilih permohonan untuk melihat detail.</p>
              <p className="text-xs text-slate-400">Pilih permohonan bimbingan individu dari panel sebelah kiri.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL UPDATE STATUS / HASIL */}
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
              { value: 'DIPROSES', label: 'DIPROSES (Sedang Berlangsung)' },
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
            <label className="block text-xs font-semibold text-slate-700">
              Arahan & Rencana Tindak Lanjut (Action Plan)
            </label>
            <textarea
              rows={3}
              placeholder="Arahan langkah yang perlu diambil oleh mahasiswa..."
              value={statusForm.action_plan}
              onChange={(e) => setStatusForm({ ...statusForm, action_plan: e.target.value })}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Catatan Akhir / Hasil Kesimpulan
            </label>
            <textarea
              rows={3}
              placeholder="Hasil kesimpulan konsultasi..."
              value={statusForm.final_notes}
              onChange={(e) => setStatusForm({ ...statusForm, final_notes: e.target.value })}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. MODAL BUAT KONSULTASI BARU */}
      <Modal
        isOpen={isNewConsultModalOpen}
        onClose={() => setIsNewConsultModalOpen(false)}
        title="Buat Konsultasi Bimbingan Baru"
      >
        <form onSubmit={handleCreateNewConsult} className="space-y-4">
          <Select
            label="Pilih Mahasiswa Bimbingan *"
            options={studentsInMyClasses.map(s => ({
              value: s.id,
              label: `${s.profile?.full_name} (${s.nim}) - Kelas ${s.class?.name || '-'}`
            }))}
            value={newConsultForm.student_id}
            onChange={(e) => setNewConsultForm({ ...newConsultForm, student_id: e.target.value })}
          />

          <Input
            label="Topik / Judul Konsultasi *"
            placeholder="Contoh: Konsultasi Pemilihan Topik Skripsi & Magang MSIB"
            value={newConsultForm.title}
            onChange={(e) => setNewConsultForm({ ...newConsultForm, title: e.target.value })}
            required
          />

          <Input
            type="date"
            label="Tanggal Bimbingan *"
            value={newConsultForm.guidance_date}
            onChange={(e) => setNewConsultForm({ ...newConsultForm, guidance_date: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Permasalahan / Hal yang Dikonsultasikan *
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan secara ringkas hal yang dikonsultasikan..."
              value={newConsultForm.initial_problem}
              onChange={(e) => setNewConsultForm({ ...newConsultForm, initial_problem: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsNewConsultModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Buat Konsultasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
