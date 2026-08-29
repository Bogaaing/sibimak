import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, Calendar, CheckCircle2, Edit2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const TahunAkademikList: React.FC = () => {
  const [academicYears, setAcademicYears] = useState(() => store.getAcademicYears());
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenEdit = (ay: typeof academicYears[0]) => {
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

  const handleSetActive = (id: string) => {
    store.saveAcademicYear({ id, is_active: true });
    setAcademicYears(store.getAcademicYears());
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Master Tahun Akademik"
        description="Kelola periode tahun ajaran, semester berjalan, dan tanggal rentang perkuliahan."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Tahun akademik aktif menentukan plotting kelas dan periode pengisian bimbingan saat ini.
          </p>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Tahun Akademik
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Tahun Akademik ({academicYears.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kode</th>
                  <th className="px-6 py-3.5">Nama Periode</th>
                  <th className="px-6 py-3.5">Semester</th>
                  <th className="px-6 py-3.5">Rentang Tanggal</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((ay) => (
                  <tr key={ay.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600">
                      {ay.code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {ay.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{ay.semester}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDate(ay.start_date)} — {formatDate(ay.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      {ay.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif Berjalan
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActive(ay.id)}
                          className="text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded border border-dashed border-slate-300 hover:border-blue-400 transition-colors"
                        >
                          Set Aktif
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(ay)}
                        className="gap-1 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode Tahun Akademik *"
              placeholder="Contoh: 2026/2027-1"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Select
              label="Semester *"
              options={[
                { value: 'Ganjil', label: 'Ganjil' },
                { value: 'Genap', label: 'Genap' },
                { value: 'Pendek', label: 'Pendek' },
              ]}
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' | 'Pendek' })}
            />
          </div>

          <Input
            label="Nama Periode Tahun Akademik *"
            placeholder="Contoh: Tahun Akademik 2026/2027 Ganjil"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Jadikan sebagai Periode Akademik Aktif
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Tahun Akademik
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
