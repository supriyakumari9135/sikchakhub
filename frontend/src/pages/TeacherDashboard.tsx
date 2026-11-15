import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  Download,
  MoreVertical,
  Headphones,
  Check,
  UserCheck,
  Settings,
  X,
  ExternalLink,
  GraduationCap,
  Award,
  Video,
  Save,
  User,
  Bookmark,
  BookmarkCheck,
  KeyRound,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  Upload,
  Eye,
  Loader2,
  Bell,
  Zap,
  ArrowRight
} from 'lucide-react';
import { JobVacancy } from '@sikchakhub/shared-types';
import { apiUrl } from '../config/api';
import { registerFcmDeviceToken, getNotificationPermissionState } from '../services/fcmClient';
import { JobSeekerAuthCard } from '../components/JobSeekerAuthCard';
import { ApplyJobModal } from '../components/ApplyJobModal';

// Mini Bar Chart graphic matching the 4 stat cards
const MiniBarGraphic = ({ color = 'sky' }: { color?: 'sky' | 'emerald' | 'purple' }) => {
  const barClass = {
    sky: 'bg-sky-200/80 group-hover:bg-sky-300',
    emerald: 'bg-emerald-200/80 group-hover:bg-emerald-300',
    purple: 'bg-purple-200/80 group-hover:bg-purple-300',
  }[color];

  return (
    <div className="flex items-end gap-1 h-8 shrink-0">
      <span className={`w-1.5 rounded-full transition-all duration-300 h-3.5 ${barClass}`} />
      <span className={`w-1.5 rounded-full transition-all duration-300 h-5 ${barClass}`} />
      <span className={`w-1.5 rounded-full transition-all duration-300 h-7 ${barClass}`} />
      <span className={`w-1.5 rounded-full transition-all duration-300 h-4 ${barClass}`} />
      <span className={`w-1.5 rounded-full transition-all duration-300 h-8 ${barClass}`} />
    </div>
  );
};

