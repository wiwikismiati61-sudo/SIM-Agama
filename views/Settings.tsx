
import React, { useState } from 'react';
import { Auth } from '../types';

interface SettingsProps {
  onUpdateAuth: (newAuth: Auth) => void;
  onRestore: (data: any) => Promise<void>;
  data: any;
  isFirebaseLoggedIn: boolean;
}

const SettingsView: React.FC<SettingsProps> = ({ onUpdateAuth, onRestore, data, isFirebaseLoggedIn }) => {
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [confirmAction, setConfirmAction] = useState<{type: 'auth' | 'clear', title: string, desc: string} | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({type, text});
    setTimeout(() => setMessage(null), 3000);
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'clear') {
      if (!isFirebaseLoggedIn) {
        showMessage('error', 'Anda harus login dengan Google untuk menghapus data di server.');
        setConfirmAction(null);
        return;
      }
      localStorage.clear();
      window.location.reload();
    }
    setConfirmAction(null);
  };

  const backupData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_sim_agama_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showMessage('success', 'Data backup berhasil diunduh!');
    alert('Data backup berhasil diunduh!');
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFirebaseLoggedIn) {
      showMessage('error', 'Anda harus login dengan Google untuk memulihkan data ke server.');
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.students && json.transactions) {
          await onRestore(json);
          showMessage('success', 'Data restore berhasil dipulihkan!');
          alert('Data restore berhasil dipulihkan!');
        } else {
          showMessage('error', 'Format file tidak valid. Pastikan file backup berasal dari aplikasi ini.');
        }
      } catch (err) {
        showMessage('error', 'Gagal memproses file atau izin ditolak.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAllData = () => {
    setConfirmAction({
      type: 'clear',
      title: 'Hapus Seluruh Data?',
      desc: 'PERINGATAN! Ini akan menghapus seluruh database (siswa, absensi, jadwal, dll) secara permanen. Apakah Anda yakin ingin melanjutkan?'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      {message && (
        <div className={`fixed top-6 right-6 z-[100] p-4 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-bold animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Database Management */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-inner">
            <i className="fas fa-database text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Database</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Backup dan restore data sistem</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-8 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
          <i className="fas fa-info-circle text-brand-500 mr-2"></i>
          Gunakan fitur ini untuk menyimpan data ke file lokal agar tidak hilang saat browser ditutup atau cache dibersihkan.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button 
            onClick={backupData} 
            className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 hover:border-brand-200 hover:bg-brand-50/50 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <i className="fas fa-cloud-download-alt text-2xl"></i>
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700">Backup Data</span>
            <span className="text-xs font-medium text-slate-400 mt-1">Unduh file JSON</span>
          </button>
          
          <label className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl transition-all active:scale-[0.98] cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <i className="fas fa-cloud-upload-alt text-2xl"></i>
            </div>
            <input type="file" className="hidden" accept="*/*" onChange={handleRestore} />
            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Restore Data</span>
            <span className="text-xs font-medium text-slate-400 mt-1">Unggah file JSON</span>
          </label>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center text-rose-500 space-x-3 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-xs font-bold uppercase tracking-wider">Zona Berbahaya</span>
          </div>
          <button 
            onClick={clearAllData} 
            className="w-full sm:w-auto text-sm font-bold text-rose-600 bg-white hover:bg-rose-600 hover:text-white px-5 py-2.5 rounded-xl transition-all border border-rose-200 hover:border-rose-600 shadow-sm"
          >
            Hapus Seluruh Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-100">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ${confirmAction.type === 'clear' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              <i className={`fas ${confirmAction.type === 'clear' ? 'fa-trash-alt' : 'fa-shield-alt'}`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">{confirmAction.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              {confirmAction.desc}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeConfirmAction}
                className={`w-full py-3.5 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.98] ${confirmAction.type === 'clear' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}
              >
                Ya, Lanjutkan
              </button>
              <button 
                onClick={() => setConfirmAction(null)}
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

export default SettingsView;
