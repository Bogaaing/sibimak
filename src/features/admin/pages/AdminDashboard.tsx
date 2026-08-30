import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  UserCheck, 
  GraduationCap, 
  Layers, 
  CalendarDays, 
  BookOpenCheck, 
  MessagesSquare, 
  ArrowUpRight, 
  School,
  GitBranch,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  const [stats] = useState(() => ({
    totalDosen: store.getLecturers().length,
    totalMahasiswa: store.getStudents().length,
    totalKelas: store.getClasses().length,
    totalTahunAkademik: store.getAcademicYears().length,
    totalPlotting: store.getAssignments().length,
    totalBimbinganKelas: store.getClassSessions().length,
    totalBimbinganIndividu: store.getIndividualRequests().length,
  }));

  const activeYear = store.getActiveAcademicYear();
  const assignments = store.getAssignments();
  const recentClassSessions = store.getClassSessions().slice(0, 4);

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. TOP STATS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Dosen PA</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalDosen}</p>
            <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">Terdaftar di sistem</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
            <UserCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalMahasiswa}</p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Aktif terdaftar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Kelas</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalKelas}</p>
            <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">{stats.totalPlotting} kelas terplotting</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
            <School className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bimbingan</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalBimbinganKelas + stats.totalBimbinganIndividu}</p>
            <span className="text-xs text-amber-600 font-semibold mt-1 inline-block">{stats.totalBimbinganKelas} Kelas • {stats.totalBimbinganIndividu} Personal</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <BookOpenCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: ACTIVE PERIOD & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Academic Year Card */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                <span>Periode Akademik Aktif</span>
              </span>
              <Badge variant="success" size="sm">
                Aktif
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{activeYear?.name || 'Tahun Akademik 2026/2027 Ganjil'}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Kode: <span className="font-mono font-bold text-slate-800">{activeYear?.code || '2026/2027-1'}</span> • Semester: <span className="font-semibold text-slate-800">{activeYear?.semester || 'Ganjil'}</span>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
              Rentang: <span className="font-bold text-slate-800">{activeYear?.start_date || '2026-09-01'}</span> s/d <span className="font-bold text-slate-800">{activeYear?.end_date || '2027-01-31'}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/plotting"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <GitBranch className="w-4 h-4 stroke-[1.8]" />
              <span>Kelola Plotting Dosen PA</span>
            </Link>
          </div>
        </div>

        {/* Plotting Summary Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600 stroke-[1.8]" />
              <span>Daftar Plotting Kelas Perwalian</span>
            </h3>
            <Link to="/admin/plotting" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
              <span>Semua Plotting</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Kelas</th>
                  <th className="px-3.5 py-2.5">Dosen Pembimbing Akademik</th>
                  <th className="px-3.5 py-2.5">Program Studi</th>
                  <th className="px-3.5 py-2.5">No. SK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3.5 py-6 text-center text-slate-500">
                      Belum ada plotting Dosen PA.
                    </td>
                  </tr>
                ) : (
                  assignments.slice(0, 4).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-slate-900">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {a.class?.name}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-800">
                        {a.lecturer?.profile?.full_name || 'Ahmad Asep Suhendi, M.Kom.'}
                      </td>
                      <td className="px-3.5 py-3 text-slate-600 font-medium">
                        {a.class?.study_program}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-500 text-[11px]">
                        {a.sk_number || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY LIST */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4 text-blue-600 stroke-[1.8]" />
          <span>Sesi Bimbingan Kelas Terbaru</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recentClassSessions.map((cs) => (
            <div key={cs.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{cs.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {cs.assignment?.class?.name ? `Kelas ${cs.assignment.class.name}` : 'Sesi Kelas'}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">{cs.topic_description || 'Pengarahan akademik perwalian semester.'}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60">
                <span>Tanggal: {cs.session_date}</span>
                <span>Lokasi: {cs.venue_or_link || 'Ruang Kelas'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
