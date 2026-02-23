
import React from 'react';
import { Student, Transaction } from '../types';

interface DashboardProps {
  students: Student[];
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardProps> = ({ students, transactions }) => {
  const today = new Date().toISOString().split('T')[0];
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
      const student = students.find(s => s.id === id);
      return student ? { ...student, count: violationCounts[id] } : null;
    })
    .filter((item): item is (Student & { count: number }) => item !== null);

  const stats = [
    { label: 'Total Siswa Terdata', value: totalStudents, icon: 'fas fa-users', color: 'blue' },
    { label: 'Ketidakhadiran Hari Ini', value: absentsToday, icon: 'fas fa-calendar-day', color: 'purple' },
    { label: 'Pulang Sebelum Waktu', value: earlyDepartures, icon: 'fas fa-clock', color: 'red' },
    { label: 'Perlu Panggilan Ortu', value: parentCallList.length, icon: 'fas fa-phone-alt', color: 'orange' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    red: 'border-red-500 bg-red-50 text-red-600',
    orange: 'border-orange-500 bg-orange-50 text-orange-600'
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl shadow-sm border-l-4 bg-white transition-all hover:shadow-md hover:-translate-y-1 ${colorClasses[s.color].split(' ')[0]}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider mb-1">{s.label}</p>
                <h3 className="text-3xl font-black text-gray-800">{s.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClasses[s.color].split(' ').slice(1).join(' ')}`}>
                <i className={s.icon}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden">
        <div className="bg-red-50/50 px-8 py-5 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase text-sm tracking-tight">Daftar Panggilan Orang Tua</h3>
              <p className="text-xs text-red-500 font-medium tracking-wide">Siswa dengan &gt; 2x pelanggaran kegiatan</p>
            </div>
          </div>
          <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">PENTING</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {parentCallList.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-[10px] text-gray-400 uppercase font-black bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4">Nama Siswa</th>
                  <th className="px-8 py-4">Kelas</th>
                  <th className="px-8 py-4 text-center">Jumlah Pelanggaran</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parentCallList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-red-50/30 transition-colors group">
                    <td className="px-8 py-4 font-bold text-gray-800 group-hover:text-red-700">{s.name}</td>
                    <td className="px-8 py-4 font-medium text-gray-500">{s.class}</td>
                    <td className="px-8 py-4 text-center">
                      <span className="text-red-600 font-black text-lg">{s.count}x</span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-black px-4 py-2 rounded-lg transition-all uppercase tracking-widest shadow-sm">
                        Proses Panggilan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                <i className="fas fa-check-circle text-2xl text-green-400"></i>
              </div>
              <p className="text-sm font-medium italic tracking-wide">Tidak ada siswa yang perlu dipanggil saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
