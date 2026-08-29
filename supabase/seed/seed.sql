-- ============================================================================
-- Si-BimAk (Sistem Informasi Bimbingan Akademik)
-- Seed Data: Development & Testing Initial Fixtures
-- ============================================================================

-- 1. Academic Year
INSERT INTO public.academic_years (id, code, name, semester, start_date, end_date, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', '2026/2027-1', 'Tahun Akademik 2026/2027 Ganjil', 'Ganjil', '2026-09-01', '2027-02-28', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Classes
INSERT INTO public.classes (id, name, study_program, academic_level, academic_year_id)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'SI-5A', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000002', 'SI-5B', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 3. Profiles (Auth users mapping)
-- Admin
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@unpam.ac.id', 'Administrator Akademik', 'admin', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Dosen PA (Ahmad Asep Suhendi)
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'ahmad.asep@unpam.ac.id', 'Ahmad Asep Suhendi', 'dosen', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Mahasiswa
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '2210114001@mahasiswa.unpam.ac.id', 'Ahmad Fauzi', 'mahasiswa', true),
    ('33333333-3333-3333-3333-333333333332', '2210114002@mahasiswa.unpam.ac.id', 'Siti Aisyah', 'mahasiswa', true),
    ('33333333-3333-3333-3333-333333333333', '2210114003@mahasiswa.unpam.ac.id', 'Dwi Lestari', 'mahasiswa', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 4. Lecturer Profile Details
INSERT INTO public.lecturers (id, nidn, title_prefix, title_suffix, department, signature_url)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '0411099202', NULL, 'M.Kom.', 'Sistem Informasi', '/assets/ahmadasepsuhendi-ttd.png')
ON CONFLICT (id) DO UPDATE SET signature_url = EXCLUDED.signature_url;

-- 5. Student Profile Details
INSERT INTO public.students (id, nim, class_id, program_type, entry_year)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '2210114001', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
    ('33333333-3333-3333-3333-333333333332', '2210114002', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
    ('33333333-3333-3333-3333-333333333333', '2210114003', 'c0000000-0000-0000-0000-000000000002', 'Reguler', '2022')
ON CONFLICT (id) DO NOTHING;

-- 6. Class Advisor Assignments (Plotting)
INSERT INTO public.class_advisor_assignments (id, lecturer_id, class_id, academic_year_id, sk_number, is_active)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true),
    ('f0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true)
ON CONFLICT DO NOTHING;
