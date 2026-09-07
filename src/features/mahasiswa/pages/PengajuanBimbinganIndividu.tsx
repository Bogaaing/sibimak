import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { supabase } from '../../../lib/supabase';
import {
  Plus,
  MessagesSquare,
  UserRound,
  Send,
  Calendar,
  UserCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, getLecturerFullName } from '../../../lib/utils';
import { IndividualGuidanceRequest, GuidanceMessage } from '../../../types/database.types';
import { mahasiswaService, StudentFullData } from '../../../services/mahasiswa.service';

type ConsultationTab = 'aktif' | 'selesai' | 'semua';

export const PengajuanBimbinganIndividu: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const [studentData, setStudentData] = useState<StudentFullData | null>(null);
  const [requests, setRequests] = useState<IndividualGuidanceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ConsultationTab>('aktif');
  const [selectedRequest, setSelectedRequest] = useState<IndividualGuidanceRequest | null>(null);
  const [messages, setMessages] = useState<GuidanceMessage[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatModalMobileOpen, setIsChatModalMobileOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    initial_problem: '',
  });

  const loadData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [academicData, reqs] = await Promise.all([
        mahasiswaService.getStudentAcademicData(studentId),
        mahasiswaService.getIndividualGuidanceRequests(studentId)
      ]);

      setStudentData(academicData);
      setRequests(reqs);

      // Select first active request if available
      if (reqs.length > 0 && !selectedRequest) {
        setSelectedRequest(reqs[0]);
      }
    } catch (err: any) {
      console.error('Error loading guidance requests:', err);
      setError('Gagal memuat data konsultasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load messages when selected request changes
  useEffect(() => {
    if (!selectedRequest?.id) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsMessagesLoading(true);

    mahasiswaService.getGuidanceMessages(selectedRequest.id)
      .then((msgs) => {
        if (isMounted) {
          setMessages(msgs);
          setIsMessagesLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading messages:', err);
        if (isMounted) setIsMessagesLoading(false);
      });

    // Realtime subscription for incoming messages
    const channel = supabase
      .channel(`guidance-messages-${selectedRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guidance_messages',
          filter: `individual_guidance_id=eq.${selectedRequest.id}`
        },
        async () => {
          // Refetch messages to get full sender profiles
          const updated = await mahasiswaService.getGuidanceMessages(selectedRequest.id);
          if (isMounted) setMessages(updated);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [selectedRequest?.id]);

  const handleSelectRequest = (req: IndividualGuidanceRequest, openMobileChat = false) => {
    setSelectedRequest(req);
    if (openMobileChat) {
      setIsChatModalMobileOpen(true);
    }
  };

  const lecturer = studentData?.advisorLecturer;
  const activeYear = studentData?.activeAcademicYear;

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    if (!lecturer) {
      alert('Dosen Pembimbing Akademik belum terplotting untuk kelas Anda. Silakan hubungi admin prodi.');
      return;
    }

    if (!activeYear) {
      alert('Tahun akademik aktif belum ditentukan. Silakan hubungi administrator.');
      return;
    }

    if (!formData.title.trim() || !formData.initial_problem.trim()) {
      alert('Mohon isi Topik dan Masalah yang ingin dikonsultasikan!');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await mahasiswaService.createIndividualGuidanceRequest({
        student_id: studentId,
        lecturer_id: lecturer.id,
        academic_year_id: activeYear.id,
        title: formData.title.trim(),
        initial_problem: formData.initial_problem.trim(),
      });

      const updated = await mahasiswaService.getIndividualGuidanceRequests(studentId);
      setRequests(updated);
      setSelectedRequest(created);
      setIsModalOpen(false);
      setFormData({ title: '', initial_problem: '' });
    } catch (err: any) {
      alert('Gagal mengajukan konsultasi: ' + (err.message || 'Terjadi kesalahan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !user || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await mahasiswaService.sendGuidanceMessage({
        individual_guidance_id: selectedRequest.id,
        sender_profile_id: user.id,
        message: messageText
      });
      // Fetch latest messages
      const updated = await mahasiswaService.getGuidanceMessages(selectedRequest.id);
      setMessages(updated);
    } catch (err: any) {
      alert('Gagal mengirim pesan: ' + (err.message || 'Terjadi kesalahan.'));
    }
  };

  // Filter requests based on active tab
  const filteredRequests = useMemo(() => {
    if (activeTab === 'aktif') {
      return requests.filter((r) => r.status !== 'SELESAI' && r.status !== 'DITOLAK');
    }
    if (activeTab === 'selesai') {
      return requests.filter((r) => r.status === 'SELESAI');
    }
    return requests;
  }, [requests, activeTab]);

  const activeCount = useMemo(
    () => requests.filter((r) => r.status !== 'SELESAI' && r.status !== 'DITOLAK').length,
    [requests]
  );
  const selesaiCount = useMemo(
    () => requests.filter((r) => r.status === 'SELESAI').length,
    [requests]
  );

  const lecturerInitials = useMemo(() => {
    const name = lecturer?.profile?.full_name;
    if (!name) return 'PA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [lecturer]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      {/* 1. PAGE TITLE, SUBTITLE & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Konsultasi Individu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ajukan konsultasi dan komunikasi langsung dengan Dosen PA Anda.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 min-h-[44px] px-4 font-bold text-xs shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Ajukan Konsultasi Baru</span>
        </Button>
      </div>

      {/* 2. DOSEN PA INFORMATION STRIP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-4.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-2xs">
            {lecturerInitials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dosen Pembimbing Akademik
            </p>
            <p className="text-sm font-bold text-slate-900 truncate leading-snug">
              {lecturer ? getLecturerFullName(lecturer) : 'Belum terplotting'}
            </p>
          </div>
        </div>

        {lecturer?.department && (
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
            Prodi {lecturer.department}
          </span>
        )}
      </div>

      {/* 3. TABS SELECTOR (Aktif, Selesai, Semua) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('aktif')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'aktif'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Aktif</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'aktif' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('selesai')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'selesai'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Selesai</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'selesai' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {selesaiCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('semua')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'semua'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Semua</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'semua' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {requests.length}
          </span>
        </button>
      </div>

      {/* 4. MAIN CONTENT: RESPONSIVE CARDS & CHAT TIMELINE */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 animate-pulse">
          <div className="lg:col-span-5 space-y-3">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="hidden lg:block lg:col-span-7">
            <div className="h-[500px] bg-slate-200 rounded-2xl"></div>
          </div>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* LEFT COLUMN: CONSULTATION CARDS LIST */}
          <div className="lg:col-span-5 space-y-3.5">
            {filteredRequests.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center shadow-2xs space-y-2">
                <MessagesSquare className="w-8 h-8 text-slate-400 mx-auto stroke-[1.8]" />
                <h4 className="text-sm font-bold text-slate-800">Tidak Ada Konsultasi</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {activeTab === 'aktif'
                    ? 'Tidak ada konsultasi aktif saat ini. Anda dapat mengajukan konsultasi baru.'
                    : 'Belum ada data konsultasi pada kategori ini.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                const isDone = req.status === 'SELESAI';

                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 space-y-3 cursor-pointer transition-all shadow-2xs ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Status & Date */}
                    <div className="flex items-center justify-between gap-2">
                      {isDone ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          SELESAI
                        </span>
                      ) : req.status === 'DIPROSES' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          DIPROSES
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          AKTIF / DIAJUKAN
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(req.created_at, 'dd MMM yyyy')}
                      </span>
                    </div>

                    {/* Title & Lecturer */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <UserRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lecturer ? getLecturerFullName(lecturer) : 'Dosen Pembimbing Akademik'}</span>
                      </p>
                    </div>

                    {/* Preview problem */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 line-clamp-2 italic leading-relaxed">
                      "{req.initial_problem}"
                    </div>

                    {/* Action Button for mobile & desktop */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        {messages.length > 0 && selectedRequest?.id === req.id
                          ? `${messages.length} Pesan`
                          : 'Klik untuk membuka'}
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRequest(req, true);
                        }}
                        className="min-h-[40px] px-3.5 text-xs font-bold gap-1.5 shadow-2xs"
                      >
                        <MessagesSquare className="w-3.5 h-3.5" />
                        <span>Buka Chat</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN (Desktop Chat & Detail Panel) */}
          <div className="hidden lg:block lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[640px]">
                {/* Chat Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        STATUS: {selectedRequest.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {selectedRequest.title}
                      </h3>
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      {formatDate(selectedRequest.created_at, 'dd MMMM yyyy')}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 mb-0.5">Topik Masalah:</p>
                    <p className="leading-relaxed">{selectedRequest.initial_problem}</p>
                  </div>
                </div>

                {/* Chat Messages Timeline */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/30">
                  {isMessagesLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Memuat percakapan...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                      <MessagesSquare className="w-8 h-8 mx-auto text-slate-300 stroke-[1.8]" />
                      <p className="font-semibold text-slate-600">Belum Ada Pesan Percakapan</p>
                      <p>Tuliskan pesan pertama atau pertanyaan lanjutan kepada Dosen PA di bawah.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_profile_id === user?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[11px] font-bold text-slate-700">
                              {isMe ? 'Anda (Mahasiswa)' : m.sender?.full_name || 'Dosen PA'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(m.created_at, 'HH:mm')}
                            </span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl text-xs max-w-md leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ketik pesan atau update kendala studi kepada Dosen PA..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 py-2.5 px-4 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="min-h-[42px] px-4 font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-2xs space-y-2">
                <MessagesSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Pilih Konsultasi</p>
                <p className="text-xs text-slate-500">
                  Pilih sesi konsultasi dari daftar di sebelah kiri untuk melihat pesan atau mengirim tanggapan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE FULL CHAT MODAL */}
      <Modal
        isOpen={isChatModalMobileOpen}
        onClose={() => setIsChatModalMobileOpen(false)}
        title={selectedRequest?.title || 'Detail Konsultasi'}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4 -mt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Uraian Masalah:</p>
              <p className="leading-relaxed">{selectedRequest.initial_problem}</p>
            </div>

            {/* Messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto p-1">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada percakapan. Kirim pesan di bawah.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_profile_id === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10.5px] font-bold text-slate-700">
                          {isMe ? 'Anda' : m.sender?.full_name || 'Dosen PA'}
                        </span>
                        <span className="text-[9.5px] text-slate-400">
                          {formatDate(m.created_at, 'HH:mm')}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'
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
                placeholder="Tulis pesan ke Dosen PA..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 py-2.5 px-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Button type="submit" size="sm" className="min-h-[42px] px-4 font-bold text-xs gap-1 cursor-pointer">
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </Button>
            </form>
          </div>
        )}
      </Modal>

      {/* MODAL PENGAJUAN KONSULTASI BARU */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pengajuan Konsultasi Individu"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 pt-1">
          <div className="p-3.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-xs flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold text-blue-800 uppercase tracking-wider">
                Ditujukan Kepada Dosen PA:
              </p>
              <p className="font-bold text-blue-950 mt-0.5 truncate">
                {lecturer ? getLecturerFullName(lecturer) : 'Belum terplotting'}
              </p>
            </div>
          </div>

          <Input
            label="Topik / Judul Konsultasi *"
            placeholder="Contoh: Konsultasi Skripsi — Bab 1 atau Kendala SKS"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Uraian Masalah atau Hal yang Ingin Dikonsultasikan *
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan secara rinci kendala akademik, materi yang ingin dibahas, atau progres yang ingin dilaporkan..."
              value={formData.initial_problem}
              onChange={(e) => setFormData({ ...formData, initial_problem: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              Pengajuan ini akan langsung masuk ke daftar konsultasi Dosen PA Anda.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px] cursor-pointer">
              {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
