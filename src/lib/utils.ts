import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined, formatStr = 'dd MMMM yyyy'): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr, { locale: id });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'dd MMMM yyyy, HH:mm');
}

export function getLecturerFullName(lecturer: {
  title_prefix?: string | null;
  title_suffix?: string | null;
  profile?: { full_name: string } | null;
  full_name?: string;
}): string {
  const name = lecturer.profile?.full_name || lecturer.full_name || 'Dosen';
  const prefix = lecturer.title_prefix ? `${lecturer.title_prefix} ` : '';
  const suffix = lecturer.title_suffix ? `, ${lecturer.title_suffix}` : '';
  return `${prefix}${name}${suffix}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'HADIR':
    case 'SELESAI':
    case 'PUBLISHED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'DIPROSES':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    case 'DIAJUKAN':
    case 'BELUM_KONFIRMASI':
    case 'DRAFT':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'PERLU_TINDAK_LANJUT':
    case 'IZIN':
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
    case 'TIDAK_HADIR':
    case 'DITOLAK':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
  }
}
