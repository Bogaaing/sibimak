import JSZip from 'jszip';
import { supabase } from '../lib/supabase';
import { dosenService } from './dosen.service';
import { generateStudentFormPdf, StudentPdfData } from './formPdfGenerator';
import { ClassAdvisorAssignment, Student } from '../types/database.types';
import { FormGuidanceItem } from '../features/report/components/GuidanceHistoryTable';

export interface BatchDownloadProgress {
  current: number;
  total: number;
  statusText: string;
  percentage: number;
}

export interface ValidatedStudentSummary {
  student: Student;
  assignment: ClassAdvisorAssignment | null;
  validRecords: FormGuidanceItem[];
  validCount: number;
}

/**
 * Sanitize filename to prevent OS filesystem issues
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

export const formBatchDownloadService = {
  /**
   * Fetch all students with their VALID guidance records for the lecturer
   */
  async getValidatedStudentsData(
    lecturerId?: string,
    lecturerEmail?: string,
    targetClassId?: string
  ): Promise<ValidatedStudentSummary[]> {
    // 1. Fetch lecturer assignments
    const assignments = await dosenService.getAssignments(lecturerId, lecturerEmail);
    const relevantAssignments = targetClassId && targetClassId !== 'ALL'
      ? assignments.filter((a) => a.class_id === targetClassId)
      : assignments;

    const classIds = relevantAssignments.map((a) => a.class_id).filter(Boolean) as string[];
    if (classIds.length === 0) return [];

    // 2. Fetch all students in these classes
    const students = await dosenService.getStudentsByClassIds(classIds);
    if (students.length === 0) return [];

    const studentIds = students.map((s) => s.id);

    // 3. Fetch Class Guidance Participations with status VALID (Form Bimbingan is strictly Class Guidance)
    const { data: rawParticipants } = await supabase
      .from('class_guidance_participants')
      .select('*, session:class_guidance_sessions(*)')
      .in('student_id', studentIds)
      .eq('validation_status', 'VALID');

    const participants = (rawParticipants || []) as any[];

    // 4. Map student summaries strictly from validated class guidance
    const summaries: ValidatedStudentSummary[] = [];

    for (const student of students) {
      const studentClassId = student.class_id;
      const assignment = relevantAssignments.find((a) => a.class_id === studentClassId) || null;

      const records: FormGuidanceItem[] = [];

      // Class participations
      const stdParts = participants.filter((p) => p.student_id === student.id);
      for (const p of stdParts) {
        records.push({
          id: p.id,
          session_date: p.session?.session_date || new Date().toISOString().split('T')[0],
          title: p.session?.title || 'Bimbingan Kelas',
          topic_description: p.session?.topic_description || '',
          validation_status: 'VALID',
          type: 'KELAS',
        });
      }

      // Sort records by date ascending
      records.sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

      summaries.push({
        student,
        assignment,
        validRecords: records,
        validCount: records.length,
      });
    }

    return summaries;
  },

  /**
   * Execute batch PDF generation and ZIP packaging
   */
  async downloadBatchValidatedForms(
    validatedItems: ValidatedStudentSummary[],
    options: {
      className?: string;
      onProgress?: (progress: BatchDownloadProgress) => void;
    } = {}
  ): Promise<{ success: boolean; totalFiles: number; zipName: string; error?: string }> {
    const { className = 'Semua_Kelas', onProgress } = options;

    // Filter only students with at least 1 VALID record
    const eligibleStudents = validatedItems.filter((item) => item.validCount > 0);

    if (eligibleStudents.length === 0) {
      return {
        success: false,
        totalFiles: 0,
        zipName: '',
        error: 'Belum ada form mahasiswa yang tervalidasi.',
      };
    }

    const zip = new JSZip();
    const total = eligibleStudents.length;

    onProgress?.({
      current: 0,
      total,
      statusText: 'Menyiapkan arsip formulir tervalidasi...',
      percentage: 5,
    });

    // Small delay to allow UI render
    await new Promise((r) => setTimeout(r, 60));

    for (let i = 0; i < total; i++) {
      const item = eligibleStudents[i];
      const studentName = item.student.profile?.full_name || 'Mahasiswa';
      const studentNim = item.student.nim || 'NIM';
      const studentClass = item.student.class?.name || className;

      onProgress?.({
        current: i + 1,
        total,
        statusText: `Memproses ${i + 1} dari ${total}: ${studentName} (${studentNim})...`,
        percentage: Math.round(5 + ((i + 1) / total) * 75),
      });

      // Non-blocking yield for browser smoothness
      await new Promise((r) => setTimeout(r, 20));

      const pdfData: StudentPdfData = {
        student: item.student,
        assignment: item.assignment,
        records: item.validRecords,
      };

      try {
        const doc = generateStudentFormPdf(pdfData);
        const pdfBlob = doc.output('blob');

        // File naming: {No}_{NIM}_{Nama}.pdf
        const fileSeq = String(i + 1).padStart(2, '0');
        const cleanName = sanitizeFileName(studentName);
        const fileName = `${fileSeq}_${studentNim}_${cleanName}.pdf`;

        // If downloading multiple classes, group into folders by class name
        if (className === 'Semua_Kelas' || !options.className) {
          const folderName = sanitizeFileName(studentClass);
          zip.folder(folderName)?.file(fileName, pdfBlob);
        } else {
          zip.file(fileName, pdfBlob);
        }
      } catch (genErr) {
        console.error(`Error generating PDF for ${studentName} (${studentNim}):`, genErr);
      }
    }

    // Compression step
    onProgress?.({
      current: total,
      total,
      statusText: 'Mengompres formulir ke dalam berkas ZIP...',
      percentage: 85,
    });

    await new Promise((r) => setTimeout(r, 40));

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        onProgress?.({
          current: total,
          total,
          statusText: `Mengompres: ${Math.round(metadata.percent)}%...`,
          percentage: Math.round(85 + (metadata.percent * 0.14)),
        });
      }
    );

    // Formulate clean zip filename
    const dateStr = new Date().toISOString().split('T')[0];
    const safeClass = sanitizeFileName(className);
    const zipName = `SiBiMa_Form_Bimbingan_Tervalidasi_${safeClass}_${dateStr}.zip`;

    onProgress?.({
      current: total,
      total,
      statusText: 'Selesai! Memulai unduhan otomatis...',
      percentage: 100,
    });

    // Trigger browser download
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke object URL after delay
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 5000);

    return {
      success: true,
      totalFiles: total,
      zipName,
    };
  },
};