import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { dosenService } from '../../../services/dosen.service';
import { Link } from 'react-router-dom';
import { 
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
import { 
  ClassAdvisorAssignment, 
  Student, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest 
} from '../../../types/database.types';

export const RiwayatBimbingan: React.FC = () => {
  const { user, lecturerProfile } = useAuth();
  const lecturerId = lecturerProfile?.id || user?.id;
  const lecturerEmail = user?.email;

  const [assignments, setAssignments] = useState<ClassAdvisorAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classSessions, setClassSessions] = useState<ClassGuidanceSession[]>([]);
  const [participants, setParticipants] = useState<ClassGuidanceParticipant[]>([]);
  const [individualRequests, setIndividualRequests] = useState<IndividualGuidanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'KELAS' | 'INDIVIDU'>('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [asgs, indReqs] = await Promise.all([
          dosenService.getAssignments(lecturerId, lecturerEmail),
          dosenService.getIndividualRequests(lecturerId, lecturerEmail)
        ]);

        if (!isMounted) return;
        setAssignments(asgs);
        setIndividualRequests(indReqs);

        const classIds = asgs.map((a) => a.class_id).filter(Boolean);
        const assignmentIds = asgs.map((a) => a.id);

        const [stds, sessions] = await Promise.all([
          dosenService.getStudentsByClassIds(classIds),
          dosenService.getClassSessions(assignmentIds)
        ]);

        if (!isMounted) return;
        setStudents(stds);
        setClassSessions(sessions);

        const sessionIds = sessions.map((s) => s.id);
        if (sessionIds.length > 0) {
          const parts = await dosenService.getParticipants(sessionIds);
          if (isMounted) setParticipants(parts);
        } else {
          if (isMounted) setParticipants([]);
        }
      } catch (err) {
        console.error('Error loading RiwayatBimbingan data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [lecturerId, lecturerEmail]);

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
  participants.forEach((p) => {
    const session = classSessions.find((cs) => cs.id === p.session_id);
    const student = students.find((s) => s.id === p.student_id);
    const assignment = assignments.find((a) => a.id === session?.assignment_id);

    if (session && student) {
      historyItems.push({
        id: `hist-cls-${p.id}`,
        date: session.session_date,
        studentId: student.id,
        studentName: student.profile?.full_name || 'Mahasiswa',
        studentNim: student.nim,
        classId: student.class_id || '',
        className: assignment?.class?.name || student.class?.name || 'Kelas PA',
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
  individualRequests.forEach((ir) => {
    const student = ir.student;
    if (student) {
      historyItems.push({
        id: `hist-ind-${ir.id}`,
        date: ir.guidance_date || ir.created_at.split('T')[0],
        studentId: student.id,
        studentName: student.profile?.full_name || 'Mahasiswa',
        studentNim: student.nim,
        classId: student.class_id || '',
        className: student.class?.name || 'Kelas PA',
        studyProgram: student.class?.study_program || 'Sistem Informasi',
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

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Memuat riwayat bimbingan akademik...</p>
        </div>
      </div>
    );
  }

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
          Total {filteredItems.length} Catatan Riwayat
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Cari nama mahasiswa, NIM, atau topik bimbingan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Filter Jenis Bimbingan */}
        <div className="space-y-1 flex-shrink-0 min-w-[150px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Jenis Bimbingan
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="KELAS">Bimbingan Kelas</option>
            <option value="INDIVIDU">Bimbingan Individu</option>
          </select>
        </div>

        {/* Filter Kelas */}
        <div className="space-y-1 flex-shrink-0 min-w-[150px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Kelas Perwalian
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
            {assignments.map((a) => (
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

      {/* 3. TABLE RIWAYAT BIMBINGAN */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Mahasiswa</th>
                <th className="px-4 py-3">Kelas / Prodi</th>
                <th className="px-4 py-3">Jenis & Topik</th>
                <th className="px-4 py-3 text-center">Status / Kehadiran</th>
                <th className="px-4 py-3 text-center">Validasi Paraf</th>
                <th className="px-4 py-3 text-right">Formulir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada riwayat bimbingan akademik yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.studentName}</div>
                      <div className="text-[10.5px] font-mono text-slate-400">{item.studentNim}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.className}
                      </span>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">{item.studyProgram}</p>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.type === 'KELAS' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <BookOpenCheck className="w-3 h-3" />
                            Kelas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <MessagesSquare className="w-3 h-3" />
                            Individu
                          </span>
                        )}
                        <span className="font-bold text-slate-900 truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.detail}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.type === 'INDIVIDU' ? (
                        <span className="text-[11px] text-slate-400 font-medium">—</span>
                      ) : item.isValidated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {item.type === 'INDIVIDU' ? (
                        <Link
                          to="/dosen/bimbingan-individu"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold text-blue-700 shadow-2xs transition-colors"
                        >
                          <MessagesSquare className="w-3.5 h-3.5 text-blue-600 stroke-[1.8]" />
                          <span>Buka Chat</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/report/formulir?studentId=${item.studentId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                          <span>Cetak Form</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan {filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filteredItems.length)} dari {filteredItems.length} catatan
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
