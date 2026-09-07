import { supabase } from '../lib/supabase';
import { 
  Student, 
  ClassItem, 
  Lecturer, 
  ClassAdvisorAssignment, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest, 
  GuidanceMessage,
  AttendanceStatus,
  AcademicYear
} from '../types/database.types';

export interface StudentFullData {
  student: Student | null;
  academicClass: ClassItem | null;
  activeAcademicYear: AcademicYear | null;
  advisorAssignment: ClassAdvisorAssignment | null;
  advisorLecturer: Lecturer | null;
}

export interface StudentClassSessionItem {
  session: ClassGuidanceSession;
  participant?: ClassGuidanceParticipant;
}

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  link: string;
  created_at: string;
  type: 'bimbingan_kelas' | 'konsultasi';
}

export const mahasiswaService = {
  /**
   * Fetch complete academic profile for a student:
   * Student Record -> Class -> Academic Year -> Class Advisor Assignment -> Lecturer -> Lecturer Profile
   */
  async getStudentAcademicData(userId: string): Promise<StudentFullData> {
    // 1. Fetch Student Record with joined Class and Academic Year
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(*),
        class:classes(
          *,
          academic_year:academic_years(*)
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (studentError) {
      console.error('Error fetching student academic data:', studentError);
      throw studentError;
    }

    if (!student) {
      return {
        student: null,
        academicClass: null,
        activeAcademicYear: null,
        advisorAssignment: null,
        advisorLecturer: null
      };
    }

    const academicClass = (student.class as ClassItem) || null;
    let activeAcademicYear: AcademicYear | null = academicClass?.academic_year || null;

    // If academic year not directly joined, fetch active one
    if (!activeAcademicYear) {
      const { data: activeYear } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      activeAcademicYear = activeYear || null;
    }

    // 2. Fetch Class Advisor Assignment for the student's class
    let advisorAssignment: ClassAdvisorAssignment | null = null;
    let advisorLecturer: Lecturer | null = null;

    if (student.class_id) {
      const { data: assignment, error: assignmentError } = await supabase
        .from('class_advisor_assignments')
        .select(`
          *,
          lecturer:lecturers(
            *,
            profile:profiles(*)
          )
        `)
        .eq('class_id', student.class_id)
        .eq('is_active', true)
        .maybeSingle();

      if (assignmentError) {
        console.warn('Error fetching advisor assignment:', assignmentError);
      } else if (assignment) {
        advisorAssignment = assignment as ClassAdvisorAssignment;
        advisorLecturer = (assignment.lecturer as Lecturer) || null;
      }
    }

    return {
      student,
      academicClass,
      activeAcademicYear,
      advisorAssignment,
      advisorLecturer
    };
  },

  /**
   * Fetch Class Guidance Sessions for student's class assignment
   * and include the student's participation status
   */
  async getClassGuidanceSessions(studentId: string, classId?: string): Promise<StudentClassSessionItem[]> {
    if (!classId) return [];

    // Find active assignment for this class
    const { data: assignment } = await supabase
      .from('class_advisor_assignments')
      .select('id')
      .eq('class_id', classId)
      .eq('is_active', true)
      .maybeSingle();

    if (!assignment) return [];

    // Fetch guidance sessions for this assignment
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_guidance_sessions')
      .select('*')
      .eq('assignment_id', assignment.id)
      .order('session_date', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching guidance sessions:', sessionsError);
      throw sessionsError;
    }

    if (!sessions || sessions.length === 0) return [];

    // Fetch participant records for this student for these sessions
    const sessionIds = sessions.map(s => s.id);
    const { data: participants, error: partError } = await supabase
      .from('class_guidance_participants')
      .select('*')
      .eq('student_id', studentId)
      .in('session_id', sessionIds);

    if (partError) {
      console.error('Error fetching class guidance participants:', partError);
      throw partError;
    }

    const participantMap = new Map<string, ClassGuidanceParticipant>();
    participants?.forEach(p => {
      participantMap.set(p.session_id, p);
    });

    return sessions.map(session => ({
      session,
      participant: participantMap.get(session.id)
    }));
  },

  /**
   * Update student attendance confirmation & notes for a session
   */
  async confirmClassGuidanceAttendance(
    sessionId: string,
    studentId: string,
    attendanceStatus: AttendanceStatus,
    studentNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('class_guidance_participants')
      .update({
        attendance_status: attendanceStatus,
        student_notes: studentNotes || null,
        confirmed_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error confirming attendance:', error);
      throw error;
    }
  },

  /**
   * Fetch Individual Guidance Requests for student
   */
  async getIndividualGuidanceRequests(studentId: string): Promise<IndividualGuidanceRequest[]> {
    const { data, error } = await supabase
      .from('individual_guidance_requests')
      .select(`
        *,
        lecturer:lecturers(
          *,
          profile:profiles(*)
        ),
        academic_year:academic_years(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching individual guidance requests:', error);
      throw error;
    }

    return (data as IndividualGuidanceRequest[]) || [];
  },

  /**
   * Create a new Individual Guidance Request
   */
  async createIndividualGuidanceRequest(payload: {
    student_id: string;
    lecturer_id: string;
    academic_year_id: string;
    title: string;
    initial_problem: string;
  }): Promise<IndividualGuidanceRequest> {
    const { data, error } = await supabase
      .from('individual_guidance_requests')
      .insert({
        student_id: payload.student_id,
        lecturer_id: payload.lecturer_id,
        academic_year_id: payload.academic_year_id,
        title: payload.title,
        initial_problem: payload.initial_problem,
        status: 'DIAJUKAN',
        validation_status: 'PENDING'
      })
      .select(`
        *,
        lecturer:lecturers(
          *,
          profile:profiles(*)
        )
      `)
      .single();

    if (error) {
      console.error('Error creating individual guidance request:', error);
      throw error;
    }

    return data as IndividualGuidanceRequest;
  },

  /**
   * Fetch Messages for an Individual Guidance Request
   */
  async getGuidanceMessages(requestId: string): Promise<GuidanceMessage[]> {
    const { data, error } = await supabase
      .from('guidance_messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('individual_guidance_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching guidance messages:', error);
      throw error;
    }

    return (data as GuidanceMessage[]) || [];
  },

  /**
   * Send a Message in an Individual Guidance Request
   */
  async sendGuidanceMessage(payload: {
    individual_guidance_id: string;
    sender_profile_id: string;
    message: string;
  }): Promise<GuidanceMessage> {
    const { data, error } = await supabase
      .from('guidance_messages')
      .insert({
        individual_guidance_id: payload.individual_guidance_id,
        sender_profile_id: payload.sender_profile_id,
        message: payload.message
      })
      .select(`
        *,
        sender:profiles(*)
      `)
      .single();

    if (error) {
      console.error('Error sending guidance message:', error);
      throw error;
    }

    return data as GuidanceMessage;
  },

  /**
   * Dynamically fetch notifications for student:
   * - Class guidance sessions pending attendance confirmation
   * - Individual consultations updated by lecturer or with new responses
   */
  async getNotifications(studentId: string, classId?: string): Promise<StudentNotificationItem[]> {
    const notifs: StudentNotificationItem[] = [];

    try {
      // 1. Check unconfirmed class guidance
      if (classId) {
        const classSessions = await this.getClassGuidanceSessions(studentId, classId);
        classSessions.forEach(item => {
          if (
            item.participant?.attendance_status === 'BELUM_KONFIRMASI' &&
            item.session.status === 'PUBLISHED'
          ) {
            notifs.push({
              id: `notif-cgs-${item.session.id}`,
              title: item.session.title || 'Bimbingan Kelas Tersedia',
              message: 'Dosen PA telah menjadwalkan bimbingan kelas. Silakan konfirmasi kehadiran Anda.',
              link: '/mahasiswa/bimbingan',
              created_at: item.session.created_at,
              type: 'bimbingan_kelas'
            });
          }
        });
      }

      // 2. Check individual consultations with lecturer response or status change
      const individualRequests = await this.getIndividualGuidanceRequests(studentId);
      individualRequests.forEach(req => {
        if (req.status === 'DIPROSES' || req.status === 'SELESAI' || req.action_plan || req.final_notes) {
          notifs.push({
            id: `notif-ind-${req.id}`,
            title: `Konsultasi: ${req.title}`,
            message: req.status === 'SELESAI' 
              ? 'Konsultasi individu telah selesai divalidasi oleh Dosen PA.' 
              : 'Dosen PA telah memberikan arahan atau respons pada pengajuan konsultasi Anda.',
            link: '/mahasiswa/konsultasi',
            created_at: req.completed_at || req.created_at,
            type: 'konsultasi'
          });
        }
      });
    } catch (err) {
      console.warn('Error computing student notifications:', err);
    }

    // Sort descending by date
    notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return notifs;
  }
};
