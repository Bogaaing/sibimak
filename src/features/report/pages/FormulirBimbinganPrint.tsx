import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { store } from '../../../lib/store';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FormHeader } from '../components/FormHeader';
import { LecturerInformation } from '../components/LecturerInformation';
import { StudentInformation } from '../components/StudentInformation';
import { GuidanceHistoryTable, FormGuidanceItem } from '../components/GuidanceHistoryTable';
import { FormFooter } from '../components/FormFooter';
import { getLecturerFullName } from '../../../lib/utils';

export const FormulirBimbinganPrint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get('studentId') || 'usr-mhs-1';

  const student = store.getStudents().find((s) => s.id === studentId);
  const myClassId = student?.class_id;

  const assignment = store.getAssignments().find((a) => a.class_id === myClassId);
  const lecturer = assignment?.lecturer;

  // 1. Fetch Class Guidance Participations for this student
  const classParticipations = store.getParticipants().filter((p) => p.student_id === studentId);
  
  // 2. Fetch Individual Guidance Requests for this student
  const individualRequests = store.getIndividualRequests().filter((r) => r.student_id === studentId);

  // Map to unified records array including validation_status
  const guidanceRecords: FormGuidanceItem[] = [
    ...classParticipations.map((cp) => {
      const session = store.getClassSessions().find((cs) => cs.id === cp.session_id);
      return {
        id: cp.id,
        session_date: session?.session_date || new Date().toISOString().split('T')[0],
        title: session?.title || 'Bimbingan Kelas',
        topic_description: session?.topic_description || '',
        validation_status: cp.validation_status,
        type: 'KELAS' as const,
      };
    }),
    ...individualRequests.map((ir) => ({
      id: ir.id,
      session_date: ir.guidance_date || ir.created_at.split('T')[0],
      title: ir.title,
      topic_description: ir.initial_problem,
      validation_status: ir.validation_status,
      type: 'INDIVIDU' as const,
    })),
  ];

  // Set document title for automatic PDF file name on browser print
  useEffect(() => {
    if (student) {
      const originalTitle = document.title;
      const formattedTitle = `Form Bimbingan Akademik - ${student.nim} - ${student.profile.full_name}`;
      document.title = formattedTitle;

      return () => {
        document.title = originalTitle;
      };
    }
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold text-slate-700">Data mahasiswa tidak ditemukan.</p>
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const lecturerName = lecturer ? getLecturerFullName(lecturer) : 'AHMAD ASEP SUHENDI, S.KOM, M.KOM';
  const lecturerNidn = lecturer?.nidn || '0411099202';
  const lecturerPhone = lecturer?.profile?.phone_number || '0851.5977.4347';
  const lecturerEmail = lecturer?.profile?.email || 'Dosen02975@unpam.ac.id';
  const lecturerSignature = lecturer?.signature_url || '/assets/ahmadasepsuhendi-ttd.png';

  return (
    <div className="min-h-screen bg-slate-200/80 p-4 sm:p-8 flex flex-col items-center print:p-0 print:bg-white">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Aplikasi
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Nama File PDF: <strong className="font-mono text-slate-800">Form Bimbingan Akademik - {student.nim} - {student.profile.full_name}.pdf</strong>
          </span>
          <Button onClick={handlePrint} className="gap-2 text-xs bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 shadow-sm">
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      {/* Official A4 Printable Sheet Container */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-[15mm] sm:p-[18mm] rounded-none sm:rounded-sm border border-slate-300 sm:shadow-2xl print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none text-slate-950 font-sans box-border flex flex-col justify-between">
        <div className="w-full">
          {/* 1. Official Header with Logos & Double Line */}
          <FormHeader />

          {/* 2. Dosen Pembimbing Akademik Table */}
          <LecturerInformation
            nidn={lecturerNidn}
            fullName={lecturerName}
            phoneNumber={lecturerPhone}
            email={lecturerEmail}
          />

          {/* 3. Mahasiswa Table (2-Sided Columns) */}
          <StudentInformation
            nim={student.nim}
            fullName={student.profile.full_name}
            classNameStr={student.class?.name || 'SI-5A'}
            programType={student.program_type || 'Reguler'}
            phoneNumber={student.profile.phone_number || '085712345678'}
            email={student.profile.email}
          />

          {/* 4. Pelaksanaan Bimbingan Akademik Table (with automatic Paraf Dosen) */}
          <GuidanceHistoryTable
            records={guidanceRecords}
            signatureUrl={lecturerSignature}
          />

          {/* 5. Official Footnote */}
          <FormFooter />
        </div>
      </div>
    </div>
  );
};
