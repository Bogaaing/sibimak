import { 
  Profile, 
  Lecturer, 
  Student, 
  AcademicYear, 
  ClassItem, 
  ClassAdvisorAssignment, 
  ClassGuidanceSession, 
  ClassGuidanceParticipant, 
  IndividualGuidanceRequest,
  GuidanceMessage
} from '../types/database.types';

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-1',
    code: '2026/2027-1',
    name: 'Tahun Akademik 2026/2027 Ganjil',
    semester: 'Ganjil',
    start_date: '2026-09-01',
    end_date: '2027-01-31',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ay-2',
    code: '2025/2026-2',
    name: 'Tahun Akademik 2025/2026 Genap',
    semester: 'Genap',
    start_date: '2026-02-01',
    end_date: '2026-06-30',
    is_active: false,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'SI-5A',
    study_program: 'Sistem Informasi',
    academic_level: 'S1',
    academic_year_id: 'ay-1',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cls-2',
    name: 'SI-5B',
    study_program: 'Sistem Informasi',
    academic_level: 'S1',
    academic_year_id: 'ay-1',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cls-3',
    name: 'TI-3A',
    study_program: 'Teknik Informatika',
    academic_level: 'S1',
    academic_year_id: 'ay-1',
    created_at: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@kampus.ac.id',
    full_name: 'Administrator Akademik',
    role: 'admin',
    phone_number: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-dosen-1',
    email: 'Dosen02975@unpam.ac.id',
    full_name: 'Ahmad Asep Suhendi',
    role: 'dosen',
    phone_number: '0851.5977.4347',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-dosen-2',
    email: 'ratna@kampus.ac.id',
    full_name: 'Ratna Kusuma Dewi',
    role: 'dosen',
    phone_number: '081287654321',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-mhs-1',
    email: 'mahasiswa@kampus.ac.id',
    full_name: 'Ahmad Fauzi',
    role: 'mahasiswa',
    phone_number: '085712345678',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-mhs-2',
    email: 'siti@kampus.ac.id',
    full_name: 'Siti Nurhaliza',
    role: 'mahasiswa',
    phone_number: '085888776655',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-mhs-3',
    email: 'rizky@kampus.ac.id',
    full_name: 'Rizky Pratama',
    role: 'mahasiswa',
    phone_number: '085911223344',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: 'usr-dosen-1',
    nidn: '0411099202',
    title_prefix: '',
    title_suffix: 'S.Kom., M.Kom.',
    department: 'Sistem Informasi',
    signature_url: '/assets/ahmadasepsuhendi-ttd.png',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-dosen-2',
    nidn: '0418098802',
    title_prefix: '',
    title_suffix: 'S.Kom., M.T.',
    department: 'Teknik Informatika',
    signature_url: null,
    created_at: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'usr-mhs-1',
    nim: '2210511045',
    class_id: 'cls-1', // SI-5A
    program_type: 'Reguler',
    entry_year: '2024',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-mhs-2',
    nim: '2210511046',
    class_id: 'cls-1', // SI-5A
    program_type: 'Reguler',
    entry_year: '2024',
    created_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'usr-mhs-3',
    nim: '2210511047',
    class_id: 'cls-2', // SI-5B
    program_type: 'Reguler',
    entry_year: '2024',
    created_at: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_ASSIGNMENTS: ClassAdvisorAssignment[] = [
  {
    id: 'asg-1',
    lecturer_id: 'usr-dosen-1', // Ahmad Asep Suhendi
    class_id: 'cls-1',         // SI-5A
    academic_year_id: 'ay-1',
    sk_number: 'SK/2026/FTI/089',
    assignment_date: '2026-08-15',
    is_active: true,
    created_at: '2026-08-15T00:00:00Z'
  },
  {
    id: 'asg-2',
    lecturer_id: 'usr-dosen-1', // Ahmad Asep Suhendi also advises SI-5B
    class_id: 'cls-2',         // SI-5B
    academic_year_id: 'ay-1',
    sk_number: 'SK/2026/FTI/089',
    assignment_date: '2026-08-15',
    is_active: true,
    created_at: '2026-08-15T00:00:00Z'
  }
];

export const INITIAL_CLASS_SESSIONS: ClassGuidanceSession[] = [
  {
    id: 'cgs-1',
    assignment_id: 'asg-1', // SI-5A
    session_date: '2024-10-24',
    title: 'Pengarahan Awal & Tata Tertib Akademik',
    topic_description: 'a. Perkenalan\nb. Penyampaian tata tertib sebagai mahasiswa baru\nc. Motivasi supaya Nilai bagus dan Lulus tepat waktu',
    venue_or_link: 'Ruang Teater FTI / Google Meet',
    status: 'COMPLETED',
    created_at: '2024-10-15T08:00:00Z'
  },
  {
    id: 'cgs-2',
    assignment_id: 'asg-1',
    session_date: '2024-12-06',
    title: 'Evaluasi Perkuliahan & Persiapan UAS',
    topic_description: 'a. Keluh kesah selama menjalankan perkuliahan satu semester\nb. Kendala Tugas tugas yang dihadapi\nc. Kendala Dosen dan Lain lain\nd. Informasi UAS dan Registrasi ulang',
    venue_or_link: 'Ruang Kelas 401',
    status: 'COMPLETED',
    created_at: '2024-12-01T08:00:00Z'
  },
  {
    id: 'cgs-3',
    assignment_id: 'asg-1',
    session_date: '2027-01-20',
    title: 'Persiapan Menghadapi Ujian Tengah Semester (UTS)',
    topic_description: 'a. Review materi perkuliahan modul 1-6\nb. Ketentuan pengumpulan tugas besar kelompok\nc. Strategi penyusunan jadwal belajar UTS',
    venue_or_link: 'Ruang Teater FTI / Google Meet',
    status: 'PUBLISHED',
    created_at: '2027-01-10T08:00:00Z'
  }
];

