
import React, { useState } from 'react';
import { Auth } from '../types';

interface SettingsProps {
  onUpdateAuth: (newAuth: Auth) => void;
  onRestore: (data: any) => void;
  data: any;
}

const SettingsView: React.FC<SettingsProps> = ({ onUpdateAuth, onRestore, data }) => {
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');

  const handleUpdateAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (newU && newP) {
      if (confirm('Password akan diperbarui dan Anda akan diminta login ulang. Lanjutkan?')) {
        onUpdateAuth({ user: newU, pass: newP });
      }
    }
  };

  const backupData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_sim_agama_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.students && json.transactions) {
          onRestore(json);
          alert('Database berhasil dipulihkan!');
        } else {
          alert('Format file tidak valid. Pastikan file backup berasal dari aplikasi ini.');
        }
      } catch (err) {
        alert('Gagal memproses file. File mungkin rusak.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAllData = () => {
    if (confirm('PERINGATAN! Ini akan menghapus seluruh database (siswa, absensi, jadwal, dll) secara permanen. Apakah Anda yakin ingin melanjutkan?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* Auth Security */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-yellow-500">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Keamanan Akun</h3>
        </div>
        
        <form onSubmit={handleUpdateAuth} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Username Baru</label>
            <input 
              type="text" 
              value={newU}
              onChange={(e) => setNewU(e.target.value)}
              className="w-full border-2 border-gray-50 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none" 
              placeholder="Username baru..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password Baru</label>
            <input 
              type="text" 
              value={newP}
              onChange={(e) => setNewP(e.target.value)}
              className="w-full border-2 border-gray-50 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none" 
              placeholder="Password baru..."
            />
          </div>
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-100 active:scale-95">
            Simpan Perubahan
          </button>
        </form>
      </div>

      {/* Database Management */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <i className="fas fa-database"></i>
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Manajemen Database</h3>
        </div>
        <p className="text-sm text-gray-500 mb-8 font-medium italic">Gunakan fitur ini untuk menyimpan data ke file lokal agar tidak hilang saat browser ditutup atau cache dibersihkan.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={backupData} 
            className="group flex flex-col items-center justify-center p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-cloud-download-alt text-3xl"></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Backup Data</span>
            <span className="text-[9px] font-medium opacity-60 mt-1 uppercase tracking-widest">(Download JSON)</span>
          </button>
          
          <label className="group flex flex-col items-center justify-center p-8 bg-slate-700 hover:bg-slate-800 text-white rounded-3xl shadow-xl shadow-slate-100 transition-all active:scale-95 cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-cloud-upload-alt text-3xl"></i>
            </div>
            <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Restore Data</span>
            <span className="text-[9px] font-medium opacity-60 mt-1 uppercase tracking-widest">(Upload JSON)</span>
          </label>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-red-500 space-x-2">
            <i className="fas fa-exclamation-triangle text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Zona Berbahaya</span>
          </div>
          <button 
            onClick={clearAllData} 
            className="text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-red-100"
          >
            Hapus Seluruh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
