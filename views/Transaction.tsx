
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
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-8 py-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Formulir Input Ketidakhadiran</h3>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Catat ketidakhadiran siswa pada kegiatan keagamaan</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {/* Row 1: DateTime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Kegiatan</label>
              <div className="relative">
                <i className="far fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"></i>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-50 px-12 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jam Pelaksanaan</label>
              <div className="relative">
                <i className="far fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"></i>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-50 px-12 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Row 2: Class & Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pilih Kelas</label>
              <select 
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pilih Siswa</label>
              <select 
                value={selectedStudent}
                disabled={!selectedClass}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{selectedClass ? '-- Pilih Siswa --' : '-- Pilih Kelas Dulu --'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Program */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nama Kegiatan</label>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="flex-1 bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all appearance-none cursor-pointer"
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
                  className="flex-1 bg-gray-50 border-2 border-gray-50 px-6 py-4 rounded-2xl focus:bg-white focus:border-blue-200 focus:outline-none font-bold transition-all"
                />
              )}
            </div>
          </div>

          {/* Row 4: Reason */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Alasan Tidak Mengikuti</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {REASONS.map((r, i) => (
                <label key={i} className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedReason === r 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-105' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                }`}>
                  <input 
                    type="radio" 
                    name="reason" 
                    value={r}
                    className="hidden"
                    onChange={(e) => setSelectedReason(e.target.value)}
                    checked={selectedReason === r}
                  />
                  <span className="text-[10px] font-black uppercase text-center">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] py-6 rounded-3xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 group"
            >
              <i className="fas fa-save mr-3 group-hover:animate-bounce"></i>Simpan Data Absensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionView;
