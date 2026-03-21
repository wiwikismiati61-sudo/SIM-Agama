
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isFirebaseLoggedIn: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isAdmin, isLoggedIn, isFirebaseLoggedIn, onLoginClick, onLogout, isOpen, setIsOpen }) => {
  const menuItems: { id: ViewType; label: string; icon: string; restricted: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', restricted: false },
    { id: 'master', label: 'Master Data', icon: 'fas fa-database', restricted: true },
    { id: 'transaksi', label: 'Input Absen', icon: 'fas fa-edit', restricted: true },
    { id: 'laporan', label: 'Laporan', icon: 'fas fa-file-excel', restricted: false },
    { id: 'jadwal', label: 'Jadwal Mingguan', icon: 'fas fa-calendar-week', restricted: false },
    { id: 'pengaturan', label: 'Pengaturan & DB', icon: 'fas fa-cogs', restricted: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 lg:w-72 bg-slate-950 text-slate-300 flex flex-col shadow-2xl z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              <span className="flex-1 font-medium text-sm text-left">{item.label}</span>
              {item.restricted && !isAdmin && (
                <i className="fas fa-lock text-[10px] text-slate-600"></i>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          {isLoggedIn && !isFirebaseLoggedIn && (
            <div className="px-4 py-2 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider leading-tight">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Cloud Sync Mati
              </p>
              <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                Login Google untuk simpan data ke server.
              </p>
            </div>
          )}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
            >
              <i className="fas fa-sign-out-alt w-5 text-center"></i>
              <span className="font-bold text-sm">Keluar Sistem</span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-brand-400 hover:bg-brand-500/10 hover:text-brand-300 transition-all duration-200"
            >
              <i className="fas fa-sign-in-alt w-5 text-center"></i>
              <span className="font-bold text-sm">Masuk Sistem</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
