import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO_YAYASAN_BASE64, LOGO_UNPAM_BASE64, TTD_DOSEN_BASE64 } from '../assets/base64Logos';
import { formatDate } from '../lib/utils';
import { Student, ClassAdvisorAssignment } from '../types/database.types';
import { FormGuidanceItem } from '../features/report/components/GuidanceHistoryTable';

export interface StudentPdfData {
  student: Student;
  assignment?: ClassAdvisorAssignment | null;
  records: FormGuidanceItem[];
}

function formatTopicText(title: string, description?: string): string {
  if (!description || description.trim() === '') {
    return title;
  }

  const rawLines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length > 1) {
    return rawLines
      .map((line, idx) => {
        const hasBullet = /^[a-zA-Z0-9][\.\)]\s/.test(line) || /^[-•*]\s/.test(line);
        const bulletPrefix = hasBullet ? '' : `${String.fromCharCode(97 + idx)}. `;
        const cleanLine = hasBullet ? line.replace(/^[-•*]\s/, `${String.fromCharCode(97 + idx)}. `) : line;
        return `${bulletPrefix}${cleanLine}`;
      })
      .join('\n');
  }

  const sentences = description
    .split(/(?<=[.?!;])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > 1) {
    return sentences
      .map((sent, idx) => `${String.fromCharCode(97 + idx)}. ${sent}`)
      .join('\n');
  }

  return description;
}

