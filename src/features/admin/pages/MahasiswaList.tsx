import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, Search, Mail, Phone, Layers, Edit2 } from 'lucide-react';

export const MahasiswaList: React.FC = () => {
  const [students, setStudents] = useState(() => store.getStudents());
  const [classes] = useState(() => store.getClasses());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nim: '',
    full_name: '',
    email: '',
    phone_number: '',
    class_id: classes[0]?.id || '',
    program_type: 'Reguler' as 'Reguler' | 'Non-Reguler',
    entry_year: '2024',
  });

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleOpenEdit = (s: typeof students[0]) => {
    setEditingId(s.id);
    setFormData({
      nim: s.nim,
      full_name: s.profile.full_name,
      email: s.profile.email,
      phone_number: s.profile.phone_number || '',
      class_id: s.class_id || '',
      program_type: s.program_type,
      entry_year: s.entry_year,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.full_name || !formData.email) {
      alert('Mohon lengkapi NIM, Nama Lengkap, dan Email!');
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

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Data Master Mahasiswa"
        description="Kelola data induk mahasiswa, NIM, penempatan kelas, dan jalur program."
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
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Mahasiswa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Mahasiswa ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">NIM</th>
                  <th className="px-6 py-3.5">Nama Lengkap</th>
                  <th className="px-6 py-3.5">Kelas</th>
                  <th className="px-6 py-3.5">Program / Angkatan</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data mahasiswa yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">
                        {s.nim}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{s.profile.full_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Layers className="w-3 h-3 text-blue-500" />
                          {s.class?.name || 'Belum Ada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="font-medium text-slate-700">{s.program_type}</span> • Angkatan {s.entry_year}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(s)}
                          className="gap-1 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
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
        title={editingId ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="NIM *"
              placeholder="Contoh: 2210511045"
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              required
            />
            <Input
              label="Nama Lengkap *"
              placeholder="Ahmad Fauzi"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Kelas *"
              options={classes.map((c) => ({ value: c.id, label: `${c.name} (${c.study_program})` }))}
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            />
            <Select
              label="Jalur Program *"
              options={[
                { value: 'Reguler', label: 'Reguler' },
                { value: 'Non-Reguler', label: 'Non-Reguler' },
              ]}
              value={formData.program_type}
              onChange={(e) => setFormData({ ...formData, program_type: e.target.value as 'Reguler' | 'Non-Reguler' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              label="Email Mahasiswa *"
              placeholder="mahasiswa@kampus.ac.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Tahun Angkatan Masuk *"
              placeholder="2024"
              value={formData.entry_year}
              onChange={(e) => setFormData({ ...formData, entry_year: e.target.value })}
              required
            />
          </div>

          <Input
            label="Nomor Handphone / WhatsApp"
            placeholder="085712345678"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Data Mahasiswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
