import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Filter, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  Building2, 
  X, 
  SlidersHorizontal,
  Check,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { JobVacancy } from '@sikchakhub/shared-types';
import { ApplyJobModal } from '../components/ApplyJobModal';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('teachingLevel') || '');
  const [selectedBoard, setSelectedBoard] = useState(searchParams.get('board') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobVacancy | null>(null);
  const [activeJobDetail, setActiveJobDetail] = useState<JobVacancy | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch jobs with active query params
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', keyword, selectedCity, selectedSubject, selectedLevel, selectedBoard, minSalary],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (keyword) params.append('q', keyword);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedLevel) params.append('teachingLevel', selectedLevel);
      if (selectedBoard) params.append('board', selectedBoard);
      if (minSalary) params.append('minSalary', minSalary);

      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      return res.json();
    },
  });

  const jobs: JobVacancy[] = data?.jobs || [];

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCity('');
    setSelectedSubject('');
    setSelectedLevel('');
    setSelectedBoard('');
    setMinSalary('');
    setSearchParams({});
  };

  const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Artificial Intelligence', 'Commerce'];
  const LEVELS = [
    { value: 'COACHING_JEE', label: 'IIT-JEE Faculty' },
    { value: 'COACHING_NEET', label: 'NEET Medical Faculty' },
    { value: 'PGT', label: 'PGT (Grades 11-12)' },
    { value: 'TGT', label: 'TGT (Grades 6-10)' },
    { value: 'PRT', label: 'PRT (Grades 1-5)' },
    { value: 'COLLEGE_PROFESSOR', label: 'College / University' },
  ];
  const BOARDS = ['CBSE', 'ICSE', 'CAMBRIDGE', 'IB', 'OTHER'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 w-full">
              <Search className="w-4 h-4 text-brand-600 shrink-0" />
              <input
                type="text"
                placeholder="Search by job title, keywords, or institution..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-hidden"
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 w-full md:w-64">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <input
                type="text"
                placeholder="City (Kota, Delhi, Pune...)"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-hidden"
              />
              {selectedCity && (
                <button onClick={() => setSelectedCity('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden w-full py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters ({[selectedSubject, selectedLevel, selectedBoard, minSalary].filter(Boolean).length})</span>
            </button>
          </div>

          {/* Quick Active Filter Pills */}
          {(selectedSubject || selectedLevel || selectedBoard || minSalary || selectedCity) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Active filters:</span>
              {selectedSubject && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs">
                  Subject: {selectedSubject}
                  <button onClick={() => setSelectedSubject('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs">
                  Level: {selectedLevel}
                  <button onClick={() => setSelectedLevel('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBoard && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs">
                  Board: {selectedBoard}
                  <button onClick={() => setSelectedBoard('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {minSalary && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs">
                  Min ₹{minSalary} LPA
                  <button onClick={() => setMinSalary('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main 2-Column Discovery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Filter Sidebar (Desktop) */}
          <aside className={`lg:block bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Filter Vacancies</h3>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Reset
              </button>
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Subject</label>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(selectedSubject === sub ? '' : sub)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                      selectedSubject === sub
                        ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub}</span>
                    {selectedSubject === sub && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Teaching Level */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Teaching Level</label>
              <div className="space-y-1">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setSelectedLevel(selectedLevel === lvl.value ? '' : lvl.value)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                      selectedLevel === lvl.value
                        ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lvl.label}</span>
                    {selectedLevel === lvl.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Board / Curriculum */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Curriculum / Board</label>
              <div className="flex flex-wrap gap-1.5">
                {BOARDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBoard(selectedBoard === b ? '' : b)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition ${
                      selectedBoard === b
                        ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Salary */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Minimum Salary (LPA)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['5', '8', '12', '18'].map((sal) => (
                  <button
                    key={sal}
                    type="button"
                    onClick={() => setMinSalary(minSalary === sal ? '' : sal)}
                    className={`p-2 rounded-lg border text-center font-semibold transition ${
                      minSalary === sal
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ₹{sal}+ LPA
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Job Cards List */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong>{jobs.length}</strong> matching vacancies</span>
              <span>Sorted by Recruitment Relevance</span>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 space-y-2 border border-slate-100">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium">Scanning verified openings...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-100">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No vacancies match your current filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your subject, city, or curriculum filters to discover more educator opportunities.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 hover:border-brand-400 hover:shadow-md transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={job.institution?.logoUrl || '/logo.jpeg'}
                        alt={job.institution?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-white"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {job.teachingLevel} • {job.board}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 font-serif mt-1 hover:text-brand-700 transition">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {job.institution?.name} • <span className="text-slate-500">{job.city}, {job.state}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 block font-serif">
                        ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Annual Fixed + Benefits</span>
                    </div>
                  </div>

                  {/* Badges / Specs */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {job.minExperienceYears}+ Yrs Required
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {job.requiredQualification}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Auto-Screening Active
                    </span>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  {/* Footer CTAs */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline: {job.deadline}</span>
                      <span>•</span>
                      <span>{job.vacanciesCount} Vacanc{job.vacanciesCount > 1 ? 'ies' : 'y'}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setActiveJobDetail(job)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedJobForApply(job)}
                        className="flex-1 sm:flex-none px-5 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-2xs transition"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      </div>

      {/* Slideover / Modal for Job Full Detail */}
      {activeJobDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={activeJobDetail.institution?.logoUrl || '/logo.jpeg'}
                  alt={activeJobDetail.institution?.name}
                  className="w-11 h-11 rounded-xl object-cover border border-amber-300/40 bg-white shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {activeJobDetail.teachingLevel} • {activeJobDetail.board}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5 font-serif">{activeJobDetail.title}</h3>
                  <p className="text-xs text-slate-500">{activeJobDetail.institution?.name} • {activeJobDetail.city}</p>
                </div>
              </div>
              <button onClick={() => setActiveJobDetail(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Salary CTC</span>
                  <span className="font-bold text-slate-900">₹{activeJobDetail.minSalaryLPA} - ₹{activeJobDetail.maxSalaryLPA} LPA</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Min Experience</span>
                  <span className="font-bold text-slate-900">{activeJobDetail.minExperienceYears}+ Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-bold text-slate-900">{activeJobDetail.city}, {activeJobDetail.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vacancies</span>
                  <span className="font-bold text-slate-900">{activeJobDetail.vacanciesCount} Openings</span>
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveJobDetail(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const j = activeJobDetail;
                    setActiveJobDetail(null);
                    setSelectedJobForApply(j);
                  }}
                  className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700"
                >
                  Proceed to Structured Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
