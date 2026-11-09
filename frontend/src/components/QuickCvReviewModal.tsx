import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStage } from '@sikchakhub/shared-types';
import { apiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Check, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Award,
  BookOpen,
  RotateCw,
  Loader2,
  Code2,
  Briefcase,
  GraduationCap,
  Layers
} from 'lucide-react';

interface QuickCvReviewModalProps {
  candidates: JobApplication[];
  currentIndex: number;
  onClose: () => void;
  onSelectCandidateIndex: (index: number) => void;
  onStageChange: (appId: string, stage: ApplicationStage) => void;
  onScheduleInterview: (app: JobApplication) => void;
  onCandidateUpdated?: (updatedCandidate: JobApplication) => void;
}

export const QuickCvReviewModal: React.FC<QuickCvReviewModalProps> = ({
  candidates,
  currentIndex,
  onClose,
  onSelectCandidateIndex,
  onStageChange,
  onScheduleInterview,
  onCandidateUpdated,
}) => {
  const { token } = useAuth();

  const currentCandidate = candidates[currentIndex];
  const [localMatchResult, setLocalMatchResult] = useState<any>(currentCandidate?.matchResult || null);
  const [notes, setNotes] = useState(currentCandidate?.recruiterNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanSuccessNotice, setRescanSuccessNotice] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'CV' | 'ATS'>('CV');

  // Keep local state in sync when candidate changes
  useEffect(() => {
    if (currentCandidate) {
      setNotes(currentCandidate.recruiterNotes || '');
      setLocalMatchResult(currentCandidate.matchResult || null);
    }
  }, [currentCandidate?.id, currentCandidate?.matchResult]);

  // Keyboard navigation: Left/Right arrows to move through top CVs, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < candidates.length - 1) {
        onSelectCandidateIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onSelectCandidateIndex(currentIndex - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, candidates.length, onSelectCandidateIndex, onClose]);

  if (!currentCandidate) return null;

  const teacher = currentCandidate.teacher;
  const profile = teacher?.profile;
  const matchResult = localMatchResult || currentCandidate.matchResult;
  const parsedResume = matchResult?.parsedResume;
  const score = matchResult?.overallScore ?? 70;

  const rawResumeUrl = currentCandidate.resumeUrl || profile?.resumeUrl;
  const fullCvUrl = rawResumeUrl
    ? (rawResumeUrl.startsWith('http') || rawResumeUrl.startsWith('data:') ? rawResumeUrl : apiUrl(rawResumeUrl))
    : null;
  const cvFileName = currentCandidate.resumeFileName || profile?.resumeFileName || 'Educator_Resume.pdf';

  // Dynamic ATS Grade Badge
  const getGradeInfo = (atsScore: number) => {
    if (atsScore >= 80) {
      return {
        label: 'TOP TIER MATCH',
        sublabel: 'Exceeds Vacancy Criteria',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        strokeColor: '#10b981',
        textColor: 'text-emerald-400',
        bgPill: 'bg-emerald-600',
      };
    }
    if (atsScore >= 60) {
      return {
        label: 'POTENTIAL MATCH',
        sublabel: 'Suitable Foundation / Domain Overlap',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        strokeColor: '#0ea5e9',
        textColor: 'text-sky-400',
        bgPill: 'bg-sky-600',
      };
    }
    return {
      label: 'DOMAIN / SKILL GAP',
      sublabel: 'Missing Essential Specialization',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      strokeColor: '#f59e0b',
      textColor: 'text-amber-400',
      bgPill: 'bg-amber-500',
    };
  };

  const gradeInfo = getGradeInfo(score);

  // SVG Circular progress gauge calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // 1-Click On-Demand ATS Re-Scan
  const handleRescanAts = async () => {
    if (!currentCandidate.id || isRescanning) return;
    setIsRescanning(true);
    setRescanSuccessNotice(null);

    try {
      const res = await fetch(apiUrl(`/api/v1/applications/${currentCandidate.id}/rescan-ats`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.matchResult) {
        setLocalMatchResult(data.matchResult);
        currentCandidate.matchResult = data.matchResult;
        if (onCandidateUpdated) {
          onCandidateUpdated({ ...currentCandidate, matchResult: data.matchResult });
        }
        setRescanSuccessNotice(`ATS score refreshed (${data.matchResult.overallScore}%) from resume!`);
        setTimeout(() => setRescanSuccessNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to rescan ATS:', err);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await fetch(apiUrl(`/api/v1/applications/${currentCandidate.id}/notes`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const isShortlisted = currentCandidate.stage === 'SHORTLISTED';

  // Matched and Missing Keywords
  const matchedKeywords: string[] = matchResult?.matchedKeywords || [];
  const missingKeywords: string[] = matchResult?.missingKeywords || [];

  // Candidate Extracted Credentials
  const candidateDegree = parsedResume?.degree || profile?.highestQualification || 'Graduate Degree';
  const candidateInstitution = parsedResume?.institutionName?.replace(/^(?:Education|Institution)\s*[\n:]*\s*/i, '').replace(/[\n\r]+/g, ' ') || 'Accredited Institution';
  const candidateDomain = parsedResume?.primaryDomain || profile?.subjects?.[0] || 'Technical Education';
  const candidateExperience = parsedResume?.experienceYears ? `${parsedResume.experienceYears} Years` : `${profile?.experienceYears ?? 0} Years`;
  const candidateEmail = parsedResume?.email || teacher?.email || 'email not listed';
  const candidatePhone = parsedResume?.phone || teacher?.phone;
  const candidateSkills: string[] = parsedResume?.skills || profile?.skills || [];
  const candidateProjects: string[] = parsedResume?.projects || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[96vh] sm:h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          
          {/* Candidate Info + ATS Ranking */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-2xs shrink-0">
              Rank #{currentIndex + 1}
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline shrink-0">
              of {candidates.length} Applicants
            </span>

            <div className="h-4 w-px bg-slate-300 hidden sm:block shrink-0" />

            <div className="flex items-center gap-1.5 truncate max-w-[170px] sm:max-w-xs">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {teacher?.fullName || parsedResume?.fullName || 'Educator Candidate'}
              </span>
            </div>

            {/* ATS Score Dynamic Pill */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-2xs shrink-0 text-white ${gradeInfo.bgPill}`}>
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>{score}% ATS</span>
              <span className="hidden md:inline font-bold opacity-90">• {gradeInfo.label}</span>
            </span>
          </div>

          {/* Controls: Prev / Next / Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onSelectCandidateIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:pointer-events-none text-xs font-bold text-slate-700 flex items-center gap-1 transition shadow-2xs active:scale-95"
              title="Previous CV (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <button
              onClick={() => onSelectCandidateIndex(currentIndex + 1)}
              disabled={currentIndex >= candidates.length - 1}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:pointer-events-none text-xs font-bold text-slate-700 flex items-center gap-1 transition shadow-2xs active:scale-95"
              title="Next CV (Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Segmented Tab Switcher (< lg screens) */}
        <div className="lg:hidden flex items-center border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('CV')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'CV' 
                ? 'bg-sky-600 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-white bg-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF CV Document</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('ATS')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'ATS' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-white bg-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ATS Match ({score}%)</span>
          </button>
        </div>

        {/* Main Split Layout: Left PDF Viewer / Right ATS Analysis */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
          
          {/* LEFT COLUMN: PDF Resume Previewer */}
          <div className={`flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-100/80 p-2.5 sm:p-4 ${
            mobileTab === 'CV' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* CV Title Bar + Actions */}
            <div className="flex items-center justify-between pb-2.5 gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 min-w-0">
                <FileText className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-md">{cvFileName}</span>
                {parsedResume && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span>PDF Parsed</span>
                  </span>
                )}
              </div>

              {fullCvUrl && (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <a
                    href={fullCvUrl}
                    download={cvFileName}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <a
                    href={fullCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1 transition shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3 text-sky-600" />
                    <span>Open in Tab</span>
                  </a>
                </div>
              )}
            </div>

            {/* Embedded PDF Document Container */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
              {fullCvUrl ? (
                <iframe
                  src={`${fullCvUrl}#toolbar=0&navpanes=0`}
                  title="Candidate PDF Resume"
                  className="w-full h-full border-0 rounded-2xl bg-white"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">No PDF Document Attached</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Candidate applied with their digital educator profile. See the profile summary and verification criteria on the right.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Modern ATS Match Analysis & Recruiter Evaluation */}
          <div className={`w-full lg:w-[480px] shrink-0 overflow-y-auto p-4 sm:p-5 space-y-5 bg-white ${
            mobileTab === 'ATS' ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* 1. Recruiter Decision Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Instant Recruiter Decision
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Stage: <strong>{currentCandidate.stage}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {isShortlisted ? (
                  <div className="col-span-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Shortlisted ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onStageChange(currentCandidate.id, 'SHORTLISTED')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Shortlist Candidate</span>
                  </button>
                )}

                <button
                  onClick={() => onScheduleInterview(currentCandidate)}
                  className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Demo</span>
                </button>
              </div>
            </div>

            {/* 2. Upgraded Modern ATS Match Analysis Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-slate-700/60 space-y-4">
              
              {/* Card Header: Score Gauge + Grade Badge + 1-Click Re-scan Button */}
              <div className="flex items-center justify-between gap-3">
                
                {/* Left: Circular SVG Score Gauge */}
                <div className="flex items-center gap-3">
                  <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                    <svg className="w-18 h-18 -rotate-90" viewBox="0 0 80 80">
                      {/* Background Track Circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="6"
                      />
                      {/* Animated Dynamic Progress Ring */}
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke={gradeInfo.strokeColor}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    {/* Centered Score Number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-xl font-black leading-none ${gradeInfo.textColor}`}>
                        {score}%
                      </span>
                      <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                        ATS
                      </span>
                    </div>
                  </div>

                  {/* Header Titles */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        ATS Match Analysis
                      </h4>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${gradeInfo.badgeColor}`}>
                        <span>{gradeInfo.label}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1 leading-tight">
                      {gradeInfo.sublabel}
                    </p>
                  </div>
                </div>

                {/* Right: 1-Click Re-scan ATS Button */}
                <div className="shrink-0">
                  <button
                    onClick={handleRescanAts}
                    disabled={isRescanning}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                    title="Extract CV text and recalculate genuine ATS keyword match"
                  >
                    {isRescanning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span className="hidden sm:inline">Scanning...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-3 h-3 text-sky-300" />
                        <span>Re-scan ATS</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Re-scan notice alert */}
              {rescanSuccessNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{rescanSuccessNotice}</span>
                </div>
              )}

              {/* AI Analysis Summary Statement */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Screening Evaluation
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {matchResult?.aiAnalysisSummary || 'Candidate resume scanned and cross-referenced with position qualifications and syllabus requirements.'}
                </p>
              </div>

              {/* KEYWORD MATCH INTELLIGENCE (Matched vs Missing Chips) */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ATS Keyword Intelligence
                </span>

                {/* Matched Keywords */}
                {matchedKeywords.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Verified Matched Keywords ({matchedKeywords.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing / Required Keywords */}
                {missingKeywords.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-rose-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Missing Vacancy Specializations ({missingKeywords.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {missingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-200 border border-rose-500/25"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchedKeywords.length === 0 && missingKeywords.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    Click "Re-scan ATS" to run deep keyword extraction from the uploaded PDF document.
                  </p>
                )}
              </div>

            </div>

            {/* 3. Verification Criteria Breakdown */}
            {matchResult?.breakdown && matchResult.breakdown.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Scoring Criteria Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    5 Dimensions Evaluated
                  </span>
                </div>
                <div className="space-y-2">
                  {matchResult.breakdown.map((item: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800 truncate">
                            {item.criterion}
                          </span>
                        </div>
                        <span className={`font-black text-xs shrink-0 ${
                          item.scoreContribution > 0 ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          +{item.scoreContribution} pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pl-6">
                        <span>Required: <strong className="text-slate-700">{String(item.required)}</strong></span>
                        <span className="truncate max-w-[170px]">Found: <strong className="text-slate-700">{String(item.actual || 'Not in CV')}</strong></span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-600 pl-6 pt-0.5 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Candidate Profile & Extracted CV Details */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Candidate Profile & CV Credentials
                </span>
                {parsedResume && (
                  <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    Auto-Extracted from CV
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Degree */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span>Degree</span>
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5" title={candidateDegree}>
                    {candidateDegree}
                  </span>
                </div>

                {/* Institution */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span>Institution</span>
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5" title={candidateInstitution}>
                    {candidateInstitution}
                  </span>
                </div>

                {/* Domain */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>Primary Domain</span>
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5" title={candidateDomain}>
                    {candidateDomain}
                  </span>
                </div>

                {/* Experience */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    <span>Experience</span>
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {candidateExperience}
                  </span>
                </div>

                {/* Previous School */}
                {Boolean((profile as any)?.previousSchool) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      <span>Previous School</span>
                    </span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5" title={(profile as any)?.previousSchool}>
                      {(profile as any)?.previousSchool}
                    </span>
                  </div>
                )}

                {/* Board Experience */}
                {Boolean((profile as any)?.boards?.length) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-400" />
                      <span>Board Experience</span>
                    </span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {(profile as any).boards.join(', ')}
                    </span>
                  </div>
                )}

                {/* Certifications (B.Ed, CTET, STET) */}
                {Boolean((profile as any)?.certifications?.length) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      <span>Certifications</span>
                    </span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {(profile as any).certifications.join(', ')}
                    </span>
                  </div>
                )}

                {/* Joining Availability & Expected */}
                {Boolean((profile as any)?.joiningAvailability || (profile as any)?.expectedSalary) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>Availability & Salary</span>
                    </span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {[(profile as any)?.joiningAvailability, (profile as any)?.expectedSalary].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Skills from CV */}
              {candidateSkills.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-slate-500" />
                    <span>Skills Extracted from CV ({candidateSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateSkills.slice(0, 12).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                    {candidateSkills.length > 12 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600">
                        +{candidateSkills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Projects from CV */}
              {candidateProjects.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                    <Award className="w-3 h-3 text-slate-500" />
                    <span>Verified Projects ({candidateProjects.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateProjects.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info: Email & Phone */}
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 text-slate-700">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="font-medium truncate">{candidateEmail}</span>
                  </div>
                  {candidateEmail && candidateEmail.includes('@') && (
                    <a
                      href={`mailto:${candidateEmail}`}
                      className="text-[10px] font-bold text-sky-700 hover:underline shrink-0"
                    >
                      Email
                    </a>
                  )}
                </div>

                {candidatePhone && (
                  <div className="flex items-center justify-between gap-2 text-slate-700 pt-1 border-t border-sky-200/60">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-medium">{candidatePhone}</span>
                    </div>
                    <a
                      href={`tel:${candidatePhone.replace(/[^\d+]/g, '')}`}
                      className="text-[10px] font-bold text-sky-700 hover:underline shrink-0"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Recruiter Notes */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Recruiter Evaluation Notes</span>
                {notesSavedNotice && (
                  <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">
                    Notes Saved! ✓
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private evaluation notes about demo class, subject knowledge, communication skills..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 active:scale-95 shadow-2xs"
              >
                {isSavingNotes ? 'Saving...' : 'Save Note'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
