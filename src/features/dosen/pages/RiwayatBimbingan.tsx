import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  RotateCcw, 
  FileText, 
  BookOpenCheck, 
  MessagesSquare, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const RiwayatBimbingan: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const myAssignments = store.getAssignments().filter(a => a.lecturer_id === lecturerId);
  const myClassIds = myAssignments.map(a => a.class_id);

  // 1. Fetch Class Guidance Participations for my classes
  const myClassSessions = store.getClassSessions().filter(cs =>
    myAssignments.some(a => a.id === cs.assignment_id)
  );
  const myParticipants = store.getParticipants().filter(p =>
    myClassSessions.some(cs => cs.id === p.session_id)
  );

  // 2. Fetch Individual Guidance Requests for this lecturer
  const myIndividualRequests = store.getIndividualRequests().filter(
    r => r.lecturer_id === lecturerId
  );

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'KELAS' | 'INDIVIDU'>('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build unified history list
  const historyItems: Array<{
    id: string;
    date: string;
    studentId: string;
    studentName: string;
    studentNim: string;
    classId: string;
    className: string;
    studyProgram: string;
    type: 'KELAS' | 'INDIVIDU';
    title: string;
    detail: string;
    status: string;
    isValidated: boolean;
  }> = [];

  // Add Class Guidance sessions
  myParticipants.forEach((p) => {
    const session = myClassSessions.find((cs) => cs.id === p.session_id);
    const student = store.getStudents().find((s) => s.id === p.student_id);
    const assignment = myAssignments.find((a) => a.id === session?.assignment_id);

    if (session && student) {
      historyItems.push({
        id: `hist-cls-${p.id}`,
        date: session.session_date,
        studentId: student.id,
        studentName: student.profile?.full_name || 'Mahasiswa',
        studentNim: student.nim,
        classId: student.class_id || '',
        className: assignment?.class?.name || student.class?.name || 'SI-5A',
        studyProgram: assignment?.class?.study_program || 'Sistem Informasi',
        type: 'KELAS',
        title: session.title,
        detail: session.topic_description || '-',
        status: p.attendance_status === 'HADIR' ? 'Hadir' : p.attendance_status === 'IZIN' ? 'Izin' : 'Belum Konfirmasi',
        isValidated: p.validation_status === 'VALID'
      });
    }
  });

  // Add Individual Guidance sessions
  myIndividualRequests.forEach((ir) => {
    const student = store.getStudents().find((s) => s.id === ir.student_id);
    const studentClass = store.getClasses().find((c) => c.id === student?.class_id);

    if (student) {
      historyItems.push({
        id: `hist-ind-${ir.id}`,
        date: ir.guidance_date || ir.created_at.split('T')[0],
        studentId: student.id,
        studentName: student.profile?.full_name || 'Mahasiswa',
        studentNim: student.nim,
        classId: student.class_id || '',
        className: studentClass?.name || 'SI-5A',
        studyProgram: studentClass?.study_program || 'Sistem Informasi',
        type: 'INDIVIDU',
        title: ir.title,
        detail: ir.initial_problem,
        status: ir.status === 'SELESAI' ? 'Selesai' : ir.status === 'DIPROSES' ? 'Diproses' : 'Diajukan',
        isValidated: ir.status === 'SELESAI' || ir.validation_status === 'VALID'
      });
    }
  });

  // Sort descending by date
  historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters
  const filteredItems = historyItems.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentNim.includes(searchTerm) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = selectedType === 'ALL' || item.type === selectedType;
    const matchClass = selectedClass === 'ALL' || item.classId === selectedClass;

    return matchSearch && matchType && matchClass;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedClass('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Riwayat Bimbingan Akademik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            Histori lengkap pelaksanaan bimbingan kelas dan konsultasi individu mahasiswa perwalian Anda.
          </p>
        </div>

        <div className="text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          Total {filteredItems.length} Catatan Bimbingan
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
            Pencarian
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
            <input
              type="text"
              placeholder="Cari mahasiswa, NIM, atau topik..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Dropdown Jenis Bimbingan */}
        <div className="space-y-1 flex-shrink-0 min-w-[170px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Jenis Bimbingan
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as 'ALL' | 'KELAS' | 'INDIVIDU');
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="KELAS">Bimbingan Kelas</option>
            <option value="INDIVIDU">Bimbingan Individu</option>
          </select>
        </div>

        {/* Dropdown Kelas */}
        <div className="space-y-1 flex-shrink-0 min-w-[150px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Kelas
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua Kelas</option>
            {myAssignments.map((a) => (
              <option key={a.class_id} value={a.class_id}>
                Kelas {a.class?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={handleResetFilter}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs flex-shrink-0 h-[38px]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
          <span>Reset</span>
        </button>
      </div>

      {/* 3. RIWAYAT TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Daftar Riwayat Bimbingan ({filteredItems.length})</span>
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Belum ada riwayat bimbingan pada filter ini.
            </p>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Mahasiswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Jenis Bimbingan</th>
                  <th className="px-4 py-3">Topik / Bahasan</th>
                  <th className="px-4 py-3">Status Validasi</th>
                  <th className="px-4 py-3 text-right">Formulir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tanggal */}
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(item.date, 'dd/MM/yyyy')}
                    </td>

                    {/* Mahasiswa */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.studentName}
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                        NIM: {item.studentNim}
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.className}
                      </span>
                    </td>

                    {/* Jenis Bimbingan */}
                    <td className="px-4 py-3.5">
                      {item.type === 'KELAS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <BookOpenCheck className="w-3 h-3 text-blue-600" />
                          <span>Bimbingan Kelas</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <MessagesSquare className="w-3 h-3 text-indigo-600" />
                          <span>Bimbingan Individu</span>
                        </span>
                      )}
                    </td>

                    {/* Topik / Bahasan */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.detail}
                      </p>
                    </td>

                    {/* Status Validasi */}
                    <td className="px-4 py-3.5">
                      {item.isValidated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tervalidasi (Paraf Aktif)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{item.status}</span>
                        </span>
                      )}
                    </td>

                    {/* Aksi Formulir */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/report/formulir?studentId=${item.studentId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                        <span>Form PDF</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}–{Math.min(currentPage * itemsPerPage, filteredItems.length)} dari {filteredItems.length} catatan
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
