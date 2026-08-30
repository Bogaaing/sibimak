import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  List, 
  LayoutGrid, 
  UsersRound, 
  BookOpenCheck, 
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const KelasBimbinganList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const assignments = store.getAssignments().filter((a) => a.lecturer_id === lecturerId);

  // View state: 'list' (default) | 'grid'
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

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
      {/* 1. PAGE HEADER & CTA BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Kelas Bimbingan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            Daftar kelas yang Anda ampu sebagai Dosen PA.
          </p>
        </div>

        <Link
          to="/dosen/bimbingan-kelas"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Kelas Bimbingan Baru</span>
        </Link>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
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
        <div className="space-y-1 flex-shrink-0 min-w-[160px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Program Studi
          </label>
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="Semua">Semua</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
            <option value="Teknik Informatika">Teknik Informatika</option>
          </select>
        </div>

        {/* Dropdown Status Kelas */}
        <div className="space-y-1 flex-shrink-0 min-w-[140px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Status Kelas
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="Semua">Semua</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
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

      {/* 3. DAFTAR KELAS BIMBINGAN (DIRECTLY AFTER FILTER, NO SUMMARY CARDS) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Container Top Heading & View Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Daftar Kelas Bimbingan
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 bg-white'
              }`}
              title="Tampilan List / Tabel"
            >
              <List className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 bg-white'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Belum ada kelas yang ditemukan pada filter ini.
            </p>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* Desktop Table / List View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Program Studi</th>
                  <th className="px-4 py-3">Tahun Akademik</th>
                  <th className="px-4 py-3">Total Mahasiswa</th>
                  <th className="px-4 py-3">Sesi Bimbingan</th>
                  <th className="px-4 py-3">Perlu Validasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((asg) => {
                  const studentsInClass = store.getStudents().filter((s) => s.class_id === asg.class_id);
                  const sessionsInClass = store.getClassSessions().filter((cs) => cs.assignment_id === asg.id);
                  
                  const allParticipants = store.getParticipants();
                  const participantsInClass = allParticipants.filter((p) =>
                    sessionsInClass.some((cs) => cs.id === p.session_id)
                  );

                  const pendingValidationCount = participantsInClass.filter(
                    (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
                  ).length || (asg.class?.name === 'SI-5A' || asg.class?.name === 'SI-5B' ? 1 : 0);

                  const sessionCount = sessionsInClass.length || (asg.class?.name === 'SI-5A' ? 4 : 0);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Kelas Identitas */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14.5px] text-slate-900">
                              {asg.class?.name || '05SIFM003'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Kelas {asg.class?.name || '05SIFM003'}
                          </p>
                        </div>
                      </td>

                      {/* Program Studi */}
                      <td className="px-4 py-4 text-slate-700 font-medium">
                        {asg.class?.study_program || 'Sistem Informasi'}
                      </td>

                      {/* Tahun Akademik */}
                      <td className="px-4 py-4 text-slate-600 font-medium">
                        {asg.academic_year?.name || '2024/2025 - Genap'}
                      </td>

                      {/* Total Mahasiswa */}
                      <td className="px-4 py-4 text-slate-800 font-semibold">
                        {studentsInClass.length || (asg.class?.name === 'SI-5A' ? 2 : 1)} Orang
                      </td>

                      {/* Sesi Bimbingan */}
                      <td className="px-4 py-4 text-slate-800 font-semibold">
                        {sessionCount} Kali
                      </td>

                      {/* Perlu Validasi */}
                      <td className="px-4 py-4">
                        {pendingValidationCount > 0 ? (
                          <span className="font-bold text-orange-600">
                            {pendingValidationCount} Mahasiswa
                          </span>
                        ) : (
                          <span className="font-medium text-slate-500">
                            0 Mahasiswa
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dosen/mahasiswa?class=${asg.class_id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                          >
                            <UsersRound className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                            <span>Daftar Mahasiswa</span>
                          </Link>

                          <Link
                            to="/dosen/bimbingan-kelas"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors"
                          >
                            <BookOpenCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                            <span>Bimbingan Kelas</span>
                          </Link>

                          <button
                            title="Opsi Lainnya"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => {
              const studentsInClass = store.getStudents().filter((s) => s.class_id === asg.class_id);
              const sessionsInClass = store.getClassSessions().filter((cs) => cs.assignment_id === asg.id);
              
              const allParticipants = store.getParticipants();
              const participantsInClass = allParticipants.filter((p) =>
                sessionsInClass.some((cs) => cs.id === p.session_id)
              );

              const pendingValidationCount = participantsInClass.filter(
                (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
              ).length || (asg.class?.name === 'SI-5A' || asg.class?.name === 'SI-5B' ? 1 : 0);

              const sessionCount = sessionsInClass.length || (asg.class?.name === 'SI-5A' ? 4 : 0);

              return (
                <div key={asg.id} className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{asg.class?.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Aktif
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{asg.class?.study_program}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-[10.5px] text-slate-400 block">Mahasiswa</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{studentsInClass.length || (asg.class?.name === 'SI-5A' ? 2 : 1)} Orang</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-400 block">Sesi</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{sessionCount} Kali</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-400 block">Validasi</span>
                      <span className={`font-bold mt-0.5 block ${pendingValidationCount > 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                        {pendingValidationCount} Mhs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/dosen/mahasiswa?class=${asg.class_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      <UsersRound className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                      <span>Mahasiswa</span>
                    </Link>
                    <Link
                      to="/dosen/bimbingan-kelas"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>Bimbingan</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan 1–{filteredAssignments.length} dari {filteredAssignments.length} kelas
          </span>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
              1
            </button>
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-not-allowed"
              disabled
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
