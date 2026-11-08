import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ReviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any | null;
  onResolve: (reportId: string, status: 'RESOLVED' | 'DISMISSED' | 'UNDER_REVIEW', resolutionNotes: string) => Promise<void>;
}

export const ReviewReportModal: React.FC<ReviewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onResolve,
}) => {
  if (!isOpen || !report) return null;

  const [resolutionNotes, setResolutionNotes] = useState(report.resolutionNotes || '');
  const [status, setStatus] = useState<'RESOLVED' | 'DISMISSED' | 'UNDER_REVIEW'>(report.status === 'PENDING' ? 'RESOLVED' : report.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onResolve(report.id, status, resolutionNotes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Investigate Moderation Report</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Flagged Target</span>
              <span className="text-amber-700">{report.targetType}</span>
            </div>
            <p className="font-bold text-slate-900">{report.targetTitle}</p>
            <p className="text-slate-500">Reported by: <strong>{report.reporterEmail}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Violation Reason</label>
            <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
              {report.reason}
            </p>
          </div>

          {report.details && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Details & Evidence</label>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {report.details}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moderation Decision</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="RESOLVED">RESOLVED - Action Taken / Policy Enforced</option>
              <option value="DISMISSED">DISMISSED - Invalid / Safe Report</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW - Escalated for Further Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resolution Audit Notes</label>
            <textarea
              rows={3}
              required
              placeholder="Record notes on what investigation was performed..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Commit Resolution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

