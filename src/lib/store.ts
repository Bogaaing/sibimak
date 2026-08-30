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
  GuidanceMessage,
  AttendanceStatus,
  IndividualGuidanceStatus,
  ValidationStatus
} from '../types/database.types';

import {
  INITIAL_ACADEMIC_YEARS,
  INITIAL_CLASSES,
  INITIAL_PROFILES,
  INITIAL_LECTURERS,
  INITIAL_STUDENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_CLASS_SESSIONS,
  INITIAL_PARTICIPANTS,
  INITIAL_INDIVIDUAL_REQUESTS,
  INITIAL_GUIDANCE_MESSAGES
} from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  PROFILES: 'sibimak_profiles_v2',
  LECTURERS: 'sibimak_lecturers_v2',
  STUDENTS: 'sibimak_students_v2',
  ACADEMIC_YEARS: 'sibimak_academic_years_v2',
  CLASSES: 'sibimak_classes_v2',
  ASSIGNMENTS: 'sibimak_assignments_v2',
  CLASS_SESSIONS: 'sibimak_class_sessions_v2',
  PARTICIPANTS: 'sibimak_participants_v2',
  INDIVIDUAL_REQUESTS: 'sibimak_individual_requests_v2',
  MESSAGES: 'sibimak_messages_v2',
  CURRENT_USER_ID: 'sibimak_current_user_id',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

class AppDataStore {
  // Profiles
  getProfiles(): Profile[] {
    return getStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  saveProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = { ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push({ ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.PROFILES, profiles);
  }

  // Academic Years
  getAcademicYears(): AcademicYear[] {
    return getStorage(STORAGE_KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS);
  }

  getActiveAcademicYear(): AcademicYear | undefined {
    return this.getAcademicYears().find(ay => ay.is_active) || this.getAcademicYears()[0];
  }

  saveAcademicYear(data: Partial<AcademicYear>): AcademicYear {
    const years = this.getAcademicYears();
    if (data.id) {
      const idx = years.findIndex(y => y.id === data.id);
      if (idx >= 0) {
        years[idx] = { ...years[idx], ...data } as AcademicYear;
        if (data.is_active) {
          years.forEach((y, i) => { if (i !== idx) y.is_active = false; });
        }
        setStorage(STORAGE_KEYS.ACADEMIC_YEARS, years);
        return years[idx];
      }
    }
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      code: data.code || `TA-${Date.now()}`,
      name: data.name || 'Tahun Akademik Baru',
      semester: data.semester || 'Ganjil',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || new Date().toISOString().split('T')[0],
      is_active: data.is_active || false,
      created_at: new Date().toISOString()
    };
    if (newYear.is_active) {
      years.forEach(y => y.is_active = false);
    }
    years.push(newYear);
    setStorage(STORAGE_KEYS.ACADEMIC_YEARS, years);
    return newYear;
  }

  setActiveAcademicYear(id: string): void {
    const years = this.getAcademicYears();
    years.forEach(y => {
      y.is_active = y.id === id;
    });
    setStorage(STORAGE_KEYS.ACADEMIC_YEARS, years);
  }

  deleteAcademicYear(id: string): void {
    let years = this.getAcademicYears();
    years = years.filter(y => y.id !== id);
    setStorage(STORAGE_KEYS.ACADEMIC_YEARS, years);
  }

  // Classes
  getClasses(): ClassItem[] {
    const classes = getStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const academicYears = this.getAcademicYears();
    return classes.map(c => ({
      ...c,
      academic_year: academicYears.find(ay => ay.id === c.academic_year_id)
    }));
  }

  saveClass(data: Partial<ClassItem>): ClassItem {
    const classes = getStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    if (data.id) {
      const idx = classes.findIndex(c => c.id === data.id);
      if (idx >= 0) {
        classes[idx] = { ...classes[idx], ...data } as ClassItem;
        setStorage(STORAGE_KEYS.CLASSES, classes);
        return classes[idx];
      }
    }
    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      name: data.name || 'Kelas Baru',
      study_program: data.study_program || 'Sistem Informasi',
      academic_level: data.academic_level || 'S1',
      academic_year_id: data.academic_year_id || this.getActiveAcademicYear()?.id || null,
      created_at: new Date().toISOString()
    };
    classes.push(newClass);
    setStorage(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  }

  deleteClass(id: string): void {
    let classes = getStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    classes = classes.filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.CLASSES, classes);
  }

