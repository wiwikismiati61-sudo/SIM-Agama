
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Program Keagamaan</h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Jadwal kegiatan rutin sekolah</p>
          </div>
          <button 
            onClick={() => { setModalType('program'); setFormData({ name: '', val: '' }); }}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            <i className="fas fa-plus mr-2"></i>Tambah Program
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-gray-50">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-indigo-600 uppercase font-black bg-indigo-50/50">
              <tr>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {programs.map(p => (
                <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-indigo-500 bg-white border border-indigo-100 px-3 py-1 rounded-full">{p.time}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setDeleteTarget({ type: 'program', id: p.id, name: p.name })} className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Data Siswa</h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Basis data siswa terintegrasi</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <label className="flex-1 md:flex-none cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-center shadow-md active:scale-95">
              <i className="fas fa-file-excel mr-2"></i>Upload Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
            </label>
            <button 
              onClick={() => { setModalType('student'); setFormData({ name: '', val: '' }); }}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              <i className="fas fa-user-plus mr-2"></i>Tambah Manual
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] rounded-xl border border-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-blue-600 uppercase font-black bg-blue-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length > 0 ? students.map(s => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{s.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-md border border-gray-200 uppercase">{s.class}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setDeleteTarget({ type: 'student', id: s.id, name: s.name })} className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">Belum ada data siswa. Silakan upload file excel atau tambah manual.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest italic">*Format Excel: Kolom A = Nama, Kolom B = Kelas (Header di baris 1)</p>
      </div>

      {/* Add/Edit Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-6">
              Tambah {modalType === 'program' ? 'Program' : 'Siswa'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nama {modalType === 'program' ? 'Kegiatan' : 'Siswa'}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  placeholder={`Masukkan nama ${modalType === 'program' ? 'kegiatan' : 'siswa'}...`}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{modalType === 'program' ? 'Waktu (contoh: 07:00)' : 'Kelas'}</label>
                <input 
                  type="text" 
                  value={formData.val}
                  onChange={(e) => setFormData({ ...formData, val: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  placeholder={`Masukkan ${modalType === 'program' ? 'waktu' : 'kelas'}...`}
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setModalType(null)} className="flex-1 px-6 py-3 border-2 border-gray-100 rounded-xl text-gray-400 font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Batal</button>
              <button onClick={saveForm} className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Hapus Data?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">
              Anda akan menghapus data {deleteTarget.type === 'program' ? 'program' : 'siswa'}: <br />
              <strong className="font-bold text-gray-700">"{deleteTarget.name}"</strong>.
              <br />Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                Ya, Hapus
              </button>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="w-full py-4 border-2 border-gray-100 hover:bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
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
