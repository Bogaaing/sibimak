import React, { useState, useRef } from 'react';
import { store } from '../../../lib/store';
import { 
  studentImportService, 
  ImportValidationResult, 
  ValidatedImportRow 
} from '../../../services/studentImport.service';
import { 
  Download, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  FileText,
  School,
  CalendarDays,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { ImportPreviewTable } from './ImportPreviewTable';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const academicYears = store.getAcademicYears();
  const classes = store.getClasses();
  const activeYear = store.getActiveAcademicYear();

  // Wizard States
  const [selectedYearId, setSelectedYearId] = useState<string>(activeYear?.id || academicYears[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImportComplete, setIsImportComplete] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const targetYear = academicYears.find(y => y.id === selectedYearId) || academicYears[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rawRows = studentImportService.parseFileContent(text);
        if (rawRows.length === 0) {
          alert('File template kosong atau format kolom tidak sesuai.');
          setValidationResult(null);
        } else {
          const result = studentImportService.validateRows(rawRows, selectedClassId);
          setValidationResult(result);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Gagal membaca isi file. Pastikan format file adalah .csv atau .xlsx yang valid.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(uploadedFile);
  };

  const handleResetImport = () => {
    setFile(null);
    setValidationResult(null);
    setIsImportComplete(false);
    setImportedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommitImport = () => {
    if (!validationResult || validationResult.validCount === 0) return;

    const count = studentImportService.commitBatchImport(
      validationResult.rows,
      selectedClassId,
      targetYear?.name?.slice(0, 4) || '2024'
    );

    setImportedCount(count);
    setIsImportComplete(true);
    setShowConfirmModal(false);
    onSuccess();
  };

  const errorRows = validationResult?.rows.filter(r => r.status !== 'VALID') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Import Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tambahkan banyak mahasiswa sekaligus ke satu kelas menggunakan template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isImportComplete ? (
            /* Result Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">
                  Import Selesai
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  <span className="font-bold text-emerald-600">{importedCount} mahasiswa</span> berhasil ditambahkan ke kelas <span className="font-bold text-slate-800">{targetClass?.name}</span>.
                </p>
              </div>

              {errorRows.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left max-w-md mx-auto space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{errorRows.length} Data Tidak Diimport</span>
                  </div>
                  <p className="text-[11.5px] text-amber-700 font-medium leading-relaxed">
                    Data duplikat atau memiliki field kosong otomatis dilewati dan tidak merusak data yang sudah ada.
                  </p>
                  <button
                    onClick={() => studentImportService.downloadErrorReport(errorRows, targetClass?.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/60 rounded-lg text-xs font-bold text-amber-900 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Error Report (CSV)</span>
                  </button>
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleResetImport}>
                  Import File Lain
                </Button>
                <Button onClick={onClose}>
                  Selesai & Tutup
                </Button>
              </div>
            </div>
          ) : (
            /* Workflow Form View */
            <>
              {/* STEP 1: TARGET CLASS SELECTION */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <School className="w-4 h-4 text-blue-600 stroke-[1.8]" />
                  <span>1. Pilih Kelas Tujuan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Tahun Akademik *"
                    options={academicYears.map(ay => ({
                      value: ay.id,
                      label: `${ay.name} ${ay.is_active ? '(Aktif)' : ''}`
                    }))}
                    value={selectedYearId}
                    onChange={(e) => {
                      setSelectedYearId(e.target.value);
                      handleResetImport();
                    }}
                  />

                  <Select
                    label="Kelas *"
                    options={classes.map(c => ({
                      value: c.id,
                      label: `Kelas ${c.name} (${c.study_program})`
                    }))}
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      handleResetImport();
                    }}
                  />
                </div>

                {/* Target Class Info Badge */}
                <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10.5px] block font-medium">Kelas Terpilih</span>
                    <span className="font-bold text-slate-900">Kelas {targetClass?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10.5px] block font-medium">Program Studi</span>
                    <span className="font-bold text-slate-900">{targetClass?.study_program}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10.5px] block font-medium">Tahun Akademik</span>
                    <span className="font-bold text-blue-600">{targetYear?.name}</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: DOWNLOAD TEMPLATE */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 stroke-[1.8]" />
                    <span>2. Download Format Template</span>
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                    Gunakan template resmi berisi kolom <strong>NIM, Nama Lengkap, Email, No. Handphone</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => studentImportService.downloadTemplate('xlsx', targetClass?.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Download XLSX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => studentImportService.downloadTemplate('csv', targetClass?.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* STEP 3: UPLOAD FILE AREA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Upload File Template
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Maksimal 5MB (.xlsx / .csv)
                  </span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.tsv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {file ? file.name : 'Upload file template mahasiswa'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Klik untuk memilih file atau seret file ke area ini
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 4: PREVIEW & VALIDATION SUMMARY */}
              {isProcessing && (
                <div className="p-6 text-center text-xs text-slate-500 font-medium">
                  Memeriksa dan memvalidasi data mahasiswa...
                </div>
              )}

              {validationResult && !isProcessing && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Preview Data ({validationResult.totalRows} data ditemukan)
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        ✓ {validationResult.validCount} Data Valid
                      </span>
                      {validationResult.errorCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                          ⚠ {validationResult.errorCount} Bermasalah
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preview Table */}
                  <ImportPreviewTable rows={validationResult.rows} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isImportComplete && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0 z-20">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>

            {validationResult && validationResult.validCount > 0 ? (
              <Button
                onClick={() => setShowConfirmModal(true)}
                className="gap-2 font-bold text-xs"
              >
                <span>Import {validationResult.validCount} Mahasiswa</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Button>
            ) : (
              <Button disabled className="opacity-40">
                Pilih & Validasi File Dulu
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h4 className="text-sm font-bold text-slate-900">
              Konfirmasi Import Mahasiswa
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Import <strong className="text-blue-600">{validationResult?.validCount} mahasiswa valid</strong> ke kelas <strong className="text-slate-900">{targetClass?.name}</strong> ({targetClass?.study_program})?
            </p>
            {validationResult && validationResult.errorCount > 0 && (
              <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {validationResult.errorCount} data bermasalah/duplikat tidak akan dimasukkan.
              </p>
            )}
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Batal
              </Button>
              <Button onClick={handleCommitImport}>
                Import Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
