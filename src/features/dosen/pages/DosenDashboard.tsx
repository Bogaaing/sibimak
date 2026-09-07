import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { dosenService } from '../../../services/dosen.service';
import { Link } from 'react-router-dom';
import { 
  School, 
  UsersRound, 
  BookOpenCheck, 
  ClipboardCheck, 
  MessagesSquare, 
  MoreVertical, 
  ChevronRight,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { 
  ClassAdvisorAssignment, 
  Student, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest 
} from '../../../types/database.types';

export const DosenDashboard: React.FC = () => {
  const { user, lecturerProfile } = useAuth();
  const lecturerId = lecturerProfile?.id || user?.id;
  const lecturerEmail = user?.email;

  const [assignments, setAssignments] = useState<ClassAdvisorAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classSessions, setClassSessions] = useState<ClassGuidanceSession[]>([]);
  const [participants, setParticipants] = useState<ClassGuidanceParticipant[]>([]);
  const [individualRequests, setIndividualRequests] = useState<IndividualGuidanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Load assignments for this lecturer
        const asgs = await dosenService.getAssignments(lecturerId, lecturerEmail);
        if (!isMounted) return;
        setAssignments(asgs);

        const classIds = asgs.map((a) => a.class_id).filter(Boolean);
        const assignmentIds = asgs.map((a) => a.id);

        // 2. Fetch students, sessions, and individual requests in parallel
        const [stds, sessions, indReqs] = await Promise.all([
          dosenService.getStudentsByClassIds(classIds),
          dosenService.getClassSessions(assignmentIds),
          dosenService.getIndividualRequests(lecturerId, lecturerEmail)
        ]);

        if (!isMounted) return;
        setStudents(stds);
        setClassSessions(sessions);
        setIndividualRequests(indReqs);

        // 3. Fetch participants for all sessions
        const sessionIds = sessions.map((s) => s.id);
        if (sessionIds.length > 0) {
          const parts = await dosenService.getParticipants(sessionIds);
          if (isMounted) setParticipants(parts);
        } else {
          if (isMounted) setParticipants([]);
        }
      } catch (err) {
        console.error('Error loading Dosen dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [lecturerId, lecturerEmail]);

  // Metrics
  const totalClasses = assignments.length;
  const totalStudents = students.length;
  const totalClassSessions = classSessions.length;
  const totalIndividual = individualRequests.length;

  const classNamesText = assignments.length > 0
    ? assignments.map((a) => a.class?.name).filter(Boolean).join(', ')
    : 'Belum ada kelas';

  // Pending validations: HADIR and PENDING
  const pendingValidations = participants.filter(
    (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
  ).length;

  const pendingConsultations = individualRequests.filter(
    (r) => r.status === 'DIAJUKAN' || r.status === 'DIPROSES'
  );

  // Attendance breakdown
  const hadirCount = participants.filter((p) => p.attendance_status === 'HADIR').length;
  const belumKonfirmasiCount = participants.filter((p) => p.attendance_status === 'BELUM_KONFIRMASI').length;
  const izinCount = participants.filter((p) => p.attendance_status === 'IZIN').length;
  const tidakHadirCount = participants.filter((p) => p.attendance_status === 'TIDAK_HADIR').length;

  const totalCalculated = hadirCount + belumKonfirmasiCount + izinCount + tidakHadirCount;
  const hadirPercent = totalCalculated > 0 ? ((hadirCount / totalCalculated) * 100).toFixed(1) : '0';
  const belumPercent = totalCalculated > 0 ? ((belumKonfirmasiCount / totalCalculated) * 100).toFixed(1) : '0';
  const izinPercent = totalCalculated > 0 ? ((izinCount / totalCalculated) * 100).toFixed(1) : '0';
  const tidakHadirPercent = totalCalculated > 0 ? ((tidakHadirCount / totalCalculated) * 100).toFixed(1) : '0';

  // Calculations for this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const sessionsThisMonth = classSessions.filter((cs) => {
    const d = new Date(cs.session_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const indThisMonth = individualRequests.filter((ir) => {
    const d = new Date(ir.guidance_date || ir.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Donut SVG offsets
  const hadirStroke = totalCalculated > 0 ? ((hadirCount / totalCalculated) * 100) : 0;
  const belumStroke = totalCalculated > 0 ? ((belumKonfirmasiCount / totalCalculated) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Memuat data dashboard dosen...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xs font-semibold text-blue-700 block truncate max-w-[170px]" title={classNamesText}>
              {classNamesText}
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
              {pendingConsultations.length > 0 ? `${pendingConsultations.length} perlu respon` : 'Terkonfirmasi'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <MessagesSquare className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE 3-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: PERLU TINDAKAN */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Perlu Tindakan
            </h3>

            <div className="space-y-3.5">
              {pendingValidations === 0 && pendingConsultations.length === 0 && belumKonfirmasiCount === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Semua tindakan telah selesai. Tidak ada tugas tertunda.
                </div>
              ) : (
                <>
                  {pendingValidations > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                          <UsersRound className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {pendingValidations} kehadiran menunggu validasi
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Bimbingan Kelas
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
                  )}

                  {pendingConsultations.length > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <MessagesSquare className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {pendingConsultations.length} konsultasi perlu ditanggapi
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Konsultasi Mahasiswa
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
                  )}

                  {belumKonfirmasiCount > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {belumKonfirmasiCount} mahasiswa belum konfirmasi
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Bimbingan Kelas
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
                  )}
                </>
              )}
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
                  {totalCalculated > 0 && (
                    <>
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#16a34a"
                        strokeWidth="5"
                        strokeDasharray={`${hadirStroke} 100`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="5"
                        strokeDasharray={`${belumStroke} 100`}
                        strokeDashoffset={`-${hadirStroke}`}
                      />
                    </>
                  )}
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
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">{izinPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-slate-600">Tidak Hadir</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{tidakHadirCount}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-12 text-right">{tidakHadirPercent}%</span>
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
                <span className="font-bold text-slate-900 text-sm">{sessionsThisMonth}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Konsultasi Individu</span>
                <span className="font-bold text-slate-900 text-sm">{indThisMonth}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Mahasiswa Aktif</span>
                <span className="font-bold text-slate-900 text-sm">{totalStudents}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Perlu Validasi</span>
                <span className="font-bold text-slate-900 text-sm">{pendingValidations}</span>
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
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada kelas bimbingan yang diploting untuk Anda oleh Admin.
                    </td>
                  </tr>
                ) : (
                  assignments.map((asg) => {
                    const studentsInThisClass = students.filter((s) => s.class_id === asg.class_id);
                    const sessionsInThisClass = classSessions.filter((cs) => cs.assignment_id === asg.id);
                    const latestSession = sessionsInThisClass[0];

                    const participantsInThisClass = participants.filter((p) =>
                      sessionsInThisClass.some((cs) => cs.id === p.session_id)
                    );
                    const pendingInThisClass = participantsInThisClass.filter(
                      (p) => p.attendance_status === 'HADIR' && p.validation_status === 'PENDING'
                    ).length;

                    return (
                      <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pr-3">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {asg.class?.name || 'Kelas PA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {asg.class?.study_program || 'Sistem Informasi'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700">
                          {studentsInThisClass.length} Mahasiswa
                        </td>
                        <td className="py-3.5 px-3">
                          {latestSession ? (
                            <>
                              <p className="font-bold text-slate-900 truncate max-w-[150px]">
                                {latestSession.title}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {formatDate(latestSession.session_date)}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum ada sesi</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-amber-600">
                          {pendingInThisClass} Mahasiswa
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
                    );
                  })
                )}
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
            {classSessions.length === 0 && individualRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs">Belum ada aktivitas terbaru.</p>
              </div>
            ) : (
              <>
                {classSessions.slice(0, 3).map((cs) => (
                  <div key={cs.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5">
                        <BookOpenCheck className="w-3.5 h-3.5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight">
                          {cs.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sesi Kelas • {formatDate(cs.session_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {individualRequests.slice(0, 3).map((ir) => (
                  <div key={ir.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                        <MessagesSquare className="w-3.5 h-3.5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight">
                          Konsultasi: {ir.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Status: {ir.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
