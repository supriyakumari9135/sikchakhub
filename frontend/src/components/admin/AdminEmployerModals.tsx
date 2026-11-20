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
  Loader2,
  FileText,
  Eye,
  School,
  FileBadge,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  AlertOctagon
} from 'lucide-react';

interface EmployerDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onEdit: (employer: any) => void;
  onVerify: (institutionId: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', notes?: string) => void;
  onBlock?: (employer: any) => void;
  onUnblock?: (employer: any) => void;
  onPenalty?: (employer: any) => void;
  onDelete?: (employer: any) => void;
  onUpdatePenalty?: (institutionId: string, penaltyId: string, status: 'PAID' | 'WAIVED') => void;
}

export const EmployerDossierModal: React.FC<EmployerDossierModalProps> = ({
  isOpen,
  onClose,
  employer,
  onEdit,
  onVerify,
  onBlock,
  onUnblock,
  onPenalty,
  onDelete,
  onUpdatePenalty,
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
                <span>Board: <strong>{employer.board || 'CBSE / Recognized'}</strong></span>
              </div>
              {employer.udiseCode && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>UDISE+: <strong>{employer.udiseCode}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <FileBadge className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Reg. / Affiliation: <strong>{employer.registrationNumber || employer.affiliationNumber || 'Pending verification'}</strong></span>
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
                <span className="font-semibold text-slate-900">{employer.contactPerson || employer.ownerName || employer.owner?.fullName || 'Representative'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{employer.email || employer.ownerEmail || employer.owner?.email || 'Email not listed'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{employer.phone || employer.ownerPhone || employer.owner?.phone || 'Phone not listed'}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Terms of Service: <span className="font-semibold text-emerald-700">Accepted & Validated</span>
              </div>
            </div>
          </div>

          {/* Verification Document / Certificate Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Accreditation & Registration Certificate
            </h4>
            {employer.certificateUrl ? (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {employer.certificateFileName || 'Institution_Registration_Certificate.pdf'}
                    </p>
                    <p className="text-[11px] text-sky-700 font-medium">
                      Official document uploaded by institution for Super Admin validation
                    </p>
                  </div>
                </div>

                <a
                  href={employer.certificateUrl.startsWith('http') ? employer.certificateUrl : `${window.location.origin}${employer.certificateUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Document</span>
                </a>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No registration certificate uploaded yet. Vacancy publishing is limited to Draft until accreditation is verified.</span>
              </div>
            )}
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

          {/* Blocked Status Banner */}
          {employer.isBlocked && (
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                <Ban className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-red-700">Account Blocked for Policy Violation</h5>
                  {employer.blockedAt && (
                    <span className="text-[10px] text-red-500 font-mono">
                      {new Date(employer.blockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  <strong>Reason:</strong> {employer.blockReason || 'Blocked by administrative policy.'}
                </p>
                <p className="text-[11px] text-red-600 mt-1">
                  Access is strictly revoked; login is denied and all vacancies posted by this institution are closed.
                </p>
              </div>
            </div>
          )}

          {/* Penalties & Fines Section */}
          {((employer.penalties && employer.penalties.length > 0) || (employer.activePenaltyAmount && employer.activePenaltyAmount > 0)) && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-700" />
                  <h5 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Administrative Penalties ({employer.penalties?.length || 0})
                  </h5>
                </div>
                {employer.activePenaltyAmount > 0 ? (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    ₹{Number(employer.activePenaltyAmount).toLocaleString()} Active Fine
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    All Fines Cleared
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {employer.penalties?.map((pen: any) => (
                  <div key={pen.id} className="p-2.5 bg-white rounded-lg border border-amber-100 shadow-2xs flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">₹{Number(pen.amount).toLocaleString()}</span>
                        <span className="text-slate-600 truncate">— {pen.reason}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Imposed on {new Date(pen.imposedAt).toLocaleDateString()} by {pen.imposedBy || 'Admin'}
                        {pen.notes && ` • Notes: ${pen.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pen.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : pen.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pen.status}
                      </span>
                      {pen.status === 'ACTIVE' && onUpdatePenalty && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdatePenalty(employer.id, pen.id, 'PAID')}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                            title="Mark fine as collected/paid"
                          >
                            Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdatePenalty(employer.id, pen.id, 'WAIVED')}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                            title="Waive fine"
                          >
                            Waive
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {employer.verificationStatus !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => onVerify(employer.id, 'VERIFIED')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Approve</span>
              </button>
            )}

            {employer.verificationStatus !== 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => onVerify(employer.id, 'SUSPENDED', 'Administratively suspended')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Suspend</span>
              </button>
            )}

            {/* Impose Penalty Button */}
            {onPenalty && (
              <button
                type="button"
                onClick={() => onPenalty(employer)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 transition flex items-center gap-1.5"
                title="Impose financial fine for misleading postings"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                <span>Impose Penalty</span>
              </button>
            )}

            {/* Block / Unblock Button */}
            {employer.isBlocked ? (
              onUnblock && (
                <button
                  type="button"
                  onClick={() => onUnblock(employer)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition flex items-center gap-1.5"
                  title="Unblock account access"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unblock Account</span>
                </button>
              )
            ) : (
              onBlock && (
                <button
                  type="button"
                  onClick={() => onBlock(employer)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 transition flex items-center gap-1.5"
                  title="Block employer account"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block Account</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Delete Account Button */}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(employer)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5 shadow-xs"
                title="Permanently delete institution, user, and all vacancies"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Close
            </button>
          </div>
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

// ============================================================================
// 4. EMPLOYER BLOCK / UNBLOCK MODAL
// ============================================================================
interface EmployerBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onConfirmBlock: (institutionId: string, reason: string) => Promise<void>;
  onConfirmUnblock: (institutionId: string) => Promise<void>;
}

export const EmployerBlockModal: React.FC<EmployerBlockModalProps> = ({
  isOpen,
  onClose,
  employer,
  onConfirmBlock,
  onConfirmUnblock,
}) => {
  const [reasonPreset, setReasonPreset] = useState('Misleading salary or CTC advertised to candidates');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employer) return null;

  const isBlocked = !!employer.isBlocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isBlocked) {
        await onConfirmUnblock(employer.id);
      } else {
        const finalReason = reasonPreset === 'Other' ? customReason.trim() : reasonPreset;
        if (!finalReason) {
          alert('Please specify the block reason.');
          setIsSubmitting(false);
          return;
        }
        await onConfirmBlock(employer.id, finalReason);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className={`p-5 border-b flex items-center justify-between text-white ${
          isBlocked ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-red-600 to-rose-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isBlocked ? <ShieldCheck className="w-5 h-5 text-white" /> : <Ban className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                {isBlocked ? 'Unblock Employer Account' : 'Block Employer & Revoke Access'}
              </h3>
              <p className="text-xs text-white/80">{employer.name} ({employer.ownerEmail})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isBlocked ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <p className="font-bold">Restore full access to this institution?</p>
                <p className="mt-1">
                  Unblocking will allow <strong>{employer.ownerEmail}</strong> to log back in, manage applicants, and publish verified teacher openings again.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <span className="font-bold text-slate-700">Current Block Reason:</span> {employer.blockReason || 'Policy violation'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  Immediate Account Restrictions
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700 ml-1">
                  <li>Employer login session will be terminated immediately.</li>
                  <li>All currently active vacancies ({employer.totalJobs || 0}) will be closed.</li>
                  <li>Institution will be hidden from the public job board.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Blocking (Mandatory)
                </label>
                <select
                  value={reasonPreset}
                  onChange={(e) => setReasonPreset(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Misleading salary or CTC advertised to candidates">Misleading salary / CTC advertised</option>
                  <option value="Misleading school campus or fake institution credentials">Misleading school campus / fake credentials</option>
                  <option value="Unverified / fake recruitment listings published">Unverified / fake recruitment listings</option>
                  <option value="Misleading candidates regarding interview and demo fees">Demanding illicit demo/application fees from candidates</option>
                  <option value="Violation of teacher employment regulations">Violation of teacher recruitment code</option>
                  <option value="Other">Other (Custom explanation)</option>
                </select>
              </div>

              {reasonPreset === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Detailed Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the violation in detail..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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
                isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isBlocked ? 'Confirm Unblock' : 'Confirm Block Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 5. EMPLOYER PENALTY & FINE MODAL
// ============================================================================
interface EmployerPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onImposePenalty: (institutionId: string, amount: number, reason: string, notes?: string) => Promise<void>;
  onUpdatePenaltyStatus: (institutionId: string, penaltyId: string, status: 'PAID' | 'WAIVED') => Promise<void>;
}

export const EmployerPenaltyModal: React.FC<EmployerPenaltyModalProps> = ({
  isOpen,
  onClose,
  employer,
  onImposePenalty,
  onUpdatePenaltyStatus,
}) => {
  const [amount, setAmount] = useState<number>(5000);
  const [reasonPreset, setReasonPreset] = useState('Misleading salary advertised to candidates');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid fine amount.');
      return;
    }
    const finalReason = reasonPreset === 'Other' ? customReason.trim() : reasonPreset;
    if (!finalReason) {
      alert('Please specify the penalty reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onImposePenalty(employer.id, amount, finalReason, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [2500, 5000, 10000, 25000, 50000];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">Impose Administrative Penalty / Fine</h3>
              <p className="text-xs text-white/80">{employer.name} • {employer.city}, {employer.state}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active fine status banner */}
          {employer.activePenaltyAmount > 0 && (
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Active Unpaid Fines</span>
                <span className="text-sm font-extrabold text-red-700">₹{Number(employer.activePenaltyAmount).toLocaleString()}</span>
              </div>
              <span className="text-[11px] font-semibold text-red-600 px-2.5 py-1 bg-red-100 rounded-lg">
                Posting Restricted
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Penalty Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Quick pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                      amount === q
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ₹{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Misleading Listing Violation Reason *
              </label>
              <select
                value={reasonPreset}
                onChange={(e) => setReasonPreset(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Misleading salary or CTC advertised to candidates">Misleading salary / CTC advertised</option>
                <option value="False institution profile or misleading school campus">False school campus / location claims</option>
                <option value="Ghosting candidates or conducting unverified mock interviews">Unethical interview process / ghosting</option>
                <option value="Demanding unlawful recruitment fees from applicants">Demanding candidate fees / deposit</option>
                <option value="Misrepresenting job title and teaching workload">Misrepresenting job role & workload</option>
                <option value="Other">Other (Custom explanation)</option>
              </select>
            </div>

            {reasonPreset === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Violation Detail *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify violation..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Administrative Notes (Internal)
              </label>
              <input
                type="text"
                placeholder="e.g. Reported by candidate ID #104 with offer letter discrepancy"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-800">
              <span className="font-bold">Compliance Impact:</span> The employer will see an administrative penalty alert on their dashboard, and will be prohibited from creating new vacancies until the fine is resolved.
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition flex items-center gap-1.5 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Impose Fine of ₹{amount.toLocaleString()}</span>
              </button>
            </div>
          </form>

          {/* Past Penalties History */}
          {employer.penalties && employer.penalties.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Penalty History ({employer.penalties.length})
              </h4>
              <div className="space-y-2">
                {employer.penalties.map((pen: any) => (
                  <div key={pen.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">₹{Number(pen.amount).toLocaleString()}</span>
                        <span className="text-slate-600">{pen.reason}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(pen.imposedAt).toLocaleDateString()} • {pen.status}
                      </p>
                    </div>

                    {pen.status === 'ACTIVE' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdatePenaltyStatus(employer.id, pen.id, 'PAID')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                          Mark Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdatePenaltyStatus(employer.id, pen.id, 'WAIVED')}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                        >
                          Waive
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. EMPLOYER PERMANENT DELETE MODAL
// ============================================================================
interface EmployerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: any | null;
  onConfirmDelete: (institutionId: string) => Promise<void>;
}

export const EmployerDeleteModal: React.FC<EmployerDeleteModalProps> = ({
  isOpen,
  onClose,
  employer,
  onConfirmDelete,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employer) return null;

  const targetName = employer.name?.trim() || employer.ownerEmail;
  const isMatch = confirmName.trim().toLowerCase() === targetName.toLowerCase() || confirmName.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;

    setIsSubmitting(true);
    try {
      await onConfirmDelete(employer.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">Permanently Delete Employer</h3>
              <p className="text-xs text-white/80">Irreversible Administrative Removal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              Warning: This will permanently erase all associated data:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-700 ml-1">
              <li>Institution Profile: <strong>{employer.name}</strong></li>
              <li>Employer User Account: <strong>{employer.ownerEmail}</strong></li>
              <li>All Posted Vacancies ({employer.totalJobs || 0} jobs)</li>
              <li>All candidate applications received for this institution</li>
              <li>All subscription history and active access</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Type <span className="text-red-600 select-all font-mono font-black">{targetName}</span> or <span className="text-red-600 font-mono font-black">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              required
              placeholder={`Type "${targetName}" to confirm`}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Employer Permanently</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

