import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { store } from '../../../lib/store';
import { Plus, Users, Layers, ShieldAlert, CheckCircle, Edit2 } from 'lucide-react';
import { getLecturerFullName } from '../../../lib/utils';

export const PlottingPAList: React.FC = () => {
  const [assignments, setAssignments] = useState(() => store.getAssignments());
  const [lecturers] = useState(() => store.getLecturers());
  const [classes] = useState(() => store.getClasses());
  const [academicYears] = useState(() => store.getAcademicYears());
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenEdit = (asg: typeof assignments[0]) => {
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

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Plotting Dosen Pembimbing Akademik"
        description="Penugasan Dosen PA ke kelas bimbingan (1 Dosen dapat membimbing beberapa kelas)."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Aturan Relasi Penugasan (Plotting PA)</h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Satu Dosen PA dapat membimbing 2 hingga 5 kelas secara simultan. Satu kelas di satu periode tahun akademik dipimpin oleh 1 Dosen PA penanggung jawab.
              </p>
            </div>
          </div>

          <Button onClick={handleOpenAdd} className="gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" />
            Plotting Baru
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Plotting Penugasan ({assignments.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Dosen Pembimbing Akademik</th>
                  <th className="px-6 py-3.5">Kelas yang Dibimbing</th>
                  <th className="px-6 py-3.5">Periode Akademik</th>
                  <th className="px-6 py-3.5">Nomor SK Penugasan</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data plotting penugasan dosen PA.
                    </td>
                  </tr>
                ) : (
                  assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {asg.lecturer ? getLecturerFullName(asg.lecturer) : 'Dosen'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          NIDN: {asg.lecturer?.nidn} • {asg.lecturer?.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Layers className="w-3.5 h-3.5" />
                          Kelas {asg.class?.name} ({asg.class?.study_program})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {asg.academic_year?.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {asg.sk_number || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Aktif
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(asg)}
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
        title={editingId ? 'Edit Plotting Dosen PA' : 'Tambah Plotting Penugasan Dosen PA'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Pilih Dosen Pembimbing Akademik *"
            options={lecturers.map((l) => ({
              value: l.id,
              label: `${getLecturerFullName(l)} (NIDN: ${l.nidn})`,
            }))}
            value={formData.lecturer_id}
            onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
          />

          <Select
            label="Pilih Kelas Mahasiswa *"
            options={classes.map((c) => ({
              value: c.id,
              label: `Kelas ${c.name} - ${c.study_program} (${c.academic_level})`,
            }))}
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          />

          <Select
            label="Periode Tahun Akademik *"
            options={academicYears.map((ay) => ({
              value: ay.id,
              label: `${ay.name} (${ay.code})`,
            }))}
            value={formData.academic_year_id}
            onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
          />

          <Input
            label="Nomor Surat Keputusan (SK) Penugasan"
            placeholder="Contoh: SK/2026/FTI/089"
            value={formData.sk_number}
            onChange={(e) => setFormData({ ...formData, sk_number: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Penugasan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
