import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Calendar,
  Users,
  Info,
  Bookmark,
  ArrowRight,
  Star
} from 'lucide-react';
import { JobVacancy } from '@sikchakhub/shared-types';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { AuthRequiredModal } from '../components/AuthRequiredModal';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export const JobsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Search & Filter State
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('teachingLevel') || '');
  const [selectedBoard, setSelectedBoard] = useState(searchParams.get('board') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [sortBy, setSortBy] = useState('relevance');

  // Filter sidebar accordions & internal search
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showMoreSubjects, setShowMoreSubjects] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(true);
  const [levelOpen, setLevelOpen] = useState(true);
  const [boardOpen, setBoardOpen] = useState(true);
  const [salaryOpen, setSalaryOpen] = useState(true);

  // Modals & Save State
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobVacancy | null>(null);
  const [activeJobDetail, setActiveJobDetail] = useState<JobVacancy | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [authPromptJob, setAuthPromptJob] = useState<JobVacancy | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Authentication check before applying
  const handleApplyClick = (job: JobVacancy) => {
    if (!token || !user || user.role !== 'TEACHER') {
      setAuthPromptJob(job);
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedJobForApply(job);
  };

  // Saved Jobs persisted in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sikchakhub_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('sikchakhub_saved_jobs', JSON.stringify(updated));
      } catch (err) {}
      setToastNotice(prev.includes(jobId) ? 'Vacancy removed from Saved Openings' : 'Vacancy saved! View it anytime in your Job Seeker Dashboard.');
      setTimeout(() => setToastNotice(null), 3000);
      return updated;
    });
  };

  // Fetch jobs from backend API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['jobs', keyword, selectedCity, selectedSubject, selectedLevel, selectedBoard, minSalary],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (keyword) params.append('q', keyword);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedLevel) params.append('teachingLevel', selectedLevel);
      if (selectedBoard) params.append('board', selectedBoard);
      if (minSalary) params.append('minSalary', minSalary);

      const res = await fetch(apiUrl(`/api/v1/jobs?${params.toString()}`));
      return res.json();
    },
  });

  // Real MongoDB jobs from backend API
  const allJobs: JobVacancy[] = useMemo(() => {
    const jobsList: JobVacancy[] = [...(apiData?.jobs || [])];

    // Sort jobs
    if (sortBy === 'salary_desc') {
      jobsList.sort((a, b) => b.maxSalaryLPA - a.maxSalaryLPA);
    } else if (sortBy === 'date_desc') {
      jobsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'exp_asc') {
      jobsList.sort((a, b) => a.minExperienceYears - b.minExperienceYears);
    }

    return jobsList;
  }, [apiData, sortBy]);

  const hasActiveFilter = Boolean(keyword || selectedCity || selectedSubject || selectedLevel || selectedBoard || minSalary);
  const displayCount = allJobs.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedSubject) params.append('subject', selectedSubject);
    if (selectedLevel) params.append('teachingLevel', selectedLevel);
    if (selectedBoard) params.append('board', selectedBoard);
    if (minSalary) params.append('minSalary', minSalary);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCity('');
    setSelectedSubject('');
    setSelectedLevel('');
    setSelectedBoard('');
    setMinSalary('');
    setSearchParams({});
  };

  // Filter lists with counts matching the design
  const SUBJECTS_LIST = [
    { name: 'Physics', count: 24 },
    { name: 'Chemistry', count: 18 },
    { name: 'Mathematics', count: 32 },
    { name: 'Biology', count: 16 },
    { name: 'English', count: 27 },
    { name: 'Computer Science', count: 14 },
    { name: 'Commerce', count: 11 },
    { name: 'Hindi', count: 9 },
    { name: 'Social Studies', count: 15 },
  ];

  const filteredSubjects = SUBJECTS_LIST.filter(s => 
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );
  const visibleSubjects = showMoreSubjects ? filteredSubjects : filteredSubjects.slice(0, 5);

  const TEACHING_LEVELS = [
    { value: 'COACHING_JEE', label: 'IIT-JEE Faculty', count: 8 },
    { value: 'COACHING_NEET', label: 'NEET Medical Faculty', count: 6 },
    { value: 'PGT', label: 'PGT (Grades 11–12)', count: 20 },
    { value: 'TGT', label: 'TGT (Grades 6–10)', count: 18 },
    { value: 'PRT', label: 'PRT (Grades 1–5)', count: 12 },
    { value: 'COLLEGE_PROFESSOR', label: 'College / University', count: 5 },
  ];

  const BOARDS = [
    { id: 'CBSE', label: 'CBSE' },
    { id: 'ICSE', label: 'ICSE' },
    { id: 'CAMBRIDGE', label: 'CAMBRIDGE' },
    { id: 'IB', label: 'IB' },
    { id: 'OTHER', label: 'Other' }
  ];

  const TRENDING_TAGS = [
    { label: 'PGT Physics', query: 'Physics', highlight: 'purple' },
    { label: 'TGT Mathematics', query: 'Mathematics', highlight: 'default' },
    { label: 'PRT Teacher', query: 'PRT', highlight: 'default' },
    { label: 'CBSE Jobs', query: 'CBSE', highlight: 'amber' },
    { label: 'NEET Faculty', query: 'NEET', highlight: 'default' },
    { label: 'IIT Faculty', query: 'IIT', highlight: 'default' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800">
      {/* Toast Alert */}
      {toastNotice && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO HEADER SECTION                                                    */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#e8f3fc] via-[#f2f8fd] to-[#f8fbff] relative overflow-hidden border-b border-sky-100/80 pt-8 pb-10 sm:pt-12 sm:pb-14">
        {/* Soft Decorative Ambient Circles */}
        <div className="absolute -left-20 top-0 w-80 h-80 bg-gradient-to-br from-sky-200/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Dot Grid Pattern on Top Right */}
        <div 
          className="absolute right-8 top-6 w-80 h-48 opacity-20 pointer-events-none hidden md:block"
          style={{ backgroundImage: 'radial-gradient(#0284c7 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Content Column */}
            <div className="flex-1 text-center lg:text-left space-y-3.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-slate-900 tracking-tight font-serif leading-tight">
                Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 italic font-serif">Teaching Jobs</span> Across India
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
                Discover verified teaching opportunities in top schools, coaching institutes and educational organizations.
              </p>

              {/* Big Floating Capsule Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-full p-2 sm:p-2.5 shadow-xl shadow-sky-100/90 border border-sky-200/90 hover:border-sky-300 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center gap-2 max-w-3xl mt-5"
              >
                {/* Keyword / Subject Input */}
                <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 w-full min-w-0">
                  <Search className="w-5 h-5 text-sky-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by job title, subject, or keywords..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full min-w-0 text-xs sm:text-sm text-slate-900 bg-transparent placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword('')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-slate-200 hidden md:block shrink-0" />

                {/* City Input */}
                <div className="flex items-center gap-2 px-3 py-1.5 w-full md:w-56 min-w-0">
                  <MapPin className="w-5 h-5 text-sky-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="City (Kota, Delhi, Pune...)"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full min-w-0 text-xs sm:text-sm text-slate-900 bg-transparent placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>

                {/* Orange/Amber Search Button */}
                <button
                  type="submit"
                  className="cursor-pointer w-full md:w-auto px-7 py-3 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0"
                >
                  <span>Search Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trending Searches Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 mr-1 font-medium">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-[11px] font-semibold text-slate-500">Trending:</span>
                </div>
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setKeyword(tag.query);
                      setSearchParams({ q: tag.query });
                    }}
                    className={`cursor-pointer px-3.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 ${
                      tag.highlight === 'purple'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/90 font-semibold hover:bg-purple-100'
                        : tag.highlight === 'amber'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/90 font-semibold hover:bg-amber-100'
                        : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80 hover:border-sky-300'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Academic 3D Illustration */}
            <div className="shrink-0 relative hidden lg:block w-72 xl:w-80">
              <div className="relative flex items-center justify-center p-4">
                {/* 3D Mortarboard Cap + Books Vector Illustration */}
                <svg viewBox="0 0 320 260" className="w-full h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Decorative leaves on left */}
                  <path d="M50 140 C30 110, 40 70, 70 80 C80 100, 70 130, 50 140 Z" fill="#4ade80" opacity="0.85" />
                  <path d="M55 125 C45 105, 50 85, 68 90" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                  <path d="M75 160 C55 140, 50 110, 80 115 C90 130, 85 155, 75 160 Z" fill="#22c55e" />
                  <path d="M75 150 C65 135, 65 120, 78 122" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

                  {/* Soft Book Drop Shadow */}
                  <ellipse cx="160" cy="225" rx="110" ry="18" fill="#94a3b8" opacity="0.25" />

                  {/* BOTTOM BOOK (Cobalt / Emerald Blue) */}
                  <g transform="translate(60, 160)">
                    <path d="M10 32 L190 32 L190 48 L10 48 Z" fill="#1e3a8a" />
                    <path d="M15 35 L185 35 L185 45 L15 45 Z" fill="#f8fafc" />
                    <rect x="5" y="30" width="190" height="8" rx="3" fill="#2563eb" />
                    <rect x="5" y="44" width="190" height="8" rx="3" fill="#1d4ed8" />
                    <rect x="0" y="30" width="16" height="22" rx="4" fill="#1e40af" />
                  </g>

                  {/* MIDDLE BOOK (Cyan Blue with red bookmark ribbon) */}
                  <g transform="translate(65, 132)">
                    <path d="M12 28 L180 28 L180 44 L12 44 Z" fill="#0369a1" />
                    <path d="M16 31 L176 31 L176 41 L16 41 Z" fill="#ffffff" />
                    <rect x="8" y="26" width="176" height="7" rx="3" fill="#0284c7" />
                    <rect x="8" y="40" width="176" height="7" rx="3" fill="#0369a1" />
                    <rect x="2" y="26" width="16" height="21" rx="4" fill="#075985" />
                    {/* Red bookmark ribbon */}
                    <path d="M140 40 L140 58 L146 54 L152 58 L152 40 Z" fill="#ef4444" />
                  </g>

                  {/* TOP BOOK (Warm Amber / Gold) */}
                  <g transform="translate(70, 102)">
                    <path d="M12 28 L170 28 L170 44 L12 44 Z" fill="#b45309" />
                    <path d="M16 31 L166 31 L166 41 L16 41 Z" fill="#ffffff" />
                    <rect x="8" y="26" width="166" height="7" rx="3" fill="#f59e0b" />
                    <rect x="8" y="40" width="166" height="7" rx="3" fill="#d97706" />
                    <rect x="2" y="26" width="16" height="21" rx="4" fill="#b45309" />
                  </g>

                  {/* PENCIL MUG with colorful pens on right */}
                  <g transform="translate(235, 140)">
                    {/* Pencil Holder Mug */}
                    <rect x="8" y="32" width="34" height="42" rx="6" fill="#fef08a" stroke="#facc15" strokeWidth="2" />
                    {/* Pencils */}
                    <rect x="14" y="10" width="5" height="30" rx="1" fill="#ef4444" transform="rotate(-10, 14, 10)" />
                    <polygon points="12.5,10 16,3 19,10" fill="#fca5a5" transform="rotate(-10, 14, 10)" />
                    <rect x="22" y="6" width="5" height="34" rx="1" fill="#3b82f6" />
                    <polygon points="21,6 24.5,-1 28,6" fill="#93c5fd" />
                    <rect x="30" y="12" width="5" height="28" rx="1" fill="#10b981" transform="rotate(12, 30, 12)" />
                    <polygon points="28,12 32,5 36,12" fill="#6ee7b7" transform="rotate(12, 30, 12)" />
                  </g>

                  {/* GRADUATION CAP / MORTARBOARD (Top Navy Blue) */}
                  <g transform="translate(60, 20)">
                    {/* Cap Skull Base */}
                    <path d="M60 70 C60 95, 140 95, 140 70 L140 60 C140 75, 60 75, 60 60 Z" fill="#0f172a" />
                    <path d="M62 70 C62 90, 138 90, 138 70" stroke="#1e293b" strokeWidth="1" fill="none" />

                    {/* Mortarboard Diamond Top */}
                    <polygon points="100,20 185,52 100,84 15,52" fill="#1e293b" />
                    <polygon points="100,24 180,52 100,80 20,52" fill="#0f172a" />
                    <polygon points="100,20 185,52 185,56 100,24" fill="#334155" />
                    <polygon points="185,52 100,84 100,88 185,56" fill="#1e293b" />

                    {/* Button on top */}
                    <ellipse cx="100" cy="52" rx="6" ry="3.5" fill="#f59e0b" />

                    {/* Golden Yellow Tassel */}
                    <path d="M100 52 C135 55, 155 70, 158 92" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="158" cy="94" r="3.5" fill="#d97706" />
                    {/* Tassel fringe */}
                    <path d="M158 94 L152 120 L164 120 Z" fill="#f59e0b" />
                    <path d="M154 116 L162 116" stroke="#b45309" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. RESULTS SUBHEADER BAR                                                  */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-600">
              Showing <strong className="text-slate-900 font-extrabold text-base">{displayCount}</strong> vacancies
            </h2>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-sky-700 border border-sky-200 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              <span>Filters ({[selectedSubject, selectedLevel, selectedBoard, minSalary].filter(Boolean).length})</span>
            </button>
          </div>

          {/* Right Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-600 self-end sm:self-auto">
            <span className="font-medium text-slate-500">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer appearance-none bg-white rounded-full border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-800 py-1.5 pl-3.5 pr-8 shadow-2xs focus:outline-none transition"
              >
                <option value="relevance">Recruitment Relevance</option>
                <option value="salary_desc">Salary: High to Low</option>
                <option value="date_desc">Newest First</option>
                <option value="exp_asc">Experience: Low to High</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN 2-COLUMN DISCOVERY LAYOUT (Filters + Job Cards)                   */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN: FILTER VACANCIES SIDEBAR                                  */}
          {/* ======================================================================= */}
          <aside className={`lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* Filter Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Filter Vacancies</h3>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="cursor-pointer text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Accordion 1: Subject */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSubjectOpen(!subjectOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Subject</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${subjectOpen ? 'rotate-180 text-sky-600' : ''}`} />
              </button>

              {subjectOpen && (
                <div className="space-y-2.5 pt-1">
                  {/* Subject Internal Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search subject..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-400 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Subject Checkboxes List */}
                  <div className="space-y-1.5 pt-1">
                    {visibleSubjects.map((sub) => {
                      const isChecked = selectedSubject.toLowerCase() === sub.name.toLowerCase();
                      return (
                        <label
                          key={sub.name}
                          onClick={() => setSelectedSubject(isChecked ? '' : sub.name)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                            isChecked 
                              ? 'bg-sky-50/80 text-sky-900 font-bold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition border ${
                              isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className="truncate">{sub.name}</span>
                          </div>
                          <span className={`text-[11px] font-medium ${isChecked ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
                            ({sub.count})
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Show More / Show Less */}
                  {filteredSubjects.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowMoreSubjects(!showMoreSubjects)}
                      className="cursor-pointer text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline pt-1 pl-1"
                    >
                      {showMoreSubjects ? '− Show Less' : '+ Show More'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Teaching Level */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setLevelOpen(!levelOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Teaching Level</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${levelOpen ? 'rotate-180 text-purple-600' : ''}`} />
              </button>

              {levelOpen && (
                <div className="space-y-1.5 pt-1">
                  {TEACHING_LEVELS.map((lvl) => {
                    const isChecked = selectedLevel === lvl.value;
                    return (
                      <label
                        key={lvl.value}
                        onClick={() => setSelectedLevel(isChecked ? '' : lvl.value)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                          isChecked 
                            ? 'bg-purple-50/80 text-purple-900 font-bold' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center transition border ${
                            isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{lvl.label}</span>
                        </div>
                        <span className={`text-[11px] font-medium ${isChecked ? 'text-purple-700 font-bold' : 'text-slate-400'}`}>
                          ({lvl.count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 3: Curriculum / Board */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setBoardOpen(!boardOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Curriculum / Board</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${boardOpen ? 'rotate-180 text-sky-600' : ''}`} />
              </button>

              {boardOpen && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {BOARDS.map((b) => {
                    const isSelected = selectedBoard === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBoard(isSelected ? '' : b.id)}
                        className={`cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 border ${
                          isSelected
                            ? 'bg-purple-50 text-purple-700 border-purple-400 font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 4: Minimum Salary Band */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSalaryOpen(!salaryOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Minimum CTC (LPA)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${salaryOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {salaryOpen && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {['3', '5', '8', '12'].map((sal) => {
                    const isSelected = minSalary === sal;
                    return (
                      <button
                        key={sal}
                        type="button"
                        onClick={() => setMinSalary(isSelected ? '' : sal)}
                        className={`cursor-pointer p-2 rounded-xl border text-center font-bold text-xs transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ₹{sal}+ LPA
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: JOB VACANCY CARDS LIST                                   */}
          {/* ======================================================================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-5">
            {isLoading && allJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-slate-100 shadow-sm">
                <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Scanning verified teaching opportunities...</p>
              </div>
            ) : allJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-100 shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No vacancies match your active filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing specific subject or teaching level filters to discover all verified teaching opportunities.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="cursor-pointer px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              allJobs.map((job, idx) => {
                const isSaved = savedJobIds.includes(job.id);

                // Alternate palette to match Card 1 (purple/orange), Card 2 (cyan), Card 3 (emerald) from mockup
                const cardTheme = idx % 3 === 0
                  ? {
                      cornerGlow: 'from-orange-100/70 via-amber-50/30 to-transparent',
                      salaryBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
                      applyBtn: 'bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25',
                      isFeatured: true
                    }
                  : idx % 3 === 1
                  ? {
                      cornerGlow: 'from-sky-100/70 via-cyan-50/30 to-transparent',
                      salaryBadge: 'bg-sky-50 text-sky-700 border-sky-200/80',
                      applyBtn: 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25',
                      isFeatured: false
                    }
                  : {
                      cornerGlow: 'from-emerald-100/70 via-teal-50/30 to-transparent',
                      salaryBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                      applyBtn: 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25',
                      isFeatured: false
                    };

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden space-y-4 group"
                  >
                    {/* Top Right Curved Gradient Flare Arc */}
                    <div className={`absolute top-0 right-0 w-48 h-32 bg-gradient-to-bl ${cardTheme.cornerGlow} rounded-tr-3xl pointer-events-none`} />

                    {/* Top Pill / Badge Row */}
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">
                        {job.teachingLevel} • {job.subject.toUpperCase()}
                      </span>

                      {cardTheme.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 rounded-full shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Header Row: Logo, Title & Salary Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                      
                      {/* Left: Emblem + Job Title + Subtitle */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src="/logo.jpeg"
                          alt="SikchaKhub"
                          className="w-12 h-12 rounded-2xl border border-amber-300/70 bg-white object-cover shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h3 
                            onClick={() => setActiveJobDetail(job)}
                            className="text-lg font-bold text-slate-900 font-serif leading-snug hover:text-sky-700 transition cursor-pointer"
                          >
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                            <span className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>SikchaKhub</span>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{job.city}, {job.state}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: CTC Badge + Bookmark Pill */}
                      <div className="flex items-center sm:items-start gap-2.5 justify-between sm:justify-end shrink-0">
                        <div className="text-left sm:text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold shadow-2xs border ${cardTheme.salaryBadge}`}>
                            <span>₹{job.minSalaryLPA} – ₹{job.maxSalaryLPA} LPA</span>
                            <Info className="w-3.5 h-3.5 opacity-70" />
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5 sm:text-right">
                            Annual Fixed + Benefits
                          </span>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job.id)}
                          className={`cursor-pointer p-2 rounded-xl border transition shadow-2xs ${
                            isSaved 
                              ? 'text-amber-600 bg-amber-50 border-amber-300' 
                              : 'text-slate-400 bg-white border-slate-200 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                          title={isSaved ? 'Saved Opening' : 'Bookmark Opening'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>

                    </div>

                    {/* Middle Specs Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10 text-xs">
                      {/* Experience */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50/80 text-purple-700 border border-purple-200/60 font-semibold shadow-2xs">
                        <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                        <span>{job.minExperienceYears}+ Yrs Required</span>
                      </span>

                      {/* Qualification */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50/80 text-sky-700 border border-sky-200/60 font-semibold shadow-2xs">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
                        <span>{job.requiredQualification || 'Post Graduate with B.Ed'}</span>
                      </span>

                      {/* Auto Screening Active */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 font-semibold shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Auto-Screening Active</span>
                      </span>
                    </div>

                    {/* Job Description Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 relative z-10">
                      {job.description}
                    </p>

                    {/* Card Footer: Metadata & Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                      
                      {/* Left: Deadline & Vacancies */}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: {job.deadline}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.vacanciesCount} Vacanc{job.vacanciesCount > 1 ? 'ies' : 'y'}</span>
                        </span>
                      </div>

                      {/* Right: View Details & Apply Now Buttons */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setActiveJobDetail(job)}
                          className="cursor-pointer flex-1 sm:flex-none px-5 py-2 rounded-full border border-sky-300 bg-white hover:bg-sky-50 text-sky-600 font-bold text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-2xs"
                        >
                          View Details
                        </button>

                        {appliedJobIds.has(job.id) ? (
                          <button
                            type="button"
                            disabled
                            className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Already Applied ✓</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyClick(job)}
                            className={`cursor-pointer flex-1 sm:flex-none px-6 py-2 rounded-full text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${cardTheme.applyBtn}`}
                          >
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </main>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOB DETAIL MODAL                                                       */}
      {/* ========================================================================= */}
      {activeJobDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpeg"
                  alt="SikchaKhub"
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-300/60 bg-white shrink-0 shadow-2xs"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/80">
                    {activeJobDetail.teachingLevel} • {activeJobDetail.board}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-serif">{activeJobDetail.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">SikchaKhub • {activeJobDetail.city}, {activeJobDetail.state}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setActiveJobDetail(null)} 
                className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Salary CTC</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{activeJobDetail.minSalaryLPA} - ₹{activeJobDetail.maxSalaryLPA} LPA</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Min Experience</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeJobDetail.minExperienceYears}+ Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeJobDetail.city}, {activeJobDetail.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Openings</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeJobDetail.vacanciesCount} Seats</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">Role Overview</h4>
                <p className="text-slate-600 leading-relaxed text-xs">{activeJobDetail.description}</p>
              </div>

              {activeJobDetail.responsibilities && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide">Key Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {activeJobDetail.responsibilities.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeJobDetail.benefits && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide">Institutional Benefits</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {activeJobDetail.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveJobDetail(null)}
                  className="cursor-pointer px-4 py-2 text-slate-600 font-bold hover:text-slate-900"
                >
                  Close
                </button>
                {appliedJobIds.has(activeJobDetail.id) ? (
                  <span className="px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Already Applied ✓</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const j = activeJobDetail;
                      setActiveJobDetail(null);
                      handleApplyClick(j);
                    }}
                    className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full shadow-md shadow-orange-500/25 transition active:scale-95"
                  >
                    Proceed to Quick Application ➔
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AUTHENTICATION REQUIRED MODAL                                          */}
      {/* ========================================================================= */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptJob(null);
        }}
        jobTitle={authPromptJob?.title}
        institutionName="SikchaKhub"
      />

      {/* ========================================================================= */}
      {/* 6. APPLY JOB MODAL                                                        */}
      {/* ========================================================================= */}
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