import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/database.types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-900 font-sans">
        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-600 font-bold">Memverifikasi sesi akademik...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />;
    if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
