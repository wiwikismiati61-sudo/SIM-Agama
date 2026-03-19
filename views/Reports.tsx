
import React, { useState } from 'react';
import { Student, Transaction, REASONS } from '../types';
import * as XLSX from 'xlsx';

interface ReportProps {
  students: Student[];
  transactions: Transaction[];
}

const ReportView: React.FC<ReportProps> = ({ students, transactions }) => {
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [filterWeekStart, setFilterWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  });
  const [filterWeekEnd, setFilterWeekEnd] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 6;
    const end = new Date(d);
    end.setDate(diff);
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [showDoubleOnly, setShowDoubleOnly] = useState(false);

  // Column filters
  const [filterDateCol, setFilterDateCol] = useState('');
  const [filterStudentCol, setFilterStudentCol] = useState('');
  const [filterClassCol, setFilterClassCol] = useState('');
  const [filterProgramCol, setFilterProgramCol] = useState('');
  const [filterReasonCol, setFilterReasonCol] = useState('');

  const classes = [...new Set(students.map(s => String(s.class || "")))].sort();

  // Unique values for automatic column filters
  const uniqueDates = Array.from<string>(new Set(transactions.map(t => String(t.date || "")))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const uniqueStudents = Array.from<string>(new Set(transactions.map(t => String(t.studentName || "")))).sort();
  const uniqueClasses = Array.from<string>(new Set(transactions.map(t => String(t.class || "")))).sort();
  const uniquePrograms = Array.from<string>(new Set(transactions.map(t => String(t.program || "")))).sort();
  const uniqueReasons = Array.from<string>(new Set(transactions.map(t => String(t.reason || "")))).sort();

  const duplicateKeys = new Set<string>();
  const seenKeys = new Set<string>();
  
  transactions.forEach(t => {
    const key = `${t.studentId}-${t.date}-${t.time}-${t.program}`;
    if (seenKeys.has(key)) {
      duplicateKeys.add(key);
    } else {
      seenKeys.add(key);
    }
  });

  const filtered = transactions.filter(t => {
    if (showDoubleOnly) {
      const key = `${t.studentId}-${t.date}-${t.time}-${t.program}`;
      if (!duplicateKeys.has(key)) return false;
    }

    const classMatch = filterClass === 'all' || t.class === filterClass;
    let dateMatch = false;
    if (filterType === 'daily') {
      dateMatch = t.date === filterDate;
    } else if (filterType === 'weekly') {
      dateMatch = t.date >= filterWeekStart && t.date <= filterWeekEnd;
    } else {
      dateMatch = !filterMonth || String(t.date || "").startsWith(filterMonth);
    }
    
    const colDateMatch = !filterDateCol || t.date === filterDateCol;
    const colStudentMatch = !filterStudentCol || t.studentName === filterStudentCol;
    const colClassMatch = !filterClassCol || t.class === filterClassCol;
    const colProgramMatch = !filterProgramCol || t.program === filterProgramCol;
    const colReasonMatch = !filterReasonCol || t.reason === filterReasonCol;

    return classMatch && dateMatch && colDateMatch && colStudentMatch && colClassMatch && colProgramMatch && colReasonMatch;
  });

  const downloadExcel = () => {
    const table = document.getElementById("reportTable");
    if (!table) return;
    let periodStr = filterDate;
    if (filterType === 'weekly') periodStr = `${filterWeekStart}_sd_${filterWeekEnd}`;
    if (filterType === 'monthly') periodStr = filterMonth || 'Total';
    
    const filename = `Laporan_Absensi_${periodStr}.xlsx`;
    const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan" });
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Laporan Absensi {filterType === 'daily' ? 'Harian' : filterType === 'weekly' ? 'Mingguan' : 'Bulanan'}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Arsip lengkap data ketidakhadiran siswa</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tipe Laporan</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Pilih Kelas</label>
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{filterType === 'daily' ? 'Pilih Tanggal' : filterType === 'weekly' ? 'Pilih Minggu' : 'Pilih Bulan'}</label>
              {filterType === 'daily' ? (
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all" 
                />
              ) : filterType === 'weekly' ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={filterWeekStart}
                    onChange={(e) => setFilterWeekStart(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all text-sm" 
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input 
                    type="date" 
                    value={filterWeekEnd}
                    onChange={(e) => setFilterWeekEnd(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all text-sm" 
                  />
                </div>
              ) : (
                <input 
                  type="month" 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all" 
                />
              )}
            </div>
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => setShowDoubleOnly(!showDoubleOnly)}
                className={`h-[46px] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center active:scale-[0.98] border ${showDoubleOnly ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-inner' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="Tampilkan hanya data yang memiliki duplikat pada hari yang sama"
              >
                <i className={`fas fa-copy mr-2 ${showDoubleOnly ? 'text-amber-600' : 'text-slate-400'}`}></i>
                Data Ganda
              </button>
              <button 
                onClick={downloadExcel}
                className="h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center active:scale-[0.98]"
              >
                <i className="fas fa-file-excel mr-2"></i>Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left text-slate-600" id="reportTable">
            <thead className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex flex-col gap-2">
                    <span>Hari, Tanggal</span>
                    <select 
                      value={filterDateCol}
                      onChange={(e) => setFilterDateCol(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-normal border border-slate-200 rounded focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">Semua Tanggal</option>
                      {uniqueDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex flex-col gap-2">
                    <span>Siswa</span>
                    <select 
                      value={filterStudentCol}
                      onChange={(e) => setFilterStudentCol(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-normal border border-slate-200 rounded focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">Semua Siswa</option>
                      {uniqueStudents.map(student => (
                        <option key={student} value={student}>{student}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex flex-col gap-2">
                    <span>Kelas</span>
                    <select 
                      value={filterClassCol}
                      onChange={(e) => setFilterClassCol(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-normal border border-slate-200 rounded focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">Semua Kelas</option>
                      {uniqueClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex flex-col gap-2">
                    <span>Kegiatan</span>
                    <select 
                      value={filterProgramCol}
                      onChange={(e) => setFilterProgramCol(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-normal border border-slate-200 rounded focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">Semua Kegiatan</option>
                      {uniquePrograms.map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex flex-col gap-2">
                    <span>Alasan</span>
                    <select 
                      value={filterReasonCol}
                      onChange={(e) => setFilterReasonCol(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-normal border border-slate-200 rounded focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="">Semua Alasan</option>
                      {uniqueReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(t => {
                const isDuplicate = duplicateKeys.has(`${t.studentId}-${t.date}-${t.time}-${t.program}`);
                return (
                <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors group ${isDuplicate && showDoubleOnly ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="text-slate-800 font-semibold">
                      {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">{t.time}</div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{t.studentName}</span>
                      {isDuplicate && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" title="Data Ganda pada hari yang sama">
                          Ganda
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px] md:text-xs border border-slate-200">{t.class}</span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-slate-600">{t.program}</td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-[10px] md:text-xs border border-brand-100">
                      {t.reason}
                    </span>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <i className="far fa-folder-open text-4xl text-slate-300"></i>
                      <p>Tidak ada data untuk periode ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
