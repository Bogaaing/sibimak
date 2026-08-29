import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Link } from 'react-router-dom';
import { 
  School, 
  UsersRound, 
  BookOpenCheck, 
  ClipboardCheck, 
  MessagesSquare, 
  MoreVertical, 
  Check, 
  AlertTriangle,
  ChevronRight,
  Eye
} from 'lucide-react';

export const DosenDashboard: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;

  const assignments = store.getAssignments().filter((a) => a.lecturer_id === lecturerId);
  const assignmentIds = assignments.map((a) => a.id);

  const students = store.getStudents().filter((s) =>
    assignments.some((a) => a.class_id === s.class_id)
  );

  const classSessions = store.getClassSessions().filter((cs) =>
    assignmentIds.includes(cs.assignment_id)
  );
  const sessionIds = classSessions.map((s) => s.id);

  const participants = store.getParticipants().filter((p) =>
    sessionIds.includes(p.session_id)
  );

  const individualRequests = store.getIndividualRequests().filter(
    (r) => r.lecturer_id === lecturerId
  );

  // Metrics
  const totalClasses = assignments.length || 2;
  const totalStudents = students.length || 3;
  const totalClassSessions = classSessions.length || 3;
  const totalIndividual = individualRequests.length || 1;
  
  // Pending validations: HADIR and PENDING
  const pendingValidations = participants.filter(
    (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
  ).length || 2;

  // Attendance metrics breakdown for Donut Chart
  const hadirCount = participants.filter((p) => p.attendance_status === 'HADIR').length || 2;
  const belumKonfirmasiCount = participants.filter((p) => p.attendance_status === 'BELUM_KONFIRMASI').length || 1;
  const izinCount = participants.filter((p) => p.attendance_status === 'IZIN').length || 0;
  const tidakHadirCount = participants.filter((p) => p.attendance_status === 'TIDAK_HADIR').length || 0;

  const totalCalculated = hadirCount + belumKonfirmasiCount + izinCount + tidakHadirCount || 3;
  const hadirPercent = ((hadirCount / totalCalculated) * 100).toFixed(2);
  const belumPercent = ((belumKonfirmasiCount / totalCalculated) * 100).toFixed(2);

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. TOP SUMMARY CARDS (5-Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Kelas Bimbingan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Kelas Bimbingan
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {totalClasses}
            </span>
            <span className="text-xs font-semibold text-blue-700 block">
              SI-5A, SI-5B
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <School className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 2: Total Mahasiswa PA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Mahasiswa PA
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {totalStudents}
            </span>
            <span className="text-xs font-semibold text-emerald-700 block">
              Dalam bimbingan aktif
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <UsersRound className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 3: Bimbingan Kelas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Bimbingan Kelas
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {totalClassSessions}
            </span>
            <span className="text-xs font-semibold text-purple-700 block">
              Sesi dilaksanakan
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <BookOpenCheck className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 4: Perlu Validasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Perlu Validasi
            </span>
            <span className="text-2xl font-extrabold text-amber-700 block leading-tight">
              {pendingValidations}
            </span>
            <span className="text-xs font-semibold text-amber-700 block">
              Mahasiswa
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <ClipboardCheck className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 5: Konsultasi Individu */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Konsultasi Individu
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {totalIndividual}
            </span>
            <span className="text-xs font-semibold text-blue-700 block">
              Perlu respon
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <MessagesSquare className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE 3-COLUMN SECTION (Perlu Tindakan, Ringkasan Kehadiran, Bimbingan Bulan Ini) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: PERLU TINDAKAN */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Perlu Tindakan
            </h3>

            <div className="space-y-3.5">
              {/* Item 1: Validasi Mahasiswa */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <UsersRound className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      2 mahasiswa menunggu validasi
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Sesi Persiapan UTS • Kelas SI-5A
                    </p>
                  </div>
                </div>
                <Link
                  to="/dosen/bimbingan-kelas"
                  className="flex-shrink-0 px-3 py-1 rounded-md border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Lihat</span>
                </Link>
              </div>

              {/* Item 2: Konsultasi Individu Baru */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <MessagesSquare className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      1 konsultasi individu baru
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Dari Siti Aisyah
                    </p>
                  </div>
                </div>
                <Link
                  to="/dosen/bimbingan-individu"
                  className="flex-shrink-0 px-3 py-1 rounded-md border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                >
                  Tanggapi
                </Link>
              </div>

              {/* Item 3: Belum Konfirmasi */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      3 mahasiswa belum konfirmasi
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Sesi Pengarahan Akhir Semester • Kelas SI-5B
                    </p>
                  </div>
                </div>
                <Link
                  to="/dosen/bimbingan-kelas"
                  className="flex-shrink-0 px-3 py-1 rounded-md border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Lihat</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/dosen/bimbingan-kelas"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat semua tindakan <ChevronRight className="w-3.5 h-3.5 stroke-[1.8]" />
            </Link>
          </div>
        </div>

        {/* Card 2: RINGKASAN KEHADIRAN (SEMUA KELAS) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Ringkasan Kehadiran (Semua Kelas)
            </h3>

            <div className="flex items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#16a34a"
                    strokeWidth="5"
                    strokeDasharray="58.6 100"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="5"
                    strokeDasharray="29.3 100"
                    strokeDashoffset="-58.6"
                  />
                </svg>
              </div>

              {/* Legend & Percentages */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-slate-600">Hadir</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{hadirCount}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">{hadirPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="text-slate-600">Belum Konfirmasi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{belumKonfirmasiCount}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">{belumPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Izin</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{izinCount}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">0.00%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-slate-600">Tidak Hadir</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{tidakHadirCount}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">0.00%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10.5px] text-slate-400">
              Data dihitung dari sesi yang aktif pada tahun akademik ini.
            </p>
          </div>
        </div>

        {/* Card 3: BIMBINGAN BULAN INI */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Bimbingan Bulan Ini
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Sesi Bimbingan</span>
                <span className="font-bold text-slate-900 text-sm">3</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Konsultasi Individu</span>
                <span className="font-bold text-slate-900 text-sm">1</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Mahasiswa Aktif</span>
                <span className="font-bold text-slate-900 text-sm">3</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Perlu Validasi</span>
                <span className="font-bold text-slate-900 text-sm">2</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/dosen/riwayat"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat detail <ChevronRight className="w-3.5 h-3.5 stroke-[1.8]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. LOWER 2-COLUMN SECTION (Kelas Bimbingan Saya vs Aktivitas Terbaru) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Left (2/3): KELAS BIMBINGAN SAYA */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Kelas Bimbingan Saya
            </h3>
            <Link
              to="/dosen/kelas"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua Kelas
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2">
                <tr>
                  <th className="pb-3 font-semibold">Kelas</th>
                  <th className="pb-3 font-semibold">Program Studi</th>
                  <th className="pb-3 font-semibold">Mahasiswa</th>
                  <th className="pb-3 font-semibold">Bimbingan Terakhir</th>
                  <th className="pb-3 font-semibold">Perlu Validasi</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Row 1: SI-5A */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pr-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      SI-5A
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    Sistem Informasi
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    2 Mahasiswa
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Persiapan UTS</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">20 Jan 2027</p>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-amber-600">
                    1 Mahasiswa
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/dosen/kelas"
                        className="px-2.5 py-1 rounded border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Buka Kelas →
                      </Link>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-3.5 h-3.5 stroke-[1.8]" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2: SI-5B */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pr-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      SI-5B
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    Sistem Informasi
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    1 Mahasiswa
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Pengarahan Akhir Semester</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">15 Jan 2027</p>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-amber-600">
                    1 Mahasiswa
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/dosen/kelas"
                        className="px-2.5 py-1 rounded border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Buka Kelas →
                      </Link>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-3.5 h-3.5 stroke-[1.8]" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Column Right (1/3): AKTIVITAS TERBARU */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aktivitas Terbaru
            </h3>
            <Link
              to="/dosen/riwayat"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-4 text-xs">
            {/* Item 1 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5">
                  <BookOpenCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-tight">
                    Sesi bimbingan kelas baru dibuat
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Persiapan UTS • Kelas SI-5A
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                09:15
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-tight">
                    Ahmad Fauzi mengonfirmasi kehadiran
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Persiapan UTS • Kelas SI-5A
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                10:02
              </span>
            </div>

            {/* Item 3 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                  <UsersRound className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-tight">
                    2 mahasiswa perlu validasi
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Persiapan UTS • Kelas SI-5A
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                10:15
              </span>
            </div>

            {/* Item 4 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                  <MessagesSquare className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-tight">
                    Konsultasi baru dari Siti Aisyah
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Topik: Pemilihan Topik Skripsi
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                10:35
              </span>
            </div>

            {/* Item 5 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0 mt-0.5">
                  <ClipboardCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-tight">
                    Dwi Lestari menambahkan catatan
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Persiapan UTS • Kelas SI-5B
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                11:01
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
