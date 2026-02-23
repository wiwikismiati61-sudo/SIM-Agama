
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

export type ViewType = 'dashboard' | 'master' | 'transaksi' | 'laporan' | 'jadwal' | 'pengaturan';

export const REASONS = ['Alpha', 'Haid', 'Sakit', 'Ijin', 'Pulang sebelum waktunya'];
