import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Lecturer, Student } from '../types/database.types';
import { store } from '../lib/store';
import { supabase, isSupabaseReady } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  lecturerProfile?: Lecturer;
  studentProfile?: Student;
  isLoading: boolean;
  login: (email: string, role?: 'admin' | 'dosen' | 'mahasiswa') => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'admin' | 'dosen' | 'mahasiswa', specificId?: string) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseReady);

  const loadProfile = (userId: string) => {
    const profile = store.getProfileById(userId);
    if (profile) {
      setUser(profile);
    } else {
      // Default to admin if not found
      const defaultAdmin = store.getProfiles().find(p => p.role === 'admin') || null;
      setUser(defaultAdmin);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseReady) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = store.getProfileById(session.user.id);
            if (profile) {
              setUser(profile);
            }
          }
        }

        // Check local storage current user fallback
        const savedUserId = localStorage.getItem('sibimak_current_user_id');
        if (savedUserId) {
          loadProfile(savedUserId);
        } else {
          // Default start as Admin for easy testing
          const defaultAdmin = store.getProfiles().find(p => p.role === 'admin');
          if (defaultAdmin) {
            setUser(defaultAdmin);
            localStorage.setItem('sibimak_current_user_id', defaultAdmin.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, _role?: 'admin' | 'dosen' | 'mahasiswa') => {
    setIsLoading(true);
    try {
      const matchedProfile = store.getProfiles().find(p => p.email.toLowerCase() === email.toLowerCase());
      if (matchedProfile) {
        setUser(matchedProfile);
        localStorage.setItem('sibimak_current_user_id', matchedProfile.id);
      } else {
        throw new Error('User dengan email tersebut tidak ditemukan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseReady) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sibimak_current_user_id');
    setUser(null);
  };

  const switchDemoRole = (role: 'admin' | 'dosen' | 'mahasiswa', specificId?: string) => {
    let target: Profile | undefined;
    if (specificId) {
      target = store.getProfileById(specificId);
    } else {
      target = store.getProfiles().find(p => p.role === role);
    }

    if (target) {
      setUser(target);
      localStorage.setItem('sibimak_current_user_id', target.id);
    }
  };

  const lecturerProfile = user?.role === 'dosen' 
    ? store.getLecturers().find(l => l.id === user.id)
    : undefined;

  const studentProfile = user?.role === 'mahasiswa'
    ? store.getStudents().find(s => s.id === user.id)
    : undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        lecturerProfile,
        studentProfile,
        isLoading,
        login,
        logout,
        switchDemoRole,
        isDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
