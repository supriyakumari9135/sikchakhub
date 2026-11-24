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
  AlertCircle,
  BookOpen,
  GraduationCap,
  Clock,
  IndianRupee,
  MapPin,
  ClipboardPaste,
  Eye,
  RefreshCw,
  Building2,
  ShieldCheck,
  Check,
  Calendar,
  List,
  User,
  ArrowRight,
  Edit3,
  Target,
  Users
} from 'lucide-react';
import { FormFieldDefinition } from '@sikchakhub/shared-types';
import { apiUrl } from '../config/api';

interface PostJobModalProps {
  onClose: () => void;
  onJobCreated: () => void;
}

// Popular Teaching & Coaching Subjects
const POPULAR_SUBJECTS = [
  'Zoology',
  'Botany',
  'Physics',
  'Chemistry',
  'Mathematics',
  'NEET Biology',
  'IIT-JEE Physics',
  'IIT-JEE Mathematics',
  'Organic Chemistry',
  'Inorganic Chemistry',
  'Physical Chemistry',
  'Foundation Science',
  'Foundation Maths',
  'English Language & Lit',
  'Computer Science / AI',
  'Social Studies',
  'Commerce / Accountancy',
  'Economics',
  'General Science'
];

// Standard Candidate Screening Questions Presets
const PRESET_SCREENING_QUESTIONS = [
  { key: 'current_salary', label: 'Current Salary', fieldType: 'TEXT' as const, placeholder: 'e.g. ₹8 LPA' },
  { key: 'expected_salary', label: 'Expected Salary', fieldType: 'TEXT' as const, placeholder: 'e.g. ₹12 LPA' },
  { key: 'current_location', label: 'Current Location', fieldType: 'TEXT' as const, placeholder: 'e.g. Mumbai, Maharashtra' },
  { key: 'notice_period', label: 'Notice Period', fieldType: 'TEXT' as const, placeholder: 'e.g. Immediate / 15 Days / 1 Month' },
];

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onJobCreated }) => {
  const { token, institution } = useAuth();

  // Mode tabs: 'STANDARD_FORM' | 'QUICK_PASTE' | 'PREVIEW'
  const [activeTab, setActiveTab] = useState<'STANDARD_FORM' | 'QUICK_PASTE' | 'PREVIEW'>('STANDARD_FORM');
  const [activeSection, setActiveSection] = useState<'ACADEMIC' | 'POSITION' | 'LOCATION' | 'SPECIFICATION'>('ACADEMIC');

  // Form State
  const [title, setTitle] = useState('Zoology Faculty (NEET)');
  const [department, setDepartment] = useState('NEET Medical Wing');
  const [subject, setSubject] = useState('Zoology');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [teachingLevel, setTeachingLevel] = useState('COACHING_NEET');
  const [board, setBoard] = useState('OTHER');
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'VISITING' | 'CONTRACT' | 'REMOTE'>('FULL_TIME');
  const [selectionProcess, setSelectionProcess] = useState('OFFLINE TEST AND DEMO');
  const [minExp, setMinExp] = useState(3);
  const [minSalary, setMinSalary] = useState(8.0);
  const [maxSalary, setMaxSalary] = useState(15.0);
  const [city, setCity] = useState(institution?.city || 'Mumbai');
  const [state, setState] = useState(institution?.state || 'Maharashtra');
  const [qualification, setQualification] = useState('M.Sc in Zoology / MBBS / Relevant Degree');
  const [vacanciesCount, setVacanciesCount] = useState(2);
  const [specialNotes, setSpecialNotes] = useState('NO TA/DA PROVIDED');

  // Raw Description
  const [description, setDescription] = useState(
`SUBJECT - ZOOLOGY
CLASS/LEVEL - NEET
SELECTION PROCESS - OFFLINE TEST AND DEMO
EXPERIENCE - MIN 3YR
SALARY - UP TO 15LPA
LOCATION - MUMBAI, MAHARASHTRA
EMPLOYMENT TYPE - FULL TIME
-------------------------------------------
NOTE - NO TA/DA PROVIDED`
  );

  // Quick Paste input
  const [pasteRawText, setPasteRawText] = useState(
`SUBJECT - ZOOLOGY
CLASS/LEVEL - NEET
SELECTION PROCESS - OFFLINE TEST AND DEMO\t
EXPERIENCE - MIN 3YR
SALARY - UP TO 15LPA
LOCATION - MUMBAI,MAHARASTRA
EMPLOYMENT TYPE - FULL TIME
-------------------------------------------
NOTE - NO TA/DA PROVIDED`
  );
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  // Dynamic Custom Questions initialized with standard candidate presets (Current Salary, Expected Salary, Current Location, Notice Period)
  const [customFields, setCustomFields] = useState<FormFieldDefinition[]>([
    {
      id: 'current_salary',
      label: 'Current Salary',
      fieldType: 'TEXT',
      placeholder: 'e.g. ₹8 LPA',
      required: false,
    },
    {
      id: 'expected_salary',
      label: 'Expected Salary',
      fieldType: 'TEXT',
      placeholder: 'e.g. ₹12 LPA',
      required: false,
    },
    {
      id: 'current_location',
      label: 'Current Location',
      fieldType: 'TEXT',
      placeholder: 'e.g. Mumbai, Maharashtra',
      required: false,
    },
    {
      id: 'notice_period',
      label: 'Notice Period',
      fieldType: 'TEXT',
      placeholder: 'e.g. Immediate / 15 Days / 1 Month',
      required: false,
    }
  ]);

  // Preset question toggle helpers (Check / Uncheck option)
  const isPresetActive = (key: string, label: string) => {
    return customFields.some(f => f.id === key || f.label.toLowerCase() === label.toLowerCase());
  };

  const togglePresetQuestion = (pq: typeof PRESET_SCREENING_QUESTIONS[0]) => {
    setCustomFields(prev => {
      const exists = prev.some(f => f.id === pq.key || f.label.toLowerCase() === pq.label.toLowerCase());
      if (exists) {
        // Uncheck -> Remove question
        return prev.filter(f => f.id !== pq.key && f.label.toLowerCase() !== pq.label.toLowerCase());
      } else {
        // Check -> Add question
        return [
          ...prev,
          {
            id: pq.key,
            label: pq.label,
            fieldType: pq.fieldType,
            placeholder: pq.placeholder,
            required: false,
          }
        ];
      }
    });
  };

  const isAnyPresetActive = PRESET_SCREENING_QUESTIONS.some(pq => isPresetActive(pq.key, pq.label));

  const handleToggleAllPresets = () => {
    if (isAnyPresetActive) {
      // Uncheck all standard presets
      setCustomFields(prev => 
        prev.filter(f => !PRESET_SCREENING_QUESTIONS.some(pq => pq.key === f.id || pq.label.toLowerCase() === f.label.toLowerCase()))
      );
    } else {
      // Check all standard presets
      setCustomFields(prev => {
        const withoutPresets = prev.filter(f => !PRESET_SCREENING_QUESTIONS.some(pq => pq.key === f.id || pq.label.toLowerCase() === f.label.toLowerCase()));
        const standardQuestions: FormFieldDefinition[] = PRESET_SCREENING_QUESTIONS.map(pq => ({
          id: pq.key,
          label: pq.label,
          fieldType: pq.fieldType,
          placeholder: pq.placeholder,
          required: false,
        }));
        return [...standardQuestions, ...withoutPresets];
      });
    }
  };

  // Screening & Upload
  const [minPassingScore, setMinPassingScore] = useState(50);
  const [requireResume, setRequireResume] = useState(true);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string>('');
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [syllabusNotice, setSyllabusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to compose clean structured description text without bad tabs or line length issues
  const generateStructuredDescription = (
    subj = (isCustomSubject ? customSubject : subject) || 'ZOOLOGY',
    lvl = teachingLevel,
    proc = selectionProcess,
    exp = minExp,
    maxSal = maxSalary,
    cit = city,
    st = state,
    emp = employmentType,
    note = specialNotes
  ) => {
    let cleanLevel = 'NEET';
    if (lvl === 'COACHING_NEET') cleanLevel = 'NEET';
    else if (lvl === 'COACHING_JEE') cleanLevel = 'IIT-JEE';
    else if (lvl === 'COACHING_JEE_NEET') cleanLevel = 'JEE/NEET';
    else if (lvl === 'COACHING_FOUNDATION') cleanLevel = 'FOUNDATION (GR 8-10)';
    else if (lvl === 'PGT') cleanLevel = 'PGT (11-12)';
    else if (lvl === 'TGT') cleanLevel = 'TGT (6-10)';
    else if (lvl === 'PRT') cleanLevel = 'PRT (PRIMARY)';
    else if (lvl === 'COLLEGE_PROFESSOR') cleanLevel = 'COLLEGE / PROFESSOR';
    else cleanLevel = lvl.toUpperCase();

    const cleanEmp = emp === 'FULL_TIME' ? 'FULL TIME' 
      : emp === 'PART_TIME' ? 'PART TIME'
      : emp === 'VISITING' ? 'VISITING FACULTY'
      : emp === 'CONTRACT' ? 'CONTRACT'
      : 'ONLINE / REMOTE';

    const cleanLocation = `${cit.trim().toUpperCase()}, ${st.trim().toUpperCase()}`;
    const cleanSalary = maxSal > 0 ? `UP TO ${maxSal}LPA` : 'AS PER INSTITUTION NORMS';
    const cleanExp = exp > 0 ? `MIN ${exp}YR` : 'FRESHER ELIGIBLE';

    return `SUBJECT - ${subj.trim().toUpperCase()}
CLASS/LEVEL - ${cleanLevel}
SELECTION PROCESS - ${proc.trim().toUpperCase()}
EXPERIENCE - ${cleanExp}
SALARY - ${cleanSalary}
LOCATION - ${cleanLocation}
EMPLOYMENT TYPE - ${cleanEmp}
-------------------------------------------
NOTE - ${note.trim().toUpperCase() || 'NO TA/DA PROVIDED'}`;
  };

  // Sync button action: regenerate clean standard description
  const handleSyncDescription = () => {
    const cleanDesc = generateStructuredDescription();
    setDescription(cleanDesc);
  };

  // Parser: Smart WhatsApp / Notice text parser
  const handleParsePastedText = () => {
    if (!pasteRawText.trim()) return;

    // Normalize tabs and clean lines
    const normalized = pasteRawText.replace(/\t/g, ' ').replace(/\r\n/g, '\n');
    const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

    let parsedSubject = '';
    let parsedLevel = '';
    let parsedProcess = '';
    let parsedExp = '';
    let parsedSalary = '';
    let parsedLocation = '';
    let parsedEmployment = '';
    let parsedNote = '';

    for (const line of lines) {
      // Remove horizontal separator dashes
      if (line.match(/^[-=_]{3,}$/)) continue;

      const delimiterMatch = line.match(/^([A-Z0-9/\s&]+?)\s*[-:]\s*(.+)$/i);
      if (delimiterMatch) {
        const key = delimiterMatch[1].trim().toUpperCase();
        const val = delimiterMatch[2].trim().replace(/\t/g, ' ');

        if (key.includes('SUBJECT')) {
          parsedSubject = val;
        } else if (key.includes('CLASS') || key.includes('LEVEL')) {
          parsedLevel = val;
        } else if (key.includes('PROCESS') || key.includes('SELECTION') || key.includes('INTERVIEW')) {
          parsedProcess = val;
        } else if (key.includes('EXP') || key.includes('EXPERIENCE')) {
          parsedExp = val;
        } else if (key.includes('SALARY') || key.includes('CTC')) {
          parsedSalary = val;
        } else if (key.includes('LOC') || key.includes('LOCATION') || key.includes('CAMPUS')) {
          parsedLocation = val;
        } else if (key.includes('EMPLOYMENT') || key.includes('TYPE') || key.includes('ENGAGEMENT')) {
          parsedEmployment = val;
        } else if (key.includes('NOTE') || key.includes('NOTES') || key.includes('TA/DA') || key.includes('TERMS')) {
          parsedNote = val;
        }
      }
    }

    // Apply parsed values intelligently
    if (parsedSubject) {
      const match = POPULAR_SUBJECTS.find(s => s.toLowerCase() === parsedSubject.toLowerCase());
      if (match) {
        setSubject(match);
        setIsCustomSubject(false);
      } else {
        setSubject(parsedSubject);
        setCustomSubject(parsedSubject);
        setIsCustomSubject(true);
      }
    }

    if (parsedLevel) {
      const lvlUpper = parsedLevel.toUpperCase();
      if (lvlUpper.includes('JEE') && lvlUpper.includes('NEET')) setTeachingLevel('COACHING_JEE_NEET');
      else if (lvlUpper.includes('NEET')) setTeachingLevel('COACHING_NEET');
      else if (lvlUpper.includes('JEE') || lvlUpper.includes('IIT')) setTeachingLevel('COACHING_JEE');
      else if (lvlUpper.includes('FOUNDATION')) setTeachingLevel('COACHING_FOUNDATION');
      else if (lvlUpper.includes('PGT') || lvlUpper.includes('11') || lvlUpper.includes('12')) setTeachingLevel('PGT');
      else if (lvlUpper.includes('TGT') || lvlUpper.includes('6') || lvlUpper.includes('10')) setTeachingLevel('TGT');
      else if (lvlUpper.includes('PRT') || lvlUpper.includes('PRIMARY')) setTeachingLevel('PRT');
      else if (lvlUpper.includes('COLLEGE') || lvlUpper.includes('PROFESSOR')) setTeachingLevel('COLLEGE_PROFESSOR');
    }

    if (parsedProcess) {
      setSelectionProcess(parsedProcess);
    }

    if (parsedExp) {
      const expNumMatch = parsedExp.match(/(\d+)/);
      if (expNumMatch) {
        setMinExp(parseInt(expNumMatch[1], 10));
      }
    }

    if (parsedSalary) {
      const salMatch = parsedSalary.match(/(\d+(?:\.\d+)?)/g);
      if (salMatch && salMatch.length > 0) {
        const lastNum = parseFloat(salMatch[salMatch.length - 1]);
        if (lastNum > 0) {
          setMaxSalary(lastNum);
          if (salMatch.length > 1) {
            setMinSalary(parseFloat(salMatch[0]));
          } else {
            setMinSalary(Math.max(3, Math.round(lastNum * 0.6)));
          }
        }
      }
    }

    if (parsedLocation) {
      const parts = parsedLocation.split(/[,/]/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        setCity(parts[0]);
        setState(parts[1]);
      } else if (parts.length === 1) {
        setCity(parts[0]);
      }
    }

    if (parsedEmployment) {
      const empUpper = parsedEmployment.toUpperCase();
      if (empUpper.includes('PART')) setEmploymentType('PART_TIME');
      else if (empUpper.includes('VISIT')) setEmploymentType('VISITING');
      else if (empUpper.includes('CONTRACT')) setEmploymentType('CONTRACT');
      else if (empUpper.includes('REMOTE') || empUpper.includes('ONLINE')) setEmploymentType('REMOTE');
      else setEmploymentType('FULL_TIME');
    }

    if (parsedNote) {
      setSpecialNotes(parsedNote);
    }

    // Auto update Title
    const autoTitle = `${parsedSubject || subject} Faculty (${parsedLevel || (teachingLevel === 'COACHING_NEET' ? 'NEET' : 'Senior Wing')})`;
    setTitle(autoTitle);

    // Generate clean structured description
    const formatted = generateStructuredDescription(
      parsedSubject || subject,
      teachingLevel,
      parsedProcess || selectionProcess,
      minExp,
      maxSalary,
      parsedLocation ? (city) : city,
      state,
      employmentType,
      parsedNote || specialNotes
    );
    setDescription(formatted);

    setPasteFeedback('Notice format parsed & fields populated cleanly! ✓');
    setTimeout(() => {
      setPasteFeedback(null);
      setActiveTab('STANDARD_FORM');
    }, 1200);
  };

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

    const trimmedSubject = (isCustomSubject ? customSubject : subject).trim();
    if (!trimmedSubject) {
      setErrorMessage(isCustomSubject ? 'Please enter the custom subject name.' : 'Please specify the primary teaching subject.');
      return;
    }

    const trimmedCity = (city || institution?.city || 'Delhi NCR').trim();
    const trimmedState = (state || institution?.state || 'Delhi').trim();
    const trimmedQual = (qualification || 'Post Graduate / Relevant Degree').trim();
    
    // Clean and normalize description to ensure line length doesn't get messed up
    const trimmedDesc = (description || generateStructuredDescription()).replace(/\t/g, ' ').trim();

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
        department: department.trim() || 'Coaching & Academic Wing',
        subject: trimmedSubject,
        teachingLevel,
        board,
        employmentType,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-100/90">
        
        {/* Top Header matching reference image */}
        <div className="px-5 sm:px-8 py-3.5 sm:py-4.5 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-white to-amber-50/40 shrink-0 relative overflow-hidden">
          {/* Decorative ambient orange curve on right */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-orange-400/15 via-amber-300/10 to-transparent pointer-events-none rounded-tr-[36px]" />

          <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
            <img 
              src="/images/modal-school-campus.png" 
              alt="School Campus" 
              className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-xs select-none pointer-events-none" 
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100/90 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Faculty Recruitment Engine
                </span>
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block">
                  Standard Coaching & School Template
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Create New <span className="text-orange-500">Vacancy Opening</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Posting on behalf of: <strong className="text-orange-950 font-bold">{institution?.name || 'Bhopal Institute'}</strong>
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer relative z-10 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Step Horizontal Stepper matching uploaded reference */}
        <div className="px-5 sm:px-8 pt-3.5 pb-2.5 bg-white border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {/* 1. Vacancy Details */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('STANDARD_FORM');
                setActiveSection('ACADEMIC');
                document.getElementById('sec-academic')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`cursor-pointer p-2 sm:p-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 transition-all text-left ${
                activeTab === 'STANDARD_FORM'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'STANDARD_FORM' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate">1. Vacancy Details</span>
                <span className={`block text-[10px] truncate ${activeTab === 'STANDARD_FORM' ? 'text-white/85' : 'text-slate-400'}`}>
                  Basic role & academic information
                </span>
              </div>
            </button>

            {/* 2. Application & Notice */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('STANDARD_FORM');
                setActiveSection('SPECIFICATION');
                document.getElementById('sec-screening')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cursor-pointer p-2 sm:p-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 transition-all text-left bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate">2. Application & Notice</span>
                <span className="block text-[10px] text-slate-400 truncate">
                  Selection process & policies
                </span>
              </div>
            </button>

            {/* 3. Preview */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'PREVIEW' ? 'STANDARD_FORM' : 'PREVIEW')}
              className={`cursor-pointer p-2 sm:p-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 transition-all text-left ${
                activeTab === 'PREVIEW'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'PREVIEW' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Eye className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate">3. Preview</span>
                <span className={`block text-[10px] truncate ${activeTab === 'PREVIEW' ? 'text-white/85' : 'text-slate-400'}`}>
                  Review before posting
                </span>
              </div>
            </button>

            {/* 4. Format & Sync */}
            <button
              type="button"
              onClick={() => {
                handleSyncDescription();
                setActiveTab('STANDARD_FORM');
                document.getElementById('sec-description')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cursor-pointer p-2 sm:p-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 transition-all text-left bg-white border border-slate-200/90 text-slate-700 hover:bg-orange-50/70 hover:border-orange-300"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate">4. Format & Sync</span>
                <span className="block text-[10px] text-slate-400 truncate">
                  Generate notice & publish
                </span>
              </div>
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 font-serif">Job Vacancy Published!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your teaching opening has been registered in pristine standard format and is now live for qualified educators across India.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col text-slate-800">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mx-6 mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Unable to Post Opening:</p>
                  <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* PREVIEW TAB CONTENT */}
            {activeTab === 'PREVIEW' ? (
              <div className="p-6 overflow-y-auto space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold block">Live Candidate View Preview</span>
                    <span className="text-[11px] text-sky-700">This is exactly how applicants will see your structured opening. Notice that line length is strictly constrained and never breaks!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STANDARD_FORM')}
                    className="cursor-pointer text-xs font-bold px-3 py-1 bg-white text-sky-800 rounded-lg border border-sky-200 shadow-2xs hover:bg-sky-50"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Candidate Preview Card */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-md space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          {teachingLevel === 'COACHING_JEE_NEET' ? 'JEE/NEET Faculty' : teachingLevel === 'COACHING_NEET' ? 'NEET Coaching' : teachingLevel === 'COACHING_JEE' ? 'IIT-JEE Coaching' : teachingLevel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {(isCustomSubject ? customSubject : subject) || 'Subject'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {employmentType.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 font-serif">{title || 'Faculty Opening'}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{institution?.name || 'Educational Institution'} • {city}, {state}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 block">Up to ₹{maxSalary} LPA</span>
                      <span className="text-[10px] font-bold text-slate-400">Min {minExp}+ Yrs Exp</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">SUBJECT</span>
                      <span className="font-bold text-slate-900 uppercase">{(isCustomSubject ? customSubject : subject) || 'SUBJECT'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">CLASS / LEVEL</span>
                      <span className="font-bold text-slate-900 uppercase">
                        {teachingLevel === 'COACHING_JEE_NEET' ? 'JEE/NEET' : teachingLevel === 'COACHING_NEET' ? 'NEET' : teachingLevel === 'COACHING_JEE' ? 'IIT-JEE' : teachingLevel}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">SELECTION PROCESS</span>
                      <span className="font-bold text-slate-900 uppercase break-words text-right max-w-[60%]">{selectionProcess}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">EXPERIENCE</span>
                      <span className="font-bold text-slate-900 uppercase">MIN {minExp}YR</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">SALARY</span>
                      <span className="font-bold text-slate-900 uppercase">UP TO {maxSalary}LPA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">LOCATION</span>
                      <span className="font-bold text-slate-900 uppercase break-words text-right max-w-[60%]">{city}, {state}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">EMPLOYMENT TYPE</span>
                      <span className="font-bold text-slate-900 uppercase">{employmentType.replace('_', ' ')}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">QUALIFICATION</span>
                      <span className="font-bold text-slate-900 truncate max-w-[60%]">{qualification}</span>
                    </div>
                  </div>

                  {specialNotes && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Candidate Terms / Policy Note</span>
                        <p className="text-xs font-bold text-amber-950 mt-0.5">{specialNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* MAIN 2-COLUMN MODAL BODY matching uploaded reference */
              <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4">
                <div className="flex gap-6 items-start">
                  
                  {/* LEFT NAVIGATION COLUMN */}
                  <div className="w-56 shrink-0 hidden lg:flex flex-col justify-between space-y-2.5 sticky top-0 self-start">
                    <div className="space-y-2">
                      {/* 1. Academic & Role Details */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection('ACADEMIC');
                          document.getElementById('sec-academic')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-start gap-2.5 ${
                          activeSection === 'ACADEMIC'
                            ? 'bg-orange-50/90 border border-orange-200 shadow-2xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Academic & Role Details</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Subject, level, role, employment</p>
                        </div>
                      </button>

                      {/* 2. Position Information */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection('POSITION');
                          document.getElementById('sec-position')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-start gap-2.5 ${
                          activeSection === 'POSITION'
                            ? 'bg-orange-50/90 border border-orange-200 shadow-2xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Position Information</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Title, department, openings</p>
                        </div>
                      </button>

                      {/* 3. Location & Eligibility */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection('LOCATION');
                          document.getElementById('sec-location')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-start gap-2.5 ${
                          activeSection === 'LOCATION'
                            ? 'bg-orange-50/90 border border-orange-200 shadow-2xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Location & Eligibility</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">City, state, qualification</p>
                        </div>
                      </button>

                      {/* 4. Role Specification */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection('SPECIFICATION');
                          document.getElementById('sec-specification')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-start gap-2.5 ${
                          activeSection === 'SPECIFICATION'
                            ? 'bg-orange-50/90 border border-orange-200 shadow-2xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <List className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Role Specification</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Detailed description & overview</p>
                        </div>
                      </button>
                    </div>

                    {/* Desk Illustration with Graduation Cap & Glow */}
                    <div className="relative pt-6 flex flex-col items-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <img
                        src="/images/modal-desk-scene.png"
                        alt="Academic Study"
                        className="w-full max-w-[195px] h-auto object-contain relative z-10 select-none pointer-events-none drop-shadow-sm"
                      />
                    </div>
                  </div>

                  {/* RIGHT FORM COLUMN */}
                  <div className="flex-1 min-w-0 space-y-4">
                    
                    {/* SECTION: ACADEMIC ROLE & STANDARD COACHING SPECIFICATION */}
                    <div id="sec-academic" className="space-y-3.5">
                      {/* Section Title & Auto-Fill Template Button */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-orange-600" />
                          <h4 className="text-sm font-bold text-slate-900">
                            Academic Role & Standard Coaching Specification
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSubject('Zoology');
                            setIsCustomSubject(false);
                            setTeachingLevel('COACHING_NEET');
                            setEmploymentType('FULL_TIME');
                            setSelectionProcess('OFFLINE TEST AND DEMO');
                            setSpecialNotes('NO TA/DA PROVIDED');
                            setTitle('Physics Faculty (NEET)');
                            setDepartment('NEET Medical Wing');
                            setMinExp(3);
                            setMinSalary(8);
                            setMaxSalary(15);
                            setVacanciesCount(2);
                            setCity(institution?.city || 'Bhopal');
                            setState(institution?.state || 'Madhya Pradesh');
                            setBoard('OTHER');
                            setQualification('M.Sc in Zoology / MBBS / Relevant Degree');
                            handleSyncDescription();
                          }}
                          className="cursor-pointer text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>Auto Fill from Template</span>
                        </button>
                      </div>

                      {/* Row 1: Subject, Class/Level, Employment Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Subject */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                            <span>Subject *</span>
                          </label>
                          <select
                            value={isCustomSubject ? 'OTHER' : subject}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'OTHER') {
                                setIsCustomSubject(true);
                                if (customSubject.trim()) {
                                  setSubject(customSubject.trim());
                                  if (!title || title.includes('Faculty')) {
                                    const lvlLabel = teachingLevel === 'COACHING_NEET' ? 'NEET' : teachingLevel === 'COACHING_JEE' ? 'IIT-JEE' : 'Senior Wing';
                                    setTitle(`${customSubject.trim()} Faculty (${lvlLabel})`);
                                  }
                                }
                              } else {
                                setIsCustomSubject(false);
                                setSubject(val);
                                if (!title || title.includes('Faculty')) {
                                  const lvlLabel = teachingLevel === 'COACHING_NEET' ? 'NEET' : teachingLevel === 'COACHING_JEE' ? 'IIT-JEE' : 'Senior Wing';
                                  setTitle(`${val} Faculty (${lvlLabel})`);
                                }
                              }
                            }}
                            className={`w-full text-xs px-3 py-2.5 rounded-xl border bg-white font-medium focus:ring-2 focus:ring-orange-400 focus:outline-hidden transition shadow-2xs ${
                              isCustomSubject ? 'border-orange-400 text-orange-950 font-bold' : 'border-slate-300'
                            }`}
                          >
                            {POPULAR_SUBJECTS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="OTHER">+ Other (Specify Custom Subject)</option>
                          </select>

                          {isCustomSubject && (
                            <div className="pt-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                              <input
                                type="text"
                                required={isCustomSubject}
                                autoFocus
                                value={customSubject}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomSubject(val);
                                  setSubject(val);
                                  if (!title || title.includes('Faculty')) {
                                    const lvlLabel = teachingLevel === 'COACHING_NEET' ? 'NEET' : teachingLevel === 'COACHING_JEE' ? 'IIT-JEE' : 'Senior Wing';
                                    setTitle(`${val || 'Custom'} Faculty (${lvlLabel})`);
                                  }
                                }}
                                placeholder="Type custom subject name..."
                                className="w-full text-xs px-3 py-2 rounded-xl border-2 border-orange-400 bg-orange-50/30 font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* Class / Level */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Class / Level *</span>
                          </label>
                          <select
                            value={teachingLevel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTeachingLevel(val);
                              const lvlLabel = val === 'COACHING_JEE_NEET' ? 'JEE/NEET' : val === 'COACHING_NEET' ? 'NEET' : val === 'COACHING_JEE' ? 'IIT-JEE' : 'Senior Wing';
                              const activeSubj = (isCustomSubject ? customSubject : subject) || 'Faculty';
                              setTitle(`${activeSubj} Faculty (${lvlLabel})`);
                            }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-400 focus:outline-hidden shadow-2xs"
                          >
                            <option value="COACHING_JEE_NEET">JEE/NEET Faculty</option>
                            <option value="COACHING_NEET">NEET (Medical Faculty)</option>
                            <option value="COACHING_JEE">IIT-JEE (Mains & Advanced)</option>
                            <option value="COACHING_FOUNDATION">Foundation (Class 8-10 Coaching)</option>
                            <option value="PGT">PGT (Senior Secondary Gr 11-12)</option>
                            <option value="TGT">TGT (Secondary Gr 6-10)</option>
                            <option value="PRT">PRT (Primary Gr 1-5)</option>
                            <option value="COLLEGE_PROFESSOR">College / University / Professor</option>
                          </select>
                        </div>

                        {/* Employment Type */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                            <span>Employment Type *</span>
                          </label>
                          <select
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value as any)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-400 focus:outline-hidden shadow-2xs"
                          >
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="VISITING">Visiting Faculty</option>
                            <option value="CONTRACT">Contract Basis</option>
                            <option value="REMOTE">Online / Remote</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Selection Process & Note / Perks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Selection Process Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-amber-500" />
                            <span>Selection Process *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={selectionProcess}
                            onChange={(e) => setSelectionProcess(e.target.value)}
                            placeholder="Offline Test and Demo"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-400 focus:outline-hidden shadow-2xs"
                          />
                        </div>

                        {/* Note / Perks Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-amber-500" />
                            <span>Note / Perks & Policies</span>
                          </label>
                          <input
                            type="text"
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="No TA/DA Provided"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-orange-400 focus:outline-hidden shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Quick Selection Pills matching uploaded reference layout */}
                      <div className="space-y-1.5 pt-0.5">
                        {/* Pills Row 1 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectionProcess('Offline Test and Demo');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              selectionProcess.toLowerCase().includes('offline test')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${selectionProcess.toLowerCase().includes('offline test') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Offline Test and Demo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectionProcess('Written Test + Demo');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              selectionProcess.toLowerCase().includes('written test')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${selectionProcess.toLowerCase().includes('written test') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Written Test + Demo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSpecialNotes('TA/DA Applicable');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              specialNotes.toLowerCase().includes('applicable')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${specialNotes.toLowerCase().includes('applicable') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">TA/DA Applicable</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSpecialNotes('Food & Accommodation Provided');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              specialNotes.toLowerCase().includes('food')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${specialNotes.toLowerCase().includes('food') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Food & Accommodation</span>
                          </button>
                        </div>

                        {/* Pills Row 2 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectionProcess('Online Interview & Demo');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              selectionProcess.toLowerCase().includes('online interview')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${selectionProcess.toLowerCase().includes('online interview') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Online Interview & Demo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectionProcess('Direct Classroom Demo');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              selectionProcess.toLowerCase().includes('classroom demo')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${selectionProcess.toLowerCase().includes('classroom demo') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Direct Classroom Demo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSpecialNotes('Immediate Joining Required');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              specialNotes.toLowerCase().includes('immediate')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${specialNotes.toLowerCase().includes('immediate') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">Immediate Joining</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSpecialNotes('TA/DA on Selection');
                              handleSyncDescription();
                            }}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border transition ${
                              specialNotes.toLowerCase().includes('on selection')
                                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${specialNotes.toLowerCase().includes('on selection') ? 'bg-orange-600' : 'border border-slate-400'}`} />
                            <span className="truncate">TA/DA on Selection</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION: POSITION INFORMATION */}
                    <div id="sec-position" className="space-y-3 pt-2">
                      {/* Row 3: Opening Headline / Title & Department */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Opening Headline / Title *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Physics Faculty (NEET)"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Department / Academic Wing</span>
                          </label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="NEET Medical Wing"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Row 4: Min Exp, Min CTC, Max CTC, Open Vacancies */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Min Exp (Yrs)</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={minExp}
                            onChange={(e) => setMinExp(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                            <span>Min CTC (LPA)</span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={minSalary}
                            onChange={(e) => setMinSalary(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                            <span>Max CTC (LPA)</span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={maxSalary}
                            onChange={(e) => setMaxSalary(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            <span>Open Vacancies</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={vacanciesCount}
                            onChange={(e) => setVacanciesCount(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION: LOCATION & ELIGIBILITY */}
                    <div id="sec-location" className="space-y-3 pt-2">
                      {/* Row 5: City, State, Curriculum/Board */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>City *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Bhopal"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>State *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Madhya Pradesh"
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                            <span>Curriculum / Board *</span>
                          </label>
                          <select
                            value={board}
                            onChange={(e) => setBoard(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                          >
                            <option value="OTHER">Competitive / Coaching</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE / ISC</option>
                            <option value="CAMBRIDGE">Cambridge (IGCSE/A-Level)</option>
                            <option value="IB">IB Curriculum</option>
                            <option value="STATE_BOARD">State Board</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 6: Required Qualification */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Required Qualification *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          placeholder="M.Sc in Zoology / MBBS / Relevant Degree"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* SECTION: ROLE SPECIFICATION */}
                    <div id="sec-specification" className="space-y-2 pt-2">
                      {/* Header with Re-format button */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                          <span>Formatted Role Specification & Overview</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSyncDescription}
                          className="cursor-pointer text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-format Standard Notice</span>
                        </button>
                      </div>

                      {/* Textarea matching screenshot */}
                      <textarea
                        rows={7}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-orange-500 leading-relaxed shadow-2xs"
                      />
                    </div>

                    {/* APPLICATION QUESTIONS & POLICIES (Accessible via Step 2 or collapsible) */}
                    <div id="sec-screening" className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-orange-600" />
                              <span>Application Screening Questions ({customFields.length})</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Standard candidate questions with check / uncheck options.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addCustomField}
                            className="cursor-pointer text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-orange-700 hover:bg-orange-50 flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Custom Question</span>
                          </button>
                        </div>

                        {/* Standard Candidate Questions (Current salary, Expected salary, Current location, Notice period) */}
                        <div className="p-3.5 bg-white rounded-2xl border border-orange-200/90 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                              <span>Standard Candidate Questions (Check / Uncheck to Include)</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleToggleAllPresets}
                              className="text-[11px] font-bold text-orange-600 hover:text-orange-800 underline underline-offset-2 cursor-pointer transition"
                            >
                              {isAnyPresetActive ? 'Uncheck All Options' : 'Check All Options'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PRESET_SCREENING_QUESTIONS.map(pq => {
                              const isChecked = isPresetActive(pq.key, pq.label);
                              return (
                                <label
                                  key={pq.key}
                                  className={`cursor-pointer px-3 py-2 rounded-xl border flex items-center gap-2 transition select-none ${
                                    isChecked
                                      ? 'bg-orange-50/90 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePresetQuestion(pq)}
                                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                                  />
                                  <span className="text-xs truncate">{pq.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* List of active questions */}
                        {customFields.length === 0 ? (
                          <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-500">
                            No screening questions selected. Check any preset above or click "Add Custom Question".
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {customFields.map((field, index) => (
                              <div key={field.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateCustomField(index, { label: e.target.value })}
                                    placeholder="Question text..."
                                    className="flex-1 font-semibold text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-orange-400 outline-none"
                                  />
                                  <select
                                    value={field.fieldType}
                                    onChange={(e) => updateCustomField(index, { fieldType: e.target.value as any })}
                                    className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                                  >
                                    <option value="TEXT">Short Text</option>
                                    <option value="NUMBER">Number</option>
                                    <option value="YES_NO">Yes / No</option>
                                    <option value="SINGLE_SELECT">Dropdown</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomField(index)}
                                    title="Remove question"
                                    className="cursor-pointer text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between pt-0.5">
                                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                                      className="text-orange-600 rounded cursor-pointer"
                                    />
                                    <span>Mandatory response required from applicant</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomField(index)}
                                    className="text-[10px] text-slate-400 hover:text-red-600 cursor-pointer"
                                  >
                                    Uncheck / Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resume Requirement & Syllabus Upload */}
                      <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100 space-y-2.5">
                        <label className="flex items-start gap-2 text-xs text-slate-700 font-medium cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <input
                            type="checkbox"
                            checked={requireResume}
                            onChange={(e) => setRequireResume(e.target.checked)}
                            className="mt-0.5 text-sky-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">Require Candidate PDF Resume Upload (Max 1MB)</span>
                            <span className="text-[10px] text-slate-500">Auto-parsed and ranked by SikchaKhub ATS engine.</span>
                          </div>
                        </label>

                        <div className="pt-0.5">
                          <label className="cursor-pointer flex items-center justify-between p-2.5 bg-white rounded-xl border border-dashed border-sky-300 hover:border-sky-500 transition shadow-2xs">
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4 text-sky-600" />
                              <span className="text-xs text-slate-700">
                                {syllabusFile ? syllabusFile.name : 'Attach Syllabus / Detailed Notice (Optional PDF ≤ 1MB)'}
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
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer Action Bar matching uploaded reference */}
            <div className="px-5 sm:px-8 py-3.5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-5 py-2.5 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-orange-600" />
                <span>Save as Draft</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Publishing Opening...' : 'Next: Application & Notice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
