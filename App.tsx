
import React, { useState, useEffect, useCallback } from 'react';
import { Auth, ViewType, Student, Program, Transaction, Schedule, AllowedUser, SUPER_ADMIN_EMAILS } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/Dashboard';
import MasterView from './views/MasterData';
import TransactionView from './views/Transaction';
import ReportView from './views/Reports';
import SettingsView from './views/Settings';
import ScheduleView from './views/Schedule';
import UsersView from './views/Users';
import { db, auth as firebaseAuth, collection, doc, getDoc, setDoc, deleteDoc, onSnapshot, query, orderBy, googleProvider, signInWithPopup, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Terjadi kesalahan pada aplikasi.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.operationType) {
          errorMessage = `Kesalahan Firestore (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Waduh, Ada Masalah!</h2>
            <p className="text-slate-600 font-medium mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98]"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DEFAULT_AUTH: Auth = { user: 'admin', pass: 'admin123' };

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // App State
  const [auth, setAuth] = useState<Auth>(DEFAULT_AUTH);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);

  // Firebase Auth Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && user.email) {
        if (!SUPER_ADMIN_EMAILS.includes(user.email)) {
          try {
            const docRef = doc(db, 'allowedUsers', user.email);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
              alert(`Email ${user.email} tidak terdaftar untuk akses Cloud. Silakan hubungi admin.`);
              await signOut(firebaseAuth);
              setCurrentUser(null);
              setIsLoggedIn(false);
              return;
            }
          } catch (error) {
            console.error("Error checking allowed user:", error);
            alert(`Gagal memverifikasi akses untuk ${user.email}.`);
            await signOut(firebaseAuth);
            setCurrentUser(null);
            setIsLoggedIn(false);
            return;
          }
        }
      }
      
      setCurrentUser(user);
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Data Sync
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Student);
      setStudents(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    const unsubPrograms = onSnapshot(collection(db, 'programs'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Program);
      setPrograms(data.length > 0 ? data : [
        { id: '1', name: 'Sholat Dhuha', time: '07:00' },
        { id: '2', name: 'Sholat Dzuhur', time: '12:00' },
        { id: '3', name: 'Jumat Beramal', time: 'Jumat 07:00' }
      ]);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'programs');
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Schedule);
      setSchedules(data.map(s => ({
        ...s,
        month: s.month || 'Setiap Bulan',
        year: s.year || new Date().getFullYear().toString()
      })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'schedules');
    });

    const unsubAuth = onSnapshot(doc(db, 'auth', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setAuth(docSnap.data() as Auth);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'auth/config');
    });

    setIsDataLoaded(true);

    return () => {
      unsubStudents();
      unsubPrograms();
      unsubTransactions();
      unsubSchedules();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setAllowedUsers([]);
      return;
    }

    const unsubAllowedUsers = onSnapshot(collection(db, 'allowedUsers'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as AllowedUser);
      setAllowedUsers(data);
    }, (error) => {
      console.error("Error fetching allowed users:", error);
    });

    return () => {
      unsubAllowedUsers();
    };
  }, [currentUser]);

  // Migration from localStorage to Firebase
  useEffect(() => {
    const migrateData = async () => {
      const migrationFlag = localStorage.getItem('sim_firebase_migrated');
      if (migrationFlag) return;

      // Only migrate if the admin is logged in
      if (!currentUser || currentUser.email !== 'wiwikismiati61@guru.smp.belajar.id') {
        return;
      }

      const userPath = `users/${currentUser.uid}`;
      console.log('Starting migration to Firebase...');
      const savedDb = localStorage.getItem('sim_db');
      const savedAuth = localStorage.getItem('sim_auth');

      try {
        if (savedDb) {
          const parsedDb = JSON.parse(savedDb);
          const { students: localStudents, programs: localPrograms, transactions: localTransactions, schedules: localSchedules } = parsedDb;
          
          if (Array.isArray(localStudents)) {
            console.log(`Migrating ${localStudents.length} students...`);
            for (const s of localStudents) {
              const studentId = String(s.id || '').trim();
              if (studentId) {
                const sanitized = {
                  id: studentId,
                  name: String(s.name || ''),
                  class: String(s.class || '')
                };
                try {
                  await setDoc(doc(db, userPath, 'students', sanitized.id), sanitized);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `migration/students/${sanitized.id}`);
                }
              }
            }
          }
          if (Array.isArray(localPrograms)) {
            console.log(`Migrating ${localPrograms.length} programs...`);
            for (const p of localPrograms) {
              const programId = String(p.id || '').trim();
              if (programId) {
                const sanitized = {
                  id: programId,
                  name: String(p.name || ''),
                  time: String(p.time || '')
                };
                try {
                  await setDoc(doc(db, userPath, 'programs', sanitized.id), sanitized);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `migration/programs/${sanitized.id}`);
                }
              }
            }
          }
          if (Array.isArray(localTransactions)) {
            console.log(`Migrating ${localTransactions.length} transactions...`);
            for (const t of localTransactions) {
              const transactionId = String(t.id || '').trim();
              if (transactionId) {
                const sanitized = {
                  id: transactionId,
                  date: String(t.date || ''),
                  time: String(t.time || ''),
                  studentId: String(t.studentId || ''),
                  studentName: String(t.studentName || ''),
                  class: String(t.class || ''),
                  program: String(t.program || ''),
                  reason: String(t.reason || '')
                };
                try {
                  await setDoc(doc(db, userPath, 'transactions', sanitized.id), sanitized);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `migration/transactions/${sanitized.id}`);
                }
              }
            }
          }
          if (Array.isArray(localSchedules)) {
            console.log(`Migrating ${localSchedules.length} schedules...`);
            for (const s of localSchedules) {
              const scheduleId = String(s.id || '').trim();
              if (scheduleId) {
                const sanitized = {
                  id: scheduleId,
                  activity: String(s.activity || ''),
                  day: String(s.day || ''),
                  week: String(s.week || ''),
                  month: String(s.month || ''),
                  year: String(s.year || ''),
                  class: String(s.class || ''),
                  notes: String(s.notes || '')
                };
                try {
                  await setDoc(doc(db, userPath, 'schedules', sanitized.id), sanitized);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `migration/schedules/${sanitized.id}`);
                }
              }
            }
          }
        }

        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          const sanitizedAuth = {
            user: String(authData.user || 'admin'),
            pass: String(authData.pass || 'admin123')
          };
          try {
            await setDoc(doc(db, userPath, 'auth', 'config'), sanitizedAuth);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'migration/auth');
          }
        } else {
          try {
            await setDoc(doc(db, userPath, 'auth', 'config'), DEFAULT_AUTH);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'migration/auth-default');
          }
        }

        localStorage.setItem('sim_firebase_migrated', 'true');
        console.log('Migration to Firebase completed.');
      } catch (error) {
        console.error('Migration failed:', error);
      }
    };

    if (isDataLoaded && isLoggedIn) {
      migrateData();
    }
  }, [isDataLoaded, isLoggedIn, currentUser]);

  const updateAuth = async (newAuth: Auth) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menyimpan pengaturan ke server.');
      return;
    }
    try {
      await setDoc(doc(db, 'auth', 'config'), newAuth);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'auth/config');
    }
  };

  const handleAddTransaction = async (t: Transaction) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menyimpan transaksi ke server.');
      return;
    }
    try {
      if (!t.id) throw new Error('Transaction ID is missing');
      
      // Remove undefined values to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries(t).filter(([_, v]) => v !== undefined)
      );
      
      await setDoc(doc(db, 'transactions', String(t.id)), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${t.id}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menghapus transaksi dari server.');
      return;
    }
    try {
      if (!id) throw new Error('Transaction ID is missing');
      await deleteDoc(doc(db, 'transactions', String(id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk memperbarui transaksi di server.');
      return;
    }
    try {
      if (!updated.id) throw new Error('Transaction ID is missing');
      
      // Remove undefined values to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries(updated).filter(([_, v]) => v !== undefined)
      );
      
      await setDoc(doc(db, 'transactions', String(updated.id)), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${updated.id}`);
    }
  };

  const handleDeleteMultipleTransactions = async (ids: string[]) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menghapus beberapa transaksi dari server.');
      return;
    }
    try {
      for (const id of ids) {
        if (id) await deleteDoc(doc(db, 'transactions', String(id)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'transactions');
    }
  };

  const handleSetStudents = async (newStudents: Student[] | ((prev: Student[]) => Student[])) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menyimpan data siswa ke server.');
      return;
    }
    const updatedStudents = typeof newStudents === 'function' ? newStudents(students) : newStudents;
    const currentIds = students.map(s => s.id);
    const newIds = updatedStudents.map(s => s.id);

    try {
      // Added or Updated
      for (const s of updatedStudents) {
        if (s.id) await setDoc(doc(db, 'students', String(s.id)), s);
      }

      // Deleted
      const deletedIds = currentIds.filter(id => !newIds.includes(id));
      for (const id of deletedIds) {
        if (id) await deleteDoc(doc(db, 'students', String(id)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'students');
    }
  };

  const handleSetPrograms = async (newPrograms: Program[] | ((prev: Program[]) => Program[])) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menyimpan data program ke server.');
      return;
    }
    const updatedPrograms = typeof newPrograms === 'function' ? newPrograms(programs) : newPrograms;
    const currentIds = programs.map(p => p.id);
    const newIds = updatedPrograms.map(p => p.id);

    try {
      for (const p of updatedPrograms) {
        if (p.id) await setDoc(doc(db, 'programs', String(p.id)), p);
      }

      const deletedIds = currentIds.filter(id => !newIds.includes(id));
      for (const id of deletedIds) {
        if (id) await deleteDoc(doc(db, 'programs', String(id)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'programs');
    }
  };

  const handleSetSchedules = async (newSchedules: Schedule[] | ((prev: Schedule[]) => Schedule[])) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk menyimpan data jadwal ke server.');
      return;
    }
    const updatedSchedules = typeof newSchedules === 'function' ? newSchedules(schedules) : newSchedules;
    const currentIds = schedules.map(s => s.id);
    const newIds = updatedSchedules.map(s => s.id);

    try {
      for (const s of updatedSchedules) {
        if (s.id) await setDoc(doc(db, 'schedules', String(s.id)), s);
      }

      const deletedIds = currentIds.filter(id => !newIds.includes(id));
      for (const id of deletedIds) {
        if (id) await deleteDoc(doc(db, 'schedules', String(id)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'schedules');
    }
  };

  const restoreData = async (data: any) => {
    if (!currentUser) {
      alert('Anda harus login dengan Google untuk memulihkan data ke server.');
      return;
    }

    try {
      if (data.students) {
        for (const s of data.students) {
          if (s.id) {
            const sanitized = {
              id: String(s.id),
              name: String(s.name || ''),
              class: String(s.class || '')
            };
            await setDoc(doc(db, 'students', sanitized.id), sanitized);
          }
        }
      }
      if (data.programs) {
        for (const p of data.programs) {
          if (p.id) {
            const sanitized = {
              id: String(p.id),
              name: String(p.name || ''),
              time: String(p.time || '')
            };
            await setDoc(doc(db, 'programs', sanitized.id), sanitized);
          }
        }
      }
      if (data.transactions) {
        for (const t of data.transactions) {
          if (t.id) {
            const sanitized = {
              id: String(t.id),
              date: String(t.date || ''),
              time: String(t.time || ''),
              studentId: String(t.studentId || ''),
              studentName: String(t.studentName || ''),
              class: String(t.class || ''),
              program: String(t.program || ''),
              reason: String(t.reason || '')
            };
            await setDoc(doc(db, 'transactions', sanitized.id), sanitized);
          }
        }
      }
      if (data.schedules) {
        for (const s of data.schedules) {
          if (s.id) {
            const sanitized = {
              id: String(s.id),
              activity: String(s.activity || ''),
              day: String(s.day || ''),
              week: String(s.week || ''),
              month: String(s.month || ''),
              year: String(s.year || ''),
              class: String(s.class || ''),
              notes: String(s.notes || '')
            };
            await setDoc(doc(db, 'schedules', sanitized.id), sanitized);
          }
        }
      }
      if (data.auth) {
        const sanitizedAuth = {
          user: String(data.auth.user || 'admin'),
          pass: String(data.auth.pass || 'admin123')
        };
        await setDoc(doc(db, 'auth', 'config'), sanitizedAuth);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'restore');
    }
  };

  const handleLogin = async () => {
    // Custom login check (optional, but keep it for legacy if needed)
    if (loginForm.user === auth.user && loginForm.pass === auth.pass) {
      // Note: This doesn't authenticate with Firebase Auth, so writes will still fail
      // unless the user also signs in with Google.
      // We'll prompt them to sign in with Google if they want to save data.
      alert('Login lokal berhasil, silakan login dengan Google untuk izin simpan data.');
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginForm({ user: '', pass: '' });
    } else {
      alert('Username atau Password salah!');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      
      if (user && user.email) {
        if (!SUPER_ADMIN_EMAILS.includes(user.email)) {
          const docRef = doc(db, 'allowedUsers', user.email);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            alert(`Email ${user.email} tidak terdaftar untuk akses Cloud. Silakan hubungi admin.`);
            await signOut(firebaseAuth);
            return;
          }
        }
      }
      
      setShowLoginModal(false);
    } catch (error) {
      console.error('Login Error:', error);
      alert('Gagal login dengan Google');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const isAdmin = !!currentUser || isLoggedIn;

  const getCurrentUserAllowedViews = (): ViewType[] | null => {
    if (!currentUser) return null;
    if (SUPER_ADMIN_EMAILS.includes(currentUser.email)) return ['dashboard', 'master', 'transaksi', 'laporan', 'jadwal', 'pengaturan', 'users'];
    
    const userConfig = allowedUsers.find(u => u.email === currentUser.email);
    if (userConfig && userConfig.allowedViews) {
      return userConfig.allowedViews;
    }
    
    // Default fallback if allowedViews is not set (legacy users)
    return ['dashboard', 'master', 'transaksi', 'laporan', 'jadwal', 'pengaturan', 'users'];
  };

  const handleNavigate = (view: ViewType) => {
    const restrictedViews: ViewType[] = ['master', 'transaksi', 'pengaturan', 'users'];
    
    if (restrictedViews.includes(view) && !isAdmin) {
      setShowLoginModal(true);
      return;
    }

    if (isAdmin) {
      const userAllowedViews = getCurrentUserAllowedViews();
      if (userAllowedViews && !userAllowedViews.includes(view)) {
        alert('Anda tidak memiliki hak akses untuk menu ini.');
        return;
      }
    }
    
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  // Redirect to a public view if logged out while on a restricted view or if access is revoked
  useEffect(() => {
    const restrictedViews: ViewType[] = ['master', 'transaksi', 'pengaturan', 'users'];
    
    if (!isAdmin && restrictedViews.includes(currentView)) {
      setCurrentView('dashboard');
      return;
    }

    if (isAdmin) {
      const userAllowedViews = getCurrentUserAllowedViews();
      if (userAllowedViews && !userAllowedViews.includes(currentView)) {
        // Find the first allowed view, or default to dashboard
        const fallbackView = userAllowedViews.length > 0 ? userAllowedViews[0] : 'dashboard';
        setCurrentView(fallbackView);
      }
    }
  }, [isAdmin, currentView, allowedUsers, currentUser]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        isFirebaseLoggedIn={!!currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userAllowedViews={getCurrentUserAllowedViews()}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header viewTitle={currentView} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView 
                students={students || []} 
                transactions={transactions || []} 
              />
            )}
            {currentView === 'master' && (
              <MasterView 
                students={students || []} 
                setStudents={handleSetStudents} 
                programs={programs || []} 
                setPrograms={handleSetPrograms} 
              />
            )}
            {currentView === 'transaksi' && (
              <TransactionView 
                students={students || []} 
                programs={programs || []} 
                transactions={transactions || []}
                onAddTransaction={handleAddTransaction} 
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
              />
            )}
            {currentView === 'laporan' && (
              <ReportView 
                students={students || []} 
                transactions={transactions || []} 
              />
            )}
            {currentView === 'jadwal' && (
              <ScheduleView 
                schedules={schedules || []}
                setSchedules={handleSetSchedules}
                isLoggedIn={isLoggedIn}
              />
            )}
            {currentView === 'pengaturan' && (
              <SettingsView 
                onUpdateAuth={updateAuth} 
                onRestore={restoreData}
                data={{ students, programs, transactions, schedules, auth }}
                isFirebaseLoggedIn={!!currentUser}
              />
            )}
            {currentView === 'users' && (
              <UsersView 
                allowedUsers={allowedUsers}
                isFirebaseLoggedIn={!!currentUser}
              />
            )}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-500/30 mx-auto mb-6">
                <i className="fas fa-lock text-white text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Login Administrator</h2>
              <p className="text-slate-500 font-medium mt-2">Masukkan kredensial untuk akses penuh</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                    <i className="fas fa-user"></i>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Username"
                    value={loginForm.user}
                    onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                    <i className="fas fa-key"></i>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={loginForm.pass}
                    onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center space-x-3 group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Masuk dengan Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">Atau Login Lokal</span>
                </div>
              </div>

              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>Masuk Lokal</span>
                <i className="fas fa-arrow-right text-sm"></i>
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full py-4 text-slate-500 hover:text-slate-800 font-bold transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default App;
