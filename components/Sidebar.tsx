
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const menuItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'master', label: 'Master Data', icon: 'fas fa-database' },
    { id: 'transaksi', label: 'Input Absen', icon: 'fas fa-edit' },
    { id: 'laporan', label: 'Laporan', icon: 'fas fa-file-excel' },
    { id: 'jadwal', label: 'Jadwal Mingguan', icon: 'fas fa-calendar-week' },
    { id: 'pengaturan', label: 'Pengaturan & DB', icon: 'fas fa-cogs' },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shadow-xl z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <img src="https://iili.io/KDFk4fI.png" className="w-10 h-10 object-contain bg-white rounded-full p-1" alt="Logo" />
        <div>
          <h1 className="font-bold text-lg tracking-wide">SIM-AGAMA</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Panel Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`${item.icon} w-5 text-center group-hover:scale-110 transition-transform`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center space-x-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3 rounded-xl transition-all font-bold"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
