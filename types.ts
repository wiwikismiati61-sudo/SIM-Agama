
export interface Student {
  id: string;
  name: string;
  class: string;
}

export interface Program {
  id: string;
  name: string;
  time: string;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  studentId: string;
  studentName: string;
  class: string;
  program: string;
  reason: string;
  note?: string;
}

export interface Schedule {
  id: string;
  activity: string;
  day: string;
  week: string;
  month: string;
  year: string;
  class: string;
  notes: string;
}

export interface Auth {
  user: string;
  pass: string;
}

export type ViewType = 'dashboard' | 'master' | 'transaksi' | 'laporan' | 'jadwal' | 'pengaturan' | 'users';

export interface AllowedUser {
  email: string;
  name: string;
  addedAt: string;
  allowedViews: ViewType[];
}

export const REASONS = ['Hadir', 'Izin', 'Sakit', 'Alpha', 'Haid', 'Pulang sebelum waktunya'];

export const SUPER_ADMIN_EMAILS = [
  'wiwikismiati61@guru.smp.belajar.id',
  'andikamasruroh04@guru.smp.belajar.id'
];
