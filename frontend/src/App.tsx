import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

// Optimized route-level code splitting via React.lazy
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const JobsPage = React.lazy(() => import('./pages/JobsPage').then(m => ({ default: m.JobsPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const EmployerDashboard = React.lazy(() => import('./pages/EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OtpVerificationPage = React.lazy(() => import('./pages/OtpVerificationPage').then(m => ({ default: m.OtpVerificationPage })));

// Enterprise loading skeleton matching SikchaKhub theme
const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-slate-50/50">
    <div className="relative flex items-center justify-center w-16 h-16 mb-4">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-40"></div>
      <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
      <div className="absolute w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      </div>
    </div>
    <div className="flex flex-col items-center gap-1.5 text-center">
      <p className="text-sm font-semibold text-slate-800 tracking-wide">Loading SikchaKhub...</p>
      <p className="text-xs text-slate-400">Connecting top educators with premier institutions</p>
    </div>
  </div>
);

// Protected Route Guard ensuring full dual verification before dashboard access
const VerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  if (isLoading) return <PageLoadingSkeleton />;
  if (!user && !token && !localStorage.getItem('sikchakhub_token')) {
    return <Navigate to="/login" replace />;
  }

  const isUnverified = user && 
    user.role !== 'ADMIN' && 
    user.role !== 'HR' && 
    (user.isVerified === false || (user.verificationStatus && user.verificationStatus !== 'FULLY_VERIFIED'));

  if (isUnverified) {
    return <Navigate to="/verify-otp" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide upper navbar and footer exclusively on Super Admin & HR governance console and OTP page
  const hideNavbarAndFooter = 
    user?.role === 'ADMIN' || 
    user?.role === 'HR' ||
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname === '/verify-otp' ||
    location.pathname === '/verify';

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-white text-slate-900">
      {!hideNavbarAndFooter && <Navbar />}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingSkeleton />}>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/login" element={<AuthPage initialMode="LOGIN" />} />
            <Route path="/signin" element={<AuthPage initialMode="LOGIN" />} />
            <Route path="/hr-login" element={<AuthPage initialMode="LOGIN" initialPortal="HR" />} />
            <Route path="/hr" element={<AuthPage initialMode="LOGIN" initialPortal="HR" />} />
            <Route path="/signup" element={<AuthPage initialMode="REGISTER" />} />
            <Route path="/register" element={<AuthPage initialMode="REGISTER" />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/verify" element={<OtpVerificationPage />} />
            <Route 
              path="/teacher-dashboard" 
              element={
                <VerifiedRoute>
                  <TeacherDashboard />
                </VerifiedRoute>
              } 
            />
            <Route 
              path="/employer-dashboard" 
              element={
                <VerifiedRoute>
                  <EmployerDashboard />
                </VerifiedRoute>
              } 
            />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
};
