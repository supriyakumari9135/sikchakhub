import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Edit2,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { apiUrl } from '../../config/api';

interface TeacherDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any | null;
  onEdit: (teacher: any) => void;
  onToggleStatus: (teacherId: string, currentStatus: string) => void;
  onPreviewCv: (doc: any) => void;
}

export const TeacherDossierModal: React.FC<TeacherDossierModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onEdit,
  onToggleStatus,
  onPreviewCv,
}) => {
  if (!isOpen || !teacher) return null;

  const profile = teacher.profile || {};
  const applications = teacher.applications || [];

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
              src={teacher.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + teacher.fullName}
              alt={teacher.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-serif">{teacher.fullName}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  teacher.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {teacher.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Registered on {new Date(teacher.createdAt).toLocaleDateString()} • Candidate ID: {teacher.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(teacher)}
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
          {/* Headline & Contact Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="font-medium text-slate-900">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{teacher.phone || profile.phone || 'Phone not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{profile.currentCity || 'Location not specified'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span><strong>Qualification:</strong> {profile.highestQualification || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span><strong>Experience:</strong> {profile.experienceYears ?? 0} Years</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span><strong>Age:</strong> {teacher.age || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Headline & Bio */}
          {profile.headline && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Professional Headline</h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {profile.headline}
              </p>
            </div>
          )}

          {/* Teaching Subjects */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Teaching Subjects</h4>
            {profile.subjects && profile.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.subjects.map((sub: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific subjects listed.</p>
            )}
          </div>

          {/* Uploaded CV */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Resume / CV</h4>
            {profile.resumeUrl ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{profile.resumeFileName || 'Candidate_Resume.pdf'}</p>
                    <p className="text-[11px] text-slate-500">Verified applicant uploaded PDF document</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewCv({
                      candidateName: teacher.fullName,
                      candidateEmail: teacher.email,
                      fileName: profile.resumeFileName || 'Resume.pdf',
                      fileUrl: profile.resumeUrl,
                      atsScore: 75,
                    })}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                  >
                    Preview CV
                  </button>
                  <a
                    href={profile.resumeUrl.startsWith('http') ? profile.resumeUrl : apiUrl(profile.resumeUrl)}
                    download={profile.resumeFileName || 'Resume.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No CV document uploaded yet.</p>
            )}
          </div>

          {/* Application History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recruitment Applications History ({applications.length})
              </h4>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No active or historical job applications submitted by this candidate yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Job Vacancy</th>
                      <th className="py-2.5 px-3">Institution</th>
                      <th className="py-2.5 px-3">Applied Date</th>
                      <th className="py-2.5 px-3">Status / Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {applications.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{app.jobTitle}</td>
                        <td className="py-2.5 px-3 text-brand-700">{app.institutionName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {app.stage}
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
          <button
            onClick={() => onToggleStatus(teacher.id, teacher.status)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
              teacher.status === 'ACTIVE'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{teacher.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}</span>
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

interface TeacherEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any | null;
  onSave: (teacherId: string, updates: any) => Promise<void>;
}

export const TeacherEditModal: React.FC<TeacherEditModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSave,
}) => {
  if (!isOpen || !teacher) return null;

  const profile = teacher.profile || {};
  const [fullName, setFullName] = useState(teacher.fullName || '');
  const [phone, setPhone] = useState(teacher.phone || profile.phone || '');
  const [age, setAge] = useState(teacher.age || profile.age || '');
  const [currentCity, setCurrentCity] = useState(profile.currentCity || '');
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears ?? 0);
  const [highestQualification, setHighestQualification] = useState(profile.highestQualification || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [status, setStatus] = useState(teacher.status || 'ACTIVE');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(teacher.id, {
        fullName,
        phone,
        age: age ? Number(age) : undefined,
        currentCity,
        experienceYears: Number(experienceYears) || 0,
        highestQualification,
        headline,
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
          <h3 className="text-base font-bold text-slate-900 font-serif">Edit Teacher Record</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current City</label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Highest Qualification</label>
            <input
              type="text"
              value={highestQualification}
              onChange={(e) => setHighestQualification(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="ACTIVE">ACTIVE - Standard Access</option>
              <option value="SUSPENDED">SUSPENDED - Prevent Actions</option>
              <option value="DEACTIVATED">DEACTIVATED - Archived</option>
            </select>
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

