import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Printer, FileText, BookOpen, MessageSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { 
  mahasiswaService, 
  StudentClassSessionItem 
} from '../../../services/mahasiswa.service';
import { IndividualGuidanceRequest } from '../../../types/database.types';

export const HistoriBimbinganMahasiswa: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const [classSessions, setClassSessions] = useState<StudentClassSessionItem[]>([]);
  const [individualRequests, setIndividualRequests] = useState<IndividualGuidanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);

    try {
      const academicData = await mahasiswaService.getStudentAcademicData(studentId);
      const classId = academicData.student?.class_id || undefined;

      const [sessions, reqs] = await Promise.all([
        mahasiswaService.getClassGuidanceSessions(studentId, classId),
        mahasiswaService.getIndividualGuidanceRequests(studentId)
      ]);

      setClassSessions(sessions);
      setIndividualRequests(reqs);
    } catch (err: any) {
      console.error('Error loading history data:', err);
      setError('Gagal memuat histori bimbingan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRecords = classSessions.length + individualRequests.length;

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Histori & Formulir Bimbingan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Rekapitulasi seluruh riwayat pelaksanaan bimbingan akademik kelas dan individu.
        </p>
      </div>

      <div className="space-y-6">
        {/* Banner with Direct Print Button */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-lg font-bold">Formulir Resmi Bimbingan Akademik</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Dokumen ini memuat data Dosen PA, data Mahasiswa, serta tabel catatan histori bimbingan yang tervalidasi untuk keperluan administrasi akademik atau syarat skripsi.
            </p>
          </div>

          {studentId && (
            <Link to={`/report/formulir?studentId=${studentId}`}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs py-2.5 px-5 shadow-lg shadow-blue-500/30 cursor-pointer">
                <Printer className="w-4 h-4" />
                Cetak Formulir (PDF)
              </Button>
            </Link>
          )}
        </div>

        {/* Combined Guidance Timeline Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Tabel Pelaksanaan Bimbingan Mahasiswa
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto"></div>
              <div className="h-24 bg-slate-100 rounded-xl"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto stroke-[2]" />
              <p className="text-xs text-slate-600 font-bold">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : totalRecords === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Bimbingan</p>
              <p>Belum ada pelaksanaan bimbingan kelas ataupun konsultasi individu yang tercatat di sistem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 w-12 text-center">No</th>
                    <th className="px-6 py-3.5">Tanggal Bimbingan</th>
                    <th className="px-6 py-3.5">Jenis</th>
                    <th className="px-6 py-3.5">Topik / Masalah Bimbingan</th>
                    <th className="px-6 py-3.5">Catatan / Arahan</th>
                    <th className="px-6 py-3.5 text-center">Status / Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* 1. Class Guidance Records */}
                  {classSessions.map(({ session, participant }, idx) => (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-500 text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {formatDate(session.session_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <BookOpen className="w-3 h-3" />
                          Kelas
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{session.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{session.topic_description}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {participant?.lecturer_feedback ? (
                          <span className="text-blue-800 font-medium">{participant.lecturer_feedback}</span>
                        ) : participant?.student_notes ? (
                          <span>Pertanyaan: {participant.student_notes}</span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(participant?.attendance_status || 'BELUM_KONFIRMASI')}`}>
                          {participant?.attendance_status || 'BELUM_KONFIRMASI'}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* 2. Individual Guidance Records */}
                  {individualRequests.map((ir, idx) => (
                    <tr key={ir.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-500 text-xs">
                        {classSessions.length + idx + 1}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {formatDate(ir.guidance_date || ir.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <MessageSquare className="w-3 h-3" />
                          Individu
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{ir.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">"{ir.initial_problem}"</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {ir.action_plan || ir.final_notes ? (
                          <span className="text-slate-800 font-medium">{ir.action_plan || ir.final_notes}</span>
                        ) : (
                          <span className="text-slate-400 italic">Menunggu arahan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(ir.status)}`}>
                          {ir.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
