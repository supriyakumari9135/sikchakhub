import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  Sparkles, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface ApplicationDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  onOpenStageCorrection: (app: any) => void;
  onPreviewCv: (doc: any) => void;
}

export const ApplicationDossierModal: React.FC<ApplicationDossierModalProps> = ({
  isOpen,
  onClose,
  application,
  onOpenStageCorrection,
  onPreviewCv,
}) => {
  if (!isOpen || !application) return null;

  const score = application.score ?? 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-serif">{application.candidateName}</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                {application.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Application ID: {application.id} • Submitted on {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Job & Score Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Vacancy</span>
              <h4 className="text-sm font-bold text-slate-900">{application.jobTitle}</h4>
              <p className="text-xs text-brand-700 font-medium">{application.institutionName}</p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ATS Match Score</span>
                <span className="text-xl font-black text-slate-900 font-serif">{score}%</span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${
                score >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Candidate Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicant Contact</h4>
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{application.candidateEmail || 'Email not listed'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{application.candidatePhone || 'Phone not listed'}</span>
              </div>
            </div>
          </div>

          {/* Resume Vault Link */}
          {application.resumeUrl && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Resume</h4>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{application.resumeFileName || 'Resume.pdf'}</p>
                    <p className="text-[10px] text-slate-500">Applicant submitted document</p>
                  </div>
                </div>

                <button
                  onClick={() => onPreviewCv({
                    candidateName: application.candidateName,
                    candidateEmail: application.candidateEmail,
                    fileName: application.resumeFileName || 'Resume.pdf',
                    fileUrl: application.resumeUrl,
                    jobTitle: application.jobTitle,
                    atsScore: score,
                  })}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                >
                  Preview Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenStageCorrection(application);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Exceptional Stage Override</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface StageCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  onSaveStage: (applicationId: string, stage: string, reason: string) => Promise<void>;
}

export const StageCorrectionModal: React.FC<StageCorrectionModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveStage,
}) => {
  if (!isOpen || !application) return null;

  const [stage, setStage] = useState(application.stage || 'APPLIED');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSaving(true);
    try {
      await onSaveStage(application.id, stage, reason);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 bg-purple-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Exceptional Stage Override</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-900">
              Candidate: {application.candidateName}
            </p>
            <p className="text-slate-500">
              Job: {application.jobTitle} • Current Stage: <strong>{application.stage}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Corrected Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="APPLIED">APPLIED - Initial Submission</option>
              <option value="SCREENING">SCREENING - Under Evaluation</option>
              <option value="SHORTLISTED">SHORTLISTED - Qualified for Demo</option>
              <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED - Demo Class Set</option>
              <option value="SELECTED">SELECTED - Selected Candidate</option>
              <option value="REJECTED">REJECTED - Not Progressing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Administrative Reason (Mandatory for Audit Trail)
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain why this recruitment stage is being administratively updated..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !reason.trim()}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Commit Stage Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

