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
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-sky-300/30 to-blue-200/30 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-1/4 translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-bl from-blue-300/25 to-cyan-200/25 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Trust Pill / AI Badge with Logo */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-sky-200 text-xs text-sky-800 font-semibold shadow-xs">
            <img src="/logo.jpeg" alt="SikshaHub" className="w-5 h-5 rounded-full object-cover border border-sky-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            <span>AI MATCH: India's Premier Teacher & Faculty Recruitment Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-serif max-w-4xl mx-auto leading-[1.15]">
            Best Job Portal in India With{' '}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Powered Hiring Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Automated teacher recruitment portal connecting over <strong>5,500+ top educational institutions</strong> and <strong>1.8M+ verified educators</strong> across India. Instant shortlists in ~72h, syllabus matching, and direct interview scheduling.
          </p>

          {/* ========================================================================= */}
          {/* Hero Search Box (Floating Pill Container in Crisp White & Light Blue)      */}
          {/* ========================================================================= */}
          <div className="max-w-3xl mx-auto pt-3">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-xl shadow-sky-100/70 border border-sky-200 flex flex-col md:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-sky-100">
                <Search className="w-5 h-5 text-sky-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Subject, role (e.g. JEE Physics, PGT Math, Principal)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 focus:outline-hidden placeholder:text-slate-400 font-medium bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 px-3 py-2 w-full md:w-64 border-b md:border-b-0 border-sky-100">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
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
                className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition transform active:scale-95 shrink-0"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
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
                  className="px-3 py-1 rounded-full bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-sky-200/80 text-[11px] font-medium transition shadow-2xs"
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
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-sky-100 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">5,500+</p>
              <p className="text-xs text-slate-500 font-medium">Hiring Institutions</p>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-sky-100 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                1.8M+
              </p>
              <p className="text-xs text-slate-500 font-medium">Verified Educators</p>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-sky-100 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">~72 Hours</p>
              <p className="text-xs text-slate-500 font-medium">Average Shortlist Time</p>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-sky-100 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-sky-600">₹6-35 LPA</p>
              <p className="text-xs text-slate-500 font-medium">Verified Salary Bands</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE RECRUITMENT CATEGORIES                                            */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-sky-50/40 to-white py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200">
                Explore Segments
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-serif">
                Browse Faculty & Teaching Jobs By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Direct access to high-volume recruitment streams across schools, premier coaching, and universities.
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group self-start sm:self-auto"
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
                  className="bg-white rounded-2xl p-6 border border-sky-100 hover:border-sky-300 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.bg} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{cat.count}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-sky-600">
                    <span>Explore openings</span>
                    <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition" />
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
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Vacancies
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-serif">
                Featured Teaching & Faculty Openings
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
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
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-sky-50/70 text-slate-600 hover:text-sky-700 hover:bg-sky-100 border border-sky-200/70'
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
                className="bg-white rounded-2xl p-6 border border-sky-100 hover:border-sky-300 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-4">
                  {/* Institution info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={job.institution?.logoUrl || '/logo.jpeg'}
                        alt={job.institution?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-sky-100 bg-white"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                          <span>{job.institution?.name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-500" />
                          <span>{job.city}, {job.state}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      {job.teachingLevel}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif line-clamp-2 group-hover:text-sky-600 transition">
                    {job.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium">
                      Subject: {job.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium">
                      {job.board}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium">
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
                    <button
                      onClick={() => setSelectedJobForApply(job)}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-xs transition transform active:scale-95"
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs sm:text-sm rounded-2xl border border-sky-200 transition shadow-xs"
            >
              <span>Explore All Verified Vacancies</span>
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </Link>
          </div>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 5. WHY CHOOSE SIKSHAHUB (Value Propositions)                              */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200">
              Platform Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Why 1.8M+ Teachers & 5,500+ Schools Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Unlike generic job portals, SikshaHub is engineered specifically for the Indian education ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-lg transition space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Syllabus Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithm matches candidates based on specific subjects, competitive board levels, and teaching methodologies rather than basic keywords.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-lg transition space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Principal Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No third-party consultancy agents. Apply directly to school hiring teams and coaching directors with interview scheduling in ~72 hours.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-lg transition space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">100% Verified Institutions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every school, college, and coaching center undergoes mandatory verification to guarantee safe hiring and clear salary benchmarks.
              </p>
            </div>

            <div className="bg-sky-50/40 hover:bg-white p-6 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-lg transition space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Confidential Job Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Currently employed faculty can switch on stealth mode to explore higher CTC offers without alerting current school management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TOP EDUCATIONAL ORGANIZATIONS                                          */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-sky-50/40 to-white py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200">
              Trusted Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Top Educational Institutions Hiring Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
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
              <div key={i} className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 hover:shadow-md transition flex items-center gap-3">
                <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover border border-sky-100 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{org.name}</h4>
                  <p className="text-[10px] text-sky-600 font-semibold">{org.type}</p>
                  <p className="text-[10px] text-slate-500">{org.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RECRUITER POST JOB CALLOUT BANNER                                      */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
                For Schools, Colleges & Coaching Centers
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
                Are You Looking to Hire Top Faculty?
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                Post your vacancy in under 2 minutes. Tap into 1.8M+ verified teachers and receive pre-filtered candidate rankings for your specific syllabus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/employer-dashboard"
                className="px-8 py-4 bg-white text-sky-900 hover:bg-sky-50 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition transform active:scale-95 text-center"
              >
                Post A Free Job!
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MOBILE APP DOWNLOAD SHOWCASE                                           */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-white to-sky-50/60 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200">
              <Smartphone className="w-4 h-4" />
              <span>SikshaHub Mobile App (Android & iOS)</span>
            </span>

            <h3 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight">
              Get Instant Job Alerts & Interview Calls on Mobile
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never miss an urgent recruitment drive. Track application status, chat with school HR, and attend virtual demo classes directly through our React Native Expo mobile app.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.8 / 5 Rating (150K+ Educator Reviews)</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <div className="p-3 bg-white border border-sky-200 rounded-2xl flex items-center gap-3 shadow-xs">
                <img src="/logo.jpeg" alt="SikshaHub Logo" className="w-10 h-10 rounded-xl object-cover border border-sky-200 bg-white" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500">Scan QR to install</p>
                  <p className="text-xs font-bold text-slate-900">Free on Google Play & iOS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Phone Mockup UI */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <div className="bg-white rounded-[2.5rem] p-4 border-4 border-sky-200 shadow-xl space-y-3">
              {/* Phone top notch */}
              <div className="w-32 h-4 bg-sky-100 rounded-full mx-auto" />

              {/* In-app mockup screen */}
              <div className="bg-sky-50/60 rounded-2xl p-4 space-y-3 text-xs border border-sky-100">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
                  <div className="flex items-center gap-2">
                    <img src="/logo.jpeg" alt="SikshaHub Mobile" className="w-6 h-6 rounded-md object-cover border border-sky-200 bg-white" />
                    <span className="font-bold text-slate-900">SikshaHub Mobile</span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">
                    LIVE ALERTS
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1">
                  <span className="text-[10px] text-sky-600 font-bold">Interview Invitation</span>
                  <p className="text-xs font-bold text-slate-900">Apex IIT Academy • Kota</p>
                  <p className="text-[11px] text-slate-500">Senior JEE Physics Faculty (₹24 LPA)</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1">
                  <span className="text-[10px] text-emerald-600 font-bold">Resume Shortlisted</span>
                  <p className="text-xs font-bold text-slate-900">Delhi Heritage International</p>
                  <p className="text-[11px] text-slate-500">PGT Mathematics (CBSE Board)</p>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-md">
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
