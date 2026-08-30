-- ============================================================================
-- SiBiMa (Sistem Informasi Bimbingan Akademik)
-- Migration 02: Row Level Security (RLS) & Role-Based Access Control Policies
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
-- Security Helper Functions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_dosen()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'dosen'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_mahasiswa()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'mahasiswa'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. Policies: profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Lecturers can read student profiles in their assigned classes"
    ON public.profiles FOR SELECT
    USING (
        public.is_dosen() AND id IN (
            SELECT s.id FROM public.students s
            JOIN public.class_advisor_assignments caa ON caa.class_id = s.class_id
            WHERE caa.lecturer_id = auth.uid()
        )
    );

CREATE POLICY "Students can read their lecturer profile"
    ON public.profiles FOR SELECT
    USING (
        public.is_mahasiswa() AND id IN (
            SELECT caa.lecturer_id FROM public.class_advisor_assignments caa
            JOIN public.students s ON s.class_id = caa.class_id
            WHERE s.id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 2. Policies: lecturers
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to lecturers"
    ON public.lecturers FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Lecturers can view their own details"
    ON public.lecturers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Students can view their assigned lecturer"
    ON public.lecturers FOR SELECT
    USING (
        public.is_mahasiswa() AND id IN (
            SELECT caa.lecturer_id FROM public.class_advisor_assignments caa
            JOIN public.students s ON s.class_id = caa.class_id
            WHERE s.id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 3. Policies: students
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to students"
    ON public.students FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Students can view own data"
    ON public.students FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Lecturers can view students in their assigned classes"
    ON public.students FOR SELECT
    USING (
        public.is_dosen() AND class_id IN (
            SELECT caa.class_id FROM public.class_advisor_assignments caa
            WHERE caa.lecturer_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 4. Policies: academic_years & classes
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to academic_years"
    ON public.academic_years FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated users can read academic_years"
    ON public.academic_years FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin has full access to classes"
    ON public.classes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated users can read classes"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- 5. Policies: class_advisor_assignments
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to class_advisor_assignments"
    ON public.class_advisor_assignments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Lecturers can read their own assignments"
    ON public.class_advisor_assignments FOR SELECT
    USING (public.is_dosen() AND lecturer_id = auth.uid());

CREATE POLICY "Students can read assignment for their class"
    ON public.class_advisor_assignments FOR SELECT
    USING (
        public.is_mahasiswa() AND class_id = (
            SELECT class_id FROM public.students WHERE id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 6. Policies: class_guidance_sessions
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to class_guidance_sessions"
    ON public.class_guidance_sessions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Lecturers can manage guidance sessions for their classes"
    ON public.class_guidance_sessions FOR ALL
    USING (
        public.is_dosen() AND assignment_id IN (
            SELECT id FROM public.class_advisor_assignments WHERE lecturer_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_dosen() AND assignment_id IN (
            SELECT id FROM public.class_advisor_assignments WHERE lecturer_id = auth.uid()
        )
    );

CREATE POLICY "Students can read guidance sessions for their class"
    ON public.class_guidance_sessions FOR SELECT
    USING (
        public.is_mahasiswa() AND assignment_id IN (
            SELECT caa.id FROM public.class_advisor_assignments caa
            JOIN public.students s ON s.class_id = caa.class_id
            WHERE s.id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 7. Policies: class_guidance_participants
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to class_guidance_participants"
    ON public.class_guidance_participants FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Lecturers can view and give feedback to their participants"
    ON public.class_guidance_participants FOR SELECT
    USING (
        public.is_dosen() AND session_id IN (
            SELECT cgs.id FROM public.class_guidance_sessions cgs
            JOIN public.class_advisor_assignments caa ON caa.id = cgs.assignment_id
            WHERE caa.lecturer_id = auth.uid()
        )
    );

CREATE POLICY "Lecturers can update feedback in class participants"
    ON public.class_guidance_participants FOR UPDATE
    USING (
        public.is_dosen() AND session_id IN (
            SELECT cgs.id FROM public.class_guidance_sessions cgs
            JOIN public.class_advisor_assignments caa ON caa.id = cgs.assignment_id
            WHERE caa.lecturer_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_dosen() AND session_id IN (
            SELECT cgs.id FROM public.class_guidance_sessions cgs
            JOIN public.class_advisor_assignments caa ON caa.id = cgs.assignment_id
            WHERE caa.lecturer_id = auth.uid()
        )
    );

CREATE POLICY "Students can view and confirm their own attendance"
    ON public.class_guidance_participants FOR SELECT
    USING (public.is_mahasiswa() AND student_id = auth.uid());

CREATE POLICY "Students can update their attendance and notes"
    ON public.class_guidance_participants FOR UPDATE
    USING (public.is_mahasiswa() AND student_id = auth.uid())
    WITH CHECK (public.is_mahasiswa() AND student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. Policies: individual_guidance_requests
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to individual_guidance_requests"
    ON public.individual_guidance_requests FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Students can view, create and edit own individual guidance"
    ON public.individual_guidance_requests FOR ALL
    USING (public.is_mahasiswa() AND student_id = auth.uid())
    WITH CHECK (public.is_mahasiswa() AND student_id = auth.uid());

CREATE POLICY "Lecturers can view and process individual guidance directed to them"
    ON public.individual_guidance_requests FOR ALL
    USING (public.is_dosen() AND lecturer_id = auth.uid())
    WITH CHECK (public.is_dosen() AND lecturer_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 9. Policies: guidance_messages
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin has full access to guidance_messages"
    ON public.guidance_messages FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Users involved in individual guidance can view messages"
    ON public.guidance_messages FOR SELECT
    USING (
        individual_guidance_id IN (
            SELECT id FROM public.individual_guidance_requests
            WHERE student_id = auth.uid() OR lecturer_id = auth.uid()
        )
    );

CREATE POLICY "Users involved in individual guidance can insert messages"
    ON public.guidance_messages FOR INSERT
    WITH CHECK (
        sender_profile_id = auth.uid() AND
        individual_guidance_id IN (
            SELECT id FROM public.individual_guidance_requests
            WHERE student_id = auth.uid() OR lecturer_id = auth.uid()
        )
    );
