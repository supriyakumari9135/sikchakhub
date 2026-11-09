import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Briefcase, 
  TrendingUp, 
  FileText,
  MapPin,
  Lock,
  Search,
  ExternalLink,
  Loader2,
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  Database,
  Bell,
  Settings,
  ShieldCheck,
  UserPlus,
  Download,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Send,
  Sliders,
  Check,
  Menu,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { apiUrl } from '../config/api';

// Modular Admin Modals
import { AdminCvPreviewModal } from '../components/admin/AdminCvPreviewModal';
import { TeacherDossierModal, TeacherEditModal } from '../components/admin/AdminTeacherModals';
import { EmployerDossierModal, EmployerEditModal, VerificationActionModal } from '../components/admin/AdminEmployerModals';
import { JobDetailsModal, JobEditModal } from '../components/admin/AdminJobModals';
import { ApplicationDossierModal, StageCorrectionModal } from '../components/admin/AdminAppModals';
import { AddMasterDataModal, EditMasterDataModal } from '../components/admin/AdminMasterDataModals';
import { AddStaffModal, AddHrModal } from '../components/admin/AdminStaffModals';
import { AdminNotificationsManager } from '../components/admin/AdminNotificationsManager';
import { ReviewReportModal } from '../components/admin/AdminReportModals';
import { AdminCvScreeningVault } from '../components/admin/AdminCvScreeningVault';
import { AdminCandidateGroupsManager } from '../components/admin/AdminCandidateGroupsManager';

type AdminTab = 
  | 'DASHBOARD'
  | 'TEACHERS'
  | 'EMPLOYERS'
  | 'VERIFICATION'
  | 'JOBS'
  | 'APPLICATIONS'
  | 'DOCUMENTS'
  | 'CANDIDATE_GROUPS'
  | 'ANALYTICS'
  | 'MASTER_DATA'
  | 'REPORTS'
  | 'NOTIFICATIONS'
  | 'STAFF'
  | 'EXPORTS'
  | 'SETTINGS'
  | 'AUDIT_LOGS';

