import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Bell, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  Users, 
  Radio, 
  Sparkles, 
  Filter, 
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface SmartPushFilters {
  state?: string;
  city?: string;
  minSalaryLPA?: number;
  maxSalaryLPA?: number;
  teachingLevels?: string[];
  subjects?: string[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  isFresherOnly?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  actionUrl?: string;
  targetAudience: string;
  type: string;
  priority: string;
  filters?: SmartPushFilters;
  totalMatchedAudience?: number;
  successDeliveries?: number;
  failedDeliveries?: number;
  fcmSent?: boolean;
  status: 'DELIVERED' | 'PARTIAL' | 'FAILED' | 'SENT';
  sentBy: string;
  createdAt: string;
}

interface AdminNotificationsManagerProps {
  notifications: NotificationItem[];
  refetchNotifications: () => void;
  showToast: (msg: string) => void;
  token: string | null;
  apiUrl: (path: string) => string;
}

const INDIAN_STATES = [
  'ALL',
  'Delhi',
  'Uttar Pradesh',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'West Bengal',
  'Bihar',
  'Rajasthan',
  'Madhya Pradesh',
  'Gujarat',
  'Haryana',
  'Punjab',
  'Kerala',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Goa',
  'Chandigarh'
];

const TEACHING_LEVELS = [
  { id: 'PRT', label: 'PRT (Primary Teacher)' },
  { id: 'TGT', label: 'TGT (Trained Graduate)' },
  { id: 'PGT', label: 'PGT (Post Graduate)' },
  { id: 'PRE_PRIMARY', label: 'Nursery / Pre-Primary' },
  { id: 'COACHING_JEE', label: 'IIT-JEE Faculty' },
  { id: 'COACHING_NEET', label: 'NEET Faculty' },
  { id: 'COLLEGE_PROFESSOR', label: 'College / University Professor' },
];

const SUBJECTS_LIST = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Computer Science',
  'Social Science',
  'Commerce & Accountancy',
  'Economics',
  'General Science',
  'Sanskrit',
  'Environmental Studies'
];

