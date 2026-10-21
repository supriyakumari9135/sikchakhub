import React, { useState } from 'react';
import { JobApplication, ApplicationStage } from '@sikchakhub/shared-types';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  BookOpen
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

  // Fetch full live application details from backend
  const { data: fullAppData } = useQuery({
    queryKey: ['single-application', application.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/applications/${application.id}`, {
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

  const handleStageSelect = async (newStage: ApplicationStage) => {
    setStage(newStage);
    onStageChange(application.id, newStage);
    try {
      await fetch(`/api/v1/applications/${application.id}/stage`, {
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
      await fetch(`/api/v1/applications/${application.id}/notes`, {
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
                <span className="truncate">{profile?.highestQualification || 'B.Ed'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.currentCity || 'India'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Exp: ₹{profile?.expectedSalaryLPA || '8'} LPA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Notice: {profile?.noticePeriodDays || 30} days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <a
                  href={appRecord.resumeUrl || application.resumeUrl || '/sample-resume.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 font-semibold underline hover:text-sky-700"
                >
                  View CV Resume
                </a>
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
