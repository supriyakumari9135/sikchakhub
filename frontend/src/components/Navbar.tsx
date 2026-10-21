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
  PlusCircle,
  PhoneCall,
  Flame,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
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

  return (
    <header className="sticky top-0 z-50">
      {/* 1. Light Blue Multi-Gradient Accent Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-blue-500 via-cyan-400 to-sky-600 animate-pulse-subtle" />

      {/* 2. Top Announcement Strip (White & Light Blue Theme) */}
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
                <div className="relative">
                  <img
                    src="/logo.jpeg"
                    alt="SikshaHub Logo"
                    className="w-11 h-11 rounded-full object-cover shadow-xs border border-amber-300/60 bg-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl sm:text-[1.55rem] font-black tracking-tight text-slate-900 font-serif leading-none">
                      Siksha<span className="text-sky-600">Hub</span><span className="text-sky-500 font-sans">.Ai</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 hidden sm:block">
                    AI-Powered Teacher Recruitment
                  </span>
                </div>
              </Link>

              {/* Light Blue City Selector Pill with Dropdown */}
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
              {/* 1. Find Jobs */}
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

              {/* 2. IIT & NEET Faculty */}
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

              {/* 3. School Teachers */}
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

            {/* Right Action Menu: + Post a Job + User Profile Menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* + Post a Job Action Button */}
              <Link
                to="/employer-dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-sky-600 hover:text-sky-700 bg-white hover:bg-sky-50 border border-sky-500 transition-all shadow-2xs group"
              >
                <span>+ Post a Job</span>
              </Link>

              {/* Profile Menu Badge (Matches screenshot with SK avatar and Sumit Kumar / Employer) */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {user?.fullName ? (
                      user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    ) : 'SK'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                        {user?.fullName || 'Sumit Kumar'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${showUserDropdown ? 'rotate-180 text-sky-600' : ''}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {user?.role === 'TEACHER' ? 'Job Seeker' : user?.role === 'ADMIN' ? 'Admin' : 'Employer'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-sky-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                    <div className="px-4 py-3 border-b border-sky-100 bg-gradient-to-br from-sky-50/60 to-white">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {user?.fullName || 'Sumit Kumar'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.email || 'sumit.kumar@sikchakhub.com'}
                      </p>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wider">
                        {user?.role || 'EMPLOYER'} ACTIVE
                      </span>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/employer-dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="leading-tight font-bold">Recruiter Dashboard (Job Poster)</p>
                          <span className="text-[10px] text-slate-400 font-normal">Manage Vacancies & Applicants</span>
                        </div>
                      </Link>

                      <Link
                        to="/teacher-dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <UserCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="leading-tight font-bold">Job Seeker Dashboard</p>
                          <span className="text-[10px] text-slate-400 font-normal">Applications & Matches</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin-dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="leading-tight font-bold">Admin Console</p>
                          <span className="text-[10px] text-slate-400 font-normal">Governance & Compliance</span>
                        </div>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-2">
                      {user ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            openAuthModal('LOGIN');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50 rounded-xl transition"
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>Login / Sign Up</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button with Colorful Touch */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200/90 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 transition shadow-2xs"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-tallento-pink" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Navigation Drawer (White & Light Blue Theme) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-100 bg-white/98 backdrop-blur-2xl px-5 pt-3 pb-8 space-y-3.5 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Header Branding Card */}
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
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
              LIVE
            </span>
          </div>

          {/* Quick City Filter for Mobile */}
          <div className="bg-sky-50/80 p-3 rounded-2xl border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">Current City:</span>
              <span className="text-xs font-black text-sky-600">{selectedCity}</span>
            </div>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs"
            >
              Change
            </button>
          </div>

          {/* Collapsible Mobile City List */}
          {showCityDropdown && (
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-sky-50/50 rounded-2xl border border-sky-100 max-h-44 overflow-y-auto">
              {CITIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleCitySelect(c.name)}
                  className={`p-2 rounded-xl text-left text-xs font-medium truncate ${
                    selectedCity === c.name 
                      ? 'bg-sky-600 text-white font-bold' 
                      : 'bg-white text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Guest Auth Action or Logged-in Profile */}
          {!user ? (
            <div className="pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('LOGIN');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 shadow-lg shadow-sky-500/25 active:scale-95 transition-transform"
              >
                <UserCircle className="w-5 h-5" />
                <span>Login / Sign Up</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-300" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">{user.fullName}</p>
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">{user.role} ACCOUNT</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Navigation Category Cards */}
          <div className="space-y-2 pt-1">
            <Link
              to="/jobs"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-50/80 to-white hover:to-sky-50 border border-sky-100 text-slate-800 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-2xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Explore Teaching Vacancies</p>
                  <p className="text-[10px] text-slate-500">1.8M+ openings across India</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>

            <Link
              to="/jobs?teachingLevel=COACHING_JEE"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-50/80 to-white hover:to-sky-50 border border-sky-100 text-slate-800 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900">IIT-JEE & NEET Coaching</p>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-600 text-white">HOT</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Kota, Hyderabad, Pune, Delhi NCR</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>

            <Link
              to="/jobs?teachingLevel=PGT"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-white hover:to-blue-50 border border-blue-100 text-slate-800 transition shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">School Teachers (PRT, TGT, PGT)</p>
                  <p className="text-[10px] text-slate-500">CBSE, ICSE, Cambridge, IB Schools</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-500" />
            </Link>

            {/* Recruiter Post A Job for Mobile */}
            <Link
              to="/employer-dashboard"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-sky-600 to-blue-700 shadow-md border border-sky-500"
            >
              <PlusCircle className="w-4 h-4 text-cyan-200" />
              <span>Recruiter Portal: Post A Free Job</span>
            </Link>
          </div>

          {/* Quick Support strip at bottom of mobile drawer */}
          <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Need Help? Call:</span>
            <a href="tel:9783143666" className="font-bold text-sky-600 hover:underline flex items-center gap-1">
              <PhoneCall className="w-3 h-3" />
              <span>+91 9783143666</span>
            </a>
          </div>

        </div>
      )}
    </header>
  );
};
