
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'master', label: 'Master Data', icon: 'fas fa-database' },
    { id: 'transaksi', label: 'Input Absen', icon: 'fas fa-edit' },
    { id: 'laporan', label: 'Laporan', icon: 'fas fa-file-excel' },
    { id: 'jadwal', label: 'Jadwal Mingguan', icon: 'fas fa-calendar-week' },
    { id: 'pengaturan', label: 'Pengaturan & DB', icon: 'fas fa-cogs' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-slate-950 text-slate-300 flex flex-col shadow-2xl z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center space-x-4 border-b border-slate-800/50">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <i className="fas fa-mosque text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">SIM-AGAMA</h1>
            <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest">Panel Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Utama</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <i className={`${item.icon} w-5 text-center text-lg transition-transform ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-brand-500'}`}></i>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 py-3.5 rounded-xl transition-all font-medium text-sm border border-slate-800 hover:border-red-500/30"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
