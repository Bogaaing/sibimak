import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Pencil, 
  Trash2, 
  UserRoundCog,
  FileSignature
} from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { Lecturer } from '../../../types/database.types';

export const DosenList: React.FC = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>(() => store.getLecturers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nidn: '',
    full_name: '',
    title_prefix: '',
    title_suffix: '',
    department: 'Sistem Informasi',
    email: '',
    phone_number: '',
    signature_url: '/assets/ahmadasepsuhendi-ttd.png',
  });

  const filteredLecturers = lecturers.filter(
    (l) =>
      l.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      signature_url: '/assets/ahmadasepsuhendi-ttd.png',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: Lecturer) => {
    setEditingId(l.id);
    setFormData({
      nidn: l.nidn,
      full_name: l.profile?.full_name || '',
      title_prefix: l.title_prefix || '',
      title_suffix: l.title_suffix || '',
      department: l.department,
      email: l.profile?.email || '',
      phone_number: l.profile?.phone_number || '',
      signature_url: l.signature_url || '/assets/ahmadasepsuhendi-ttd.png',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nidn || !formData.full_name || !formData.email) {
      alert('Mohon lengkapi NIDN, Nama Lengkap, dan Email Dosen.');
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
      signature_url: formData.signature_url,
    });

    setLecturers(store.getLecturers());
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteLecturer(targetDeleteId);
      setLecturers(store.getLecturers());
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
            placeholder="Cari Dosen PA (Nama, NIDN, Program Studi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {filteredLecturers.length} Dosen
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5 text-xs font-bold py-2 px-3.5 shadow-2xs">
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Tambah Dosen PA</span>
          </Button>
        </div>
      </div>

      {/* Dosen Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserRoundCog className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Data Master Dosen Pembimbing Akademik ({filteredLecturers.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">NIDN</th>
                <th className="px-4 py-3">Nama Lengkap & Gelar</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3">Kontak Resmi</th>
                <th className="px-4 py-3">Paraf / TTD</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLecturers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data dosen pembimbing akademik ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLecturers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                      {l.nidn}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {getLecturerFullName(l)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">
                      {l.department}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                          <span>{l.profile?.email}</span>
                        </div>
                        {l.profile?.phone_number && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
                            <span>{l.profile?.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {l.signature_url ? (
                        <div className="w-16 h-8 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                          <img
                            src={l.signature_url}
                            alt="TTD"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum diunggah</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          title="Edit Dosen"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => {
                            setTargetDeleteId(l.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Hapus Dosen"
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

      {/* Add / Edit Lecturer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Data Dosen PA' : 'Tambah Dosen Pembimbing Akademik'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="NIDN *"
            placeholder="Contoh: 0411099202"
            value={formData.nidn}
            onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
            required
          />

          <Input
            label="Nama Lengkap (Tanpa Gelar) *"
            placeholder="Contoh: Ahmad Asep Suhendi"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Gelar Depan"
              placeholder="Contoh: Dr., Prof."
              value={formData.title_prefix}
              onChange={(e) => setFormData({ ...formData, title_prefix: e.target.value })}
            />
            <Input
              label="Gelar Belakang"
              placeholder="Contoh: S.Kom., M.Kom."
              value={formData.title_suffix}
              onChange={(e) => setFormData({ ...formData, title_suffix: e.target.value })}
            />
          </div>

          <Select
            label="Program Studi *"
            options={[
              { value: 'Sistem Informasi', label: 'S1 Sistem Informasi' },
              { value: 'Teknik Informatika', label: 'S1 Teknik Informatika' },
              { value: 'Sistem Komputer', label: 'S1 Sistem Komputer' },
              { value: 'Manajemen Informatika', label: 'D3 Manajemen Informatika' },
            ]}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <Input
            type="email"
            label="Email Kampus / Akun Login *"
            placeholder="Contoh: ahmad.asep@unpam.ac.id"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            label="No. Telepon / WhatsApp"
            placeholder="Contoh: 0851.5977.4347"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />

          <Input
            label="URL Asset Tanda Tangan Resmi (Paraf)"
            placeholder="Contoh: /assets/ahmadasepsuhendi-ttd.png"
            value={formData.signature_url}
            onChange={(e) => setFormData({ ...formData, signature_url: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Tambah Dosen'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Dosen PA"
        message="Apakah Anda yakin ingin menghapus data Dosen Pembimbing Akademik ini dari sistem?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
