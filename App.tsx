
import React, { useState, useEffect, useCallback } from 'react';
import { Auth, ViewType, Student, Program, Transaction, Schedule } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/Dashboard';
import MasterView from './views/MasterData';
import TransactionView from './views/Transaction';
import ReportView from './views/Reports';
import SettingsView from './views/Settings';
import Login from './components/Login';
import ScheduleView from './views/Schedule';

const DEFAULT_AUTH: Auth = { user: 'admin', pass: 'admin123' };

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // App State
  const [auth, setAuth] = useState<Auth>(() => {
    const saved = localStorage.getItem('sim_auth');
    return saved ? JSON.parse(saved) : DEFAULT_AUTH;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sim_db');
    return saved ? JSON.parse(saved).students : [];
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('sim_db');
    if (saved) return JSON.parse(saved).programs;
    return [
      { id: '1', name: 'Sholat Dhuha', time: '07:00' },
      { id: '2', name: 'Sholat Dzuhur', time: '12:00' },
      { id: '3', name: 'Jumat Beramal', time: 'Jumat 07:00' }
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sim_db');
    return saved ? JSON.parse(saved).transactions : [];
  });

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('sim_db');
    if (saved) {
      const db = JSON.parse(saved);
      const schedulesFromDb = db.schedules || [];
      // Backward compatibility for schedules without a 'month' or 'year' field
      return schedulesFromDb.map((s: any) => ({ 
        ...s, 
        month: s.month || 'Setiap Bulan',
        year: s.year || new Date().getFullYear().toString() 
      }));
    }
    return [];
  });

  // Persistance
  useEffect(() => {
    const db = { students, programs, transactions, schedules };
    localStorage.setItem('sim_db', JSON.stringify(db));
    localStorage.setItem('sim_auth', JSON.stringify(auth));
  }, [students, programs, transactions, schedules, auth]);

  const handleLogin = (u: string, p: string) => {
    if (u === auth.user && p === auth.pass) {
      sessionStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const updateAuth = (newAuth: Auth) => {
    setAuth(newAuth);
    handleLogout();
  };

  const restoreData = (data: any) => {
    if (data.students) setStudents(data.students);
    if (data.programs) setPrograms(data.programs);
    if (data.transactions) setTransactions(data.transactions);
    if (data.schedules) {
      // Backward compatibility for restored schedules
      const restoredSchedules = data.schedules.map((s: any) => ({ 
        ...s, 
        month: s.month || 'Setiap Bulan',
        year: s.year || new Date().getFullYear().toString()
      }));
      setSchedules(restoredSchedules);
    }
    if (data.auth) setAuth(data.auth);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false); // Close sidebar on navigation
        }}
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header viewTitle={currentView} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'dashboard' && (
            <DashboardView 
              students={students} 
              transactions={transactions} 
            />
          )}
          {currentView === 'master' && (
            <MasterView 
              students={students} 
              setStudents={setStudents} 
              programs={programs} 
              setPrograms={setPrograms} 
            />
          )}
          {currentView === 'transaksi' && (
            <TransactionView 
              students={students} 
              programs={programs} 
              onAddTransaction={(t) => setTransactions([t, ...transactions])} 
            />
          )}
          {currentView === 'laporan' && (
            <ReportView 
              students={students} 
              transactions={transactions} 
              onDeleteTransaction={(id) => setTransactions(transactions.filter(t => t.id !== id))}
              onUpdateTransaction={(updated) => setTransactions(transactions.map(t => t.id === updated.id ? updated : t))}
            />
          )}
          {currentView === 'jadwal' && (
            <ScheduleView 
              schedules={schedules}
              setSchedules={setSchedules}
            />
          )}
          {currentView === 'pengaturan' && (
            <SettingsView 
              onUpdateAuth={updateAuth} 
              onRestore={restoreData}
              data={{ students, programs, transactions, schedules, auth }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
