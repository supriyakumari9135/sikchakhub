import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ChevronDown, 
  UserCircle, 
  ShieldAlert, 
  Building2, 
  Sparkles,
  LogOut,
  Menu,
  X,
  Plus,
  PlusCircle,
  PhoneCall,
  Flame,
  ArrowRight,
  Check,
  FileText,
  Calendar,
  Award,
  Settings,
  User,
  Users,
  ShieldCheck,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, institution, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState('All India');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const CITIES = [
    { name: 'All India', count: '1.8M+ Jobs' },
    { name: 'Kota (Rajasthan)', count: 'IIT-JEE Hub' },
    { name: 'Delhi NCR', count: 'CBSE & IB' },
    { name: 'Jaipur', count: 'Rajasthan' },
    { name: 'Bengaluru', count: 'South Hub' },
    { name: 'Pune', count: 'Maharashtra' },
    { name: 'Hyderabad', count: 'Telangana' },
    { name: 'Mumbai', count: 'Maharashtra' },
    { name: 'Lucknow', count: 'UP Central' },
    { name: 'Patna', count: 'Bihar' },
    { name: 'Indore', count: 'MP Central' }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setShowCityDropdown(false);
    setMobileMenuOpen(false);
    if (cityName === 'All India') {
      navigate('/jobs');
    } else {
      const cleanCity = cityName.split(' ')[0];
      navigate(`/jobs?city=${encodeURIComponent(cleanCity)}`);
    }
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // ==========================================
  // SCENARIO A: LOGGED-IN ROLE-BASED NAVBAR
  // When user is authenticated (TEACHER / EMPLOYER / ADMIN)
  // Hide public announcement banner & public marketing links.
  // Switch to clean, customized role-based navigation.
  // ==========================================
  if (user) {
    const isTeacher = user.role === 'TEACHER';
    const isEmployer = user.role === 'EMPLOYER';
    const isAdmin = user.role === 'ADMIN';

    // If logged in as ADMIN, completely suppress the upper Navbar
    // Super Admin has dedicated, full-screen edge-to-edge governance layout
    if (isAdmin) {
      return null;
    }

    return (
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs">
        {/* Accent Top Line based on role */}
        <div className={`h-[3px] w-full ${
          isTeacher 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600'
            : isEmployer
            ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600'
            : 'bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600'
        }`} />

        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Brand Logo & Role Pill */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link 
                to={isTeacher ? "/teacher-dashboard" : isEmployer ? "/employer-dashboard" : "/admin-dashboard"} 
                className="flex items-center gap-3 group"
              >
                <img
                  src="/logo.jpeg"
                  alt="SikshaHub Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs border border-amber-300/60 bg-white"
                />
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif leading-none">
                    Siksha<span className="text-sky-600">Hub</span><span className="text-sky-500 font-sans">.Ai</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 hidden sm:block">
                    {isTeacher && 'Job Seeker Portal'}
                    {isEmployer && 'Recruiter & School Portal'}
                    {isAdmin && 'Super Admin Governance'}
                  </span>
                </div>
              </Link>

              {/* Role Badge Indicator */}
              <div className="hidden sm:flex items-center">
                {isTeacher && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Job Seeker</span>
                  </span>
                )}
                {isEmployer && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Job Poster (Recruiter)</span>
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Super Admin</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center: Role-Specific Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {/* TEACHER (Job Seeker) Links */}
              {isTeacher && (
                <>
                  <Link
                    to="/teacher-dashboard"
                    className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition flex items-center gap-1.5 ${
                      location.pathname === '/teacher-dashboard'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/jobs"
                    className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition flex items-center gap-1.5 ${
                      location.pathname === '/jobs'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    <span>Browse Teaching Vacancies</span>
                  </Link>

                  <Link
                    to="/teacher-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>My Applications</span>
                  </Link>

                  <Link
                    to="/teacher-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Interview Calls</span>
                  </Link>
                </>
              )}

              {/* EMPLOYER (Job Poster) Links */}
              {isEmployer && (
                <>
                  <Link
                    to="/employer-dashboard"
                    className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition flex items-center gap-1.5 ${
                      location.pathname === '/employer-dashboard'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>Recruiter Dashboard</span>
                  </Link>

                  <Link
                    to="/employer-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Job Openings</span>
                  </Link>

                  <Link
                    to="/employer-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <UserCircle className="w-4 h-4 text-slate-500" />
                    <span>Applicant Pipeline</span>
                  </Link>

                  <Link
                    to="/employer-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Interviews</span>
                  </Link>
                </>
              )}

              {/* ADMIN Links */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold bg-purple-50 text-purple-700 font-bold transition flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Governance Console</span>
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>Institutions Verification</span>
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    className="px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>Audit Compliance</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Right: Actions & User Dropdown */}
            <div className="flex items-center gap-3">
              {/* Employer CTA: + Post Vacancy Opening */}
              {isEmployer && (
                <Link
                  to="/employer-dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Vacancy Opening</span>
                </Link>
              )}

              {/* Teacher CTA: Browse Teaching Vacancies */}
              {isTeacher && (
                <button
                  onClick={() => navigate('/jobs')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Browse Vacancies</span>
                </button>
              )}

              {/* User Dropdown Pill */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-2xl hover:bg-slate-100/80 transition border border-transparent hover:border-slate-200"
                >
                  <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${
                    isTeacher ? 'bg-purple-600' : isEmployer ? 'bg-sky-600' : 'bg-purple-800'
                  }`}>
                    {getUserInitials()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                        {user.fullName}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${showUserDropdown ? 'rotate-180 text-sky-600' : ''}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isTeacher ? 'Job Seeker' : isEmployer ? (institution?.name || 'Recruiter') : 'Super Admin'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                      <span className={`inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isTeacher 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isEmployer 
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {user.role} (ACTIVE SESSION)
                      </span>
                    </div>

                    <div className="py-1.5">
                      {isTeacher && (
                        <>
                          <Link
                            to="/teacher-dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Briefcase className="w-4 h-4 text-sky-600" />
                            <span>Job Seeker Dashboard</span>
                          </Link>
                          <Link
                            to="/jobs"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Search className="w-4 h-4 text-emerald-600" />
                            <span>Browse Teaching Jobs</span>
                          </Link>
                        </>
                      )}

                      {isEmployer && (
                        <>
                          <Link
                            to="/employer-dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>Recruiter Dashboard</span>
                          </Link>
                          <Link
                            to="/employer-dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Manage Applicants</span>
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          <span>Super Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer for Logged In User */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-6 space-y-3 shadow-xl">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
                <span className="text-[10px] font-black text-sky-600 uppercase mt-0.5 block">{user.role} ACCOUNT</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {isTeacher && (
                <>
                  <Link
                    to="/teacher-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </Link>
                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>Browse Teaching Vacancies</span>
                  </Link>
                </>
              )}

              {isEmployer && (
                <>
                  <Link
                    to="/employer-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Recruiter Dashboard</span>
                  </Link>
                  <Link
                    to="/employer-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Vacancy</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Governance Console</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  // ==========================================
  // SCENARIO B: UNCOMMITTED / GUEST VISITOR NAVBAR
  // Displays public promotional banner, city dropdown, public search, and Sign In/Up
  // ==========================================
  return (
    <header className="sticky top-0 z-50">
      {/* 1. Multi-Gradient Accent Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-blue-500 via-cyan-400 to-sky-600" />

      {/* 2. Top Announcement Strip */}
      <div className="bg-gradient-to-r from-sky-50 via-sky-100/70 to-blue-50 text-slate-700 text-xs py-1.5 px-3 sm:px-6 border-b border-sky-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left Ticker / Announcement */}
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-xs shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI RECRUITMENT</span>
            </span>
            <span className="text-[11px] sm:text-xs text-slate-600 truncate">
              <strong className="text-slate-800 font-semibold">• 5,500+ Top Institutes Hiring</strong> 
              <span className="text-sky-600 font-bold ml-1.5">• Zero Agency Fees</span> 
              <span className="hidden md:inline text-slate-600 ml-1.5">• Direct School & Coaching Connect</span>
            </span>
          </div>

          {/* Right Direct Helpline */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <a
              href="tel:9783143866"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-slate-700 hover:text-sky-700 transition text-[11px] font-medium"
              title="Call SikshaHub Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-600">Helpline:</span>
              <strong className="text-sky-600 font-bold tracking-wide">9783143866</strong>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Bar */}
      <div className="bg-white border-b border-slate-100 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Location */}
            <div className="flex items-center gap-3 sm:gap-5">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/logo.jpeg"
                  alt="SikshaHub Logo"
                  className="w-11 h-11 rounded-full object-cover shadow-xs border border-amber-300/60 bg-white"
                />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-[1.55rem] font-black tracking-tight text-slate-900 font-serif leading-none">
                    Siksha<span className="text-sky-600">Hub</span><span className="text-sky-500 font-sans">.Ai</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 hidden sm:block">
                    AI-Powered Teacher Recruitment
                  </span>
                </div>
              </Link>

              {/* City Selector Pill with Dropdown */}
              <div className="relative hidden md:block" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-sky-50/60 hover:bg-sky-100/70 px-3.5 py-2 rounded-xl border border-sky-200 transition-all shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate max-w-[110px]">{selectedCity}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showCityDropdown ? 'rotate-180 text-sky-600' : ''}`} />
                </button>

                {showCityDropdown && (
                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                    <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Filter by Location
                      </span>
                      <span className="text-[10px] text-sky-600 font-bold">11 Cities</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {CITIES.map(c => {
                        const isSelected = selectedCity === c.name;
                        return (
                          <button
                            key={c.name}
                            onClick={() => handleCitySelect(c.name)}
                            className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                              isSelected 
                                ? 'bg-sky-50 text-sky-700 font-bold' 
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3 h-3 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                              <span>{c.name}</span>
                            </div>
                            <span className={`text-[10px] ${isSelected ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>
                              {c.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname === '/jobs' && !location.search
                    ? 'text-sky-600 bg-sky-50 font-bold'
                    : 'text-slate-700 hover:text-sky-600 hover:bg-sky-50/70'
                }`}
              >
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>Find Jobs</span>
              </Link>

              <Link
                to="/jobs?teachingLevel=COACHING_JEE"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.search.includes('COACHING_JEE')
                    ? 'text-sky-600 bg-sky-50 font-bold'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50/70'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>IIT & NEET</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                  HOT
                </span>
              </Link>

              <Link
                to="/jobs?teachingLevel=PGT"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.search.includes('PGT')
                    ? 'text-sky-600 bg-sky-50 font-bold'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50/70'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>School Teachers</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80">
                  CBSE
                </span>
              </Link>
            </nav>

            {/* Right Action Menu: + Post a Job + Sign In / Up */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/login?role=EMPLOYER"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-sky-600 hover:text-sky-700 bg-white hover:bg-sky-50 border border-sky-500 transition-all shadow-2xs group"
              >
                <span>+ Post a Job</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xs transition active:scale-95"
                >
                  <span>Sign Up</span>
                </Link>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200/90 transition shadow-2xs"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 4. Mobile Navigation Drawer for Guests */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-100 bg-white/98 backdrop-blur-2xl px-5 pt-3 pb-8 space-y-3.5 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white border border-sky-700/50 shadow-md">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="SikshaHub" className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-300 bg-white" />
              <div>
                <span className="font-serif font-black text-sm tracking-wide">
                  Siksha<span className="text-cyan-300">Hub</span>.ai
                </span>
                <p className="text-[10px] text-sky-200">AI Teacher Recruitment Network</p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm text-white bg-sky-600 hover:bg-sky-700 shadow-md transition"
            >
              <UserCircle className="w-5 h-5" />
              <span>Login / Sign Up</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 text-slate-800 font-bold text-xs"
            >
              <span>Explore Teaching Vacancies</span>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>

            <Link
              to="/jobs?teachingLevel=COACHING_JEE"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs"
            >
              <span>IIT-JEE & NEET Coaching Roles</span>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>

            <Link
              to="/jobs?teachingLevel=PGT"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs"
            >
              <span>School Teachers (CBSE, ICSE)</span>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
