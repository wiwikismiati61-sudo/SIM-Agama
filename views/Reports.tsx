
import React, { useState } from 'react';
import { Student, Transaction, REASONS } from '../types';
import * as XLSX from 'xlsx';

interface ReportProps {
  students: Student[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (updated: Transaction) => void;
}

const ReportView: React.FC<ReportProps> = ({ students, transactions, onDeleteTransaction, onUpdateTransaction }) => {
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const classes = [...new Set(students.map(s => s.class))].sort();

  const filtered = transactions.filter(t => {
    const classMatch = filterClass === 'all' || t.class === filterClass;
    let dateMatch = false;
    if (filterType === 'daily') {
      dateMatch = t.date === filterDate;
    } else if (filterType === 'weekly') {
      dateMatch = t.date >= filterWeekStart && t.date <= filterWeekEnd;
    } else {
      dateMatch = !filterMonth || t.date.startsWith(filterMonth);
    }
    return classMatch && dateMatch;
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

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditData({ ...t });
  };

  const handleUpdate = () => {
    if (editData) {
      onUpdateTransaction(editData);
      setEditingId(null);
      setEditData(null);
    }
  };

  const confirmDelete = (id: string) => {
    onDeleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
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
            <button 
              onClick={downloadExcel}
              className="mt-auto h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center active:scale-[0.98]"
            >
              <i className="fas fa-file-excel mr-2"></i>Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left text-slate-600" id="reportTable">
            <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Hari, Tanggal</th>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Kegiatan</th>
                <th className="px-6 py-4">Alasan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-semibold">
                      {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{t.time}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{t.studentName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{t.class}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{t.program}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs border border-brand-100">
                      {t.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button 
                      onClick={() => startEdit(t)} 
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 mr-2 transition-colors"
                      title="Edit Data"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(t.id)} 
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Data"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
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

      {/* Edit Modal Overlay */}
      {editingId && editData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mr-3">
                  <i className="fas fa-edit"></i>
                </div>
                Edit Data Absensi
              </h3>
              <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                  <input 
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jam</label>
                  <input 
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Siswa</label>
                <input 
                  type="text" 
                  value={`${editData.studentName} (${editData.class})`}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alasan</label>
                <select 
                  value={editData.reason}
                  onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all cursor-pointer"
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setEditingId(null)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
              <button onClick={handleUpdate} className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-[0.98]">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Hapus Data?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Apakah Anda benar-benar ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => confirmDelete(deleteConfirmId)} 
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/30 active:scale-[0.98]"
              >
                Ya, Hapus Sekarang
              </button>
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all"
              >
                Tidak, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportView;
