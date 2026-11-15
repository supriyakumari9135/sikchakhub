import React, { useEffect } from 'react';
import { JobVacancy } from '../types';
import { 
  X, 
  MapPin, 
  CheckCircle, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Clock
} from 'lucide-react';

interface JobDetailModalProps {
  job: JobVacancy | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobVacancy) => void;
  isApplied: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  isApplied,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-sky-100 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-sky-100 flex items-start justify-between bg-gradient-to-r from-sky-50/70 via-white to-blue-50/50">
          <div className="flex items-start gap-3.5">
            <img
              src="/logo.jpeg"
              alt="SikchaKhub"
              className="w-13 h-13 rounded-2xl object-cover border border-sky-200/90 bg-white shrink-0 shadow-xs"
            />
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {job.teachingLevel}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {job.board}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Subject: {job.subject}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif leading-tight">
                {job.title}
              </h2>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span>SikchaKhub</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline-block" />
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span>{job.city}, {job.state}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-90 shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Quick Specifications Grid */}
          <div className="bg-sky-50/50 rounded-2xl p-4 sm:p-5 border border-sky-100/90 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Offered CTC</span>
              <span className="font-extrabold text-emerald-600 text-sm sm:text-base">
                ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
              </span>
              <span className="text-[10px] text-slate-500 block">Annual Fixed + Perks</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Min Experience</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {job.minExperienceYears}+ Years
              </span>
              <span className="text-[10px] text-slate-500 block">
                {job.maxExperienceYears ? `Up to ${job.maxExperienceYears} Yrs` : 'Relevant teaching'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Vacancies</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {job.vacanciesCount} {job.vacanciesCount > 1 ? 'Openings' : 'Opening'}
              </span>
              <span className="text-[10px] text-slate-500 block">Active Intake</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Employment</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {job.employmentType ? job.employmentType.replace('_', ' ') : 'Full Time'}
              </span>
              <span className="text-[10px] text-slate-500 block">Direct School Hire</span>
            </div>
          </div>

          {/* Academic Criteria Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-sky-100 bg-white flex items-start gap-2.5 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Qualification</span>
                <span className="font-semibold text-slate-800">
                  {job.requiredQualification || 'Post Graduate / Relevant Degree with B.Ed'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-sky-100 bg-white flex items-start gap-2.5 shadow-2xs">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Deadline</span>
                <span className="font-semibold text-slate-800">
                  {job.deadline ? job.deadline : 'Immediate Interview / Ongoing'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Screening Badge */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">AI-Powered Syllabus Matching Active</span>
                <span className="text-emerald-800 text-[11px]">
                  Applications are verified directly against syllabus requirements with ~72h shortlist turnaround.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
              Verified Opening
            </span>
          </div>

          {/* Role Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span>Job Description & Role Overview</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Key Responsibilities & Expectations</span>
              </h4>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Institutional Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Institutional Benefits & Perks</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-800">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zero Agency Disclaimer */}
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Direct Institution Recruitment • 100% Free for Educators • No Agency Charges</span>
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-sky-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all duration-200 active:scale-95"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {isApplied ? (
              <div className="px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Already Applied ✓</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onApply(job)}
                className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <span>Quick Apply</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

