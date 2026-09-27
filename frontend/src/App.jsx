import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddIncome } from './pages/AddIncome';
import { AddExpense } from './pages/AddExpense';
import { Schemes } from './pages/Schemes';
import { Score } from './pages/Score';
import { Profile } from './pages/Profile';

const ProtectedLayout = () => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--bg-dark-navy)', fontWeight: 'bold' }}>
        Loading SahiHisaab...
      </div>
    );
  }

  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/score" element={<Score />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  );
};

export default App;