  // Lecturers
  getLecturers(): (Lecturer & { profile: Profile })[] {
    const lecturers = getStorage<Lecturer[]>(STORAGE_KEYS.LECTURERS, INITIAL_LECTURERS);
    const profiles = this.getProfiles();
    return lecturers.map(l => ({
      ...l,
      profile: profiles.find(p => p.id === l.id) || {
        id: l.id,
        email: 'dosen@kampus.ac.id',
        full_name: 'Dosen',
        role: 'dosen',
        phone_number: null,
        avatar_url: null,
        is_active: true,
        created_at: l.created_at,
        updated_at: l.created_at
      }
    }));
  }

  saveLecturer(data: {
    id?: string;
    full_name: string;
    email: string;
    phone_number?: string;
    nidn: string;
    title_prefix?: string;
    title_suffix?: string;
    department: string;
    signature_url?: string;
  }): Lecturer {
    const id = data.id || `usr-dosen-${Date.now()}`;
    const profiles = this.getProfiles();
    const lecturers = getStorage<Lecturer[]>(STORAGE_KEYS.LECTURERS, INITIAL_LECTURERS);

    // Profile
    const profIdx = profiles.findIndex(p => p.id === id);
    const newProfile: Profile = {
      id,
      email: data.email,
      full_name: data.full_name,
      role: 'dosen',
      phone_number: data.phone_number || null,
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (profIdx >= 0) profiles[profIdx] = newProfile; else profiles.push(newProfile);
    setStorage(STORAGE_KEYS.PROFILES, profiles);

    // Lecturer
    const lecIdx = lecturers.findIndex(l => l.id === id);
    const newLec: Lecturer = {
      id,
      nidn: data.nidn,
      title_prefix: data.title_prefix || null,
      title_suffix: data.title_suffix || null,
      department: data.department,
      signature_url: data.signature_url || '/assets/ahmadasepsuhendi-ttd.png',
      created_at: new Date().toISOString()
    };
    if (lecIdx >= 0) lecturers[lecIdx] = newLec; else lecturers.push(newLec);
    setStorage(STORAGE_KEYS.LECTURERS, lecturers);

    return newLec;
  }

  deleteLecturer(id: string): void {
    let lecturers = getStorage<Lecturer[]>(STORAGE_KEYS.LECTURERS, INITIAL_LECTURERS);
    lecturers = lecturers.filter(l => l.id !== id);
    setStorage(STORAGE_KEYS.LECTURERS, lecturers);

    let profiles = this.getProfiles();
    profiles = profiles.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PROFILES, profiles);
  }

  // Students
  getStudents(): (Student & { profile: Profile; class?: ClassItem })[] {
    const students = getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const profiles = this.getProfiles();
    const classes = this.getClasses();
    return students.map(s => ({
      ...s,
      profile: profiles.find(p => p.id === s.id) || {
        id: s.id,
        email: 'mhs@kampus.ac.id',
        full_name: 'Mahasiswa',
        role: 'mahasiswa',
        phone_number: null,
        avatar_url: null,
        is_active: true,
        created_at: s.created_at,
        updated_at: s.created_at
      },
      class: classes.find(c => c.id === s.class_id)
    }));
  }

