import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Check,
  Briefcase,
  Users
} from 'lucide-react';

export const JobPosterAuthCard: React.FC = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');

  // Form Fields
  const [organizationName, setOrganizationName] = useState('');
  const [institutionType, setInstitutionType] = useState('SCHOOL');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (age && (Number(age) < 18 || Number(age) > 100)) {
      setError('Please enter a valid age between 18 and 100.');
      return;
    }

    setLoading(true);

    const res = await register({
      organizationName,
      institutionType,
      fullName,
      age: age ? Number(age) : undefined,
      email: email.trim().toLowerCase(),
      phone,
      city: city || 'Delhi NCR',
      state: stateName || 'Delhi',
      password,
      role: 'EMPLOYER',
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg('Institution registered successfully! Loading Recruiter Dashboard...');
    } else {
      setError(res.message || 'Registration failed. Please verify your details.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, 'EMPLOYER');
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Welcome back! Logging into Job Poster Dashboard...');
    } else {
      setError(res.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-sky-50/60 via-white to-sky-50/30 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header Badge & Title */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
            <Building2 className="w-4 h-4" />
            <span>Job Poster & Recruiter Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            {mode === 'REGISTER' ? 'Sign Up as a Job Poster' : 'Sign In to Recruiter Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
            {mode === 'REGISTER' 
              ? 'Register your school, college, or coaching academy to publish educator vacancies, screen applicants deterministically, and schedule interviews.' 
              : 'Log in to manage your active vacancies, review screened candidates, and schedule faculty demo rounds.'}
          </p>

          {/* Mode Switcher Pills */}
          <div className="inline-flex p-1 bg-sky-100/70 rounded-2xl border border-sky-200 max-w-full">
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
              className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'REGISTER' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Institution (Sign Up)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'LOGIN' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Existing Recruiter (Sign In)
            </button>
          </div>
        </div>

        {/* Main Grid: Form on Left, Employer Benefits on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-sky-100 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-semibold leading-relaxed">{error}</p>
                  {(error.includes('Job Seeker') || error.includes('Educator')) && (
                    <button
                      type="button"
                      onClick={() => navigate('/teacher-dashboard')}
                      className="font-bold underline text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-1 text-xs"
                    >
                      <span>Switch to Job Seeker (Educator) Login →</span>
                    </button>
                  )}
                  {error.includes('Super Admin') && (
                    <button
                      type="button"
                      onClick={() => navigate('/login?role=ADMIN')}
                      className="font-bold underline text-purple-700 hover:text-purple-900 flex items-center gap-1 mt-1 text-xs"
                    >
                      <span>Switch to Super Admin Login →</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'REGISTER' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                
                <div className="border-b border-sky-100 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                    1. Institution & Organization Information
                  </h3>
                </div>

                {/* Organization Name & Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Institution / School / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Academy / Delhi Public School / Cambridge International"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Institution Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="SCHOOL">School (CBSE / ICSE / State / IB Board)</option>
                    <option value="COACHING_INSTITUTE">Coaching Institute (IIT-JEE / NEET / Foundation)</option>
                    <option value="COLLEGE">College / University / Degree Institute</option>
                    <option value="EDTECH">EdTech Platform / Online Academy</option>
                    <option value="PRE_PRIMARY">Play School / Kindergarten / Pre-Primary</option>
                  </select>
                </div>

                <div className="border-b border-sky-100 pb-2 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                    2. Principal / Hiring Lead Contact Details
                  </h3>
                </div>

                {/* Name & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Hiring In-charge / Principal Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. H. S. Rawat"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        required
                        min={18}
                        max={100}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 38"
                        className="w-full pl-9 pr-2 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email / Gmail & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Official Work Email / Gmail <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. hr@school.edu or principal@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* City & State Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">City / Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kota, Delhi NCR, Jaipur"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Rajasthan, Delhi, Maharashtra"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters strong password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Registering Institution...' : 'Complete Sign Up as Job Poster'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 underline"
                  >
                    Sign In to Recruiter Desk
                  </button>
                </p>
              </form>
            ) : (
              /* Inline Login Form */
              <form onSubmit={handleLogin} className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Work Email / Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. hr@school.edu or recruiter@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">Forgot?</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Job Poster'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                  New institution to SikchaKhub?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 underline"
                  >
                    Register Your Institution
                  </button>
                </p>
              </form>
            )}
          </div>

          {/* Right Highlights & Employer Benefits Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-sky-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Built for Schools & Academies
                </span>
                <h3 className="text-xl font-bold font-serif">
                  Hire Top Teaching Faculty in ~72 Hours
                </h3>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Post vacancies for JEE, NEET, PGT, TGT, and university faculty with automated AI ranking against your curriculum criteria.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Publish Unlimited Vacancies</h4>
                    <p className="text-[11px] text-blue-200/80">Full vacancy management with custom position screening questions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Automated Candidate Ranking</h4>
                    <p className="text-[11px] text-blue-200/80">Deterministic match scores evaluate subject fit and experience instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1.8M+ Verified Educator Pool</h4>
                    <p className="text-[11px] text-blue-200/80">Connect directly with pre-screened IIT-JEE mentors, CBSE teachers, and lecturers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Demo Session Scheduler</h4>
                    <p className="text-[11px] text-blue-200/80">Set up virtual or classroom demo rounds with automated invite links.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Badge Card */}
            <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Verified Organization Status</p>
                  <p className="text-[11px] text-slate-500">Immediate badge upon profile registration</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

