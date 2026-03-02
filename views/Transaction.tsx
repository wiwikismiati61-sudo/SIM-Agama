
import React, { useState, useEffect } from 'react';
import { Student, Program, Transaction, REASONS } from '../types';

interface TransactionProps {
  students: Student[];
  programs: Program[];
  onAddTransaction: (t: Transaction) => void;
}

const TransactionView: React.FC<TransactionProps> = ({ students, programs, onAddTransaction }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [manualProgram, setManualProgram] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const classes = [...new Set(students.map(s => s.class))].sort();
  const filteredStudents = students.filter(s => s.class === selectedClass).sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedReason || (!selectedProgram && !manualProgram)) {
      alert('Lengkapi semua data!');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    const newTrx: Transaction = {
      id: Date.now().toString(),
      date,
      time,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      program: selectedProgram === 'Lainnya' ? manualProgram : selectedProgram,
      reason: selectedReason
    };

    onAddTransaction(newTrx);
    alert('Data ketidakhadiran berhasil disimpan!');
    
    // Partially reset form
    setSelectedStudent('');
    setSelectedReason('');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h3 className="text-2xl font-black text-white tracking-tight relative z-10">Formulir Input Ketidakhadiran</h3>
          <p className="text-brand-100 text-sm font-medium mt-1 relative z-10">Catat ketidakhadiran siswa pada kegiatan keagamaan</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          {/* Row 1: DateTime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Kegiatan</label>
              <div className="relative">
                <i className="far fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-brand-500"></i>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jam Pelaksanaan</label>
              <div className="relative">
                <i className="far fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-brand-500"></i>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Row 2: Class & Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kelas</label>
              <select 
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Siswa</label>
              <select 
                value={selectedStudent}
                disabled={!selectedClass}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{selectedClass ? '-- Pilih Siswa --' : '-- Pilih Kelas Dulu --'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Program */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Kegiatan</label>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all cursor-pointer"
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
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-semibold text-slate-700 transition-all"
                />
              )}
            </div>
          </div>

          {/* Row 4: Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Alasan Tidak Mengikuti</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {REASONS.map((r, i) => (
                <label key={i} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
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
                  <span className="text-xs font-bold text-center">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] group flex items-center justify-center"
            >
              <i className="fas fa-save mr-3 group-hover:scale-110 transition-transform"></i>Simpan Data Absensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionView;