export const AdminNotificationsManager: React.FC<AdminNotificationsManagerProps> = ({
  notifications,
  refetchNotifications,
  showToast,
  token,
  apiUrl,
}) => {
  // Composer Form States
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/teacher-dashboard');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  // Targeting Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minSalaryLPA, setMinSalaryLPA] = useState<string>('');
  const [maxSalaryLPA, setMaxSalaryLPA] = useState<string>('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isFresherOnly, setIsFresherOnly] = useState<boolean>(false);
  const [minExp, setMinExp] = useState<string>('');
  const [maxExp, setMaxExp] = useState<string>('');

  // Device Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Live Audience Calculation State
  const [isCalculatingAudience, setIsCalculatingAudience] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [tokenCount, setTokenCount] = useState<number | null>(null);

  // Dispatch & UI States
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedNotificationForDetails, setSelectedNotificationForDetails] = useState<NotificationItem | null>(null);

  // Fetch KPI Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/admin/notifications/stats'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStats();
  }, [notifications.length]);

  // Build current filters payload
  const currentFilters: SmartPushFilters = useMemo(() => {
    return {
      state: selectedState !== 'ALL' ? selectedState : undefined,
      city: selectedCity.trim() ? selectedCity.trim() : undefined,
      minSalaryLPA: minSalaryLPA ? Number(minSalaryLPA) : undefined,
      maxSalaryLPA: maxSalaryLPA ? Number(maxSalaryLPA) : undefined,
      teachingLevels: selectedLevels.length > 0 ? selectedLevels : undefined,
      subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      minExperienceYears: isFresherOnly ? 0 : (minExp ? Number(minExp) : undefined),
      maxExperienceYears: isFresherOnly ? 0 : (maxExp ? Number(maxExp) : undefined),
      isFresherOnly,
    };
  }, [
    selectedState, 
    selectedCity, 
    minSalaryLPA, 
    maxSalaryLPA, 
    selectedLevels, 
    selectedSubjects, 
    isFresherOnly, 
    minExp, 
    maxExp
  ]);

  // Recalculate target audience whenever filters change
  const calculateAudience = async () => {
    setIsCalculatingAudience(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/notifications/target-count'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filters: currentFilters }),
      });
      const data = await res.json();
      if (data.success) {
        setAudienceCount(data.totalMatchedAudience);
        setTokenCount(data.tokenCount);
      }
    } catch (err) {
      console.warn('Audience calculation error:', err);
    } finally {
      setIsCalculatingAudience(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateAudience();
    }, 350);
    return () => clearTimeout(timer);
  }, [currentFilters]);

  // Toggle multi-select items
  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Dispatch Push Notification
  const handleSendSmartPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Notification title and message are required.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/notifications/send-smart-push'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          actionUrl: actionUrl.trim() || '/teacher-dashboard',
          priority,
          filters: currentFilters,
          targetAudience: 'TEACHERS',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Smart Push dispatched to ${data.delivery?.audienceCount || 0} educators (${data.delivery?.successDeliveries || 0} delivered)!`);
        setTitle('');
        setMessage('');
        refetchNotifications();
        fetchStats();
      } else {
        showToast(data.message || 'Failed to dispatch notification.');
      }
    } catch (err: any) {
      showToast('Network error while dispatching notification.');
    } finally {
      setIsSending(false);
    }
  };

  // Delete notification record
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification record from history?')) return;

    try {
      const res = await fetch(apiUrl(`/api/v1/admin/notifications/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Notification record deleted from history.');
        refetchNotifications();
        fetchStats();
        if (selectedNotificationForDetails?.id === id) {
          setSelectedNotificationForDetails(null);
        }
      }
    } catch (e) {
      showToast('Failed to delete notification.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP KPI STATS SUMMARY */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Dispatches */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Dispatches</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-serif">
              {stats?.totalBroadcasts ?? notifications.length}
            </span>
            <Radio className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-[10px] text-slate-400">Push broadcasts</p>
        </div>

        {/* Educators Reached */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Audience Reached</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-serif">
              {stats?.totalAudienceReached ?? notifications.reduce((acc, n) => acc + (n.totalMatchedAudience || 0), 0)}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-[10px] text-slate-400">Educators targeted</p>
        </div>

        {/* Successful Deliveries */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Successful Deliveries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-800 font-serif">
              {stats?.totalDelivered ?? notifications.reduce((acc, n) => acc + (n.successDeliveries || 0), 0)}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Delivered to devices</p>
        </div>

        {/* Failed Deliveries */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs space-y-1 bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Delivery Failures</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-800 font-serif">
              {stats?.totalFailed ?? notifications.reduce((acc, n) => acc + (n.failedDeliveries || 0), 0)}
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-[10px] text-rose-600 font-medium">Stale / unreachable</p>
        </div>

        {/* Active FCM Tokens */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active FCM Tokens</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-serif">
              {stats?.activeTokensCount ?? 0}
            </span>
            <Smartphone className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-[10px] text-slate-400">Registered browsers</p>
        </div>

        {/* FCM Gateway Status */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">FCM Gateway</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${stats?.isFcmActive ? 'bg-emerald-500' : 'bg-sky-500'}`} />
            <span className="text-xs font-bold text-slate-800 truncate">
              {stats?.isFcmActive ? 'FCM Cloud Active' : 'Smart Hybrid'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {stats?.isFcmActive ? 'Firebase Admin v13' : 'In-App & Push Sync'}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SMART PUSH NOTIFICATION COMPOSER & PREVIEW */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smart Filters & Content (8 cols) */}
        <form onSubmit={handleSendSmartPush} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">Smart Push Notification Composer</h3>
                <p className="text-xs text-slate-500">
                  Target job seekers with location, salary, subject, level and experience criteria.
                </p>
              </div>
            </div>

            {/* Target Audience Counter Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold shrink-0">
              {isCalculatingAudience ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
              ) : (
                <Users className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>
                {audienceCount != null ? `${audienceCount} Eligible Educators` : 'Calculating...'}
              </span>
              {tokenCount != null && tokenCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-600 text-white">
                  {tokenCount} FCM Tokens
                </span>
              )}
            </div>
          </div>

          {/* SECTION A: LOCATION & SALARY TARGETING */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Location & Expected Salary Targeting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">State / Province</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st === 'ALL' ? 'All India (Any State)' : st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">City / Region (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Patna, Bengaluru (or blank)"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Min Expected Salary (₹ LPA)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  placeholder="e.g. 5 (Any)"
                  value={minSalaryLPA}
                  onChange={(e) => setMinSalaryLPA(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Max Expected Salary (₹ LPA)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  placeholder="e.g. 15 (No ceiling)"
                  value={maxSalaryLPA}
                  onChange={(e) => setMaxSalaryLPA(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: TEACHING LEVEL & SUBJECT */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>2. Teaching Level (PRT / TGT / PGT / Faculty)</span>
              </div>
              {selectedLevels.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedLevels([])}
                  className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                >
                  Clear Levels (Select All)
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TEACHING_LEVELS.map((lvl) => {
                const active = selectedLevels.includes(lvl.id);
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => toggleItem(selectedLevels, lvl.id, setSelectedLevels)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      active
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-400/40 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/80'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    <span>{lvl.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Subject Selector */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subject Specialization</span>
                </div>
                {selectedSubjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubjects([])}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear Subjects (Select All)
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS_LIST.map((sub) => {
                  const active = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleItem(selectedSubjects, sub, setSelectedSubjects)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                        active
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400/40 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/80'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-blue-600" />}
                      <span>{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION C: EXPERIENCE FILTER */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Experience Filter</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFresherOnly}
                  onChange={(e) => setIsFresherOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Target Freshers Only (0 Years)</span>
              </label>
            </div>

            {!isFresherOnly && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    placeholder="e.g. 2 (Any)"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    placeholder="e.g. 10 (Any)"
                    value={maxExp}
                    onChange={(e) => setMaxExp(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: NOTIFICATION CONTENT */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-sky-600" />
              <span>4. Notification Content & Delivery Action</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notification Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Urgent Requirement: Senior PGT Physics Faculty"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Notification Message Body *</label>
                <span className="text-[10px] text-slate-400">{message.length} characters</span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="e.g. Leading K-12 CBSE institution in Delhi NCR invites applications with package ₹8-12 LPA. Click to review syllabus and apply directly."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action / Job / Application URL</label>
                <input
                  type="text"
                  placeholder="e.g. /jobs/job-123 or /teacher-dashboard"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="HIGH">High (Immediate push delivery)</option>
                  <option value="URGENT">Urgent (Priority notification queue)</option>
                  <option value="MEDIUM">Medium (Standard platform alert)</option>
                  <option value="LOW">Low (Background announcement)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dispatch Button */}
          <button
            type="submit"
            disabled={isSending || !title.trim() || !message.trim()}
            className="w-full py-3.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition flex items-center justify-center gap-2 shadow-md disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {isSending ? 'Dispatching Firebase Cloud Push...' : `Send Smart Push to ${audienceCount ?? 0} Eligible Educators`}
            </span>
          </button>
        </form>

        {/* Right Column: Live Interactive Device Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Device Live Preview</h4>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* PREVIEW FRAME */}
            {previewDevice === 'desktop' ? (
              /* Chrome / Desktop OS Push Banner */
              <div className="bg-slate-900/90 p-4 rounded-2xl text-white space-y-2.5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <img src="/logo.jpeg" alt="Logo" className="w-4 h-4 rounded-md object-contain bg-white" />
                    <span className="font-bold text-slate-200">SikchaKhub.AI Push</span>
                    <span>•</span>
                    <span>Google Chrome</span>
                  </div>
                  <span className="text-[10px] text-slate-400">now</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-black text-white leading-tight">
                    {title || 'Urgent Requirement: Senior PGT Physics Faculty'}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    {message || 'Leading K-12 CBSE institution in Delhi NCR invites applications with package ₹8-12 LPA. Click to review syllabus and apply directly.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px]">
                  <span className="text-[10px] text-sky-400 truncate max-w-[150px]">
                    {actionUrl || '/teacher-dashboard'}
                  </span>
                  <div className="px-3 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] shadow-xs">
                    View Opportunity →
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile OS Push Banner */
              <div className="mx-auto max-w-[280px] bg-slate-900 p-3.5 rounded-3xl text-white space-y-3 shadow-2xl border-4 border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>5G</span>
                  </div>
                </div>

                <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo.jpeg" alt="Logo" className="w-4 h-4 rounded-md object-contain bg-white" />
                      <span className="font-bold text-sky-400">SikchaKhub.AI</span>
                    </div>
                    <span className="text-slate-400">1m ago</span>
                  </div>

                  <p className="text-xs font-bold text-white leading-tight">
                    {title || 'Urgent Requirement: Senior PGT Physics'}
                  </p>
                  <p className="text-[10px] text-slate-300 line-clamp-2">
                    {message || 'Leading institution invites applications. Click to review vacancy and syllabus.'}
                  </p>

                  <div className="pt-1 flex items-center justify-end">
                    <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
                      <span>Open Vacancy</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <div className="h-1 w-20 bg-slate-700 rounded-full mx-auto" />
              </div>
            )}

            {/* Target Breakdown Summary Box */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Smart Target Breakdown</span>
              </div>
              <ul className="text-[11px] text-sky-800 space-y-1 list-disc list-inside">
                <li>Location: <strong>{selectedState === 'ALL' ? 'All India' : selectedState}</strong> {selectedCity ? `(${selectedCity})` : ''}</li>
                <li>Salary: <strong>{minSalaryLPA ? `₹${minSalaryLPA}LPA` : 'Any'} to {maxSalaryLPA ? `₹${maxSalaryLPA}LPA` : 'Open'}</strong></li>
                <li>Levels: <strong>{selectedLevels.length > 0 ? selectedLevels.join(', ') : 'All Teaching Levels'}</strong></li>
                <li>Subjects: <strong>{selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'All Subjects'}</strong></li>
                <li>Experience: <strong>{isFresherOnly ? 'Freshers Only' : (minExp || maxExp ? `${minExp || 0} - ${maxExp || 'Any'} Yrs` : 'All Experience')}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. NOTIFICATION HISTORY & DELIVERY AUDIT LOG */}
      {/* ========================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">Notification History & Delivery Metrics</h3>
            <p className="text-xs text-slate-500">
              Complete audit log of push broadcasts, matched audience counts, and FCM device receipts.
            </p>
          </div>

          <button
            type="button"
            onClick={refetchNotifications}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh History</span>
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">No push notifications dispatched yet.</p>
            <p>Compose your first targeted smart push alert using the composer above.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {notifications.map((n) => {
              const filters = n.filters || {};
              return (
                <div
                  key={n.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/90 transition space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        n.status === 'DELIVERED' ? 'bg-emerald-500' : n.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        n.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : n.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {n.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setSelectedNotificationForDetails(n)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-sky-600" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {/* Filter Criteria Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {filters.state && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        📍 State: {filters.state}
                      </span>
                    )}
                    {filters.city && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        🏙️ City: {filters.city}
                      </span>
                    )}
                    {filters.teachingLevels && filters.teachingLevels.length > 0 && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-purple-700">
                        🎓 {filters.teachingLevels.join(', ')}
                      </span>
                    )}
                    {filters.subjects && filters.subjects.length > 0 && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">
                        📚 {filters.subjects.join(', ')}
                      </span>
                    )}
                    {(filters.minSalaryLPA || filters.maxSalaryLPA) && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-700">
                        💰 ₹{filters.minSalaryLPA || 0}-{filters.maxSalaryLPA || 'Any'} LPA
                      </span>
                    )}
                    {filters.isFresherOnly && (
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-amber-700">
                        🌱 Freshers
                      </span>
                    )}
                    {n.actionUrl && (
                      <a
                        href={n.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-sky-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>{n.actionUrl}</span>
                      </a>
                    )}
                  </div>

                  {/* Delivery Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-4">
                      <span>Target Audience: <strong className="text-slate-800">{n.totalMatchedAudience || 0} Educators</strong></span>
                      <span className="text-emerald-700 font-semibold">✓ Delivered: {n.successDeliveries || 0}</span>
                      {(n.failedDeliveries || 0) > 0 && (
                        <span className="text-rose-600 font-semibold">✗ Failed: {n.failedDeliveries}</span>
                      )}
                    </div>
                    <span>
                      Dispatched by {n.sentBy} • {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. NOTIFICATION DETAILS BREAKDOWN MODAL */}
      {/* ========================================================= */}
      {selectedNotificationForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900 font-serif">Notification Delivery Breakdown</h4>
              </div>
              <button
                onClick={() => setSelectedNotificationForDetails(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Notification Title</span>
                <p className="font-bold text-slate-900 text-sm">{selectedNotificationForDetails.title}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Message Body</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {selectedNotificationForDetails.message}
                </p>
              </div>

              {selectedNotificationForDetails.actionUrl && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Action URL</span>
                  <a
                    href={selectedNotificationForDetails.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{selectedNotificationForDetails.actionUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Delivery Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Matched</span>
                  <span className="text-base font-black text-slate-800">
                    {selectedNotificationForDetails.totalMatchedAudience || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase block font-bold">Delivered</span>
                  <span className="text-base font-black text-emerald-600">
                    {selectedNotificationForDetails.successDeliveries || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-700 uppercase block font-bold">Failed</span>
                  <span className="text-base font-black text-rose-600">
                    {selectedNotificationForDetails.failedDeliveries || 0}
                  </span>
                </div>
              </div>

              {/* Targeted Filters */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Targeting Criteria</span>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-sky-950 space-y-1">
                  <p>📍 State: <strong>{selectedNotificationForDetails.filters?.state || 'All India'}</strong></p>
                  <p>🏙️ City: <strong>{selectedNotificationForDetails.filters?.city || 'All Cities'}</strong></p>
                  <p>🎓 Levels: <strong>{selectedNotificationForDetails.filters?.teachingLevels?.join(', ') || 'All Levels'}</strong></p>
                  <p>📚 Subjects: <strong>{selectedNotificationForDetails.filters?.subjects?.join(', ') || 'All Subjects'}</strong></p>
                  <p>💼 Experience: <strong>{selectedNotificationForDetails.filters?.isFresherOnly ? 'Freshers Only' : 'Any Experience'}</strong></p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Dispatched by {selectedNotificationForDetails.sentBy}</span>
                <span>{new Date(selectedNotificationForDetails.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

