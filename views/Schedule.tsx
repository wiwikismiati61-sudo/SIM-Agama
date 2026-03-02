
import React, { useState } from 'react';
import { Schedule } from '../types';
import * as XLSX from 'xlsx';

interface ScheduleProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

const ACTIVITIES = [
  'Pembiasaan Sholat Dhuhur berjamaah', 
  'Pembiasaan Baca Al-Quran (35 Menit)', 
  'Pembiasaan Baca Tulis Al-Quran', 
  'Peringatan Hari Besar Islam'
];
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEKS = ['Setiap Minggu', 'Minggu ke-1', 'Minggu ke-2', 'Minggu ke-3', 'Minggu ke-4'];
const MONTHS = ['Setiap Bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];


const EMPTY_SCHEDULE: Omit<Schedule, 'id'> = {
  activity: '',
  day: '',
  week: '',
  month: '',
  year: new Date().getFullYear().toString(),
  class: '',
  notes: ''
};

const ScheduleView: React.FC<ScheduleProps> = ({ schedules, setSchedules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<Omit<Schedule, 'id'>>(EMPTY_SCHEDULE);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [otherActivity, setOtherActivity] = useState('');

  const openModalForAdd = () => {
    setEditingSchedule(null);
    setFormData(EMPTY_SCHEDULE);
    setOtherActivity('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    const isPredefinedActivity = ACTIVITIES.includes(schedule.activity);
    setFormData({
      ...schedule,
      activity: isPredefinedActivity ? schedule.activity : 'Lainnya',
    });
    setOtherActivity(isPredefinedActivity ? '' : schedule.activity);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const finalActivity = formData.activity === 'Lainnya' ? otherActivity : formData.activity;
    if (!finalActivity || !formData.day || !formData.week || !formData.month || !formData.year || !formData.class) {
      alert('Mohon lengkapi semua kolom yang wajib diisi (Kegiatan, Hari, Minggu, Bulan, Tahun, Kelas).');
      return;
    }

    if (editingSchedule) {
      // Update
      setSchedules(schedules.map(s => 
        s.id === editingSchedule.id ? { ...s, ...formData, activity: finalActivity } : s
      ));
    } else {
      // Add new
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        ...formData,
        activity: finalActivity,
      };
      setSchedules([...schedules, newSchedule]);
    }
    setIsModalOpen(false);
  };
  
  const handleDelete = () => {
    if (deleteTarget) {
        setSchedules(schedules.filter(s => s.id !== deleteTarget.id));
        setDeleteTarget(null);
    }
  };

  const downloadScheduleExcel = () => {
    if (schedules.length === 0) {
        alert("Tidak ada data jadwal untuk diunduh.");
        return;
    }

    const dataForExcel = schedules.map(s => ({
        'Kegiatan': s.activity,
        'Hari': s.day,
        'Minggu Ke': s.week,
        'Bulan': s.month,
        'Tahun': s.year,
        'Kelas': s.class,
        'Keterangan': s.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal Kegiatan");

    // Auto-size columns for better readability
    const cols = Object.keys(dataForExcel[0]);
    const colWidths = cols.map(col => ({
         wch: Math.max(...dataForExcel.map(row => (row[col as keyof typeof row] ?? '').toString().length), col.length) + 2
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, "Jadwal_Kegiatan_Mingguan.xlsx");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Jadwal Kegiatan Agama Mingguan</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Pengaturan jadwal rutin pembiasaan keagamaan</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
                onClick={downloadScheduleExcel}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center"
            >
                <i className="fas fa-file-excel mr-2"></i>Export Excel
            </button>
            <button 
                onClick={openModalForAdd}
                className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98] flex items-center justify-center"
            >
                <i className="fas fa-plus mr-2"></i>Tambah Jadwal
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase font-semibold bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kegiatan</th>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.length > 0 ? schedules.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800">{s.activity}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700">{s.day}</div>
                    <div className="text-xs text-brand-600 font-bold mt-0.5">{s.week}</div>
                    {s.month && s.month !== 'Setiap Bulan' && (
                        <div className="text-xs text-indigo-600 font-bold mt-0.5">{s.month}</div>
                    )}
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{s.year}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">{s.class}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.notes || '-'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button onClick={() => openModalForEdit(s)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 mr-2 transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => setDeleteTarget(s)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <i className="far fa-calendar-alt text-4xl text-slate-300"></i>
                      <p>Belum ada jadwal yang dibuat.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mr-3">
                <i className="fas fa-calendar-alt"></i>
              </div>
              {editingSchedule ? 'Edit Jadwal Kegiatan' : 'Tambah Jadwal Kegiatan Baru'}
            </h3>
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kegiatan</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                            value={formData.activity} 
                            onChange={(e) => setFormData({...formData, activity: e.target.value})}
                            className="flex-1 w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all cursor-pointer"
                        >
                            <option value="">-- Pilih Kegiatan --</option>
                            {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                            <option value="Lainnya">Lainnya...</option>
                        </select>
                        {formData.activity === 'Lainnya' && (
                            <input 
                                type="text"
                                placeholder="Tulis nama kegiatan"
                                value={otherActivity}
                                onChange={(e) => setOtherActivity(e.target.value)}
                                className="flex-1 w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                            />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hari</label>
                        <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all cursor-pointer">
                            <option value="">-- Pilih Hari --</option>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minggu Ke</label>
                        <select value={formData.week} onChange={(e) => setFormData({...formData, week: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all cursor-pointer">
                            <option value="">-- Pilih Minggu --</option>
                            {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bulan</label>
                        <select value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all cursor-pointer">
                            <option value="">-- Pilih Bulan --</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tahun</label>
                        <input 
                            type="number"
                            placeholder="YYYY"
                            value={formData.year} 
                            onChange={(e) => setFormData({...formData, year: e.target.value})} 
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas (cth: 7A, 8B, atau Semua Kelas)</label>
                    <input type="text" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all" placeholder="Masukkan kelas..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keterangan (Opsional)</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all resize-none" rows={2} placeholder="Tambahkan keterangan..."></textarea>
                </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-[0.98]">Simpan Jadwal</button>
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
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Hapus Jadwal?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
                Anda akan menghapus jadwal <strong className="font-bold text-slate-700">"{deleteTarget.activity}"</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
                <button 
                onClick={handleDelete}
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

export default ScheduleView;
