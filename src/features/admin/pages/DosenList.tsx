import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, Search, Mail, Phone, BookOpen, Edit2 } from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';

export const DosenList: React.FC = () => {
  const [lecturers, setLecturers] = useState(() => store.getLecturers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nidn: '',
    full_name: '',
    title_prefix: '',
    title_suffix: '',
    department: 'Sistem Informasi',
    email: '',
    phone_number: '',
  });

  const filteredLecturers = lecturers.filter(
    (l) =>
      l.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nidn.includes(searchTerm) ||
      l.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nidn: '',
      full_name: '',
      title_prefix: '',
      title_suffix: '',
      department: 'Sistem Informasi',
      email: '',
      phone_number: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: typeof lecturers[0]) => {
    setEditingId(l.id);
    setFormData({
      nidn: l.nidn,
      full_name: l.profile.full_name,
      title_prefix: l.title_prefix || '',
      title_suffix: l.title_suffix || '',
      department: l.department,
      email: l.profile.email,
      phone_number: l.profile.phone_number || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nidn || !formData.full_name || !formData.email) {
      alert('Mohon lengkapi NIDN, Nama, dan Email!');
      return;
    }

    store.saveLecturer({
      id: editingId || undefined,
      nidn: formData.nidn,
      full_name: formData.full_name,
      title_prefix: formData.title_prefix,
      title_suffix: formData.title_suffix,
      department: formData.department,
      email: formData.email,
      phone_number: formData.phone_number,
    });

    setLecturers(store.getLecturers());
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Data Master Dosen Pembimbing Akademik"
        description="Kelola data induk Dosen PA, NIDN, program studi, dan kontak resmi."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Dosen (Nama, NIDN, Program Studi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Dosen PA
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Dosen ({filteredLecturers.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">NIDN</th>
                  <th className="px-6 py-3.5">Nama Lengkap & Gelar</th>
                  <th className="px-6 py-3.5">Program Studi</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLecturers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data dosen yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredLecturers.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">
                        {l.nidn}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {getLecturerFullName(l)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          {l.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{l.profile.email}</span>
                          </div>
                          {l.profile.phone_number && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{l.profile.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(l)}
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
        title={editingId ? 'Edit Data Dosen' : 'Tambah Dosen Pembimbing Akademik'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="NIDN *"
              placeholder="Contoh: 0412058501"
              value={formData.nidn}
              onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
              required
            />
            <Input
              label="Program Studi *"
              placeholder="Contoh: Sistem Informasi"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Gelar Depan"
              placeholder="Dr. / Prof."
              value={formData.title_prefix}
              onChange={(e) => setFormData({ ...formData, title_prefix: e.target.value })}
            />
            <div className="col-span-2">
              <Input
                label="Nama Lengkap *"
                placeholder="Budi Santoso"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
          </div>

          <Input
            label="Gelar Belakang"
            placeholder="M.Kom. / Ph.D."
            value={formData.title_suffix}
            onChange={(e) => setFormData({ ...formData, title_suffix: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              label="Email Resmi Kampus *"
              placeholder="dosen@kampus.ac.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Nomor Handphone / WhatsApp"
              placeholder="081234567890"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Data Dosen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
