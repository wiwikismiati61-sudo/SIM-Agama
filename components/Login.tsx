
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01] duration-300">
        <div className="text-center mb-6">
          <img src="https://iili.io/KDFk4fI.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 object-contain filter drop-shadow-md" />
          <h2 className="text-2xl font-bold text-gray-800">Sistem Monitoring</h2>
          <p className="text-sm text-gray-500 font-medium">Kegiatan Keagamaan Siswa</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="admin"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="admin123"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg active:scale-95">
            Masuk ke Panel
          </button>
          {error && <p className="text-red-500 text-xs text-center font-bold">Username atau Password salah!</p>}
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} SIM-AGAMA Monitoring System
        </div>
      </div>
    </div>
  );
};

export default Login;
