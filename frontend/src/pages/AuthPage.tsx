import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, PortalRole } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Briefcase, 
  Award, 
  MapPin, 
  BookOpen, 
  Clock,
  School,
  ShieldCheck,
  Upload,
  FileText,
  X,
  FileCheck,
  FileCheck2,
  FileBadge,
  Languages,
  DollarSign,
  Compass,
  Plus,
  Globe,
  Image as ImageIcon,
  UserCheck,
  Loader2
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
  initialPortal?: PortalRole;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, initialPortal: propInitialPortal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();

  // Parse query params (e.g. /login?role=EMPLOYER or /signup?role=TEACHER)
  const searchParams = new URLSearchParams(location.search);
  const queryRole = searchParams.get('role')?.toUpperCase();
  const queryTab = searchParams.get('tab')?.toUpperCase();

  // Mode: LOGIN or REGISTER
  const defaultMode = initialMode || (location.pathname.includes('signup') || location.pathname.includes('register') ? 'REGISTER' : 'LOGIN');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(defaultMode);

  // Active portal: TEACHER, EMPLOYER, ADMIN, or HR
  const initialPortal: PortalRole = 
    propInitialPortal ||
    (queryRole === 'EMPLOYER' ? 'EMPLOYER' :
    queryRole === 'ADMIN' ? 'ADMIN' :
    queryRole === 'HR' ? 'HR' :
    location.pathname === '/hr-login' || location.pathname === '/hr' ? 'HR' : 'TEACHER');
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>(initialPortal);

  // Form Fields - Basic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [institutionType, setInstitutionType] = useState('SCHOOL');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Extended Teacher / Job Seeker Form Fields
  const [gender, setGender] = useState('Female');
  const [highestQualification, setHighestQualification] = useState('B.Ed / Post Graduate');
  const [degree, setDegree] = useState('M.Sc in Physics');
  const [certifications, setCertifications] = useState<string[]>(['B.Ed Qualified', 'CTET Paper 2 (TGT)']);
  const [subject, setSubject] = useState('Physics');
  const [secondarySubject, setSecondarySubject] = useState('');
  const [teachingLevel, setTeachingLevel] = useState('PGT');
  const [classesTaught, setClassesTaught] = useState<string[]>(['Classes 9-10', 'Classes 11-12']);
  const [boards, setBoards] = useState<string[]>(['CBSE']);
  const [experienceYears, setExperienceYears] = useState('3');
  const [previousSchool, setPreviousSchool] = useState('');
  const [skills, setSkills] = useState<string[]>([
    'Lesson Planning',
    'Smart Board & ICT',
    'Classroom Management',
    'Student Assessment',
    'Doubt Solving'
  ]);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
  const [isWillingToRelocate, setIsWillingToRelocate] = useState(true);
  const [expectedSalary, setExpectedSalary] = useState('₹6 - 9 LPA');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState('7.5');
  const [joiningAvailability, setJoiningAvailability] = useState('Immediate');

  // Compulsory CV / Resume PDF Upload (Max 5 MB)
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvBase64, setCvBase64] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const [cvFileSizeFormatted, setCvFileSizeFormatted] = useState<string>('');
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extended Employer / Job Poster Form Fields
  const [contactPerson, setContactPerson] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Institution Profile & Verification section
  const [boardAffiliation, setBoardAffiliation] = useState('CBSE');
  const [udiseCode, setUdiseCode] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [institutionWebsite, setInstitutionWebsite] = useState('');

  // Institution Logo Upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Institution Verification Certificate Upload (PDF / Image, Max 5 MB)
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certBase64, setCertBase64] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState<string>('');
  const [certFileSizeFormatted, setCertFileSizeFormatted] = useState<string>('');
  const [certError, setCertError] = useState<string | null>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with route changes (/login vs /signup)
  useEffect(() => {
    if (location.pathname.includes('signup') || location.pathname.includes('register')) {
      setMode('REGISTER');
    } else if (location.pathname.includes('login') || location.pathname.includes('signin')) {
      setMode('LOGIN');
    }
  }, [location.pathname]);

  // Sync portal from query params, pathname or props
  useEffect(() => {
    if (propInitialPortal) {
      setSelectedPortal(propInitialPortal);
      if (propInitialPortal === 'HR' || propInitialPortal === 'ADMIN') setMode('LOGIN');
      return;
    }

    if (queryRole === 'EMPLOYER') setSelectedPortal('EMPLOYER');
    else if (queryRole === 'ADMIN') {
      setSelectedPortal('ADMIN');
      setMode('LOGIN');
    }
    else if (queryRole === 'HR') {
      setSelectedPortal('HR');
      setMode('LOGIN');
    }
    else if (queryRole === 'TEACHER') setSelectedPortal('TEACHER');
    else if (location.pathname === '/hr-login' || location.pathname === '/hr') {
      setSelectedPortal('HR');
      setMode('LOGIN');
    }

    if (queryTab === 'REGISTER' && selectedPortal !== 'ADMIN' && selectedPortal !== 'HR') setMode('REGISTER');
    else if (queryTab === 'LOGIN') setMode('LOGIN');
  }, [location.search, location.pathname, queryRole, queryTab, propInitialPortal]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const isUnverified = 
        user.role !== 'ADMIN' && 
        user.role !== 'HR' && 
        (user.isVerified === false || (user.verificationStatus && user.verificationStatus !== 'FULLY_VERIFIED'));

      if (isUnverified) {
        navigate('/verify-otp');
        return;
      }

      if (user.role === 'ADMIN' || user.role === 'HR') navigate('/admin-dashboard');
      else if (user.role === 'EMPLOYER') navigate('/employer-dashboard');
      else navigate('/teacher-dashboard');
    }
  }, [user, navigate]);

  const navigateToRoleDashboard = (role: PortalRole) => {
    const isUnverified = user && 
      user.role !== 'ADMIN' && 
      user.role !== 'HR' && 
      (user.isVerified === false || (user.verificationStatus && user.verificationStatus !== 'FULLY_VERIFIED'));

    if (isUnverified) {
      navigate('/verify-otp');
      return;
    }

    if (role === 'TEACHER') {
      navigate('/teacher-dashboard');
    } else if (role === 'EMPLOYER') {
      navigate('/employer-dashboard');
    } else if (role === 'ADMIN' || (role as string) === 'HR') {
      navigate('/admin-dashboard');
    }
  };

  // Helper to toggle items in multi-select pill lists
  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setter(list.filter(i => i !== item));
      }
    } else {
      setter([...list, item]);
    }
  };

  // Client-side file handler: Validates PDF format and 5MB size limit
  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PDF extension or mime type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setCvError('Invalid format. Please upload a valid PDF document (.pdf).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check maximum 5 MB limit (5 * 1024 * 1024 bytes)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setCvError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please select a PDF under 5 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const sizeStr = file.size >= 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    setCvFile(file);
    setCvFileName(file.name);
    setCvFileSizeFormatted(sizeStr);

    // Read as Base64 Data URL for persistent backend storage
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCvBase64(result);
    };
    reader.onerror = () => {
      setCvError('Failed to read PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeCvFile = () => {
    setCvFile(null);
    setCvBase64(null);
    setCvFileName('');
    setCvFileSizeFormatted('');
    setCvError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Client-side file handler: Validates PDF or Image certificate and 5MB size limit
  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      setCertError('Invalid format. Please upload a PDF document (.pdf) or image (.png, .jpg) of your accreditation certificate.');
      if (certInputRef.current) certInputRef.current.value = '';
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_BYTES) {
      setCertError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit. Please select a file under 5 MB.`);
      if (certInputRef.current) certInputRef.current.value = '';
      return;
    }

    const sizeStr = file.size >= 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    setCertFile(file);
    setCertFileName(file.name);
    setCertFileSizeFormatted(sizeStr);

    const reader = new FileReader();
    reader.onload = () => {
      setCertBase64(reader.result as string);
    };
    reader.onerror = () => {
      setCertError('Failed to read certificate file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeCertFile = () => {
    setCertFile(null);
    setCertBase64(null);
    setCertFileName('');
    setCertFileSizeFormatted('');
    setCertError(null);
    if (certInputRef.current) certInputRef.current.value = '';
  };

  // Client-side logo handler: Validates image and preview
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, SVG, WebP) for the institution logo.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Logo image must be under 3 MB.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setLogoBase64(b64);
      setLogoPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const removeLogoFile = () => {
    setLogoFile(null);
    setLogoBase64(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res: any = await login(email, password, selectedPortal);
      if (res.success) {
        const loggedUser = res.user;
        const isNotVerified = loggedUser && 
          loggedUser.role !== 'ADMIN' && 
          loggedUser.role !== 'HR' && 
          (loggedUser.isVerified === false || (loggedUser.verificationStatus && loggedUser.verificationStatus !== 'FULLY_VERIFIED'));

        if (isNotVerified) {
          setSuccessMsg('Login successful. Please complete your email and mobile verification.');
          setTimeout(() => {
            navigate('/verify-otp');
          }, 600);
        } else {
          setSuccessMsg(`Authentication verified. Redirecting to ${
            selectedPortal === 'TEACHER' ? 'Job Seeker' : 
            selectedPortal === 'EMPLOYER' ? 'Recruiter' : 
            selectedPortal === 'HR' ? 'HR Candidate Screening' : 
            'Super Admin'} console...`);
          setTimeout(() => {
            navigateToRoleDashboard(selectedPortal);
          }, 600);
        }
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // COMPULSORY VALIDATIONS FOR JOB SEEKER
    if (selectedPortal === 'TEACHER') {
      if (age && (Number(age) < 18 || Number(age) > 100)) {
        setError('Please enter a valid age (minimum 18 years).');
        return;
      }
      if (!cvBase64) {
        setError('CV/Resume PDF upload (maximum 5 MB) is compulsory to complete Job Seeker registration.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile number for mobile verification.');
        return;
      }
    }

    // COMPULSORY VALIDATIONS FOR JOB POSTER / EMPLOYER
    if (selectedPortal === 'EMPLOYER') {
      if (!organizationName.trim()) {
        setError('Institution Name is compulsory.');
        return;
      }
      if (!contactPerson.trim() && !fullName.trim()) {
        setError('Contact Person / Principal Name is compulsory.');
        return;
      }
      if (!phone.trim()) {
        setError('Official Mobile Number is compulsory.');
        return;
      }
      if (phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit Official Mobile Number.');
        return;
      }
      if (!email.trim()) {
        setError('Official Work Email is compulsory.');
        return;
      }
      if (!stateName.trim()) {
        setError('State is compulsory. Please select your institution state.');
        return;
      }
      if (!city.trim()) {
        setError('City is compulsory. Please enter your institution city.');
        return;
      }
      if (!fullAddress.trim()) {
        setError('Full Campus Address is compulsory.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password confirmation.');
        return;
      }
      if (!termsAccepted) {
        setError('You must accept the Terms of Service and Institutional Code of Conduct to register.');
        return;
      }
    }

    setLoading(true);

    try {
      const contactPersonFinal = selectedPortal === 'EMPLOYER' ? (contactPerson || fullName) : fullName;

      const registerPayload = {
        email: email.trim().toLowerCase(),
        password,
        confirmPassword: selectedPortal === 'EMPLOYER' ? confirmPassword : password,
        fullName: contactPersonFinal,
        contactPerson: selectedPortal === 'EMPLOYER' ? contactPersonFinal : undefined,
        phone,
        age: age ? Number(age) : undefined,
        gender: selectedPortal === 'TEACHER' ? gender : undefined,
        role: selectedPortal === 'ADMIN' ? 'ADMIN' : selectedPortal === 'EMPLOYER' ? 'EMPLOYER' : 'TEACHER',
        city: city || 'Delhi NCR',
        state: stateName || 'Delhi',
        address: selectedPortal === 'EMPLOYER' ? fullAddress : undefined,
        pincode: selectedPortal === 'EMPLOYER' ? pincode : undefined,
        // Teacher Specific
        subject: subject || 'Physics',
        secondarySubject: secondarySubject || undefined,
        highestQualification: highestQualification || undefined,
        degree: degree || undefined,
        teachingLevel: teachingLevel || 'PGT',
        teachingLevels: [teachingLevel],
        classesTaught,
        previousSchool,
        boards,
        certifications,
        skills,
        languages,
        preferredCities: [city || 'Delhi NCR'],
        isWillingToRelocate,
        expectedSalary,
        expectedSalaryLPA: expectedSalaryLPA ? Number(expectedSalaryLPA) : undefined,
        joiningAvailability,
        experienceYears: experienceYears ? Number(experienceYears) : 0,
        // Compulsory CV File Upload for Job Seeker (Base64 + filename)
        resumeBase64: cvBase64 || undefined,
        resumeFileName: cvFileName || undefined,
        // Employer Specific Fields
        organizationName: selectedPortal === 'EMPLOYER' ? organizationName : undefined,
        institutionType: selectedPortal === 'EMPLOYER' ? institutionType : undefined,
        board: selectedPortal === 'EMPLOYER' ? boardAffiliation : undefined,
        udiseCode: selectedPortal === 'EMPLOYER' ? udiseCode : undefined,
        registrationNumber: selectedPortal === 'EMPLOYER' ? registrationNumber : undefined,
        website: selectedPortal === 'EMPLOYER' ? institutionWebsite : undefined,
        termsAccepted: selectedPortal === 'EMPLOYER' ? termsAccepted : true,
        // Employer Verification Documents (Base64 + filename)
        certificateBase64: selectedPortal === 'EMPLOYER' ? certBase64 || undefined : undefined,
        certificateFileName: selectedPortal === 'EMPLOYER' ? certFileName || undefined : undefined,
        logoBase64: selectedPortal === 'EMPLOYER' ? logoBase64 || undefined : undefined,
        logoFileName: selectedPortal === 'EMPLOYER' ? logoFile?.name || undefined : undefined,
      };

      const res = await register(registerPayload);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Redirecting to email and mobile verification...');
        setTimeout(() => {
          navigate('/verify-otp');
        }, 600);
      } else {
        setError(res.message || 'Registration failed. Please check the provided information.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-[#eef4fe] via-[#f7faff] to-[#edf4fe] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-tr from-blue-400/25 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-purple-400/25 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Subtle Gradient Ring */}
      <div className={`w-full ${selectedPortal === 'TEACHER' && mode === 'REGISTER' ? 'max-w-6xl' : 'max-w-5xl'} p-[2px] rounded-3xl bg-gradient-to-br from-indigo-500/25 via-sky-400/30 to-purple-500/25 shadow-2xl shadow-indigo-500/10 relative z-10`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-[22px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Hero Sidebar (Brand Value & Trust) - Visible on lg screens */}
          <div className={`hidden lg:flex lg:col-span-5 p-8 flex-col justify-between relative overflow-hidden transition-all duration-500 text-white ${
            selectedPortal === 'TEACHER'
              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700'
              : selectedPortal === 'EMPLOYER'
              ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900'
              : selectedPortal === 'HR'
              ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700'
              : 'bg-gradient-to-br from-purple-700 via-fuchsia-800 to-indigo-950'
          }`}>
            {/* Subtle Glowing Spheres inside Sidebar */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 drop-shadow" />
                <span>
                  {selectedPortal === 'TEACHER' ? 'Next-Gen Educator Platform' :
                   selectedPortal === 'EMPLOYER' ? 'Institutional Hiring Suite' :
                   selectedPortal === 'HR' ? 'Advanced HR Screening Hub' :
                   'Super Admin Governance Console'}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-[28px] font-black tracking-tight leading-tight drop-shadow-xs">
                  {selectedPortal === 'TEACHER' ? 'Connect With Top Schools & Institutes Across India' :
                   selectedPortal === 'EMPLOYER' ? 'Hire Verified Teachers & Coaching Faculty Fast' :
                   selectedPortal === 'HR' ? 'Precision Multi-Criteria Educator Screening' :
                   'Super Admin Governance & Audit Desk'}
                </h2>
                <p className="text-xs text-white/80 mt-2.5 leading-relaxed">
                  {selectedPortal === 'TEACHER' ? 'Zero agency mediation fees. Directly apply to verified CBSE, ICSE, and IIT-JEE/NEET institutions with instant ATS resume matching.' :
                   selectedPortal === 'EMPLOYER' ? 'Publish teaching openings in seconds. Automatically rank candidate CVs by syllabus match, view verified credentials, and schedule virtual demo classes.' :
                   selectedPortal === 'HR' ? 'Dedicated recruitment desk to screen educators across 12 dimensions, create customized candidate groups, and export applicant dossiers.' :
                   'Centralized governance console for institutional approvals, job moderation, platform telemetry, and verification enforcement.'}
                </p>
              </div>

              {/* Dynamic Feature Cards tailored to selected portal */}
              <div className="space-y-3 pt-2">
                {selectedPortal === 'TEACHER' ? (
                  <>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Direct School Applications</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Direct recruiter access with no agents or commission fees ever charged.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">AI-Powered ATS Match</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Automated resume match percentage highlighting syllabus strengths and qualifications.</p>
                      </div>
                    </div>
                  </>
                ) : selectedPortal === 'EMPLOYER' ? (
                  <>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Institutional Recruiter Suite</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Screen candidate CVs with 1-click downloads, view ATS matches, and coordinate interview demos.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Verified School Network</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Government UDISE+ and board affiliation verification ensures trusted recruitment.</p>
                      </div>
                    </div>
                  </>
                ) : selectedPortal === 'HR' ? (
                  <>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Multi-Dimensional Screening</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Filter educator profiles across 12 dimensions including teaching levels and board experience.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-orange-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Candidate Shortlist Groups</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Curate tailored candidate clusters for client institutions and export ready candidate dossiers.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-fuchsia-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Super Admin Governance</h4>
                        <p className="text-[11px] text-white/75 mt-0.5">Full ecosystem governance for institution verification, fraud monitoring, and audit trails.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Key Stats */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-2 text-center relative z-10">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-lg font-black font-mono">5,500+</p>
                <p className="text-[10px] text-white/75">Institutions</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-lg font-black font-mono text-cyan-300">1.8M+</p>
                <p className="text-[10px] text-white/75">Teachers</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <p className="text-lg font-black font-mono text-emerald-300">0%</p>
                <p className="text-[10px] text-white/75">Commission</p>
              </div>
            </div>
          </div>

          {/* Right Main Authentication Card */}
          <div className={`lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white ${selectedPortal === 'TEACHER' && mode === 'REGISTER' ? 'max-h-[85vh] overflow-y-auto' : ''}`}>
            <div>
              {/* Header Branding */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Welcome to</span>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      SikchaKhub
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    AI-Powered Teacher & Faculty Recruitment Network
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              {/* 1. PORTAL SELECTOR: Job Seeker | Job Poster | HR Login | Admin Login */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Select Your Access Portal:
                </span>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                  {/* Job Seeker Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('TEACHER');
                      setError(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      selectedPortal === 'TEACHER'
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-sky-50/50 text-indigo-950 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs ${
                        selectedPortal === 'TEACHER' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      {selectedPortal === 'TEACHER' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <p className="text-xs font-bold leading-tight">Job Seeker</p>
                      <p className="text-[10px] text-slate-500 truncate">Teachers & Faculty</p>
                    </div>
                  </button>

                  {/* Job Poster Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('EMPLOYER');
                      setError(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      selectedPortal === 'EMPLOYER'
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-cyan-50/50 text-emerald-950 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs ${
                        selectedPortal === 'EMPLOYER' ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      {selectedPortal === 'EMPLOYER' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <p className="text-xs font-bold leading-tight">Job Poster</p>
                      <p className="text-[10px] text-slate-500 truncate">Schools & Colleges</p>
                    </div>
                  </button>

                  {/* HR Login Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('HR');
                      setMode('LOGIN'); // HR only logs in
                      setError(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      selectedPortal === 'HR'
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-yellow-50/50 text-amber-950 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs ${
                        selectedPortal === 'HR' ? 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      {selectedPortal === 'HR' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 ring-2 ring-amber-200" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <p className="text-xs font-bold leading-tight">HR Login</p>
                      <p className="text-[10px] text-slate-500 truncate">Recruiter Desk</p>
                    </div>
                  </button>

                  {/* Admin Login Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPortal('ADMIN');
                      setMode('LOGIN'); // Admins only log in
                      setError(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      selectedPortal === 'ADMIN'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50/90 via-fuchsia-50/70 to-pink-50/50 text-purple-950 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs ${
                        selectedPortal === 'ADMIN' ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white' : 'bg-slate-200/80 text-slate-500'
                      }`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      {selectedPortal === 'ADMIN' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <p className="text-xs font-bold leading-tight">Admin Login</p>
                      <p className="text-[10px] text-slate-500 truncate">Governance Desk</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. MODE TOGGLE: Sign In vs Sign Up (Segmented Pill Controller) */}
              {selectedPortal !== 'ADMIN' && selectedPortal !== 'HR' ? (
                <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 flex gap-1 mb-6 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                      mode === 'LOGIN'
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                      mode === 'REGISTER'
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign Up ({selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'})
                  </button>
                </div>
              ) : selectedPortal === 'HR' ? (
                <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-2xs">
                  <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-950">HR Candidate Screening Clearance</p>
                    <p className="text-[11px] text-amber-800">
                      Restricted recruitment desk. Please sign in with the official Email ID and Password provided by your Super Administrator.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-3 shadow-2xs">
                  <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-purple-950">Super Administrator Console</p>
                    <p className="text-[11px] text-purple-800">
                      Administrative Authorization Console. Please use your provisioned master security credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Error & Success Toasts */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              {/* 3. AUTH FORMS */}
              {mode === 'LOGIN' ? (
                /* ======================== SIGN IN FORM ======================== */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {selectedPortal === 'EMPLOYER' ? 'Official Institutional Work Email' : 
                       selectedPortal === 'ADMIN' ? 'Super Admin Email Address' : 
                       selectedPortal === 'HR' ? 'Assigned HR Email ID' :
                       'Email / Gmail Address'}
                    </label>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          selectedPortal === 'ADMIN' ? 'sikchakhub@gmail.com' : 
                          selectedPortal === 'HR' ? 'hr.recruiter@sikchakhub.ai' :
                          selectedPortal === 'EMPLOYER' ? 'recruiter@institution.edu' : 
                          'e.g. educator@gmail.com'
                        }
                        className="w-full text-xs pl-12 pr-3.5 py-3 rounded-2xl bg-white border-2 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {selectedPortal === 'HR' ? 'Assigned HR Password' : 'Password'}
                      </label>
                      {selectedPortal !== 'ADMIN' && selectedPortal !== 'HR' && (
                        <button
                          type="button"
                          onClick={() => alert('Password reset instructions will be sent to your registered email address.')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={selectedPortal === 'HR' ? 'Enter password provided by Super Admin' : 'Enter your account password'}
                        className="w-full text-xs pl-12 pr-11 py-3 rounded-2xl bg-white border-2 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:scale-98 mt-3 cursor-pointer ${
                      selectedPortal === 'ADMIN'
                        ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-700 hover:from-purple-700 hover:to-fuchsia-700 shadow-purple-500/25'
                        : selectedPortal === 'HR'
                        ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/25'
                        : selectedPortal === 'EMPLOYER'
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-indigo-500/25'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {selectedPortal === 'ADMIN' ? 'Sign In as Super Admin' :
                           selectedPortal === 'HR' ? 'Sign In as HR Recruiter' :
                           selectedPortal === 'EMPLOYER' ? 'Sign In as Job Poster' :
                           'Sign In as Job Seeker'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Trust & Security Feature Strip */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dual-Factor OTP Protected</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Direct Recruitment</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      <span>256-bit Encrypted</span>
                    </span>
                  </div>
                </form>
              ) : (
              /* ======================== SIGN UP FORM ======================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {selectedPortal === 'TEACHER' ? (
                  /* Upgraded Comprehensive Job Seeker Registration */
                  <div className="space-y-5 text-left">
                    
                    {/* SECTION 1: Personal & Contact Information */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">1</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Personal & Contact Details</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Dr. Priya Sharma"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other / Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                          <input
                            type="number"
                            required
                            min={18}
                            max={100}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 29"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email / Gmail Address *</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="educator@gmail.com"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Account Password *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Academic Qualifications & Degrees */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">2</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Education & Academic Certifications</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification *</label>
                          <select
                            value={highestQualification}
                            onChange={(e) => setHighestQualification(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="B.Ed / Post Graduate">B.Ed / Post Graduate (M.Sc / M.A / M.Com)</option>
                            <option value="M.Sc / B.Sc">M.Sc / B.Sc in Pure Sciences</option>
                            <option value="B.Tech / M.Tech">B.Tech / M.Tech in CS / Engineering</option>
                            <option value="Ph.D / Doctorate">Ph.D / Doctorate in Subject</option>
                            <option value="M.Ed">M.Ed (Master of Education)</option>
                            <option value="D.El.Ed">Diploma in Elementary Education (D.El.Ed)</option>
                            <option value="Graduation">Graduation (B.A / B.Com / B.Sc)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Specialization *</label>
                          <input
                            type="text"
                            required
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            placeholder="e.g. M.Sc in Physics / B.Ed"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Teaching Certifications (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'B.Ed Qualified',
                            'CTET Paper 1 (PRT)',
                            'CTET Paper 2 (TGT)',
                            'State TET / STET',
                            'UGC / CSIR NET',
                            'Pursuing B.Ed'
                          ].map(cert => {
                            const selected = certifications.includes(cert);
                            return (
                              <button
                                key={cert}
                                type="button"
                                onClick={() => toggleArrayItem(certifications, cert, setCertifications)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                  selected
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs ring-1 ring-sky-500/40'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                <span>{cert}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Teaching Specialization & Classes */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">3</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Teaching Subjects, Level & Classes</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Teaching Subject *</label>
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Computer Science">Computer Science & AI</option>
                            <option value="Social Science">Social Science / History</option>
                            <option value="Commerce & Accountancy">Commerce & Accountancy</option>
                            <option value="Economics">Economics</option>
                            <option value="Sanskrit">Sanskrit</option>
                            <option value="General Science">General Science (Middle School)</option>
                            <option value="Environmental Studies">Environmental Studies (EVS)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Secondary / Additional Subject</label>
                          <input
                            type="text"
                            value={secondarySubject}
                            onChange={(e) => setSecondarySubject(e.target.value)}
                            placeholder="e.g. General Science, EVS, Vedic Maths"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Level *</label>
                        <select
                          value={teachingLevel}
                          onChange={(e) => setTeachingLevel(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                        >
                          <option value="PRT">PRT (Primary Teacher - Grades 1 to 5)</option>
                          <option value="TGT">TGT (Trained Graduate Teacher - Grades 6 to 10)</option>
                          <option value="PGT">PGT (Post Graduate Teacher - Grades 11 to 12)</option>
                          <option value="COACHING_JEE">IIT-JEE Faculty (Mains & Advanced)</option>
                          <option value="COACHING_NEET">NEET Faculty (Medical Entrance)</option>
                          <option value="PRE_PRIMARY">Pre-Primary / Nursery Educator</option>
                          <option value="COLLEGE_PROFESSOR">Degree College / University Professor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Classes Taught (Select all that apply) *
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Classes 1-5',
                            'Classes 6-8',
                            'Classes 9-10',
                            'Classes 11-12',
                            'IIT-JEE / NEET Foundation',
                            'Dropper / Repeaters'
                          ].map(cls => {
                            const selected = classesTaught.includes(cls);
                            return (
                              <button
                                key={cls}
                                type="button"
                                onClick={() => toggleArrayItem(classesTaught, cls, setClassesTaught)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                  selected
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs ring-1 ring-sky-500/40'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                <span>{cls}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Board Experience (Select all that apply) *
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'CBSE',
                            'ICSE / ISC',
                            'State Board',
                            'IB / Cambridge',
                            'IGCSE'
                          ].map(bd => {
                            const selected = boards.includes(bd);
                            return (
                              <button
                                key={bd}
                                type="button"
                                onClick={() => toggleArrayItem(boards, bd, setBoards)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                  selected
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs ring-1 ring-sky-500/40'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                <span>{bd}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Experience, Previous School & Skills */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">4</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Experience & Skill Sets</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Experience (Years) *</label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            required
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            placeholder="e.g. 3 (0 for Fresher)"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Current / Previous School / Institute</label>
                          <input
                            type="text"
                            value={previousSchool}
                            onChange={(e) => setPreviousSchool(e.target.value)}
                            placeholder="e.g. Delhi Public School / Fresher"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Key Teaching Skills (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Lesson Planning',
                            'Smart Board & ICT',
                            'Classroom Management',
                            'Student Assessment',
                            'Doubt Solving',
                            'Olympiad Coaching',
                            'Lab Experiments',
                            'CBSE Paper Evaluation'
                          ].map(sk => {
                            const selected = skills.includes(sk);
                            return (
                              <button
                                key={sk}
                                type="button"
                                onClick={() => toggleArrayItem(skills, sk, setSkills)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                  selected
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs ring-1 ring-sky-500/40'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                <span>{sk}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Languages Known (Select all that apply) *
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'English',
                            'Hindi',
                            'Sanskrit',
                            'Regional / State Language'
                          ].map(lng => {
                            const selected = languages.includes(lng);
                            return (
                              <button
                                key={lng}
                                type="button"
                                onClick={() => toggleArrayItem(languages, lng, setLanguages)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                                  selected
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs ring-1 ring-sky-500/40'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                <span>{lng}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Location, Expected Salary & Availability */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">5</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Preferences & Joining Availability</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Current Location (City) *</label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Delhi NCR / Patna / Kota"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Current Salary (Annual) *</label>
                          <select
                            value={expectedSalary}
                            onChange={(e) => {
                              setExpectedSalary(e.target.value);
                              const num = e.target.value.match(/\d+(\.\d+)?/);
                              if (num) setExpectedSalaryLPA(num[0]);
                            }}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="₹3 - 5 LPA">₹3 - 5 LPA (PRT / Primary)</option>
                            <option value="₹5 - 8 LPA">₹5 - 8 LPA (TGT / Middle)</option>
                            <option value="₹8 - 12 LPA">₹8 - 12 LPA (PGT / Sr. Secondary)</option>
                            <option value="₹12 - 18 LPA">₹12 - 18 LPA (Sr. PGT / HOD)</option>
                            <option value="₹18 - 25 LPA">₹18 - 25 LPA (IIT-JEE / NEET Expert)</option>
                            <option value="Above ₹25 LPA">Above ₹25 LPA (Star Faculty / Principal)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Joining Availability *</label>
                          <select
                            value={joiningAvailability}
                            onChange={(e) => setJoiningAvailability(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="Immediate">Immediate (Within 7 days)</option>
                            <option value="Within 15 Days">Within 15 Days</option>
                            <option value="1 Month (Notice Period)">1 Month (Standard Notice Period)</option>
                            <option value="Next Academic Session (April)">Next Academic Session (April)</option>
                          </select>
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={isWillingToRelocate}
                              onChange={(e) => setIsWillingToRelocate(e.target.checked)}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                            />
                            <span>Open to Relocation across India</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: COMPULSORY CV / RESUME PDF UPLOAD (MAX 5 MB) */}
                    <div className="bg-gradient-to-br from-sky-50 via-blue-50/40 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border-2 border-sky-300 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">6</span>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Upload CV / Resume (Compulsory)
                          </h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                          * Compulsory
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf,.pdf"
                        onChange={handleCvFileChange}
                        className="hidden"
                      />

                      {cvError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{cvError}</span>
                        </div>
                      )}

                      {!cvFile ? (
                        /* Empty / Upload Dropzone */
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-5 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl bg-white/90 hover:bg-white text-center cursor-pointer transition shadow-2xs group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-2 text-sky-600 group-hover:scale-105 transition shadow-2xs">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to select or drag and drop your CV / Resume
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            <strong className="text-slate-700">PDF format only</strong> • Maximum file size <strong className="text-slate-700">5 MB</strong>
                          </p>
                          <p className="text-[10px] text-sky-600 font-semibold mt-2">
                            Automated ATS score analysis will be generated from your CV.
                          </p>
                        </div>
                      ) : (
                        /* Uploaded File Pill */
                        <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {cvFileName}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-emerald-700">{cvFileSizeFormatted}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  PDF Verified for ATS
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-600 hover:bg-sky-50 border border-sky-200 transition"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeCvFile}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  /* ======================== JOB POSTER / EMPLOYER REGISTRATION ======================== */
                  <div className="space-y-4">
                    {/* SECTION 1: Core Institutional & Contact Credentials */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">1</span>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            Core Institutional & Contact Credentials
                          </h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                          * Compulsory
                        </span>
                      </div>

                      {/* Institution Name & Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name *</label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={organizationName}
                              onChange={(e) => setOrganizationName(e.target.value)}
                              placeholder="e.g. Delhi Public School / Apex Academy"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Institution Type *</label>
                          <select
                            value={institutionType}
                            onChange={(e) => setInstitutionType(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="SCHOOL">K-12 School (CBSE / ICSE / IB / State)</option>
                            <option value="COACHING_INSTITUTE">IIT-JEE / NEET Coaching Academy</option>
                            <option value="COLLEGE">Degree College / Polytechnic</option>
                            <option value="UNIVERSITY">Higher Education University</option>
                            <option value="EDTECH">EdTech / Online Learning Organization</option>
                          </select>
                        </div>
                      </div>

                      {/* Contact Person & Official Mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person / Principal *</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={contactPerson || fullName}
                              onChange={(e) => {
                                setContactPerson(e.target.value);
                                setFullName(e.target.value);
                              }}
                              placeholder="e.g. Principal Rajesh Verma / HR Director"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Mobile / Helpline *</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="9876543210 (10 digits)"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Official Email & State */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Work / Campus Email *</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="recruiter@institution.edu.in"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                          <select
                            value={stateName || 'Delhi'}
                            onChange={(e) => setStateName(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            {[
                              'Delhi', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 
                              'Telangana', 'West Bengal', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 
                              'Gujarat', 'Haryana', 'Punjab', 'Kerala', 'Odisha', 'Assam', 
                              'Jharkhand', 'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 
                              'Goa', 'Chandigarh', 'Other'
                            ].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* City & Pincode */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. New Delhi / Patna / Jaipur"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Postal Pincode</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 110001"
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Full Campus Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Campus Address *</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <textarea
                            required
                            rows={2}
                            value={fullAddress}
                            onChange={(e) => setFullAddress(e.target.value)}
                            placeholder="e.g. Plot No. 12, Institutional Area, Near Metro Station, Sector 44"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs resize-none"
                          />
                        </div>
                      </div>

                      {/* Passwords */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">Confirm Password *</label>
                            {confirmPassword && (
                              <span className={`text-[10px] font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords mismatch'}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs ${
                                confirmPassword && password !== confirmPassword ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Terms Acceptance */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition">
                          <input
                            type="checkbox"
                            required
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs text-slate-600 leading-snug">
                            I accept the <strong className="text-slate-800">SikchaKhub.AI Terms of Service</strong>, Privacy Policy, and confirm that I am an authorized representative of this institution.
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* SECTION 2: Institution Profile & Verification Documents */}
                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/90 space-y-3">
                      <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">2</span>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            Institution Profile & Verification
                          </h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                          Super Admin Accreditation
                        </span>
                      </div>

                      {/* Board / Affiliation Details & UDISE Code */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Board / Affiliation Details *</label>
                          <select
                            value={boardAffiliation}
                            onChange={(e) => setBoardAffiliation(e.target.value)}
                            className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                          >
                            <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                            <option value="ICSE">ICSE / ISC (Council for the Indian School Certificate)</option>
                            <option value="STATE_BOARD">State Government Board</option>
                            <option value="IB">IB (International Baccalaureate)</option>
                            <option value="CAMBRIDGE">Cambridge International / IGCSE</option>
                            <option value="UGC / AICTE">UGC / AICTE / NAAC (Colleges & Universities)</option>
                            <option value="COACHING_ACADEMY">Independent Coaching Academy</option>
                            <option value="OTHER">Other Affiliation</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">UDISE Code</label>
                            <span className="text-[10px] text-slate-400">Schools only</span>
                          </div>
                          <div className="relative">
                            <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength={11}
                              value={udiseCode}
                              onChange={(e) => setUdiseCode(e.target.value)}
                              placeholder="e.g. 07010100101 (11 digits)"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Registration Number & Website */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Registration / Affiliation Number</label>
                          <div className="relative">
                            <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={registrationNumber}
                              onChange={(e) => setRegistrationNumber(e.target.value)}
                              placeholder="e.g. CBSE/AFF/2130001 or Society Reg."
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Website URL</label>
                          <div className="relative">
                            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="url"
                              value={institutionWebsite}
                              onChange={(e) => setInstitutionWebsite(e.target.value)}
                              placeholder="https://www.institution.edu.in"
                              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Institution Logo Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution Logo (Optional)</label>
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        {!logoPreview ? (
                          <div
                            onClick={() => logoInputRef.current?.click()}
                            className="p-3 border border-dashed border-sky-300 hover:border-sky-500 rounded-xl bg-white text-center cursor-pointer transition flex items-center justify-center gap-2.5 group"
                          >
                            <ImageIcon className="w-4 h-4 text-sky-600 group-hover:scale-110 transition shrink-0" />
                            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                              Click to upload school / college logo (PNG, JPG up to 3 MB)
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white border border-sky-200 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={logoPreview}
                                alt="Institution Logo Preview"
                                className="w-9 h-9 rounded-lg object-contain border border-slate-200 bg-slate-50 shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900 truncate">{logoFile?.name || 'Institution Logo'}</p>
                                <span className="text-[10px] text-emerald-600 font-semibold">Ready for display</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="px-2 py-1 text-[11px] font-semibold text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 transition"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={removeLogoFile}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Remove Logo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Registration / Affiliation Certificate Upload (Compulsory for Live Publishing) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            Registration / Affiliation Certificate
                          </label>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.2 rounded-md">
                            Mandatory for Live Vacancies
                          </span>
                        </div>

                        <input
                          type="file"
                          ref={certInputRef}
                          accept="application/pdf,image/*"
                          onChange={handleCertFileChange}
                          className="hidden"
                        />

                        {certError && (
                          <div className="p-2.5 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{certError}</span>
                          </div>
                        )}

                        {!certFile ? (
                          <div
                            onClick={() => certInputRef.current?.click()}
                            className="p-4 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl bg-white text-center cursor-pointer transition shadow-2xs group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-1.5 text-sky-600 group-hover:scale-105 transition shadow-2xs">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                              Upload Registration / Affiliation Certificate
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              <strong className="text-slate-700">PDF or Image format</strong> • Maximum file size <strong className="text-slate-700">5 MB</strong>
                            </p>
                            <p className="text-[10px] text-sky-600 font-semibold mt-1.5">
                              Enables immediate Super Admin verification to publish live vacancies.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white border border-emerald-300 shadow-2xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                                <FileCheck2 className="w-5 h-5" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate">{certFileName}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span className="font-semibold text-emerald-700">{certFileSizeFormatted}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Document Ready for Accreditation
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => certInputRef.current?.click()}
                                className="px-2.5 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 transition"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={removeCertFile}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove Certificate"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Governance Callout */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Platform Policy:</strong> Newly registered institutions can draft vacancies immediately. Publishing live on the public job board requires Super Admin verification of your institutional credentials.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    Boolean(
                      loading || 
                      (selectedPortal === 'TEACHER' && !cvBase64) || 
                      (selectedPortal === 'EMPLOYER' && (!termsAccepted || (confirmPassword ? password !== confirmPassword : false)))
                    )
                  }
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 shadow-md active:scale-[0.99] mt-2 ${
                    (selectedPortal === 'TEACHER' && !cvBase64) || (selectedPortal === 'EMPLOYER' && (!termsAccepted || (confirmPassword ? password !== confirmPassword : false)))
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25'
                  }`}
                >
                  {loading ? (
                    <span>Registering institution & securing credentials...</span>
                  ) : selectedPortal === 'TEACHER' && !cvBase64 ? (
                    <span>Upload CV / Resume (PDF, Max 5 MB) to Register</span>
                  ) : selectedPortal === 'EMPLOYER' && !termsAccepted ? (
                    <span>Accept Terms & Code of Conduct to Register</span>
                  ) : selectedPortal === 'EMPLOYER' && confirmPassword && password !== confirmPassword ? (
                    <span>Passwords Do Not Match</span>
                  ) : (
                    <>
                      <span>Register as {selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'LOGIN' ? (
              selectedPortal !== 'ADMIN' && selectedPortal !== 'HR' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('REGISTER')}
                    className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4"
                  >
                    Sign Up as {selectedPortal === 'TEACHER' ? 'Job Seeker' : 'Job Poster'}
                  </button>
                </p>
              ) : selectedPortal === 'HR' ? (
                <div className="space-y-1">
                  <p className="font-semibold text-amber-900">
                    SikchaKhub.AI HR Recruitment Desk • Provisioned Access
                  </p>
                  <p className="text-[11px] text-slate-500">
                    HR credentials are created exclusively by the Super Administrator. Need login access or a password reset? Contact your platform Super Admin.
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">
                  SikchaKhub.Ai Super Admin Console • Authorized Personnel Only
                </p>
              )
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4"
                >
                  Sign In to your account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

