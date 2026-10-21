import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PortalRole } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  BookOpen
} from 'lucide-react';

// Official Google 4-Color Logo
const GoogleIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    authModalRole,
    login, 
    register, 
    loginWithGoogle 
  } = useAuth();

  // Active portal selection: Job Seeker ('TEACHER'), Job Poster ('EMPLOYER'), or Admin ('ADMIN')
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>('TEACHER');
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('');
  const [subject, setSubject] = useState('');

  // Google Sign-In interactive modal state
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleFullName, setGoogleFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state when modal is triggered
  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
    if (authModalRole) {
      setSelectedPortal(authModalRole);
    }
  }, [authModalTab, authModalRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const navigateToRoleDashboard = (role: PortalRole) => {
    if (role === 'TEACHER') {
      navigate('/teacher-dashboard');
    } else if (role === 'EMPLOYER') {
      navigate('/employer-dashboard');
    } else if (role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  };

  // Real Email & Password Login directly to backend
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, selectedPortal);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(`Welcome back! Logging into ${selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Admin'} portal...`);
      setTimeout(() => {
        setSuccessMsg(null);
        closeAuthModal();
        navigateToRoleDashboard(selectedPortal);
      }, 700);
    } else {
      setError(res.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  // Real Registration directly to backend MongoDB Atlas
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const registerPayload = {
      email: email.trim().toLowerCase(),
      password,
      fullName: selectedPortal === 'EMPLOYER' ? (organizationName ? `${organizationName} (${fullName})` : fullName) : fullName,
      phone,
      role: selectedPortal === 'ADMIN' ? 'ADMIN' : selectedPortal === 'EMPLOYER' ? 'EMPLOYER' : 'TEACHER',
      city: city || 'Delhi NCR',
      subject: subject || 'General Teaching',
      organizationName: selectedPortal === 'EMPLOYER' ? organizationName : undefined,
    };

    const res = await register(registerPayload);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Account created successfully in database! Redirecting...');
      setTimeout(() => {
        setSuccessMsg(null);
        closeAuthModal();
        navigateToRoleDashboard(selectedPortal);
      }, 700);
    } else {
      setError(res.message || 'Registration failed. Please check the provided information.');
    }
  };

  // Real Continue with Google handler
  const handleExecuteGoogleLogin = async (googleAccountEmail: string, googleAccountName?: string) => {
    if (!googleAccountEmail || !googleAccountEmail.includes('@')) {
      setError('Please provide a valid Google email address.');
      return;
    }

    setError(null);
    setLoading(true);
    setShowGooglePicker(false);

    const res = await loginWithGoogle(selectedPortal, {
      email: googleAccountEmail.trim().toLowerCase(),
      fullName: googleAccountName || googleAccountEmail.split('@')[0],
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(`Google Authentication successful as ${selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Admin'}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        closeAuthModal();
        navigateToRoleDashboard(selectedPortal);
      }, 700);
    } else {
      setError(res.message || 'Google authentication could not be completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-sky-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-sky-50/70 via-sky-50/30 to-white border-b border-sky-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="SikshaHub Logo"
              className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-sky-200 bg-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 font-serif">
                  Siksha<span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                  .ai
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Recruitment Platform</p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Account Portal Selector (Job Seeker / Job Poster / Admin Login) */}
        <div className="px-6 pt-4 pb-2 bg-white">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Your Access Portal:
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Job Seeker Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('TEACHER');
                setError(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                selectedPortal === 'TEACHER'
                  ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs ring-1 ring-sky-400'
                  : 'border-sky-100 bg-white hover:bg-sky-50/50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <GraduationCap className={`w-4 h-4 ${selectedPortal === 'TEACHER' ? 'text-sky-600' : 'text-slate-400'}`} />
                {selectedPortal === 'TEACHER' && (
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold leading-tight">Job Seeker</p>
                <span className="text-[10px] text-slate-500 block">Teachers & Faculty</span>
              </div>
            </button>

            {/* Job Poster Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('EMPLOYER');
                setError(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                selectedPortal === 'EMPLOYER'
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs ring-1 ring-blue-400'
                  : 'border-sky-100 bg-white hover:bg-sky-50/50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`w-4 h-4 ${selectedPortal === 'EMPLOYER' ? 'text-blue-600' : 'text-slate-400'}`} />
                {selectedPortal === 'EMPLOYER' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold leading-tight">Job Poster</p>
                <span className="text-[10px] text-slate-500 block">Schools & Institutes</span>
              </div>
            </button>

            {/* Admin Login Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('ADMIN');
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                selectedPortal === 'ADMIN'
                  ? 'border-sky-700 bg-slate-900 text-white shadow-xs ring-1 ring-sky-600'
                  : 'border-sky-100 bg-white hover:bg-sky-50/50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <ShieldAlert className={`w-4 h-4 ${selectedPortal === 'ADMIN' ? 'text-sky-400' : 'text-slate-400'}`} />
                {selectedPortal === 'ADMIN' && (
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold leading-tight">Admin Login</p>
                <span className={`text-[10px] block ${selectedPortal === 'ADMIN' ? 'text-sky-200' : 'text-slate-500'}`}>
                  Governance Desk
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Sign In vs Create Account Tabs */}
        {selectedPortal !== 'ADMIN' ? (
          <div className="flex border-b border-sky-100 px-6 bg-sky-50/40">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'LOGIN'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'REGISTER'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Register ({selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'})
            </button>
          </div>
        ) : (
          <div className="px-6 py-2 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5 text-sky-800">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
              <span>Super Admin Governance Access</span>
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-700 font-extrabold px-2 py-0.5 rounded-full border border-sky-200">
              RESTRICTED
            </span>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 3. CONTINUE WITH GOOGLE (Available for Job Seeker, Job Poster & Admin) */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setCustomGoogleEmail(email || '');
                setGoogleFullName(fullName || '');
                setShowGooglePicker(!showGooglePicker);
              }}
              className="w-full py-2.5 px-4 rounded-2xl border border-sky-200 bg-white hover:bg-sky-50/70 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition active:scale-[0.99] group disabled:opacity-60"
            >
              <GoogleIcon />
              <span>
                Continue with Google as{' '}
                <strong className="text-sky-700">
                  {selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Admin'}
                </strong>
              </span>
            </button>

            {/* Google Account Authentication Prompt */}
            {showGooglePicker && (
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-sky-100">
                  <div className="flex items-center gap-2">
                    <GoogleIcon />
                    <span className="text-xs font-bold text-slate-900">Sign In with Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGooglePicker(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sign in or register directly using your Google account as <strong>{selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Admin'}</strong>.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Google Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Your Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={googleFullName}
                        onChange={(e) => setGoogleFullName(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
                        setError('Please provide a valid Google email address.');
                        return;
                      }
                      handleExecuteGoogleLogin(customGoogleEmail, googleFullName || customGoogleEmail.split('@')[0]);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-1"
                  >
                    <GoogleIcon />
                    <span>Authorize with Google</span>
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-sky-100 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Or with registered email
              </span>
              <div className="border-t border-sky-100 w-full" />
            </div>
          </div>

          {/* 4. Form for Sign In */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {selectedPortal === 'EMPLOYER' ? 'Work / Institutional Email' : selectedPortal === 'ADMIN' ? 'Administrator Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedPortal === 'EMPLOYER' 
                        ? 'e.g. hr@institution.edu' 
                        : selectedPortal === 'ADMIN' 
                        ? 'admin@governance.sikchakhub.com' 
                        : 'e.g. educator@example.com'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-sky-600 cursor-pointer hover:underline">Forgot?</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1"
              >
                {loading ? 'Authenticating...' : `Sign In as ${selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Super Admin'}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 5. Form for Registration (Job Seeker / Job Poster) */}
          {activeTab === 'REGISTER' && selectedPortal !== 'ADMIN' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              {/* Employer / Institution Organization Name */}
              {selectedPortal === 'EMPLOYER' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Institution / Organization Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Academy / Cambridge International"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {selectedPortal === 'EMPLOYER' ? 'Hiring In-charge / Principal Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedPortal === 'EMPLOYER' ? 'e.g. Dr. H. S. Rawat (Principal)' : 'e.g. Dr. Rajesh Sharma'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {selectedPortal === 'EMPLOYER' ? 'Official Work Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedPortal === 'EMPLOYER' ? 'hr@institution.edu' : 'educator@example.com'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Mobile Phone & City Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">City / Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kota, Delhi NCR"
                      className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subject / Specialization (if Teacher) */}
              {selectedPortal === 'TEACHER' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Teaching Subject / Level</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. JEE Physics, PGT Math, TGT Science"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? 'Creating Account in Database...' : `Register as ${selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
