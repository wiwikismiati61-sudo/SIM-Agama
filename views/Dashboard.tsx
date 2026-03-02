
import React from 'react';
import { Student, Transaction } from '../types';

interface DashboardProps {
  students: Student[];
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardProps> = ({ students, transactions }) => {
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const totalStudents = students.length;
  const absentsToday = transactions.filter(t => t.date === today).length;
  const earlyDepartures = transactions.filter(t => t.reason === 'Pulang sebelum waktunya').length;

  // Logic: Panggilan Orang Tua (Siswa > 2x Tidak Mengikuti Kegiatan)
  const violationCounts: Record<string, number> = {};
  transactions.forEach(t => {
    if (!violationCounts[t.studentId]) violationCounts[t.studentId] = 0;
    violationCounts[t.studentId]++;
  });

  const parentCallList = Object.keys(violationCounts)
    .filter(id => violationCounts[id] > 2)
    .map(id => {
      const student = students.find(s => String(s.id) === String(id));
      return student ? { ...student, count: violationCounts[id] } : null;
    })
    .filter((item): item is (Student & { count: number }) => item !== null);

  const stats = [
    { label: 'Total Siswa Terdata', value: totalStudents, icon: 'fas fa-users', color: 'brand' },
    { label: 'Ketidakhadiran Hari Ini', value: absentsToday, icon: 'fas fa-calendar-day', color: 'indigo' },
    { label: 'Pulang Sebelum Waktu', value: earlyDepartures, icon: 'fas fa-clock', color: 'rose' },
    { label: 'Perlu Panggilan Ortu', value: parentCallList.length, icon: 'fas fa-phone-alt', color: 'amber' },
  ];

  const colorClasses: Record<string, { bg: string, text: string, iconBg: string, iconText: string, border: string }> = {
    brand: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-brand-50', iconText: 'text-brand-600', border: 'border-brand-500' },
    indigo: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', border: 'border-indigo-500' },
    rose: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-rose-50', iconText: 'text-rose-600', border: 'border-rose-500' },
    amber: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-amber-50', iconText: 'text-amber-600', border: 'border-amber-500' }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 ${colorClasses[s.color].border} ${colorClasses[s.color].bg} transition-all hover:shadow-md hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-2">{s.label}</p>
                <h3 className={`text-3xl font-black ${colorClasses[s.color].text}`}>{s.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClasses[s.color].iconBg} ${colorClasses[s.color].iconText}`}>
                <i className={s.icon}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-rose-50/50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <i className="fas fa-exclamation-triangle text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base tracking-tight">Daftar Panggilan Orang Tua</h3>
              <p className="text-sm text-slate-500 mt-0.5">Siswa dengan &gt; 2x pelanggaran kegiatan</p>
            </div>
          </div>
          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider inline-block text-center shadow-sm">Perhatian Khusus</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {parentCallList.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4 text-center">Jumlah Pelanggaran</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parentCallList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.class}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-sm">
                        {s.count}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                        Proses Panggilan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <i className="fas fa-check text-2xl text-emerald-500"></i>
              </div>
              <p className="text-sm font-medium text-slate-500">Tidak ada siswa yang perlu dipanggil saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
