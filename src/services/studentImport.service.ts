import { store } from '../lib/store';
import { supabase } from '../lib/supabase';

export interface RawImportRow {
  nim: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export type RowValidationStatus = 
  | 'VALID'
  | 'DUPLIKAT_DATABASE'
  | 'DUPLIKAT_FILE'
  | 'NIM_KOSONG'
  | 'NAMA_KOSONG'
  | 'EMAIL_INVALID';

export interface ValidatedImportRow {
  rowNumber: number;
  nim: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: RowValidationStatus;
  statusMessage: string;
  existingClassInfo?: string;
}

export interface ImportValidationResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ValidatedImportRow[];
}

export const studentImportService = {
  /**
   * Download sample template (CSV and Excel-compatible XML with leading zero support)
   */
  downloadTemplate(format: 'csv' | 'xlsx' = 'csv', className: string = 'SI-5A') {
    if (format === 'xlsx') {
      // Excel-compatible SpreadsheetXML preserving string types for NIM and Phone
      const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="TextFormat">
   <NumberFormat ss:Format="@"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Template Mahasiswa">
  <Table>
   <Column ss:Width="120"/>
   <Column ss:Width="180"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">NIM</Data></Cell>
    <Cell><Data ss:Type="String">Nama Lengkap</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
    <Cell><Data ss:Type="String">No. Handphone</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">2210114001</Data></Cell>
    <Cell><Data ss:Type="String">Ahmad Fauzi</Data></Cell>
    <Cell><Data ss:Type="String">ahmad.fauzi@email.com</Data></Cell>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">081234567890</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">2210114002</Data></Cell>
    <Cell><Data ss:Type="String">Siti Aisyah</Data></Cell>
    <Cell><Data ss:Type="String">siti.aisyah@email.com</Data></Cell>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">081234567891</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">2210114003</Data></Cell>
    <Cell><Data ss:Type="String">Dwi Lestari</Data></Cell>
    <Cell><Data ss:Type="String">dwi.lestari@email.com</Data></Cell>
    <Cell ss:StyleID="TextFormat"><Data ss:Type="String">081234567892</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      this.triggerDownload(blob, `Template_Import_Mahasiswa_${className}.xls`);
    } else {
      const csvContent = `NIM,Nama Lengkap,Email,No. Handphone\n"2210114001","Ahmad Fauzi","ahmad.fauzi@email.com","081234567890"\n"2210114002","Siti Aisyah","siti.aisyah@email.com","081234567891"\n"2210114003","Dwi Lestari","dwi.lestari@email.com","081234567892"`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.triggerDownload(blob, `Template_Import_Mahasiswa_${className}.csv`);
    }
  },

  /**
   * Download Error Report for problematic rows
   */
  downloadErrorReport(errorRows: ValidatedImportRow[], className: string = 'Kelas') {
    let csv = `No,NIM,Nama Lengkap,Email,No. Handphone,Penyebab Error / Catatan\n`;
    errorRows.forEach((row, idx) => {
      csv += `${idx + 1},"${row.nim}","${row.fullName}","${row.email}","${row.phoneNumber}","${row.statusMessage}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `Error_Report_Import_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  },

  triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse text / file content into RawImportRows
   */
  parseFileContent(content: string): RawImportRow[] {
    const rows: RawImportRow[] = [];

    // Check if XML / HTML spreadsheet
    if (content.includes('<Workbook') || content.includes('<table') || content.includes('<Row')) {
      const rowMatches = content.match(/<Row[^>]*>([\s\S]*?)<\/Row>/gi) || [];
      // Skip header row
      for (let i = 1; i < rowMatches.length; i++) {
        const cellMatches = rowMatches[i].match(/<Data[^>]*>([\s\S]*?)<\/Data>/gi) || [];
        const cleanCells = cellMatches.map(c => c.replace(/<[^>]+>/g, '').trim());
        if (cleanCells.length > 0 && (cleanCells[0] || cleanCells[1])) {
          rows.push({
            nim: cleanCells[0] || '',
            fullName: cleanCells[1] || '',
            email: cleanCells[2] || '',
            phoneNumber: cleanCells[3] || ''
          });
        }
      }
      return rows;
    }

    // Standard CSV / TSV parsing
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    // Process from line 1 (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle comma or semicolon or tab
      const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      const cols: string[] = [];
      let inQuotes = false;
      let currentVal = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          cols.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      cols.push(currentVal.trim());

      const cleanCols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cleanCols.some(c => c.length > 0)) {
        rows.push({
          nim: cleanCols[0] || '',
          fullName: cleanCols[1] || '',
          email: cleanCols[2] || '',
          phoneNumber: cleanCols[3] || ''
        });
      }
    }

    return rows;
  },

  /**
   * Validate all imported rows against rules and database state
   */
  async validateRows(
    rawRows: RawImportRow[], 
    _targetClassId?: string,
    existingStudentsOverride?: any[],
    existingClassesOverride?: any[]
  ): Promise<ImportValidationResult> {
    let existingStudents = existingStudentsOverride;
    let existingClasses = existingClassesOverride;

    if (!existingStudents || !existingClasses) {
      try {
        const [stdRes, clsRes] = await Promise.all([
          supabase.from('students').select('id, nim, class_id'),
          supabase.from('classes').select('id, name')
        ]);
        existingStudents = stdRes.data || store.getStudents();
        existingClasses = clsRes.data || store.getClasses();
      } catch {
        existingStudents = store.getStudents();
        existingClasses = store.getClasses();
      }
    }

    const seenNimsInFile = new Set<string>();
    const validatedList: ValidatedImportRow[] = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 1;
      const cleanNim = row.nim.trim();
      const cleanName = row.fullName.trim();
      const cleanEmail = row.email.trim();
      const cleanPhone = row.phoneNumber.trim();

      // Rule 1: NIM wajib diisi
      if (!cleanNim) {
        validatedList.push({
          rowNumber: rowNum,
          nim: cleanNim,
          fullName: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          status: 'NIM_KOSONG',
          statusMessage: 'NIM wajib diisi'
        });
        return;
      }

      // Rule 2: Nama Lengkap wajib diisi
      if (!cleanName) {
        validatedList.push({
          rowNumber: rowNum,
          nim: cleanNim,
          fullName: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          status: 'NAMA_KOSONG',
          statusMessage: 'Nama Lengkap wajib diisi'
        });
        return;
      }

      // Rule 3: Format email valid jika diisi
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        validatedList.push({
          rowNumber: rowNum,
          nim: cleanNim,
          fullName: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          status: 'EMAIL_INVALID',
          statusMessage: 'Format email tidak valid'
        });
        return;
      }

      // Rule 4: Duplikasi di dalam file yang sama
      if (seenNimsInFile.has(cleanNim)) {
        validatedList.push({
          rowNumber: rowNum,
          nim: cleanNim,
          fullName: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          status: 'DUPLIKAT_FILE',
          statusMessage: 'NIM duplikat pada baris lain di file ini'
        });
        return;
      }
      seenNimsInFile.add(cleanNim);

      // Rule 5: Duplikasi di database
      const dbMatch = existingStudents!.find((s: any) => s.nim === cleanNim);
      if (dbMatch) {
        const studentClass = existingClasses!.find((c: any) => c.id === dbMatch.class_id);
        const className = studentClass?.name || 'Lainnya';
        validatedList.push({
          rowNumber: rowNum,
          nim: cleanNim,
          fullName: cleanName,
          email: cleanEmail,
          phoneNumber: cleanPhone,
          status: 'DUPLIKAT_DATABASE',
          statusMessage: `NIM sudah terdaftar di kelas ${className}`,
          existingClassInfo: className
        });
        return;
      }

      // If all passed: VALID
      validatedList.push({
        rowNumber: rowNum,
        nim: cleanNim,
        fullName: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        status: 'VALID',
        statusMessage: 'Data valid & siap diimport'
      });
    });

    const validCount = validatedList.filter(r => r.status === 'VALID').length;
    const errorCount = validatedList.length - validCount;

    return {
      totalRows: validatedList.length,
      validCount,
      errorCount,
      rows: validatedList
    };
  },

  /**
   * Commit valid rows to Supabase database for the specified class in bulk
   */
  async commitBatchImport(validRows: ValidatedImportRow[], classId: string, entryYear: string = '2024'): Promise<number> {
    const validItems = validRows.filter(r => r.status === 'VALID');
    if (validItems.length === 0) return 0;

    // 1. Fetch existing profiles & students to reuse existing IDs (prevents unique constraint collision)
    const nims = validItems.map(r => r.nim.trim());
    const emails = validItems.map(r => (r.email ? r.email.trim().toLowerCase() : `${r.nim.trim()}@mahasiswa.unpam.ac.id`));

    const [existingProfilesRes, existingStudentsRes] = await Promise.all([
      supabase.from('profiles').select('id, email').in('email', emails),
      supabase.from('students').select('id, nim').in('nim', nims)
    ]);

    const emailToId = new Map<string, string>();
    (existingProfilesRes.data || []).forEach(p => {
      if (p.email) emailToId.set(p.email.toLowerCase(), p.id);
    });

    const nimToId = new Map<string, string>();
    (existingStudentsRes.data || []).forEach(s => {
      if (s.nim) nimToId.set(s.nim, s.id);
    });

    const profilesBatch: any[] = [];
    const studentsBatch: any[] = [];
    const storeBatch: any[] = [];

    validItems.forEach(row => {
      const cleanNim = row.nim.trim();
      const defaultEmail = (row.email ? row.email.trim() : `${cleanNim}@mahasiswa.unpam.ac.id`).toLowerCase();
      
      // Determine consistent ID
      const studentId = nimToId.get(cleanNim) || emailToId.get(defaultEmail) || crypto.randomUUID();

      profilesBatch.push({
        id: studentId,
        email: defaultEmail,
        full_name: row.fullName.trim(),
        role: 'mahasiswa',
        phone_number: row.phoneNumber?.trim() || null,
        is_active: true
      });

      studentsBatch.push({
        id: studentId,
        nim: cleanNim,
        class_id: classId,
        program_type: 'Reguler',
        entry_year: entryYear
      });

      storeBatch.push({
        id: studentId,
        nim: cleanNim,
        full_name: row.fullName.trim(),
        email: defaultEmail,
        phone_number: row.phoneNumber?.trim() || '',
        class_id: classId,
        program_type: 'Reguler',
        entry_year: entryYear
      });
    });

    // 2. Batch upsert profiles in one query
    const { error: profErr } = await supabase.from('profiles').upsert(profilesBatch);
    if (profErr) {
      console.error('Error batch upserting profiles:', profErr);
      throw new Error(`Gagal menyimpan data profil ke Supabase: ${profErr.message}`);
    }

    // 3. Batch upsert students in one query
    const { error: stdErr } = await supabase.from('students').upsert(studentsBatch);
    if (stdErr) {
      console.error('Error batch upserting students:', stdErr);
      throw new Error(`Gagal menyimpan data mahasiswa ke kelas: ${stdErr.message}`);
    }

    // 4. Update in-memory store cache
    storeBatch.forEach(s => store.saveStudent(s));

    return studentsBatch.length;
  }
};
