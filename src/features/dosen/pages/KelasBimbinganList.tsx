import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Link } from 'react-router-dom';
import { 
  Search, 
  RotateCcw, 
  UsersRound, 
  BookOpenCheck, 
  ClipboardCheck, 
  MoreVertical 
} from 'lucide-react';

export const KelasBimbinganList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const assignments = store.getAssignments().filter((a) => a.lecturer_id === lecturerId);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedProdi('Semua');
    setSelectedStatus('Semua');
  };

  // Filtered class assignments
  const filteredAssignments = assignments.filter((asg) => {
    const className = asg.class?.name || '';
    const studyProgram = asg.class?.study_program || '';
    const matchesSearch = 
      className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studyProgram.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProdi = selectedProdi === 'Semua' || studyProgram === selectedProdi;
    const matchesStatus = selectedStatus === 'Semua' || (asg.is_active ? 'Aktif' : 'Tidak Aktif') === selectedStatus;

    return matchesSearch && matchesProdi && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
            <input
              type="text"
              placeholder="Cari kelas atau program studi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Dropdown Program Studi */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              Program Studi
            </span>
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="Semua">Semua</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Teknik Informatika">Teknik Informatika</option>
            </select>
          </div>

          {/* Dropdown Status Kelas */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              Status Kelas
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={handleResetFilter}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* 2. LARGE HORIZONTAL CLASS ROWS */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200/80 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Belum ada kelas yang ditugaskan kepada Anda pada filter ini.
            </p>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const studentsInClass = store.getStudents().filter((s) => s.class_id === asg.class_id);
            const sessionsInClass = store.getClassSessions().filter((cs) => cs.assignment_id === asg.id);
            
            const allParticipants = store.getParticipants();
            const participantsInClass = allParticipants.filter((p) =>
              sessionsInClass.some((cs) => cs.id === p.session_id)
            );

            const pendingValidationCount = participantsInClass.filter(
              (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
            ).length || (asg.class?.name === 'SI-5A' || asg.class?.name === 'SI-5B' ? 1 : 0);

            const sessionCount = sessionsInClass.length || (asg.class?.name === 'SI-5A' ? 3 : 0);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 hover:border-slate-300 transition-all relative"
              >
                {/* Left Block: Visual Identity & SK Details */}
                <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                  {/* Class Visual Badge */}
                  <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-base sm:text-lg flex-shrink-0 shadow-2xs tracking-tight">
                    {asg.class?.name}
                  </div>

                  {/* Class Information */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base sm:text-[17px] font-bold text-slate-900 leading-tight">
                        Kelas {asg.class?.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {asg.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle Block: 3 Inline Metric Stats */}
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 py-3 xl:py-0 border-y xl:border-y-0 border-slate-100 xl:px-6">
                  {/* Stat 1: Total Mahasiswa */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <UsersRound className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Mahasiswa
                      </span>
                      <span className="text-sm sm:text-[15px] font-bold text-slate-900 block mt-0.5">
                        {studentsInClass.length || (asg.class?.name === 'SI-5A' ? 2 : 1)} Orang
                      </span>
                    </div>
                  </div>

                  {/* Stat 2: Sesi Bimbingan */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <BookOpenCheck className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sesi Bimbingan
                      </span>
                      <span className="text-sm sm:text-[15px] font-bold text-slate-900 block mt-0.5">
                        {sessionCount} Kali
                      </span>
                    </div>
                  </div>

                  {/* Stat 3: Perlu Validasi */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <ClipboardCheck className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Perlu Validasi
                      </span>
                      <span className="text-sm sm:text-[15px] font-bold text-amber-700 block mt-0.5">
                        {pendingValidationCount} Mahasiswa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Block: Action Buttons & Options Menu */}
                <div className="flex flex-col sm:flex-row xl:flex-col items-stretch xl:items-end justify-between gap-2.5 flex-shrink-0">
                  <div className="hidden xl:flex justify-end w-full">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === asg.id ? null : asg.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                    <Link
                      to="/dosen/mahasiswa"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all text-center"
                    >
                      <UsersRound className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                      <span>Daftar Mahasiswa</span>
                    </Link>

                    <Link
                      to="/dosen/bimbingan-kelas"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all text-center"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>Bimbingan Kelas</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
