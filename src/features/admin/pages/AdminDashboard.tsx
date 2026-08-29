import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardContent } from '../../../components/ui/Card';
import { store } from '../../../lib/store';
import { UserCheck, GraduationCap, Layers, Calendar, BookOpen, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const recentClassSessions = store.getClassSessions().slice(0, 3);
  const recentIndividual = store.getIndividualRequests().slice(0, 3);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Dashboard Administrator"
        description="Ringkasan pengelolaan data akademik, plotting dosen PA, dan statistik bimbingan."
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dosen PA</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDosen}</p>
              <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Terdaftar di sistem</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Mahasiswa</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalMahasiswa}</p>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Aktif terdaftar</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Kelas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalKelas}</p>
              <span className="text-xs text-purple-600 font-medium mt-1 inline-block">{stats.totalPlotting} kelas terplotting</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sesi Bimbingan</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBimbinganKelas + stats.totalBimbinganIndividu}</p>
              <span className="text-xs text-amber-600 font-medium mt-1 inline-block">{stats.totalBimbinganKelas} Kelas • {stats.totalBimbinganIndividu} Personal</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Plotting PA Status & Active Academic Year info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Academic Year Banner */}
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-xs font-medium uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4" />
                Periode Akademik Aktif
              </div>
              <h3 className="text-xl font-bold">{activeYear?.name || 'Tahun Akademik Aktif'}</h3>
              <p className="text-xs text-blue-100 mt-2">
                Kode: <span className="font-semibold text-white">{activeYear?.code}</span> • Semester: <span className="font-semibold text-white">{activeYear?.semester}</span>
              </p>
              <div className="mt-4 pt-4 border-t border-blue-500/40 text-xs text-blue-100">
                Rentang: {activeYear?.start_date} s/d {activeYear?.end_date}
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/admin/plotting"
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/20"
              >
                <span>Kelola Plotting Dosen PA</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Current Assignments Snapshot */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Plotting Dosen PA Terkini</h3>
              <Link to="/admin/plotting" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Kelas</th>
                    <th className="pb-3 font-semibold">Dosen Pembimbing Akademik</th>
                    <th className="pb-3 font-semibold">Nomor SK</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{asg.class?.name}</td>
                      <td className="py-3 font-medium text-slate-700">
                        {asg.lecturer?.title_prefix ? `${asg.lecturer.title_prefix} ` : ''}
                        {asg.lecturer?.profile?.full_name}
                        {asg.lecturer?.title_suffix ? `, ${asg.lecturer.title_suffix}` : ''}
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">{asg.sk_number || '-'}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Guidance Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Bimbingan Kelas Terbaru
              </h3>
            </div>
            <CardContent className="divide-y divide-slate-100">
              {recentClassSessions.map(session => (
                <div key={session.id} className="py-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{session.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kelas: {session.assignment?.class?.name} • Tanggal: {session.session_date}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {session.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Pengajuan Bimbingan Individu Terbaru
              </h3>
            </div>
            <CardContent className="divide-y divide-slate-100">
              {recentIndividual.map(req => (
                <div key={req.id} className="py-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{req.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mahasiswa: {req.student?.profile?.full_name} ({req.student?.nim})
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    {req.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
