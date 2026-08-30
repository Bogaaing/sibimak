import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Pencil, 
  Trash2, 
  GraduationCap,
  School
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { Student } from '../../../types/database.types';

export const MahasiswaList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => store.getStudents());
  const [classes] = useState(() => store.getClasses());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    nim: string;
    full_name: string;
    email: string;
    phone_number: string;
    class_id: string;
    program_type: 'Reguler' | 'Non-Reguler';
    entry_year: string;
  }>({
    nim: '',
    full_name: '',
    email: '',
    phone_number: '',
    class_id: classes[0]?.id || '',
    program_type: 'Reguler',
    entry_year: '2024',
  });

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nim.includes(searchTerm);
    const matchClass = filterClass === 'ALL' || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nim: '',
      full_name: '',
      email: '',
      phone_number: '',
      class_id: classes[0]?.id || '',
      program_type: 'Reguler',
      entry_year: '2024',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingId(s.id);
    setFormData({
      nim: s.nim,
      full_name: s.profile?.full_name || '',
      email: s.profile?.email || '',
      phone_number: s.profile?.phone_number || '',
      class_id: s.class_id || classes[0]?.id || '',
      program_type: s.program_type,
      entry_year: s.entry_year,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.full_name || !formData.email) {
      alert('Mohon lengkapi NIM, Nama Mahasiswa, dan Email.');
      return;
    }

    store.saveStudent({
      id: editingId || undefined,
      nim: formData.nim,
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      class_id: formData.class_id,
      program_type: formData.program_type,
      entry_year: formData.entry_year,
    });

    setStudents(store.getStudents());
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteStudent(targetDeleteId);
      setStudents(store.getStudents());
      setTargetDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

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
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Kelas {c.name} ({c.study_program})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {filteredStudents.length} Mahasiswa
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5 text-xs font-bold py-2 px-3.5 shadow-2xs">
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Tambah Mahasiswa</span>
          </Button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Data Master Mahasiswa Terdaftar ({filteredStudents.length})</span>
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
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data mahasiswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                      {s.nim}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {s.profile?.full_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.class?.name || 'Tanpa Kelas'}
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Mahasiswa"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => {
                            setTargetDeleteId(s.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Hapus Mahasiswa"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="NIM *"
            placeholder="Contoh: 2210114001"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            required
          />

          <Input
            label="Nama Lengkap Mahasiswa *"
            placeholder="Contoh: Ahmad Fauzi"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />

          <Select
            label="Kelas Perwalian *"
            options={classes.map((c) => ({
              value: c.id,
              label: `Kelas ${c.name} (${c.study_program})`,
            }))}
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipe Program"
              options={[
                { value: 'Reguler', label: 'Reguler' },
                { value: 'Non-Reguler', label: 'Non-Reguler / Karyawan' },
              ]}
              value={formData.program_type}
              onChange={(e) => setFormData({ ...formData, program_type: e.target.value as 'Reguler' | 'Non-Reguler' })}
            />

            <Input
              label="Tahun Masuk (Angkatan)"
              placeholder="Contoh: 2024"
              value={formData.entry_year}
              onChange={(e) => setFormData({ ...formData, entry_year: e.target.value })}
            />
          </div>

          <Input
            type="email"
            label="Email Mahasiswa / Akun Login *"
            placeholder="Contoh: mahasiswa@kampus.ac.id"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            label="No. Telepon / WhatsApp"
            placeholder="Contoh: 085712345678"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Mahasiswa"
        message="Apakah Anda yakin ingin menghapus data Mahasiswa ini dari sistem?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
