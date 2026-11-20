import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStage } from '@sikchakhub/shared-types';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../config/api';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Sparkles, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  Clock, 
  Save, 
  Award, 
  BookOpen,
  ExternalLink,
  Eye,
  UserCheck,
  Download
} from 'lucide-react';

interface CandidateMatchDrawerProps {
  application: JobApplication;
  onClose: () => void;
  onScheduleInterview: (app: JobApplication) => void;
  onStageChange: (appId: string, stage: ApplicationStage) => void;
}

export const CandidateMatchDrawer: React.FC<CandidateMatchDrawerProps> = ({
  application,
  onClose,
  onScheduleInterview,
  onStageChange,
}) => {
  const { token } = useAuth();
  const [stage, setStage] = useState<ApplicationStage>(application.stage);
  const [notes, setNotes] = useState(application.recruiterNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);
  const [showInlinePdf, setShowInlinePdf] = useState(false);
  const [shortlistSuccessNotice, setShortlistSuccessNotice] = useState(false);

  // Fetch full live application details from backend
  const { data: fullAppData } = useQuery({
    queryKey: ['single-application', application.id],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/v1/applications/${application.id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!application?.id && !!token,
  });

  const appRecord: any = fullAppData?.application || application;
  const teacher = appRecord.teacher || application.teacher;
  const profile = teacher?.profile;
  const matchResult = appRecord.matchResult || application.matchResult;

  const rawResumeUrl = appRecord.resumeUrl || application.resumeUrl || profile?.resumeUrl;
  const fullResumeUrl = rawResumeUrl ? (rawResumeUrl.startsWith('http') || rawResumeUrl.startsWith('data:') ? rawResumeUrl : apiUrl(rawResumeUrl)) : null;
  const resumeFileName = appRecord.resumeFileName || profile?.resumeFileName || 'Educator_Resume.pdf';

  const [blobResumeUrl, setBlobResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fullResumeUrl || !showInlinePdf) {
      setBlobResumeUrl(null);
      return;
    }

    if (fullResumeUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = fullResumeUrl.replace(/^data:application\/pdf;base64,/, '');
        const byteChars = atob(base64Data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobResumeUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        setBlobResumeUrl(fullResumeUrl);
        return;
      }
    }

    if (fullResumeUrl.startsWith('blob:')) {
      setBlobResumeUrl(fullResumeUrl);
      return;
    }

    const controller = new AbortController();
    fetch(fullResumeUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Fetch failed');
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setBlobResumeUrl(url);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setBlobResumeUrl(fullResumeUrl);
        }
      });

    return () => {
      controller.abort();
      setBlobResumeUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [fullResumeUrl, showInlinePdf]);

  const handleStageSelect = async (newStage: ApplicationStage) => {
    setStage(newStage);
    onStageChange(application.id, newStage);
    try {
      await fetch(apiUrl(`/api/v1/applications/${application.id}/stage`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await fetch(apiUrl(`/api/v1/applications/${application.id}/notes`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      setNoteSavedMessage(true);
      setTimeout(() => setNoteSavedMessage(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Candidate Screening & Evaluation
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <span>{teacher?.fullName || 'Candidate Profile'}</span>
              {matchResult && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  matchResult.overallScore >= 75
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {matchResult.overallScore}% MATCH
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Email: <strong>{teacher?.email}</strong> {appRecord.appliedAt && `• Applied: ${new Date(appRecord.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Profile Overview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <p className="text-xs text-slate-700 font-medium italic">
              "{profile?.headline || 'Educator Profile'}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.experienceYears || 0} Years Exp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{profile?.highestQualification || 'Degree not specified'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.currentCity || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.expectedSalaryLPA ? `Exp: ₹${profile.expectedSalaryLPA} LPA` : 'Salary not specified'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Notice: {profile?.noticePeriodDays ?? 30} days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                {fullResumeUrl ? (
                  <span className="text-emerald-700 font-bold">PDF CV Attached</span>
                ) : (
                  <span className="text-slate-400 font-normal">No CV uploaded</span>
                )}
              </div>
            </div>

            {/* Teaching Subjects */}
            {profile?.subjects && profile.subjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span>Subjects:</span>
                </span>
                {profile.subjects.map((sub: string) => (
                  <span key={sub} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Candidate CV / Resume (PDF) & Direct Shortlist Section */}
          <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                  PDF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {resumeFileName}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Verified Educator Curriculum Vitae (PDF)
                  </span>
                </div>
              </div>

              {stage === 'SHORTLISTED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Candidate Shortlisted</span>
                </span>
              ) : (
                <button
                  onClick={async () => {
                    await handleStageSelect('SHORTLISTED');
                    setShortlistSuccessNotice(true);
                    setTimeout(() => setShortlistSuccessNotice(false), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Direct Shortlist Candidate</span>
                </button>
              )}
            </div>

            {shortlistSuccessNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Candidate shortlisted directly from CV review!</span>
              </div>
            )}

            {fullResumeUrl ? (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={fullResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-sky-700 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                    <span>Open Full CV in New Tab</span>
                  </a>
                  <button
                    onClick={() => setShowInlinePdf(!showInlinePdf)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showInlinePdf ? 'Hide Inline Preview' : 'Preview CV Inline'}</span>
                  </button>
                </div>

                {showInlinePdf && (
                  <div className="rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 mt-2">
                    <iframe
                      src={blobResumeUrl || fullResumeUrl}
                      className="w-full h-96 bg-white"
                      title="Candidate CV Document"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span>No PDF document was attached by this candidate during submission.</span>
              </div>
            )}
          </div>

          {/* AI / Screening Score Breakdown */}
          {matchResult && (
            <div className="space-y-3 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-4 rounded-xl border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Automated Candidate Matching Analysis
                  </h4>
                </div>
                <span className="text-xs font-bold text-emerald-800">
                  Status: {matchResult.autoFilteredStatus}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-100">
                {matchResult.aiAnalysisSummary}
              </p>

              {/* Matched vs Missing Keywords */}
              {((matchResult.matchedKeywords && matchResult.matchedKeywords.length > 0) || (matchResult.missingKeywords && matchResult.missingKeywords.length > 0)) && (
                <div className="space-y-2 p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                  {matchResult.matchedKeywords && matchResult.matchedKeywords.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Matched Keywords ({matchResult.matchedKeywords.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.matchedKeywords.map((k: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.missingKeywords && matchResult.missingKeywords.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Missing Vacancy Keywords ({matchResult.missingKeywords.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missingKeywords.map((k: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Criteria comparison table */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-600">Screening Rules Evaluation:</span>
                <div className="space-y-1.5">
                  {matchResult.breakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">{item.criterion}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{item.scoreContribution} / {item.weight} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pl-6">
                        <span>Required: <strong>{String(item.required)}</strong></span>
                        <span>Candidate: <strong>{String(item.actual)}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-6 italic">
                        {item.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Custom Dynamic Questions & Answers */}
          {application.customAnswers && Object.keys(application.customAnswers).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                Candidate Responses to Custom Questions
              </h4>
              <div className="space-y-2">
                {Object.entries(application.customAnswers).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block">Question ({k}):</span>
                    <span className="text-slate-900 font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                Candidate Note / Cover Letter
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Recruiter Internal Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Recruiter Private Notes
              </h4>
              {noteSavedMessage && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add interview rubrics, demo class feedback, or salary expectations discussed with candidate..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3">
          {/* Recruitment Stage Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Stage:</span>
            <select
              value={stage}
              onChange={(e) => handleStageSelect(e.target.value as ApplicationStage)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="SELECTED">Selected / Offered</option>
              <option value="REJECTED">Rejected</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {stage !== 'SHORTLISTED' && (
              <button
                onClick={async () => {
                  await handleStageSelect('SHORTLISTED');
                  setShortlistSuccessNotice(true);
                  setTimeout(() => setShortlistSuccessNotice(false), 3000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Direct Shortlist</span>
              </button>
            )}

            <button
              onClick={() => onScheduleInterview(application)}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Interview Round</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
