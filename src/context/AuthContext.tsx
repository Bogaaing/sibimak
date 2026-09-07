import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Lecturer, Student } from '../types/database.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: Profile | null;
  lecturerProfile?: Lecturer;
  studentProfile?: Student;
  isLoading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<Profile | null>;
  loginWithNIM: (nim: string, password?: string) => Promise<Profile | null>;
  login: (identifier: string, role?: 'admin' | 'dosen' | 'mahasiswa') => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | undefined>(undefined);
  const [studentProfile, setStudentProfile] = useState<Student | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      const sessionData = await authService.getCurrentUserSession();
      setUser(sessionData.user);
      setLecturerProfile(sessionData.lecturerProfile);
      setStudentProfile(sessionData.studentProfile);
    } catch (err) {
      console.error('Auth refresh error:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authService.getCurrentUserSession();
        if (mounted) {
          setUser(sessionData.user);
          setLecturerProfile(sessionData.lecturerProfile);
          setStudentProfile(sessionData.studentProfile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to Supabase auth events
    const { data: { subscription } } = authService.onAuthStateChange((sessionData) => {
      if (mounted) {
        setUser(sessionData.user);
        setLecturerProfile(sessionData.lecturerProfile);
        setStudentProfile(sessionData.studentProfile);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password?: string): Promise<Profile | null> => {
    setIsLoading(true);
    try {
      const sessionData = await authService.loginWithEmail(email, password);
      setUser(sessionData.user);
      setLecturerProfile(sessionData.lecturerProfile);
      setStudentProfile(sessionData.studentProfile);
      return sessionData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithNIM = async (nim: string, password?: string): Promise<Profile | null> => {
    setIsLoading(true);
    try {
      const sessionData = await authService.loginWithNIM(nim, password);
      setUser(sessionData.user);
      setLecturerProfile(sessionData.lecturerProfile);
      setStudentProfile(sessionData.studentProfile);
      return sessionData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, role?: 'admin' | 'dosen' | 'mahasiswa') => {
    if (role === 'mahasiswa' || /^\d+$/.test(identifier)) {
      await loginWithNIM(identifier);
    } else {
      await loginWithEmail(identifier);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setLecturerProfile(undefined);
      setStudentProfile(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lecturerProfile,
        studentProfile,
        isLoading,
        loginWithEmail,
        loginWithNIM,
        login,
        logout,
        refreshSession
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
