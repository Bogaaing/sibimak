import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { store } from '../../../lib/store';
import { Search, Mail, Phone, FileText, UsersRound } from 'lucide-react';
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
      s.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nim.includes(searchTerm);
    const matchClass = filterClass === 'ALL' || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
            <input
              type="text"
              placeholder="Cari Mahasiswa (Nama, NIM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua Kelas Anda</option>
            {myAssignments.map((a) => (
              <option key={a.class_id} value={a.class_id}>
                Kelas {a.class?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          Total {filteredStudents.length} Mahasiswa
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Mahasiswa Bimbingan ({filteredStudents.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">NIM</th>
                <th className="px-4 py-3">Nama Mahasiswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Program / Angkatan</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3 text-right">Formulir Bimbingan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada mahasiswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                      {s.nim}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{s.profile?.full_name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.class?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {s.program_type} • Angkatan {s.entry_year}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                          <span>{s.profile?.email}</span>
                        </div>
                        {s.profile?.phone_number && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                            <span>{s.profile?.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/report/formulir?studentId=${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
                        <span>Lihat & Cetak Form</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
