import { 
  Profile, 
  Lecturer, 
  Student, 
  AcademicYear, 
  ClassItem, 
  ClassAdvisorAssignment, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest, 
  GuidanceMessage 
} from '../types/database.types';

// Pure empty definitions - All dummy mock data removed in favor of Supabase database
export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [];
export const INITIAL_CLASSES: ClassItem[] = [];
export const INITIAL_PROFILES: Profile[] = [];
export const INITIAL_LECTURERS: Lecturer[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSIGNMENTS: ClassAdvisorAssignment[] = [];
export const INITIAL_CLASS_SESSIONS: ClassGuidanceSession[] = [];
export const INITIAL_PARTICIPANTS: ClassGuidanceParticipant[] = [];
export const INITIAL_INDIVIDUAL_REQUESTS: IndividualGuidanceRequest[] = [];
export const INITIAL_GUIDANCE_MESSAGES: GuidanceMessage[] = [];
