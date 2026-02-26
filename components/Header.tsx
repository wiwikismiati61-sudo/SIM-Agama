
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
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-800">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h2 className="text-lg md:text-xl font-bold text-gray-800">{titles[viewTitle]}</h2>
      </div>
      <div className="flex items-center space-x-6">
        <span className="hidden md:inline-block text-xs font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
          <i className="far fa-clock mr-2"></i>{time}
        </span>
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-none">Admin</p>
            <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Online</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
