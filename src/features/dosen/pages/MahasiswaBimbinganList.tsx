import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { store } from '../../../lib/store';
import { Search, Mail, Phone, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const MahasiswaBimbinganList: React.FC = () => {
  const { user } = useAuth();
  const lecturerId = user?.id;
  const [searchParams] = useSearchParams();
  const selectedClassParam = searchParams.get('class') || 'ALL';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState(selectedClassParam);

  const myAssignments = store.getAssignments().filter(a => a.lecturer_id === lecturerId);
  const myClassIds = myAssignments.map(a => a.class_id);

  const myStudents = store.getStudents().filter(s => s.class_id && myClassIds.includes(s.class_id));

  const filteredStudents = myStudents.filter(s => {
    const matchSearch =
      s.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nim.includes(searchTerm);
    const matchClass = filterClass === 'ALL' || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Daftar Mahasiswa Bimbingan Akademik"
        description="Pantau seluruh mahasiswa yang berada di bawah bimbingan Dosen PA Anda."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Mahasiswa (Nama, NIM)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="py-2 px-3 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas Anda</option>
              {myAssignments.map((a) => (
                <option key={a.class_id} value={a.class_id}>
                  Kelas {a.class?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {filteredStudents.length} Mahasiswa
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mahasiswa Bimbingan ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">NIM</th>
                  <th className="px-6 py-3.5">Nama Mahasiswa</th>
                  <th className="px-6 py-3.5">Kelas</th>
                  <th className="px-6 py-3.5">Program / Angkatan</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5 text-right">Formulir Bimbingan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada mahasiswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600">
                        {s.nim}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{s.profile.full_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Layers className="w-3 h-3 text-blue-500" />
                          {s.class?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {s.program_type} • Angkatan {s.entry_year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.profile.email}</span>
                          </div>
                          {s.profile.phone_number && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{s.profile.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/report/formulir?studentId=${s.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs text-blue-700 border-blue-300 hover:bg-blue-50">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            Lihat & Cetak Form
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
