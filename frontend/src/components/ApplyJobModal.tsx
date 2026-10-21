import React, { useState } from 'react';
import { JobVacancy, ApplicationMatchResult } from '@sikchakhub/shared-types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Sparkles, 
  Check, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApplyJobModalProps {
  job: JobVacancy;
  onClose: () => void;
  onAppliedSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, onClose, onAppliedSuccess }) => {
  const { user, profile, token } = useAuth();

  const [coverLetter, setCoverLetter] = useState(
    `Dear Hiring Committee at ${job.institution?.name || 'Institution'}, I am writing to express my enthusiastic interest in the ${job.title} position. With my background in ${job.subject} instruction and student mentorship, I am confident in my ability to contribute meaningfully to your academic objectives.`
  );
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<ApplicationMatchResult | null>(null);

  const handleCustomAnswerChange = (fieldId: string, value: any) => {
    setCustomAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Please log in as an educator to submit this application.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
          resumeUrl: profile?.resumeUrl || '/sample-resume.pdf',
          customAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMatchResult(data.application.matchResult);
        if (onAppliedSuccess) onAppliedSuccess();
      } else {
        setErrorMsg(data.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Structured Recruitment Form
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 font-serif line-clamp-1">{job.title}</h3>
            <p className="text-xs text-slate-500">{job.institution?.name} • {job.city}, {job.state}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success / Screening result state */}
          {matchResult ? (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your profile and responses were processed by SikshaHub's automated screening engine.
                </p>
              </div>

              {/* Match Score Card */}
              <div className="bg-gradient-to-br from-brand-50 via-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Deterministic Match Score</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    matchResult.overallScore >= 75
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {matchResult.overallScore}% MATCH
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  {matchResult.aiAnalysisSummary}
                </p>

                {/* Score breakdown chips */}
                <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                  <span className="text-[11px] font-semibold text-slate-600">Verification Criteria Breakdown:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {matchResult.breakdown.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-1.5">
                          {b.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 font-bold" />
                          )}
                          <span className="font-medium text-slate-700">{b.criterion}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          +{b.scoreContribution} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  to="/teacher-dashboard"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-brand-600 text-white text-xs font-semibold rounded-xl text-center hover:bg-brand-700 shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <span>Track in Teacher Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Candidate Info Overview */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {user?.fullName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{user?.fullName || 'Educator Applicant'}</h5>
                    <p className="text-[11px] text-slate-500">
                      {profile?.highestQualification || 'B.Ed / Masters'} • {profile?.experienceYears || 2} Years Experience
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <FileText className="w-3 h-3" />
                    CV Attached
                  </span>
                </div>
              </div>

              {/* Dynamic Custom Questions created by Employer */}
              {job.customFields && job.customFields.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="border-b border-slate-200 pb-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Position-Specific Screening Questions ({job.customFields.length})
                    </h4>
                  </div>

                  {job.customFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.fieldType === 'TEXT' && (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || 'Enter your response'}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                        />
                      )}

                      {field.fieldType === 'NUMBER' && (
                        <input
                          type="number"
                          required={field.required}
                          placeholder={field.placeholder || '0'}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(field.id, Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                        />
                      )}

                      {field.fieldType === 'YES_NO' && (
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={field.id}
                              value="Yes"
                              checked={customAnswers[field.id] === 'Yes'}
                              onChange={() => handleCustomAnswerChange(field.id, 'Yes')}
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={field.id}
                              value="No"
                              checked={customAnswers[field.id] === 'No'}
                              onChange={() => handleCustomAnswerChange(field.id, 'No')}
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      )}

                      {field.fieldType === 'SINGLE_SELECT' && (
                        <select
                          required={field.required}
                          value={customAnswers[field.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Note to Recruiter / Cover Letter
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  placeholder="Summarize your teaching philosophy and why you are a fit for this vacancy..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-2 transition disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Screening & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
