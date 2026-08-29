import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { store } from '../../../lib/store';
import { Printer, FileText, CheckCircle2, UserCheck, BookOpen, MessageSquare } from 'lucide-react';
import { formatDate, getLecturerFullName, getStatusBadgeClass } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export const HistoriBimbinganMahasiswa: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = store.getStudents().find(s => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const assignment = store.getAssignments().find(a => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;

  // Class guidance participations
  const classParticipations = store.getParticipants().filter(p => p.student_id === studentId);
  
  // Individual guidance requests
  const individualRequests = store.getIndividualRequests().filter(r => r.student_id === studentId);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Histori & Formulir Bimbingan Akademik"
        description="Rekapitulasi seluruh riwayat pelaksanaan bimbingan akademik kelas dan individu."
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Banner with Direct Print Button */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-lg font-bold">Formulir Resmi Bimbingan Akademik</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Dokumen ini memuat data Dosen PA, data Mahasiswa, serta tabel catatan histori bimbingan yang tervalidasi untuk keperluan administrasi akademik atau syarat skripsi.
            </p>
          </div>

          <Link to={`/report/formulir?studentId=${studentId}`}>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs py-2.5 px-5 shadow-lg shadow-blue-500/30">
              <Printer className="w-4 h-4" />
              Cetak Formulir (PDF)
            </Button>
          </Link>
        </div>

        {/* Combined Guidance Timeline Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Tabel Pelaksanaan Bimbingan Mahasiswa
            </CardTitle>
          </CardHeader>
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
                {classParticipations.map((cp, idx) => {
                  const session = store.getClassSessions().find(cs => cs.id === cp.session_id);
                  return (
                    <tr key={cp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-500 text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {formatDate(session?.session_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <BookOpen className="w-3 h-3" />
                          Kelas
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs">{session?.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{session?.topic_description}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {cp.lecturer_feedback ? (
                          <span className="text-blue-800 font-medium">{cp.lecturer_feedback}</span>
                        ) : cp.student_notes ? (
                          <span>Pertanyaan: {cp.student_notes}</span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(cp.attendance_status)}`}>
                          {cp.attendance_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Individual Guidance Records */}
                {individualRequests.map((ir, idx) => {
                  return (
                    <tr key={ir.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-500 text-xs">
                        {classParticipations.length + idx + 1}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
