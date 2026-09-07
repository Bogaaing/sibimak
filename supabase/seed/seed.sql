-- ============================================================================
-- SiBiMa (Sistem Informasi Bimbingan Akademik)
-- Complete Seed Data with Auth Users & Password 'Password123!'
-- ============================================================================

-- Ensure pgcrypto extension is active for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Create Auth Users in auth.users
-- Default Password for all accounts: Password123!
-- ----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES 
  -- Admin
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@unpam.ac.id',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Administrator Akademik","role":"admin"}',
    now(),
    now()
  ),
  -- Dosen PA (Ahmad Asep Suhendi)
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'ahmad.asep@unpam.ac.id',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmad Asep Suhendi","role":"dosen"}',
    now(),
    now()
  ),
  -- Mahasiswa 1 (Ahmad Fauzi - NIM 2210114001)
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333331',
    'authenticated',
    'authenticated',
    '2210114001@mahasiswa.unpam.ac.id',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmad Fauzi","role":"mahasiswa"}',
    now(),
    now()
  ),
  -- Mahasiswa 2 (Siti Aisyah - NIM 2210114002)
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333332',
    'authenticated',
    'authenticated',
    '2210114002@mahasiswa.unpam.ac.id',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Siti Aisyah","role":"mahasiswa"}',
    now(),
    now()
  ),
  -- Mahasiswa 3 (Dwi Lestari - NIM 2210114003)
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    '2210114003@mahasiswa.unpam.ac.id',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dwi Lestari","role":"mahasiswa"}',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Link User Identities for Supabase Auth
-- ----------------------------------------------------------------------------
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'admin@unpam.ac.id'),
    'email',
    'admin@unpam.ac.id',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'ahmad.asep@unpam.ac.id'),
    'email',
    'ahmad.asep@unpam.ac.id',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333331',
    jsonb_build_object('sub', '33333333-3333-3333-3333-333333333331', 'email', '2210114001@mahasiswa.unpam.ac.id'),
    'email',
    '2210114001@mahasiswa.unpam.ac.id',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '33333333-3333-3333-3333-333333333332',
    jsonb_build_object('sub', '33333333-3333-3333-3333-333333333332', 'email', '2210114002@mahasiswa.unpam.ac.id'),
    'email',
    '2210114002@mahasiswa.unpam.ac.id',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333', 'email', '2210114003@mahasiswa.unpam.ac.id'),
    'email',
    '2210114003@mahasiswa.unpam.ac.id',
    now(),
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Academic Years (Tahun Akademik)
-- ----------------------------------------------------------------------------
INSERT INTO public.academic_years (id, code, name, semester, start_date, end_date, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '2026/2027-1', 'Tahun Akademik 2026/2027 Ganjil', 'Ganjil', '2026-09-01', '2027-02-28', true),
  ('a0000000-0000-0000-0000-000000000002', '2025/2026-2', 'Tahun Akademik 2025/2026 Genap', 'Genap', '2026-02-01', '2026-06-30', false)
ON CONFLICT (code) DO UPDATE SET is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 4. Classes (Kelas)
-- ----------------------------------------------------------------------------
INSERT INTO public.classes (id, name, study_program, academic_level, academic_year_id)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'SI-5A', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'SI-5B', 'Sistem Informasi', 'S1', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'TI-3A', 'Teknik Informatika', 'S1', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Profiles (Profil Pengguna)
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@unpam.ac.id', 'Administrator Akademik', 'admin', true),
  ('22222222-2222-2222-2222-222222222222', 'ahmad.asep@unpam.ac.id', 'Ahmad Asep Suhendi, M.Kom.', 'dosen', true),
  ('33333333-3333-3333-3333-333333333331', '2210114001@mahasiswa.unpam.ac.id', 'Ahmad Fauzi', 'mahasiswa', true),
  ('33333333-3333-3333-3333-333333333332', '2210114002@mahasiswa.unpam.ac.id', 'Siti Aisyah', 'mahasiswa', true),
  ('33333333-3333-3333-3333-333333333333', '2210114003@mahasiswa.unpam.ac.id', 'Dwi Lestari', 'mahasiswa', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- ----------------------------------------------------------------------------
-- 6. Lecturers (Data Dosen PA)
-- ----------------------------------------------------------------------------
INSERT INTO public.lecturers (id, nidn, title_prefix, title_suffix, department, signature_url)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '0411099202', NULL, 'M.Kom.', 'Sistem Informasi', '/assets/ahmadasepsuhendi-ttd.png')
ON CONFLICT (id) DO UPDATE SET signature_url = EXCLUDED.signature_url;

