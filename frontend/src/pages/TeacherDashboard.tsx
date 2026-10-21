import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { JobApplication, Interview } from '@sikchakhub/shared-types';

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
  const { user, profile, token, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeSidebarNav, setActiveSidebarNav] = useState('Overview');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [viewingAppDetail, setViewingAppDetail] = useState<any | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Profile Form state
  const [headline, setHeadline] = useState(profile?.headline || 'Senior Physics Faculty (IIT-JEE & CBSE)');
  const [bio, setBio] = useState(profile?.bio || 'Experienced physics educator specializing in JEE Advanced mechanics and modern physics.');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 5);
  const [highestQualification, setHighestQualification] = useState(profile?.highestQualification || 'M.Sc., B.Ed.');
  const [currentCity, setCurrentCity] = useState(profile?.currentCity || 'Bhopal, MP');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState(profile?.expectedSalaryLPA || 20);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Fetch real applications
  const { data: appsData, refetch: refetchApps } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/v1/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch scheduled interviews
  const { data: interviewsData } = useQuery({
    queryKey: ['my-interviews', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/v1/interviews/my-interviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Base applications matching the cohesive design system
  const defaultJobSeekerApplications: any[] = [
    {
      id: 'teacher-app-1',
      jobTitle: 'Senior Physics Faculty (IIT-JEE Advanced & Main)',
      institutionName: 'Apex IIT Academy',
      institutionLogo: '/logo.jpeg',
      subject: 'Physics',
      level: 'Coaching (JEE Advanced)',
      salary: '₹18 - 28 LPA',
      location: 'Kota, Rajasthan',
      matchScore: 92,
      stage: 'SHORTLISTED',
      appliedDate: '12 Aug 2024',
      interviewDate: '24 Aug 2024, 03:00 PM',
      meetingLink: 'https://meet.google.com/sik-rec-apex',
    },
    {
      id: 'teacher-app-2',
      jobTitle: 'PGT Physics & Department In-Charge',
      institutionName: 'Cambridge International School',
      institutionLogo: '/logo.jpeg',
      subject: 'Physics',
      level: 'Senior Secondary (PGT)',
      salary: '₹12 - 16 LPA',
      location: 'Bhopal, MP',
      matchScore: 86,
      stage: 'SCREENING',
      appliedDate: '14 Aug 2024',
    },
    {
      id: 'teacher-app-3',
      jobTitle: 'Senior Chemistry & Science Educator',
      institutionName: 'Delhi Public Heritage Academy',
      institutionLogo: '/logo.jpeg',
      subject: 'Chemistry',
      level: 'High School (TGT/PGT)',
      salary: '₹15 - 22 LPA',
      location: 'Indore, MP',
      matchScore: 82,
      stage: 'INTERVIEW_SCHEDULED',
      appliedDate: '16 Aug 2024',
      interviewDate: '26 Aug 2024, 11:30 AM',
      meetingLink: 'https://meet.google.com/del-her-demo',
    },
    {
      id: 'teacher-app-4',
      jobTitle: 'JEE Advanced Physics Trainer',
      institutionName: 'Allen Career Institute',
      institutionLogo: '/logo.jpeg',
      subject: 'Physics',
      level: 'Coaching (JEE/NEET)',
      salary: '₹20 - 32 LPA',
      location: 'Kota, Rajasthan',
      matchScore: 78,
      stage: 'APPLIED',
      appliedDate: '18 Aug 2024',
    },
    {
      id: 'teacher-app-5',
      jobTitle: 'Assistant Professor (Applied Physics)',
      institutionName: 'LNCT University Campus',
      institutionLogo: '/logo.jpeg',
      subject: 'Applied Physics',
      level: 'University Faculty',
      salary: '₹14 - 18 LPA',
      location: 'Bhopal, MP',
      matchScore: 90,
      stage: 'INTERVIEW_SCHEDULED',
      appliedDate: '19 Aug 2024',
      interviewDate: '28 Aug 2024, 02:00 PM',
      meetingLink: 'https://meet.google.com/lnct-univ-demo',
    }
  ];

  const liveApplications: any[] = appsData?.applications || [];
  const mappedLiveApps = liveApplications.map(la => ({
    id: la.id,
    jobTitle: la.job?.title || 'Senior Faculty Vacancy',
    institutionName: la.job?.institution?.name || 'Verified School',
    institutionLogo: la.job?.institution?.logoUrl || '/logo.jpeg',
    subject: la.job?.subject || 'Physics',
    level: la.job?.teachingLevel || 'PGT',
    salary: `₹${la.job?.minSalaryLPA || 12} - ${la.job?.maxSalaryLPA || 20} LPA`,
    location: `${la.job?.city || 'Bhopal'}, ${la.job?.state || 'MP'}`,
    matchScore: la.matchResult?.overallScore || 85,
    stage: la.stage || 'APPLIED',
    appliedDate: la.appliedAt ? new Date(la.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
  }));

  const combinedApplications = mappedLiveApps.length > 0
    ? [
        ...mappedLiveApps,
        ...defaultJobSeekerApplications.filter(da => !mappedLiveApps.some(mla => mla.id === da.id))
      ]
    : defaultJobSeekerApplications;

  // Filtering
  const filteredApps = combinedApplications.filter(app => {
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
    setTimeout(() => setProfileSaveSuccess(false), 2500);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-200">
          {exportNotice}
        </div>
      )}

      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* 1. LEFT SIDEBAR (Job Seeker / Educator) */}
          <aside className="w-full lg:w-60 shrink-0 space-y-6">
            
            {/* Educator Identity Card */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'SK'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {user?.fullName || 'Sumit Kumar'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profile?.highestQualification || 'M.Sc., B.Ed.'} | {profile?.currentCity || 'Bhopal, MP'}
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
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">
                  {combinedApplications.length}
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
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">
                  {combinedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length}
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
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">
                  8
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
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                  14
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
          <main className="flex-1 min-w-0 space-y-6">
            
            {/* Welcome Greeting & Page Title Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome back, <strong className="text-sky-600 font-bold">{user?.fullName || 'Sumit Kumar'}</strong> 👋
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Job Seeker Dashboard
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Verified Educator</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Track applications, AI recruitment match scores, and scheduled interview calls.
                </p>
              </div>

              {/* Big Green Browse Jobs Button */}
              <button
                onClick={() => navigate('/jobs')}
                className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm flex items-center gap-2 transition active:scale-[0.99] shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Browse Teaching Vacancies</span>
              </button>
            </div>

            {/* 3. 4 TOP STAT CARDS (Exact match to screenshot style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Card 1: Active Applications */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Active Applications</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      {liveApplications.length > 0 ? liveApplications.length : defaultJobSeekerApplications.length}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span>↑ Live tracked</span>
                    </span>
                  </div>
                </div>
                <MiniBarGraphic color="sky" />
              </div>

              {/* Card 2: Total Profile Views */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Profile Views</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      428
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span>↑ 18% by recruiters</span>
                    </span>
                  </div>
                </div>
                <MiniBarGraphic color="sky" />
              </div>

              {/* Card 3: Shortlisted Applications */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Shortlisted Pool</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      {combinedApplications.filter(a => a.stage === 'SHORTLISTED').length}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span>&gt; 80% Match score</span>
                    </span>
                  </div>
                </div>
                <MiniBarGraphic color="emerald" />
              </div>

              {/* Card 4: Interviews & Demos */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition group flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Interviews & Demos</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      {combinedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <span>Google Meet scheduled</span>
                    </span>
                  </div>
                </div>
                <MiniBarGraphic color="purple" />
              </div>

            </div>

            {/* 4. MAIN APPLICATION MANAGEMENT / PIPELINE SECTION */}
            {activeSidebarNav !== 'Resume & Profile' ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Applicant Management
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
                    <span>Export List</span>
                  </button>
                </div>

                {/* Filter Row: Subject Select + Search Input + Filters Button */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
                  
                  {/* Vacancy / Domain Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 shrink-0">Vacancy Opening:</span>
                    <div className="relative flex-1 md:w-96">
                      <select
                        value={selectedSubjectFilter}
                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 shadow-2xs focus:outline-none focus:border-sky-500 appearance-none"
                      >
                        <option value="ALL">All Applied Roles (Physics, Chemistry & Math)</option>
                        <option value="Physics">Physics Faculty Roles (₹18-28L)</option>
                        <option value="Chemistry">Chemistry Faculty Roles (₹15-22L)</option>
                        <option value="Applied Physics">Applied Physics University Roles</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search candidate or school name */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search candidate name, email or skills..."
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

                  {/* Filters Button */}
                  <button
                    onClick={() => setShowFiltersModal(!showFiltersModal)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                    <span>Filters</span>
                  </button>
                </div>

                {/* Stage Filter Tabs (Pills) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-100 pb-3">
                  {[
                    { key: 'ALL', label: 'All', count: String(combinedApplications.length) },
                    { key: 'APPLIED', label: 'Applied', count: String(combinedApplications.filter(a => a.stage === 'APPLIED').length) },
                    { key: 'SCREENING', label: 'Screening', count: String(combinedApplications.filter(a => a.stage === 'SCREENING').length) },
                    { key: 'SHORTLISTED', label: 'Shortlisted', count: String(combinedApplications.filter(a => a.stage === 'SHORTLISTED').length) },
                    { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', count: String(combinedApplications.filter(a => a.stage === 'INTERVIEW_SCHEDULED').length) },
                    { key: 'SELECTED', label: 'Selected', count: String(combinedApplications.filter(a => a.stage === 'SELECTED').length) },
                    { key: 'REJECTED', label: 'Rejected', count: String(combinedApplications.filter(a => a.stage === 'REJECTED').length) },
                  ].map((st) => {
                    const isActive = selectedStageFilter === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setSelectedStageFilter(st.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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

                {/* 5. APPLICATIONS TABLE */}
                <div className="overflow-x-auto">
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
                        <th className="py-3 px-3">CANDIDATE & PROFILE</th>
                        <th className="py-3 px-3">SUBJECT & DEGREE</th>
                        <th className="py-3 px-3">EXPERIENCE / LOCATION</th>
                        <th className="py-3 px-3">AI MATCH SCORE</th>
                        <th className="py-3 px-3">CURRENT STAGE</th>
                        <th className="py-3 px-3">APPLIED ON</th>
                        <th className="py-3 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.length === 0 ? (
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
                              {/* Checkbox */}
                              <td className="py-3.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleApp(app.id)}
                                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                              </td>

                              {/* Candidate & Profile / School */}
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.institutionLogo || '/logo.jpeg'}
                                    alt={app.institutionName}
                                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">
                                      {app.institutionName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-normal">
                                      {app.jobTitle}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Subject & Degree */}
                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {app.subject}
                                </p>
                                <p className="text-[11px] text-slate-500 font-normal">
                                  {app.level}
                                </p>
                              </td>

                              {/* Salary / Location */}
                              <td className="py-3.5 px-3">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {app.salary}
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{app.location}</span>
                                </div>
                              </td>

                              {/* AI Match Score with Progress Bar */}
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

                              {/* Current Stage */}
                              <td className="py-3.5 px-3">
                                {getStageBadge(app.stage)}
                              </td>

                              {/* Applied On Date */}
                              <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">
                                {app.appliedDate}
                              </td>

                              {/* Actions: View Profile / Status & 3 dots */}
                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setViewingAppDetail(app)}
                                    className="px-3.5 py-1.5 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-bold text-xs transition"
                                  >
                                    View Status
                                  </button>
                                  <button
                                    onClick={() => setViewingAppDetail(app)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                                  >
                                    <MoreVertical className="w-4 h-4" />
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
            ) : (
              /* Profile & Resume Form Tab */
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Educator Profile & Resume Details</h2>
                    <p className="text-xs text-slate-500">Keep your teaching portfolio updated to get matched with top schools.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Profile Strength: 92%
                  </span>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile changes saved directly to MongoDB Atlas!</span>
                  </div>
                )}

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
                  className="w-12 h-12 rounded-xl object-cover border border-amber-300/40 bg-white"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {viewingAppDetail.institutionName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">{viewingAppDetail.jobTitle}</p>
                  <p className="text-[11px] text-slate-400">{viewingAppDetail.location}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingAppDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
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

              {viewingAppDetail.meetingLink && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Video className="w-4 h-4 text-amber-700" />
                    <span>Scheduled Demo & Interview Call</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Date & Time: <strong>{viewingAppDetail.interviewDate}</strong>
                  </p>
                  <a
                    href={viewingAppDetail.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                  >
                    <span>Join Google Meet Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingAppDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
