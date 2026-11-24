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
  ShieldCheck, 
  Zap, 
  School, 
  Play,
  Bookmark,
  Clock,
  Landmark,
  Stethoscope,
  Code2,
  MonitorPlay,
  UserCheck,
  Check,
  Calendar,
  Layers,
  Bot,
  IndianRupee,
  CheckCircle,
  Eye
} from 'lucide-react';
import { JobVacancy } from '../types';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { JobDetailModal } from '../components/JobDetailModal';
import { AuthRequiredModal } from '../components/AuthRequiredModal';
import { ThreeHeroAnimation } from '../components/ThreeHeroAnimation';
import { useAuth } from '../context/AuthContext';
import { formatDescriptionSnippet } from '../utils/jobFormatter';
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
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({});

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

  const toggleBookmark = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
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
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/jobs?limit=6'));
      if (!res.ok) throw new Error('Failed to fetch jobs from server');
      return res.json();
    },
  });

  const rawJobs: JobVacancy[] = jobsData?.jobs || [];

  // Filter jobs by city tab
  const filteredJobs = rawJobs.filter(job => {
    if (selectedCityTab === 'All') return true;
    if (selectedCityTab === 'Delhi NCR') {
      return job.city.toLowerCase().includes('delhi') || job.city.toLowerCase().includes('noida') || job.city.toLowerCase().includes('gurgaon');
    }
    return job.city.toLowerCase().includes(selectedCityTab.toLowerCase());
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (city.trim()) params.set('city', city.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  // 6 Main Recruitment Categories matching uploaded design
  const CATEGORIES = [
    { 
      title: 'IIT-JEE Faculty Jobs', 
      count: '451+ Jobs', 
      param: 'COACHING_JEE', 
      icon: GraduationCap, 
      desc: 'Faculty openings at IITs and IISERs',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
    { 
      title: 'NEET Medical Faculty', 
      count: '237+ Jobs', 
      param: 'COACHING_NEET', 
      icon: Stethoscope, 
      desc: 'Teaching roles at NEET institutes',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    { 
      title: 'School Teachers (PRT/TGT/PGT)', 
      count: '2,105+ Jobs', 
      param: 'PGT', 
      icon: Code2, 
      desc: 'Teaching opportunities in schools',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    { 
      title: 'College & Universities', 
      count: '1,340+ Jobs', 
      param: 'PROFESSOR', 
      icon: Landmark, 
      desc: 'Faculty openings in colleges & universities',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    { 
      title: 'EdTech & Online Faculty', 
      count: '592+ Jobs', 
      param: 'ONLINE_TUTOR', 
      icon: MonitorPlay, 
      desc: 'Online teaching and content roles',
      color: 'from-sky-500 to-cyan-500',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    { 
      title: 'School Principals & HODs', 
      count: '396+ Jobs', 
      param: 'HOD_PRINCIPAL', 
      icon: Users, 
      desc: 'Leadership and academic administration',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
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
    'Mumbai'
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Warm Orange Gradient with Interactive Three.js 3D Scene) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF6EB] to-[#FFF0DD] pt-8 sm:pt-12 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-orange-100/60">
        
        {/* Soft Ambient Fluid Waves (Left & Right Background Glows) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/40 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/3" />
        <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-amber-200/40 via-orange-100/30 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/4" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge: AI + Education x Jobs */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3E8] border border-orange-200 text-orange-600 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>AI + Education × Jobs</span>
              </div>

              {/* Big Editorial Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-black tracking-tight text-slate-900 font-serif leading-[1.12]">
                Best Job Portal in India With<br />
                <span className="relative inline-block text-orange-600 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent mt-1">
                  AI-Powered Hiring Engine
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-500/80" viewBox="0 0 300 12" fill="none">
                    <path d="M2 9C70 2 230 2 298 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Automated teacher recruitment portal connecting over <strong>5,500+ top educational institutions</strong> with <strong>1.8M+ verified educators</strong> across India. Find and get matched with the right teaching jobs, faster and smarter.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="cursor-pointer px-7 sm:px-8 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Teaching Jobs</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('why-choose-sikchakhub');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="cursor-pointer px-6 sm:px-7 py-3.5 bg-white hover:bg-orange-50/60 text-slate-800 font-bold text-xs sm:text-sm rounded-full border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-slate-700 text-slate-700 ml-0.5" />
                  </div>
                  <span>How It Works</span>
                </button>
              </div>

            </div>

            {/* Right 3D Visual Column with Interactive Three.js */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Warm Golden Glow Behind 3D Elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/40 via-orange-400/20 to-yellow-200/40 rounded-full blur-2xl transform scale-90 pointer-events-none" />

              {/* Real Interactive Three.js Canvas */}
              <ThreeHeroAnimation />

              {/* Floating 3D Overlay Badge: AI Match (Top-Left) */}
              <div className="absolute top-6 left-2 sm:-left-4 z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-100 flex items-center gap-2.5 animate-bounce-slow">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">AI Match</p>
                  <p className="text-[9px] text-slate-500">Find the right job for you</p>
                </div>
              </div>

              {/* Floating 3D Overlay Badge: Rising 3D Bar Chart (Top-Right) */}
              <div className="absolute top-8 right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-100 flex items-center gap-2 animate-pulse-slow">
                <div className="flex items-end gap-1 h-6">
                  <span className="w-1.5 h-3 bg-orange-400 rounded-t-sm" />
                  <span className="w-1.5 h-4.5 bg-orange-500 rounded-t-sm" />
                  <span className="w-1.5 h-6 bg-amber-500 rounded-t-sm" />
                </div>
                <div className="text-left pl-1">
                  <p className="text-[10px] font-extrabold text-orange-600">+85% Match</p>
                  <p className="text-[8px] text-slate-400">High Acceptance</p>
                </div>
              </div>

              {/* Floating 3D Overlay Badge: Verified Checklist (Bottom-Right) */}
              <div className="absolute bottom-8 right-0 sm:right-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">100% Verified Schools</span>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* FLOATING SEARCH BAR & QUICK FILTERS                                       */}
          {/* ========================================================================= */}
          <div className="max-w-4xl mx-auto pt-10 sm:pt-14 relative z-20">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-full shadow-xl shadow-orange-500/10 border border-orange-200/80 hover:border-orange-400 transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 group/search"
            >
              <div className="w-full sm:flex-1 flex items-center gap-3 px-4 py-2 min-w-0">
                <Search className="w-5 h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Subject, role (e.g. PGT Maths, TGT Science)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <div className="hidden sm:block h-7 w-px bg-slate-200 shrink-0" />

              <div className="w-full sm:w-64 flex items-center gap-3 px-4 py-2 min-w-0">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  placeholder="City, State or Remote"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Trending Searches Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-1">
                Trending Searches:
              </span>
              {['PGT Teacher', 'TGT Teacher', 'PRT Teacher', 'Principal', 'Coordinator', 'NTT', 'Computer Teacher'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                  className="cursor-pointer px-3.5 py-1.5 rounded-full bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300 text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3D GOLDEN PEDESTAL / STATS SHELF                                          */}
          {/* ========================================================================= */}
          <div className="pt-12 sm:pt-16 max-w-5xl mx-auto">
            {/* 3D Golden Platform Base */}
            <div className="p-1.5 sm:p-2 rounded-[2rem] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 shadow-xl shadow-amber-500/20">
              <div className="bg-white rounded-[1.75rem] p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                
                {/* 1. 5,500+ Institutions */}
                <div className="flex items-center gap-3.5 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shadow-xs shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">5,500+</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Institutions</p>
                  </div>
                </div>

                {/* 2. 1.8M+ Verified Educators */}
                <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-xs shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">1.8M+</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Verified Educators</p>
                  </div>
                </div>

                {/* 3. ~72 Hours Avg. Hiring Time */}
                <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                    <Zap className="w-6 h-6 fill-emerald-500 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 leading-none">~72 Hours</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Avg. Hiring Time</p>
                  </div>
                </div>

                {/* 4. ₹6–35 LPA Teaching Salary Range */}
                <div className="flex items-center gap-3.5 px-2 pt-3 sm:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                    <IndianRupee className="w-6 h-6 font-bold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">₹6–35 LPA</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Teaching Salary Range</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BROWSE FACULTY & TEACHING JOBS BY CATEGORY (Exact match)               */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full border border-orange-200 shadow-2xs">
                EXPLORE OPPORTUNITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-serif tracking-tight">
                Browse <span className="text-orange-600">Faculty & Teaching Jobs</span> By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Direct access to top-volume recruitment streams across schools, colleges, and universities.
              </p>
            </div>
            
            <Link
              to="/jobs"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group self-start sm:self-auto cursor-pointer transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 6 Category Cards in 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/jobs?teachingLevel=${cat.param}`)}
                  className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl ${cat.bgColor} ${cat.textColor} flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {cat.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{cat.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                      {cat.count}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED TEACHING & FACULTY OPENINGS                                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFDF9] to-white border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full border border-orange-200 shadow-2xs">
                VERIFIED VACANCIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-serif tracking-tight">
                Featured <span className="text-orange-600">Teaching & Faculty</span> Openings
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Hand-picked, high-growth opportunities from verified institutions across India.
              </p>
            </div>

            {/* City Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              {TOP_CITIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCityTab(c)}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCityTab === c
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cards 3-Column Grid */}
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 animate-pulse h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobForDetails(job)}
                  className="cursor-pointer bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header: Logo + Institution Name + Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={job.institution?.logoUrl || '/logo.jpeg'}
                          alt={job.institution?.name || job.institutionName || 'Institution'}
                          className="w-11 h-11 rounded-xl object-cover border border-orange-100 bg-white shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                            <span className="truncate">{job.institution?.name || job.institutionName || 'Verified Institute'}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                            <span className="truncate">{job.city}, {job.state}</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                        {job.teachingLevel || 'FACULTY'}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {job.title}
                    </h3>

                    {/* Tags matching image: Bachelor/Master, On-site, Full Time */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                        {job.requiredQualification ? job.requiredQualification.split(' ')[0] : 'Master'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                        On-site
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                        {job.employmentType ? job.employmentType.replace('_', ' ') : 'Full Time'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed break-words">
                      {formatDescriptionSnippet(job.description)}
                    </p>
                  </div>

                  {/* Card Footer: Posted Info + Salary + Quick Apply */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Active Recruitment</span>
                      </span>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{job.minSalaryLPA} – {job.maxSalaryLPA} LPA
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobForDetails(job);
                        }}
                        className="cursor-pointer px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1 active:scale-95"
                        title="View vacancy details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(job.id, e)}
                        className={`cursor-pointer p-2 rounded-xl border transition ${
                          bookmarkedJobs[job.id]
                            ? 'bg-orange-50 text-orange-600 border-orange-300'
                            : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                        }`}
                        title="Bookmark opening"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {appliedJobIds.has(job.id) ? (
                        <span className="flex-1 py-2 text-center bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-default">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(job);
                          }}
                          className="cursor-pointer flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
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
              className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-orange-50 text-orange-600 font-bold text-xs sm:text-sm rounded-full border border-orange-300 hover:border-orange-400 shadow-xs hover:shadow-md transition-all group"
            >
              <span>Explore All Verified Vacancies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE SIKCHAKHUB.AI? (3D Pedestal Feature Cards)                  */}
      {/* ========================================================================= */}
      <section id="why-choose-sikchakhub" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFDF9] border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
                Why Choose <span className="text-orange-600">SikchaKhub.Ai</span>?
              </h2>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              A smarter, faster and more trusted platform for teaching careers in India.
            </p>
          </div>

          {/* 4 Pedestal Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. AI-Powered Matching */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                AI-Powered Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get job recommendations based on your profile, experience & preferences.
              </p>
            </div>

            {/* 2. Verified Institutions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Verified Institutions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only trusted and verified schools, colleges & universities are listed.
              </p>
            </div>

            {/* 3. Faster Hiring */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Faster Hiring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get shortlisted and connect with recruiters within ~72 hours.
              </p>
            </div>

            {/* 4. Career Growth Support */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center space-y-3 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 shadow-xs group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Career Growth Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resume tips, interview guidance and profile optimization to boost your chances.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SCHOOL CAMPUS ILLUSTRATION AT BOTTOM                                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF3E2] to-[#FFE8C8] pt-12 pb-6 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Illustrated School Campus Building */}
          <div className="relative mx-auto max-w-2xl">
            {/* Campus Vector Illustration */}
            <svg viewBox="0 0 800 360" className="w-full h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ground & Grass */}
              <ellipse cx="400" cy="340" rx="380" ry="20" fill="#E2E8F0" />
              <path d="M40 330 Q400 360 760 330 L760 350 L40 350 Z" fill="#CBD5E1" />

              {/* Trees on Left */}
              <circle cx="90" cy="240" r="45" fill="#16A34A" />
              <circle cx="120" cy="220" r="35" fill="#22C55E" />
              <circle cx="80" cy="200" r="30" fill="#4ADE80" />
              <rect x="95" y="270" width="14" height="60" fill="#92400E" rx="3" />

              {/* Trees on Right */}
              <circle cx="710" cy="240" r="45" fill="#16A34A" />
              <circle cx="680" cy="220" r="35" fill="#22C55E" />
              <circle cx="720" cy="200" r="30" fill="#4ADE80" />
              <rect x="695" y="270" width="14" height="60" fill="#92400E" rx="3" />

              {/* Main School Building Wings */}
              <rect x="180" y="160" width="440" height="160" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" rx="8" />
              
              {/* Windows Grid Left Wing */}
              {[195, 240, 285].map(x => (
                <React.Fragment key={x}>
                  <rect x={x} y="180" width="28" height="38" fill="#38BDF8" rx="4" stroke="#0284C7" strokeWidth="2" />
                  <rect x={x} y="240" width="28" height="38" fill="#38BDF8" rx="4" stroke="#0284C7" strokeWidth="2" />
                </React.Fragment>
              ))}

              {/* Windows Grid Right Wing */}
              {[485, 530, 575].map(x => (
                <React.Fragment key={x}>
                  <rect x={x} y="180" width="28" height="38" fill="#38BDF8" rx="4" stroke="#0284C7" strokeWidth="2" />
                  <rect x={x} y="240" width="28" height="38" fill="#38BDF8" rx="4" stroke="#0284C7" strokeWidth="2" />
                </React.Fragment>
              ))}

              {/* Central Neoclassical Portico */}
              <rect x="330" y="130" width="140" height="190" fill="#FFFBEB" stroke="#D97706" strokeWidth="3" rx="4" />
              
              {/* Classical Pillars */}
              <rect x="345" y="180" width="14" height="130" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
              <rect x="375" y="180" width="14" height="130" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
              <rect x="410" y="180" width="14" height="130" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
              <rect x="440" y="180" width="14" height="130" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />

              {/* Main Entrance Double Door */}
              <rect x="375" y="240" width="50" height="75" fill="#9A3412" stroke="#7C2D12" strokeWidth="2" rx="4" />
              <circle cx="395" cy="275" r="2.5" fill="#FCD34D" />
              <circle cx="405" cy="275" r="2.5" fill="#FCD34D" />

              {/* Front Porch Steps */}
              <rect x="320" y="315" width="160" height="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" rx="2" />
              <rect x="310" y="323" width="180" height="8" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" rx="2" />

              {/* Triangular Pediment (Central Roof) */}
              <polygon points="400,60 320,135 480,135" fill="#EA580C" stroke="#C2410C" strokeWidth="3" />
              
              {/* Left & Right Slanted Roof Wings */}
              <polygon points="170,165 330,165 315,135 185,135" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
              <polygon points="470,165 630,165 615,135 485,135" fill="#F97316" stroke="#EA580C" strokeWidth="2" />

              {/* Clock Tower / Round Window in Pediment */}
              <circle cx="400" cy="105" r="16" fill="#FFFFFF" stroke="#C2410C" strokeWidth="2.5" />
              <line x1="400" y1="105" x2="400" y2="95" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
              <line x1="400" y1="105" x2="408" y2="105" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

              {/* Logo / School Name Sign */}
              <rect x="345" y="145" width="110" height="26" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" rx="6" />
              <text x="400" y="162" textAnchor="middle" fill="#EA580C" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                SikchaKhub.Ai
              </text>
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-800">
              India's Most Trusted Teacher Hiring Ecosystem
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Connecting educators with leading schools, coaching institutes & colleges nationwide.
            </p>
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