export const AdminDashboard: React.FC = () => {
  const { user, token, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // -------------------------------------------------------------
  // Filter States
  // -------------------------------------------------------------
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState('ALL');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState('ALL');

  const [employerSearch, setEmployerSearch] = useState('');
  const [employerTypeFilter, setEmployerTypeFilter] = useState('ALL');
  const [employerStatusFilter, setEmployerStatusFilter] = useState('ALL');

  const [jobSearch, setJobSearch] = useState('');
  const [jobSubjectFilter, setJobSubjectFilter] = useState('ALL');
  const [jobLevelFilter, setJobLevelFilter] = useState('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');

  const [appSearch, setAppSearch] = useState('');
  const [appStageFilter, setAppStageFilter] = useState('ALL');

  const [masterCategoryTab, setMasterCategoryTab] = useState<'SUBJECT' | 'TEACHING_CATEGORY' | 'QUALIFICATION' | 'BOARD' | 'CITY'>('SUBJECT');

  // -------------------------------------------------------------
  // Modals Active State
  // -------------------------------------------------------------
  const [previewCvDoc, setPreviewCvDoc] = useState<any | null>(null);

  // Teacher Modals
  const [selectedTeacherForDossier, setSelectedTeacherForDossier] = useState<any | null>(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<any | null>(null);

  // Employer Modals
  const [selectedEmployerForDossier, setSelectedEmployerForDossier] = useState<any | null>(null);
  const [selectedEmployerForEdit, setSelectedEmployerForEdit] = useState<any | null>(null);
  const [verificationDecisionTarget, setVerificationDecisionTarget] = useState<{ institution: any; decision: 'VERIFIED' | 'REJECTED' } | null>(null);

  // Job Modals
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any | null>(null);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any | null>(null);

  // Application Modals
  const [selectedAppForDossier, setSelectedAppForDossier] = useState<any | null>(null);
  const [selectedAppForStageCorrection, setSelectedAppForStageCorrection] = useState<any | null>(null);

  // Master Data Modals
  const [isAddMasterDataOpen, setIsAddMasterDataOpen] = useState(false);
  const [selectedMasterDataForEdit, setSelectedMasterDataForEdit] = useState<any | null>(null);

  // Staff & Report Modals
  const isHrMode = user?.role === 'HR' || user?.adminRole === 'HR';
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddHrModalOpen, setIsAddHrModalOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<'ADMINS' | 'HR'>('ADMINS');
  const [selectedReportForReview, setSelectedReportForReview] = useState<any | null>(null);

  // Notification Composer
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'ALL' | 'TEACHERS' | 'EMPLOYERS'>('ALL');
  const [broadcastPriority, setBroadcastPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Platform Settings Form
  const [settingsForm, setSettingsForm] = useState({
    siteName: 'SikshaHub.AI',
    supportEmail: 'support@sikchakhub.ai',
    supportPhone: '+91 9783143866',
    maxCvUploadSizeMB: 1,
    maintenanceMode: false,
    autoApproveJobs: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // -------------------------------------------------------------
  // Authorized Fetch Helper (Handles auto-logout on 401 token expiry)
  // -------------------------------------------------------------
  const authFetch = async (url: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        handleLogout();
        throw new Error('Admin session expired. Please sign in again.');
      }
      return res.json();
    } catch (err: any) {
      console.warn('API query warning:', err.message);
      throw err;
    }
  };

  // -------------------------------------------------------------
  // Real Queries (MongoDB Atlas Connected)
  // -------------------------------------------------------------
  const { data: kpiData, refetch: refetchKpis } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/kpis')),
    enabled: !!token,
    staleTime: 5000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/analytics')),
    enabled: !!token,
    staleTime: 5000,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/recent-activities')),
    enabled: !!token,
    staleTime: 5000,
  });

  const { data: teachersData, refetch: refetchTeachers } = useQuery({
    queryKey: ['admin-teachers', teacherSearch, teacherSubjectFilter, teacherStatusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (teacherSearch) params.append('q', teacherSearch);
      if (teacherSubjectFilter !== 'ALL') params.append('subject', teacherSubjectFilter);
      if (teacherStatusFilter !== 'ALL') params.append('status', teacherStatusFilter);
      return authFetch(apiUrl(`/api/v1/admin/teachers?${params.toString()}`));
    },
    enabled: !!token,
  });

  const { data: employersData, refetch: refetchEmployers } = useQuery({
    queryKey: ['admin-employers', employerSearch, employerTypeFilter, employerStatusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (employerSearch) params.append('q', employerSearch);
      if (employerTypeFilter !== 'ALL') params.append('type', employerTypeFilter);
      if (employerStatusFilter !== 'ALL') params.append('verificationStatus', employerStatusFilter);
      return authFetch(apiUrl(`/api/v1/admin/employers?${params.toString()}`));
    },
    enabled: !!token,
  });

  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['admin-jobs', jobSearch, jobSubjectFilter, jobLevelFilter, jobStatusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (jobSearch) params.append('q', jobSearch);
      if (jobSubjectFilter !== 'ALL') params.append('subject', jobSubjectFilter);
      if (jobLevelFilter !== 'ALL') params.append('teachingLevel', jobLevelFilter);
      if (jobStatusFilter !== 'ALL') params.append('status', jobStatusFilter);
      return authFetch(apiUrl(`/api/v1/admin/jobs?${params.toString()}`));
    },
    enabled: !!token,
  });

  const { data: applicationsData, refetch: refetchApplications } = useQuery({
    queryKey: ['admin-applications', appSearch, appStageFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (appSearch) params.append('q', appSearch);
      if (appStageFilter !== 'ALL') params.append('stage', appStageFilter);
      return authFetch(apiUrl(`/api/v1/admin/applications?${params.toString()}`));
    },
    enabled: !!token,
  });

  const { data: documentsData, refetch: refetchDocuments } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/documents')),
    enabled: !!token,
  });

  const { data: masterDataItems, refetch: refetchMasterData } = useQuery({
    queryKey: ['admin-master-data', masterCategoryTab],
    queryFn: () => authFetch(apiUrl(`/api/v1/admin/master-data?category=${masterCategoryTab}`)),
    enabled: !!token,
  });

  const { data: reportsData, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/reports')),
    enabled: !!token,
  });

  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/notifications')),
    enabled: !!token,
  });

  const { data: staffData, refetch: refetchStaff } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/staff')),
    enabled: !!token,
  });

  const { data: hrData, refetch: refetchHr } = useQuery({
    queryKey: ['admin-hr-accounts'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/hr-accounts')),
    enabled: !!token && !isHrMode,
  });
  const hrAccounts = hrData?.hrAccounts || [];

  const { data: candidateGroupsData, refetch: refetchCandidateGroups } = useQuery({
    queryKey: ['admin-candidate-groups'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/candidate-groups')),
    enabled: !!token,
  });
  const candidateGroups = candidateGroupsData?.groups || [];

  const handleAddHr = async (data: any) => {
    const res = await fetch(apiUrl('/api/v1/admin/hr-accounts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      showToast(result.message || 'HR Recruiter provisioned successfully!', 'success');
      refetchHr();
    } else {
      throw new Error(result.message || 'Failed to create HR recruiter');
    }
  };

  const handleToggleHrStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/hr-accounts/${id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`HR account marked as ${newStatus}.`, 'success');
        refetchHr();
      } else {
        showToast(result.message || 'Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDeleteHr = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove HR account for "${name}"?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/hr-accounts/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || 'HR account deleted.', 'success');
        refetchHr();
      } else {
        showToast(result.message || 'Failed to delete HR account', 'error');
      }
    } catch (e) {
      showToast('Error deleting HR account', 'error');
    }
  };

  const { data: initialSettingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const data = await authFetch(apiUrl('/api/v1/admin/settings'));
      if (data.settings) {
        setSettingsForm({
          siteName: data.settings.siteName || 'SikshaHub.AI',
          supportEmail: data.settings.supportEmail || 'support@sikchakhub.ai',
          supportPhone: data.settings.supportPhone || '+91 9783143866',
          maxCvUploadSizeMB: data.settings.maxCvUploadSizeMB ?? 1,
          maintenanceMode: !!data.settings.maintenanceMode,
          autoApproveJobs: !!data.settings.autoApproveJobs,
        });
      }
      return data;
    },
    enabled: !!token,
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => authFetch(apiUrl('/api/v1/admin/audit-logs')),
    enabled: !!token,
  });

  // Extract query payloads
  const kpis = kpiData?.kpis || {
    totalTeachers: 0,
    totalEmployers: 0,
    totalVerifiedInstitutions: 0,
    pendingInstitutions: 0,
    totalActiveVacancies: 0,
    pendingJobApprovals: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    interviewsScheduled: 0,
    selectedCandidates: 0,
  };

  const teachers = teachersData?.teachers || [];
  const employers = employersData?.employers || [];
  const jobs = jobsData?.jobs || [];
  const applications = applicationsData?.applications || [];
  const documents = documentsData?.documents || [];
  const masterItems = masterDataItems?.items || [];
  const reports = reportsData?.reports || [];
  const notifications = notificationsData?.notifications || [];
  const staff = staffData?.staff || [];
  const auditLogs = auditData?.logs || [];
  const activities = activitiesData?.activities || [];
  const analytics = analyticsData?.analytics;

  const pendingVerificationInstitutions = useMemo(() => {
    return employers.filter((e: any) => e.verificationStatus === 'PENDING');
  }, [employers]);

  const pendingReportsCount = useMemo(() => {
    return reports.filter((r: any) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW').length;
  }, [reports]);

  // -------------------------------------------------------------
  // Handlers for Data Mutations
  // -------------------------------------------------------------

  // Teacher Handlers
  const handleSaveTeacher = async (teacherId: string, updates: any) => {
    const res = await fetch(apiUrl(`/api/v1/admin/teachers/${teacherId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast('Teacher profile administratively updated.');
      refetchTeachers();
      refetchKpis();
    }
  };

  const handleToggleTeacherStatus = async (teacherId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const res = await fetch(apiUrl(`/api/v1/admin/teachers/${teacherId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus, reason: `Status toggled by administrator` }),
    });
    if (res.ok) {
      showToast(`Teacher account is now ${nextStatus}.`);
      refetchTeachers();
      if (selectedTeacherForDossier) {
        setSelectedTeacherForDossier({ ...selectedTeacherForDossier, status: nextStatus });
      }
    }
  };

  // Employer Handlers
  const handleSaveEmployer = async (institutionId: string, updates: any) => {
    const res = await fetch(apiUrl(`/api/v1/admin/employers/${institutionId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast('Institution details updated successfully.');
      refetchEmployers();
    }
  };

  const handleVerifyInstitutionDecision = async (institutionId: string, status: 'VERIFIED' | 'REJECTED', notes: string) => {
    const res = await fetch(apiUrl('/api/v1/admin/verify-institution'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ institutionId, status, notes }),
    });
    if (res.ok) {
      showToast(`Institution verification decision confirmed: ${status}`);
      refetchEmployers();
      refetchKpis();
    }
  };

  const handleToggleEmployerStatus = async (institutionId: string, status: string, reason?: string) => {
    const res = await fetch(apiUrl(`/api/v1/admin/employers/${institutionId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ verificationStatus: status, reason }),
    });
    if (res.ok) {
      showToast(`Institution status updated to ${status}.`);
      refetchEmployers();
      refetchKpis();
    }
  };

  // Job Handlers
  const handleSaveJob = async (jobId: string, updates: any) => {
    const res = await fetch(apiUrl(`/api/v1/admin/jobs/${jobId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast('Vacancy moderated and saved.');
      refetchJobs();
      refetchKpis();
    }
  };

  const handleChangeJobStatus = async (jobId: string, status: string, reason?: string) => {
    const res = await fetch(apiUrl(`/api/v1/admin/jobs/${jobId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, reason }),
    });
    if (res.ok) {
      showToast(`Vacancy status changed to ${status}.`);
      refetchJobs();
      refetchKpis();
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to remove this job vacancy from public listings?')) return;
    const res = await fetch(apiUrl(`/api/v1/admin/jobs/${jobId}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast('Vacancy removed and closed.');
      refetchJobs();
      refetchKpis();
      if (selectedJobForDetails) setSelectedJobForDetails(null);
    }
  };

  // Application Handlers
  const handleSaveAppStage = async (applicationId: string, stage: string, reason: string) => {
    const res = await fetch(apiUrl(`/api/v1/admin/applications/${applicationId}/stage`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stage, reason }),
    });
    if (res.ok) {
      showToast(`Application stage overridden to ${stage}.`);
      refetchApplications();
      refetchKpis();
    }
  };

  // Master Data Handlers
  const handleAddMasterData = async (data: { category: string; label: string; value: string; order: number }) => {
    const res = await fetch(apiUrl('/api/v1/admin/master-data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast(`New ${data.category} added to platform dropdowns.`);
      refetchMasterData();
    }
  };

  const handleSaveMasterData = async (id: string, updates: any) => {
    const res = await fetch(apiUrl(`/api/v1/admin/master-data/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast('Master data entry saved.');
      refetchMasterData();
    }
  };

  const handleToggleMasterDataActive = async (item: any) => {
    const res = await fetch(apiUrl(`/api/v1/admin/master-data/${item.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) {
      showToast(`Master data option ${!item.isActive ? 'activated' : 'deactivated'}.`);
      refetchMasterData();
    }
  };

  // Staff Handlers
  const handleAddStaff = async (data: any) => {
    const res = await fetch(apiUrl('/api/v1/admin/staff'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create staff');
    showToast(`Staff member ${data.fullName} provisioned with ${data.adminRole} role.`);
    refetchStaff();
  };

  // Report Handlers
  const handleResolveReport = async (reportId: string, status: string, resolutionNotes: string) => {
    const res = await fetch(apiUrl(`/api/v1/admin/reports/${reportId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, resolutionNotes }),
    });
    if (res.ok) {
      showToast(`Moderation report marked as ${status}.`);
      refetchReports();
    }
  };

  // Broadcast Announcement
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setIsSendingBroadcast(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/notifications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          targetAudience: broadcastAudience,
          priority: broadcastPriority,
        }),
      });
      if (res.ok) {
        showToast(`Announcement broadcast to ${broadcastAudience}!`);
        setBroadcastTitle('');
        setBroadcastMessage('');
        refetchNotifications();
      }
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Save Settings
  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        showToast('Platform settings saved successfully.');
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  // CSV Report Generator Helper
  const downloadExport = async (type: string, filename: string) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/export/${type}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`${filename} downloaded successfully.`);
    } catch (err) {
      showToast('Export failed to download', 'error');
    }
  };

  // -------------------------------------------------------------
  // Auth Check
  // -------------------------------------------------------------
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading administrator console...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'HR')) {
    return <Navigate to="/" replace />;
  }

  // -------------------------------------------------------------
  // Navigation Menu Definition
  // -------------------------------------------------------------
  interface NavItem {
    id: AdminTab;
    label: string;
    icon: any;
    count?: number;
    badge?: number;
  }

  const navSections: { group: string; items: NavItem[] }[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'DASHBOARD' as AdminTab, label: 'Overview & KPIs', icon: LayoutDashboard },
        { id: 'ANALYTICS' as AdminTab, label: 'Recruitment Analytics', icon: BarChart3 },
        { id: 'AUDIT_LOGS' as AdminTab, label: 'Security & Audit Trail', icon: ShieldCheck },
      ],
    },
    {
      group: 'USERS & INSTITUTIONS',
      items: [
        { id: 'TEACHERS' as AdminTab, label: 'Teachers / Job Seekers', icon: Users, count: kpis.totalTeachers },
        { id: 'EMPLOYERS' as AdminTab, label: 'Employers / Institutions', icon: Building2, count: kpis.totalEmployers },
        { id: 'VERIFICATION' as AdminTab, label: 'Institution Approvals', icon: CheckCircle2, badge: pendingVerificationInstitutions.length },
      ],
    },
    {
      group: 'RECRUITMENT & SHORTLISTING',
      items: [
        { id: 'DOCUMENTS' as AdminTab, label: 'CV Screening & Vault', icon: FileText, count: documents.length },
        { id: 'CANDIDATE_GROUPS' as AdminTab, label: 'Candidate Shortlists / Groups', icon: Layers, count: candidateGroups.length },
        { id: 'JOBS' as AdminTab, label: 'Job Postings Moderation', icon: Briefcase, count: kpis.totalActiveVacancies },
        { id: 'APPLICATIONS' as AdminTab, label: 'Candidate Applications', icon: FileSpreadsheet, count: kpis.totalApplications },
      ],
    },
    {
      group: 'PLATFORM GOVERNANCE',
      items: [
        { id: 'MASTER_DATA' as AdminTab, label: 'Categories & Master Data', icon: Database },
        { id: 'REPORTS' as AdminTab, label: 'Reports & Moderation', icon: AlertTriangle, badge: pendingReportsCount },
        { id: 'NOTIFICATIONS' as AdminTab, label: 'Broadcast Notifications', icon: Bell },
        { id: 'STAFF' as AdminTab, label: 'Admin Staff & Roles', icon: ShieldAlert },
        { id: 'EXPORTS' as AdminTab, label: 'Reports & Data Exports', icon: Download },
        { id: 'SETTINGS' as AdminTab, label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  const visibleNavSections: { group: string; items: NavItem[] }[] = isHrMode
    ? [
        {
          group: 'OVERVIEW',
          items: [
            { id: 'DASHBOARD' as AdminTab, label: 'Overview & KPIs', icon: LayoutDashboard },
            { id: 'ANALYTICS' as AdminTab, label: 'Recruitment Analytics', icon: BarChart3 },
            { id: 'AUDIT_LOGS' as AdminTab, label: 'Security & Activity Logs', icon: ShieldCheck },
          ],
        },
        {
          group: 'HR SCREENING & SHORTLISTS',
          items: [
            { id: 'DOCUMENTS' as AdminTab, label: 'CV Screening & Vault', icon: FileText, count: documents.length },
            { id: 'CANDIDATE_GROUPS' as AdminTab, label: 'Candidate Shortlist Groups', icon: Layers, count: candidateGroups.length },
          ],
        },
        {
          group: 'DATA RECORDS (READ-ONLY)',
          items: [
            { id: 'TEACHERS' as AdminTab, label: 'Teachers / Candidates', icon: Users, count: kpis.totalTeachers },
            { id: 'EMPLOYERS' as AdminTab, label: 'Institutions & Schools', icon: Building2, count: kpis.totalEmployers },
            { id: 'JOBS' as AdminTab, label: 'Job Postings', icon: Briefcase, count: kpis.totalActiveVacancies },
            { id: 'APPLICATIONS' as AdminTab, label: 'Candidate Applications', icon: FileSpreadsheet, count: kpis.totalApplications },
          ],
        },
      ]
    : navSections;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 ${
          feedbackToast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-red-600 text-white border-red-500'
        }`}>
          {feedbackToast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpeg" alt="SikshaHub Super Admin" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold font-serif text-sm">SikshaHub Super Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200
        md:translate-x-0 md:static md:w-72 shrink-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <img src="/logo.jpeg" alt="SikshaHub" className="w-11 h-11 rounded-xl object-cover border border-sky-400/40 bg-white shadow-xs shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white font-serif tracking-tight">SikshaHub.AI</h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                isHrMode ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
              }`}>
                {isHrMode ? 'HR' : 'PRO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{isHrMode ? 'HR Recruiter Clearance' : 'Super Admin Governance'}</p>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-4 mx-3 my-2 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <img 
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=SuperAdmin'} 
              alt="Admin" 
              className="w-8 h-8 rounded-lg object-cover bg-slate-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.fullName || (isHrMode ? 'HR Recruiter' : 'Super Administrator')}</p>
              <p className="text-[10px] text-sky-400 font-mono truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of Admin Session and return to Home"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-xs">
          {visibleNavSections.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {group.group}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition ${
                      isActive
                        ? 'bg-brand-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-brand-700' : 'bg-amber-500 text-slate-900'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && item.badge === undefined && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>MongoDB Atlas: Connected</span>
          <span className="text-emerald-400 font-bold">● Active</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Top Operational Header */}
        <header className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 font-serif">
                {visibleNavSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Governance Dashboard'}
              </h1>
              {isHrMode ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>HR Candidate Screening • Read-Only Access</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Centralized Governance
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Platform status monitoring, educator credentials auditing, and school hiring operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => {
                refetchKpis();
                refetchTeachers();
                refetchEmployers();
                refetchJobs();
                refetchApplications();
                refetchDocuments();
                showToast('All administrator datasets refreshed.');
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
              title="Refresh Platform Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('EXPORTS')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Reports</span>
            </button>

            {!isHrMode && (
              <button
                onClick={() => setActiveTab('NOTIFICATIONS')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Broadcast Notice</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition flex items-center gap-1.5 shadow-2xs"
              title="Sign out of Admin Session and return to Home"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Body View Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & 10 STAT CARDS */}
          {/* ========================================================= */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* 10 Required Platform Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                {/* 1. Total Teachers */}
                <div 
                  onClick={() => setActiveTab('TEACHERS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Total Teachers</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 font-serif">{kpis.totalTeachers}</span>
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium">Registered educators</p>
                </div>

                {/* 2. Total Employers */}
                <div 
                  onClick={() => setActiveTab('EMPLOYERS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Total Employers</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 font-serif">{kpis.totalEmployers}</span>
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-[10px] text-purple-600 font-medium">Institutions & schools</p>
                </div>

                {/* 3. Verified Institutions */}
                <div 
                  onClick={() => setActiveTab('EMPLOYERS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Verified Schools</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-700 font-serif">{kpis.totalVerifiedInstitutions}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium">Fully accredited</p>
                </div>

                {/* 4. Pending Approvals */}
                <div 
                  onClick={() => setActiveTab('VERIFICATION')}
                  className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1 bg-amber-50/20"
                >
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">4. Pending Approvals</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-800 font-serif">{kpis.pendingInstitutions}</span>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold">Needs admin review</p>
                </div>

                {/* 5. Total Active Jobs */}
                <div 
                  onClick={() => setActiveTab('JOBS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5. Active Vacancies</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-brand-700 font-serif">{kpis.totalActiveVacancies}</span>
                    <Briefcase className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-[10px] text-brand-600 font-medium">Live on job board</p>
                </div>

                {/* 6. Pending Job Approvals */}
                <div 
                  onClick={() => setActiveTab('JOBS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">6. Draft Vacancies</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-800 font-serif">{kpis.pendingJobApprovals}</span>
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Pending publication</p>
                </div>

                {/* 7. Total Applications */}
                <div 
                  onClick={() => setActiveTab('APPLICATIONS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">7. Applications</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-purple-700 font-serif">{kpis.totalApplications}</span>
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-[10px] text-purple-600 font-medium">Submitted by teachers</p>
                </div>

                {/* 8. Total Shortlisted */}
                <div 
                  onClick={() => setActiveTab('APPLICATIONS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">8. Shortlisted</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-sky-700 font-serif">{kpis.shortlistedCandidates}</span>
                    <Sparkles className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-[10px] text-sky-600 font-medium">Qualified candidates</p>
                </div>

                {/* 9. Interviews Scheduled */}
                <div 
                  onClick={() => setActiveTab('ANALYTICS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">9. Demo Interviews</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-indigo-700 font-serif">{kpis.interviewsScheduled}</span>
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-indigo-600 font-medium">Scheduled demos</p>
                </div>

                {/* 10. Selected Candidates */}
                <div 
                  onClick={() => setActiveTab('APPLICATIONS')}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">10. Selected</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-800 font-serif">{kpis.selectedCandidates}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium">Hired educators</p>
                </div>
              </div>

              {/* Analytics & Distribution Visuals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Chart 1: Recruitment Stage Funnel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 font-serif">Recruitment Funnel Distribution</h3>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Stages</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.stageFunnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4338ca" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visual Chart 2: Vacancies by Teaching Level */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 font-serif">Openings by Teaching Category</h3>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">PRT / TGT / PGT / Faculty</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.jobsByLevel || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Chronological Activities */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-serif">Live Platform Activities Stream</h3>
                    <p className="text-xs text-slate-500">Real-time audit log of educator actions, stage decisions, and administrator governance.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('AUDIT_LOGS')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>View Full Log</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activities.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No recent activities recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 font-mono text-xs">
                    {activities.slice(0, 10).map((act: any) => (
                      <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900">{act.action}</span>
                            <span className="text-slate-500 ml-2">by {act.userEmail}</span>
                            {act.resourceType && (
                              <span className="text-[10px] text-slate-400 ml-2">({act.resourceType})</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(act.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TEACHERS / JOB SEEKER MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'TEACHERS' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search teachers by name, email, phone..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <select
                    value={teacherStatusFilter}
                    onChange={(e) => setTeacherStatusFilter(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="SUSPENDED">Suspended Only</option>
                  </select>
                </div>

                <button
                  onClick={() => downloadExport('teachers', `teachers_export_${Date.now()}.csv`)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Teachers Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Educator Profile</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Subject & Exp</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Registered</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No teacher profiles match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        teachers.map((t: any) => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={t.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.fullName}
                                  alt={t.fullName}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 font-serif">{t.fullName}</p>
                                  <p className="text-[11px] text-slate-500">{t.profile?.highestQualification || 'Qualification pending'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-900 font-medium">{t.email}</p>
                              <p className="text-[11px] text-slate-500">{t.phone}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-brand-700">
                                {t.profile?.subjects?.join(', ') || 'General Teaching'}
                              </p>
                              <p className="text-[11px] text-slate-500">{t.profile?.experienceYears ?? 0} Years Experience</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-800">{t.profile?.currentCity || 'Location Pending'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                t.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {t.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {t.profile?.resumeUrl && (
                                  <button
                                    onClick={() => setPreviewCvDoc({
                                      candidateName: t.fullName,
                                      candidateEmail: t.email,
                                      fileName: t.profile?.resumeFileName || 'Educator_Resume.pdf',
                                      fileUrl: t.profile.resumeUrl,
                                      jobTitle: t.profile?.subjects?.[0] ? `${t.profile.subjects[0]} Educator` : 'Educator Profile',
                                      atsScore: 75,
                                    })}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                    title="Preview Candidate CV"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    const res = await fetch(apiUrl(`/api/v1/admin/teachers/${t.id}`), {
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const data = await res.json();
                                    setSelectedTeacherForDossier(data.teacher || t);
                                  }}
                                  className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                                  title="View Full Profile Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {!isHrMode && (
                                  <>
                                    <button
                                      onClick={() => setSelectedTeacherForEdit(t)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                                      title="Edit Teacher Record"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleTeacherStatus(t.id, t.status)}
                                      className={`p-1.5 rounded-lg transition ${
                                        t.status === 'ACTIVE' 
                                          ? 'text-amber-600 hover:bg-amber-50' 
                                          : 'text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                      title={t.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                                    >
                                      <ShieldAlert className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: EMPLOYERS / INSTITUTIONS */}
          {/* ========================================================= */}
          {activeTab === 'EMPLOYERS' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search institutions by name, city, state..."
                      value={employerSearch}
                      onChange={(e) => setEmployerSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <select
                    value={employerStatusFilter}
                    onChange={(e) => setEmployerStatusFilter(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ALL">All Verification Statuses</option>
                    <option value="VERIFIED">Verified Only</option>
                    <option value="PENDING">Pending Verification</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <button
                  onClick={() => downloadExport('employers', `employers_export_${Date.now()}.csv`)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Employers Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Institution Name</th>
                        <th className="py-3 px-4">Contact Person</th>
                        <th className="py-3 px-4">City / State</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Vacancies</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No employer or institution records found.
                          </td>
                        </tr>
                      ) : (
                        employers.map((emp: any) => (
                          <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={emp.logoUrl || '/logo.jpeg'}
                                  alt={emp.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 font-serif">{emp.name}</p>
                                  <p className="text-[11px] text-slate-500">Affiliation: {emp.affiliationNumber || 'Pending'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-900 font-medium">{emp.ownerName || 'Representative'}</p>
                              <p className="text-[11px] text-slate-500">{emp.ownerEmail}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-800">{emp.city}, {emp.state}</p>
                              <p className="text-[11px] text-slate-400">{emp.pincode}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {emp.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                emp.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : emp.verificationStatus === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {emp.verificationStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {emp.totalJobs || 0}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={async () => {
                                    const res = await fetch(apiUrl(`/api/v1/admin/employers/${emp.id}`), {
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const data = await res.json();
                                    setSelectedEmployerForDossier(data.institution || emp);
                                  }}
                                  className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                                  title="View Institution Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {!isHrMode && (
                                  <>
                                    <button
                                      onClick={() => setSelectedEmployerForEdit(emp)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                                      title="Edit Institution Details"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    {emp.verificationStatus !== 'VERIFIED' && (
                                      <button
                                        onClick={() => setVerificationDecisionTarget({ institution: emp, decision: 'VERIFIED' })}
                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                        title="Approve Institution"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: INSTITUTION VERIFICATION QUEUE */}
          {/* ========================================================= */}
          {activeTab === 'VERIFICATION' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 font-serif">Institution Accreditation Queue</h3>
                    <p className="text-xs text-amber-800/80">
                      Institutions awaiting administrative validation before publishing vacancies to educators across India.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-500 text-white rounded-xl shrink-0">
                  {pendingVerificationInstitutions.length} Pending Approval
                </span>
              </div>

              {pendingVerificationInstitutions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-2 border border-slate-200/90 shadow-2xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900 font-serif">Verification Queue Clear!</h4>
                  <p className="text-xs text-slate-500">
                    All submitted schools, colleges, and coaching academies are up to date and verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerificationInstitutions.map((inst: any) => (
                    <div
                      key={inst.id}
                      className="bg-white rounded-2xl p-5 shadow-2xs border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={inst.logoUrl || '/logo.jpeg'}
                          alt={inst.name}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-300/40 bg-white shrink-0"
                        />
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 font-serif">{inst.name}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Awaiting Review
                            </span>
                            {inst.board && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {inst.board}
                              </span>
                            )}
                            {inst.udiseCode && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                UDISE: {inst.udiseCode}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600">
                            {inst.type} • {inst.address}, {inst.city}, {inst.state} - {inst.pincode}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                            <span>Reg / Affiliation: <strong className="text-slate-700">{inst.registrationNumber || inst.affiliationNumber || 'Pending'}</strong></span>
                            <span>Contact: <strong className="text-slate-700">{inst.contactPerson || inst.ownerName}</strong> ({inst.phone || inst.ownerPhone || 'No phone'})</span>
                            <span>Email: <strong className="text-slate-700">{inst.email || inst.ownerEmail}</strong></span>
                          </div>

                          {/* Certificate Document Badge */}
                          <div className="pt-1 flex items-center gap-3">
                            {inst.certificateUrl ? (
                              <a
                                href={inst.certificateUrl.startsWith('http') ? inst.certificateUrl : `${window.location.origin}${inst.certificateUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition shadow-2xs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View Registration Certificate ({inst.certificateFileName || 'PDF'})</span>
                              </a>
                            ) : (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                No Verification Document Uploaded
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedEmployerForDossier(inst)}
                              className="text-xs text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2"
                            >
                              View Full Dossier
                            </button>
                          </div>

                          {inst.verificationNotes && (
                            <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                              <strong>Note:</strong> {inst.verificationNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
                        <button
                          onClick={() => setVerificationDecisionTarget({ institution: inst, decision: 'REJECTED' })}
                          className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-xl border border-red-200 transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => setVerificationDecisionTarget({ institution: inst, decision: 'VERIFIED' })}
                          className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Grant Posting</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: JOB POSTING MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'JOBS' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search vacancies by title, subject, city..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING_APPROVAL">Pending Admin Approval</option>
                    <option value="ACTIVE">Active Vacancies</option>
                    <option value="PAUSED">Paused Vacancies</option>
                    <option value="CLOSED">Closed Vacancies</option>
                    <option value="REJECTED">Rejected Vacancies</option>
                  </select>
                </div>

                <button
                  onClick={() => downloadExport('jobs', `jobs_export_${Date.now()}.csv`)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Jobs Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Job Title</th>
                        <th className="py-3 px-4">Institution</th>
                        <th className="py-3 px-4">Subject & Level</th>
                        <th className="py-3 px-4">Salary Range</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Applicants</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No job vacancies found.
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job: any) => (
                          <tr key={job.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900 font-serif">{job.title}</p>
                              <p className="text-[11px] text-slate-400">ID: {job.id}</p>
                            </td>
                            <td className="py-3 px-4 text-brand-700 font-semibold">
                              {job.institutionName}
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-900 font-medium">{job.subject}</p>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {job.teachingLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                              ₹{job.minSalaryLPA}-{job.maxSalaryLPA} LPA
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {job.city || 'Pan-India'}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-purple-700">
                              {job.totalApplicants || 0}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                job.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : job.status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : job.status === 'PAUSED'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : job.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {job.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : job.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedJobForDetails(job)}
                                  className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                                  title="View Vacancy Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {!isHrMode && (
                                  <>
                                    {job.status === 'PENDING_APPROVAL' && (
                                      <>
                                        <button
                                          onClick={() => handleChangeJobStatus(job.id, 'ACTIVE', 'Approved and published by Super Admin')}
                                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                          title="Approve & Publish Vacancy to Public Portal"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const reason = window.prompt('Enter rejection reason for this job opening:', 'Does not meet institutional posting guidelines');
                                            if (reason) handleChangeJobStatus(job.id, 'REJECTED', reason);
                                          }}
                                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                                          title="Reject Vacancy"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => setSelectedJobForEdit(job)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                                      title="Edit Job"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                                      title="Remove Job"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: APPLICATION MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search applications by candidate name or ID..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <select
                    value={appStageFilter}
                    onChange={(e) => setAppStageFilter(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ALL">All Recruitment Stages</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <button
                  onClick={() => downloadExport('applications', `applications_export_${Date.now()}.csv`)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Job Vacancy</th>
                        <th className="py-3 px-4">Institution</th>
                        <th className="py-3 px-4">ATS Match</th>
                        <th className="py-3 px-4">Current Stage</th>
                        <th className="py-3 px-4">Submitted Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No candidate applications found.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app: any) => {
                          const score = app.score ?? 70;
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900 font-serif">{app.candidateName}</p>
                                <p className="text-[11px] text-slate-500">{app.candidateEmail}</p>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-900">
                                {app.jobTitle}
                              </td>
                              <td className="py-3 px-4 text-brand-700 font-semibold">
                                {app.institutionName}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 w-fit ${
                                  score >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  <Sparkles className="w-3 h-3" />
                                  {score}%
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  {app.stage}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-[11px]">
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {app.resumeUrl && (
                                    <button
                                      onClick={() => setPreviewCvDoc({
                                        candidateName: app.candidateName,
                                        candidateEmail: app.candidateEmail,
                                        fileName: app.resumeFileName || 'Application_Resume.pdf',
                                        fileUrl: app.resumeUrl,
                                        jobTitle: app.jobTitle,
                                        atsScore: score,
                                      })}
                                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                      title="Preview Candidate Resume / CV"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedAppForDossier(app)}
                                    className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                                    title="View Application Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {!isHrMode && (
                                    <button
                                      onClick={() => setSelectedAppForStageCorrection(app)}
                                      className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                                      title="Exceptional Stage Override"
                                    >
                                      <ShieldAlert className="w-4 h-4" />
                                    </button>
                                  )}
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: CV AND DOCUMENT MANAGEMENT */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* TAB 7: CV SCREENING & DOCUMENT VAULT */}
          {/* ========================================================= */}
          {activeTab === 'DOCUMENTS' && (
            <AdminCvScreeningVault
              token={token}
              userRole={user?.role}
              onPreviewCv={(doc) => setPreviewCvDoc(doc)}
              onShortlistCreated={() => {
                refetchCandidateGroups();
                setActiveTab('CANDIDATE_GROUPS');
              }}
              showToast={showToast}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 7.5: CANDIDATE SHORTLIST GROUPS */}
          {/* ========================================================= */}
          {activeTab === 'CANDIDATE_GROUPS' && (
            <AdminCandidateGroupsManager
              token={token}
              userRole={user?.role}
              onPreviewCv={(doc) => setPreviewCvDoc(doc)}
              onNavigateToScreening={() => setActiveTab('DOCUMENTS')}
              showToast={showToast}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 8: RECRUITMENT & HIRING MONITORING */}
          {/* ========================================================= */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Applications by Subject */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-serif">Applications by Academic Subject</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.applicationsBySubject || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4338ca" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Top Hiring Cities */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-serif">Recruitment Hubs by Major City</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.topHiringCities || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Institution Leaderboard */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif">Institution Vacancy Volume Leaderboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(analytics?.institutionVacancies || []).map((inst: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{inst.name}</span>
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                        {inst.count} Openings
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: CATEGORY AND MASTER DATA MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'MASTER_DATA' && (
            <div className="space-y-4">
              {/* Category Pill Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'SUBJECT', label: 'Subjects' },
                    { id: 'TEACHING_CATEGORY', label: 'Teaching Categories' },
                    { id: 'QUALIFICATION', label: 'Qualifications' },
                    { id: 'BOARD', label: 'Boards' },
                    { id: 'CITY', label: 'Major Cities' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMasterCategoryTab(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                        masterCategoryTab === cat.id
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddMasterDataOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Entry</span>
                </button>
              </div>

              {/* Master Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Display Label</th>
                      <th className="py-3 px-4">System Value Key</th>
                      <th className="py-3 px-4">Order Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {masterItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No items registered for this master category.
                        </td>
                      </tr>
                    ) : (
                      masterItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 font-serif">
                            {item.label}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {item.value}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {item.order ?? 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedMasterDataForEdit(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                                title="Edit Item"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleMasterDataActive(item)}
                                className={`p-1.5 rounded-lg transition ${
                                  item.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={item.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: REPORTS AND MODERATION */}
          {/* ========================================================= */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">Platform Content Moderation Queue</h3>
                  <p className="text-xs text-slate-500">
                    User reports regarding policy violations, suspicious job postings, or fraudulent profiles.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  {reports.length} Total Reports Recorded
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/90">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  No reports or moderation flags pending review.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep: any) => (
                    <div
                      key={rep.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {rep.targetType}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{rep.targetTitle}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            rep.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : rep.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-xs text-red-700 font-medium">{rep.reason}</p>
                        <p className="text-[11px] text-slate-400">
                          Reported by: {rep.reporterEmail} • {new Date(rep.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReportForReview(rep)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs shrink-0"
                      >
                        Investigate & Resolve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: LOCATION-BASED & SMART PUSH NOTIFICATIONS (FCM) */}
          {/* ========================================================= */}
          {activeTab === 'NOTIFICATIONS' && (
            <AdminNotificationsManager
              notifications={notifications}
              refetchNotifications={refetchNotifications}
              showToast={showToast}
              token={token}
              apiUrl={apiUrl}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 12: ADMIN USERS & HR ACCOUNTS */}
          {/* ========================================================= */}
          {activeTab === 'STAFF' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">Staff Roles & HR Access Control</h3>
                  <p className="text-xs text-slate-500">
                    Provision and govern Super Admin accounts, operational staff, and specialized HR recruiter screening accounts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {staffTab === 'HR' ? (
                    <button
                      onClick={() => setIsAddHrModalOpen(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Provision HR Recruiter</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAddStaffOpen(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Administrator</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Segmented Tab Switch: Administrators vs HR Recruiters */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setStaffTab('ADMINS')}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                    staffTab === 'ADMINS'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Platform Administrators ({staff.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffTab('HR')}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                    staffTab === 'HR'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>HR Recruiter Accounts ({hrAccounts.length})</span>
                </button>
              </div>

              {staffTab === 'ADMINS' ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Work Email</th>
                        <th className="py-3 px-4">Administrative Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staff.map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 font-serif">
                            {s.fullName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-800">
                            {s.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              s.adminRole === 'SUPER_ADMIN' 
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {s.adminRole || 'ADMIN'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  {hrAccounts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-3">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">No HR Recruiter Accounts Provisioned</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          Click "Provision HR Recruiter" to create an authorized HR account with read-only data access and candidate shortlisting capability.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddHrModalOpen(true)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Provision First HR Recruiter</span>
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">HR Recruiter</th>
                          <th className="py-3 px-4">Official Email</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Shortlist Groups</th>
                          <th className="py-3 px-4">Operational Status</th>
                          <th className="py-3 px-4 text-right">Super Admin Governance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {hrAccounts.map((hr: any) => (
                          <tr key={hr.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 font-serif">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                                  {hr.fullName?.charAt(0) || 'H'}
                                </div>
                                <div>
                                  <span>{hr.fullName}</span>
                                  <span className="block text-[10px] text-slate-400 font-normal">Candidate Screening Specialist</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-800">
                              {hr.email}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {hr.phone || '—'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                                {hr.createdGroupsCount ?? 0} Groups
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                hr.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {hr.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHrStatus(hr.id, hr.status || 'ACTIVE')}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                    hr.status === 'ACTIVE'
                                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  }`}
                                >
                                  {hr.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHr(hr.id, hr.fullName)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="Delete HR account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 13: REPORTS & DATA EXPORTS */}
          {/* ========================================================= */}
          {activeTab === 'EXPORTS' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                <h3 className="text-sm font-bold text-slate-900 font-serif">Platform Data Export Center</h3>
                <p className="text-xs text-slate-500">
                  Generate instant CSV and spreadsheet reports for administrative auditing, compliance, and recruitment tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">Educator Profiles & Qualifications Report</h4>
                    <p className="text-xs text-slate-500">
                      Complete CSV roster of all registered teachers, verified mobile numbers, emails, teaching subjects, and experience.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadExport('teachers', `teachers_complete_report_${Date.now()}.csv`)}
                    className="w-full py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Teachers CSV</span>
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">Institutions & Schools Master Report</h4>
                    <p className="text-xs text-slate-500">
                      Roster of registered institutions, CBSE/State affiliation numbers, verification status, and contact representatives.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadExport('employers', `institutions_complete_report_${Date.now()}.csv`)}
                    className="w-full py-2 text-xs font-bold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Institutions CSV</span>
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">Job Vacancies & Compensation Report</h4>
                    <p className="text-xs text-slate-500">
                      Comprehensive log of all live, paused, and closed vacancies with subject, salary LPA range, and applicants count.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadExport('jobs', `vacancies_report_${Date.now()}.csv`)}
                    className="w-full py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Vacancies CSV</span>
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">Applications & ATS Scores Report</h4>
                    <p className="text-xs text-slate-500">
                      Recruitment pipeline records including candidate ID, job ID, current hiring stage, and algorithmic ATS match scores.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadExport('applications', `applications_ats_report_${Date.now()}.csv`)}
                    className="w-full py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Applications CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 14: PLATFORM SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'SETTINGS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs max-w-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">Platform System Configuration</h3>
                <p className="text-xs text-slate-500">
                  Global branding, recruitment limits, contact information, and maintenance mode controls.
                </p>
              </div>

              <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.supportPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum CV Upload Size (MB) — Enforced: 1MB Free Limit
                  </label>
                  <input
                    type="number"
                    value={settingsForm.maxCvUploadSizeMB}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maxCvUploadSizeMB: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Platform Maintenance Mode</p>
                      <p className="text-[11px] text-slate-500">Temporarily restrict public registrations during database migrations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.maintenanceMode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Configuration Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 15: AUDIT LOGS */}
          {/* ========================================================= */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Security & Administrative Audit Trail
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable chronological log of role access, candidate evaluations, stage transitions, and institution decisions.
                </p>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Audit Logs Recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">User Email</th>
                        <th className="py-2.5 px-3">Resource Target</th>
                        <th className="py-2.5 px-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900">{log.action}</span>
                          </td>
                          <td className="py-2.5 px-3 text-brand-700">{log.userEmail}</td>
                          <td className="py-2.5 px-3">{log.resourceType}: {log.resourceId}</td>
                          <td className="py-2.5 px-3 text-slate-400">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ========================================================= */}
      {/* ALL MODALS MOUNTED */}
      {/* ========================================================= */}

      {/* CV Preview Modal */}
      <AdminCvPreviewModal
        isOpen={!!previewCvDoc}
        onClose={() => setPreviewCvDoc(null)}
        document={previewCvDoc}
      />

      {/* Teacher Dossier Modal */}
      <TeacherDossierModal
        isOpen={!!selectedTeacherForDossier}
        onClose={() => setSelectedTeacherForDossier(null)}
        teacher={selectedTeacherForDossier}
        onEdit={(t) => {
          setSelectedTeacherForDossier(null);
          setSelectedTeacherForEdit(t);
        }}
        onToggleStatus={handleToggleTeacherStatus}
        onPreviewCv={(doc) => setPreviewCvDoc(doc)}
      />

      {/* Teacher Edit Modal */}
      <TeacherEditModal
        isOpen={!!selectedTeacherForEdit}
        onClose={() => setSelectedTeacherForEdit(null)}
        teacher={selectedTeacherForEdit}
        onSave={handleSaveTeacher}
      />

      {/* Employer Dossier Modal */}
      <EmployerDossierModal
        isOpen={!!selectedEmployerForDossier}
        onClose={() => setSelectedEmployerForDossier(null)}
        employer={selectedEmployerForDossier}
        onEdit={(e) => {
          setSelectedEmployerForDossier(null);
          setSelectedEmployerForEdit(e);
        }}
        onVerify={handleToggleEmployerStatus}
      />

      {/* Employer Edit Modal */}
      <EmployerEditModal
        isOpen={!!selectedEmployerForEdit}
        onClose={() => setSelectedEmployerForEdit(null)}
        employer={selectedEmployerForEdit}
        onSave={handleSaveEmployer}
      />

      {/* Verification Decision Modal */}
      <VerificationActionModal
        isOpen={!!verificationDecisionTarget}
        onClose={() => setVerificationDecisionTarget(null)}
        institution={verificationDecisionTarget?.institution}
        targetDecision={verificationDecisionTarget?.decision || 'VERIFIED'}
        onConfirm={handleVerifyInstitutionDecision}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        job={selectedJobForDetails}
        onEdit={(j) => {
          setSelectedJobForDetails(null);
          setSelectedJobForEdit(j);
        }}
        onStatusChange={handleChangeJobStatus}
        onDelete={handleDeleteJob}
      />

      {/* Job Edit Modal */}
      <JobEditModal
        isOpen={!!selectedJobForEdit}
        onClose={() => setSelectedJobForEdit(null)}
        job={selectedJobForEdit}
        onSave={handleSaveJob}
      />

      {/* Application Dossier Modal */}
      <ApplicationDossierModal
        isOpen={!!selectedAppForDossier}
        onClose={() => setSelectedAppForDossier(null)}
        application={selectedAppForDossier}
        onOpenStageCorrection={(app) => setSelectedAppForStageCorrection(app)}
        onPreviewCv={(doc) => setPreviewCvDoc(doc)}
      />

      {/* Stage Correction Modal */}
      <StageCorrectionModal
        isOpen={!!selectedAppForStageCorrection}
        onClose={() => setSelectedAppForStageCorrection(null)}
        application={selectedAppForStageCorrection}
        onSaveStage={handleSaveAppStage}
      />

      {/* Add Master Data Modal */}
      <AddMasterDataModal
        isOpen={isAddMasterDataOpen}
        onClose={() => setIsAddMasterDataOpen(false)}
        defaultCategory={masterCategoryTab}
        onAdd={handleAddMasterData}
      />

      {/* Edit Master Data Modal */}
      <EditMasterDataModal
        isOpen={!!selectedMasterDataForEdit}
        onClose={() => setSelectedMasterDataForEdit(null)}
        item={selectedMasterDataForEdit}
        onSave={handleSaveMasterData}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onAddStaff={handleAddStaff}
      />

      {/* Add HR Recruiter Modal */}
      <AddHrModal
        isOpen={isAddHrModalOpen}
        onClose={() => setIsAddHrModalOpen(false)}
        onAddHr={handleAddHr}
      />

      {/* Review Report Modal */}
      <ReviewReportModal
        isOpen={!!selectedReportForReview}
        onClose={() => setSelectedReportForReview(null)}
        report={selectedReportForReview}
        onResolve={handleResolveReport}
      />

    </div>
  );
};
