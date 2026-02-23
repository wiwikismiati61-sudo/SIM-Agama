
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
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Jadwal Kegiatan Agama Mingguan</h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Pengaturan jadwal rutin pembiasaan keagamaan</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
                onClick={downloadScheduleExcel}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
                <i className="fas fa-download mr-2"></i>Download Excel
            </button>
            <button 
                onClick={openModalForAdd}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
                <i className="fas fa-plus mr-2"></i>Tambah Jadwal
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase font-black bg-gray-50/50">
              <tr>
                <th className="px-6 py-4">Kegiatan</th>
                <th className="px-6 py-4">Waktu Pelaksanaan</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schedules.length > 0 ? schedules.map(s => (
                <tr key={s.id} className="hover:bg-green-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{s.activity}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">{s.day}</div>
                    <div className="text-[10px] text-green-600 font-black tracking-widest">{s.week}</div>
                    {s.month && s.month !== 'Setiap Bulan' && (
                        <div className="text-[10px] text-purple-600 font-black tracking-widest mt-1">{s.month}</div>
                    )}
                    <div className="text-[10px] text-gray-500 font-black tracking-widest mt-1">{s.year}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md uppercase">{s.class}</span>
                  </td>
                  <td className="px-6 py-4 text-xs italic text-gray-500">{s.notes || '-'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button onClick={() => openModalForEdit(s)} className="w-8 h-8 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 mr-2">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => setDeleteTarget(s)} className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Belum ada jadwal yang dibuat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-8">
              {editingSchedule ? 'Edit Jadwal Kegiatan' : 'Tambah Jadwal Kegiatan Baru'}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kegiatan</label>
                    <div className="flex gap-4">
                        <select 
                            value={formData.activity} 
                            onChange={(e) => setFormData({...formData, activity: e.target.value})}
                            className="flex-1 w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                                className="flex-1 w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hari</label>
                        <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})} className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none">
                            <option value="">-- Pilih Hari --</option>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Minggu Ke</label>
                        <select value={formData.week} onChange={(e) => setFormData({...formData, week: e.target.value})} className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none">
                            <option value="">-- Pilih Minggu --</option>
                            {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bulan</label>
                        <select value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none">
                            <option value="">-- Pilih Bulan --</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tahun</label>
                        <input 
                            type="number"
                            placeholder="YYYY"
                            value={formData.year} 
                            onChange={(e) => setFormData({...formData, year: e.target.value})} 
                            className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kelas (cth: 7A, 8B, atau Semua Kelas)</label>
                    <input type="text" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Keterangan (Opsional)</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border-2 border-gray-100 px-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none" rows={2}></textarea>
                </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Batal</button>
              <button onClick={handleSave} className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95">Simpan Jadwal</button>
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
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Hapus Jadwal?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">
                Anda akan menghapus jadwal <strong className="font-bold text-gray-700">"{deleteTarget.activity}"</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col gap-3">
                <button 
                onClick={handleDelete}
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

export default ScheduleView;
