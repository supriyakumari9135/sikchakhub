import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide upper navbar and footer exclusively on Super Admin & HR governance console
  const hideNavbarAndFooter = 
    user?.role === 'ADMIN' || 
    user?.role === 'HR' ||
    location.pathname.startsWith('/admin-dashboard');

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {!hideNavbarAndFooter && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/login" element={<AuthPage initialMode="LOGIN" />} />
          <Route path="/signin" element={<AuthPage initialMode="LOGIN" />} />
          <Route path="/hr-login" element={<AuthPage initialMode="LOGIN" initialPortal="HR" />} />
          <Route path="/hr" element={<AuthPage initialMode="LOGIN" initialPortal="HR" />} />
          <Route path="/signup" element={<AuthPage initialMode="REGISTER" />} />
          <Route path="/register" element={<AuthPage initialMode="REGISTER" />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
};
