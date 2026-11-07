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
  BookOpen,
  Calendar,
  Briefcase,
  Award
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    authModalRole,
    login, 
    register
  } = useAuth();

  // Active portal selection: Job Seeker ('TEACHER'), Job Poster ('EMPLOYER'), or Admin ('ADMIN')
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>('TEACHER');
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [institutionType, setInstitutionType] = useState('SCHOOL');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [subject, setSubject] = useState('');
  const [highestQualification, setHighestQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

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

    if (age && (Number(age) < 18 || Number(age) > 100)) {
      setError('Please enter a valid age (minimum 18 years).');
      return;
    }

    setLoading(true);

    const registerPayload = {
      email: email.trim().toLowerCase(),
      password,
      fullName: selectedPortal === 'EMPLOYER' ? (organizationName ? `${organizationName} (${fullName})` : fullName) : fullName,
      phone,
      age: age ? Number(age) : undefined,
      role: selectedPortal === 'ADMIN' ? 'ADMIN' : selectedPortal === 'EMPLOYER' ? 'EMPLOYER' : 'TEACHER',
      city: city || 'Delhi NCR',
      state: stateName || 'Delhi',
      subject: subject || 'General Teaching',
      highestQualification: highestQualification || undefined,
      experienceYears: experienceYears ? Number(experienceYears) : undefined,
      organizationName: selectedPortal === 'EMPLOYER' ? organizationName : undefined,
      institutionType: selectedPortal === 'EMPLOYER' ? institutionType : undefined,
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

        {/* 2. Sign In vs Sign Up Tabs */}
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
              Sign Up ({selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'})
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

          {/* Form for Sign In */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {selectedPortal === 'EMPLOYER' ? 'Work / Institutional Email or Gmail' : selectedPortal === 'ADMIN' ? 'Administrator Email' : 'Email / Gmail Address'}
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
                        ? 'e.g. principal@institution.edu or yourname@gmail.com' 
                        : selectedPortal === 'ADMIN' 
                        ? 'admin@governance.sikchakhub.com' 
                        : 'e.g. educator@gmail.com'
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

              {selectedPortal !== 'ADMIN' && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('REGISTER');
                        setError(null);
                      }}
                      className="font-bold text-sky-600 hover:text-sky-700 underline"
                    >
                      Sign Up as {selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}

          {/* Form for Sign Up (Registration for Job Seeker / Job Poster) */}
          {activeTab === 'REGISTER' && selectedPortal !== 'ADMIN' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Institution / Organization Name (For Job Poster) */}
              {selectedPortal === 'EMPLOYER' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Institution / School / Organization Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. Apex Academy / Delhi Public School"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Institution Type
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                    >
                      <option value="SCHOOL">School (CBSE / ICSE / State / IB)</option>
                      <option value="COACHING_INSTITUTE">Coaching Institute (IIT-JEE / NEET)</option>
                      <option value="COLLEGE">College / University</option>
                      <option value="EDTECH">EdTech Platform</option>
                      <option value="PRE_PRIMARY">Play School / Pre-Primary</option>
                    </select>
                  </div>
                </>
              )}

              {/* Full Name & Age Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {selectedPortal === 'EMPLOYER' ? 'Principal / Hiring Lead Name' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedPortal === 'EMPLOYER' ? 'e.g. Dr. H. S. Rawat' : 'e.g. Dr. Rajesh Sharma'}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min={18}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email / Gmail Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {selectedPortal === 'EMPLOYER' ? 'Official / Work Gmail or Email' : 'Email / Gmail Address'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com or hr@school.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Mobile Phone & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
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

              {/* Job Seeker specific fields: Subject, Qualification, Experience */}
              {selectedPortal === 'TEACHER' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Teaching Subject / Specialization</label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Physics, Math, English"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Highest Qualification</label>
                      <div className="relative">
                        <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={highestQualification}
                          onChange={(e) => setHighestQualification(e.target.value)}
                          placeholder="e.g. M.Sc., B.Ed., Ph.D."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Teaching Experience (in Years)</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 characters)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? 'Creating Account in Database...' : `Sign Up as ${selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}`}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('LOGIN');
                      setError(null);
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
