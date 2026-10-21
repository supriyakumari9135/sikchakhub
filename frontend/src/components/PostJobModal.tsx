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
  Sliders
} from 'lucide-react';
import { FormFieldDefinition } from '@sikchakhub/shared-types';

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
  const [deadline, setDeadline] = useState('2026-12-31');
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          department,
          subject,
          teachingLevel,
          board,
          employmentType: 'FULL_TIME',
          minExperienceYears: Number(minExp),
          minSalaryLPA: Number(minSalary),
          maxSalaryLPA: Number(maxSalary),
          city,
          state,
          requiredQualification: qualification,
          description,
          deadline,
          vacanciesCount: Number(vacanciesCount),
          customFields,
          screeningRules: {
            minExperienceYears: Number(minExp),
            requiredQualifications: [qualification],
            requiredSubjects: [subject],
            requiredTeachingLevels: [teachingLevel],
            requiredBoards: [board],
            maxExpectedSalaryLPA: Number(maxSalary) * 1.15,
            autoRejectBelowScore: Number(minPassingScore),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onJobCreated();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to post job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="SikshaHub" className="w-10 h-10 rounded-xl object-cover border border-amber-300/40 bg-white shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Recruitment Posting Wizard
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 font-serif">Create New Vacancy Opening</h3>
              <p className="text-xs text-slate-500">Post for: {institution?.name || 'Your Institution'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Job Vacancy Published!</h4>
            <p className="text-xs text-slate-500">
              Active candidates can now discover and apply. Automatic screening rules are now active.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            
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

            {/* City & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Application Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
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

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-2 transition"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Job Vacancy'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
