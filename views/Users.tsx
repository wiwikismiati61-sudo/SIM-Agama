import React, { useState } from 'react';
import { AllowedUser, ViewType } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { OperationType } from '../firebase';

interface UsersProps {
  allowedUsers: AllowedUser[];
  isFirebaseLoggedIn: boolean;
}

const AVAILABLE_VIEWS: { id: ViewType, label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'master', label: 'Master Data' },
  { id: 'transaksi', label: 'Input Absen' },
  { id: 'laporan', label: 'Laporan' },
  { id: 'jadwal', label: 'Jadwal Mingguan' },
  { id: 'pengaturan', label: 'Pengaturan & DB' },
  { id: 'users', label: 'Manajemen User' }
];

const UsersView: React.FC<UsersProps> = ({ allowedUsers, isFirebaseLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [allowedViews, setAllowedViews] = useState<ViewType[]>(['dashboard']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({type, text});
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleToggleView = (viewId: ViewType) => {
    setAllowedViews(prev => 
      prev.includes(viewId) 
        ? prev.filter(v => v !== viewId)
        : [...prev, viewId]
    );
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseLoggedIn) {
      showMessage('error', 'Anda harus login untuk menambahkan user.');
      return;
    }

    if (!email || !name) {
      showMessage('error', 'Semua field harus diisi.');
      return;
    }

    if (allowedViews.length === 0) {
      showMessage('error', 'Pilih minimal satu menu yang dapat diakses.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser: AllowedUser = {
        email: email.trim(),
        name: name.trim(),
        addedAt: new Date().toISOString(),
        allowedViews: allowedViews
      };

      await setDoc(doc(db, 'allowedUsers', newUser.email), newUser);
      showMessage('success', 'User berhasil ditambahkan.');
      setEmail('');
      setName('');
      setAllowedViews(['dashboard']);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'allowedUsers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userEmail: string) => {
    if (!isFirebaseLoggedIn) {
      showMessage('error', 'Anda harus login untuk menghapus user.');
      return;
    }

    if (userEmail === 'wiwikismiati61@guru.smp.belajar.id') {
      showMessage('error', 'Super Admin tidak dapat dihapus.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus akses untuk ${userEmail}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'allowedUsers', userEmail));
      showMessage('success', 'User berhasil dihapus.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'allowedUsers');
    }
  };

  const handleUpdateUserViews = async (user: AllowedUser, viewId: ViewType) => {
    if (!isFirebaseLoggedIn) return;
    if (user.email === 'wiwikismiati61@guru.smp.belajar.id') {
      showMessage('error', 'Akses Super Admin tidak dapat diubah.');
      return;
    }

    const currentViews = user.allowedViews || [];
    let newViews: ViewType[];
    
    if (currentViews.includes(viewId)) {
      newViews = currentViews.filter(v => v !== viewId);
      if (newViews.length === 0) {
        showMessage('error', 'User harus memiliki minimal satu akses menu.');
        return;
      }
    } else {
      newViews = [...currentViews, viewId];
    }

    try {
      const updatedUser = { ...user, allowedViews: newViews };
      await setDoc(doc(db, 'allowedUsers', user.email), updatedUser);
      showMessage('success', 'Akses menu berhasil diperbarui.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'allowedUsers');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      {message && (
        <div className={`fixed top-6 right-6 z-[100] p-4 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-bold animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Add User Form */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-inner">
            <i className="fas fa-user-plus text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tambah User Baru</h2>
            <p className="text-sm text-slate-500 font-medium">Berikan akses ke aplikasi untuk user lain</p>
          </div>
        </div>

        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Google</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Hak Akses Menu</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AVAILABLE_VIEWS.map(view => (
                <label key={`add-${view.id}`} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={allowedViews.includes(view.id)}
                    onChange={() => handleToggleView(view.id)}
                    className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{view.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-md shadow-brand-500/30 disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Simpan User
              </>
            )}
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <i className="fas fa-users text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Daftar User Akses</h2>
            <p className="text-sm text-slate-500 font-medium">User yang memiliki akses ke aplikasi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-bold rounded-tl-xl">Nama</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Hak Akses Menu</th>
                <th className="p-4 font-bold">Tanggal Ditambahkan</th>
                <th className="p-4 font-bold text-center rounded-tr-xl w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allowedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                    Belum ada user yang ditambahkan
                  </td>
                </tr>
              ) : (
                allowedUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 font-medium text-slate-800 align-top">{user.name}</td>
                    <td className="p-4 text-slate-600 align-top">{user.email}</td>
                    <td className="p-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_VIEWS.map(view => (
                          <label key={`${user.email}-${view.id}`} className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={(user.allowedViews || []).includes(view.id)}
                              onChange={() => handleUpdateUserViews(user, view.id)}
                              disabled={user.email === 'wiwikismiati61@guru.smp.belajar.id' || !isFirebaseLoggedIn}
                              className="w-3.5 h-3.5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="text-xs font-medium text-slate-600">{view.label}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 align-top">
                      {new Date(user.addedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-center align-top">
                      <button
                        onClick={() => handleRemoveUser(user.email)}
                        disabled={user.email === 'wiwikismiati61@guru.smp.belajar.id'}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.email === 'wiwikismiati61@guru.smp.belajar.id' ? "Super Admin tidak dapat dihapus" : "Hapus User"}
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersView;
