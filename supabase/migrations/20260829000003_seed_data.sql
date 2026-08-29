-- ============================================================================
-- Si-BimAk (Sistem Informasi Bimbingan Akademik)
-- Migration 03: Seed Sample Data
-- ============================================================================

-- 1. Academic Years
INSERT INTO public.academic_years (id, code, name, semester, start_date, end_date, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', '2026/2027-1', 'Tahun Akademik 2026/2027 Ganjil', 'Ganjil', '2026-09-01', '2027-01-31', true),
    ('a0000000-0000-0000-0000-000000000002', '2025/2026-2', 'Tahun Akademik 2025/2026 Genap', 'Genap', '2026-02-01', '2026-06-30', false)
ON CONFLICT (code) DO NOTHING;

-- 2. Classes
INSERT INTO public.classes (id, name, study_program, academic_level, academic_year_id)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'SI-5A', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000002', 'SI-5B', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000003', 'TI-3A', 'Teknik Informatika', 'S1', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Catatan:
-- Profil Pengguna (Admin, Dosen PA, Mahasiswa) terhubung dengan Supabase Auth (auth.users).
-- Pada lingkungan development / demo lokal, jika registrasi melalui Auth UI / Dashboard Supabase,
-- data profil dapat diisikan atau disinkronkan otomatis.
