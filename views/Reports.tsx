
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
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const classes = [...new Set(students.map(s => s.class))].sort();

  const filtered = transactions.filter(t => {
    const classMatch = filterClass === 'all' || t.class === filterClass;
    const monthMatch = !filterMonth || t.date.startsWith(filterMonth);
    return classMatch && monthMatch;
  });

  const downloadExcel = () => {
    const table = document.getElementById("reportTable");
    if (!table) return;
    const filename = `Laporan_Absensi_${filterMonth || 'Total'}.xlsx`;
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
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Laporan Absensi Bulanan</h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Arsip lengkap data ketidakhadiran siswa</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Pilih Kelas</label>
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full border-2 border-gray-100 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Pilih Bulan</label>
              <input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full border-2 border-gray-100 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold" 
              />
            </div>
            <button 
              onClick={downloadExcel}
              className="mt-auto h-11 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-200 flex items-center"
            >
              <i className="fas fa-download mr-2"></i>Download Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm text-left" id="reportTable">
            <thead className="text-[10px] text-gray-400 uppercase font-black bg-gray-50/50">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Kegiatan</th>
                <th className="px-6 py-4">Alasan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-gray-800 font-bold">{t.date}</div>
                    <div className="text-[10px] text-gray-400 font-black tracking-widest">{t.time}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{t.studentName}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md uppercase">{t.class}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 italic">{t.program}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-tight">
                      {t.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button 
                      onClick={() => startEdit(t)} 
                      className="w-8 h-8 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 mr-2 transition-colors"
                      title="Edit Data"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(t.id)} 
                      className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Data"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic font-medium">Tidak ada data untuk periode ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingId && editData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center">
                <i className="fas fa-edit mr-3 text-blue-600"></i>Edit Data Absensi
              </h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal</label>
                  <input 
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jam</label>
                  <input 
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Siswa</label>
                <input 
                  type="text" 
                  value={`${editData.studentName} (${editData.class})`}
                  disabled
                  className="w-full bg-gray-50 border-2 border-gray-50 px-4 py-3 rounded-2xl font-bold text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Alasan</label>
                <select 
                  value={editData.reason}
                  onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                  className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={() => setEditingId(null)} className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Batal</button>
              <button onClick={handleUpdate} className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Hapus Data?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">
              Apakah Anda benar-benar ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => confirmDelete(deleteConfirmId)} 
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                Ya, Hapus Sekarang
              </button>
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="w-full py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
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
