import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  HelpCircle,
  Sliders,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import { FormFieldDefinition } from '@sikchakhub/shared-types';
import { apiUrl } from '../config/api';

interface PostJobModalProps {
  onClose: () => void;
  onJobCreated: () => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onJobCreated }) => {
  const { token, institution } = useAuth();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Senior Secondary Wing');
  const [subject, setSubject] = useState('Physics');
  const [teachingLevel, setTeachingLevel] = useState('PGT');
  const [board, setBoard] = useState('CBSE');
  const [minExp, setMinExp] = useState(3);
  const [minSalary, setMinSalary] = useState(6.0);
  const [maxSalary, setMaxSalary] = useState(10.0);
  const [city, setCity] = useState(institution?.city || 'New Delhi');
  const [state, setState] = useState(institution?.state || 'Delhi');
  const [qualification, setQualification] = useState('Post Graduate with B.Ed');
  const [vacanciesCount, setVacanciesCount] = useState(2);
  const [description, setDescription] = useState(
    'Seeking passionate educator to teach senior secondary batches. Responsible for conceptual syllabus coverage, doubt resolution, and preparing students for competitive examinations.'
  );

  // Dynamic Custom Questions
  const [customFields, setCustomFields] = useState<FormFieldDefinition[]>([
    {
      id: 'q1',
      label: 'Are you available to take an offline live classroom demo session?',
      fieldType: 'YES_NO',
      required: true,
    }
  ]);

  // Screening Weights
  const [minPassingScore, setMinPassingScore] = useState(50);
  const [requireResume, setRequireResume] = useState(true);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string>('');
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [syllabusNotice, setSyllabusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSyllabusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF format syllabus or specification documents are allowed (.pdf).');
      return;
    }
    if (file.size > 1024 * 1024) {
      alert(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1MB limit. Please upload a PDF under 1MB.`);
      return;
    }

    setSyllabusFile(file);
    setIsUploadingSyllabus(true);
    setErrorMessage(null);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(apiUrl('/api/v1/auth/upload-resume'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base64Data, fileName: file.name }),
      });
      const data = await res.json();
      if (data.success) {
        setSyllabusUrl(data.resumeUrl);
        setSyllabusNotice(`Uploaded "${file.name}"!`);
      } else {
        setErrorMessage(data.message || 'Failed to upload syllabus PDF document.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to upload syllabus PDF. Please try again.');
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  const addCustomField = () => {
    const newField: FormFieldDefinition = {
      id: `q_${Date.now()}`,
      label: 'New Screening Question',
      fieldType: 'TEXT',
      required: false,
      placeholder: 'Enter response...',
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, updates: Partial<FormFieldDefinition>) => {
    setCustomFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setErrorMessage('Please enter a job title (at least 2 characters).');
      return;
    }

    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      setErrorMessage('Please specify the primary teaching subject.');
      return;
    }

    const trimmedCity = (city || institution?.city || 'Delhi NCR').trim();
    const trimmedState = (state || institution?.state || 'Delhi').trim();
    const trimmedQual = (qualification || 'Post Graduate with B.Ed').trim();
    const trimmedDesc = (description || `Seeking passionate ${trimmedSubject} educator for ${teachingLevel} level students. Responsible for conceptual coverage, doubt resolution, and academic excellence.`).trim();

    const parsedMinExp = Math.max(0, isNaN(Number(minExp)) ? 0 : Number(minExp));
    const parsedMinSalary = Math.max(0, isNaN(Number(minSalary)) ? 3 : Number(minSalary));
    const parsedMaxSalary = Math.max(parsedMinSalary, isNaN(Number(maxSalary)) ? parsedMinSalary + 3 : Number(maxSalary));
    const parsedVacancies = Math.max(1, isNaN(Number(vacanciesCount)) ? 1 : Number(vacanciesCount));
    const parsedPassingScore = Math.min(100, Math.max(0, isNaN(Number(minPassingScore)) ? 40 : Number(minPassingScore)));

    const cleanedCustomFields = customFields.filter(f => f.label && f.label.trim().length > 0);

    setIsSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        department: department.trim() || 'Senior Secondary Wing',
        subject: trimmedSubject,
        teachingLevel,
        board,
        employmentType: 'FULL_TIME',
        minExperienceYears: parsedMinExp,
        minSalaryLPA: parsedMinSalary,
        maxSalaryLPA: parsedMaxSalary,
        city: trimmedCity,
        state: trimmedState,
        requiredQualification: trimmedQual,
        description: trimmedDesc,
        vacanciesCount: parsedVacancies,
        deadline: 'Ongoing / Immediate Recruitment',
        customFields: cleanedCustomFields,
        requireResume,
        syllabusDocumentUrl: syllabusUrl || '',
        syllabusDocumentName: syllabusFile?.name || '',
        screeningRules: {
          minExperienceYears: parsedMinExp,
          requiredQualifications: [trimmedQual],
          requiredSubjects: [trimmedSubject],
          requiredTeachingLevels: [teachingLevel],
          requiredBoards: [board],
          maxExpectedSalaryLPA: parsedMaxSalary * 1.15,
          autoRejectBelowScore: parsedPassingScore,
        },
      };

      const res = await fetch(apiUrl('/api/v1/jobs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onJobCreated();
          onClose();
        }, 1500);
      } else {
        let msg = data.message;
        if (!msg && data.errors) {
          const fieldErrs = Object.entries(data.errors)
            .map(([field, val]: [string, any]) => {
              if (val?._errors && val._errors.length > 0) return `${field}: ${val._errors.join(', ')}`;
              return null;
            })
            .filter(Boolean);
          if (fieldErrs.length > 0) msg = fieldErrs.join(' • ');
        }
        setErrorMessage(msg || 'Failed to publish job opening. Please verify required fields and try again.');
      }
    } catch (err: any) {
      console.error('Failed to post job:', err);
      setErrorMessage(err.message || 'Network connection error while posting job opening. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="SikchaKhub" className="w-11 h-11 rounded-2xl object-cover border border-amber-300/70 bg-white shrink-0 shadow-2xs" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                AI Recruitment Engine
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 font-serif">Create New Vacancy Opening</h3>
              <p className="text-xs text-slate-500">Post for: <strong className="text-slate-800">{institution?.name || 'Your Educational Institution'}</strong></p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 font-serif">Job Vacancy Published!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your teaching opening has been registered and is now live for qualified educators to view and apply.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Unable to Post Opening:</p>
                  <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}
            
            {/* Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Physics Faculty (IIT-JEE)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department / Division</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Science & Engineering Wing"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Subject, Level, Board */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Artificial Intelligence', 'Commerce', 'Economics'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Teaching Level *</label>
                <select
                  value={teachingLevel}
                  onChange={(e) => setTeachingLevel(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="PRT">PRT (Primary Gr 1-5)</option>
                  <option value="TGT">TGT (Middle Gr 6-10)</option>
                  <option value="PGT">PGT (Senior Gr 11-12)</option>
                  <option value="COACHING_JEE">IIT-JEE Faculty</option>
                  <option value="COACHING_NEET">NEET Medical Faculty</option>
                  <option value="COLLEGE_PROFESSOR">College / Professor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Board / Curriculum *</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="CAMBRIDGE">Cambridge (IGCSE)</option>
                  <option value="IB">IB</option>
                  <option value="STATE_BOARD">State Board</option>
                  <option value="OTHER">Coaching / Other</option>
                </select>
              </div>
            </div>

            {/* Experience & Salary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Min Exp (Yrs)</label>
                <input
                  type="number"
                  min={0}
                  value={minExp}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Min Salary (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Max Salary (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Vacancies</label>
                <input
                  type="number"
                  min={1}
                  value={vacanciesCount}
                  onChange={(e) => setVacanciesCount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Qualification & Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Required Qualification *</label>
              <input
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc / Ph.D in Physics + B.Ed"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Job Description & Pedagogy Requirements</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            {/* Dynamic Custom Application Question Builder */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Custom Application Questions ({customFields.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add specific questions to filter candidates automatically before human review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-semibold text-brand-700 hover:bg-brand-50 flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {customFields.map((field, index) => (
                <div key={field.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(index, { label: e.target.value })}
                      placeholder="Question text..."
                      className="flex-1 font-semibold text-xs px-2 py-1 border border-slate-200 rounded"
                    />
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateCustomField(index, { fieldType: e.target.value as any })}
                      className="text-xs px-2 py-1 border border-slate-200 rounded bg-white"
                    >
                      <option value="TEXT">Short Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="YES_NO">Yes / No</option>
                      <option value="SINGLE_SELECT">Dropdown</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                    />
                    <span>Mandatory response required from applicant</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Candidate Resume Upload Policy & Job Document Setup */}
            <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Candidate Resume & ATS Scoring Setup</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    SikchaKhub ATS automatically scores and ranks applicants from highest to lowest.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  ATS Auto-Rank Active
                </span>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-700 font-medium cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={requireResume}
                  onChange={(e) => setRequireResume(e.target.checked)}
                  className="mt-0.5 text-sky-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Require Candidate PDF CV Upload (Max 1MB)</span>
                  <span className="text-[11px] text-slate-500">Mandates candidates to upload their PDF resume. All resumes are auto-parsed and ranked by ATS score for easy recruiter review.</span>
                </div>
              </label>

              {/* Attach optional syllabus / job spec PDF */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Vacancy Document / Syllabus (Optional PDF - Max 1MB)
                </label>
                <label className="cursor-pointer flex items-center justify-between p-2.5 bg-white rounded-lg border border-dashed border-sky-300 hover:border-sky-500 transition">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span className="text-xs text-slate-700">
                      {syllabusFile ? syllabusFile.name : 'Click to attach role syllabus or job specification document (PDF ≤ 1MB)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {isUploadingSyllabus ? 'Uploading...' : syllabusUrl ? 'Attached ✓' : 'Browse'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleSyllabusChange}
                    disabled={isUploadingSyllabus}
                    className="hidden"
                  />
                </label>
                {syllabusNotice && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ {syllabusNotice}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 flex items-center gap-2 transition active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Opening...' : 'Publish Job Vacancy'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
