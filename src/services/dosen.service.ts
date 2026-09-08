import { supabase } from '../lib/supabase';
import { 
  ClassAdvisorAssignment, 
  Student, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest,
  IndividualGuidanceStatus,
  GuidanceMessage 
} from '../types/database.types';

export const dosenService = {
  /**
   * Fetch all class advisor assignments for a lecturer by lecturerId or email
   */
  async getAssignments(lecturerId?: string, lecturerEmail?: string): Promise<ClassAdvisorAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('class_advisor_assignments')
        .select(`
          *,
          class:classes(*),
          academic_year:academic_years(*),
          lecturer:lecturers(*, profile:profiles(*))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching class_advisor_assignments:', error);
        return [];
      }

      const all = (data || []) as ClassAdvisorAssignment[];
      if (!lecturerId && !lecturerEmail) return all;

      const emailLower = lecturerEmail?.toLowerCase();

      return all.filter((a) => {
        if (lecturerId && a.lecturer_id === lecturerId) return true;
        if (emailLower && a.lecturer?.profile?.email?.toLowerCase() === emailLower) return true;
        return false;
      });
    } catch (err) {
      console.error('Unexpected error in getAssignments:', err);
      return [];
    }
  },

  /**
   * Fetch students belonging to the specified class IDs
   */
  async getStudentsByClassIds(classIds: string[]): Promise<Student[]> {
    if (!classIds || classIds.length === 0) return [];
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(*),
          class:classes(*)
        `)
        .in('class_id', classIds)
        .order('nim', { ascending: true });

      if (error) {
        console.error('Error fetching students by classIds:', error);
        return [];
      }

      return (data || []) as Student[];
    } catch (err) {
      console.error('Unexpected error in getStudentsByClassIds:', err);
      return [];
    }
  },

  /**
   * Fetch guidance sessions for given assignment IDs
   */
  async getClassSessions(assignmentIds: string[]): Promise<ClassGuidanceSession[]> {
    if (!assignmentIds || assignmentIds.length === 0) return [];
    try {
      const { data, error } = await supabase
        .from('class_guidance_sessions')
        .select(`
          *,
          assignment:class_advisor_assignments(*, class:classes(*))
        `)
        .in('assignment_id', assignmentIds)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching class_guidance_sessions:', error);
        return [];
      }

      return (data || []) as ClassGuidanceSession[];
    } catch (err) {
      console.error('Unexpected error in getClassSessions:', err);
      return [];
    }
  },

  /**
   * Fetch participants for given session IDs
   */
  async getParticipants(sessionIds: string[]): Promise<ClassGuidanceParticipant[]> {
    if (!sessionIds || sessionIds.length === 0) return [];
    try {
      const { data, error } = await supabase
        .from('class_guidance_participants')
        .select(`
          *,
          student:students(*, profile:profiles(*)),
          session:class_guidance_sessions(*)
        `)
        .in('session_id', sessionIds);

      if (error) {
        console.error('Error fetching class_guidance_participants:', error);
        return [];
      }

      return (data || []) as ClassGuidanceParticipant[];
    } catch (err) {
      console.error('Unexpected error in getParticipants:', err);
      return [];
    }
  },

  /**
   * Fetch individual guidance requests for a lecturer
   */
  async getIndividualRequests(lecturerId?: string, lecturerEmail?: string): Promise<IndividualGuidanceRequest[]> {
    try {
      const { data, error } = await supabase
        .from('individual_guidance_requests')
        .select(`
          *,
          student:students(*, profile:profiles(*), class:classes(*)),
          lecturer:lecturers(*, profile:profiles(*)),
          academic_year:academic_years(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching individual_guidance_requests:', error);
        return [];
      }

      const all = (data || []) as IndividualGuidanceRequest[];
      if (!lecturerId && !lecturerEmail) return all;

      const emailLower = lecturerEmail?.toLowerCase();

      return all.filter((r) => {
        if (lecturerId && r.lecturer_id === lecturerId) return true;
        if (emailLower && r.lecturer?.profile?.email?.toLowerCase() === emailLower) return true;
        return false;
      });
    } catch (err) {
      console.error('Unexpected error in getIndividualRequests:', err);
      return [];
    }
  },

  /**
   * Create a new class guidance session and ensure participants are populated
   */
  async createClassSession(payload: {
    assignment_id: string;
    session_date: string;
    title: string;
    topic_description: string;
    venue_or_link?: string;
  }): Promise<ClassGuidanceSession | null> {
    try {
      const { data, error } = await supabase
        .from('class_guidance_sessions')
        .insert({
          assignment_id: payload.assignment_id,
          session_date: payload.session_date,
          title: payload.title,
          topic_description: payload.topic_description,
          venue_or_link: payload.venue_or_link || null,
          status: 'PUBLISHED'
        })
        .select(`
          *,
          assignment:class_advisor_assignments(*, class:classes(*))
        `)
        .single();

      if (error) {
        console.error('Error inserting class session:', error);
        throw error;
      }

      const session = data as ClassGuidanceSession;
      const { data: existingParts } = await supabase
        .from('class_guidance_participants')
        .select('id')
        .eq('session_id', session.id);

      if (!existingParts || existingParts.length === 0) {
        const { data: asg } = await supabase
          .from('class_advisor_assignments')
          .select('class_id')
          .eq('id', payload.assignment_id)
          .single();

        if (asg?.class_id) {
          const { data: studentsInClass } = await supabase
            .from('students')
            .select('id')
            .eq('class_id', asg.class_id);

          if (studentsInClass && studentsInClass.length > 0) {
            const partPayloads = studentsInClass.map((s) => ({
              session_id: session.id,
              student_id: s.id,
              attendance_status: 'BELUM_KONFIRMASI',
              validation_status: 'PENDING'
            }));
            await supabase.from('class_guidance_participants').insert(partPayloads);
          }
        }
      }

      return session;
    } catch (err) {
      console.error('Unexpected error in createClassSession:', err);
      throw err;
    }
  },

  /**
   * Validate a single participant
   */
  async validateParticipant(
    participantId: string, 
    lecturerId: string, 
    feedback?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('class_guidance_participants')
        .update({
          validation_status: 'VALID',
          validated_at: new Date().toISOString(),
          validated_by: lecturerId,
          lecturer_feedback: feedback || null
        })
        .eq('id', participantId);

      if (error) {
        console.error('Error validating participant:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error in validateParticipant:', err);
      throw err;
    }
  },

  /**
   * Validate all participants with attendance_status === 'HADIR' in a session
   */
  async validateAllSessionParticipants(sessionId: string, lecturerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('class_guidance_participants')
        .update({
          validation_status: 'VALID',
          validated_at: new Date().toISOString(),
          validated_by: lecturerId
        })
        .eq('session_id', sessionId)
        .eq('attendance_status', 'HADIR');

      if (error) {
        console.error('Error mass-validating session participants:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error in validateAllSessionParticipants:', err);
      throw err;
    }
  },

  /**
   * Fetch messages for an individual guidance request
   */
  async getMessages(individualGuidanceId: string): Promise<GuidanceMessage[]> {
    try {
      const { data, error } = await supabase
        .from('guidance_messages')
        .select('*, sender:profiles(*)')
        .eq('individual_guidance_id', individualGuidanceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching guidance_messages:', error);
        return [];
      }
      return (data || []) as GuidanceMessage[];
    } catch (err) {
      console.error('Unexpected error in getMessages:', err);
      return [];
    }
  },

  /**
   * Send a message in individual guidance
   */
  async sendMessage(individualGuidanceId: string, senderProfileId: string, message: string): Promise<GuidanceMessage | null> {
    try {
      const { data, error } = await supabase
        .from('guidance_messages')
        .insert({
          individual_guidance_id: individualGuidanceId,
          sender_profile_id: senderProfileId,
          message,
          attachment_url: null
        })
        .select('*, sender:profiles(*)')
        .single();

      if (error) {
        console.error('Error sending guidance message:', error);
        throw error;
      }
      return data as GuidanceMessage;
    } catch (err) {
      console.error('Unexpected error in sendMessage:', err);
      throw err;
    }
  },

  /**
   * Update status of an individual guidance request (Pure consultation workflow)
   */
  async updateIndividualRequestStatus(
    requestId: string,
    status: IndividualGuidanceStatus,
    data?: { guidance_date?: string; action_plan?: string; final_notes?: string }
  ): Promise<boolean> {
    try {
      const payload: any = {
        status,
        ...(data?.guidance_date ? { guidance_date: data.guidance_date } : {}),
        ...(data?.action_plan !== undefined ? { action_plan: data.action_plan } : {}),
        ...(data?.final_notes !== undefined ? { final_notes: data.final_notes } : {})
      };

      if (status === 'SELESAI') {
        payload.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('individual_guidance_requests')
        .update(payload)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating individual guidance request:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error in updateIndividualRequestStatus:', err);
      throw err;
    }
  },

  /**
   * Create an individual guidance request
   */
  async createIndividualRequest(payload: {
    student_id: string;
    lecturer_id: string;
    academic_year_id: string;
    title: string;
    initial_problem: string;
    guidance_date?: string;
  }): Promise<IndividualGuidanceRequest | null> {
    try {
      const { data, error } = await supabase
        .from('individual_guidance_requests')
        .insert({
          student_id: payload.student_id,
          lecturer_id: payload.lecturer_id,
          academic_year_id: payload.academic_year_id,
          title: payload.title,
          initial_problem: payload.initial_problem,
          guidance_date: payload.guidance_date || new Date().toISOString().split('T')[0],
          status: 'DIAJUKAN'
        })
        .select(`
          *,
          student:students(*, profile:profiles(*), class:classes(*)),
          lecturer:lecturers(*, profile:profiles(*)),
          academic_year:academic_years(*)
        `)
        .single();

      if (error) {
        console.error('Error inserting individual guidance request:', error);
        throw error;
      }
      return data as IndividualGuidanceRequest;
    } catch (err) {
      console.error('Unexpected error in createIndividualRequest:', err);
      throw err;
    }
  },

  /**
   * Dynamically fetch notifications for Dosen PA:
   * - New individual guidance consultation requests from students
   */
  async getNotifications(lecturerId?: string, lecturerEmail?: string): Promise<DosenNotificationItem[]> {
    const notifs: DosenNotificationItem[] = [];
    try {
      const requests = await this.getIndividualRequests(lecturerId, lecturerEmail);
      requests.forEach((req) => {
        if (req.status === 'DIAJUKAN') {
          const studentName = req.student?.profile?.full_name || 'Mahasiswa';
          notifs.push({
            id: `notif-ind-new-${req.id}`,
            title: 'Permohonan Konsultasi Baru',
            message: `Permohonan konsultasi baru dari ${studentName}.`,
            link: '/dosen/bimbingan-individu',
            created_at: req.created_at,
            type: 'konsultasi',
          });
        }
      });
    } catch (err) {
      console.warn('Error computing lecturer notifications:', err);
    }

    notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return notifs;
  }
};

export interface DosenNotificationItem {
  id: string;
  title: string;
  message: string;
  link: string;
  created_at: string;
  type: 'konsultasi' | 'bimbingan_kelas';
}
