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
  FileCheck2, 
  Building2, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Award,
  BookOpen,
  ShieldCheck,
  Zap,
  Smartphone,
  Star,
  QrCode,
  Clock,
  CheckCircle,
  HelpCircle,
  School,
  Flame
} from 'lucide-react';
import { JobVacancy } from '../types';
import { ApplyJobModal } from '../components/ApplyJobModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [selectedCityTab, setSelectedCityTab] = useState('All');
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobVacancy | null>(null);

  // Fetch featured jobs from API
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/jobs?limit=6');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        return res.json();
      } catch (err) {
        console.warn('Using fallback jobs', err);
        return { jobs: [] };
      }
    },
  });

  const featuredJobs: JobVacancy[] = jobsData?.jobs && jobsData.jobs.length > 0 
    ? jobsData.jobs 
    : [
        {
          id: 'job-1',
          institutionId: 'inst-1',
          title: 'Senior Faculty - IIT-JEE Advanced Physics',
          subject: 'Physics',
          teachingLevel: 'COACHING_JEE' as any,
          board: 'CBSE' as any,
          minSalaryLPA: 18,
          maxSalaryLPA: 28,
          city: 'Kota',
          state: 'Rajasthan',
          minExperienceYears: 5,
          description: 'Lead faculty required for top rankers batch in Kota. Strong problem-solving pedigree in Irodov and Pathfinder required.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-1',
            name: 'Apex IIT & Medical Academy',
            type: 'COACHING_INSTITUTE' as any,
            city: 'Kota',
            state: 'Rajasthan',
            logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        },
        {
          id: 'job-2',
          institutionId: 'inst-2',
          title: 'PGT Senior Secondary Mathematics & AP Calculus',
          subject: 'Mathematics',
          teachingLevel: 'PGT' as any,
          board: 'CBSE' as any,
          minSalaryLPA: 9,
          maxSalaryLPA: 14,
          city: 'Delhi NCR',
          state: 'Delhi',
          minExperienceYears: 4,
          description: 'Reputed senior secondary CBSE day-boarding school seeking dynamic PGT Mathematics teacher for classes 11th & 12th.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-2',
            name: 'Delhi Heritage International School',
            type: 'SCHOOL_K12' as any,
            city: 'Delhi NCR',
            state: 'Delhi',
            logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        },
        {
          id: 'job-3',
          institutionId: 'inst-3',
          title: 'NEET Medical Faculty - Senior Zoology Expert',
          subject: 'Biology / Zoology',
          teachingLevel: 'COACHING_NEET' as any,
          board: 'CBSE' as any,
          minSalaryLPA: 15,
          maxSalaryLPA: 24,
          city: 'Bengaluru',
          state: 'Karnataka',
          minExperienceYears: 4,
          description: 'Responsible for delivering high-yield NCERT diagrams and NEET UG conceptual test analysis for repeaters batch.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-3',
            name: 'Narayana Educational Institutions',
            type: 'COACHING_INSTITUTE' as any,
            city: 'Bengaluru',
            state: 'Karnataka',
            logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        },
        {
          id: 'job-4',
          institutionId: 'inst-4',
          title: 'TGT Science & STEM Coordinator',
          subject: 'Science / Physics',
          teachingLevel: 'TGT' as any,
          board: 'ICSE' as any,
          minSalaryLPA: 7,
          maxSalaryLPA: 10,
          city: 'Jaipur',
          state: 'Rajasthan',
          minExperienceYears: 3,
          description: 'Experienced middle school science teacher with hands-on robotics and laboratory activity teaching approach.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-4',
            name: 'Cambridge Global Academy',
            type: 'SCHOOL_K12' as any,
            city: 'Jaipur',
            state: 'Rajasthan',
            logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        },
        {
          id: 'job-5',
          institutionId: 'inst-5',
          title: 'Assistant Professor - Computer Science & AI',
          subject: 'Computer Science',
          teachingLevel: 'COLLEGE_PROFESSOR' as any,
          board: 'OTHER' as any,
          minSalaryLPA: 12,
          maxSalaryLPA: 18,
          city: 'Pune',
          state: 'Maharashtra',
          minExperienceYears: 3,
          description: 'NAAC A+ accredited technical university hiring faculty for Machine Learning, Data Structures, and Python Programming.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-5',
            name: 'Horizon Institute of Technology',
            type: 'COLLEGE_UNIVERSITY' as any,
            city: 'Pune',
            state: 'Maharashtra',
            logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        },
        {
          id: 'job-6',
          institutionId: 'inst-6',
          title: 'Head of Department (HOD) - Chemistry',
          subject: 'Chemistry',
          teachingLevel: 'HOD_PRINCIPAL' as any,
          board: 'CBSE' as any,
          minSalaryLPA: 20,
          maxSalaryLPA: 32,
          city: 'Hyderabad',
          state: 'Telangana',
          minExperienceYears: 8,
          description: 'Lead a team of 14 chemistry lecturers for JEE Main, Advanced, and state competitive exams. Exceptional leadership required.',
          status: 'PUBLISHED' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          institution: {
            id: 'inst-6',
            name: 'Sri Chaitanya Educational Group',
            type: 'COACHING_INSTITUTE' as any,
            city: 'Hyderabad',
            state: 'Telangana',
            logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=160&h=160&q=80',
            isVerified: true
          } as any
        }
      ];

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-tallento-pink selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Tallento.ai Signature Ambient Mesh & Fiery Gradients)     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-slate-950 pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        
        {/* Subtle dot matrix grid background overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient radial color meshes */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-tallento-pink/20 to-tallento-orange/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-1/4 translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-bl from-tallento-purple/25 to-blue-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Trust Pill / AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs text-slate-200 font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-tallento-pink animate-ping" />
            <Sparkles className="w-4 h-4 text-tallento-orange" />
            <span>AI MATCH: India's Premier Teacher & Faculty Recruitment Engine</span>
          </div>

          {/* Headline identical to Tallento.ai design philosophy */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif max-w-4xl mx-auto leading-[1.15]">
            Best Job Portal in India With{' '}
            <span className="bg-gradient-to-r from-tallento-pink via-tallento-orange to-tallento-purple bg-clip-text text-transparent">
              AI-Powered Hiring Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Automated teacher recruitment portal connecting over <strong>5,500+ top educational institutions</strong> and <strong>1.8M+ verified educators</strong> across India. Instant shortlists in ~72h, syllabus matching, and direct interview scheduling.
          </p>

          {/* ========================================================================= */}
          {/* Hero Search Box (Floating Pill Container like Tallento.ai)                */}
          {/* ========================================================================= */}
          <div className="max-w-3xl mx-auto pt-3">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="w-5 h-5 text-tallento-pink shrink-0" />
                <input
                  type="text"
                  placeholder="Subject, role (e.g. JEE Physics, PGT Math, Principal)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 px-3 py-2 w-full md:w-64 border-b md:border-b-0 border-slate-200">
                <MapPin className="w-5 h-5 text-tallento-orange shrink-0" />
                <input
                  type="text"
                  placeholder="City (Kota, Delhi NCR, Jaipur...)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-tallento-pink via-tallento-orange to-tallento-purple text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition transform active:scale-95 shrink-0"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Quick Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-slate-400">
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
                  className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Trust Counter Strip (Tallento.ai Metrics)                                 */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 text-left max-w-4xl mx-auto">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
              <p className="text-2xl sm:text-3xl font-black text-white">5,500+</p>
              <p className="text-xs text-slate-400 font-medium">Hiring Institutions</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-tallento-pink to-tallento-orange bg-clip-text text-transparent">
                1.8M+
              </p>
              <p className="text-xs text-slate-400 font-medium">Verified Educators</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">~72 Hours</p>
              <p className="text-xs text-slate-400 font-medium">Average Shortlist Time</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">₹6-35 LPA</p>
              <p className="text-xs text-slate-400 font-medium">Verified Salary Bands</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE RECRUITMENT CATEGORIES (Cards with Colorful Icons)                */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-tallento-pink bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                Explore Segments
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-serif">
                Browse Faculty & Teaching Jobs By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Direct access to high-volume recruitment streams across schools, premier coaching, and universities.
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-bold text-tallento-pink hover:text-pink-400 flex items-center gap-1 group self-start sm:self-auto"
            >
              <span>View All 1,800+ Vacancies</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/jobs?teachingLevel=${cat.param}`)}
                  className="bg-slate-950 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.bg} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-base font-bold text-white group-hover:text-tallento-pink transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{cat.count}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                    <span>Explore openings</span>
                    <ArrowRight className="w-4 h-4 text-tallento-pink group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED LIVE VACANCIES (Tallento.ai Card UI)                          */}
      {/* ========================================================================= */}
      <section className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Verified Vacancies
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-serif">
                Featured Teaching & Faculty Openings
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
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
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedCityTab === c
                      ? 'bg-tallento-pink text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800/90 hover:border-slate-700 hover:shadow-2xl transition flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Institution info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={job.institution?.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=80&h=80&q=80'}
                        alt={job.institution?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-white"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1 flex items-center gap-1.5">
                          <span>{job.institution?.name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-tallento-orange" />
                          <span>{job.city}, {job.state}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-tallento-pink border border-slate-700 shrink-0">
                      {job.teachingLevel}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-sm sm:text-base font-bold text-white font-serif line-clamp-2 group-hover:text-tallento-orange transition">
                    {job.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                      Subject: {job.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                      {job.board}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                      {job.minExperienceYears}+ Yrs Exp
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Card Footer: Offered CTC + Apply Button */}
                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">Offered CTC</span>
                    <span className="text-sm font-black text-emerald-400">
                      ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForApply(job)}
                      className="px-4 py-2 bg-gradient-to-r from-tallento-pink to-tallento-orange text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition transform active:scale-95"
                    >
                      Quick Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-800 transition shadow-lg"
            >
              <span>Explore All Verified Vacancies</span>
              <ArrowRight className="w-4 h-4 text-tallento-pink" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FREE ATS RESUME CHECKER (Signature Tallento.ai Showcase)               */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <FileCheck2 className="w-4 h-4" />
                <span>Free AI Resume Reviewer for Educators</span>
              </span>

              <h3 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight leading-snug">
                Does Your Resume Pass School ATS & Coaching Recruiters?
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Over 78% of teacher resumes are rejected by automated recruitment filters due to missing pedagogy keywords, unquantified board results, or non-standard formatting. Get an instant score and AI optimization advice.
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Subject keyword alignment (CBSE, ICSE, IIT-JEE, NEET)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>NEP-2020 pedagogical terminology scanner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Quantified student performance & board score metrics</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/ats-checker"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <span>Check Your Resume Score (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Scorecard Mockup */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-200">Candidate ATS Scorecard</span>
                  <p className="text-[11px] text-slate-400">JEE Physics Senior Faculty</p>
                </div>
                <span className="text-xs font-extrabold bg-emerald-500 text-slate-950 px-3 py-1 rounded-full shadow-xs">
                  Score: 94/100 (Grade A+)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">Pedagogy Keyword Density</span>
                    <span className="text-emerald-400 font-bold">96%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[96%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">Board Exam Impact Metrics</span>
                    <span className="text-emerald-400 font-bold">92%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">Format & ATS Readability</span>
                    <span className="text-emerald-400 font-bold">98%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 italic">
                "Excellent inclusion of JEE Advanced student selection rank records and NEET NCERT mastery indicators."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHY CHOOSE SIKSHAHUB / TALLENTO (Value Propositions)                   */}
      {/* ========================================================================= */}
      <section className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tallento-orange bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              Platform Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Why 1.8M+ Teachers & 5,500+ Schools Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Unlike generic job portals, SikshaHub is engineered specifically for the Indian education ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-tallento-pink/10 border border-tallento-pink/20 flex items-center justify-center text-tallento-pink">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Syllabus Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our algorithm matches candidates based on specific subjects, competitive board levels, and teaching methodologies rather than basic keywords.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-tallento-orange/10 border border-tallento-orange/20 flex items-center justify-center text-tallento-orange">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Direct Principal Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No third-party consultancy agents. Apply directly to school hiring teams and coaching directors with interview scheduling in ~72 hours.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Verified Institutions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every school, college, and coaching center undergoes mandatory verification to guarantee safe hiring and clear salary benchmarks.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-tallento-purple/10 border border-tallento-purple/20 flex items-center justify-center text-tallento-purple">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Confidential Job Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Currently employed faculty can switch on stealth mode to explore higher CTC offers without alerting current school management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TOP EDUCATIONAL ORGANIZATIONS                                          */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trusted Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Top Educational Institutions Hiring Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              From Kota coaching giants to premier CBSE & International Baccalaureate schools.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Apex IIT & Medical Academy', location: 'Kota & National', type: 'Premier Coaching Institute', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Delhi Heritage International', location: 'Dwarka, New Delhi', type: 'CBSE Day-Boarding School', logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Cambridge Global Academy', location: 'Bengaluru, Karnataka', type: 'Cambridge IGCSE & A-Levels', logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=160&h=160&q=80' },
              { name: 'Horizon Institute of Tech', location: 'Pune, Maharashtra', type: 'NAAC A+ Engineering University', logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=160&h=160&q=80' },
            ].map((org, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs flex items-center gap-3">
                <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{org.name}</h4>
                  <p className="text-[10px] text-tallento-pink font-semibold">{org.type}</p>
                  <p className="text-[10px] text-slate-400">{org.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RECRUITER POST JOB CALLOUT BANNER                                      */}
      {/* ========================================================================= */}
      <section className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-tallento-pink via-tallento-orange to-tallento-purple rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                For Schools, Colleges & Coaching Centers
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
                Are You Looking to Hire Top Faculty?
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Post your vacancy in under 2 minutes. Tap into 1.8M+ verified teachers and receive pre-filtered candidate rankings for your specific syllabus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/employer-dashboard"
                className="px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition transform active:scale-95 text-center"
              >
                Post A Free Job!
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MOBILE APP DOWNLOAD SHOWCASE (Tallento.ai App Section)                  */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-tallento-pink text-xs font-bold border border-slate-700">
              <Smartphone className="w-4 h-4" />
              <span>SikshaHub Mobile App (Android & iOS)</span>
            </span>

            <h3 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight">
              Get Instant Job Alerts & Interview Calls on Mobile
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Never miss an urgent recruitment drive. Track application status, chat with school HR, and attend virtual demo classes directly through our React Native Expo mobile app.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">4.8 / 5 Rating (150K+ Educator Reviews)</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
                <QrCode className="w-10 h-10 text-tallento-pink" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Scan QR to install</p>
                  <p className="text-xs font-bold text-white">Free on Google Play & iOS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Phone Mockup UI */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <div className="bg-slate-950 rounded-[2.5rem] p-4 border-4 border-slate-800 shadow-2xl space-y-3">
              {/* Phone top notch */}
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto" />

              {/* In-app mockup screen */}
              <div className="bg-slate-900 rounded-2xl p-4 space-y-3 text-xs border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">SikshaHub Mobile</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    LIVE ALERTS
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-tallento-pink font-bold">Interview Invitation</span>
                  <p className="text-xs font-bold text-white">Apex IIT Academy • Kota</p>
                  <p className="text-[11px] text-slate-400">Senior JEE Physics Faculty (₹24 LPA)</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold">Resume Shortlisted</span>
                  <p className="text-xs font-bold text-white">Delhi Heritage International</p>
                  <p className="text-[11px] text-slate-400">PGT Mathematics (CBSE Board)</p>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-tallento-pink to-tallento-orange text-white font-bold text-xs shadow-md">
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
          onAppliedSuccess={() => {}}
        />
      )}
    </div>
  );
};