-- ----------------------------------------------------------------------------
-- 7. Students (Data Mahasiswa)
-- ----------------------------------------------------------------------------
INSERT INTO public.students (id, nim, class_id, program_type, entry_year)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '2210114001', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
  ('33333333-3333-3333-3333-333333333332', '2210114002', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
  ('33333333-3333-3333-3333-333333333333', '2210114003', 'c0000000-0000-0000-0000-000000000002', 'Reguler', '2022')
ON CONFLICT (id) DO UPDATE SET class_id = EXCLUDED.class_id;

-- ----------------------------------------------------------------------------
-- 8. Class Advisor Assignments (Plotting Dosen PA ke Kelas)
-- ----------------------------------------------------------------------------
INSERT INTO public.class_advisor_assignments (id, lecturer_id, class_id, academic_year_id, sk_number, is_active)
VALUES 
  ('f0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true),
  ('f0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 9. Class Guidance Sessions (Sesi Bimbingan Kelas)
-- ----------------------------------------------------------------------------
INSERT INTO public.class_guidance_sessions (id, assignment_id, session_date, title, topic_description, venue_or_link, status)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '3 days',
    'Pengarahan Rencana Studi & Strategi Semester Ganjil',
    'Sosialisasi target SKS, pemilihan mata kuliah peminatan, persiapan program MBKM/Magang, dan pembagian kalender bimbingan akademik kelas.',
    'Ruang Teater V.402 / Kampus Viktor Lt. 4',
    'PUBLISHED'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '14 days',
    'Evaluasi Kesiapan Tengah Semester & Bimbingan Karir',
    'Evaluasi kehadiran perkuliahan, kendala praktikum di laboratorium, dan strategi penyusunan portofolio akademik.',
    'Zoom Meeting (Online)',
    'COMPLETED'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. Individual Guidance Requests (Konsultasi Individu)
-- ----------------------------------------------------------------------------
INSERT INTO public.individual_guidance_requests (
  id,
  student_id,
  lecturer_id,
  academic_year_id,
  title,
  initial_problem,
  status,
  validation_status,
  guidance_date,
  action_plan,
  created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222222',
    'a0000000-0000-0000-0000-000000000001',
    'Konsultasi Pemilihan Topik Skripsi & Magang MSIB',
    'Saya berencana mengikuti program Magang MSIB di semester depan dan ingin menyelaraskan topik proyek magang agar bisa menjadi skripsi di bidang Sistem Informasi Enterprise.',
    'DIPROSES',
    'PENDING',
    CURRENT_DATE,
    'Siapkan draft proposal 2 halaman mengenai studi kasus sistem di perusahaan target magang.',
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. Guidance Message (Pesan Chat Konsultasi)
-- ----------------------------------------------------------------------------
INSERT INTO public.guidance_messages (
  id,
  individual_guidance_id,
  sender_profile_id,
  message,
  created_at
)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333331',
    'Selamat pagi Bapak Ahmad Asep Suhendi, saya sudah menyusun outline ketertarikan bidang ERP Consultant untuk magang.',
    now() - INTERVAL '2 hours'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Bagus Ahmad. Silakan perdalam literatur implementasi SAP / Odoo dan diskusikan kembali pada jadwal bimbingan.',
    now() - INTERVAL '1 hour'
  )
ON CONFLICT (id) DO NOTHING;
