import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, PortalRole } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Briefcase, 
  Award, 
  MapPin, 
  BookOpen, 
  Clock,
  School,
  ShieldCheck
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle, user } = useAuth();

  // Parse query params (e.g. /login?role=EMPLOYER or /signup?role=TEACHER)
  const searchParams = new URLSearchParams(location.search);
  const queryRole = searchParams.get('role')?.toUpperCase();
  const queryTab = searchParams.get('tab')?.toUpperCase();

  // Mode: LOGIN or REGISTER
  const defaultMode = initialMode || (location.pathname.includes('signup') || location.pathname.includes('register') ? 'REGISTER' : 'LOGIN');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(defaultMode);

  // Active portal: TEACHER, EMPLOYER, or ADMIN
  const initialPortal: PortalRole = 
    queryRole === 'EMPLOYER' ? 'EMPLOYER' :
    queryRole === 'ADMIN' ? 'ADMIN' : 'TEACHER';
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>(initialPortal);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [institutionType, setInstitutionType] = useState('SCHOOL');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [highestQualification, setHighestQualification] = useState('B.Ed / Post Graduate');
  const [teachingLevel, setTeachingLevel] = useState('PGT');
  const [experienceYears, setExperienceYears] = useState('3');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with route changes (/login vs /signup)
  useEffect(() => {
    if (location.pathname.includes('signup') || location.pathname.includes('register')) {
      setMode('REGISTER');
    } else if (location.pathname.includes('login') || location.pathname.includes('signin')) {
      setMode('LOGIN');
    }
  }, [location.pathname]);

  // Sync portal from query params
  useEffect(() => {
    if (queryRole === 'EMPLOYER') setSelectedPortal('EMPLOYER');
    else if (queryRole === 'ADMIN') setSelectedPortal('ADMIN');
    else if (queryRole === 'TEACHER') setSelectedPortal('TEACHER');

    if (queryTab === 'REGISTER') setMode('REGISTER');
    else if (queryTab === 'LOGIN') setMode('LOGIN');
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin-dashboard');
      else if (user.role === 'EMPLOYER') navigate('/employer-dashboard');
      else navigate('/teacher-dashboard');
    }
  }, [user, navigate]);

  const navigateToRoleDashboard = (role: PortalRole) => {
    if (role === 'TEACHER') {
      navigate('/teacher-dashboard');
    } else if (role === 'EMPLOYER') {
      navigate('/employer-dashboard');
    } else if (role === 'ADMIN') {
      navigate('/admin-dashboard');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, selectedPortal);
      if (res.success) {
        setSuccessMsg(`Authentication verified. Redirecting to ${selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Recruiter' : 'Super Admin'} console...`);
        setTimeout(() => {
          navigateToRoleDashboard(selectedPortal);
        }, 600);
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (age && (Number(age) < 18 || Number(age) > 100)) {
      setError('Please enter a valid age (minimum 18 years).');
      return;
    }

    setLoading(true);

    try {
      const registerPayload = {
        email: email.trim().toLowerCase(),
        password,
        fullName: selectedPortal === 'EMPLOYER' ? (organizationName ? `${organizationName} (${fullName})` : fullName) : fullName,
        phone,
        age: age ? Number(age) : undefined,
        role: selectedPortal === 'ADMIN' ? 'ADMIN' : selectedPortal === 'EMPLOYER' ? 'EMPLOYER' : 'TEACHER',
        city: city || 'Delhi NCR',
        state: stateName || 'Delhi',
        subject: subject || 'Physics',
        highestQualification: highestQualification || undefined,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        organizationName: selectedPortal === 'EMPLOYER' ? organizationName : undefined,
        institutionType: selectedPortal === 'EMPLOYER' ? institutionType : undefined,
      };

      const res = await register(registerPayload);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Preparing your workspace...');
        setTimeout(() => {
          navigateToRoleDashboard(selectedPortal);
        }, 700);
      } else {
        setError(res.message || 'Registration failed. Please check the provided information.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const mockEmail = selectedPortal === 'TEACHER' ? 'educator.google@sikshahub.ai' : 'recruiter.google@sikshahub.ai';
    const mockName = selectedPortal === 'TEACHER' ? 'Google Verified Educator' : 'Google Verified Institution';
    
    setLoading(true);
    const res = await loginWithGoogle(selectedPortal, {
      email: mockEmail,
      fullName: mockName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockName)}`
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Google verification successful! Redirecting...');
      setTimeout(() => {
        navigateToRoleDashboard(selectedPortal);
      }, 600);
    } else {
      setError(res.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Hero Sidebar (Brand Value & Trust) - Visible on lg screens */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-sky-50/90 via-blue-50/50 to-indigo-50/60 p-8 flex-col justify-between border-r border-sky-100 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Next-Gen Educator Hiring</span>
            </span>

            <div>
              <h2 className="text-2xl font-black text-slate-900 font-serif leading-tight">
                Connect With Top Schools & Expert Faculty Across India
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Direct recruiter-teacher matchmaking with automated ATS score ranking, free resume hosting, and structured demo scheduling.
              </p>
            </div>

            {/* Dynamic Feature List according to selected portal */}
            <div className="space-y-3 pt-2">
              {selectedPortal === 'TEACHER' ? (
                <>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Direct School Applications</h4>
                      <p className="text-[11px] text-slate-500">Zero agency mediation fees. Directly apply to verified CBSE, ICSE, and coaching institutes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 shadow-2xs">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Automated ATS Resume Match</h4>
                      <p className="text-[11px] text-slate-500">Instant resume score analysis comparing your experience and credentials to the job syllabus.</p>
                    </div>
                  </div>
                </>
              ) : selectedPortal === 'EMPLOYER' ? (
                <>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 shadow-2xs">
                    <Building2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Institutional Recruiter Suite</h4>
                      <p className="text-[11px] text-slate-500">Screen candidate CVs with one click, rank applicants by ATS percentage, and schedule demo classes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Verified School Network</h4>
                      <p className="text-[11px] text-slate-500">Super Admin verification ensures authentic job postings and verified applicant backgrounds.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-purple-100 shadow-2xs">
                    <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Super Admin Governance</h4>
                      <p className="text-[11px] text-slate-500">Centralized governance for school approvals, job posting moderation, and audit compliance.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Key Stats */}
          <div className="pt-6 border-t border-sky-100 grid grid-cols-3 gap-2 text-center relative z-10">
            <div>
              <p className="text-lg font-black text-slate-900 font-mono">5,500+</p>
              <p className="text-[10px] text-slate-500">Institutions</p>
            </div>
            <div>
              <p className="text-lg font-black text-sky-600 font-mono">1.8M+</p>
              <p className="text-[10px] text-slate-500">Teachers</p>
            </div>
            <div>
              <p className="text-lg font-black text-emerald-600 font-mono">0%</p>
              <p className="text-[10px] text-slate-500">Commission</p>
            </div>
          </div>
        </div>

        {/* Right Main Authentication Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* 1. PORTAL SELECTOR: Job Seeker | Job Poster | Admin Login */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                Select Your Access Portal:
              </span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Job Seeker Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('TEACHER');
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedPortal === 'TEACHER'
                      ? 'border-sky-500 bg-sky-50 text-sky-950 ring-1 ring-sky-500 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <GraduationCap className={`w-4 h-4 ${selectedPortal === 'TEACHER' ? 'text-sky-600' : 'text-slate-400'}`} />
                    {selectedPortal === 'TEACHER' && (
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold leading-tight">Job Seeker</p>
                    <p className="text-[10px] text-slate-500 truncate">Teachers & Faculty</p>
                  </div>
                </button>

                {/* Job Poster Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('EMPLOYER');
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedPortal === 'EMPLOYER'
                      ? 'border-sky-500 bg-sky-50 text-sky-950 ring-1 ring-sky-500 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className={`w-4 h-4 ${selectedPortal === 'EMPLOYER' ? 'text-sky-600' : 'text-slate-400'}`} />
                    {selectedPortal === 'EMPLOYER' && (
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold leading-tight">Job Poster</p>
                    <p className="text-[10px] text-slate-500 truncate">Schools & Institutes</p>
                  </div>
                </button>

                {/* Admin Login Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('ADMIN');
                    setMode('LOGIN'); // Admins only log in
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedPortal === 'ADMIN'
                      ? 'border-purple-500 bg-purple-50 text-purple-950 ring-1 ring-purple-500 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldAlert className={`w-4 h-4 ${selectedPortal === 'ADMIN' ? 'text-purple-600' : 'text-slate-400'}`} />
                    {selectedPortal === 'ADMIN' && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold leading-tight">Admin Login</p>
                    <p className="text-[10px] text-slate-500 truncate">Governance Desk</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. MODE TOGGLE: Sign In vs Sign Up (Hidden for Admin) */}
            {selectedPortal !== 'ADMIN' ? (
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
                    mode === 'LOGIN'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
                    mode === 'REGISTER'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign Up ({selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'})
                </button>
              </div>
            ) : (
              <div className="mb-5 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Administrative Authorization Console. Use provisioned credentials.</span>
              </div>
            )}

            {/* Error & Success Toasts */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 3. AUTH FORMS */}
            {mode === 'LOGIN' ? (
              /* ======================== SIGN IN FORM ======================== */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {selectedPortal === 'EMPLOYER' ? 'Official Work / Institutional Email' : selectedPortal === 'ADMIN' ? 'Super Admin Email Address' : 'Email / Gmail Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedPortal === 'ADMIN' ? 'sikshahub@gmail.com' : selectedPortal === 'EMPLOYER' ? 'recruiter@institution.edu' : 'e.g. educator@gmail.com'}
                      className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link will be sent to your registered email address.')}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 shadow-md active:scale-[0.99] mt-2 ${
                    selectedPortal === 'ADMIN'
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25'
                  }`}
                >
                  {loading ? (
                    <span>Verifying credentials...</span>
                  ) : (
                    <>
                      <span>Sign In as {selectedPortal === 'TEACHER' ? 'Job Seeker' : selectedPortal === 'EMPLOYER' ? 'Job Poster' : 'Super Admin'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Google OAuth Quick Login (Only for Teacher / Employer) */}
                {selectedPortal !== 'ADMIN' && (
                  <div className="pt-2">
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-200" />
                      <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">Or continue with</span>
                      <div className="flex-grow border-t border-slate-200" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-2xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign In with Google</span>
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* ======================== SIGN UP FORM ======================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {selectedPortal === 'TEACHER' ? (
                  /* Job Seeker Registration */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Dr. Priya Sharma"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                        <input
                          type="number"
                          required
                          min={18}
                          max={100}
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 29"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="educator@gmail.com"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9876543210"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Teaching Subject *</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        >
                          <option value="Physics">Physics</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Computer Science">Computer Science & AI</option>
                          <option value="Social Science">Social Science / History</option>
                          <option value="Commerce & Accountancy">Commerce & Accountancy</option>
                          <option value="Economics">Economics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification *</label>
                        <select
                          value={highestQualification}
                          onChange={(e) => setHighestQualification(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        >
                          <option value="B.Ed / Post Graduate">B.Ed / Post Graduate</option>
                          <option value="M.Sc / B.Sc">M.Sc / B.Sc in Pure Sciences</option>
                          <option value="B.Tech / M.Tech">B.Tech / M.Tech in CS/Engineering</option>
                          <option value="Ph.D">Ph.D / Doctorate</option>
                          <option value="M.Ed">M.Ed (Master of Education)</option>
                          <option value="D.El.Ed">Diploma in Elementary Education (D.El.Ed)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Level</label>
                        <select
                          value={teachingLevel}
                          onChange={(e) => setTeachingLevel(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        >
                          <option value="PRT">PRT (Grades 1-5)</option>
                          <option value="TGT">TGT (Grades 6-10)</option>
                          <option value="PGT">PGT (Grades 11-12)</option>
                          <option value="COACHING_JEE">IIT-JEE Faculty</option>
                          <option value="COACHING_NEET">NEET Faculty</option>
                          <option value="COLLEGE_PROFESSOR">College / Professor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Yrs)</label>
                        <input
                          type="number"
                          min={0}
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="3"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Patna / Kota"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Job Poster / Employer Registration */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name *</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            placeholder="e.g. Delhi Public School"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution Type *</label>
                        <select
                          value={institutionType}
                          onChange={(e) => setInstitutionType(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        >
                          <option value="SCHOOL">K-12 School (CBSE / ICSE / IB)</option>
                          <option value="COACHING_INSTITUTE">IIT-JEE / NEET Coaching</option>
                          <option value="COLLEGE">Degree College / University</option>
                          <option value="EDTECH">EdTech Organization</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person / Principal *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Principal Rajesh Verma"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Official Mobile / Helpline *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9876543210"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Work / Official Email *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="recruiter@school.org"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. New Delhi / Patna"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Platform Governance: Newly registered institutions undergo Super Admin verification. You can draft vacancies immediately; they will be published live once verified.</span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <span>Creating database account...</span>
                  ) : (
                    <>
                      <span>Register as {selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'LOGIN' ? (
              selectedPortal !== 'ADMIN' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('REGISTER')}
                    className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4"
                  >
                    Sign Up as {selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}
                  </button>
                </p>
              ) : (
                <p className="text-slate-400">
                  SikshaHub.Ai Super Admin Console • Authorized Personnel Only
                </p>
              )
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4"
                >
                  Sign In to your account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

