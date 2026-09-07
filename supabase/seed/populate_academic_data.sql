-- ============================================================================
-- SiBiMa: Populate Academic Data (Dosen PA, Mahasiswa, Plotting, Bimbingan)
-- ============================================================================

-- 1. Lecturers
INSERT INTO public.lecturers (id, nidn, title_prefix, title_suffix, department, signature_url)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '0411099202', NULL, 'M.Kom.', 'Sistem Informasi', '/assets/ahmadasepsuhendi-ttd.png')
ON CONFLICT (id) DO UPDATE SET signature_url = EXCLUDED.signature_url;

-- 2. Students
INSERT INTO public.students (id, nim, class_id, program_type, entry_year)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '2210114001', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
  ('33333333-3333-3333-3333-333333333332', '2210114002', 'c0000000-0000-0000-0000-000000000001', 'Reguler', '2022'),
  ('33333333-3333-3333-3333-333333333333', '2210114003', 'c0000000-0000-0000-0000-000000000002', 'Reguler', '2022')
ON CONFLICT (id) DO UPDATE SET class_id = EXCLUDED.class_id;

-- 3. Class Advisor Assignments (Plotting Dosen PA)
INSERT INTO public.class_advisor_assignments (id, lecturer_id, class_id, academic_year_id, sk_number, is_active)
VALUES 
  ('f0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true),
  ('f0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SK/2026/FTI/089', true)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 4. Class Guidance Sessions (Jadwal Bimbingan Kelas)
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

-- 5. Individual Guidance Requests (Konsultasi Individu)
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

-- 6. Guidance Messages (Chat Konsultasi)
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
