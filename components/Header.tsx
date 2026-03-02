
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  viewTitle: ViewType;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewTitle, onToggleSidebar }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      setTime(now.toLocaleDateString('id-ID', options));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<ViewType, string> = {
    dashboard: 'Dashboard Overview',
    master: 'Master Data Siswa & Program',
    transaksi: 'Input Ketidakhadiran',
    laporan: 'Laporan Absensi',
    jadwal: 'Jadwal Kegiatan Mingguan',
    pengaturan: 'Pengaturan Sistem'
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 h-20 flex items-center justify-between px-6 md:px-10 z-10 shrink-0 sticky top-0">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleSidebar} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          <i className="fas fa-bars text-lg"></i>
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{titles[viewTitle]}</h2>
          <p className="hidden md:block text-xs text-slate-500 font-medium mt-0.5">Sistem Informasi Monitoring Kegiatan Keagamaan</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <span className="hidden lg:flex items-center text-xs font-semibold text-slate-500 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/60">
          <i className="far fa-calendar-alt mr-2 text-brand-500"></i>{time}
        </span>
        <div className="flex items-center space-x-4 border-l pl-6 border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">Administrator</p>
            <p className="text-[10px] text-brand-500 font-bold uppercase mt-1 tracking-wider">Online</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 border border-brand-200 shadow-sm flex items-center justify-center text-brand-700 font-bold text-lg">
            <i className="fas fa-user-shield"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
