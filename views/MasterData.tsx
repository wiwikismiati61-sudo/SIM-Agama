
import React, { useState } from 'react';
import { Student, Program } from '../types';
import * as XLSX from 'xlsx';

interface MasterProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
}

const MasterView: React.FC<MasterProps> = ({ students, setStudents, programs, setPrograms }) => {
  const [modalType, setModalType] = useState<'program' | 'student' | null>(null);
  const [formData, setFormData] = useState({ name: '', val: '' });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'program' | 'student', id: string, name: string } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'program') {
      setPrograms(programs.filter(p => p.id !== deleteTarget.id));
    } else {
      setStudents(students.filter(s => s.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) {
          alert('File Excel kosong atau tidak memiliki data.');
          return;
        }

        const newStudents: Student[] = [];
        data.slice(1).forEach((row, i) => {
          if (row && row[0] && row[1]) {
            newStudents.push({
              id: Date.now().toString() + i,
              name: String(row[0]).trim(),
              class: String(row[1]).trim()
            });
          }
        });
        
        if (newStudents.length > 0) {
          setStudents(prev => [...prev, ...newStudents]);
          alert(`Berhasil mengimpor ${newStudents.length} data siswa baru.`);
        } else {
          alert('Tidak ada data siswa valid yang ditemukan di file Excel.');
        }
      } catch (error) {
        alert('Terjadi kesalahan saat membaca file Excel. Pastikan formatnya benar.');
        console.error("Excel read error:", error);
      }
    };
    reader.onerror = () => {
        alert('Gagal membaca file.');
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const saveForm = () => {
    if (!formData.name.trim() || !formData.val.trim()) {
      alert('Semua kolom harus diisi.');
      return;
    }

    if (modalType === 'program') {
      setPrograms([...programs, { id: Date.now().toString(), name: formData.name.trim(), time: formData.val.trim() }]);
    } else if (modalType === 'student') {
      setStudents([...students, { id: Date.now().toString(), name: formData.name.trim(), class: formData.val.trim() }]);
    }

    setModalType(null);
    setFormData({ name: '', val: '' });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Program Management */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Program Keagamaan</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Jadwal kegiatan rutin sekolah</p>
          </div>
          <button 
            onClick={() => { setModalType('program'); setFormData({ name: '', val: '' }); }}
            className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98] flex items-center justify-center"
          >
            <i className="fas fa-plus mr-2"></i>Tambah Program
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{p.time}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setDeleteTarget({ type: 'program', id: p.id, name: p.name })} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Management */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Data Siswa</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Basis data siswa terintegrasi</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <label className="flex-1 md:flex-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-center shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center">
              <i className="fas fa-file-excel mr-2"></i>Upload Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
            </label>
            <button 
              onClick={() => { setModalType('student'); setFormData({ name: '', val: '' }); }}
              className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98] flex items-center justify-center"
            >
              <i className="fas fa-user-plus mr-2"></i>Tambah Manual
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] rounded-2xl border border-slate-200 scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length > 0 ? students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{s.class}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setDeleteTarget({ type: 'student', id: s.id, name: s.name })} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <i className="far fa-user text-4xl text-slate-300"></i>
                      <p>Belum ada data siswa. Silakan upload file excel atau tambah manual.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-4 font-medium italic">*Format Excel: Kolom A = Nama, Kolom B = Kelas (Header di baris 1)</p>
      </div>

      {/* Add/Edit Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mr-3">
                <i className={`fas ${modalType === 'program' ? 'fa-calendar-plus' : 'fa-user-plus'}`}></i>
              </div>
              Tambah {modalType === 'program' ? 'Program' : 'Siswa'}
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama {modalType === 'program' ? 'Kegiatan' : 'Siswa'}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all"
                  placeholder={`Masukkan nama ${modalType === 'program' ? 'kegiatan' : 'siswa'}...`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{modalType === 'program' ? 'Waktu (contoh: 07:00)' : 'Kelas'}</label>
                <input 
                  type="text" 
                  value={formData.val}
                  onChange={(e) => setFormData({ ...formData, val: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all"
                  placeholder={`Masukkan ${modalType === 'program' ? 'waktu' : 'kelas'}...`}
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setModalType(null)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
              <button onClick={saveForm} className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98]">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Hapus Data?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Anda akan menghapus data {deleteTarget.type === 'program' ? 'program' : 'siswa'}: <br />
              <strong className="font-bold text-slate-700">"{deleteTarget.name}"</strong>.
              <br />Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmDelete}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/30 active:scale-[0.98]"
              >
                Ya, Hapus
              </button>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterView;
