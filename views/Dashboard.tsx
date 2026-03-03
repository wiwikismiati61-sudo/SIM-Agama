
import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Student, Transaction } from '../types';

interface DashboardProps {
  students: Student[];
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardProps> = ({ students, transactions }) => {
  const [selectedSubClass, setSelectedSubClass] = useState<Record<string, string>>({
    '7': 'Semua',
    '8': 'Semua',
    '9': 'Semua'
  });

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

  // Logic: Panggilan Orang Tua (> 2 kali pelanggaran)
  // Hitungan khusus: Sholat Dhuha & Dzuhur di hari yang sama dihitung 1 pelanggaran
  const studentViolations: Record<string, { count: number, details: string[] }> = {};
  
  const studentTx: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!studentTx[t.studentId]) studentTx[t.studentId] = [];
    studentTx[t.studentId].push(t);
  });

  Object.keys(studentTx).forEach(studentId => {
    const txs = studentTx[studentId];
    let count = 0;
    const details: string[] = [];
    
    const sholatByDate: Record<string, string[]> = {};
    
    txs.forEach(t => {
      const lower = t.program.toLowerCase();
      const isSholat = lower.includes('dhuha') || lower.includes('dzuhur') || lower.includes('dhuhur');
      
      if (isSholat) {
        if (!sholatByDate[t.date]) sholatByDate[t.date] = [];
        if (!sholatByDate[t.date].includes(t.program)) {
          sholatByDate[t.date].push(t.program);
        }
      } else {
        count++;
        details.push(`${t.program} (${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`);
      }
    });
    
    Object.keys(sholatByDate).forEach(date => {
      count++;
      const progs = sholatByDate[date].join(' & ');
      details.push(`${progs} (${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`);
    });
    
    studentViolations[studentId] = { count, details };
  });

  const parentCallList = Object.keys(studentViolations)
    .filter(id => studentViolations[id].count > 2)
    .map(id => {
      const student = students.find(s => String(s.id) === String(id));
      return student ? { ...student, count: studentViolations[id].count, details: studentViolations[id].details } : null;
    })
    .filter((item): item is (Student & { count: number, details: string[] }) => item !== null);

  // Logic: Pemantauan Kesehatan (Haid > 14 hari)
  const healthMonitoringList: (Student & { firstHaid: string, lastHaid: string, duration: number })[] = [];
  
  Object.keys(studentTx).forEach(studentId => {
    const txs = studentTx[studentId].filter(t => t.reason === 'Haid');
    if (txs.length === 0) return;

    // Group by month-year
    const haidByMonth: Record<string, string[]> = {};
    txs.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!haidByMonth[monthYear]) haidByMonth[monthYear] = [];
      haidByMonth[monthYear].push(t.date);
    });

    Object.keys(haidByMonth).forEach(monthYear => {
      const dates = haidByMonth[monthYear].sort();
      if (dates.length > 0) {
        const firstDate = new Date(dates[0]);
        const lastDate = new Date(dates[dates.length - 1]);
        const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 14) {
          const student = students.find(s => String(s.id) === String(studentId));
          if (student) {
            if (!healthMonitoringList.find(s => s.id === student.id)) {
              healthMonitoringList.push({
                ...student,
                firstHaid: dates[0],
                lastHaid: dates[dates.length - 1],
                duration: diffDays
              });
            }
          }
        }
      }
    });
  });

  const stats = [
    { label: 'Total Siswa Terdata', value: totalStudents, icon: 'fas fa-users', color: 'brand' },
    { label: 'Ketidakhadiran Hari Ini', value: absentsToday, icon: 'fas fa-calendar-day', color: 'indigo' },
    { label: 'Pulang Sebelum Waktu', value: earlyDepartures, icon: 'fas fa-clock', color: 'rose' },
    { label: 'Perlu Panggilan Ortu', value: parentCallList.length, icon: 'fas fa-phone-alt', color: 'amber' },
    { label: 'Screening Kesehatan', value: healthMonitoringList.length, icon: 'fas fa-notes-medical', color: 'rose' },
  ];

  const colorClasses: Record<string, { bg: string, text: string, iconBg: string, iconText: string, border: string }> = {
    brand: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-brand-50', iconText: 'text-brand-600', border: 'border-brand-500' },
    indigo: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', border: 'border-indigo-500' },
    rose: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-rose-50', iconText: 'text-rose-600', border: 'border-rose-500' },
    amber: { bg: 'bg-white', text: 'text-slate-800', iconBg: 'bg-amber-50', iconText: 'text-amber-600', border: 'border-amber-500' }
  };

  // Chart Data Preparation
  const participationData = [
    { name: 'Mengikuti', value: Math.max(0, totalStudents - absentsToday), color: '#10b981' }, // emerald-500
    { name: 'Tidak Mengikuti', value: absentsToday, color: '#f43f5e' } // rose-500
  ];

  const programCounts: Record<string, number> = {};
  transactions.forEach(t => {
    if (!programCounts[t.program]) programCounts[t.program] = 0;
    programCounts[t.program]++;
  });
  
  const programData = Object.keys(programCounts).map(key => ({
    name: key.length > 15 ? key.substring(0, 15) + '...' : key,
    fullName: key,
    jumlah: programCounts[key]
  })).sort((a, b) => b.jumlah - a.jumlah).slice(0, 5); // Top 5

  // Rekapitulasi per Siswa Kelas 7, 8, 9
  const classGroups = ['7', '8', '9'];
  const studentsByGrade: Record<string, (Student & { absences: number })[]> = {
    '7': [],
    '8': [],
    '9': []
  };
  const subClassesByGrade: Record<string, string[]> = {
    '7': [],
    '8': [],
    '9': []
  };

  students.forEach(s => {
    // Ambil karakter pertama dari kelas (misal: "7A" -> "7")
    const grade = s.class.charAt(0);
    if (classGroups.includes(grade)) {
      studentsByGrade[grade].push({
        ...s,
        absences: studentViolations[s.id]?.count || 0
      });
      if (!subClassesByGrade[grade].includes(s.class)) {
        subClassesByGrade[grade].push(s.class);
      }
    }
  });

  // Sort students by absences (descending) or by name
  Object.keys(studentsByGrade).forEach(grade => {
    studentsByGrade[grade].sort((a, b) => {
      if (b.absences !== a.absences) return b.absences - a.absences;
      return a.name.localeCompare(b.name);
    });
    subClassesByGrade[grade].sort();
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Ketercapaian Hari Ini */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Ketercapaian Kegiatan Hari Ini</h3>
            <p className="text-sm text-slate-500 mt-0.5">Persentase siswa yang mengikuti kegiatan keagamaan</p>
          </div>
          <div className="h-[320px] w-full relative mt-4">
            {totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Siswa`, 'Jumlah']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                Belum ada data siswa
              </div>
            )}
            {totalStudents > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-slate-800">
                  {Math.round(((totalStudents - absentsToday) / totalStudents) * 100)}%
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Hadir</span>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Ketidakikutsertaan per Kegiatan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Ketidakikutsertaan Terbanyak</h3>
            <p className="text-sm text-slate-500 mt-0.5">Berdasarkan jenis kegiatan keagamaan (Total)</p>
          </div>
          <div className="h-[320px] w-full mt-4">
            {programData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={programData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number, name: string, props: any) => [value, props.payload.fullName]}
                    labelStyle={{ display: 'none' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="jumlah" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                    {programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                Belum ada data ketidakhadiran
              </div>
            )}
          </div>
        </div>
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
                  <th className="px-6 py-4">Detail Pelanggaran</th>
                  <th className="px-6 py-4 text-center">Total Pelanggaran</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parentCallList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.class}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <ul className="list-disc list-inside space-y-1">
                        {s.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-sm">
                        {s.count} Kali
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

      {/* Health Monitoring Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-amber-50/50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <i className="fas fa-notes-medical text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base tracking-tight">Pemantauan Kesehatan (Screening)</h3>
              <p className="text-sm text-slate-500 mt-0.5">Siswa dengan siklus haid &gt; 14 hari</p>
            </div>
          </div>
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider inline-block text-center shadow-sm">Perlu Screening</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {healthMonitoringList.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Awal Haid</th>
                  <th className="px-6 py-4">Akhir Haid</th>
                  <th className="px-6 py-4 text-center">Durasi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {healthMonitoringList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.class}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(s.firstHaid).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(s.lastHaid).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                        {s.duration} Hari
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                        Tindak Lanjut
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
              <p className="text-sm font-medium text-slate-500">Tidak ada siswa yang memerlukan pemantauan kesehatan saat ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rekapitulasi per Siswa Kelas 7, 8, 9 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-50/50 px-6 py-5 border-b border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <i className="fas fa-user-graduate text-lg"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base tracking-tight">Rekapitulasi Ketidakikutsertaan Siswa</h3>
            <p className="text-sm text-slate-500 mt-0.5">Detail jumlah ketidakikutsertaan untuk kelas 7, 8, dan 9</p>
          </div>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {['7', '8', '9'].map(grade => {
            const filteredStudents = studentsByGrade[grade].filter(s => selectedSubClass[grade] === 'Semua' || s.class === selectedSubClass[grade]);
            
            return (
            <div key={grade} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <h4 className="font-bold text-slate-700">Kelas {grade}</h4>
                  <select 
                    className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    value={selectedSubClass[grade]}
                    onChange={(e) => setSelectedSubClass({...selectedSubClass, [grade]: e.target.value})}
                  >
                    <option value="Semua">Semua</option>
                    {subClassesByGrade[grade].map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md">
                  {filteredStudents.length} Siswa
                </span>
              </div>
              
              {/* Grafik Pelanggaran Siswa */}
              <div className="h-[250px] w-full border-b border-slate-100 p-4 bg-white">
                {filteredStudents.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredStudents}
                      margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }} 
                        tickFormatter={(name) => name.split(' ')[0]}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(value: number) => [value, 'Jumlah Pelanggaran']}
                        labelFormatter={(label) => `Siswa: ${label}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                      />
                      <Bar dataKey="absences" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        {filteredStudents.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.absences > 0 ? '#f43f5e' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    Belum ada data siswa
                  </div>
                )}
              </div>

              <div className="overflow-y-auto max-h-[300px] p-0 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredStudents.length > 0 ? (
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase font-semibold bg-white sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3 text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{student.name}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold ${student.absences > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {student.absences}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium py-8">
                    Belum ada data siswa kelas {grade}
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
