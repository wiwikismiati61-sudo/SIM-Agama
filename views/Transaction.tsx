
import React, { useState, useEffect } from 'react';
import { Student, Program, Transaction, REASONS } from '../types';
import { Edit2, Trash2, X } from 'lucide-react';

interface TransactionProps {
  students: Student[];
  programs: Program[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onUpdateTransaction: (updated: Transaction) => Promise<void>;
  onDeleteMultipleTransactions?: (ids: string[]) => Promise<void>;
}

const TransactionView: React.FC<TransactionProps> = ({ 
  students, 
  programs, 
  transactions, 
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  onDeleteMultipleTransactions
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [manualProgram, setManualProgram] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Table State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDoubleOnly, setShowDoubleOnly] = useState(false);

  // Column filters
  const [filterDateCol, setFilterDateCol] = useState('');
  const [filterStudentCol, setFilterStudentCol] = useState('');
  const [filterClassCol, setFilterClassCol] = useState('');
  const [filterProgramCol, setFilterProgramCol] = useState('');
  const [filterReasonCol, setFilterReasonCol] = useState('');

  const classes = [...new Set(students.map(s => String(s.class || "")))].sort();
  const filteredStudents = students.filter(s => s.class === selectedClass).sort((a, b) => a.name.localeCompare(b.name));

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

    const colDateMatch = !filterDateCol || t.date === filterDateCol;
    const colStudentMatch = !filterStudentCol || t.studentName === filterStudentCol;
    const colClassMatch = !filterClassCol || t.class === filterClassCol;
    const colProgramMatch = !filterProgramCol || t.program === filterProgramCol;
    const colReasonMatch = !filterReasonCol || t.reason === filterReasonCol;

    return colDateMatch && colStudentMatch && colClassMatch && colProgramMatch && colReasonMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isProgramValid = selectedProgram && (selectedProgram !== 'Lainnya' || String(manualProgram || "").trim() !== '');

    if (!selectedStudent || !selectedReason || !isProgramValid) {
      setMessage({type: 'error', text: 'Lengkapi semua data!'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const student = students.find(s => String(s.id) === String(selectedStudent));
    if (!student) {
      setMessage({type: 'error', text: 'Siswa tidak ditemukan!'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const newTrx: Transaction = {
      id: Date.now().toString(),
      date: date || "",
      time: time || "",
      studentId: String(student.id || ""),
      studentName: student.name || "",
      class: student.class || "",
      program: selectedProgram === 'Lainnya' ? String(manualProgram || "").trim() : String(selectedProgram || ""),
      reason: selectedReason || ""
    };

    try {
      await onAddTransaction(newTrx);
      setMessage({type: 'success', text: 'Data ketidakhadiran berhasil disimpan!'});
      setTimeout(() => setMessage(null), 3000);
      
      // Partially reset form
      setSelectedStudent('');
      setSelectedReason('');
      setManualProgram('');
    } catch (error: any) {
      setMessage({type: 'error', text: 'Gagal menyimpan data: ' + (error.message || 'Error tidak diketahui')});
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-bold animate-in slide-in-from-top-10 fade-in duration-300 ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
          <span>{message.text}</span>
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-5 md:px-8 md:py-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight relative z-10">Formulir Input Ketidakhadiran</h3>
          <p className="text-brand-100 text-xs md:text-sm font-medium mt-1 relative z-10">Catat ketidakhadiran siswa pada kegiatan keagamaan</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 md:space-y-8">
          {/* Row 1: DateTime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Kegiatan</label>
              <div className="relative">
                <i className="far fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-brand-500"></i>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jam Pelaksanaan</label>
              <div className="relative">
                <i className="far fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-brand-500"></i>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Row 2: Class & Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kelas</label>
              <select 
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Siswa</label>
              <select 
                value={selectedStudent}
                disabled={!selectedClass}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{selectedClass ? '-- Pilih Siswa --' : '-- Pilih Kelas Dulu --'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Program */}
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kegiatan</label>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="">-- Pilih Kegiatan --</option>
                {programs.map(p => <option key={p.id} value={p.name}>{p.name} ({p.time})</option>)}
                <option value="Lainnya">-- Kegiatan Lainnya (Manual) --</option>
              </select>
              {selectedProgram === 'Lainnya' && (
                <input 
                  type="text"
                  placeholder="Nama kegiatan manual..."
                  value={manualProgram}
                  onChange={(e) => setManualProgram(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-sm md:text-base font-semibold text-slate-700 transition-all"
                />
              )}
            </div>
          </div>

          {/* Row 4: Reason */}
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Alasan Tidak Mengikuti</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
              {REASONS.map((r, i) => (
                <label key={i} className={`flex flex-col items-center justify-center p-2.5 md:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedReason === r 
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="reason" 
                    value={r}
                    className="hidden"
                    onChange={(e) => setSelectedReason(e.target.value)}
                    checked={selectedReason === r}
                  />
                  <span className="text-[10px] md:text-xs font-bold text-center">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 md:pt-6">
            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-base md:text-lg py-3 md:py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] group flex items-center justify-center"
            >
              <i className="fas fa-save mr-3 group-hover:scale-110 transition-transform"></i>Simpan Data Absensi
            </button>
          </div>
        </form>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mt-8">
        <div className="p-6 border-b border-black/5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showDoubleOnly} 
                onChange={e => setShowDoubleOnly(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Show Duplicates Only
            </label>
            {showDoubleOnly && duplicateKeys.size > 0 && onDeleteMultipleTransactions && (
              <button
                onClick={async () => {
                  const toDelete: string[] = [];
                  const keysSeen = new Set<string>();
                  transactions.forEach(t => {
                    const key = `${t.studentId}-${t.date}-${t.time}-${t.program}`;
                    if (duplicateKeys.has(key)) {
                      if (keysSeen.has(key)) {
                        toDelete.push(t.id!);
                      } else {
                        keysSeen.add(key);
                      }
                    }
                  });
                  if (confirm(`Delete ${toDelete.length} duplicate entries?`)) {
                    try {
                      await onDeleteMultipleTransactions(toDelete);
                      setMessage({type: 'success', text: 'Data duplikat berhasil dihapus!'});
                      setTimeout(() => setMessage(null), 3000);
                    } catch (error: any) {
                      setMessage({type: 'error', text: 'Gagal menghapus data: ' + (error.message || 'Error tidak diketahui')});
                      setTimeout(() => setMessage(null), 5000);
                    }
                  }
                }}
                className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                Clean Duplicates
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">
                  <div className="flex flex-col gap-2">
                    <span>Date</span>
                    <select 
                      value={filterDateCol} 
                      onChange={e => setFilterDateCol(e.target.value)}
                      className="text-[10px] font-normal normal-case p-1 border rounded bg-white"
                    >
                      <option value="">All</option>
                      {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">
                  <div className="flex flex-col gap-2">
                    <span>Student</span>
                    <select 
                      value={filterStudentCol} 
                      onChange={e => setFilterStudentCol(e.target.value)}
                      className="text-[10px] font-normal normal-case p-1 border rounded bg-white"
                    >
                      <option value="">All</option>
                      {uniqueStudents.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">
                  <div className="flex flex-col gap-2">
                    <span>Class</span>
                    <select 
                      value={filterClassCol} 
                      onChange={e => setFilterClassCol(e.target.value)}
                      className="text-[10px] font-normal normal-case p-1 border rounded bg-white"
                    >
                      <option value="">All</option>
                      {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">
                  <div className="flex flex-col gap-2">
                    <span>Program</span>
                    <select 
                      value={filterProgramCol} 
                      onChange={e => setFilterProgramCol(e.target.value)}
                      className="text-[10px] font-normal normal-case p-1 border rounded bg-white"
                    >
                      <option value="">All</option>
                      {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">
                  <div className="flex flex-col gap-2">
                    <span>Reason</span>
                    <select 
                      value={filterReasonCol} 
                      onChange={e => setFilterReasonCol(e.target.value)}
                      className="text-[10px] font-normal normal-case p-1 border rounded bg-white"
                    >
                      <option value="">All</option>
                      {uniqueReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-black/5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((t) => (
                <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${duplicateKeys.has(`${t.studentId}-${t.date}-${t.time}-${t.program}`) ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 text-sm text-gray-600">{t.date}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{t.studentName}</td>
                  <td className="p-4 text-sm text-gray-600">{t.class}</td>
                  <td className="p-4 text-sm text-gray-600">{t.program}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.reason === 'Hadir' ? 'bg-emerald-50 text-emerald-700' :
                      t.reason === 'Izin' ? 'bg-blue-50 text-blue-700' :
                      t.reason === 'Sakit' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {t.reason}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(t.id!);
                          setEditData({...t});
                        }}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(t.id!)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    No transactions found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && editData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <input 
                  type="text" 
                  value={editData.studentName} 
                  disabled 
                  className="w-full px-4 py-2 bg-gray-50 border border-black/10 rounded-xl text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editData.date} 
                    onChange={e => setEditData({...editData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-black/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={editData.time} 
                    onChange={e => setEditData({...editData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-black/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <select 
                  value={editData.program} 
                  onChange={e => setEditData({...editData, program: e.target.value})}
                  className="w-full px-4 py-2 border border-black/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select 
                  value={editData.reason} 
                  onChange={e => setEditData({...editData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-black/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea 
                  value={editData.note || ''} 
                  onChange={e => setEditData({...editData, note: e.target.value})}
                  className="w-full px-4 py-2 border border-black/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await onUpdateTransaction(editData);
                    setEditingId(null);
                    setMessage({type: 'success', text: 'Data berhasil diupdate!'});
                    setTimeout(() => setMessage(null), 3000);
                  } catch (error: any) {
                    setMessage({type: 'error', text: 'Gagal update data: ' + (error.message || 'Error tidak diketahui')});
                    setTimeout(() => setMessage(null), 5000);
                  }
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-black/10 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await onDeleteTransaction(deleteConfirmId);
                    setDeleteConfirmId(null);
                    setMessage({type: 'success', text: 'Data berhasil dihapus!'});
                    setTimeout(() => setMessage(null), 3000);
                  } catch (error: any) {
                    setMessage({type: 'error', text: 'Gagal menghapus data: ' + (error.message || 'Error tidak diketahui')});
                    setTimeout(() => setMessage(null), 5000);
                  }
                }}
                className="flex-1 px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TransactionView;
