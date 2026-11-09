import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { JobVacancy } from '../types';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [selectedCityTab, setSelectedCityTab] = useState('All');
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobVacancy | null>(null);

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
      {/* 1. HERO SECTION (White & Light Blue Clean Modern Mesh)                    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/70 via-sky-50/40 to-white pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        
        {/* Subtle dot matrix grid background overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(2, 132, 199, 0.16) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient radial color meshes */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-sky-300/30 to-blue-200/30 blur-[130px] rounded-full pointer-events-none animate-pulse-subtle" />
        <div className="absolute top-20 right-1/4 translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-bl from-blue-300/25 to-cyan-200/25 blur-[140px] rounded-full pointer-events-none animate-pulse-subtle" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Trust Pill / AI Badge with Logo */}
          <div className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-sky-200/90 text-[11px] sm:text-xs text-sky-800 font-semibold shadow-xs max-w-full hover:border-sky-300 hover:shadow-md hover:shadow-sky-100/80 transition-all duration-300 cursor-default animate-hero-slide-up">
            <img src="/logo.jpeg" alt="SikshaHub" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-sky-300 shrink-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping shrink-0" />
            <span className="truncate">AI MATCH: India's Premier Teacher & Faculty Recruitment Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-serif max-w-4xl mx-auto leading-[1.14] animate-hero-slide-up">
            Best Job Portal in India With{' '}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Powered Hiring Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed animate-hero-slide-up">
            Automated teacher recruitment portal connecting over <strong>5,500+ top educational institutions</strong> and <strong>1.8M+ verified educators</strong> across India. Instant shortlists in ~72h, syllabus matching, and direct interview scheduling.
          </p>

          {/* ========================================================================= */}
          {/* Hero Search Box (Floating Pill Container in Crisp White & Light Blue)      */}
          {/* ========================================================================= */}
          <div className="max-w-3xl mx-auto pt-3 animate-hero-slide-up">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-xl shadow-sky-100/80 border border-sky-200/90 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-100 transition-all duration-300 flex flex-col md:flex-row items-center gap-2 group/search"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full min-w-0 border-b md:border-b-0 md:border-r border-sky-100 rounded-xl transition-all duration-200 hover:bg-sky-50/40 focus-within:bg-sky-50/40">
                <Search className="w-5 h-5 text-sky-600 shrink-0 transition-transform duration-200 group-focus-within/search:scale-110" />
                <input
                  type="text"
                  placeholder="Subject, role (e.g. JEE Physics, PGT Math, Principal)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-900 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 px-3 py-2 w-full md:w-64 min-w-0 border-b md:border-b-0 border-sky-100 rounded-xl transition-all duration-200 hover:bg-sky-50/40 focus-within:bg-sky-50/40">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 transition-transform duration-200 group-focus-within/search:scale-110" />
                <input
                  type="text"
                  placeholder="City (Kota, Delhi NCR, Jaipur...)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-w-0 text-xs sm:text-sm text-slate-900 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer group/btn"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </form>

            {/* Popular Quick Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-slate-500">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Trending Searches:
              </span>
              {[
                'JEE Advanced Physics', 
                'NEET Zoology', 
                'PGT Mathematics', 
                'CBSE English', 
                'Kota Mega Batch', 
                'School Principal'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                  className="cursor-pointer px-3.5 py-1.5 rounded-full bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-sky-200/80 hover:border-sky-300 text-[11px] font-medium transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Trust Counter Strip                                                      */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-sky-100 text-left max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default group relative overflow-hidden animate-stat-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-1">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">5,500+</p>
                <Building2 className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Hiring Institutions</p>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default group relative overflow-hidden animate-stat-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-1">
                <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  1.8M+
                </p>
                <Users className="w-5 h-5 text-sky-400 group-hover:text-sky-600 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Verified Educators</p>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default group relative overflow-hidden animate-stat-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-1">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">~72 Hours</p>
                <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Average Shortlist Time</p>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-sky-100/90 shadow-xs hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default group relative overflow-hidden animate-stat-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-between mb-1">
                <p className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight">₹6-35 LPA</p>
                <Award className="w-5 h-5 text-sky-400 group-hover:text-sky-600 transition-colors" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Verified Salary Bands</p>
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
                  onClick={() => setSelectedJobForApply(job)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedJobForApply(job);
                    }
                  }}
                >
                  <div className="space-y-4">
                    {/* Institution info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="/logo.jpeg"
                          alt="SikshaHub"
                          className="w-12 h-12 rounded-xl object-cover border border-sky-100 bg-white group-hover:scale-105 group-hover:border-sky-200 transition-all duration-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                            <span>SikshaHub</span>
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

                  {/* Card Footer: Offered CTC + Apply Button */}
                  <div className="pt-4 mt-5 border-t border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Offered CTC</span>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {appliedJobIds.has(job.id) ? (
                        <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-default shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Already Applied ✓</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobForApply(job);
                          }}
                          className="cursor-pointer px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:shadow-sky-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                          Quick Apply
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
      {/* 4. WHY CHOOSE SIKSHAHUB (Value Propositions)                              */}
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
              Unlike generic job portals, SikshaHub is engineered specifically for the Indian education ecosystem.
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
              <span>SikshaHub Mobile App (Android & iOS)</span>
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
                <img src="/logo.jpeg" alt="SikshaHub Logo" className="w-10 h-10 rounded-xl object-cover border border-sky-200 bg-white group-hover:scale-105 transition-transform" />
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
                    <img src="/logo.jpeg" alt="SikshaHub Mobile" className="w-6 h-6 rounded-md object-cover border border-sky-200 bg-white" />
                    <span className="font-bold text-slate-900">SikshaHub Mobile</span>
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

      {/* Dynamic Application Modal */}
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
