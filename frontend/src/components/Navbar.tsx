import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  MapPin, 
  Search, 
  FileCheck2, 
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
  Smartphone,
  PhoneCall
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, institution, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState('All India');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const CITIES = [
    'All India', 
    'Delhi NCR', 
    'Kota (Rajasthan)', 
    'Jaipur', 
    'Bengaluru', 
    'Pune', 
    'Hyderabad', 
    'Mumbai', 
    'Lucknow', 
    'Patna', 
    'Indore'
  ];

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    if (city === 'All India') {
      navigate('/jobs');
    } else {
      const cleanCity = city.split(' ')[0];
      navigate(`/jobs?city=${encodeURIComponent(cleanCity)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement & Quick Persona Strip */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-tallento-pink to-tallento-orange text-white shadow-xs">
              AI HIRING
            </span>
            <span className="hidden sm:inline text-slate-300">
              India's #1 Automated Teacher Recruitment Portal • 5,500+ Top Institutes • 1.8M+ Jobs
            </span>
            <span className="sm:hidden text-slate-300">India's #1 Teacher Recruitment Portal</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-tallento-orange" />
              <span>Helpline: <strong className="text-white font-medium">9783143666</strong></span>
            </div>

            {/* Quick Demo Switcher */}
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
              <span className="text-[10px] text-slate-400 px-1.5 hidden md:inline">Demo:</span>
              <button
                onClick={() => quickDemoLogin('TEACHER')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  user?.role === 'TEACHER' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => quickDemoLogin('EMPLOYER')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  user?.role === 'EMPLOYER' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Employer
              </button>
              <button
                onClick={() => quickDemoLogin('ADMIN')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  user?.role === 'ADMIN' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-tallento-pink via-tallento-orange to-tallento-purple flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                    Siksha<span className="bg-gradient-to-r from-tallento-pink to-tallento-orange bg-clip-text text-transparent">Hub</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-tallento-pink/10 text-tallento-pink border border-tallento-pink/20">
                    .ai
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  AI-Powered Teacher Recruitment
                </span>
              </div>
            </Link>

            {/* City Selector Pill with Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl border border-slate-200/80 transition shadow-2xs"
              >
                <MapPin className="w-4 h-4 text-tallento-pink shrink-0" />
                <span className="truncate max-w-[110px]">{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCityDropdown && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Hiring Location
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {CITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => handleCitySelect(c)}
                        className={`w-full text-left px-3.5 py-2 text-xs hover:bg-pink-50 hover:text-tallento-pink flex items-center justify-between transition ${
                          selectedCity === c ? 'text-tallento-pink font-bold bg-pink-50/70' : 'text-slate-600'
                        }`}
                      >
                        <span>{c}</span>
                        {selectedCity === c && <span className="w-1.5 h-1.5 rounded-full bg-tallento-pink" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/jobs"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                location.pathname === '/jobs'
                  ? 'text-tallento-pink bg-pink-50 font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Briefcase className="w-4 h-4 text-tallento-pink" />
              <span>Find Jobs</span>
            </Link>

            <Link
              to="/jobs?teachingLevel=COACHING_JEE"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              IIT & NEET Faculty
            </Link>

            <Link
              to="/jobs?teachingLevel=PGT"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              School Teachers
            </Link>

            <Link
              to="/ats-checker"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                location.pathname === '/ats-checker'
                  ? 'text-emerald-700 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>ATS Resume Score</span>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full uppercase">
                Free
              </span>
            </Link>
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {/* Post A Free Job! Button (Tallento Highlight) */}
            <Link
              to="/employer-dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-tallento-pink via-tallento-orange to-tallento-purple hover:opacity-95 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post A Free Job!</span>
            </Link>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition border border-slate-200/80"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-xl object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-pink-50 text-tallento-pink border border-pink-200 uppercase">
                      {user?.role} ACCOUNT
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/teacher-dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <UserCircle className="w-4 h-4 text-tallento-pink" />
                      <span>Candidate Dashboard</span>
                    </Link>

                    <Link
                      to="/employer-dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Building2 className="w-4 h-4 text-tallento-orange" />
                      <span>Recruiter Portal (Post Jobs)</span>
                    </Link>

                    <Link
                      to="/admin-dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldAlert className="w-4 h-4 text-tallento-purple" />
                      <span>Super Admin Console</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase">Selected City:</span>
            <span className="text-xs font-semibold text-tallento-pink">{selectedCity}</span>
          </div>

          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Briefcase className="w-4 h-4 text-tallento-pink" />
            <span>Find Jobs</span>
          </Link>

          <Link
            to="/jobs?teachingLevel=COACHING_JEE"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            IIT & NEET Faculty Jobs
          </Link>

          <Link
            to="/jobs?teachingLevel=PGT"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            School Teacher Jobs (PRT, TGT, PGT)
          </Link>

          <Link
            to="/ats-checker"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50/60"
          >
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>ATS Resume Score</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full">
              FREE
            </span>
          </Link>

          <div className="pt-2">
            <Link
              to="/employer-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-tallento-pink to-tallento-orange shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post A Free Job!</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
