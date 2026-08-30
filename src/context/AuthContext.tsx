import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Lecturer, Student, UserRole } from '../types/database.types';
import { authService } from '../services/auth.service';
import { isSupabaseReady } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  lecturerProfile?: Lecturer;
  studentProfile?: Student;
  isLoading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<Profile | null>;
  loginWithNIM: (nim: string, password?: string) => Promise<Profile | null>;
  login: (identifier: string, role?: 'admin' | 'dosen' | 'mahasiswa') => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, specificId?: string) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | undefined>(undefined);
  const [studentProfile, setStudentProfile] = useState<Student | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDemoMode = !isSupabaseReady;

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authService.getCurrentUserSession();
        setUser(sessionData.user);
        setLecturerProfile(sessionData.lecturerProfile);
        setStudentProfile(sessionData.studentProfile);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
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

  const switchDemoRole = (role: UserRole, specificId?: string) => {
    const sessionData = authService.switchRole(role, specificId);
    setUser(sessionData.user);
    setLecturerProfile(sessionData.lecturerProfile);
    setStudentProfile(sessionData.studentProfile);
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
