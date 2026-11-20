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
  Clock,
  BadgeCheck,
  IndianRupee,
  Building2,
  FileText
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

  // Format Teaching Level cleanly
  const formatLevel = (level: string) => {
    if (!level) return 'Faculty';
    if (level === 'COACHING_NEET') return 'NEET Coaching';
    if (level === 'COACHING_JEE') return 'IIT-JEE Coaching';
    if (level === 'COACHING_FOUNDATION') return 'Foundation Coaching';
    return level.replace('_', ' ');
  };

  // Format Employment Type cleanly
  const formatEmployment = (type?: string) => {
    if (!type) return 'Full Time';
    return type.replace('_', ' ');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/90 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-blue-50/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            {/* Institution / Brand Logo Container with strict dimensions */}
            <div className="w-13 h-13 min-w-[52px] min-h-[52px] max-w-[52px] max-h-[52px] sm:w-14 sm:h-14 sm:min-w-[56px] sm:min-h-[56px] sm:max-w-[56px] sm:max-h-[56px] rounded-2xl overflow-hidden border border-sky-200/80 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/logo.jpeg"
                alt={job.institution?.name || 'SikchaKhub'}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Category Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/80">
                  {formatLevel(job.teachingLevel)}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {job.board}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Subject: {job.subject}
                </span>
                {job.department && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hidden sm:inline-block">
                    {job.department}
                  </span>
                )}
              </div>

              {/* Vacancy Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif leading-tight">
                {job.title}
              </h2>

              {/* Institution and Location */}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span>{job.institution?.name || 'SikchaKhub Partner Institution'}</span>
                  <BadgeCheck className="w-4 h-4 text-emerald-500 inline-block shrink-0" />
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{job.city}, {job.state}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-90 shrink-0 ml-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Quick Specifications 4-Column Grid */}
          <div className="bg-gradient-to-br from-sky-50/70 via-slate-50 to-blue-50/40 rounded-2xl p-4 sm:p-5 border border-sky-100/90 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 shadow-2xs">
            <div className="bg-white/80 p-3 rounded-xl border border-sky-100/60 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Offered CTC</span>
              <span className="font-extrabold text-emerald-600 text-sm sm:text-base block">
                ₹{job.minSalaryLPA} - ₹{job.maxSalaryLPA} LPA
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Annual Fixed + Perks</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-sky-100/60 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Min Experience</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                {job.minExperienceYears}+ Years
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {job.maxExperienceYears ? `Up to ${job.maxExperienceYears} Yrs` : 'Relevant teaching'}
              </span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-sky-100/60 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Vacancies</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                {job.vacanciesCount} {job.vacanciesCount > 1 ? 'Openings' : 'Opening'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Active Hiring Intake</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-sky-100/60 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Employment</span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">
                {formatEmployment(job.employmentType)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Direct School Hire</span>
            </div>
          </div>

          {/* Academic Criteria & Application Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Qualification</span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm block mt-0.5">
                  {job.requiredQualification || 'Post Graduate / Relevant Degree with B.Ed'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Deadline</span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm block mt-0.5">
                  {job.deadline ? job.deadline : 'Immediate Interview / Ongoing'}
                </span>
              </div>
            </div>
          </div>

          {/* AI-Powered Fast Track Badge */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-xs sm:text-sm block">AI-Powered Syllabus Matching Active</span>
                <span className="text-emerald-800 text-[11px] leading-relaxed block mt-0.5">
                  Applications are verified directly against syllabus requirements with fast-track shortlist review within 48-72 hours.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200 self-start sm:self-center">
              Verified Opening
            </span>
          </div>

          {/* Role Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span>Job Description & Role Overview</span>
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/70 whitespace-pre-line shadow-2xs">
              {job.description || 'No detailed description provided for this opening.'}
            </div>
          </div>

          {/* Responsibilities (if available) */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Key Responsibilities & Expectations</span>
              </h4>
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2.5 shadow-2xs">
                {job.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institutional Benefits (if available) */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Institutional Benefits & Perks</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {job.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-slate-800 shadow-2xs">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Banner */}
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Direct Institution Recruitment • 100% Free for Educators • No Agency Charges</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all duration-200 active:scale-95"
          >
            Close
          </button>

          {isApplied ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle className="w-4 h-4" />
              <span>Application Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="cursor-pointer inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Quick Apply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
