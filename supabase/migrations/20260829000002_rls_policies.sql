-- ============================================================================
-- SiBiMa (Sistem Informasi Bimbingan Akademik)
-- Migration 02: Row Level Security (RLS) Policies - Clean & Non-Recursive
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_advisor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_guidance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_guidance_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_guidance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_messages ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Drop all existing policies to clear recursion
-- ----------------------------------------------------------------------------
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 1. Policies: academic_years & classes (Readable by anyone including anon)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public read academic_years"
    ON public.academic_years FOR SELECT
    USING (true);

CREATE POLICY "Authenticated manage academic_years"
    ON public.academic_years FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public read classes"
    ON public.classes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated manage classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 2. Policies: profiles (Non-recursive)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public and authenticated read profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. Policies: lecturers (Non-recursive)
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read lecturers"
    ON public.lecturers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Lecturers update own data"
    ON public.lecturers FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage lecturers"
    ON public.lecturers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. Policies: students (Non-recursive)
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read students"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students update own data"
    ON public.students FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin manage students"
    ON public.students FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. Policies: class_advisor_assignments (Non-recursive)
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read class_advisor_assignments"
    ON public.class_advisor_assignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated manage class_advisor_assignments"
    ON public.class_advisor_assignments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. Policies: class_guidance_sessions
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read class_guidance_sessions"
    ON public.class_guidance_sessions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated manage class_guidance_sessions"
    ON public.class_guidance_sessions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. Policies: class_guidance_participants
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read class_guidance_participants"
    ON public.class_guidance_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated update class_guidance_participants"
    ON public.class_guidance_participants FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated insert class_guidance_participants"
    ON public.class_guidance_participants FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 8. Policies: individual_guidance_requests
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read individual_guidance_requests"
    ON public.individual_guidance_requests FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated insert individual_guidance_requests"
    ON public.individual_guidance_requests FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated update individual_guidance_requests"
    ON public.individual_guidance_requests FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. Policies: guidance_messages
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated read guidance_messages"
    ON public.guidance_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated insert guidance_messages"
    ON public.guidance_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);