export const INITIAL_PARTICIPANTS: ClassGuidanceParticipant[] = [
  {
    id: 'part-1',
    session_id: 'cgs-1',
    student_id: 'usr-mhs-1', // Ahmad Fauzi
    attendance_status: 'HADIR',
    validation_status: 'VALID',
    validated_at: '2024-10-24T12:00:00Z',
    validated_by: 'usr-dosen-1',
    student_notes: 'Siap mengikuti tata tertib perkuliahan.',
    lecturer_feedback: 'Semangat belajar dan pertahankan kehadiran.',
    confirmed_at: '2024-10-24T09:00:00Z',
    created_at: '2024-10-15T08:00:00Z'
  },
  {
    id: 'part-2',
    session_id: 'cgs-1',
    student_id: 'usr-mhs-2', // Siti Nurhaliza
    attendance_status: 'HADIR',
    validation_status: 'VALID',
    validated_at: '2024-10-24T12:00:00Z',
    validated_by: 'usr-dosen-1',
    student_notes: null,
    lecturer_feedback: null,
    confirmed_at: '2024-10-24T09:15:00Z',
    created_at: '2024-10-15T08:00:00Z'
  },
  {
    id: 'part-3',
    session_id: 'cgs-2',
    student_id: 'usr-mhs-1',
    attendance_status: 'HADIR',
    validation_status: 'VALID',
    validated_at: '2024-12-06T15:00:00Z',
    validated_by: 'usr-dosen-1',
    student_notes: 'Tugas kelompok modul 5 sudah selesai dikerjakan.',
    lecturer_feedback: 'KRS telah disetujui, pertahankan performa studi.',
    confirmed_at: '2024-12-06T10:00:00Z',
    created_at: '2024-12-01T08:00:00Z'
  },
  {
    id: 'part-4',
    session_id: 'cgs-3',
    student_id: 'usr-mhs-1',
    attendance_status: 'HADIR',
    validation_status: 'PENDING',
    validated_at: null,
    validated_by: null,
    student_notes: 'Mohon saran pak terkait strategi pembagian waktu belajar UTS dan pengerjaan tugas besar.',
    lecturer_feedback: null,
    confirmed_at: '2027-01-18T10:30:00Z',
    created_at: '2027-01-10T08:00:00Z'
  },
  {
    id: 'part-5',
    session_id: 'cgs-3',
    student_id: 'usr-mhs-2',
    attendance_status: 'BELUM_KONFIRMASI',
    validation_status: 'PENDING',
    validated_at: null,
    validated_by: null,
    student_notes: null,
    lecturer_feedback: null,
    confirmed_at: null,
    created_at: '2027-01-10T08:00:00Z'
  }
];

export const INITIAL_INDIVIDUAL_REQUESTS: IndividualGuidanceRequest[] = [
  {
    id: 'igr-1',
    student_id: 'usr-mhs-1', // Ahmad Fauzi
    lecturer_id: 'usr-dosen-1', // Ahmad Asep Suhendi
    academic_year_id: 'ay-1',
    title: 'Konsultasi Pemilihan Topik Skripsi & Magang MSIB',
    initial_problem: 'Saya berencana mengikuti program Magang MSIB di semester depan dan ingin menyelaraskan topik proyek magang agar bisa menjadi skripsi di bidang Sistem Informasi Enterprise.',
    status: 'DIPROSES',
    validation_status: 'PENDING',
    validated_at: null,
    guidance_date: '2027-01-25',
    action_plan: 'Siapkan draft proposal 2 halaman mengenai studi kasus sistem di perusahaan target magang.',
    final_notes: null,
    completed_at: null,
    created_at: '2027-01-15T09:00:00Z'
  }
];

export const INITIAL_GUIDANCE_MESSAGES: GuidanceMessage[] = [
  {
    id: 'msg-1',
    individual_guidance_id: 'igr-1',
    sender_profile_id: 'usr-mhs-1',
    message: 'Selamat pagi Bapak Ahmad Asep Suhendi, saya sudah melampirkan draft silabus magang di bidang ERP Solution Consultant.',
    attachment_url: null,
    created_at: '2027-01-16T08:30:00Z'
  },
  {
    id: 'msg-2',
    individual_guidance_id: 'igr-1',
    sender_profile_id: 'usr-dosen-1',
    message: 'Bagus Ahmad. Silakan baca jurnal terkait evaluasi implementasi SAP / Odoo untuk memperkuat tinjauan pustaka.',
    attachment_url: null,
    created_at: '2027-01-16T11:15:00Z'
  }
];
