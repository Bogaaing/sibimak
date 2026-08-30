import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  Search, 
  School, 
  Pencil, 
  Trash2, 
  GraduationCap,
  CalendarDays
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { ClassItem } from '../../../types/database.types';

export const KelasList: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>(() => store.getClasses());
  const [academicYears] = useState(() => store.getAcademicYears());
  const [students] = useState(() => store.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
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

  const handleOpenEdit = (c: ClassItem) => {
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
      alert('Mohon lengkapi Nama Kelas dan Program Studi.');
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

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteClass(targetDeleteId);
      setClasses(store.getClasses());
      setTargetDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Search & Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
          <input
            type="text"
            placeholder="Cari Kelas (Nama Kelas, Program Studi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {filteredClasses.length} Kelas
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5 text-xs font-bold py-2 px-3.5 shadow-2xs">
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Tambah Kelas</span>
          </Button>
        </div>
      </div>

      {/* Classes Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Data Master Kelas Perwalian ({filteredClasses.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Kelas</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3">Jenjang</th>
                <th className="px-4 py-3">Tahun Akademik</th>
                <th className="px-4 py-3">Jumlah Mahasiswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data kelas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => {
                  const studentCount = students.filter((s) => s.class_id === c.id).length;
                  const ay = academicYears.find((a) => a.id === c.academic_year_id);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {c.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {c.study_program}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {c.academic_level}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {ay?.name || '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                          <span>{studentCount} Mahasiswa</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Kelas"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                          </button>
                          <button
                            onClick={() => {
                              setTargetDeleteId(c.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Hapus Kelas"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
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

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kelas *"
            placeholder="Contoh: SI-5A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Program Studi *"
            options={[
              { value: 'Sistem Informasi', label: 'S1 Sistem Informasi' },
              { value: 'Teknik Informatika', label: 'S1 Teknik Informatika' },
              { value: 'Sistem Komputer', label: 'S1 Sistem Komputer' },
              { value: 'Manajemen Informatika', label: 'D3 Manajemen Informatika' },
            ]}
            value={formData.study_program}
            onChange={(e) => setFormData({ ...formData, study_program: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jenjang Pendidikan *"
              options={[
                { value: 'S1', label: 'S1 (Sarjana)' },
                { value: 'D3', label: 'D3 (Diploma)' },
                { value: 'S2', label: 'S2 (Magister)' },
              ]}
              value={formData.academic_level}
              onChange={(e) => setFormData({ ...formData, academic_level: e.target.value })}
            />

            <Select
              label="Tahun Akademik *"
              options={academicYears.map((a) => ({
                value: a.id,
                label: a.name,
              }))}
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Tambah Kelas'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Kelas"
        message="Apakah Anda yakin ingin menghapus data Kelas ini? Pastikan tidak ada data bimbingan yang terikat."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
