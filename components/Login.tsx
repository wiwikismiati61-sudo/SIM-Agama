
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (u: string, p: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(user, pass)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-brand-500 selection:text-white">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mosque/1920/1080?blur=10')] bg-cover bg-center opacity-20 mix-blend-multiply pointer-events-none"></div>
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-md relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <i className="fas fa-mosque text-white text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">SIM-AGAMA</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Sistem Monitoring Kegiatan Keagamaan</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-user text-slate-400"></i>
              </div>
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all outline-none text-slate-700 font-medium placeholder:text-slate-400" 
                placeholder="Masukkan username"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-lock text-slate-400"></i>
              </div>
              <input 
                type="password" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all outline-none text-slate-700 font-medium placeholder:text-slate-400" 
                placeholder="Masukkan password"
                required 
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-brand-600/30 active:scale-[0.98] mt-2">
            Masuk ke Sistem
          </button>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center space-x-2 text-rose-600">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-semibold">Username atau password salah!</p>
            </div>
          )}
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} SIM-AGAMA Monitoring System
        </div>
      </div>
    </div>
  );
};

export default Login;