export function generateStudentFormPdf(data: StudentPdfData): jsPDF {
  const { student, assignment, records } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;

  // 1. Logos & Institutional Header
  try {
    doc.addImage(LOGO_YAYASAN_BASE64, 'PNG', marginX + 1, 10, 26, 24);
  } catch (e) {
    console.warn('Could not add Yayasan logo to PDF', e);
  }

  try {
    doc.addImage(LOGO_UNPAM_BASE64, 'JPEG', pageWidth - marginX - 25, 10, 24, 24);
  } catch (e) {
    console.warn('Could not add UNPAM logo to PDF', e);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('YAYASAN SASMITA JAYA GROUP', pageWidth / 2, 13, { align: 'center' });

  doc.setFontSize(14.5);
  doc.text('UNIVERSITAS PAMULANG', pageWidth / 2, 18, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('FAKULTAS ILMU KOMPUTER', pageWidth / 2, 22.5, { align: 'center' });
  doc.text('PROGRAM STUDI SISTEM INFORMASI', pageWidth / 2, 27, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('SK MENDIKNAS NO. 136/D/O/2001', pageWidth / 2, 30.5, { align: 'center' });

  doc.setFontSize(7.5);
  doc.text('Kampus Pusat: Jln. Surya Kencana No. 1 Pamulang - Tangerang Selatan Telp. (021) 742 7010, 741 2566', pageWidth / 2, 34, { align: 'center' });
  doc.text('www.unpam.ac.id', pageWidth / 2, 37.5, { align: 'center' });

  // Double Horizontal Divider
  doc.setLineWidth(0.65);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, 40, pageWidth - marginX, 40);

  doc.setLineWidth(0.2);
  doc.line(marginX, 41, pageWidth - marginX, 41);

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11.5);
  doc.text('FORMULIR BIMBINGAN AKADEMIK', pageWidth / 2, 47, { align: 'center' });

  // 2. Dosen PA Table
  doc.setFontSize(9.5);
  doc.setFont('times', 'bold');
  doc.text('Dosen Pembimbing Akademik', marginX, 53);

  const lecturer = assignment?.lecturer;
  const lecturerName = lecturer?.profile?.full_name || 'Ahmad Asep Suhendi, S.Kom., M.Kom.';
  const lecturerNidn = lecturer?.nidn || '0411099202';
  const lecturerPhone = lecturer?.profile?.phone_number || '-';
  const lecturerEmail = lecturer?.profile?.email || 'dosen02975@unpam.ac.id';

  autoTable(doc, {
    startY: 55,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'plain',
    styles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 1.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      textColor: [0, 0, 0],
    },
    body: [
      [{ content: 'NIDN', styles: { fontStyle: 'normal', cellWidth: 32 } }, { content: ':', styles: { cellWidth: 4, halign: 'center' } }, { content: lecturerNidn }],
      [{ content: 'Nama', styles: { fontStyle: 'normal', cellWidth: 32 } }, { content: ':', styles: { cellWidth: 4, halign: 'center' } }, { content: lecturerName.toUpperCase() }],
      [{ content: 'No. Handphone', styles: { fontStyle: 'normal', cellWidth: 32 } }, { content: ':', styles: { cellWidth: 4, halign: 'center' } }, { content: lecturerPhone }],
      [{ content: 'Email', styles: { fontStyle: 'normal', cellWidth: 32 } }, { content: ':', styles: { cellWidth: 4, halign: 'center' } }, { content: lecturerEmail }],
    ],
  });

  // 3. Mahasiswa Table
  const stdStartY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Mahasiswa', marginX, stdStartY);

  const stdNim = student.nim || '-';
  const stdName = student.profile?.full_name || '-';
  const stdClass = student.class?.name || '05SIFM003';
  const stdProg = student.program_type || 'Reguler';
  const stdPhone = student.profile?.phone_number || '-';
  const stdEmail = student.profile?.email || '-';

  autoTable(doc, {
    startY: stdStartY + 2,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'plain',
    styles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 1.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      textColor: [0, 0, 0],
    },
    body: [
      [
        { content: 'NIM', styles: { fontStyle: 'normal', cellWidth: 22 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdNim, styles: { cellWidth: 64 } },
        { content: 'Reguler', styles: { fontStyle: 'normal', cellWidth: 26 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdProg },
      ],
      [
        { content: 'Nama', styles: { fontStyle: 'normal', cellWidth: 22 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdName.toUpperCase(), styles: { cellWidth: 64 } },
        { content: 'No. Handphone', styles: { fontStyle: 'normal', cellWidth: 26 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdPhone },
      ],
      [
        { content: 'Kelas', styles: { fontStyle: 'normal', cellWidth: 22 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdClass, styles: { cellWidth: 64 } },
        { content: 'E-Mail', styles: { fontStyle: 'normal', cellWidth: 26 } },
        { content: ':', styles: { cellWidth: 4, halign: 'center' } },
        { content: stdEmail },
      ],
    ],
  });

  // 4. Pelaksanaan Bimbingan Table
  const guidanceStartY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Pelaksanaan Bimbingan Akademik', marginX, guidanceStartY);

  const tableBody = records.map((rec, index) => {
    const formattedTopic = formatTopicText(rec.title, rec.topic_description);
    return [
      { content: `${index + 1}.`, styles: { halign: 'center' as const, valign: 'middle' as const } },
      { content: formatDate(rec.session_date), styles: { halign: 'center' as const, valign: 'middle' as const } },
      { content: formattedTopic, styles: { halign: 'left' as const, valign: 'middle' as const } },
      { content: '', styles: { halign: 'center' as const, valign: 'middle' as const, minCellHeight: 18 } },
    ];
  });

  autoTable(doc, {
    startY: guidanceStartY + 2,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'plain',
    styles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      font: 'times',
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      fillColor: [248, 248, 248],
    },
    head: [
      [
        { content: 'No', styles: { cellWidth: 12 } },
        { content: 'Tanggal Bimbingan', styles: { cellWidth: 36 } },
        { content: 'Topik Bimbingan' },
        { content: 'Paraf Dosen', styles: { cellWidth: 28 } },
      ],
    ],
    body: tableBody,
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        try {
          const imgWidth = 20;
          const imgHeight = 12;
          const x = data.cell.x + (data.cell.width - imgWidth) / 2;
          const y = data.cell.y + (data.cell.height - imgHeight) / 2;
          doc.addImage(TTD_DOSEN_BASE64, 'PNG', x, y, imgWidth, imgHeight);
        } catch (e) {
          console.warn('Could not draw signature image in cell', e);
        }
      }
    },
  });

  // 5. Official Footer
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text(
    '*Di akhir semester formulir ini wajib diserahkan ke prodi melalui dosen pembimbing akademik (format scan pdf).',
    marginX,
    finalY < 280 ? finalY : 285
  );

  return doc;
}