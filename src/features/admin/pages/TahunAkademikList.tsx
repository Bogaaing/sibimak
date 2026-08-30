import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  CalendarDays, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { AcademicYear } from '../../../types/database.types';

export const TahunAkademikList: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => store.getAcademicYears());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    semester: 'Ganjil' as 'Ganjil' | 'Genap' | 'Pendek',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      code: '2026/2027-2',
      name: 'Tahun Akademik 2026/2027 Genap',
      semester: 'Genap',
      start_date: '2027-02-01',
      end_date: '2027-06-30',
      is_active: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ay: AcademicYear) => {
    setEditingId(ay.id);
    setFormData({
      code: ay.code,
      name: ay.name,
      semester: ay.semester,
      start_date: ay.start_date,
      end_date: ay.end_date,
      is_active: ay.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSetActive = (ayId: string) => {
    store.setActiveAcademicYear(ayId);
    setAcademicYears(store.getAcademicYears());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.start_date || !formData.end_date) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    store.saveAcademicYear({
      id: editingId || undefined,
      code: formData.code,
      name: formData.name,
      semester: formData.semester,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    });

    setAcademicYears(store.getAcademicYears());
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteAcademicYear(targetDeleteId);
      setAcademicYears(store.getAcademicYears());
      setTargetDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Master Tahun Akademik</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Kelola periode semester akademik aktif dan rentang tanggal pelaksanaan bimbingan.</p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-1.5 text-xs font-bold py-2 px-3.5 shadow-2xs flex-shrink-0">
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Tambah Periode</span>
        </Button>
      </div>

      {/* Academic Years Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Daftar Tahun Akademik ({academicYears.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Tahun Akademik</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Rentang Periode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicYears.map((ay) => (
                <tr key={ay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                    {ay.code}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {ay.name}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">
                    {ay.semester}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">
                    {ay.start_date} s/d {ay.end_date}
                  </td>
                  <td className="px-4 py-3.5">
                    {ay.is_active ? (
                      <Badge variant="success" size="sm">
                        Sedang Aktif
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleSetActive(ay.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Jadikan Aktif</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(ay)}
                        title="Edit Tahun Akademik"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                      >
                        <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                      </button>
                      <button
                        onClick={() => {
                          setTargetDeleteId(ay.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={ay.is_active}
                        title={ay.is_active ? 'Periode aktif tidak dapat dihapus' : 'Hapus Tahun Akademik'}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Academic Year Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kode Periode *"
            placeholder="Contoh: 2026/2027-1"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />

          <Input
            label="Nama Tahun Akademik *"
            placeholder="Contoh: Tahun Akademik 2026/2027 Ganjil"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Semester *"
            options={[
              { value: 'Ganjil', label: 'Semester Ganjil' },
              { value: 'Genap', label: 'Semester Genap' },
              { value: 'Pendek', label: 'Semester Pendek / Antara' },
            ]}
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Tanggal Mulai *"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <Input
              type="date"
              label="Tanggal Selesai *"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Tambah Periode'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tahun Akademik"
        message="Apakah Anda yakin ingin menghapus periode tahun akademik ini?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
