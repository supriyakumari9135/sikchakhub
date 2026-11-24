import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Users, 
  CheckCircle2, 
  PauseCircle, 
  XCircle, 
  Edit2, 
  Loader2,
  Trash2
} from 'lucide-react';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  onEdit: (job: any) => void;
  onStatusChange: (jobId: string, status: string, reason?: string) => void;
  onDelete: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={job.institutionLogo || '/logo.jpeg'}
              alt={job.institutionName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-serif">{job.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  job.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : job.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : job.status === 'PAUSED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : job.status === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {job.status === 'PENDING_APPROVAL' ? 'Pending Admin Approval' : job.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {job.institutionName} • Job ID: {job.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(job)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Vacancy Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject & Level</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">{job.subject} ({job.teachingLevel})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary Range</span>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">₹{job.minSalaryLPA} - {job.maxSalaryLPA} LPA</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">{job.city || 'Remote / Pan-India'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applicants</span>
              <p className="text-xs font-semibold text-purple-700 mt-0.5">{job.totalApplicants || 0} Candidates</p>
            </div>
          </div>

          {/* Timing & Vacancies */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Open Positions: <strong>{job.vacanciesCount || 1}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Employment: <strong>{job.employmentType || 'FULL_TIME'}</strong></span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Description</h4>
              <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 whitespace-pre-line break-words leading-relaxed">
                {job.description.replace(/\t/g, ' ')}
              </p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Responsibilities</h4>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {job.responsibilities.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compensation & Benefits</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.benefits.map((b: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {job.status === 'PENDING_APPROVAL' ? (
              <>
                <button
                  onClick={() => onStatusChange(job.id, 'ACTIVE', 'Approved and published by Super Admin')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish Opening</span>
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt('Enter rejection reason for this job opening:', 'Does not meet institutional posting guidelines');
                    if (reason) onStatusChange(job.id, 'REJECTED', reason);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Opening</span>
                </button>
              </>
            ) : job.status === 'ACTIVE' ? (
              <button
                onClick={() => onStatusChange(job.id, 'PAUSED', 'Paused by super administrator')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1.5"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Pause Vacancy</span>
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(job.id, 'ACTIVE', 'Reactivated by super administrator')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish / Reactivate</span>
              </button>
            )}

            {job.status !== 'CLOSED' && (
              <button
                onClick={() => onStatusChange(job.id, 'CLOSED', 'Closed by administrator')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Close Vacancy</span>
              </button>
            )}

            <button
              onClick={() => onDelete(job.id)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>

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

interface JobEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  onSave: (jobId: string, updates: any) => Promise<void>;
}

export const JobEditModal: React.FC<JobEditModalProps> = ({
  isOpen,
  onClose,
  job,
  onSave,
}) => {
  if (!isOpen || !job) return null;

  const [title, setTitle] = useState(job.title || '');
  const [subject, setSubject] = useState(job.subject || '');
  const [teachingLevel, setTeachingLevel] = useState(job.teachingLevel || 'PGT');
  const [minSalaryLPA, setMinSalaryLPA] = useState(job.minSalaryLPA || 4);
  const [maxSalaryLPA, setMaxSalaryLPA] = useState(job.maxSalaryLPA || 8);
  const [vacanciesCount, setVacanciesCount] = useState(job.vacanciesCount || 1);
  const [status, setStatus] = useState(job.status || 'ACTIVE');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(job.id, {
        title,
        subject,
        teachingLevel,
        minSalaryLPA: Number(minSalaryLPA),
        maxSalaryLPA: Number(maxSalaryLPA),
        vacanciesCount: Number(vacanciesCount),
        status,
      });
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
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-serif">Edit Vacancy Details</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Teaching Level</label>
              <select
                value={teachingLevel}
                onChange={(e) => setTeachingLevel(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="PRT">PRT - Primary (1-5)</option>
                <option value="TGT">TGT - Middle (6-10)</option>
                <option value="PGT">PGT - Senior Secondary (11-12)</option>
                <option value="COACHING_JEE">IIT-JEE Faculty</option>
                <option value="COACHING_NEET">NEET Faculty</option>
                <option value="COACHING_JEE_NEET">JEE/NEET Faculty</option>
                <option value="PRINCIPAL">Principal / Vice Principal</option>
                <option value="COLLEGE_PROFESSOR">College Professor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Min Salary (LPA)</label>
              <input
                type="number"
                step="0.5"
                value={minSalaryLPA}
                onChange={(e) => setMinSalaryLPA(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Salary (LPA)</label>
              <input
                type="number"
                step="0.5"
                value={maxSalaryLPA}
                onChange={(e) => setMaxSalaryLPA(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vacancies Count</label>
              <input
                type="number"
                value={vacanciesCount}
                onChange={(e) => setVacanciesCount(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vacancy Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="ACTIVE">ACTIVE - Live on Board</option>
                <option value="PAUSED">PAUSED - Temporarily Hidden</option>
                <option value="CLOSED">CLOSED - Filled / Expired</option>
              </select>
            </div>
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
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

