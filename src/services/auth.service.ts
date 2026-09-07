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
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email.toLowerCase())
          .maybeSingle();

        if (profileByEmail) {
          const oldId = profileByEmail.id;
          profile = { ...profileByEmail, id: session.user.id };

          // Synchronize profile ID in database asynchronously
          try {
            await supabase.from('profiles').update({ id: session.user.id }).eq('id', oldId);
            await supabase.from('students').update({ id: session.user.id }).eq('id', oldId);
            await supabase.from('lecturers').update({ id: session.user.id }).eq('id', oldId);
          } catch (syncErr) {
            console.warn('ID synchronization warning:', syncErr);
          }
        }
      }

      if (!profile) return { user: null };

      let lecturerProfile: Lecturer | undefined;
      let studentProfile: Student | undefined;

      if (profile.role === 'dosen') {
        const { data: lecturer, error: lecturerError } = await supabase
          .from('lecturers')
          .select('*')
          .eq('id', profile.id)
          .maybeSingle();
        if (lecturerError) console.error('Error fetching lecturer profile:', lecturerError);
        lecturerProfile = lecturer || undefined;
      } else if (profile.role === 'mahasiswa') {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*, class:classes(*)')
          .eq('id', profile.id)
          .maybeSingle();
        if (studentError) console.error('Error fetching student profile:', studentError);
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
