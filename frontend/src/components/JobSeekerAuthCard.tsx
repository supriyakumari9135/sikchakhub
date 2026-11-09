import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Award, 
  Briefcase, 
  MapPin, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const JobSeekerAuthCard: React.FC = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [highestQualification, setHighestQualification] = useState('B.Ed / Post Graduate');
  const [teachingLevel, setTeachingLevel] = useState('PGT');
  const [experienceYears, setExperienceYears] = useState('3');
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
      fullName,
      age: age ? Number(age) : undefined,
      email: email.trim().toLowerCase(),
      phone,
      subject,
      highestQualification,
      teachingLevel,
      experienceYears: experienceYears ? Number(experienceYears) : 0,
      city: city || 'Delhi NCR',
      state: stateName || 'Delhi',
      password,
      role: 'TEACHER',
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg('Account created successfully in database! Loading your dashboard...');
    } else {
      setError(res.message || 'Registration failed. Please verify your details.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, 'TEACHER');
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Welcome back! Logging into Job Seeker Portal...');
    } else {
      setError(res.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-sky-50/60 via-white to-sky-50/30 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header Badge & Title */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200">
            <GraduationCap className="w-4 h-4" />
            <span>Job Seeker Educator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            {mode === 'REGISTER' ? 'Sign Up as a Job Seeker' : 'Sign In to Job Seeker Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
            {mode === 'REGISTER' 
              ? 'Fill in your basic information and educator profile to access 1.8M+ verified teaching vacancies, automated AI screening, and direct school interview calls.' 
              : 'Welcome back! Log in to access your applications, screening scores, and interview schedule.'}
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
                  ? 'bg-white text-sky-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account (Sign Up)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'LOGIN' 
                  ? 'bg-white text-sky-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Existing User (Sign In)
            </button>
          </div>
        </div>

        {/* Main Grid: Form on Left, Educator Benefits on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-sky-100 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-semibold leading-relaxed">{error}</p>
                  {(error.includes('Job Poster') || error.includes('Employer')) && (
                    <button
                      type="button"
                      onClick={() => navigate('/employer-dashboard')}
                      className="font-bold underline text-sky-700 hover:text-sky-900 flex items-center gap-1 mt-1 text-xs"
                    >
                      <span>Switch to Job Poster (Employer) Login →</span>
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
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
                    1. Basic Candidate Details
                  </h3>
                </div>

                {/* Name & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Sharma"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                        placeholder="e.g. 28"
                        className="w-full pl-9 pr-2 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email / Gmail & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email / Gmail Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. educator@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-sky-100 pb-2 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
                    2. Teaching Specialization & Qualifications
                  </h3>
                </div>

                {/* Subject & Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Teaching Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                      >
                        <option value="Physics">Physics (JEE / NEET / CBSE)</option>
                        <option value="Mathematics">Mathematics (JEE / Secondary)</option>
                        <option value="Chemistry">Chemistry (Organic / Physical)</option>
                        <option value="Biology">Biology / Zoology / Botany</option>
                        <option value="Computer Science">Computer Science / AI</option>
                        <option value="English">English Literature / Language</option>
                        <option value="Social Studies">Social Studies / Humanities</option>
                        <option value="Commerce">Commerce / Accountancy</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Highest Qualification <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        placeholder="e.g. M.Sc Physics, B.Ed"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Teaching Level & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Primary Teaching Level
                    </label>
                    <select
                      value={teachingLevel}
                      onChange={(e) => setTeachingLevel(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                    >
                      <option value="COACHING_JEE">IIT-JEE Advanced Coaching Faculty</option>
                      <option value="COACHING_NEET">NEET Medical Faculty</option>
                      <option value="PGT">PGT (Grades 11-12 Senior Secondary)</option>
                      <option value="TGT">TGT (Grades 6-10 Middle School)</option>
                      <option value="PRT">PRT (Grades 1-5 Primary)</option>
                      <option value="COLLEGE_PROFESSOR">College / University Faculty</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Teaching Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        required
                        min={0}
                        max={50}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* City & State Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Current City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kota, Delhi NCR, Jaipur"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Rajasthan, Delhi, Maharashtra"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Creating Your Job Seeker Account...' : 'Complete Sign Up as Job Seeker'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 underline"
                  >
                    Sign In here
                  </button>
                </p>
              </form>
            ) : (
              /* Inline Login Form */
              <form onSubmit={handleLogin} className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email / Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. educator@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
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
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Job Seeker'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                  New to SikshaHub?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 underline"
                  >
                    Create a Free Job Seeker Account
                  </button>
                </p>
              </form>
            )}
          </div>

          {/* Right Highlights & Platform Trust Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  Zero Agency Commission
                </span>
                <h3 className="text-xl font-bold font-serif">
                  Why Educators Choose SikshaHub
                </h3>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Join India's dedicated teacher hiring exchange with verified school connections and instant status visibility.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Deterministic AI Screening</h4>
                    <p className="text-[11px] text-sky-200/80">Get scored on your actual subject expertise and curriculum experience.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct Principal & Director Contact</h4>
                    <p className="text-[11px] text-sky-200/80">Zero intermediaries or agency fees. You talk directly to hiring committees.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Fast-track Demo Classes</h4>
                    <p className="text-[11px] text-sky-200/80">Receive online/offline demo interview schedules within 72 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1.8M+ Educator Community</h4>
                    <p className="text-[11px] text-sky-200/80">Trusted by faculty teaching in Kota, Delhi NCR, Bangalore, and across India.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">5,500+ Verified Schools & Institutes</p>
                <p className="text-[11px] text-slate-500">Actively reviewing educator profiles today</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