export const TeacherDashboard: React.FC = () => {
  const { user, profile, token, isLoading, updateProfile, updateAccount, changePassword, uploadResume } = useAuth();
  const navigate = useNavigate();

  // Redirect unverified users to verify-otp
  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'HR') {
      const isUnverified = user.isVerified === false || (user.verificationStatus && user.verificationStatus !== 'FULLY_VERIFIED');
      if (isUnverified) {
        navigate('/verify-otp');
      }
    }
  }, [user, isLoading, navigate]);

  // Active navigation tab
  const [activeSidebarNav, setActiveSidebarNav] = useState('Overview');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [viewingAppDetail, setViewingAppDetail] = useState<any | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobVacancy | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // PDF CV Upload State (1MB Size Limit • Free Setup)
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvUploadSuccess, setCvUploadSuccess] = useState<string | null>(null);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);

  // Saved Jobs persisted in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sikchakhub_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('sikchakhub_saved_jobs', JSON.stringify(updated));
      } catch (err) {}
      setExportNotice(prev.includes(jobId) ? 'Vacancy removed from Saved Openings' : 'Vacancy bookmarked in Saved Openings!');
      setTimeout(() => setExportNotice(null), 2500);
      return updated;
    });
  };

  // Profile Form state
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears ?? 0);
  const [highestQualification, setHighestQualification] = useState(profile?.highestQualification || '');
  const [currentCity, setCurrentCity] = useState(profile?.currentCity || '');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState(profile?.expectedSalaryLPA ?? 0);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Settings / Account state
  const [accountFullName, setAccountFullName] = useState(user?.fullName || '');
  const [accountPhone, setAccountPhone] = useState(user?.phone || '');
  const [accountAge, setAccountAge] = useState(user?.age || 28);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState<string | null>(null);
  const [accountErrorMsg, setAccountErrorMsg] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Sync state when user or profile changes
  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setExperienceYears(profile.experienceYears ?? 0);
      setHighestQualification(profile.highestQualification || '');
      setCurrentCity(profile.currentCity || '');
      setExpectedSalaryLPA(profile.expectedSalaryLPA ?? 0);
    }
    if (user) {
      setAccountFullName(user.fullName || '');
      setAccountPhone(user.phone || '');
      setAccountAge(user.age || 28);
    }
  }, [profile, user]);

  // Fetch real applications
  const { data: appsData, refetch: refetchApps } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/applications/my-applications'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch scheduled interviews
  const { data: interviewsData, refetch: refetchInterviews } = useQuery({
    queryKey: ['my-interviews', user?.id],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/interviews/my-interviews'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch open vacancies for AI matching & saved jobs
  const { data: jobsData } = useQuery({
    queryKey: ['all-active-jobs'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/jobs?status=ACTIVE&limit=50'));
      return res.json();
    },
  });

  const allJobs: JobVacancy[] = jobsData?.jobs || [];
  const liveApplications: any[] = appsData?.applications || [];
  const interviewsList: any[] = interviewsData?.interviews || [];
  const appliedJobIds = new Set(liveApplications.map(la => la.jobId || la.job?.id));

  const mappedApplications = liveApplications.map(la => {
    // Correlate interview from interviewsList or la.interview
    const linkedInterview = la.interview || interviewsList.find(iv => iv.applicationId === la.id || iv.jobId === la.jobId);

    return {
      id: la.id,
      jobId: la.jobId,
      jobTitle: la.job?.title || 'Teaching Vacancy',
      institutionName: 'SikchaKhub',
      institutionLogo: '/logo.jpeg',
      subject: la.job?.subject || 'General Teaching',
      level: la.job?.teachingLevel || 'PGT',
      salary: la.job?.minSalaryLPA ? `₹${la.job?.minSalaryLPA} - ${la.job?.maxSalaryLPA} LPA` : 'As per norms',
      location: `${la.job?.city || 'Location not specified'}${la.job?.state ? `, ${la.job.state}` : ''}`,
      matchScore: la.matchResult?.overallScore || 85,
      stage: la.stage || 'APPLIED',
      appliedDate: la.appliedAt ? new Date(la.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
      interview: linkedInterview,
      meetingLink: linkedInterview?.meetingLink || '',
      interviewDate: linkedInterview?.scheduledTime ? new Date(linkedInterview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '',
      interviewType: linkedInterview?.interviewType || 'Video Demo Round',
      durationMinutes: linkedInterview?.durationMinutes || 45,
      locationDetails: linkedInterview?.locationDetails || '',
    };
  });

  // Filtering applications
  const filteredApps = mappedApplications.filter(app => {
    if (selectedStageFilter !== 'ALL' && app.stage !== selectedStageFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchInst = app.institutionName.toLowerCase().includes(q);
      const matchTitle = app.jobTitle.toLowerCase().includes(q);
      const matchSubject = app.subject.toLowerCase().includes(q);
      const matchLoc = app.location.toLowerCase().includes(q);
      if (!matchInst && !matchTitle && !matchSubject && !matchLoc) {
        return false;
      }
    }
    return true;
  });

  // Saved jobs list
  const savedJobs = allJobs.filter(j => savedJobIds.includes(j.id));

  // AI Matched jobs
  const matchedJobs = allJobs.map(job => {
    let score = 70;
    const teacherSubjects = profile?.subjects || [];
    const teacherCity = profile?.currentCity || '';
    if (teacherSubjects.some(s => s.toLowerCase() === job.subject?.toLowerCase())) {
      score += 20;
    }
    if (teacherCity && job.city && teacherCity.toLowerCase().includes(job.city.toLowerCase())) {
      score += 10;
    }
    return {
      ...job,
      matchScore: Math.min(99, score),
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Push Notification & In-App Inbox States
  const [notifPermission, setNotifPermission] = useState<string>(() => getNotificationPermissionState());
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // Query In-App Notifications for Educator
  const { data: inboxData, refetch: refetchInbox } = useQuery({
    queryKey: ['teacher-notifications-inbox'],
    queryFn: async () => {
      if (!token) return { unreadCount: 0, notifications: [] };
      const res = await fetch(apiUrl('/api/v1/notifications/inbox'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { unreadCount: 0, notifications: [] };
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 25000,
  });

  const unreadNotifCount = inboxData?.unreadCount || 0;
  const inboxNotifications: any[] = inboxData?.notifications || [];

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    const result = await registerFcmDeviceToken(token || undefined);
    setIsEnablingPush(false);
    setNotifPermission(result.permission);
    if (result.success) {
      setExportNotice('Smart Push notifications enabled! You will receive alerts matching your profile.');
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch(apiUrl('/api/v1/notifications/inbox/read-all'), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      refetchInbox();
    } catch (e) {}
  };

  const handleToggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  const handleToggleApp = (id: string) => {
    setSelectedAppIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({
      headline,
      bio,
      experienceYears: Number(experienceYears),
      highestQualification,
      currentCity,
      expectedSalaryLPA: Number(expectedSalaryLPA),
    });
    setIsSavingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploadError(null);
    setCvUploadSuccess(null);

    // Validate format: PDF only
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setCvUploadError('Only PDF format resumes are accepted (.pdf). Please choose a valid PDF.');
      return;
    }

    // Validate size: 1MB limit (1,048,576 bytes)
    const MAX_BYTES = 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setCvUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the free 1MB size limit. Please upload a PDF under 1MB.`);
      return;
    }

    setIsUploadingCv(true);
    const res = await uploadResume(file);
    setIsUploadingCv(false);

    if (res.success) {
      setCvUploadSuccess(`PDF CV "${file.name}" uploaded successfully (${(file.size / 1024).toFixed(1)} KB)!`);
      refetchApps();
      setTimeout(() => setCvUploadSuccess(null), 4000);
    } else {
      setCvUploadError(res.message || 'Failed to upload PDF CV.');
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    setAccountSuccessMsg(null);
    setAccountErrorMsg(null);
    const res = await updateAccount({
      fullName: accountFullName,
      phone: accountPhone,
      age: Number(accountAge),
    });
    setIsSavingAccount(false);
    if (res.success) {
      setAccountSuccessMsg('Account details updated successfully!');
      setTimeout(() => setAccountSuccessMsg(null), 3000);
    } else {
      setAccountErrorMsg(res.message || 'Failed to update account');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);
    if (res.success) {
      setPasswordSuccessMsg('Password updated securely in MongoDB Atlas!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 3000);
    } else {
      setPasswordErrorMsg(res.message || 'Failed to change password. Verify current password.');
    }
  };

  const handleExportApplications = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Institution,Vacancy Title,Subject,Salary,Location,Match Score,Stage,Applied Date"]
        .concat(filteredApps.map(a => 
          `"${a.institutionName}","${a.jobTitle}","${a.subject}","${a.salary}","${a.location}","${a.matchScore}%","${a.stage}","${a.appliedDate}"`
        )).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_applications_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice("Your application history has been exported!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlisted ✓</span>
          </span>
        );
      case 'SCREENING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Screening</span>
          </span>
        );
      case 'INTERVIEW_SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Video className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Interview Scheduled</span>
          </span>
        );
      case 'SELECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            <span>Selected</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Applied</span>
          </span>
        );
    }
  };

  // Auth & loading guards placed after all hook invocations to maintain strict Hook ordering
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading educator profile...</p>
      </div>
    );
  }

  if (!user || user.role !== 'TEACHER') {
    return <JobSeekerAuthCard />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      <div className="max-w-[1550px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        
        {/* Mobile Header & Horizontal Nav Bar (Visible on < lg screens) */}
        <div className="lg:hidden space-y-3 mb-5">
          {/* Mobile Identity Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'T'}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {user?.fullName || 'Educator'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-2 h-2 text-emerald-600" />
                  <span>Verified Educator</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/jobs')}
              className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Jobs</span>
            </button>
          </div>

          {/* Mobile Scrollable Horizontal Pill Nav */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-3 px-3">
            {[
              { id: 'Overview', label: 'Overview', icon: Briefcase, count: null },
              { id: 'My Applications', label: 'Applications', icon: FileText, count: mappedApplications.length },
              { id: 'Interview Calls', label: 'Interviews', icon: Calendar, count: interviewsList.length || mappedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length },
              { id: 'Saved Openings', label: 'Saved', icon: Award, count: savedJobs.length },
              { id: 'AI Job Matches', label: 'AI Matches', icon: Sparkles, count: matchedJobs.length },
              { id: 'Resume & Profile', label: 'Resume & CV', icon: User, count: null },
              { id: 'Settings', label: 'Settings', icon: Settings, count: null },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSidebarNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarNav(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* 1. LEFT SIDEBAR (Desktop Only: lg:block) */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-6">
            
            {/* Educator Identity Card */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'T'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {user?.fullName || 'Educator'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile?.highestQualification || 'Educator'} | {profile?.currentCity || user?.phone || 'India'}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Verified Educator</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveSidebarNav('Overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Overview'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('My Applications')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'My Applications'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>My Applications</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'My Applications' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {mappedApplications.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Interview Calls')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Interview Calls'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span>Interview Calls</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Interview Calls' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {interviewsList.length || mappedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Saved Openings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Saved Openings'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" />
                  <span>Saved Openings</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Saved Openings' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {savedJobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('AI Job Matches')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'AI Job Matches'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Job Matches</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'AI Job Matches' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {matchedJobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Resume & Profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Resume & Profile'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Resume & Profile</span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Settings'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>

            {/* Need Help Box */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-center space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Need Career Help?</p>
                <p className="text-[11px] text-slate-500">Our advisor team is here</p>
              </div>
              <button
                onClick={() => window.open('tel:9783143866')}
                className="w-full py-1.5 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 rounded-xl border border-sky-200 transition shadow-2xs"
              >
                Contact Counselor
              </button>
            </div>
          </aside>

          {/* 2. RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 space-y-5 sm:space-y-6">
            
            {/* Welcome Greeting & Page Title Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome back, <strong className="text-sky-600 font-bold">{user?.fullName || 'Educator'}</strong> 👋
                </p>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Job Seeker Dashboard
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                    <span>Verified Educator</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">
                  Track applications, AI recruitment match scores, and scheduled interview calls.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Smart Push & Notifications Bell */}
                <button
                  type="button"
                  onClick={() => setIsInboxOpen(true)}
                  className="relative p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Push Notifications & Smart Alerts"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-sky-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Browse Jobs Button (hidden on mobile since it's in mobile header) */}
                <button
                  onClick={() => navigate('/jobs')}
                  className="hidden sm:flex px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm items-center gap-2 transition active:scale-[0.99] shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Teaching Vacancies</span>
                </button>
              </div>
            </div>

            {/* Smart Push Alerts Opt-in Banner (shown if browser permission is default) */}
            {notifPermission === 'default' && (
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Enable Instant Job Alerts</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-200 text-sky-800">
                        Smart Push
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Get real-time push alerts when schools post vacancies matching your teaching subjects, city & expected salary.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    disabled={isEnablingPush}
                    onClick={handleEnablePush}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isEnablingPush ? 'Enabling...' : 'Enable Push Alerts'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. 4 TOP STAT CARDS (Responsive: 2-column on mobile, 4-column on desktop) */}
            {(activeSidebarNav === 'Overview' || activeSidebarNav === 'My Applications') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Card 1: Active Applications */}
                <div 
                  onClick={() => setActiveSidebarNav('My Applications')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Active Applications</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {mappedApplications.length}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>Live tracked</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="sky" />
                  </div>
                </div>

                {/* Card 2: Total Profile Views / Strength */}
                <div 
                  onClick={() => setActiveSidebarNav('Resume & Profile')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Profile Strength</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {profile?.profileCompletionScore || 75}%
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>MongoDB verified</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="sky" />
                  </div>
                </div>

                {/* Card 3: Shortlisted Applications */}
                <div 
                  onClick={() => {
                    setActiveSidebarNav('My Applications');
                    setSelectedStageFilter('SHORTLISTED');
                  }}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Shortlisted Pool</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {mappedApplications.filter(a => a.stage === 'SHORTLISTED').length}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>Active shortlists</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="emerald" />
                  </div>
                </div>

                {/* Card 4: Interviews & Demos */}
                <div 
                  onClick={() => setActiveSidebarNav('Interview Calls')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Interviews & Demos</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {interviewsList.length || mappedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <span>Scheduled rounds</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="purple" />
                  </div>
                </div>

              </div>
            )}

            {/* 4. SWITCHABLE VIEW PANELS BASED ON activeSidebarNav */}
            
            {/* VIEW A: OVERVIEW */}
            {activeSidebarNav === 'Overview' && (
              <div className="space-y-6">
                
                {/* 1. SHORTLISTED CANDIDATE ALERT BANNER (If any application is shortlisted) */}
                {mappedApplications.filter(a => a.stage === 'SHORTLISTED').length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden border border-emerald-400/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Candidate Shortlisted</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-serif">
                          🎉 Congratulations! You have been shortlisted for {mappedApplications.filter(a => a.stage === 'SHORTLISTED').length} teaching {mappedApplications.filter(a => a.stage === 'SHORTLISTED').length > 1 ? 'positions' : 'position'}!
                        </h3>
                        <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                          The HR and Academic Selection Committee have reviewed your profile and shortlisted you for the opening(s) below.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSidebarNav('My Applications');
                          setSelectedStageFilter('SHORTLISTED');
                        }}
                        className="cursor-pointer px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition shrink-0 active:scale-95 flex items-center gap-1.5"
                      >
                        <span>View All Shortlisted</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Shortlisted Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
                      {mappedApplications
                        .filter(a => a.stage === 'SHORTLISTED')
                        .slice(0, 4)
                        .map(app => (
                          <div key={app.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between gap-2.5 text-xs">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase font-bold text-emerald-200">
                                  Shortlisted Post
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-white border border-emerald-300/40">
                                  {app.level} • {app.subject}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">{app.jobTitle}</h4>
                              <p className="text-emerald-100 text-xs flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                                <span>{app.institutionName} • {app.location}</span>
                              </p>
                              <p className="text-amber-200 text-xs font-semibold mt-1">
                                Offered CTC: {app.salary}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <span className="text-[11px] text-emerald-100">
                                Status: <strong>Vetted for Interview</strong>
                              </span>
                              <button
                                onClick={() => setViewingAppDetail(app)}
                                className="cursor-pointer px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg font-bold text-xs transition active:scale-95 shadow-xs"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. SCHEDULED INTERVIEWS ALERT BANNER (If any interview is scheduled) */}
                {interviewsList.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden border border-amber-300/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                          <Video className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span>Interview / Demo Round Confirmed</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-serif">
                          📅 You have {interviewsList.length} Scheduled Interview{interviewsList.length > 1 ? 's' : ''}!
                        </h3>
                        <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
                          Your live demonstration and faculty interview rounds are confirmed. Join links and calendar times are below.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveSidebarNav('Interview Calls')}
                        className="cursor-pointer px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl font-bold text-xs shadow-md transition shrink-0 active:scale-95 flex items-center gap-1.5"
                      >
                        <span>View All Interviews</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Upcoming Interview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
                      {interviewsList.slice(0, 2).map((iv: any) => (
                        <div key={iv.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between gap-2.5 text-xs">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-amber-200">
                                {iv.interviewType || 'Demo Round'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                                {iv.durationMinutes || 45} mins
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">
                              {iv.job?.title || 'Faculty Interview'}
                            </h4>
                            <p className="text-amber-100 text-xs flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                              <span>{iv.institution?.name || 'SikchaKhub'} • {iv.job?.city || 'Online Call'}</span>
                            </p>
                            <p className="text-white text-xs font-semibold mt-1">
                              🕒 Scheduled: {new Date(iv.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>

                          {iv.meetingLink && (
                            <a
                              href={iv.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2 px-3 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                            >
                              <Video className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Join Google Meet Demo</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Applications Pipeline Summary */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Recent Applications
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Your latest teaching vacancy submissions and active stages.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSidebarNav('My Applications')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <span>View All ({mappedApplications.length})</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>

                  {mappedApplications.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 font-medium">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No applications submitted yet</p>
                      <p className="text-xs text-slate-500 mb-3">Explore open teaching roles and apply directly with your educator profile.</p>
                      <button
                        onClick={() => navigate('/jobs')}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Explore Teaching Vacancies</span>
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {mappedApplications.slice(0, 4).map(app => (
                        <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.institutionLogo || '/logo.jpeg'}
                              alt={app.institutionName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                            />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                              <p className="text-[11px] text-slate-500">{app.institutionName} • {app.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStageBadge(app.stage)}
                            <button
                              onClick={() => setViewingAppDetail(app)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                              View Status
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Recommended Vacancies Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                          Top AI Recommended Vacancies
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Openings matched with your subject, experience, and curriculum preferences.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSidebarNav('AI Job Matches')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>See All Matches ({matchedJobs.length})</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedJobs.slice(0, 4).map(job => {
                      const isSaved = savedJobIds.includes(job.id);
                      return (
                        <div key={job.id} className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition bg-slate-50/40 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>{job.matchScore}% AI Match</span>
                                </span>
                                <h3 className="text-sm font-bold text-slate-900 mt-1">{job.title}</h3>
                                <p className="text-xs text-slate-600 font-medium">SikchaKhub</p>
                              </div>
                              <button
                                onClick={() => toggleSaveJob(job.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isSaved ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-400 bg-white border-slate-200 hover:text-slate-700'
                                }`}
                                title={isSaved ? 'Remove from Saved' : 'Save Job'}
                              >
                                <Award className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-2">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{job.city}, {job.state}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">₹{job.minSalaryLPA}-{job.maxSalaryLPA} LPA</span>
                              <span>•</span>
                              <span>{job.teachingLevel}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            {appliedJobIds.has(job.id) ? (
                              <span className="flex-1 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Already Applied ✓</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => setApplyingJob(job)}
                                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-2xs text-center"
                              >
                                Apply Now
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/jobs?q=${encodeURIComponent(job.title)}`)}
                              className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* VIEW B: MY APPLICATIONS */}
            {activeSidebarNav === 'My Applications' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      My Submitted Applications
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      View, filter and track all your applications across schools and coaching institutes.
                    </p>
                  </div>

                  {/* Export List Button */}
                  <button
                    onClick={handleExportApplications}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Filter Row: Search Input */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by school name, role, subject, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage Filter Tabs (Pills) */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-2 border-b border-slate-100 pb-3 -mx-2 px-2">
                  {[
                    { key: 'ALL', label: 'All', count: String(mappedApplications.length) },
                    { key: 'APPLIED', label: 'Applied', count: String(mappedApplications.filter(a => a.stage === 'APPLIED').length) },
                    { key: 'SCREENING', label: 'Screening', count: String(mappedApplications.filter(a => a.stage === 'SCREENING').length) },
                    { key: 'SHORTLISTED', label: 'Shortlisted', count: String(mappedApplications.filter(a => a.stage === 'SHORTLISTED').length) },
                    { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', count: String(mappedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length) },
                    { key: 'SELECTED', label: 'Selected', count: String(mappedApplications.filter(a => a.stage === 'SELECTED').length) },
                    { key: 'REJECTED', label: 'Rejected', count: String(mappedApplications.filter(a => a.stage === 'REJECTED').length) },
                  ].map((st) => {
                    const isActive = selectedStageFilter === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setSelectedStageFilter(st.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-sky-700 text-white' : 'text-slate-500 font-semibold'
                        }`}>
                          {st.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 1. Mobile Applications Card View (Visible on < md screens) */}
                <div className="block md:hidden space-y-3">
                  {mappedApplications.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl p-4">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No applications submitted yet</p>
                      <p className="text-xs text-slate-500 mb-3">Explore open teaching roles and apply directly with your educator profile.</p>
                      <button
                        onClick={() => navigate('/jobs')}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Explore Teaching Vacancies</span>
                      </button>
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl p-4 text-xs">
                      No applications match the selected stage or search criteria.
                    </div>
                  ) : (
                    filteredApps.map((app) => (
                      <div 
                        key={app.id} 
                        className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 ${
                          app.stage === 'SHORTLISTED' 
                            ? 'border-emerald-300 ring-2 ring-emerald-500/10' 
                            : app.stage === 'INTERVIEW_SCHEDULED'
                            ? 'border-amber-300 ring-2 ring-amber-500/10'
                            : 'border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={app.institutionLogo || '/logo.jpeg'}
                              alt={app.institutionName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                                {app.jobTitle}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                                <span>{app.institutionName} • {app.location}</span>
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStageBadge(app.stage)}
                          </div>
                        </div>

                        {/* Shortlisted Highlight for Mobile */}
                        {app.stage === 'SHORTLISTED' && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Shortlisted for <strong>{app.jobTitle}</strong> at <strong>{app.institutionName} ({app.location})</strong>!</span>
                          </div>
                        )}

                        {/* Interview Highlight for Mobile */}
                        {app.interviewDate && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Video className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="truncate">Interview: <strong>{app.interviewDate}</strong></span>
                            </div>
                            {app.meetingLink && (
                              <a
                                href={app.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 text-[10px]"
                              >
                                <span>Join</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Subject & Level</span>
                            <span className="font-bold text-slate-800">{app.subject} ({app.level})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Salary & Location</span>
                            <span className="font-bold text-slate-800">{app.salary} • {app.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-600 text-xs">
                              {app.matchScore}% Match
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${app.matchScore}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {app.appliedDate}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setViewingAppDetail(app)}
                            className="w-full py-2.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-bold text-xs transition text-center shadow-2xs active:scale-[0.99]"
                          >
                            View Application Status
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Desktop Applications Table (Visible on >= md screens) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedAppIds.length === filteredApps.length && filteredApps.length > 0}
                            onChange={handleToggleSelectAll}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                        </th>
                        <th className="py-3 px-3">INSTITUTION & VACANCY</th>
                        <th className="py-3 px-3">SUBJECT & LEVEL</th>
                        <th className="py-3 px-3">SALARY & LOCATION</th>
                        <th className="py-3 px-3">AI MATCH SCORE</th>
                        <th className="py-3 px-3">APPLICATION STATUS</th>
                        <th className="py-3 px-3">APPLIED ON</th>
                        <th className="py-3 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mappedApplications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-800">No applications submitted yet</p>
                            <p className="text-xs text-slate-500 mb-3">Explore open teaching roles and apply directly with your educator profile.</p>
                            <button
                              onClick={() => navigate('/jobs')}
                              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Explore Teaching Vacancies</span>
                            </button>
                          </td>
                        </tr>
                      ) : filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                            No applications match the selected stage or search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredApps.map((app) => {
                          const isSelected = selectedAppIds.includes(app.id);
                          return (
                            <tr 
                              key={app.id} 
                              className={`hover:bg-slate-50/70 transition ${isSelected ? 'bg-sky-50/40' : ''}`}
                            >
                              <td className="py-3.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleApp(app.id)}
                                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.institutionLogo || '/logo.jpeg'}
                                    alt={app.institutionName}
                                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">
                                      {app.jobTitle}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-normal">
                                      {app.institutionName} • {app.location}
                                    </p>
                                    {app.stage === 'SHORTLISTED' && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                                        <Sparkles className="w-3 h-3 text-emerald-600" />
                                        <span>Shortlisted Candidate</span>
                                      </span>
                                    )}
                                    {app.interviewDate && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                                        <Video className="w-3 h-3 text-amber-600" />
                                        <span>Interview: {app.interviewDate}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {app.subject}
                                </p>
                                <p className="text-[11px] text-slate-500 font-normal">
                                  {app.level}
                                </p>
                              </td>

                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {app.salary}
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{app.location}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-bold text-emerald-600 text-xs shrink-0">
                                    {app.matchScore}%
                                  </span>
                                  <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${app.matchScore}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                {getStageBadge(app.stage)}
                              </td>

                              <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">
                                {app.appliedDate}
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() => setViewingAppDetail(app)}
                                  className="px-3.5 py-1.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-bold text-xs transition"
                                >
                                  View Status
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* VIEW C: INTERVIEW CALLS */}
            {activeSidebarNav === 'Interview Calls' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Scheduled Interviews & Demo Rounds</h2>
                    <p className="text-xs text-slate-500">Live recruitment video calls and classroom teaching demonstrations.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {interviewsList.length} Scheduled
                  </span>
                </div>

                {interviewsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No interview calls scheduled yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      When institutions review your applications and shortlist your profile for a Google Meet demo or interview, details and joining links will appear here.
                    </p>
                    <button
                      onClick={() => navigate('/jobs')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Browse More Teaching Jobs</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviewsList.map((iv: any) => (
                      <div key={iv.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3.5 shadow-2xs hover:shadow-xs transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src="/logo.jpeg"
                              alt="SikchaKhub"
                              className="w-11 h-11 rounded-xl object-cover border border-amber-300/40 bg-white shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                {iv.interviewType || 'Interview Round'}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 mt-0.5 font-serif leading-tight truncate">
                                {iv.job?.title || 'Faculty Interview'}
                              </h3>
                              <p className="text-xs text-slate-600 font-medium flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                                <span>SikchaKhub • {iv.job?.city ? `${iv.job.city}, ${iv.job.state || ''}` : 'Academic Campus'}</span>
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            {iv.status || 'SCHEDULED'}
                          </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                              <strong className="text-slate-900 text-xs sm:text-sm">
                                {new Date(iv.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
                              <strong className="text-slate-900 text-xs sm:text-sm">{iv.durationMinutes || 45} mins</strong>
                            </div>
                          </div>

                          {iv.locationDetails && (
                            <div className="pt-2 border-t border-slate-100 text-slate-700">
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Venue / Instructions</span>
                              <p className="text-xs mt-0.5">{iv.locationDetails}</p>
                            </div>
                          )}
                        </div>

                        {iv.meetingLink && (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Scheduled Interview / Demo Call</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW D: SAVED OPENINGS */}
            {activeSidebarNav === 'Saved Openings' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Saved Teaching Openings</h2>
                    <p className="text-xs text-slate-500">Bookmarked vacancies to review and apply at your convenience.</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {savedJobs.length} Bookmarked
                  </span>
                </div>

                {savedJobs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No saved openings yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      Browse verified teaching openings and click the bookmark badge to save roles here.
                    </p>
                    <button
                      onClick={() => navigate('/jobs')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Browse Teaching Vacancies</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedJobs.map(job => (
                      <div key={job.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src="/logo.jpeg"
                                alt="SikchaKhub"
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white"
                              />
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                                <p className="text-xs text-slate-500">SikchaKhub • {job.city}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSaveJob(job.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded-lg transition"
                              title="Remove from saved"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-3">
                            <span className="font-bold text-slate-900">₹{job.minSalaryLPA}-{job.maxSalaryLPA} LPA</span>
                            <span>•</span>
                            <span>{job.teachingLevel}</span>
                            <span>•</span>
                            <span>{job.subject}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          {appliedJobIds.has(job.id) ? (
                            <span className="flex-1 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Already Applied ✓</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setApplyingJob(job)}
                              className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition text-center"
                            >
                              Apply Now
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/jobs?q=${encodeURIComponent(job.title)}`)}
                            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                          >
                            Full Specs
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW E: AI JOB MATCHES */}
            {activeSidebarNav === 'AI Job Matches' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-lg font-extrabold text-slate-900">AI Job Recommendation Engine</h2>
                    </div>
                    <p className="text-xs text-slate-500">Vacancies algorithmically scored against your profile qualifications and preferences.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {matchedJobs.length} AI Matches
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedJobs.map(job => {
                    const isSaved = savedJobIds.includes(job.id);
                    return (
                      <div key={job.id} className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white shadow-2xs hover:shadow-xs transition space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src="/logo.jpeg"
                              alt="SikchaKhub"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white"
                            />
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                              <p className="text-xs text-slate-500">SikchaKhub</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>{job.matchScore}% Match</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                          <div><span className="text-slate-400 block text-[10px]">Subject</span><strong>{job.subject}</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">Salary CTC</span><strong>₹{job.minSalaryLPA}-{job.maxSalaryLPA} LPA</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">Level</span><strong>{job.teachingLevel}</strong></div>
                          <div><span className="text-slate-400 block text-[10px]">Location</span><strong>{job.city}, {job.state}</strong></div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          {appliedJobIds.has(job.id) ? (
                            <span className="flex-1 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Already Applied ✓</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setApplyingJob(job)}
                              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition text-center shadow-2xs"
                            >
                              Apply Now
                            </button>
                          )}
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                              isSaved ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW F: RESUME & PROFILE */}
            {activeSidebarNav === 'Resume & Profile' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Educator Profile & Resume Details</h2>
                    <p className="text-xs text-slate-500">Keep your teaching portfolio updated to get matched with top schools.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Profile Strength: {profile?.profileCompletionScore || 85}%
                  </span>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile changes saved directly to MongoDB Atlas!</span>
                  </div>
                )}

                {/* 1MB Free Setup PDF CV Upload Box */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                        PDF
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Upload Your CV / Resume (PDF)</h3>
                        <p className="text-xs text-slate-500">
                          Format: PDF only • Size limit: 1 MB (Free setup) • Recruiters review this directly to shortlist you.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="cursor-pointer px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{profile?.resumeUrl ? 'Replace PDF CV' : 'Choose PDF CV (Max 1MB)'}</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleCvFileChange}
                          disabled={isUploadingCv}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {isUploadingCv && (
                    <div className="p-3 bg-sky-100 text-sky-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading and verifying PDF document (under 1MB)...</span>
                    </div>
                  )}

                  {cvUploadSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{cvUploadSuccess}</span>
                    </div>
                  )}

                  {cvUploadError && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{cvUploadError}</span>
                    </div>
                  )}

                  {profile?.resumeUrl ? (
                    <div className="p-3.5 rounded-xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate max-w-xs">
                            {profile.resumeFileName || 'Educator_Resume.pdf'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            Active PDF CV attached • Visible to hiring schools & coaching institutes
                          </span>
                        </div>
                      </div>
                      <a
                        href={profile.resumeUrl.startsWith('http') || profile.resumeUrl.startsWith('data:') ? profile.resumeUrl : apiUrl(profile.resumeUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview Uploaded PDF</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      No CV uploaded yet. Uploading your 1MB PDF CV increases your interview match score by 25%.
                    </p>
                  )}
                </div>

                <form onSubmit={handleSaveProfileForm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Senior Physics Faculty (IIT-JEE & CBSE)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. M.Sc. Physics, B.Ed."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Years of Teaching Experience</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current City / Location</label>
                      <input
                        type="text"
                        value={currentCity}
                        onChange={(e) => setCurrentCity(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Kota, Delhi NCR, Bhopal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expected Salary (LPA)</label>
                      <input
                        type="number"
                        value={expectedSalaryLPA}
                        onChange={(e) => setExpectedSalaryLPA(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. 18"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Bio & Pedagogy</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      placeholder="Describe your classroom teaching methodology, student rank history, or boards results..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW G: SETTINGS */}
            {activeSidebarNav === 'Settings' && (
              <div className="space-y-6">
                
                {/* Account Details Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-extrabold text-slate-900">Account Details</h2>
                    <p className="text-xs text-slate-500">Update your verified personal identity and contact number.</p>
                  </div>

                  {accountSuccessMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{accountSuccessMsg}</span>
                    </div>
                  )}

                  {accountErrorMsg && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>{accountErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={accountFullName}
                          onChange={(e) => setAccountFullName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email (Verified)</label>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="flex-1 font-medium">{user.email}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-200 focus-within:border-sky-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full text-xs py-1 bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                        <input
                          type="number"
                          value={accountAge}
                          onChange={(e) => setAccountAge(Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingAccount}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingAccount ? 'Saving...' : 'Update Account'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password & Security Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-extrabold text-slate-900">Security & Password</h2>
                    <p className="text-xs text-slate-500">Change your login password securely encrypted in database.</p>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="At least 6 characters"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{isChangingPassword ? 'Changing Password...' : 'Change Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </main>

        </div>
      </div>

      {/* Application Detail Modal */}
      {viewingAppDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={viewingAppDetail.institutionLogo || '/logo.jpeg'}
                  alt={viewingAppDetail.institutionName}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-300/40 bg-white shadow-2xs shrink-0"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight font-serif">
                    {viewingAppDetail.jobTitle}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {viewingAppDetail.institutionName} • {viewingAppDetail.location}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {viewingAppDetail.subject} • {viewingAppDetail.level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingAppDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">Current Pipeline Stage</span>
                  <div className="mt-1">{getStageBadge(viewingAppDetail.stage)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">AI Match Score</span>
                  <span className="text-base font-black text-emerald-600">{viewingAppDetail.matchScore}%</span>
                </div>
              </div>

              {/* Shortlist Notification Detail */}
              {viewingAppDetail.stage === 'SHORTLISTED' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Candidate Shortlisted by Academic Committee / HR!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Congratulations! You have been shortlisted for the post of <strong>{viewingAppDetail.jobTitle}</strong> at <strong>{viewingAppDetail.institutionName} ({viewingAppDetail.location})</strong>.
                  </p>
                  <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your profile meets syllabus qualifications. An interview or classroom demo call will be scheduled shortly.</span>
                  </div>
                </div>
              )}

              {/* Scheduled Interview Details */}
              {(viewingAppDetail.meetingLink || viewingAppDetail.interviewDate) && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Video className="w-4 h-4 text-amber-700" />
                    <span>Scheduled Demo & Faculty Interview Call</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Post / Vacancy</span>
                      <strong className="text-slate-900 text-xs">{viewingAppDetail.jobTitle}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round Type</span>
                      <strong className="text-slate-900 text-xs">{viewingAppDetail.interviewType || 'Video Demo Round'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date & Time</span>
                      <strong className="text-slate-900 text-xs">{viewingAppDetail.interviewDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                      <strong className="text-slate-900 text-xs">{viewingAppDetail.durationMinutes || 45} mins</strong>
                    </div>
                  </div>
                  {viewingAppDetail.locationDetails && (
                    <div className="p-2 rounded-xl bg-white/70 border border-amber-200/60 text-xs text-amber-900">
                      <strong>Venue / Note:</strong> {viewingAppDetail.locationDetails}
                    </div>
                  )}
                  {viewingAppDetail.meetingLink && (
                    <a
                      href={viewingAppDetail.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Scheduled Google Meet / Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingAppDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Notifications Drawer / Modal */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
                    {unreadNotifCount > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                        {unreadNotifCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Smart vacancy notifications tailored for you</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline px-2 py-1"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsInboxOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
              {inboxNotifications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">No Notifications Yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      You will receive smart push alerts when schools post vacancies matching your profile and preferences.
                    </p>
                  </div>
                  {notifPermission === 'default' && (
                    <button
                      onClick={handleEnablePush}
                      disabled={isEnablingPush}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isEnablingPush ? 'Enabling...' : 'Enable Push Notifications'}</span>
                    </button>
                  )}
                </div>
              ) : (
                inboxNotifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`pt-3 first:pt-0 p-3 rounded-2xl transition ${
                      notif.isRead ? 'bg-white hover:bg-slate-50/60' : 'bg-sky-50/40 hover:bg-sky-50/70 border border-sky-100/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span>
                              {notif.createdAt
                                ? new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Just now'}
                            </span>
                            {notif.actionUrl && (
                              <a
                                href={notif.actionUrl}
                                target={notif.actionUrl.startsWith('http') ? '_blank' : '_self'}
                                rel="noreferrer"
                                onClick={async () => {
                                  if (!notif.isRead && token) {
                                    try {
                                      await fetch(apiUrl(`/api/v1/notifications/inbox/${notif.id}/read`), {
                                        method: 'PATCH',
                                        headers: { Authorization: `Bearer ${token}` },
                                      });
                                      refetchInbox();
                                    } catch (e) {}
                                  }
                                }}
                                className="font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5"
                              >
                                <span>View Vacancy</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Push status: <strong className="font-semibold text-slate-700">{notifPermission}</strong>
              </span>
              <button
                onClick={() => setIsInboxOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Job Modal */}
      {applyingJob && (
        <ApplyJobModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onAppliedSuccess={() => {
            setApplyingJob(null);
            refetchApps();
            setExportNotice('Application submitted successfully!');
            setTimeout(() => setExportNotice(null), 3000);
          }}
        />
      )}

    </div>
  );
};
