import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  GraduationCap, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { ImportWizardModal } from '../components/ImportWizardModal';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { Student } from '../../../types/database.types';

export const MahasiswaList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => store.getStudents());
  const classes = store.getClasses();
  const academicYears = store.getAcademicYears();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Dropdown State
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // Manual Form State
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

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedYear('ALL');
    setSelectedClass('ALL');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nim.includes(searchTerm) ||
      (s.profile?.email && s.profile.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentClass = classes.find(c => c.id === s.class_id);
    const matchYear = selectedYear === 'ALL' || currentClass?.academic_year_id === selectedYear;
    const matchClass = selectedClass === 'ALL' || s.class_id === selectedClass;
    const matchStatus = selectedStatus === 'ALL' || (s.profile?.is_active !== false ? 'Aktif' : 'Nonaktif') === selectedStatus;

    return matchSearch && matchYear && matchClass && matchStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenManualAdd = () => {
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
    setIsAddMenuOpen(false);
    setIsManualModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingId(s.id);
    setFormData({
      nim: s.nim,
      full_name: s.profile?.full_name || '',
      email: s.profile?.email || '',
      phone_number: s.profile?.phone_number || '',
      class_id: s.class_id || classes[0]?.id || '',
      program_type: s.program_type || 'Reguler',
      entry_year: s.entry_year || '2024',
    });
    setIsManualModalOpen(true);
  };

  const handleOpenDetail = (s: Student) => {
    setSelectedStudent(s);
    setIsDetailModalOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.full_name || !formData.email) {
      alert('Mohon lengkapi NIM, Nama Lengkap, dan Email.');
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
    setIsManualModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteStudent(targetDeleteId);
      setStudents(store.getStudents());
      setTargetDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleImportSuccess = () => {
    setStudents(store.getStudents());
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 1. PAGE HEADER & PRIMARY ACTION DROPDOWN */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Data Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
            Kelola data mahasiswa yang terdaftar pada bimbingan akademik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          {/* Direct Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Import Mahasiswa</span>
          </button>

          {/* Add Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors select-none"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Tambah Mahasiswa</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[2] ml-0.5" />
            </button>

            {isAddMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsAddMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleOpenManualAdd}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <span>Tambah Manual</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      setIsImportModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Import dari Template</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
            Pencarian
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.8]" />
            <input
              type="text"
              placeholder="Cari NIM atau nama..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Dropdown Tahun Akademik */}
        <div className="space-y-1 flex-shrink-0 min-w-[170px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Tahun Akademik
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua</option>
            {academicYears.map(ay => (
              <option key={ay.id} value={ay.id}>{ay.name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown Kelas */}
        <div className="space-y-1 flex-shrink-0 min-w-[150px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Kelas
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>Kelas {c.name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown Status */}
        <div className="space-y-1 flex-shrink-0 min-w-[130px]">
          <label className="text-[11px] font-semibold text-slate-500 block">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={handleResetFilter}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs flex-shrink-0 h-[38px]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 stroke-[1.8]" />
          <span>Reset</span>
        </button>
      </div>

      {/* 3. TABEL DATA MAHASISWA */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Daftar Mahasiswa Terdaftar ({filteredStudents.length})</span>
          </h2>

          <div className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {filteredStudents.length} Mahasiswa
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                Belum Ada Mahasiswa
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tambahkan mahasiswa secara manual atau import banyak data sekaligus menggunakan template.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button size="sm" onClick={handleOpenManualAdd}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Mahasiswa
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <UploadCloud className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Import dari Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">NIM</th>
                  <th className="px-4 py-3">Nama Mahasiswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Program Studi</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">No. Handphone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((s, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const currentClass = classes.find(c => c.id === s.class_id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-3.5 text-center font-medium text-slate-400">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                        {s.nim}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {s.profile?.full_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {currentClass?.name || 'Tanpa Kelas'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {currentClass?.study_program || 'Sistem Informasi'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {s.profile?.email}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {s.profile?.phone_number || '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={s.profile?.is_active !== false ? 'success' : 'default'} size="sm">
                          {s.profile?.is_active !== false ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(s)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                          </button>
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
                            title="Nonaktifkan / Hapus"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredStudents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} mahasiswa
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. BULK IMPORT WIZARD MODAL */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* 5. STUDENT DETAIL MODAL */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
      />

      {/* 6. MANUAL ADD / EDIT MODAL */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title={editingId ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
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
            label="No. Handphone / WhatsApp"
            placeholder="Contoh: 085712345678"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Simpan Mahasiswa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. CONFIRMATION DIALOG FOR DELETE / DEACTIVATE */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Nonaktifkan / Hapus Mahasiswa"
        message="Apakah Anda yakin ingin menonaktifkan atau menghapus data Mahasiswa ini dari sistem?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
