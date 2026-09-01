import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleRoute } from './RoleRoute';
import { Login } from '../features/auth/pages/Login';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout/AdminLayout';
import { DosenLayout } from '../layouts/DosenLayout/DosenLayout';
import { MahasiswaLayout } from '../layouts/MahasiswaLayout/MahasiswaLayout';

// Admin Pages
import { AdminDashboard } from '../features/admin/pages/AdminDashboard';
import { DosenList } from '../features/admin/pages/DosenList';
import { MahasiswaList } from '../features/admin/pages/MahasiswaList';
import { KelasList } from '../features/admin/pages/KelasList';
import { TahunAkademikList } from '../features/admin/pages/TahunAkademikList';
import { PlottingPAList } from '../features/admin/pages/PlottingPAList';

// Dosen PA Pages
import { DosenDashboard } from '../features/dosen/pages/DosenDashboard';
import { KelasBimbinganList } from '../features/dosen/pages/KelasBimbinganList';
import { MahasiswaBimbinganList } from '../features/dosen/pages/MahasiswaBimbinganList';
import { BimbinganKelasList } from '../features/dosen/pages/BimbinganKelasList';
import { BimbinganIndividuList } from '../features/dosen/pages/BimbinganIndividuList';
import { RiwayatBimbingan } from '../features/dosen/pages/RiwayatBimbingan';

// Mahasiswa Pages
import { MahasiswaDashboard } from '../features/mahasiswa/pages/MahasiswaDashboard';
import { InfoDosenPA } from '../features/mahasiswa/pages/InfoDosenPA';
import { BimbinganKelasMahasiswa } from '../features/mahasiswa/pages/BimbinganKelasMahasiswa';
import { PengajuanBimbinganIndividu } from '../features/mahasiswa/pages/PengajuanBimbinganIndividu';
import { HistoriBimbinganMahasiswa } from '../features/mahasiswa/pages/HistoriBimbinganMahasiswa';
import { FormulirBimbinganPrint } from '../features/report/pages/FormulirBimbinganPrint';

import { useAuth } from '../hooks/useAuth';

// Intelligent Root & Fallback Redirect
const RootRedirect: React.FC = () => {
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

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'dosen') return <Navigate to="/dosen/dashboard" replace />;
    if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Report / Formulir Print View (Accessible by all authenticated users) */}
      <Route element={<RoleRoute allowedRoles={['admin', 'dosen', 'mahasiswa']} />}>
        <Route path="/report/formulir" element={<FormulirBimbinganPrint />} />
      </Route>

      {/* Admin Module Routes */}
      <Route element={<RoleRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dosen" element={<DosenList />} />
          <Route path="mahasiswa" element={<MahasiswaList />} />
          <Route path="kelas" element={<KelasList />} />
          <Route path="tahun-akademik" element={<TahunAkademikList />} />
          <Route path="plotting" element={<PlottingPAList />} />
        </Route>
      </Route>

      {/* Dosen PA Module Routes */}
      <Route element={<RoleRoute allowedRoles={['dosen']} />}>
        <Route path="/dosen" element={<DosenLayout />}>
          <Route index element={<DosenDashboard />} />
          <Route path="dashboard" element={<DosenDashboard />} />
          <Route path="kelas" element={<KelasBimbinganList />} />
          <Route path="mahasiswa" element={<MahasiswaBimbinganList />} />
          <Route path="bimbingan-kelas" element={<BimbinganKelasList />} />
          <Route path="bimbingan-individu" element={<BimbinganIndividuList />} />
          <Route path="riwayat" element={<RiwayatBimbingan />} />
          <Route path="laporan" element={<FormulirBimbinganPrint />} />
        </Route>
      </Route>

      {/* Mahasiswa Module Routes */}
      <Route element={<RoleRoute allowedRoles={['mahasiswa']} />}>
        <Route path="/mahasiswa" element={<MahasiswaLayout />}>
          <Route index element={<MahasiswaDashboard />} />
          <Route path="dashboard" element={<MahasiswaDashboard />} />
          <Route path="bimbingan" element={<BimbinganKelasMahasiswa />} />
          <Route path="konsultasi" element={<PengajuanBimbinganIndividu />} />
          <Route path="profil" element={<InfoDosenPA />} />
          <Route path="dosen-pa" element={<InfoDosenPA />} />
          <Route path="bimbingan-kelas" element={<BimbinganKelasMahasiswa />} />
          <Route path="bimbingan-individu" element={<PengajuanBimbinganIndividu />} />
          <Route path="histori" element={<HistoriBimbinganMahasiswa />} />
        </Route>
      </Route>

      {/* Intelligent Root & Catch-all Fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
