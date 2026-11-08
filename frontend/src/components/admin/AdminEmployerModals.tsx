import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Briefcase, 
  Edit2, 
  Loader2 
} from 'lucide-react';

interface EmployerDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onEdit: (employer: any) => void;
  onVerify: (institutionId: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', notes?: string) => void;
}

export const EmployerDossierModal: React.FC<EmployerDossierModalProps> = ({
  isOpen,
  onClose,
  employer,
  onEdit,
  onVerify,
}) => {
  if (!isOpen || !employer) return null;

  const jobs = employer.jobs || [];

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
              src={employer.logoUrl || '/logo.jpeg'}
              alt={employer.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-serif">{employer.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  employer.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : employer.verificationStatus === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {employer.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {employer.type} • Institution ID: {employer.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(employer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Institutional Info & Representative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campus Details</h4>
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{employer.address}, {employer.city}, {employer.state} - {employer.pincode}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <FileCheck2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Affiliation: <strong>{employer.affiliationNumber || 'Pending verification'}</strong></span>
              </div>
              {employer.website && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <a href={employer.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    {employer.website}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Authorized Recruiter</h4>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-semibold text-slate-900">{employer.ownerName || employer.owner?.fullName || 'Representative'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{employer.ownerEmail || employer.owner?.email || 'Email not listed'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{employer.ownerPhone || employer.owner?.phone || 'Phone not listed'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {employer.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institution Profile</h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {employer.description}
              </p>
            </div>
          )}

          {/* Verification Notes */}
          {employer.verificationNotes && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <strong>Admin Compliance Note:</strong> {employer.verificationNotes}
            </div>
          )}

          {/* Published Vacancies */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vacancies Posted ({employer.totalJobs || jobs.length})
            </h4>

            {jobs.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No job postings published by this employer yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Subject / Level</th>
                      <th className="py-2.5 px-3">Salary</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {jobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{job.title}</td>
                        <td className="py-2.5 px-3">{job.subject} ({job.teachingLevel})</td>
                        <td className="py-2.5 px-3">{job.minSalaryLPA}-{job.maxSalaryLPA} LPA</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {employer.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={() => onVerify(employer.id, 'VERIFIED')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Approve</span>
              </button>
            )}

            {employer.verificationStatus !== 'SUSPENDED' && (
              <button
                onClick={() => onVerify(employer.id, 'SUSPENDED', 'Administratively suspended')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Suspend Institution</span>
              </button>
            )}
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

interface EmployerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onSave: (institutionId: string, updates: any) => Promise<void>;
}

export const EmployerEditModal: React.FC<EmployerEditModalProps> = ({
  isOpen,
  onClose,
  employer,
  onSave,
}) => {
  if (!isOpen || !employer) return null;

  const [name, setName] = useState(employer.name || '');
  const [type, setType] = useState(employer.type || 'SCHOOL');
  const [website, setWebsite] = useState(employer.website || '');
  const [affiliationNumber, setAffiliationNumber] = useState(employer.affiliationNumber || '');
  const [address, setAddress] = useState(employer.address || '');
  const [city, setCity] = useState(employer.city || '');
  const [state, setState] = useState(employer.state || '');
  const [pincode, setPincode] = useState(employer.pincode || '');
  const [description, setDescription] = useState(employer.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(employer.id, {
        name,
        type,
        website,
        affiliationNumber,
        address,
        city,
        state,
        pincode,
        description,
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
          <h3 className="text-base font-bold text-slate-900 font-serif">Edit Institution Profile</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Institution Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Institution Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="SCHOOL">K-12 School</option>
                <option value="COACHING_INSTITUTE">Coaching Institute / Academy</option>
                <option value="COLLEGE">College / University</option>
                <option value="EDTECH">EdTech Platform</option>
                <option value="OTHER">Other Educational Academy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Affiliation / Reg No</label>
              <input
                type="text"
                value={affiliationNumber}
                onChange={(e) => setAffiliationNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Official Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

interface VerificationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: any | null;
  targetDecision: 'VERIFIED' | 'REJECTED';
  onConfirm: (institutionId: string, status: 'VERIFIED' | 'REJECTED', notes: string) => Promise<void>;
}

export const VerificationActionModal: React.FC<VerificationActionModalProps> = ({
  isOpen,
  onClose,
  institution,
  targetDecision,
  onConfirm,
}) => {
  if (!isOpen || !institution) return null;

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(institution.id, targetDecision, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApproval = targetDecision === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b flex items-center justify-between ${
          isApproval ? 'bg-emerald-50/80 border-emerald-100' : 'bg-red-50/80 border-red-100'
        }`}>
          <div className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className="text-base font-bold text-slate-900 font-serif">
              {isApproval ? 'Approve Institution Verification' : 'Reject Institution Verification'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs font-bold text-slate-800">{institution.name}</p>
            <p className="text-[11px] text-slate-500">
              Affiliation: {institution.affiliationNumber || 'None'} • {institution.city}, {institution.state}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isApproval ? 'Administrative Approval Note (Optional)' : 'Reason for Rejection (Required)'}
            </label>
            <textarea
              rows={3}
              required={!isApproval}
              placeholder={isApproval ? 'e.g. Verified with state board registry...' : 'e.g. Affiliation document invalid or unreadable...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 ${
                isApproval ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isApproval ? 'Confirm & Grant Posting' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

