import React, { useState } from 'react';
import { JobVacancy } from '@sikchakhub/shared-types';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface UploadCandidateCvModalProps {
  jobs: JobVacancy[];
  initialJobId?: string;
  onClose: () => void;
  onCandidateUploaded: () => void;
}

export const UploadCandidateCvModal: React.FC<UploadCandidateCvModalProps> = ({
  jobs,
  initialJobId,
  onClose,
  onCandidateUploaded,
}) => {
  const { token } = useAuth();

  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || jobs[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [highestQualification, setHighestQualification] = useState('M.Sc with B.Ed');
  const [subject, setSubject] = useState(jobs[0]?.subject || 'Physics');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Only PDF format resumes are accepted (.pdf).');
      return;
    }

    if (file.size > 1024 * 1024) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1MB limit. Please upload a PDF under 1MB.`);
      return;
    }

    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPdfBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleJobSelectChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      setSubject(targetJob.subject);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!selectedJobId) {
      setErrorMsg('Please select a target job vacancy opening.');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Candidate full name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/v1/applications/upload-candidate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          experienceYears: Number(experienceYears),
          highestQualification,
          subject,
          base64Data: pdfBase64,
          fileName: pdfFile?.name || 'Candidate_Resume.pdf',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult(data.application);
        setTimeout(() => {
          onCandidateUploaded();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.message || 'Failed to upload candidate CV.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error uploading candidate CV.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/70 to-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  Recruiter CV Intake
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto ATS Ranked</span>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Upload Candidate CV & Auto-Rank
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successResult ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Candidate CV Uploaded!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Candidate ranked with an ATS score of <strong className="text-emerald-600 font-extrabold text-sm">{successResult.matchResult?.overallScore || 85}%</strong>. Added directly to your candidate management pool.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Job Vacancy Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Vacancy Opening <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobSelectChange(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500"
                  required
                >
                  {jobs.length === 0 ? (
                    <option value="">No openings found</option>
                  ) : (
                    jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.subject} • {j.teachingLevel})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* PDF CV Upload Box (1MB Limit • Strict PDF) */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">Candidate Resume (PDF)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Max 1MB • PDF Only
                  </span>
                </div>

                <label className="cursor-pointer block p-4 text-center bg-white rounded-xl border border-sky-200 hover:border-sky-400 hover:bg-sky-50/50 transition">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{pdfFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(pdfFile.size / 1024).toFixed(1)} KB • Ready for ATS parser</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-sky-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-700">Click to browse or drop PDF resume</p>
                      <p className="text-[10px] text-slate-400">Strictly 1MB size limit (100% free setup)</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teaching Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physics, Chemistry, Math"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc, Ph.D, B.Ed"
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Parsing & Scoring...' : 'Upload & Auto-Rank by ATS'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

