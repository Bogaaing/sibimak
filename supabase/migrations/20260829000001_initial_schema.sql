-- ============================================================================
-- Si-BimAk (Sistem Informasi Bimbingan Akademik)
-- Migration 01: Initial Schema & Relational Structure
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Profiles Table (Linked 1-to-1 with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'dosen', 'mahasiswa')),
    phone_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. Academic Years Table (Tahun Akademik)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g. "2026/2027-1"
    name VARCHAR(100) NOT NULL,       -- e.g. "Tahun Akademik 2026/2027 Ganjil"
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap', 'Pendek')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. Classes Table (Data Kelas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,        -- e.g. "SI-5A"
    study_program VARCHAR(100) NOT NULL, -- e.g. "Sistem Informasi"
    academic_level VARCHAR(10) DEFAULT 'S1' NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_class_per_year UNIQUE(name, academic_year_id)
);

-- ----------------------------------------------------------------------------
-- 4. Lecturers Table (Data Dosen PA & Tanda Tangan Dinamis)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lecturers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    nidn VARCHAR(20) NOT NULL UNIQUE,
    title_prefix VARCHAR(30),         -- e.g. "Dr.", "Prof."
    title_suffix VARCHAR(50),         -- e.g. "M.Kom.", "Ph.D."
    department VARCHAR(100) NOT NULL, -- e.g. "Sistem Informasi"
    signature_url TEXT,               -- Dynamic signature asset URL (Storage)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. Students Table (Data Mahasiswa)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    nim VARCHAR(20) NOT NULL UNIQUE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    program_type VARCHAR(20) DEFAULT 'Reguler' NOT NULL CHECK (program_type IN ('Reguler', 'Non-Reguler')),
    entry_year VARCHAR(4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. Class Advisor Assignments (Plotting Dosen PA ke Kelas per Tahun Akademik)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_advisor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    sk_number VARCHAR(100),
    assignment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_class_advisor_per_year UNIQUE (class_id, academic_year_id)
);

-- ----------------------------------------------------------------------------
-- 7. Class Guidance Sessions (Bimbingan Kelas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_guidance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.class_advisor_assignments(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    topic_description TEXT NOT NULL,
    venue_or_link VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PUBLISHED' NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. Class Guidance Participants (Presensi, Catatan, & Validasi Paraf Dosen)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_guidance_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.class_guidance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'BELUM_KONFIRMASI' NOT NULL CHECK (attendance_status IN ('BELUM_KONFIRMASI', 'HADIR', 'TIDAK_HADIR', 'IZIN')),
    validation_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (validation_status IN ('PENDING', 'VALID', 'DITOLAK')),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES public.lecturers(id),
    student_notes TEXT,
    lecturer_feedback TEXT,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_participant_per_session UNIQUE (session_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 9. Individual Guidance Requests (Bimbingan Individu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.individual_guidance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    initial_problem TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'DIAJUKAN' NOT NULL CHECK (status IN ('DIAJUKAN', 'DIPROSES', 'PERLU_TINDAK_LANJUT', 'SELESAI', 'DITOLAK')),
    validation_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (validation_status IN ('PENDING', 'VALID', 'DITOLAK')),
    validated_at TIMESTAMPTZ,
    guidance_date DATE,
    action_plan TEXT,
    final_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 10. Guidance Messages (Percakapan & Catatan Bimbingan Individu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guidance_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    individual_guidance_id UUID NOT NULL REFERENCES public.individual_guidance_requests(id) ON DELETE CASCADE,
    sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- Indexes for Performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lecturer ON public.class_advisor_assignments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.class_advisor_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_assignment ON public.class_guidance_sessions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_guidance_participants_session ON public.class_guidance_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_guidance_participants_student ON public.class_guidance_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_individual_guidance_student ON public.individual_guidance_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_individual_guidance_lecturer ON public.individual_guidance_requests(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_guidance_messages_request ON public.guidance_messages(individual_guidance_id);

-- ----------------------------------------------------------------------------
-- Trigger: Automatic Population of Class Guidance Participants
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_populate_class_guidance_participants()
RETURNS TRIGGER AS $$
DECLARE
    target_class_id UUID;
BEGIN
    SELECT class_id INTO target_class_id
    FROM public.class_advisor_assignments
    WHERE id = NEW.assignment_id;

    IF target_class_id IS NOT NULL THEN
        INSERT INTO public.class_guidance_participants (session_id, student_id, attendance_status, validation_status)
        SELECT NEW.id, s.id, 'BELUM_KONFIRMASI', 'PENDING'
        FROM public.students s
        WHERE s.class_id = target_class_id
        ON CONFLICT (session_id, student_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_populate_class_guidance_participants ON public.class_guidance_sessions;
CREATE TRIGGER trg_populate_class_guidance_participants
AFTER INSERT ON public.class_guidance_sessions
FOR EACH ROW
EXECUTE FUNCTION public.fn_populate_class_guidance_participants();

-- ----------------------------------------------------------------------------
-- Trigger: Enforce HADIR rule for validation and signature
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_hadir_for_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya mahasiswa dengan status HADIR yang dapat divalidasi
    IF NEW.validation_status = 'VALID' AND NEW.attendance_status != 'HADIR' THEN
        RAISE EXCEPTION 'Mahasiswa hanya dapat divalidasi jika status kehadiran adalah HADIR (Status saat ini: %)', NEW.attendance_status;
    END IF;

    IF NEW.validation_status = 'VALID' AND (OLD.validation_status IS NULL OR OLD.validation_status != 'VALID') THEN
        NEW.validated_at = now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_hadir_for_validation ON public.class_guidance_participants;
CREATE TRIGGER trg_enforce_hadir_for_validation
BEFORE UPDATE OF validation_status ON public.class_guidance_participants
FOR EACH ROW
EXECUTE FUNCTION public.fn_enforce_hadir_for_validation();

-- ----------------------------------------------------------------------------
-- Trigger: Profile updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_profile_timestamp ON public.profiles;
CREATE TRIGGER trg_update_profile_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_profile_timestamp();
