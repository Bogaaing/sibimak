export type UserRole = 'admin' | 'dosen' | 'mahasiswa';

export type SemesterType = 'Ganjil' | 'Genap' | 'Pendek';

export type ProgramType = 'Reguler' | 'Non-Reguler';

export type ClassGuidanceStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'BELUM_KONFIRMASI' | 'HADIR' | 'TIDAK_HADIR' | 'IZIN';

export type ValidationStatus = 'PENDING' | 'VALID' | 'DITOLAK';

export type IndividualGuidanceStatus = 
  | 'DIAJUKAN' 
  | 'DIPROSES' 
  | 'PERLU_TINDAK_LANJUT' 
  | 'SELESAI' 
  | 'DITOLAK';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lecturer {
  id: string; // references Profile.id
  nidn: string;
  title_prefix: string | null;
  title_suffix: string | null;
  department: string;
  signature_url: string | null;
  created_at: string;
  profile?: Profile;
}

export interface AcademicYear {
  id: string;
  code: string;
  name: string;
  semester: SemesterType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  study_program: string;
  academic_level: string;
  academic_year_id: string | null;
  created_at: string;
  academic_year?: AcademicYear;
}

export interface Student {
  id: string; // references Profile.id
  nim: string;
  class_id: string | null;
  program_type: ProgramType;
  entry_year: string;
  created_at: string;
  profile?: Profile;
  class?: ClassItem;
}

export interface ClassAdvisorAssignment {
  id: string;
  lecturer_id: string;
  class_id: string;
  academic_year_id: string;
  sk_number: string | null;
  assignment_date: string;
  is_active: boolean;
  created_at: string;
  lecturer?: Lecturer;
  class?: ClassItem;
  academic_year?: AcademicYear;
}

export interface ClassGuidanceSession {
  id: string;
  assignment_id: string;
  session_date: string;
  title: string;
  topic_description: string;
  venue_or_link: string | null;
  status: ClassGuidanceStatus;
  created_at: string;
  assignment?: ClassAdvisorAssignment;
  participants_count?: number;
  confirmed_count?: number;
  validated_count?: number;
}

export interface ClassGuidanceParticipant {
  id: string;
  session_id: string;
  student_id: string;
  attendance_status: AttendanceStatus;
  validation_status: ValidationStatus;
  validated_at: string | null;
  validated_by: string | null;
  student_notes: string | null;
  lecturer_feedback: string | null;
  confirmed_at: string | null;
  created_at: string;
  student?: Student;
  session?: ClassGuidanceSession;
}

export interface IndividualGuidanceRequest {
  id: string;
  student_id: string;
  lecturer_id: string;
  academic_year_id: string;
  title: string;
  initial_problem: string;
  status: IndividualGuidanceStatus;
  validation_status: ValidationStatus;
  validated_at: string | null;
  guidance_date: string | null;
  action_plan: string | null;
  final_notes: string | null;
  completed_at: string | null;
  created_at: string;
  student?: Student;
  lecturer?: Lecturer;
  academic_year?: AcademicYear;
}

export interface GuidanceMessage {
  id: string;
  individual_guidance_id: string;
  sender_profile_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
  sender?: Profile;
}
