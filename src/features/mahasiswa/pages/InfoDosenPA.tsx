import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { store } from '../../../lib/store';
import { UserCheck, Mail, Phone, BookOpen, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { getLecturerFullName, formatDate } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export const InfoDosenPA: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const currentStudent = store.getStudents().find(s => s.id === studentId);
  const myClassId = currentStudent?.class_id;

  const assignment = store.getAssignments().find(a => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Informasi Dosen Pembimbing Akademik"
        description="Detail kontak dan profil Dosen PA yang bertanggung jawab atas proses studi Anda."
      />

      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        {lecturer ? (
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex flex-col sm:flex-row items-center gap-6">
              <img
                src={lecturer.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                alt="Foto Dosen"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md"
              />
              <div className="text-center sm:text-left space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  Dosen Pembimbing Akademik
                </span>
                <h3 className="text-2xl font-bold">{getLecturerFullName(lecturer)}</h3>
                <p className="text-sm text-blue-100 font-mono">NIDN: {lecturer.nidn}</p>
                <p className="text-xs text-blue-200">Program Studi: {lecturer.department}</p>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Informasi Kontak Resmi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Email Kampus</p>
                      <p className="text-sm font-semibold text-slate-900">{lecturer.profile?.email}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">No. Telepon / WhatsApp</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {lecturer.profile?.phone_number || '081398765432'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Informasi Penugasan Bimbingan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500">Kelas Anda:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">Kelas {currentStudent?.class?.name}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500">Periode Akademik:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{assignment?.academic_year?.name}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500">Nomor SK:</span>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{assignment?.sk_number || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-blue-900">Memerlukan Konsultasi Khusus?</h5>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Ajukan permohonan bimbingan personal untuk mendiskusikan topik skripsi, KRS, atau kendala belajar.
                  </p>
                </div>
                <Link
                  to="/mahasiswa/bimbingan-individu"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                >
                  Ajukan Bimbingan
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            Dosen Pembimbing Akademik belum di-plotting untuk kelas Anda.
          </div>
        )}
      </div>
    </div>
  );
};
