import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Award,
  ShieldCheck,
  Zap,
  Smartphone,
  Star,
  CheckCircle,
  School,
  Flame,
  AlertCircle,
  Eye
} from 'lucide-react';
import { JobVacancy } from '../types';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { JobDetailModal } from '../components/JobDetailModal';
import { AuthRequiredModal } from '../components/AuthRequiredModal';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [selectedCityTab, setSelectedCityTab] = useState('All');
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobVacancy | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobVacancy | null>(null);
  const [authPromptJob, setAuthPromptJob] = useState<JobVacancy | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redirect authenticated users immediately to their role dashboard
  useEffect(() => {
    const storedToken = token || localStorage.getItem('sikchakhub_token') || localStorage.getItem('sikcha_token') || localStorage.getItem('siksha_token');
    if (user && storedToken) {
      const isUnverified =
        user.role !== 'ADMIN' &&
        user.role !== 'HR' &&
        (user.isVerified === false || (user.verificationStatus && user.verificationStatus !== 'FULLY_VERIFIED'));

      if (isUnverified) {
        navigate('/verify-otp', { replace: true });
        return;
      }

      if (user.role === 'ADMIN' || user.role === 'HR') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'EMPLOYER') {
        navigate('/employer-dashboard', { replace: true });
      } else if (user.role === 'TEACHER') {
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [user, token, navigate]);

  // Authentication check before applying
  const handleApplyClick = (job: JobVacancy) => {
    if (!token || !user || user.role !== 'TEACHER') {
      setAuthPromptJob(job);
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedJobForApply(job);
  };

  // Fetch logged-in educator's existing applications
  const { data: myAppsData } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/applications/my-applications'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token && user?.role === 'TEACHER',
  });

  const appliedJobIds = new Set((myAppsData?.applications || []).map((a: any) => a.jobId));

  // Fetch featured jobs from API
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/jobs?limit=6'));
      if (!res.ok) throw new Error('Failed to fetch jobs from server');
      return res.json();
    },
  });

  const featuredJobs: JobVacancy[] = jobsData?.jobs || [];
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword);
    if (city) params.append('city', city);
    navigate(`/jobs?${params.toString()}`);
  };

  const CATEGORIES = [
    { 
      title: 'IIT-JEE Faculty Jobs', 
      count: '1,450+ Openings', 
      param: 'COACHING_JEE', 
      icon: Flame, 
      bg: 'from-amber-500 to-orange-600',
      tag: 'High CTC'
    },
    { 
      title: 'NEET Medical Faculty', 
      count: '980+ Openings', 
      param: 'COACHING_NEET', 
      icon: Award, 
      bg: 'from-emerald-500 to-teal-600',
      tag: 'Urgent'
    },
    { 
      title: 'School Teachers (PRT/TGT/PGT)', 
      count: '3,400+ Openings', 
      param: 'PGT', 
      icon: GraduationCap, 
      bg: 'from-indigo-600 to-blue-700',
      tag: 'CBSE & ICSE'
    },
    { 
      title: 'College & Universities', 
      count: '640+ Openings', 
      param: 'COLLEGE_PROFESSOR', 
      icon: Building2, 
      bg: 'from-purple-600 to-pink-600',
      tag: 'Professors'
    },
    { 
      title: 'EdTech & Online Faculty', 
      count: '420+ Openings', 
      param: 'OTHER', 
      icon: Sparkles, 
      bg: 'from-cyan-500 to-blue-600',
      tag: 'Remote / Hybrid'
    },
    { 
      title: 'School Principals & HODs', 
      count: '210+ Openings', 
      param: 'HOD_PRINCIPAL', 
      icon: School, 
      bg: 'from-rose-500 to-red-600',
      tag: 'Leadership'
    },
  ];

  const TOP_CITIES = [
    'All',
    'Kota',
    'Delhi NCR',
    'Jaipur',
    'Bengaluru',
    'Pune',
    'Hyderabad',
    'Mumbai',
    'Lucknow'
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Identical to reference screenshot)                       */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f9ff]/60 via-white to-[#f0f9ff]/40 pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-sky-100/80">
        
        {/* Soft Fluid Swoosh Wave (Left Side) */}
        <svg 
          className="absolute -top-10 -left-10 w-[360px] sm:w-[500px] lg:w-[620px] h-[780px] pointer-events-none z-0 opacity-75" 
          viewBox="0 0 600 800" 
          fill="none"
        >
          <path 
            d="M0,0 C200,100 380,220 300,420 C220,620 90,680 0,780 L0,0 Z" 
            fill="url(#heroLeftWave)" 
          />
          <path 
            d="M0,60 C160,160 300,280 220,480 C140,680 50,720 0,780 L0,60 Z" 
            fill="#e0f2fe" 
            fillOpacity="0.4" 
          />
          <defs>
            <linearGradient id="heroLeftWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Soft Fluid Swoosh Wave (Right Side) */}
        <svg 
          className="absolute -top-10 -right-10 w-[360px] sm:w-[500px] lg:w-[620px] h-[780px] pointer-events-none z-0 opacity-75" 
          viewBox="0 0 600 800" 
          fill="none"
        >
          <path 
            d="M600,0 C400,100 220,220 300,420 C380,620 510,680 600,780 L600,0 Z" 
            fill="url(#heroRightWave)" 
          />
          <path 
            d="M600,60 C440,160 300,280 380,480 C460,680 550,720 600,780 L600,60 Z" 
            fill="#e0f2fe" 
            fillOpacity="0.4" 
          />
          <defs>
            <linearGradient id="heroRightWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dot Grids in exact positions from design */}
        {/* Top-Left Dot Matrix */}
        <div className="absolute top-20 left-6 sm:left-14 grid grid-cols-4 gap-2.5 opacity-60 pointer-events-none z-0 hidden sm:grid">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-300" />
          ))}
        </div>

        {/* Mid-Left Dot Matrix */}
        <div className="absolute top-72 left-8 sm:left-20 grid grid-cols-4 gap-2.5 opacity-40 pointer-events-none z-0 hidden sm:grid">
          {[...Array(16)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-300" />
          ))}
        </div>

        {/* Bottom-Right Dot Matrix */}
        <div className="absolute top-84 right-8 sm:right-20 grid grid-cols-6 gap-2.5 opacity-55 pointer-events-none z-0 hidden sm:grid">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-300" />
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5 sm:space-y-6">
          
          {/* Trust Pill / AI Badge with Logo */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-sky-200/90 text-[11px] sm:text-xs text-sky-800 font-bold shadow-xs max-w-full hover:border-sky-300 hover:shadow-sm transition-all duration-300 cursor-default animate-hero-slide-up">
            <img src="/logo.jpeg" alt="SikchaKhub" className="w-5 h-5 rounded-full object-cover border border-amber-300/80 shrink-0" />
            <span className="truncate tracking-tight font-medium">AI MATCH: India's Premier Teacher & Faculty Recruitment Engine</span>
          </div>

          {/* Editorial Serif Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-black tracking-tight text-slate-900 font-serif max-w-4xl mx-auto leading-[1.12] animate-hero-slide-up">
            Best Job Portal in India With<br />
            <span className="text-[#0284c7]">
              AI-Powered Hiring Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[15px] text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal animate-hero-slide-up">
            Automated teacher recruitment portal connecting over <strong>5,500+ top educational institutions</strong> and <strong>1.8M+ verified educators</strong> across India. Instant shortlists in ~72h, syllabus matching, and direct interview scheduling.
          </p>

          {/* ========================================================================= */}
          {/* Hero Search Box (Floating Pill Container in Crisp White & Light Blue)      */}
          {/* ========================================================================= */}
          <div className="max-w-3xl mx-auto pt-2 animate-hero-slide-up">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-full shadow-xl shadow-sky-100/90 border border-sky-100 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-200/40 transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 group/search"
            >
              <div className="w-full sm:flex-1 flex items-center gap-3 px-4 py-2 min-w-0">
                <Search className="w-5 h-5 text-sky-500 shrink-0 transition-transform duration-200 group-focus-within/search:scale-110" />
                <input
                  type="text"
                  placeholder="Subject, role (e.g. JEE Physics, PGT M"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <div className="hidden sm:block h-7 w-px bg-slate-200 shrink-0" />

              <div className="w-full sm:w-64 flex items-center gap-3 px-4 py-2 min-w-0">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0 transition-transform duration-200 group-focus-within/search:scale-110" />
                <input
                  type="text"
                  placeholder="City (Kota, Delhi NCR, Jaipur.."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer group/btn"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </form>

            {/* Popular Quick Searches matching screenshot */}
            <div className="flex flex-col items-center justify-center gap-2 pt-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  TRENDING SEARCHES:
                </span>
                {['JEE Advanced Physics', 'NEET Zoology', 'PGT Mathematics', 'CBSE English'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                    className="cursor-pointer px-4 py-1.5 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 text-[11px] font-medium transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                {['Kota Mega Batch', 'School Principal'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                    className="cursor-pointer px-4 py-1.5 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 text-[11px] font-medium transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Trust Counter Strip (4 Distinct Metric Cards with Corner Glow Accents)    */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-10 text-left max-w-6xl mx-auto w-full">
            {/* Card 1: 5,500+ Hiring Institutions */}
            <div className="relative bg-white rounded-3xl p-5 border border-sky-100 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-sky-200/60 via-cyan-100/40 to-transparent rounded-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-sky-100/90 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/60 shadow-2xs">
                <School className="w-7 h-7" />
              </div>
              <div className="text-left relative z-10">
                <p className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight leading-none">
                  5,500+
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  Hiring Institutions
                </p>
              </div>
            </div>

            {/* Card 2: 1.8M+ Verified Educators */}
            <div className="relative bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-purple-200/60 via-violet-100/40 to-transparent rounded-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-purple-100/90 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-left relative z-10">
                <p className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight leading-none">
                  1.8M+
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  Verified Educators
                </p>
              </div>
            </div>

            {/* Card 3: ~72 Hours Average Shortlist Time */}
            <div className="relative bg-white rounded-3xl p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-emerald-200/60 via-teal-100/40 to-transparent rounded-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <Zap className="w-7 h-7 fill-emerald-500 text-emerald-500" />
              </div>
              <div className="text-left relative z-10">
                <p className="text-2xl sm:text-[1.75rem] font-black text-emerald-600 tracking-tight leading-none">
                  ~72 Hours
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  Average Shortlist Time
                </p>
              </div>
            </div>

            {/* Card 4: ₹6-35 LPA Verified Salary Bands */}
            <div className="relative bg-white rounded-3xl p-5 border border-amber-100/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-4 overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-amber-200/60 via-orange-100/40 to-transparent rounded-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-14 h-14 rounded-2xl bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs font-bold text-2xl font-serif">
                <span>₹</span>
              </div>
              <div className="text-left relative z-10">
                <p className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight leading-none">
                  ₹6-35 LPA
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  Verified Salary Bands
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE RECRUITMENT CATEGORIES                                            */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-sky-50/40 to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                Explore Segments
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-serif tracking-tight">
                Browse Faculty & Teaching Jobs By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Direct access to high-volume recruitment streams across schools, premier coaching, and universities.
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group self-start sm:self-auto cursor-pointer transition-colors duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <span>View All 1,800+ Vacancies</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/jobs?teachingLevel=${cat.param}`)}
                  className="bg-white rounded-2xl p-6 border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-xs focus-visible:ring-2 focus-visible:ring-sky-500"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/jobs?teachingLevel=${cat.param}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.bg} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 group-hover:bg-sky-100/80 group-hover:border-sky-200 transition-colors">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors duration-200">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{cat.count}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-sky-600 transition-colors duration-200">
                    <span>Explore openings</span>
                    <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED LIVE VACANCIES                                                */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                Verified Vacancies
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-serif tracking-tight">
                Featured Teaching & Faculty Openings
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Hand-picked high-priority recruitment drives with immediate candidate interview slots.
              </p>
            </div>

            {/* City Quick Pills */}
            <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
              {TOP_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCityTab(c);
                    if (c === 'All') {
                      navigate('/jobs');
                    } else {
                      navigate(`/jobs?city=${encodeURIComponent(c)}`);
                    }
                  }}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    selectedCityTab === c
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                      : 'bg-sky-50/80 text-slate-600 hover:text-sky-700 hover:bg-sky-100 hover:border-sky-300 hover:shadow-2xs border border-sky-200/70'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid */}
          {jobsLoading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 space-y-2 border border-sky-100 shadow-xs">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium">Scanning verified teaching vacancies...</p>
            </div>
          ) : jobsError ? (
            <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-red-200 bg-red-50/50 shadow-xs">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-xs font-bold text-red-800">Unable to load job vacancies at this time.</p>
              <p className="text-[11px] text-red-600">Please check your backend connection or refresh the page.</p>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-sky-100 shadow-xs">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No vacancies posted yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Educational institutions are currently finalizing their recruitment drives. Check back soon or register as an educator.
              </p>
              <Link
                to="/jobs"
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl hover:shadow-md hover:shadow-sky-500/25 transition-all duration-200 active:scale-95"
              >
                <span>Browse Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/70 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
                  tabIndex={0}
                  onClick={() => setSelectedJobForDetails(job)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedJobForDetails(job);
                    }
                  }}
                >
                  <div className="space-y-4">
                    {/* Institution info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/logo.jpeg"
                          alt="SikchaKhub"
                          className="w-12 h-12 rounded-xl object-cover border border-sky-100 bg-white group-hover:scale-105 group-hover:border-sky-200 transition-all duration-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                            <span>SikchaKhub</span>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-500" />
                            <span>{job.city}, {job.state}</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0 group-hover:bg-sky-100 transition-colors">
                        {job.teachingLevel}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
                      {job.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50/80 text-sky-800 border border-sky-100 font-medium hover:bg-sky-100 transition-colors">
                        Subject: {job.subject}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50/80 text-sky-800 border border-sky-100 font-medium hover:bg-sky-100 transition-colors">
                        {job.board}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50/80 text-sky-800 border border-sky-100 font-medium hover:bg-sky-100 transition-colors">
                        {job.minExperienceYears}+ Yrs Exp
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Card Footer: Offered CTC + Details & Apply Buttons */}
                  <div className="pt-4 mt-5 border-t border-sky-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Offered CTC</span>
                      <span className="text-sm font-black text-emerald-600 whitespace-nowrap">
                        ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobForDetails(job);
                        }}
                        className="cursor-pointer px-3 py-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                        <span>Details</span>
                      </button>

                      {appliedJobIds.has(job.id) ? (
                        <span className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-default shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied ✓</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(job);
                          }}
                          className="cursor-pointer px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:shadow-sky-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1"
                        >
                          <span>Quick Apply</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/jobs"
              className="cursor-pointer inline-flex items-center gap-2 px-8 py-3.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs sm:text-sm rounded-2xl border border-sky-200 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 group"
            >
              <span>Explore All Verified Vacancies</span>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE SIKCHAKHUB (Value Propositions)                              */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-sky-50/30 to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              Platform Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
              Why 1.8M+ Teachers & 5,500+ Schools Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Unlike generic job portals, SikchaKhub is engineered specifically for the Indian education ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 transition-all duration-300 space-y-3 shadow-2xs cursor-default group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">AI Syllabus Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithm matches candidates based on specific subjects, competitive board levels, and teaching methodologies rather than basic keywords.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 transition-all duration-300 space-y-3 shadow-2xs cursor-default group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Direct Principal Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No third-party consultancy agents. Apply directly to school hiring teams and coaching directors with interview scheduling in ~72 hours.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 transition-all duration-300 space-y-3 shadow-2xs cursor-default group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">100% Verified Institutions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every school, college, and coaching center undergoes mandatory verification to guarantee safe hiring and clear salary benchmarks.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/80 hover:-translate-y-1.5 transition-all duration-300 space-y-3 shadow-2xs cursor-default group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Confidential Job Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Currently employed faculty can switch on stealth mode to explore higher CTC offers without alerting current school management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TOP EDUCATIONAL ORGANIZATIONS                                          */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              Trusted Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
              Top Educational Institutions Hiring Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              From Kota coaching giants to premier CBSE & International Baccalaureate schools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Apex IIT & Medical Academy', location: 'Kota & National', type: 'Premier Coaching Institute', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Delhi Heritage International', location: 'Dwarka, New Delhi', type: 'CBSE Day-Boarding School', logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Cambridge Global Academy', location: 'Bengaluru, Karnataka', type: 'Cambridge IGCSE & A-Levels', logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Horizon Institute of Tech', location: 'Pune, Maharashtra', type: 'NAAC A+ Engineering University', logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=160&h=160&q=80' },
            ].map((org, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/jobs')}
                className="cursor-pointer bg-white p-4.5 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/80 hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 flex items-center gap-3.5 group focus-visible:ring-2 focus-visible:ring-sky-500"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/jobs');
                }}
              >
                <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover border border-sky-100 group-hover:scale-105 group-hover:border-sky-200 transition-all duration-200 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">{org.name}</h4>
                  <p className="text-[10px] text-sky-600 font-semibold truncate">{org.type}</p>
                  <p className="text-[10px] text-slate-500 truncate">{org.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. RECRUITER POST JOB CALLOUT BANNER                                      */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-sky-600/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Subtle light accent circles in background */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/20 shadow-2xs">
                For Schools, Colleges & Coaching Centers
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
                Are You Looking to Hire Top Faculty?
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                Post your vacancy in under 2 minutes. Tap into 1.8M+ verified teachers and receive pre-filtered candidate rankings for your specific syllabus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
              <Link
                to="/employer-dashboard"
                className="cursor-pointer px-8 py-4 bg-white text-sky-900 hover:bg-sky-50 font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-sky-950/25 hover:-translate-y-1 active:scale-95 transition-all duration-200 text-center inline-flex items-center justify-center gap-2 group"
              >
                <span>Post A Free Job!</span>
                <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MOBILE APP DOWNLOAD SHOWCASE                                           */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white to-sky-50/60 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 shadow-2xs">
              <Smartphone className="w-4 h-4" />
              <span>SikchaKhub Mobile App (Android & iOS)</span>
            </span>

            <h3 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight leading-tight">
              Get Instant Job Alerts & Interview Calls on Mobile
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never miss an urgent recruitment drive. Track application status, chat with school HR, and attend virtual demo classes directly through our React Native Expo mobile app.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 hover:scale-110 transition-transform cursor-pointer" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.8 / 5 Rating (150K+ Educator Reviews)</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <div className="cursor-pointer p-3.5 bg-white border border-sky-200 hover:border-sky-300 rounded-2xl flex items-center gap-3.5 shadow-xs hover:shadow-md hover:shadow-sky-100 hover:-translate-y-0.5 transition-all duration-200 group">
                <img src="/logo.jpeg" alt="SikchaKhub Logo" className="w-10 h-10 rounded-xl object-cover border border-sky-200 bg-white group-hover:scale-105 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 font-medium">Scan QR to install</p>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Free on Google Play & iOS</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="cursor-pointer text-xs font-bold px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 hover:text-sky-700 border border-sky-200 hover:border-sky-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                  Google Play
                </span>
                <span className="cursor-pointer text-xs font-bold px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 hover:text-sky-700 border border-sky-200 hover:border-sky-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                  App Store
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Phone Mockup UI */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <div className="bg-white rounded-[2.5rem] p-4 border-4 border-sky-200 shadow-xl shadow-sky-100 hover:shadow-2xl hover:shadow-sky-200/60 transition-all duration-300 space-y-3">
              {/* Phone top notch */}
              <div className="w-32 h-4 bg-sky-100 rounded-full mx-auto" />

              {/* In-app mockup screen */}
              <div className="bg-sky-50/60 rounded-2xl p-4 space-y-3 text-xs border border-sky-100">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
                  <div className="flex items-center gap-2">
                    <img src="/logo.jpeg" alt="SikchaKhub Mobile" className="w-6 h-6 rounded-md object-cover border border-sky-200 bg-white" />
                    <span className="font-bold text-slate-900">SikchaKhub Mobile</span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                    LIVE ALERTS
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1 hover:border-sky-300 hover:shadow-xs transition-all duration-200 cursor-pointer">
                  <span className="text-[10px] text-sky-600 font-bold">Interview Invitation</span>
                  <p className="text-xs font-bold text-slate-900">Apex IIT Academy • Kota</p>
                  <p className="text-[11px] text-slate-500">Senior JEE Physics Faculty (₹24 LPA)</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1 hover:border-sky-300 hover:shadow-xs transition-all duration-200 cursor-pointer">
                  <span className="text-[10px] text-emerald-600 font-bold">Resume Shortlisted</span>
                  <p className="text-xs font-bold text-slate-900">Delhi Heritage International</p>
                  <p className="text-[11px] text-slate-500">PGT Mathematics (CBSE Board)</p>
                </div>

                <button 
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="cursor-pointer w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  Open In Mobile App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vacancy Full Details Popup Card Modal */}
      <JobDetailModal
        job={selectedJobForDetails}
        isOpen={Boolean(selectedJobForDetails)}
        onClose={() => setSelectedJobForDetails(null)}
        onApply={(job) => {
          setSelectedJobForDetails(null);
          handleApplyClick(job);
        }}
        isApplied={Boolean(selectedJobForDetails && appliedJobIds.has(selectedJobForDetails.id))}
      />

      {/* Authentication Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptJob(null);
        }}
        jobTitle={authPromptJob?.title}
        institutionName="SikchaKhub"
      />

      {/* Dynamic Application Modal (Educators only) */}
      {selectedJobForApply && (
        <ApplyJobModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onAppliedSuccess={() => {
            setSelectedJobForApply(null);
          }}
        />
      )}
    </div>
  );
};
