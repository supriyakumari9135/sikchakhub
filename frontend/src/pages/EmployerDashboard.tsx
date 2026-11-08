import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  Video,
  KeyRound,
  Mail,
  Phone,
  AlertCircle,
  Save,
  Globe,
  Award,
  Upload,
  Eye,
  Loader2
} from 'lucide-react';
import { JobVacancy, JobApplication, ApplicationStage } from '@sikchakhub/shared-types';
import { CandidateMatchDrawer } from '../components/CandidateMatchDrawer';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { PostJobModal } from '../components/PostJobModal';
import { QuickCvReviewModal } from '../components/QuickCvReviewModal';
import { UploadCandidateCvModal } from '../components/UploadCandidateCvModal';
import { apiUrl } from '../config/api';
import { JobPosterAuthCard } from '../components/JobPosterAuthCard';

// Mini Bar Chart graphic matching the 4 stat cards in screenshot
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

export const EmployerDashboard: React.FC = () => {
  const { user, institution, token, isLoading, updateAccount, changePassword } = useAuth();

  const [activeSidebarNav, setActiveSidebarNav] = useState('Overview');
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [topRankingFilter, setTopRankingFilter] = useState<'TOP50' | 'TOP60' | 'HIGH80' | 'ALL'>('TOP50');
  const [searchCandidate, setSearchCandidate] = useState<string>('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Modals & Drawers
  const [evaluatingApplication, setEvaluatingApplication] = useState<JobApplication | null>(null);
  const [schedulingApplication, setSchedulingApplication] = useState<JobApplication | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showUploadCandidateModal, setShowUploadCandidateModal] = useState(false);
  const [reviewingCandidateIndex, setReviewingCandidateIndex] = useState<number | null>(null);

  // Settings / Account state
  const [accountFullName, setAccountFullName] = useState(user?.fullName || '');
  const [accountPhone, setAccountPhone] = useState(user?.phone || '');
  const [accountAge, setAccountAge] = useState(user?.age || 32);
  const [orgName, setOrgName] = useState(institution?.name || '');
  const [orgType, setOrgType] = useState(institution?.type || 'SCHOOL');
  const [orgCity, setOrgCity] = useState(institution?.city || '');
  const [orgState, setOrgState] = useState(institution?.state || '');
  const [orgWebsite, setOrgWebsite] = useState(institution?.website || '');
  const [orgAffiliation, setOrgAffiliation] = useState(institution?.affiliationNumber || '');
  const [orgDescription, setOrgDescription] = useState(institution?.description || '');
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

  // Sync state when institution or user updates
  useEffect(() => {
    if (user) {
      setAccountFullName(user.fullName || '');
      setAccountPhone(user.phone || '');
      setAccountAge(user.age || 32);
    }
    if (institution) {
      setOrgName(institution.name || '');
      setOrgType(institution.type || 'SCHOOL');
      setOrgCity(institution.city || '');
      setOrgState(institution.state || '');
      setOrgWebsite(institution.website || '');
      setOrgAffiliation(institution.affiliationNumber || '');
      setOrgDescription(institution.description || '');
    }
  }, [user, institution]);

  // Fetch employer stats from real backend database
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['employer-stats', token],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/applications/stats/employer'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch employer jobs
  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/jobs'));
      return res.json();
    },
  });

  const jobs: JobVacancy[] = jobsData?.jobs || [];
  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Fetch candidates for selected job (or 'ALL' for entire vacancy pipeline)
  const { data: candidatesData, refetch: refetchCandidates } = useQuery({
    queryKey: ['job-candidates', selectedJobId, selectedStageFilter],
    queryFn: async () => {
      const stageParam = selectedStageFilter !== 'ALL' ? `&stage=${selectedStageFilter}` : '';
      const targetId = selectedJobId || 'ALL';
      const res = await fetch(apiUrl(`/api/v1/applications/job/${targetId}?limit=100${stageParam}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch scheduled interviews for recruiter
  const { data: interviewsData, refetch: refetchInterviews } = useQuery({
    queryKey: ['employer-interviews', token],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/interviews/my-interviews'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const employerInterviews: any[] = interviewsData?.interviews || [];
  const combinedCandidates: JobApplication[] = candidatesData?.candidates || [];

  // Strictly rank candidates by ATS match score descending (highest ATS score first)
  const atsRankedCandidates = [...combinedCandidates].sort(
    (a, b) => (b.matchResult?.overallScore || 0) - (a.matchResult?.overallScore || 0)
  );

  // Apply ATS Top 50 / Top 60 / High 80% / All ranking filter
  let rankingFiltered = atsRankedCandidates;
  if (topRankingFilter === 'TOP50') {
    rankingFiltered = atsRankedCandidates.slice(0, 50);
  } else if (topRankingFilter === 'TOP60') {
    rankingFiltered = atsRankedCandidates.slice(0, 60);
  } else if (topRankingFilter === 'HIGH80') {
    rankingFiltered = atsRankedCandidates.filter(c => (c.matchResult?.overallScore || 0) >= 80);
  }

  // Filter candidates by search query and stage
  const filteredCandidates = rankingFiltered.filter(c => {
    if (selectedStageFilter !== 'ALL' && c.stage !== selectedStageFilter) {
      return false;
    }
    if (searchCandidate) {
      const q = searchCandidate.toLowerCase();
      const matchName = c.teacher?.fullName?.toLowerCase().includes(q);
      const matchEmail = c.teacher?.email?.toLowerCase().includes(q);
      const matchSubject = c.teacher?.profile?.subjects?.some((s: string) => s.toLowerCase().includes(q));
      const matchCity = c.teacher?.profile?.currentCity?.toLowerCase().includes(q);
      const matchJob = (c as any).job?.title?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSubject && !matchCity && !matchJob) {
        return false;
      }
    }
    return true;
  });

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/applications/${appId}/stage`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        setExportNotice(`Applicant status moved to ${newStage.replace('_', ' ')}.`);
        setTimeout(() => setExportNotice(null), 3000);
      }
      refetchCandidates();
      refetchStats();
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(apiUrl(`/api/v1/jobs/${jobId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setExportNotice(`Job vacancy is now ${nextStatus}.`);
        setTimeout(() => setExportNotice(null), 3000);
        refetchJobs();
        refetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map(c => c.id));
    }
  };

  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
      organizationName: orgName,
      type: orgType,
      city: orgCity,
      state: orgState,
      website: orgWebsite,
      affiliationNumber: orgAffiliation,
      description: orgDescription,
    });

    setIsSavingAccount(false);
    if (res.success) {
      setAccountSuccessMsg('Organization and Recruiter details updated successfully!');
      setTimeout(() => setAccountSuccessMsg(null), 3000);
    } else {
      setAccountErrorMsg(res.message || 'Failed to update details');
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
      setPasswordSuccessMsg('Password changed securely in MongoDB Atlas!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 3000);
    } else {
      setPasswordErrorMsg(res.message || 'Failed to change password. Please check your current password.');
    }
  };

  const handleExportList = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Candidate Name,Email,Subject,Experience,City,Match Score,Stage,Applied Date"]
        .concat(filteredCandidates.map(c => 
          `"${c.teacher?.fullName || 'Applicant'}","${c.teacher?.email || ''}","${c.teacher?.profile?.subjects?.join(' ') || ''}","${c.teacher?.profile?.experienceYears != null ? `${c.teacher.profile.experienceYears} Yrs` : ''}","${c.teacher?.profile?.currentCity || ''}","${c.matchResult?.overallScore != null ? `${c.matchResult.overallScore}%` : 'N/A'}","${c.stage}","${c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : 'N/A'}"`
        )).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_export_${selectedJobId || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice("Applicant CSV list exported successfully!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortlisted</span>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
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

  const totalApplicantsCount = statsData?.stats?.totalApplicants ?? combinedCandidates.length;
  const shortlistedCount = statsData?.stats?.shortlistedPool ?? combinedCandidates.filter(c => c.stage === 'SHORTLISTED').length;
  const interviewCount = statsData?.stats?.interviewsAndDemos ?? (employerInterviews.length || combinedCandidates.filter(c => c.stage === 'INTERVIEW_SCHEDULED').length);

  // Auth & loading guards placed after all hook invocations to maintain strict Hook ordering
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading institution portal...</p>
      </div>
    );
  }

  if (!user || user.role !== 'EMPLOYER') {
    return <JobPosterAuthCard />;
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
              <img
                src={institution?.logoUrl || '/logo.jpeg'}
                alt="SikshaHub School Logo"
                className="w-10 h-10 rounded-xl object-cover border border-amber-300/50 bg-white shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {institution?.name || 'SikshaHub Recruiter'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-2 h-2 text-emerald-600" />
                  <span>Verified Organization</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Role</span>
            </button>
          </div>

          {/* Mobile Scrollable Horizontal Pill Nav */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-3 px-3">
            {[
              { id: 'Overview', label: 'Overview', icon: Briefcase, count: null },
              { id: 'Job Openings', label: 'Openings', icon: FileText, count: jobs.length },
              { id: 'Applicants', label: 'Applicants', icon: Users, count: totalApplicantsCount },
              { id: 'Shortlisted', label: 'Shortlisted', icon: UserCheck, count: shortlistedCount },
              { id: 'Interviews', label: 'Interviews', icon: Calendar, count: interviewCount },
              { id: 'Reports', label: 'Reports', icon: TrendingUp, count: null },
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
            
            {/* Organization Identity Card */}
            <div className="flex items-center gap-3">
              <img
                src={institution?.logoUrl || '/logo.jpeg'}
                alt="SikshaHub School Logo"
                className="w-12 h-12 rounded-xl object-cover border border-amber-300/50 bg-white shadow-2xs"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {institution?.name || 'SikshaHub Institution'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {institution?.affiliationNumber || 'CBSE'} | {institution?.city || 'India'}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Verified Organization</span>
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
                onClick={() => setActiveSidebarNav('Job Openings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Job Openings'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>Job Openings</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Job Openings' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {jobs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Applicants')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Applicants'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Applicants</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Applicants' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {totalApplicantsCount}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Shortlisted')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Shortlisted'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4" />
                  <span>Shortlisted</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Shortlisted' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {shortlistedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Interviews')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Interviews'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span>Interviews</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSidebarNav === 'Interviews' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  {interviewCount}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarNav('Reports')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  activeSidebarNav === 'Reports'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Reports</span>
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
                <p className="text-xs font-bold text-slate-800">Need Recruiter Help?</p>
                <p className="text-[11px] text-slate-500">Our support team is here</p>
              </div>
              <button
                onClick={() => window.open('tel:9783143866')}
                className="w-full py-1.5 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 rounded-xl border border-sky-200 transition shadow-2xs"
              >
                Contact Support
              </button>
            </div>
          </aside>

          {/* 2. RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 space-y-5 sm:space-y-6">
            
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome back, <strong className="text-sky-600 font-bold">{user?.fullName || 'Recruiter'}</strong> 👋
                </p>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Recruiter Dashboard
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                    <span>Verified Organization</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">
                  Manage vacancies, screen applicants and schedule interviews all in one place.
                </p>
              </div>

              {/* Big Green Post Vacancy Button (hidden on mobile, present in mobile top bar) */}
              <button
                onClick={() => setShowPostJobModal(true)}
                className="hidden sm:flex px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm items-center gap-2 transition active:scale-[0.99] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Vacancy Opening</span>
              </button>
            </div>

            {/* 3. 4 TOP STAT CARDS (Responsive: 2-column on mobile, 4-column on desktop) */}
            {(activeSidebarNav === 'Overview' || activeSidebarNav === 'Applicants') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Card 1: Active Openings */}
                <div 
                  onClick={() => setActiveSidebarNav('Job Openings')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Active Openings</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {jobs.filter(j => j.status === 'ACTIVE').length || jobs.length}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>Live published</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="sky" />
                  </div>
                </div>

                {/* Card 2: Total Applicants */}
                <div 
                  onClick={() => setActiveSidebarNav('Applicants')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Total Applicants</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {totalApplicantsCount}
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

                {/* Card 3: Shortlisted Pool */}
                <div 
                  onClick={() => {
                    setActiveSidebarNav('Shortlisted');
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
                        {shortlistedCount}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span>Top candidates</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <MiniBarGraphic color="emerald" />
                  </div>
                </div>

                {/* Card 4: Interviews & Demos */}
                <div 
                  onClick={() => setActiveSidebarNav('Interviews')}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block truncate">Interviews & Demos</span>
                      <span className="text-lg sm:text-2xl font-black text-slate-900 block leading-tight">
                        {interviewCount}
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

            {/* VIEW 1: OVERVIEW */}
            {activeSidebarNav === 'Overview' && (
              <div className="space-y-6">
                
                {/* Quick Vacancies Preview */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Active Job Openings
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Current teaching vacancies published across India.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSidebarNav('Job Openings')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <span>Manage All ({jobs.length})</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>

                  {jobs.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-medium">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No vacancies created yet</p>
                      <p className="text-xs text-slate-500 mb-3">Post a teaching opening to receive candidate profiles.</p>
                      <button
                        onClick={() => setShowPostJobModal(true)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post Vacancy Opening</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {jobs.slice(0, 3).map(j => (
                        <div key={j.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              {j.teachingLevel} • {j.subject}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-2">{j.title}</h3>
                            <p className="text-xs text-slate-500">{j.city}, {j.state} • ₹{j.minSalaryLPA}-{j.maxSalaryLPA}L</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                            <span className="text-xs font-bold text-slate-700">
                              {j.totalApplicants || 0} Applicants
                            </span>
                            <button
                              onClick={() => {
                                setSelectedJobId(j.id);
                                setActiveSidebarNav('Applicants');
                              }}
                              className="text-xs font-bold text-sky-600 hover:text-sky-700"
                            >
                              Screen Applicants →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Candidates Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Recent Applicant Pipeline
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Latest educator applications received for your vacancies.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSidebarNav('Applicants')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <span>View All Pipeline</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>

                  {combinedCandidates.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-medium">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No applicants yet for this vacancy</p>
                      <p className="text-xs text-slate-500">When teachers apply to your openings, their profile and AI match score will appear here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {combinedCandidates.slice(0, 4).map(c => (
                        <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.teacher?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.teacher?.fullName || 'Educator')}`}
                              alt={c.teacher?.fullName}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{c.teacher?.fullName || 'Applicant'}</h4>
                              <p className="text-[11px] text-slate-500">{c.teacher?.email} • {c.teacher?.profile?.currentCity || 'India'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600">
                              {c.matchResult?.overallScore || 85}% Match
                            </span>
                            {getStageBadge(c.stage)}
                            {c.stage !== 'SHORTLISTED' && (
                              <button
                                onClick={() => handleStageChange(c.id, 'SHORTLISTED')}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition"
                                title="Direct Shortlist Candidate"
                              >
                                Shortlist
                              </button>
                            )}
                            <button
                              onClick={() => setEvaluatingApplication(c)}
                              className="px-3 py-1.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 text-xs font-bold transition"
                            >
                              View Profile & CV
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW 2: JOB OPENINGS */}
            {activeSidebarNav === 'Job Openings' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Manage Job Openings</h2>
                    <p className="text-xs text-slate-500">Create, review, pause or close teaching vacancies published by your institution.</p>
                  </div>
                  <button
                    onClick={() => setShowPostJobModal(true)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Vacancy</span>
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No job openings created yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Create your first vacancy to start receiving verified teacher applications and AI screening scores.
                    </p>
                    <button
                      onClick={() => setShowPostJobModal(true)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Vacancy</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Job Openings Card View (< md) */}
                    <div className="block md:hidden space-y-3">
                      {jobs.map(j => (
                        <div key={j.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                                {j.teachingLevel} • {j.subject}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 mt-1.5">{j.title}</h3>
                              <p className="text-xs text-slate-500">{j.city}, {j.state} • {j.board}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              j.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {j.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Salary CTC</span>
                              <strong className="text-slate-900 font-bold">₹{j.minSalaryLPA}-{j.maxSalaryLPA} LPA</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Applicants</span>
                              <strong className="text-sky-700 font-bold">{j.totalApplicants || 0} candidates</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setSelectedJobId(j.id);
                                setActiveSidebarNav('Applicants');
                              }}
                              className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition text-center shadow-2xs"
                            >
                              View Applicants ({j.totalApplicants || 0})
                            </button>
                            <button
                              onClick={() => handleToggleJobStatus(j.id, j.status)}
                              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
                            >
                              {j.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Job Openings Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-3">VACANCY ROLE</th>
                            <th className="py-3 px-3">SUBJECT & LEVEL</th>
                            <th className="py-3 px-3">SALARY CTC</th>
                            <th className="py-3 px-3">LOCATION</th>
                            <th className="py-3 px-3">APPLICANTS</th>
                            <th className="py-3 px-3">STATUS</th>
                            <th className="py-3 px-3 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {jobs.map(j => (
                            <tr key={j.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">{j.title}</p>
                                <p className="text-[11px] text-slate-400">Created: {new Date(j.createdAt).toLocaleDateString()}</p>
                              </td>
                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-800">{j.subject}</p>
                                <p className="text-[11px] text-slate-500">{j.teachingLevel} • {j.board}</p>
                              </td>
                              <td className="py-3.5 px-3 font-bold text-slate-900">
                                ₹{j.minSalaryLPA} - {j.maxSalaryLPA} LPA
                              </td>
                              <td className="py-3.5 px-3 text-slate-600">
                                {j.city}, {j.state}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                                  {j.totalApplicants || 0} candidates
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  j.status === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {j.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedJobId(j.id);
                                    setActiveSidebarNav('Applicants');
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-bold text-xs transition"
                                >
                                  View Applicants
                                </button>
                                <button
                                  onClick={() => handleToggleJobStatus(j.id, j.status)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                                >
                                  {j.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* VIEW 3: APPLICANTS PIPELINE */}
            {activeSidebarNav === 'Applicants' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Applicant Management
                      </h2>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>ATS Auto-Ranked</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Review, screen, and rank all candidate CVs sorted automatically by ATS score.
                    </p>
                  </div>

                  {/* Header Actions: Upload Candidate CV + Export */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowUploadCandidateModal(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-2xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
                      title="Upload offline/email candidate resume and auto-score"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Candidate CV</span>
                    </button>
                    <button
                      onClick={handleExportList}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter Row: Vacancy Opening Select + Search Input */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
                  
                  {/* Vacancy Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">Vacancy Opening:</span>
                    <div className="relative flex-1 md:w-96">
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 shadow-2xs focus:outline-none focus:border-sky-500 appearance-none"
                      >
                        <option value="ALL">
                          ★ All Vacancy Openings ({combinedCandidates.length} Total Applicants • ATS Ranked)
                        </option>
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>
                            {j.title} ({j.subject} • ₹{j.minSalaryLPA}-{j.maxSalaryLPA}L)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search candidate */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search candidate name, email, subject, city, or job..."
                      value={searchCandidate}
                      onChange={(e) => setSearchCandidate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500"
                    />
                    {searchCandidate && (
                      <button 
                        onClick={() => setSearchCandidate('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ATS Auto-Ranking Mode Quick Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-emerald-50/70 p-3 rounded-2xl border border-sky-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        ATS Candidate Ranking
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Showing candidates ordered strictly by ATS match score
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: 'TOP50', label: 'Top 50 Ranked CVs', badge: 'Fast Review' },
                      { key: 'TOP60', label: 'Top 60 Ranked CVs', badge: 'Expanded' },
                      { key: 'HIGH80', label: 'Score ≥ 80%', badge: 'High Match' },
                      { key: 'ALL', label: 'All Applicants', badge: `${combinedCandidates.length}` },
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setTopRankingFilter(f.key as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          topRankingFilter === f.key
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          topRankingFilter === f.key ? 'bg-slate-800 text-emerald-400 font-mono font-bold' : 'bg-slate-100 text-slate-500 font-medium'
                        }`}>
                          {f.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stage Filter Tabs (Pills) */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-2 border-b border-slate-100 pb-3 -mx-2 px-2">
                  {[
                    { key: 'ALL', label: 'All', count: combinedCandidates.length },
                    { key: 'APPLIED', label: 'Applied', count: combinedCandidates.filter(c => c.stage === 'APPLIED').length },
                    { key: 'SCREENING', label: 'Screening', count: combinedCandidates.filter(c => c.stage === 'SCREENING').length },
                    { key: 'SHORTLISTED', label: 'Shortlisted', count: combinedCandidates.filter(c => c.stage === 'SHORTLISTED').length },
                    { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', count: combinedCandidates.filter(c => c.stage === 'INTERVIEW_SCHEDULED').length },
                    { key: 'SELECTED', label: 'Selected', count: combinedCandidates.filter(c => c.stage === 'SELECTED').length },
                    { key: 'REJECTED', label: 'Rejected', count: combinedCandidates.filter(c => c.stage === 'REJECTED').length },
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

                {/* 1. Mobile Candidate Card View (Visible on < md screens) */}
                <div className="block md:hidden space-y-3">
                  {jobs.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl p-4">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No job openings created yet</p>
                      <p className="text-xs text-slate-500 mb-3">Post your first vacancy to start receiving and screening candidate applications.</p>
                      <button
                        onClick={() => setShowPostJobModal(true)}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post First Vacancy</span>
                      </button>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl p-4 text-xs">
                      No applicants match the selected stage or search criteria for this vacancy.
                    </div>
                  ) : (
                    filteredCandidates.map((cand, idx) => {
                      const matchScore = cand.matchResult?.overallScore || 85;
                      const rawCv = cand.resumeUrl || cand.teacher?.profile?.resumeUrl;
                      const cvLink = rawCv ? (rawCv.startsWith('http') || rawCv.startsWith('data:') ? rawCv : apiUrl(rawCv)) : null;

                      return (
                        <div 
                          key={cand.id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                #{idx + 1}
                              </span>
                              <img
                                src={cand.teacher?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cand.teacher?.fullName || 'Educator')}`}
                                alt={cand.teacher?.fullName}
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                                  {cand.teacher?.fullName || 'Applicant'}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {cand.teacher?.email}
                                </p>
                              </div>
                            </div>
                            <div>
                              {getStageBadge(cand.stage)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Applied Role</span>
                              <span className="font-bold text-slate-800 truncate block">{(cand as any).job?.title || 'Teaching Role'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Exp & Location</span>
                              <span className="font-bold text-slate-800 truncate block">{cand.teacher?.profile?.experienceYears ?? 0} Yrs • {cand.teacher?.profile?.currentCity || 'India'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                matchScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}>
                                {matchScore}% ATS
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${matchScore >= 80 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                  style={{ width: `${matchScore}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {cand.appliedAt ? new Date(cand.appliedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setReviewingCandidateIndex(idx)}
                              className="py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition flex items-center justify-center gap-1 active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View CV</span>
                            </button>

                            {cand.stage !== 'SHORTLISTED' ? (
                              <button
                                onClick={() => handleStageChange(cand.id, 'SHORTLISTED')}
                                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Shortlist</span>
                              </button>
                            ) : (
                              <div className="py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Shortlisted</span>
                              </div>
                            )}

                            <button
                              onClick={() => setEvaluatingApplication(cand)}
                              className="py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition text-center"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 2. Desktop Candidate Table (Visible on >= md screens) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2 w-10 text-center">RANK</th>
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedCandidateIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                            onChange={handleToggleSelectAll}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                        </th>
                        <th className="py-3 px-3">CANDIDATE & PROFILE</th>
                        <th className="py-3 px-3">APPLIED ROLE</th>
                        <th className="py-3 px-3">SUBJECT & DEGREE</th>
                        <th className="py-3 px-3">EXPERIENCE / CITY</th>
                        <th className="py-3 px-3">ATS MATCH SCORE</th>
                        <th className="py-3 px-3">CV RESUME</th>
                        <th className="py-3 px-3">STAGE</th>
                        <th className="py-3 px-3">APPLIED ON</th>
                        <th className="py-3 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-800">No job openings created yet</p>
                            <p className="text-xs text-slate-500 mb-3">Post your first vacancy to start receiving and screening candidate applications.</p>
                            <button
                              onClick={() => setShowPostJobModal(true)}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Post First Vacancy</span>
                            </button>
                          </td>
                        </tr>
                      ) : filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                            No applicants match the selected stage or search criteria for this vacancy.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((cand, idx) => {
                          const isSelected = selectedCandidateIds.includes(cand.id);
                          const matchScore = cand.matchResult?.overallScore || 85;
                          const rawCv = cand.resumeUrl || cand.teacher?.profile?.resumeUrl;
                          const cvLink = rawCv ? (rawCv.startsWith('http') || rawCv.startsWith('data:') ? rawCv : apiUrl(rawCv)) : null;

                          return (
                            <tr 
                              key={cand.id} 
                              className={`hover:bg-slate-50/70 transition ${isSelected ? 'bg-sky-50/40' : ''}`}
                            >
                              {/* ATS Rank column */}
                              <td className="py-3.5 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black ${
                                  idx === 0 
                                    ? 'bg-amber-400 text-slate-900 shadow-2xs' 
                                    : idx === 1 
                                    ? 'bg-slate-200 text-slate-800' 
                                    : idx === 2 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  #{idx + 1}
                                </span>
                              </td>

                              <td className="py-3.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleCandidate(cand.id)}
                                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={cand.teacher?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cand.teacher?.fullName || 'Educator')}`}
                                    alt={cand.teacher?.fullName}
                                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">
                                      {cand.teacher?.fullName || 'Applicant'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-normal">
                                      {cand.teacher?.email || ''}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="font-semibold text-slate-800 block text-xs truncate max-w-[140px]">
                                  {(cand as any).job?.title || 'Teaching Role'}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {(cand as any).job?.teachingLevel || 'Senior'}
                                </span>
                              </td>

                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {cand.teacher?.profile?.subjects?.[0] || 'Teaching Faculty'}
                                </p>
                                <p className="text-[11px] text-slate-500 font-normal">
                                  {cand.teacher?.profile?.highestQualification || 'Graduate / B.Ed'}
                                </p>
                              </td>

                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {cand.teacher?.profile?.experienceYears ?? 0} Years
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{cand.teacher?.profile?.currentCity || 'India'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                    matchScore >= 80 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : matchScore >= 60 
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {matchScore}%
                                  </span>
                                  <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${matchScore >= 80 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                      style={{ width: `${matchScore}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* CV Resume (PDF) Column with Click to View CV */}
                              <td className="py-3.5 px-3">
                                {cvLink ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setReviewingCandidateIndex(idx)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition shadow-2xs group"
                                      title="Review candidate CV with ATS breakdown"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition" />
                                      <span>View CV</span>
                                    </button>
                                    <a
                                      href={cvLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                      title="Open PDF in new tab"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setReviewingCandidateIndex(idx)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition"
                                  >
                                    <span>Review Profile</span>
                                  </button>
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                {getStageBadge(cand.stage)}
                              </td>

                              <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">
                                {cand.appliedAt ? new Date(cand.appliedAt).toLocaleDateString() : 'N/A'}
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {cand.stage !== 'SHORTLISTED' && (
                                    <button
                                      onClick={() => handleStageChange(cand.id, 'SHORTLISTED')}
                                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs active:scale-95"
                                      title="Direct Shortlist Candidate"
                                    >
                                      Shortlist
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setEvaluatingApplication(cand)}
                                    className="px-3 py-1.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-bold text-xs transition"
                                  >
                                    View Profile
                                  </button>
                                </div>
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

            {/* VIEW 4: SHORTLISTED POOL */}
            {activeSidebarNav === 'Shortlisted' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Shortlisted Candidate Pool</h2>
                    <p className="text-xs text-slate-500">High-scoring candidates ready for classroom demonstrations and interview calls.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {combinedCandidates.filter(c => c.stage === 'SHORTLISTED').length} Shortlisted
                  </span>
                </div>

                {combinedCandidates.filter(c => c.stage === 'SHORTLISTED').length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No candidates shortlisted yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Review applications in the Applicants tab and shortlist candidates with &gt; 80% match scores.
                    </p>
                    <button
                      onClick={() => setActiveSidebarNav('Applicants')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Go to Applicants Pipeline
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combinedCandidates.filter(c => c.stage === 'SHORTLISTED').map(cand => (
                      <div key={cand.id} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={cand.teacher?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cand.teacher?.fullName || 'Educator')}`}
                              alt={cand.teacher?.fullName}
                              className="w-11 h-11 rounded-full object-cover border border-emerald-300 bg-white"
                            />
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{cand.teacher?.fullName}</h3>
                              <p className="text-xs text-slate-500">{cand.teacher?.email} • {cand.teacher?.profile?.currentCity}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {cand.matchResult?.overallScore || 90}%
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                          <p><strong>Subject:</strong> {cand.teacher?.profile?.subjects?.join(', ') || 'Teaching'}</p>
                          <p><strong>Experience:</strong> {cand.teacher?.profile?.experienceYears || 0} Years</p>
                          <p><strong>Qualification:</strong> {cand.teacher?.profile?.highestQualification}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setSchedulingApplication(cand)}
                            className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Interview</span>
                          </button>
                          <button
                            onClick={() => setEvaluatingApplication(cand)}
                            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: INTERVIEWS */}
            {activeSidebarNav === 'Interviews' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Scheduled Interviews & Demo Rounds</h2>
                    <p className="text-xs text-slate-500">Google Meet demos and campus interview appointments.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {employerInterviews.length} Scheduled
                  </span>
                </div>

                {employerInterviews.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-slate-800">No interviews scheduled yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Go to the Applicants or Shortlisted tab to schedule a demo session or HR interview with an educator.
                    </p>
                    <button
                      onClick={() => setActiveSidebarNav('Applicants')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      View Candidates to Schedule
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employerInterviews.map((iv: any) => (
                      <div key={iv.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{iv.teacher?.fullName || 'Educator Candidate'}</h3>
                            <p className="text-xs text-slate-500">{iv.job?.title || 'Faculty Role'}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            {iv.status}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-amber-200/80 text-xs space-y-1">
                          <p><strong>Type:</strong> {iv.interviewType || 'DEMO_CLASS'}</p>
                          <p><strong>Scheduled Time:</strong> {new Date(iv.scheduledTime).toLocaleString()}</p>
                          <p><strong>Duration:</strong> {iv.durationMinutes || 45} minutes</p>
                        </div>

                        {iv.meetingLink && (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Google Meet Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 6: REPORTS & ANALYTICS */}
            {activeSidebarNav === 'Reports' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900">Recruitment Analytics & Insights</h2>
                  <p className="text-xs text-slate-500">Real-time metrics on candidate conversion and vacancy velocity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Total Vacancies</span>
                    <span className="text-2xl font-black text-slate-900 block">{jobs.length}</span>
                    <span className="text-[11px] text-sky-700 font-medium">Published openings</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Shortlist Rate</span>
                    <span className="text-2xl font-black text-slate-900 block">
                      {totalApplicantsCount > 0 ? Math.round((shortlistedCount / totalApplicantsCount) * 100) : 0}%
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">Qualified educator ratio</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Interviews Conducted</span>
                    <span className="text-2xl font-black text-slate-900 block">{interviewCount}</span>
                    <span className="text-[11px] text-purple-700 font-medium">Demo sessions booked</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Recruitment Funnel Breakdown</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Applications Received', count: totalApplicantsCount, color: 'bg-sky-500' },
                      { label: 'Screened Candidates', count: combinedCandidates.filter(c => c.stage !== 'APPLIED').length, color: 'bg-blue-500' },
                      { label: 'Shortlisted Pool', count: shortlistedCount, color: 'bg-emerald-500' },
                      { label: 'Interview Scheduled', count: interviewCount, color: 'bg-amber-500' },
                      { label: 'Selected for Offer', count: combinedCandidates.filter(c => c.stage === 'SELECTED').length, color: 'bg-green-600' },
                    ].map(st => (
                      <div key={st.label} className="space-y-1">
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>{st.label}</span>
                          <span className="font-bold text-slate-900">{st.count}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${st.color} rounded-full`}
                            style={{
                              width: `${totalApplicantsCount > 0 ? Math.max(5, Math.round((st.count / totalApplicantsCount) * 100)) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 7: SETTINGS */}
            {activeSidebarNav === 'Settings' && (
              <div className="space-y-6">
                
                {/* Organization & Recruiter Profile */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-extrabold text-slate-900">Institution & Recruiter Profile</h2>
                    <p className="text-xs text-slate-500">Update school details and recruiter contact information stored in MongoDB Atlas.</p>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution / Organization Name</label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution Type</label>
                        <select
                          value={orgType}
                          onChange={(e) => setOrgType(e.target.value as any)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                        >
                          <option value="SCHOOL">School (K-12)</option>
                          <option value="COACHING_INSTITUTE">IIT-JEE / NEET Coaching Institute</option>
                          <option value="COLLEGE">Degree College / University</option>
                          <option value="EDTECH">EdTech Platform</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation / Reg Number</label>
                        <input
                          type="text"
                          value={orgAffiliation}
                          onChange={(e) => setOrgAffiliation(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                          placeholder="e.g. CBSE/AFF/2024"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 focus-within:border-sky-500">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={orgWebsite}
                            onChange={(e) => setOrgWebsite(e.target.value)}
                            placeholder="https://myschool.edu.in"
                            className="w-full text-xs bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                        <input
                          type="text"
                          value={orgCity}
                          onChange={(e) => setOrgCity(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                        <input
                          type="text"
                          value={orgState}
                          onChange={(e) => setOrgState(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Full Name</label>
                        <input
                          type="text"
                          value={accountFullName}
                          onChange={(e) => setAccountFullName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Recruiter Phone</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 focus-within:border-sky-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            className="w-full text-xs bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institution Overview & Culture</label>
                      <textarea
                        rows={3}
                        value={orgDescription}
                        onChange={(e) => setOrgDescription(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingAccount}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingAccount ? 'Saving...' : 'Update Organization Details'}</span>
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

      {/* Evaluating Candidate Match Drawer */}
      {evaluatingApplication && (
        <CandidateMatchDrawer
          application={evaluatingApplication}
          onClose={() => setEvaluatingApplication(null)}
          onScheduleInterview={(app) => {
            setEvaluatingApplication(null);
            setSchedulingApplication(app);
          }}
          onStageChange={(appId, stage) => {
            handleStageChange(appId, stage);
            setEvaluatingApplication(null);
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {schedulingApplication && (
        <ScheduleInterviewModal
          application={schedulingApplication}
          onClose={() => setSchedulingApplication(null)}
          onSuccess={() => {
            setSchedulingApplication(null);
            setExportNotice("Interview scheduled and candidate moved to Interview Scheduled stage!");
            setTimeout(() => setExportNotice(null), 3000);
            refetchCandidates();
            refetchStats();
            refetchInterviews();
          }}
        />
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <PostJobModal
          onClose={() => setShowPostJobModal(false)}
          onJobCreated={() => {
            setShowPostJobModal(false);
            setExportNotice("New job opening published successfully!");
            setTimeout(() => setExportNotice(null), 3000);
            refetchJobs();
            refetchStats();
          }}
        />
      )}

      {/* Instant CV Review Modal (Fast-Review Top 50-60 Ranked CVs) */}
      {reviewingCandidateIndex !== null && filteredCandidates[reviewingCandidateIndex] && (
        <QuickCvReviewModal
          candidates={filteredCandidates}
          currentIndex={reviewingCandidateIndex}
          onClose={() => setReviewingCandidateIndex(null)}
          onSelectCandidateIndex={(idx) => setReviewingCandidateIndex(idx)}
          onStageChange={(appId, stage) => {
            handleStageChange(appId, stage);
            refetchCandidates();
            refetchStats();
          }}
          onScheduleInterview={(app) => {
            setReviewingCandidateIndex(null);
            setSchedulingApplication(app);
          }}
          onCandidateUpdated={() => {
            refetchCandidates();
            refetchStats();
          }}
        />
      )}

      {/* Recruiter Candidate CV Upload Modal */}
      {showUploadCandidateModal && (
        <UploadCandidateCvModal
          jobs={jobs}
          initialJobId={selectedJobId !== 'ALL' ? selectedJobId : jobs[0]?.id}
          onClose={() => setShowUploadCandidateModal(false)}
          onCandidateUploaded={() => {
            refetchCandidates();
            refetchStats();
            setExportNotice("Candidate CV uploaded and ranked by ATS!");
            setTimeout(() => setExportNotice(null), 3000);
          }}
        />
      )}

    </div>
  );
};
