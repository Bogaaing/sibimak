import React, { useState } from 'react';
import { store } from '../../../lib/store';
import { 
  Plus, 
  GitBranch, 
  School, 
  Pencil, 
  Trash2, 
  FileText,
  UserCheck
} from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { ClassAdvisorAssignment } from '../../../types/database.types';

export const PlottingPAList: React.FC = () => {
  const [assignments, setAssignments] = useState<ClassAdvisorAssignment[]>(() => store.getAssignments());
  const [lecturers] = useState(() => store.getLecturers());
  const [classes] = useState(() => store.getClasses());
  const [academicYears] = useState(() => store.getAcademicYears());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeYear = store.getActiveAcademicYear();

  const [formData, setFormData] = useState({
    lecturer_id: lecturers[0]?.id || '',
    class_id: classes[0]?.id || '',
    academic_year_id: activeYear?.id || academicYears[0]?.id || '',
    sk_number: 'SK/2026/FTI/089',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      lecturer_id: lecturers[0]?.id || '',
      class_id: classes[0]?.id || '',
      academic_year_id: activeYear?.id || academicYears[0]?.id || '',
      sk_number: 'SK/2026/FTI/089',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: ClassAdvisorAssignment) => {
    setEditingId(asg.id);
    setFormData({
      lecturer_id: asg.lecturer_id,
      class_id: asg.class_id,
      academic_year_id: asg.academic_year_id,
      sk_number: asg.sk_number || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lecturer_id || !formData.class_id || !formData.academic_year_id) {
      alert('Mohon pilih Dosen, Kelas, dan Tahun Akademik!');
      return;
    }

    store.saveAssignment({
      id: editingId || undefined,
      lecturer_id: formData.lecturer_id,
      class_id: formData.class_id,
      academic_year_id: formData.academic_year_id,
      sk_number: formData.sk_number,
    });

    setAssignments(store.getAssignments());
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (targetDeleteId) {
      store.deleteAssignment(targetDeleteId);
      setAssignments(store.getAssignments());
      setTargetDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Plotting Dosen Pembimbing Akademik (PA)</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Penugasan resmi Dosen PA ke kelas perwalian mahasiswa berdasarkan Surat Keputusan (SK).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Total {assignments.length} Kelas Terplotting
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5 text-xs font-bold py-2 px-3.5 shadow-2xs">
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Plotting Baru</span>
          </Button>
        </div>
      </div>

      {/* Plotting Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            <span>Daftar Penugasan Kelas Perwalian ({assignments.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Program Studi</th>
                <th className="px-4 py-3">Dosen Pembimbing Akademik (PA)</th>
                <th className="px-4 py-3">Nomor SK Penugasan</th>
                <th className="px-4 py-3">Periode Akademik</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data penugasan plotting Dosen PA.
                  </td>
                </tr>
              ) : (
                assignments.map((asg) => {
                  const lect = lecturers.find((l) => l.id === asg.lecturer_id);
                  const cls = classes.find((c) => c.id === asg.class_id);
                  const ay = academicYears.find((a) => a.id === asg.academic_year_id);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {cls?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {cls?.study_program}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[1.8]" />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{lect ? getLecturerFullName(lect) : '-'}</p>
                            <p className="text-[10.5px] text-slate-400 font-mono">NIDN: {lect?.nidn || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">
                        {asg.sk_number || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {ay?.name || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(asg)}
                            title="Edit Plotting"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                          </button>
                          <button
                            onClick={() => {
                              setTargetDeleteId(asg.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Hapus Plotting"
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

      {/* Add / Edit Plotting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Plotting Dosen PA' : 'Penugasan Plotting Dosen PA'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Kelas Perwalian *"
            options={classes.map((c) => ({
              value: c.id,
              label: `Kelas ${c.name} (${c.study_program})`,
            }))}
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          />

          <Select
            label="Dosen Pembimbing Akademik (PA) *"
            options={lecturers.map((l) => ({
              value: l.id,
              label: `${getLecturerFullName(l)} (NIDN: ${l.nidn})`,
            }))}
            value={formData.lecturer_id}
            onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
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

          <Input
            label="Nomor Surat Keputusan (SK) *"
            placeholder="Contoh: SK/2026/FTI/089"
            value={formData.sk_number}
            onChange={(e) => setFormData({ ...formData, sk_number: e.target.value })}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingId ? 'Simpan Penugasan' : 'Tetapkan Plotting'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Plotting Dosen PA"
        message="Apakah Anda yakin ingin membatalkan plotting penugasan Dosen PA untuk kelas ini?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
