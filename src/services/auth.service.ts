import { supabase, isSupabaseReady } from '../lib/supabase';
import { Profile, Lecturer, Student, UserRole } from '../types/database.types';
import { store } from '../lib/store';

export interface AuthSessionData {
  user: Profile | null;
  lecturerProfile?: Lecturer;
  studentProfile?: Student;
}

export const authService = {
  /**
   * Get the current active session and load full user profile
   */
  async getCurrentUserSession(): Promise<AuthSessionData> {
    if (isSupabaseReady) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          // Fetch profile from supabase or fallback store
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            let lecturerProfile: Lecturer | undefined;
            let studentProfile: Student | undefined;

            if (profile.role === 'dosen') {
              const { data: lecturer } = await supabase
                .from('lecturers')
                .select('*')
                .eq('id', profile.id)
                .single();
              lecturerProfile = lecturer || store.getLecturers().find(l => l.id === profile.id);
            } else if (profile.role === 'mahasiswa') {
              const { data: student } = await supabase
                .from('students')
                .select('*, class:classes(*)')
                .eq('id', profile.id)
                .single();
              studentProfile = student || store.getStudents().find(s => s.id === profile.id);
            }

            return {
              user: profile as Profile,
              lecturerProfile,
              studentProfile
            };
          }
        }
      } catch (err) {
        console.warn('Supabase auth session fetch fallback to local store:', err);
      }
    }

    // Local / Demo Mode fallback
    const savedUserId = localStorage.getItem('sibimak_current_user_id');
    const profile = savedUserId ? store.getProfileById(savedUserId) : store.getProfiles().find(p => p.role === 'mahasiswa');
    
    if (profile) {
      const lecturerProfile = profile.role === 'dosen' 
        ? store.getLecturers().find(l => l.id === profile.id) 
        : undefined;
      const studentProfile = profile.role === 'mahasiswa' 
        ? store.getStudents().find(s => s.id === profile.id) 
        : undefined;

      return {
        user: profile,
        lecturerProfile,
        studentProfile
      };
    }

    return { user: null };
  },

  /**
   * Login with Email & Password
   */
  async loginWithEmail(email: string, password?: string): Promise<AuthSessionData> {
    if (isSupabaseReady && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          return await this.getCurrentUserSession();
        }
      } catch (err: any) {
        console.warn('Supabase login failed, trying fallback store:', err.message);
      }
    }

    // Fallback store login
    const cleanEmail = email.toLowerCase().trim();
    let matchedProfile = store.getProfiles().find(p => p.email.toLowerCase() === cleanEmail);
    if (!matchedProfile && (cleanEmail === 'admin' || cleanEmail.includes('admin'))) {
      matchedProfile = store.getProfileById('usr-admin-1');
    } else if (!matchedProfile && (cleanEmail.includes('ahmad') || cleanEmail.includes('asep') || cleanEmail.includes('02975'))) {
      matchedProfile = store.getProfileById('usr-dosen-1');
    }

    if (matchedProfile) {
      localStorage.setItem('sibimak_current_user_id', matchedProfile.id);
      const lecturerProfile = matchedProfile.role === 'dosen' ? store.getLecturers().find(l => l.id === matchedProfile.id) : undefined;
      const studentProfile = matchedProfile.role === 'mahasiswa' ? store.getStudents().find(s => s.id === matchedProfile.id) : undefined;

      return {
        user: matchedProfile,
        lecturerProfile,
        studentProfile
      };
    }

    throw new Error('Email atau password yang Anda masukkan salah.');
  },

  /**
   * Login with NIM & Password (for Mahasiswa)
   */
  async loginWithNIM(nim: string, password?: string): Promise<AuthSessionData> {
    const trimmedNim = nim.trim();
    const student = store.getStudents().find(s => s.nim === trimmedNim || s.id === trimmedNim);
    if (student && student.profile) {
      return await this.loginWithEmail(student.profile.email, password);
    }
    
    // Default test student matching
    if (trimmedNim === '2210114001' || trimmedNim === '2210511045') {
      const defaultStudentProfile = store.getProfileById('usr-mhs-1');
      if (defaultStudentProfile) {
        return await this.loginWithEmail(defaultStudentProfile.email, password);
      }
    }

    // Check if NIM is in profile email
    const profile = store.getProfiles().find(p => p.email.includes(trimmedNim) || p.id === trimmedNim);
    if (profile) {
      return await this.loginWithEmail(profile.email, password);
    }

    throw new Error('NIM atau password yang Anda masukkan salah.');
  },

  /**
   * Sign out from active session
   */
  async logout(): Promise<void> {
    if (isSupabaseReady) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase logout error:', err);
      }
    }
    localStorage.removeItem('sibimak_current_user_id');
  },

  /**
   * Switch role in development / demo mode
   */
  switchRole(role: UserRole, specificId?: string): AuthSessionData {
    let targetProfile: Profile | undefined;
    if (specificId) {
      targetProfile = store.getProfileById(specificId);
    } else {
      targetProfile = store.getProfiles().find(p => p.role === role);
    }

    if (targetProfile) {
      localStorage.setItem('sibimak_current_user_id', targetProfile.id);
      const lecturerProfile = targetProfile.role === 'dosen' ? store.getLecturers().find(l => l.id === targetProfile.id) : undefined;
      const studentProfile = targetProfile.role === 'mahasiswa' ? store.getStudents().find(s => s.id === targetProfile.id) : undefined;

      return {
        user: targetProfile,
        lecturerProfile,
        studentProfile
      };
    }

    return { user: null };
  }
};