  saveStudent(data: {
    id?: string;
    full_name: string;
    email: string;
    phone_number?: string;
    nim: string;
    class_id?: string;
    program_type?: 'Reguler' | 'Non-Reguler';
    entry_year?: string;
  }): Student {
    const id = data.id || `usr-mhs-${Date.now()}`;
    const profiles = this.getProfiles();
    const students = getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

    // Profile
    const profIdx = profiles.findIndex(p => p.id === id);
    const newProfile: Profile = {
      id,
      email: data.email,
      full_name: data.full_name,
      role: 'mahasiswa',
      phone_number: data.phone_number || null,
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (profIdx >= 0) profiles[profIdx] = newProfile; else profiles.push(newProfile);
    setStorage(STORAGE_KEYS.PROFILES, profiles);

    // Student
    const stuIdx = students.findIndex(s => s.id === id);
    const newStudent: Student = {
      id,
      nim: data.nim,
      class_id: data.class_id || null,
      program_type: data.program_type || 'Reguler',
      entry_year: data.entry_year || '2024',
      created_at: new Date().toISOString()
    };
    if (stuIdx >= 0) students[stuIdx] = newStudent; else students.push(newStudent);
    setStorage(STORAGE_KEYS.STUDENTS, students);

    return newStudent;
  }

  deleteStudent(id: string): void {
    let students = getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    students = students.filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.STUDENTS, students);

    let profiles = this.getProfiles();
    profiles = profiles.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PROFILES, profiles);
  }

  // Advisor Assignments
  getAssignments(): ClassAdvisorAssignment[] {
    const assignments = getStorage<ClassAdvisorAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const lecturers = this.getLecturers();
    const classes = this.getClasses();
    const academicYears = this.getAcademicYears();

    return assignments.map(a => ({
      ...a,
      lecturer: lecturers.find(l => l.id === a.lecturer_id),
      class: classes.find(c => c.id === a.class_id),
      academic_year: academicYears.find(ay => ay.id === a.academic_year_id)
    }));
  }

  deleteAssignment(id: string): void {
    let assignments = getStorage<ClassAdvisorAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    assignments = assignments.filter(a => a.id !== id);
    setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }

  saveAssignment(data: {
    id?: string;
    lecturer_id: string;
    class_id: string;
    academic_year_id: string;
    sk_number?: string;
  }): ClassAdvisorAssignment {
    const assignments = getStorage<ClassAdvisorAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    if (data.id) {
      const idx = assignments.findIndex(a => a.id === data.id);
      if (idx >= 0) {
        assignments[idx] = { ...assignments[idx], ...data } as ClassAdvisorAssignment;
        setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
        return assignments[idx];
      }
    }
    const existing = assignments.findIndex(a => a.class_id === data.class_id && a.academic_year_id === data.academic_year_id);
    const newAsg: ClassAdvisorAssignment = {
      id: `asg-${Date.now()}`,
      lecturer_id: data.lecturer_id,
      class_id: data.class_id,
      academic_year_id: data.academic_year_id,
      sk_number: data.sk_number || null,
      assignment_date: new Date().toISOString().split('T')[0],
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (existing >= 0) {
      assignments[existing] = newAsg;
    } else {
      assignments.push(newAsg);
    }
    setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAsg;
  }

  // Class Guidance Sessions & Participants
  getClassSessions(): ClassGuidanceSession[] {
    const sessions = getStorage<ClassGuidanceSession[]>(STORAGE_KEYS.CLASS_SESSIONS, INITIAL_CLASS_SESSIONS);
    const assignments = this.getAssignments();
    const participants = this.getParticipants();

    return sessions.map(s => {
      const pList = participants.filter(p => p.session_id === s.id);
      return {
        ...s,
        assignment: assignments.find(a => a.id === s.assignment_id),
        participants_count: pList.length,
        confirmed_count: pList.filter(p => p.attendance_status !== 'BELUM_KONFIRMASI').length,
        validated_count: pList.filter(p => p.validation_status === 'VALID').length
      };
    });
  }

  getParticipants(): ClassGuidanceParticipant[] {
    const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
    const students = this.getStudents();
    return participants.map(p => ({
      ...p,
      student: students.find(s => s.id === p.student_id)
    }));
  }

  createClassSession(data: {
    assignment_id: string;
    session_date: string;
    title: string;
    topic_description: string;
    venue_or_link?: string;
  }): ClassGuidanceSession {
    const sessions = getStorage<ClassGuidanceSession[]>(STORAGE_KEYS.CLASS_SESSIONS, INITIAL_CLASS_SESSIONS);
    const sessionId = `cgs-${Date.now()}`;
    const newSession: ClassGuidanceSession = {
      id: sessionId,
      assignment_id: data.assignment_id,
      session_date: data.session_date,
      title: data.title,
      topic_description: data.topic_description,
      venue_or_link: data.venue_or_link || null,
      status: 'PUBLISHED',
      created_at: new Date().toISOString()
    };
    sessions.unshift(newSession);
    setStorage(STORAGE_KEYS.CLASS_SESSIONS, sessions);

    // Auto populate participants for this class with PENDING validation
    const assignment = this.getAssignments().find(a => a.id === data.assignment_id);
    if (assignment && assignment.class_id) {
      const studentsInClass = this.getStudents().filter(s => s.class_id === assignment.class_id);
      const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
      
      studentsInClass.forEach(student => {
        participants.push({
          id: `part-${Date.now()}-${student.id}`,
          session_id: sessionId,
          student_id: student.id,
          attendance_status: 'BELUM_KONFIRMASI',
          validation_status: 'PENDING',
          validated_at: null,
          validated_by: null,
          student_notes: null,
          lecturer_feedback: null,
          confirmed_at: null,
          created_at: new Date().toISOString()
        });
      });
      setStorage(STORAGE_KEYS.PARTICIPANTS, participants);
    }

    return newSession;
  }

  updateParticipantAttendance(
    sessionId: string, 
    studentId: string, 
    status: AttendanceStatus, 
    studentNotes?: string
  ): void {
    const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
    let p = participants.find(item => item.session_id === sessionId && item.student_id === studentId);
    if (p) {
      p.attendance_status = status;
      if (studentNotes !== undefined) p.student_notes = studentNotes;
      p.confirmed_at = new Date().toISOString();
    } else {
      p = {
        id: `part-${Date.now()}`,
        session_id: sessionId,
        student_id: studentId,
        attendance_status: status,
        validation_status: 'PENDING',
        validated_at: null,
        validated_by: null,
        student_notes: studentNotes || null,
        lecturer_feedback: null,
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      participants.push(p);
    }
    setStorage(STORAGE_KEYS.PARTICIPANTS, participants);
  }

  validateParticipant(
    sessionId: string,
    studentId: string,
    lecturerId: string,
    lecturerFeedback?: string
  ): void {
    const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
    const p = participants.find(item => item.session_id === sessionId && item.student_id === studentId);
    if (p) {
      p.validation_status = 'VALID';
      p.validated_at = new Date().toISOString();
      p.validated_by = lecturerId;
      if (lecturerFeedback) {
        p.lecturer_feedback = lecturerFeedback;
      }
      setStorage(STORAGE_KEYS.PARTICIPANTS, participants);
    }
  }

  validateAllSessionParticipants(
    sessionId: string,
    lecturerId: string
  ): void {
    const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
    participants.forEach(p => {
      if (p.session_id === sessionId && p.attendance_status !== 'BELUM_KONFIRMASI') {
        p.validation_status = 'VALID';
        p.validated_at = new Date().toISOString();
        p.validated_by = lecturerId;
      }
    });
    setStorage(STORAGE_KEYS.PARTICIPANTS, participants);
  }

  updateLecturerFeedback(
    sessionId: string,
    studentId: string,
    feedback: string
  ): void {
    const participants = getStorage<ClassGuidanceParticipant[]>(STORAGE_KEYS.PARTICIPANTS, INITIAL_PARTICIPANTS);
    const p = participants.find(item => item.session_id === sessionId && item.student_id === studentId);
    if (p) {
      p.lecturer_feedback = feedback;
      setStorage(STORAGE_KEYS.PARTICIPANTS, participants);
    }
  }

  // Individual Guidance Requests
  getIndividualRequests(): IndividualGuidanceRequest[] {
    const requests = getStorage<IndividualGuidanceRequest[]>(STORAGE_KEYS.INDIVIDUAL_REQUESTS, INITIAL_INDIVIDUAL_REQUESTS);
    const students = this.getStudents();
    const lecturers = this.getLecturers();
    const academicYears = this.getAcademicYears();

    return requests.map(r => ({
      ...r,
      student: students.find(s => s.id === r.student_id),
      lecturer: lecturers.find(l => l.id === r.lecturer_id),
      academic_year: academicYears.find(ay => ay.id === r.academic_year_id)
    }));
  }

  createIndividualRequest(data: {
    student_id: string;
    lecturer_id: string;
    academic_year_id: string;
    title: string;
    initial_problem: string;
  }): IndividualGuidanceRequest {
    const requests = getStorage<IndividualGuidanceRequest[]>(STORAGE_KEYS.INDIVIDUAL_REQUESTS, INITIAL_INDIVIDUAL_REQUESTS);
    const newReq: IndividualGuidanceRequest = {
      id: `igr-${Date.now()}`,
      student_id: data.student_id,
      lecturer_id: data.lecturer_id,
      academic_year_id: data.academic_year_id,
      title: data.title,
      initial_problem: data.initial_problem,
      status: 'DIAJUKAN',
      validation_status: 'PENDING',
      validated_at: null,
      guidance_date: null,
      action_plan: null,
      final_notes: null,
      completed_at: null,
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    setStorage(STORAGE_KEYS.INDIVIDUAL_REQUESTS, requests);
    return newReq;
  }

  updateIndividualRequestStatus(
    id: string,
    status: IndividualGuidanceStatus,
    updates: {
      guidance_date?: string | null;
      action_plan?: string | null;
      final_notes?: string | null;
    }
  ): void {
    const requests = getStorage<IndividualGuidanceRequest[]>(STORAGE_KEYS.INDIVIDUAL_REQUESTS, INITIAL_INDIVIDUAL_REQUESTS);
    const idx = requests.findIndex(r => r.id === id);
    if (idx >= 0) {
      const isFinished = status === 'SELESAI';
      requests[idx] = {
        ...requests[idx],
        status,
        ...updates,
        validation_status: isFinished ? 'VALID' : requests[idx].validation_status,
        validated_at: isFinished ? new Date().toISOString() : requests[idx].validated_at,
        completed_at: isFinished ? new Date().toISOString() : requests[idx].completed_at
      };
      setStorage(STORAGE_KEYS.INDIVIDUAL_REQUESTS, requests);
    }
  }

  // Guidance Messages
  getMessages(individualGuidanceId: string): GuidanceMessage[] {
    const messages = getStorage<GuidanceMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_GUIDANCE_MESSAGES);
    const profiles = this.getProfiles();
    return messages
      .filter(m => m.individual_guidance_id === individualGuidanceId)
      .map(m => ({
        ...m,
        sender: profiles.find(p => p.id === m.sender_profile_id)
      }));
  }

  sendMessage(individualGuidanceId: string, senderProfileId: string, message: string): GuidanceMessage {
    const messages = getStorage<GuidanceMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_GUIDANCE_MESSAGES);
    const newMsg: GuidanceMessage = {
      id: `msg-${Date.now()}`,
      individual_guidance_id: individualGuidanceId,
      sender_profile_id: senderProfileId,
      message,
      attachment_url: null,
      created_at: new Date().toISOString()
    };
    messages.push(newMsg);
    setStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  }
}

export const store = new AppDataStore();
