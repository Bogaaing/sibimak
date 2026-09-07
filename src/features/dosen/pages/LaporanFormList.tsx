import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { dosenService } from '../../../services/dosen.service';
import { 
  formBatchDownloadService, 
  ValidatedStudentSummary, 
  BatchDownloadProgress 
} from '../../../services/formBatchDownload.service';
import { 
  FileDown, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileText, 
  School, 
  RefreshCw, 
  Info,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { ClassAdvisorAssignment } from '../../../types/database.types';

export const LaporanFormList: React.FC = () => {
  const { user, lecturerProfile } = useAuth();
  const lecturerId = lecturerProfile?.id || user?.id;
  const lecturerEmail = user?.email;

  const [assignments, setAssignments] = useState<ClassAdvisorAssignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [summaries, setSummaries] = useState<ValidatedStudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  // Empty state alert modal
  const [isEmptyAlertOpen, setIsEmptyAlertOpen] = useState<boolean>(false);
  // Download progress state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<BatchDownloadProgress | null>(null);

  // Load assignments and validated students
  const loadData = async () => {
    setIsLoading(true);
    try {
      const asgs = await dosenService.getAssignments(lecturerId, lecturerEmail);
      setAssignments(asgs);

      const items = await formBatchDownloadService.getValidatedStudentsData(
        lecturerId,
        lecturerEmail,
        selectedClassId
      );
      setSummaries(items);
    } catch (err) {
      console.error('Error loading LaporanFormList data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lecturerId, lecturerEmail, selectedClassId]);

  // Selected class display name
  const selectedClassName = useMemo(() => {
    if (selectedClassId === 'ALL') return 'Semua Kelas';
    const found = assignments.find((a) => a.class_id === selectedClassId);
    return found?.class?.name || 'Kelas Terpilih';
  }, [selectedClassId, assignments]);

  // Filtered summaries according to search term
  const filteredSummaries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return summaries;

    return summaries.filter((item) => {
      const name = item.student.profile?.full_name?.toLowerCase() || '';
      const nim = item.student.nim?.toLowerCase() || '';
      const classNameStr = item.student.class?.name?.toLowerCase() || '';
      return name.includes(q) || nim.includes(q) || classNameStr.includes(q);
    });
  }, [summaries, searchQuery]);

  // Count total students with valid records
  const totalEligibleStudents = useMemo(() => {
    return summaries.filter((s) => s.validCount > 0).length;
  }, [summaries]);

  // Count total valid records across all students
  const totalValidRecordsCount = useMemo(() => {
    return summaries.reduce((acc, curr) => acc + curr.validCount, 0);
  }, [summaries]);

  // Initiate download action
  const handleInitiateDownload = () => {
    if (totalEligibleStudents === 0) {
      setIsEmptyAlertOpen(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  // Confirm and start download
  const handleConfirmDownload = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    setProgress({
      current: 0,
      total: totalEligibleStudents,
      statusText: 'Menyiapkan arsip formulir...',
      percentage: 5,
    });

    try {
      const result = await formBatchDownloadService.downloadBatchValidatedForms(summaries, {
        className: selectedClassId === 'ALL' ? 'Semua_Kelas' : selectedClassName,
        onProgress: (prog) => {
          setProgress(prog);
        },
      });

      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (err) {
      console.error('Batch download failed:', err);
      alert('Terjadi kesalahan saat mengunduh berkas formulir.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(null);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION & PRIMARY ACTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Laporan & Formulir Bimbingan
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unduh seluruh form bimbingan mahasiswa yang telah divalidasi ke dalam berkas ZIP siap cetak.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={handleInitiateDownload}
              disabled={isLoading || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4 stroke-[2.2]" />
              <span>Download Form Tervalidasi</span>
            </Button>
          </div>
        </div>

        {/* Small subtitle caption */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Hanya mencakup mahasiswa dengan status bimbingan{' '}
              <strong className="text-slate-800 font-semibold">VALID / TERVALIDASI</strong>.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>
              Mahasiswa Tervalidasi:{' '}
              <strong className="text-blue-600 font-bold">{totalEligibleStudents}</strong> dari{' '}
              {summaries.length}
            </span>
            <span>
              Total Sesi Valid:{' '}
              <strong className="text-emerald-600 font-bold">{totalValidRecordsCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="ALL">Semua Kelas Bimbingan</option>
              {assignments.map((asg) => (
                <option key={asg.id} value={asg.class_id}>
                  Kelas {asg.class?.name} ({asg.academic_year?.name || 'Aktif'})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIM mahasiswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 self-end sm:self-auto"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. STUDENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-800">
              Daftar Mahasiswa Kelas ({selectedClassName})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Menampilkan <strong className="text-slate-800 font-semibold">{filteredSummaries.length}</strong> mahasiswa
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-600">Memuat data bimbingan mahasiswa...</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <AlertCircle className="w-8 h-8 stroke-[1.5] text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              {searchQuery ? 'Tidak ada mahasiswa yang cocok dengan pencarian.' : 'Belum ada mahasiswa terdaftar di kelas ini.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Kelas / Program</th>
                  <th className="py-3 px-4 text-center">Bimbingan Valid</th>
                  <th className="py-3 px-4 text-center">Status Form</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredSummaries.map((item, index) => {
                  const studentName = item.student.profile?.full_name || 'Mahasiswa';
                  const studentNim = item.student.nim || '-';
                  const classNameStr = item.student.class?.name || '-';
                  const programType = item.student.program_type || 'Reguler';
                  const hasValid = item.validCount > 0;

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* Mahasiswa Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug uppercase">
                          {studentName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          NIM: {studentNim}
                        </div>
                      </td>

                      {/* Kelas & Program */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {classNameStr}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {programType}
                        </div>
                      </td>

                      {/* Bimbingan Valid Count */}
                      <td className="py-3.5 px-4 text-center">
                        {hasValid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.validCount} Sesi Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            0 Sesi Valid
                          </span>
                        )}
                      </td>

                      {/* Status Form */}
                      <td className="py-3.5 px-4 text-center">
                        {hasValid ? (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Siap Diunduh
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum Ada Data Valid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/report/formulir?studentId=${item.student.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Lihat Form</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* 4. CONFIRMATION MODAL BEFORE BATCH DOWNLOAD               */}
      {/* ========================================================== */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Konfirmasi Download Formulir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh seluruh form mahasiswa bimbingan yang telah tervalidasi.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Cakupan Kelas:</span>
                <strong className="text-slate-800 font-semibold">{selectedClassName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mahasiswa Tervalidasi:</span>
                <strong className="text-blue-600 font-bold">{totalEligibleStudents} Mahasiswa</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format Berkas:</span>
                <span className="font-mono text-slate-800 font-semibold">ZIP (Kumpulan Dokumen PDF)</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11.5px] text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Proses pembuatan PDF dan kompresi ZIP membutuhkan waktu beberapa saat. Harap tunggu hingga proses selesai.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Mulai Unduh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. EMPTY STATE ALERT MODAL (0 VALID FORMS)                 */}
      {/* ========================================================== */}
      {isEmptyAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Belum Ada Form Tervalidasi
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Belum ada form mahasiswa yang berstatus tervalidasi pada kelas ini. Validasi kehadiran bimbingan kelas atau bimbingan individu terlebih dahulu.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsEmptyAlertOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Mengerti
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. PROGRESS BAR MODAL DURING DOWNLOAD                      */}
      {/* ========================================================== */}
      {isProcessing && progress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sedang Memproses Formulir...
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {progress.statusText}
                </p>
              </div>
            </div>

            {/* Progress bar container */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span>
                  {progress.current} dari {progress.total} formulir
                </span>
                <span className="font-bold text-blue-600">{progress.percentage}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center">
              Jangan menutup peramban hingga berkas ZIP berhasil diunduh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};