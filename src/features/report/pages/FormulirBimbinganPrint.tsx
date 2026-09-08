import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { store } from '../../../lib/store';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FormHeader } from '../components/FormHeader';
import { LecturerInformation } from '../components/LecturerInformation';
import { StudentInformation } from '../components/StudentInformation';
import { GuidanceHistoryTable, FormGuidanceItem } from '../components/GuidanceHistoryTable';
import { FormFooter } from '../components/FormFooter';
import { getLecturerFullName } from '../../../lib/utils';
import { Student, ClassAdvisorAssignment, Lecturer } from '../../../types/database.types';

export const FormulirBimbinganPrint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get('studentId') || '';

  const [student, setStudent] = useState<Student | null>(null);
  const [assignment, setAssignment] = useState<ClassAdvisorAssignment | null>(null);
  const [guidanceRecords, setGuidanceRecords] = useState<FormGuidanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFormData = async () => {
      setIsLoading(true);
      try {
        let std: Student | null = null;
        let asg: ClassAdvisorAssignment | null = null;
        const records: FormGuidanceItem[] = [];

        // 1. Fetch Student from Supabase
        if (studentId) {
          const { data: stdData } = await supabase
            .from('students')
            .select('*, profile:profiles(*), class:classes(*)')
            .eq('id', studentId)
            .maybeSingle();

          if (stdData) {
            std = stdData as Student;
          }
        }

        // Fallback to store if not in Supabase
        if (!std) {
          std = store.getStudents().find((s) => s.id === studentId) || null;
        }

        if (std && std.class_id) {
          // 2. Fetch Assignment for this student's class
          const { data: asgData } = await supabase
            .from('class_advisor_assignments')
            .select('*, lecturer:lecturers(*, profile:profiles(*)), class:classes(*)')
            .eq('class_id', std.class_id)
            .eq('is_active', true)
            .maybeSingle();

          if (asgData) {
            asg = asgData as ClassAdvisorAssignment;
          } else {
            asg = store.getAssignments().find((a) => a.class_id === std?.class_id) || null;
          }

          // 3. Fetch Class Guidance Participations for this student
          const { data: parts } = await supabase
            .from('class_guidance_participants')
            .select('*, session:class_guidance_sessions(*)')
            .eq('student_id', std.id);

          if (parts && parts.length > 0) {
            parts.forEach((p) => {
              records.push({
                id: p.id,
                session_date: p.session?.session_date || new Date().toISOString().split('T')[0],
                title: p.session?.title || 'Bimbingan Kelas',
                topic_description: p.session?.topic_description || '',
                validation_status: p.validation_status,
                type: 'KELAS'
              });
            });
          }
        }

        if (isMounted) {
          setStudent(std);
          setAssignment(asg);
          setGuidanceRecords(records);
        }
      } catch (err) {
        console.error('Error loading FormulirBimbinganPrint data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Set document title for automatic PDF file name on browser print
  useEffect(() => {
    if (student) {
      const originalTitle = document.title;
      const studentName = student.profile?.full_name || 'Mahasiswa';
      const formattedTitle = `Form Bimbingan Akademik - ${student.nim} - ${studentName}`;
      document.title = formattedTitle;

      return () => {
        document.title = originalTitle;
      };
    }
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Memuat formulir bimbingan akademik...</p>
        </div>
      </div>
    );
  }

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

  const lecturer: Lecturer | undefined = assignment?.lecturer;
  const lecturerName = lecturer ? getLecturerFullName(lecturer) : '-';
  const lecturerNidn = lecturer?.nidn || '-';
  const lecturerPhone = lecturer?.profile?.phone_number || '-';
  const lecturerEmail = lecturer?.profile?.email || '-';
  const lecturerSignature = lecturer?.signature_url || null;

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
            Nama File PDF: <strong className="font-mono text-slate-800">Form Bimbingan Akademik - {student.nim} - {student.profile?.full_name}.pdf</strong>
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
            fullName={student.profile?.full_name || '-'}
            classNameStr={student.class?.name || '05SIFM003'}
            programType={student.program_type || 'Reguler'}
            phoneNumber={student.profile?.phone_number || '-'}
            email={student.profile?.email || '-'}
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
