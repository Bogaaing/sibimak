import { supabase } from '../lib/supabase';
import { Profile, Lecturer, Student } from '../types/database.types';

export interface AuthSessionData {
  user: Profile | null;
  lecturerProfile?: Lecturer;
  studentProfile?: Student;
}

export const authService = {
  /**
   * Get the current active session and load full user profile from Supabase
   */
  async getCurrentUserSession(): Promise<AuthSessionData> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        return { user: null };
      }

      // Fetch profile from Supabase (by ID or by Email)
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fallback lookup by email if ID differed
      if (!profile && session.user.email) {
        const emailLower = session.user.email.toLowerCase();
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', emailLower)
          .maybeSingle();

        if (profileByEmail) {
          const oldId = profileByEmail.id;
          profile = { ...profileByEmail, id: session.user.id, email: emailLower };

          // Synchronize profile ID in database asynchronously
          try {
            await supabase.from('profiles').update({ id: session.user.id, email: emailLower }).eq('id', oldId);
            await supabase.from('students').update({ id: session.user.id }).eq('id', oldId);
            await supabase.from('lecturers').update({ id: session.user.id }).eq('id', oldId);
          } catch (syncErr) {
            console.warn('ID synchronization warning:', syncErr);
          }
        } else {
          // JIT: Auto-create profile for newly authenticated user
          const isDosen = emailLower.includes('dosen') || emailLower.includes('asep');
          const isAdmin = emailLower.includes('admin');
          const role = isAdmin ? 'admin' : (isDosen ? 'dosen' : 'mahasiswa');
          const fullName = session.user.user_metadata?.full_name || 
            (isDosen ? 'Ahmad Asep Suhendi, M.Kom.' : emailLower.split('@')[0]);

          const newProfile: Profile = {
            id: session.user.id,
            email: emailLower,
            full_name: fullName,
            role,
            phone_number: null,
            avatar_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          try {
            await supabase.from('profiles').upsert(newProfile);
            profile = newProfile;
          } catch (createErr) {
            console.error('Error auto-creating profile:', createErr);
            profile = newProfile;
          }
        }
      }

      if (!profile) return { user: null };

      let lecturerProfile: Lecturer | undefined;
      let studentProfile: Student | undefined;

      if (profile.role === 'dosen') {
        let { data: lecturer, error: lecturerError } = await supabase
          .from('lecturers')
          .select('*')
          .eq('id', profile.id)
          .maybeSingle();

        if (!lecturer) {
          // Ensure lecturer row exists for this profile
          const newLecturer: Lecturer = {
            id: profile.id,
            nidn: '0411099202',
            title_prefix: null,
            title_suffix: 'M.Kom.',
            department: 'Sistem Informasi',
            signature_url: '/assets/ahmadasepsuhendi-ttd.png',
            created_at: new Date().toISOString()
          };
          try {
            await supabase.from('lecturers').upsert(newLecturer);
            lecturer = newLecturer;
            // Associate any unassigned class advisor assignments to this active lecturer
            await supabase.from('class_advisor_assignments').update({ lecturer_id: profile.id }).or(`lecturer_id.is.null,lecturer_id.eq.22222222-2222-2222-2222-222222222222`);
          } catch (lecErr) {
            console.warn('Lecturer provisioning note:', lecErr);
          }
        }
        lecturerProfile = lecturer || undefined;
      } else if (profile.role === 'mahasiswa') {
        let { data: student, error: studentError } = await supabase
          .from('students')
          .select('*, class:classes(*)')
          .eq('id', profile.id)
          .maybeSingle();

        if (!student) {
          try {
            const { data: firstClass } = await supabase.from('classes').select('*, academic_year:academic_years(*)').limit(1).maybeSingle();
            const nim = profile.email.match(/\d+/)?.[0] || '2210114001';
            const newStudent = {
              id: profile.id,
              nim,
              class_id: firstClass?.id || null,
              program_type: 'Reguler' as const,
              entry_year: '2022',
              created_at: new Date().toISOString()
            };
            await supabase.from('students').upsert(newStudent);
            student = { ...newStudent, class: firstClass || undefined };
          } catch (stdErr) {
            console.warn('Student provisioning note:', stdErr);
          }
        }
        studentProfile = student || undefined;
      }

      return {
        user: profile as Profile,
        lecturerProfile,
        studentProfile
      };
    } catch (err) {
      console.error('Supabase getCurrentUserSession error:', err);
      return { user: null };
    }
  },

  /**
   * Login with Email & Password via Supabase Auth
   */
  async loginWithEmail(email: string, password?: string): Promise<AuthSessionData> {
    if (!password) {
      throw new Error('Password wajib diisi.');
    }

    let cleanEmail = email.trim().toLowerCase();

    // If identifier doesn't have '@', check if it is a Lecturer NIDN
    if (!cleanEmail.includes('@')) {
      try {
        const { data: lecturer } = await supabase
          .from('lecturers')
          .select('*, profile:profiles(*)')
          .eq('nidn', email.trim())
          .maybeSingle();

        if (lecturer?.profile?.email) {
          cleanEmail = lecturer.profile.email.toLowerCase();
        }
      } catch (err) {
        console.warn('Could not lookup NIDN:', err);
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      console.error('Supabase login error:', error.message);
      throw error;
    }

    if (!data.user) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    return await this.getCurrentUserSession();
  },

  /**
   * Login with NIM & Password (for Mahasiswa)
   * Resolves NIM to student email (e.g. {nim}@mahasiswa.unpam.ac.id) or email directly
   */
  async loginWithNIM(nim: string, password?: string): Promise<AuthSessionData> {
    if (!password) {
      throw new Error('Password wajib diisi.');
    }

    const trimmedNim = nim.trim();
    let email = trimmedNim.toLowerCase();

    // If identifier doesn't contain '@', dynamically lookup student's registered email by NIM
    if (!email.includes('@')) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('*, profile:profiles(*)')
          .eq('nim', trimmedNim)
          .maybeSingle();

        if (student?.profile?.email) {
          email = student.profile.email;
        } else {
          // Fallback to unpam.ac.id domain
          email = `${trimmedNim}@unpam.ac.id`;
        }
      } catch (err) {
        console.warn('Could not lookup NIM, using fallback:', err);
        email = `${trimmedNim}@unpam.ac.id`;
      }
    }

    return await this.loginWithEmail(email, password);
  },

  /**
   * Sign out from active Supabase session
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase logout error:', error);
    } catch (err) {
      console.error('Supabase logout exception:', err);
    }
  },

  /**
   * Listen to Supabase Auth State changes
   */
  onAuthStateChange(callback: (sessionData: AuthSessionData) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        callback({ user: null });
      } else {
        const sessionData = await this.getCurrentUserSession();
        callback(sessionData);
      }
    });
  }
};
