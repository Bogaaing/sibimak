import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, Search, Layers, GraduationCap, Edit2 } from 'lucide-react';

export const KelasList: React.FC = () => {
  const [classes, setClasses] = useState(() => store.getClasses());
  const [academicYears] = useState(() => store.getAcademicYears());
  const [students] = useState(() => store.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    study_program: 'Sistem Informasi',
    academic_level: 'S1',
    academic_year_id: academicYears.find(a => a.is_active)?.id || academicYears[0]?.id || '',
  });

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.study_program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      study_program: 'Sistem Informasi',
      academic_level: 'S1',
      academic_year_id: academicYears.find(a => a.is_active)?.id || academicYears[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: typeof classes[0]) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      study_program: c.study_program,
      academic_level: c.academic_level,
      academic_year_id: c.academic_year_id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.study_program) {
      alert('Mohon lengkapi Nama Kelas dan Program Studi!');
      return;
    }

    store.saveClass({
      id: editingId || undefined,
      name: formData.name,
      study_program: formData.study_program,
      academic_level: formData.academic_level,
      academic_year_id: formData.academic_year_id,
    });

    setClasses(store.getClasses());
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Data Master Kelas"
        description="Kelola daftar kelas mahasiswa, jenjang studi, dan relasi kurikulum tahun akademik."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kelas (Nama Kelas, Prodi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Kelas ({filteredClasses.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nama Kelas</th>
                  <th className="px-6 py-3.5">Program Studi</th>
                  <th className="px-6 py-3.5">Jenjang</th>
                  <th className="px-6 py-3.5">Jumlah Mahasiswa</th>
                  <th className="px-6 py-3.5">Tahun Akademik</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data kelas.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => {
                    const studentCount = students.filter((s) => s.class_id === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          {c.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{c.study_program}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold">
                            {c.academic_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                            <span>{studentCount} Mahasiswa</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {c.academic_year?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(c)}
                            className="gap-1 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kelas *"
            placeholder="Contoh: SI-5A, TI-3B"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Program Studi *"
              placeholder="Contoh: Sistem Informasi"
              value={formData.study_program}
              onChange={(e) => setFormData({ ...formData, study_program: e.target.value })}
              required
            />
            <Select
              label="Jenjang Pendidikan"
              options={[
                { value: 'S1', label: 'Strata 1 (S1)' },
                { value: 'D3', label: 'Diploma 3 (D3)' },
                { value: 'S2', label: 'Magister (S2)' },
              ]}
              value={formData.academic_level}
              onChange={(e) => setFormData({ ...formData, academic_level: e.target.value })}
            />
          </div>

          <Select
            label="Tahun Akademik"
            options={academicYears.map((ay) => ({
              value: ay.id,
              label: `${ay.name} (${ay.code})`,
            }))}
            value={formData.academic_year_id}
            onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Data Kelas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
