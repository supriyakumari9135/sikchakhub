import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ChevronDown, 
  UserCircle, 
  Building2, 
  Sparkles,
  LogOut,
  Menu,
  X,
  Plus,
  PhoneCall,
  Flame,
  ArrowRight,
  Check,
  FileText,
  Users,
  Search,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, institution, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState('All India');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileCityDropdown, setShowMobileCityDropdown] = useState(false);
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
    setShowMobileCityDropdown(false);
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
  // When user is authenticated (TEACHER / EMPLOYER / ADMIN / HR)
  // ==========================================
  if (user) {
    const isTeacher = user.role === 'TEACHER';
    const isEmployer = user.role === 'EMPLOYER';
    const isAdmin = user.role === 'ADMIN' || user.role === 'HR';

    // Super Admin and HR have dedicated, full-screen governance layout
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

        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-3">
            
            {/* Left: Brand Logo & Role Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to={isTeacher ? "/teacher-dashboard" : "/employer-dashboard"} 
                className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group shrink-0"
              >
                <img
                  src="/logo.jpeg"
                  alt="SikshaHub Logo"
                  className="w-10 h-10 rounded-full object-cover shadow-2xs border border-amber-300/60 bg-white shrink-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-200"
                />
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif leading-none">
                    Siksha<span className="text-sky-600">Hub</span><span className="text-sky-500 font-sans">.Ai</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 hidden sm:block">
                    {isTeacher && 'Job Seeker Portal'}
                    {isEmployer && 'Recruiter & School Portal'}
                  </span>
                </div>
              </Link>

              {/* Role Badge Indicator */}
              <div className="hidden md:flex items-center">
                {isTeacher && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Job Seeker</span>
                  </span>
                )}
                {isEmployer && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Job Poster (Recruiter)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Center: Role-Specific Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* TEACHER (Job Seeker) Links */}
              {isTeacher && (
                <>
                  <Link
                    to="/teacher-dashboard"
                    className={`cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap ${
                      location.pathname === '/teacher-dashboard'
                        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/jobs"
                    className={`cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap ${
                      location.pathname === '/jobs'
                        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    <span>Browse Vacancies</span>
                  </Link>

                  <Link
                    to="/teacher-dashboard"
                    className="cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Applications</span>
                  </Link>
                </>
              )}

              {/* EMPLOYER (Job Poster) Links */}
              {isEmployer && (
                <>
                  <Link
                    to="/employer-dashboard"
                    className={`cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap ${
                      location.pathname === '/employer-dashboard'
                        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-sky-600" />
                    <span>Recruiter Dashboard</span>
                  </Link>

                  <Link
                    to="/employer-dashboard"
                    className="cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Job Openings</span>
                  </Link>

                  <Link
                    to="/employer-dashboard"
                    className="cursor-pointer h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Applicants</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Right: Actions & User Dropdown */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Employer CTA */}
              {isEmployer && (
                <Link
                  to="/employer-dashboard"
                  className="cursor-pointer h-10 hidden sm:inline-flex items-center gap-1.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Vacancy</span>
                </Link>
              )}

              {/* Teacher CTA */}
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="cursor-pointer h-10 hidden sm:inline-flex items-center gap-1.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Browse Vacancies</span>
                </button>
              )}

              {/* User Dropdown Pill */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="cursor-pointer h-10 flex items-center gap-2 px-2 sm:px-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${
                    isTeacher ? 'bg-purple-600' : 'bg-sky-600'
                  }`}>
                    {getUserInitials()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                        {user.fullName}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180 text-sky-600' : ''}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[110px]">
                      {isTeacher ? 'Job Seeker' : (institution?.name || 'Recruiter')}
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
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
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
                            className="cursor-pointer flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:pl-5 transition-all duration-150"
                          >
                            <Briefcase className="w-4 h-4 text-sky-600" />
                            <span>Job Seeker Dashboard</span>
                          </Link>
                          <Link
                            to="/jobs"
                            onClick={() => setShowUserDropdown(false)}
                            className="cursor-pointer flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:pl-5 transition-all duration-150"
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
                            className="cursor-pointer flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:pl-5 transition-all duration-150"
                          >
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>Recruiter Dashboard</span>
                          </Link>
                          <Link
                            to="/employer-dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="cursor-pointer flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:pl-5 transition-all duration-150"
                          >
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Manage Applicants</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 active:scale-95"
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
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="cursor-pointer lg:hidden h-10 w-10 inline-flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-150 shadow-2xs active:scale-95 shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer for Logged In User */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 sm:px-6 pt-3 pb-6 space-y-3 shadow-xl">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
                <span className="text-[10px] font-black text-sky-600 uppercase mt-0.5 block">{user.role} ACCOUNT</span>
              </div>
              <button
                type="button"
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
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Vacancy</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  // ==========================================
  // SCENARIO B: UNCOMMITTED / GUEST VISITOR NAVBAR
  // Displays promotional banner, city dropdown, nav links, and Sign In/Up
  // ==========================================
  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* 1. Multi-Gradient Accent Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-blue-500 via-cyan-400 to-sky-600" />

      {/* 2. Top Announcement Strip */}
      <div className="bg-gradient-to-r from-sky-50 via-sky-100/60 to-blue-50/80 text-slate-700 border-b border-sky-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs">
          
          {/* Left Ticker / Announcement */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-2xs shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI RECRUITMENT</span>
            </span>
            <span className="text-[11px] sm:text-xs text-slate-600 truncate">
              <strong className="text-slate-800 font-semibold">• 5,500+ Institutes</strong>
              <strong className="text-slate-800 font-semibold hidden xs:inline"> Hiring</strong> 
              <span className="text-sky-600 font-bold ml-1.5 hidden sm:inline">• Zero Fees</span> 
              <span className="hidden md:inline text-slate-500 ml-1.5">• Direct School & Coaching Connect</span>
            </span>
          </div>

          {/* Right Direct Helpline */}
          <div className="flex items-center gap-2 shrink-0 text-xs pl-2">
            <a
              href="tel:9783143866"
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-700 hover:text-sky-600 hover:bg-sky-100/50 transition-all duration-200 text-[11px] sm:text-xs font-medium whitespace-nowrap hover:scale-105 active:scale-95"
              title="Call SikshaHub Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 hidden sm:inline">Helpline:</span>
              <strong className="text-sky-700 font-bold tracking-wide">9783143866</strong>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
            
            {/* Left Column: Brand Logo & Location */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
              <Link to="/" className="cursor-pointer flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <img
                  src="/logo.jpeg"
                  alt="SikshaHub Logo"
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-2xs border border-amber-300/70 bg-white shrink-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-200"
                />
                <div className="flex flex-col">
                  <span className="text-lg sm:text-[1.35rem] 2xl:text-2xl font-black tracking-tight text-slate-900 font-serif leading-none whitespace-nowrap">
                    Siksha<span className="text-sky-600">Hub</span><span className="text-sky-500 font-sans">.Ai</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 hidden sm:block whitespace-nowrap">
                    AI-Powered Teacher Recruitment
                  </span>
                </div>
              </Link>

              {/* Vertical Divider for Location Selector */}
              <div className="h-6 w-px bg-slate-200 hidden xl:block shrink-0" />

              {/* City Selector Pill with Dropdown (Visible on xl screens to maintain clean breathing room) */}
              <div className="relative hidden xl:block shrink-0" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="cursor-pointer h-9.5 2xl:h-10 inline-flex items-center gap-1.5 px-2.5 2xl:px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/80 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500"
                  title="Filter vacancies by City"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate max-w-[90px] 2xl:max-w-[105px]">{selectedCity}</span>
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
                            type="button"
                            key={c.name}
                            onClick={() => handleCitySelect(c.name)}
                            className={`cursor-pointer w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-all duration-150 ${
                              isSelected 
                                ? 'bg-sky-50 text-sky-700 font-bold' 
                                : 'text-slate-700 hover:bg-sky-50/70 hover:text-sky-900 hover:pl-4.5'
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

            {/* Center Column: Navigation Links (Uniform h-9.5/h-10 with whitespace-nowrap & shrink-0) */}
            <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 shrink-0">
              <Link
                to="/jobs"
                className={`cursor-pointer h-9.5 2xl:h-10 inline-flex items-center gap-1.5 px-3.5 2xl:px-4 rounded-full text-xs 2xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0 ${
                  location.pathname === '/jobs' && !location.search
                    ? 'text-sky-700 bg-sky-50 font-bold shadow-2xs border border-sky-300'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                }`}
              >
                <Briefcase className="w-4 h-4 text-sky-600 transition-colors" />
                <span>Find Jobs</span>
              </Link>

              <Link
                to="/jobs?teachingLevel=COACHING_JEE"
                className={`cursor-pointer h-9.5 2xl:h-10 inline-flex items-center gap-1.5 px-2.5 2xl:px-3 rounded-xl text-xs 2xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0 ${
                  location.search.includes('COACHING_JEE')
                    ? 'text-sky-700 bg-sky-50 font-bold shadow-2xs border border-sky-100'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50/60'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>IIT & NEET</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 leading-none">
                  HOT
                </span>
              </Link>

              <Link
                to="/jobs?teachingLevel=PGT"
                className={`cursor-pointer h-9.5 2xl:h-10 inline-flex items-center gap-1.5 px-2.5 2xl:px-3 rounded-xl text-xs 2xl:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0 ${
                  location.search.includes('PGT')
                    ? 'text-sky-700 bg-sky-50 font-bold shadow-2xs border border-sky-100'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                <span>School Teachers</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 leading-none">
                  CBSE
                </span>
              </Link>
            </nav>

            {/* Right Column: Standardized Action Buttons (Uniform h-9 on mobile, h-9.5/h-10 on sm+) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* + Post a Job CTA (Visible on sm: and up) */}
              <Link
                to="/login?role=EMPLOYER"
                className="cursor-pointer h-9.5 2xl:h-10 hidden sm:inline-flex items-center gap-1.5 px-3.5 2xl:px-4 rounded-full font-bold text-xs 2xl:text-sm text-sky-600 hover:text-sky-700 bg-white hover:bg-sky-50/80 border border-sky-400 hover:border-sky-500 transition-all duration-200 shadow-2xs hover:shadow-md hover:shadow-sky-100 hover:-translate-y-0.5 group active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Plus className="w-4 h-4 text-sky-500 group-hover:rotate-90 transition-transform duration-200" />
                <span>Post a Job</span>
              </Link>

              {/* HR Login CTA (Visible on xl screens; also in mobile menu & sign-in page) */}
              <Link
                to="/hr-login"
                className="cursor-pointer h-9.5 2xl:h-10 hidden xl:inline-flex items-center gap-1.5 px-3 2xl:px-3.5 rounded-full font-bold text-xs text-amber-700 hover:text-amber-800 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300 hover:border-amber-400 transition-all duration-200 shadow-2xs hover:shadow-md hover:shadow-amber-100 hover:-translate-y-0.5 active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-500"
                title="HR Recruiter Portal - Screening & Shortlisting"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>HR Login</span>
              </Link>

              {/* Sign In (Always visible, compact on small mobile) */}
              <Link
                to="/login"
                className="cursor-pointer h-9 sm:h-9.5 2xl:h-10 inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs 2xl:text-sm text-slate-700 hover:text-sky-700 hover:bg-sky-50/80 border border-transparent hover:border-sky-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <UserCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Sign In</span>
              </Link>

              {/* Sign Up (Visible on sm: and up; in mobile drawer for small mobile) */}
              <Link
                to="/signup"
                className="cursor-pointer h-9.5 2xl:h-10 hidden sm:inline-flex items-center justify-center px-4.5 2xl:px-5 rounded-full font-bold text-xs 2xl:text-sm text-white bg-gradient-to-r from-orange-500 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-xs hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>Sign Up</span>
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="cursor-pointer lg:hidden h-9 w-9 sm:h-9.5 sm:w-9.5 inline-flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all duration-200 shadow-2xs active:scale-95 shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 4. Mobile Navigation Drawer for Guests */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-100 bg-white/98 backdrop-blur-2xl px-4 sm:px-6 pt-3 pb-8 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          
          {/* Brand Header Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white border border-sky-700/50 shadow-md">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="SikshaHub" className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-300 bg-white shrink-0" />
              <div>
                <span className="font-serif font-black text-sm tracking-wide">
                  Siksha<span className="text-cyan-300">Hub</span>.ai
                </span>
                <p className="text-[10px] text-sky-200">AI Teacher Recruitment Network</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/15">
              Portal
            </span>
          </div>

          {/* Quick City Selector in Mobile Drawer */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Selected City: <strong className="text-sky-700">{selectedCity}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileCityDropdown(!showMobileCityDropdown)}
                className="cursor-pointer text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              >
                {showMobileCityDropdown ? 'Close' : 'Change City'}
              </button>
            </div>

            {showMobileCityDropdown && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">
                {CITIES.map(c => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => handleCitySelect(c.name)}
                    className={`cursor-pointer text-left p-2 rounded-xl text-[11px] font-medium transition-all duration-150 active:scale-95 ${
                      selectedCity === c.name
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-100 hover:border-sky-200'
                    }`}
                  >
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className={`text-[9px] ${selectedCity === c.name ? 'text-sky-100' : 'text-slate-400'}`}>{c.count}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Buttons in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-150 active:scale-95"
            >
              <UserCircle className="w-4 h-4 text-slate-500" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xs hover:shadow-md transition-all duration-150 active:scale-95"
            >
              <span>Sign Up Free</span>
            </Link>
          </div>

          {/* Employer CTA in Mobile Drawer */}
          <Link
            to="/login?role=EMPLOYER"
            onClick={() => setMobileMenuOpen(false)}
            className="cursor-pointer w-full flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-900 font-bold text-xs shadow-2xs hover:bg-sky-100 transition-all duration-150 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Post a Teaching Vacancy (School / Coaching)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </Link>

          {/* HR Recruiter Portal Link in Mobile Drawer */}
          <Link
            to="/hr-login"
            onClick={() => setMobileMenuOpen(false)}
            className="cursor-pointer w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs shadow-2xs hover:bg-amber-100 transition-all duration-150 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>HR Recruiter Login</span>
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">Admin Credentials →</span>
          </Link>

          {/* Navigation Links in Mobile Drawer */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Browse Opportunities</p>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-800 font-semibold text-xs transition-all duration-150 active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>All Teaching Vacancies</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/jobs?teachingLevel=COACHING_JEE"
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-800 font-semibold text-xs transition-all duration-150 active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>IIT-JEE & NEET Coaching Roles</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 leading-none">
                HOT
              </span>
            </Link>

            <Link
              to="/jobs?teachingLevel=PGT"
              onClick={() => setMobileMenuOpen(false)}
              className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-800 font-semibold text-xs transition-all duration-150 active:scale-98"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>School Teachers (CBSE, ICSE)</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 leading-none">
                CBSE
              </span>
            </Link>
          </div>

          {/* Direct Helpline in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
              <span>Direct Support Helpline:</span>
            </div>
            <a href="tel:9783143866" className="cursor-pointer font-bold text-sky-600 hover:underline">
              9783143866
            </a>
          </div>

        </div>
      )}
    </header>
  );
};
