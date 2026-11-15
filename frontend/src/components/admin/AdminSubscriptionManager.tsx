import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Clock, 
  Building2, 
  Users, 
  Briefcase, 
  FileSpreadsheet, 
  Settings, 
  Save, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { apiUrl } from '../../config/api';

interface AdminSubscriptionManagerProps {
  token: string | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({
  token,
  showToast,
}) => {
  const queryClient = useQueryClient();

  // Sub-tabs: 'POSTERS' vs 'PAYMENTS'
  const [activeSubTab, setActiveSubTab] = useState<'POSTERS' | 'PAYMENTS'>('POSTERS');

  // Posters filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Payments filter
  const [paymentSearch, setPaymentSearch] = useState('');

  // Modals state
  const [selectedPosterForEdit, setSelectedPosterForEdit] = useState<any | null>(null);
  const [editPlan, setEditPlan] = useState<string>('PRO_MONTHLY');
  const [editFreeLimit, setEditFreeLimit] = useState<number>(5);
  const [editDurationDays, setEditDurationDays] = useState<number>(30);
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');

  // Global free limit setting state
  const [globalFreeLimitInput, setGlobalFreeLimitInput] = useState<number>(5);
  const [isUpdatingGlobalLimit, setIsUpdatingGlobalLimit] = useState(false);

  // 1. Fetch Subscription Summary KPIs
  const { data: summaryData, refetch: refetchSummary } = useQuery({
    queryKey: ['admin-subscription-summary', token],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/admin/subscriptions/summary'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const summary = summaryData?.summary || {
    totalPosters: 0,
    premiumActiveCount: 0,
    freeTierCount: 0,
    totalRevenue: 0,
    globalFreeLimit: 5,
  };

  // Sync global limit input on load
  React.useEffect(() => {
    if (summary.globalFreeLimit) {
      setGlobalFreeLimitInput(summary.globalFreeLimit);
    }
  }, [summary.globalFreeLimit]);

  // 2. Fetch Job Posters Subscriptions
  const { data: postersData, isLoading: isLoadingPosters, refetch: refetchPosters } = useQuery({
    queryKey: ['admin-subscription-posters', token, searchQuery, selectedPlanFilter, selectedStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedPlanFilter !== 'ALL') params.append('plan', selectedPlanFilter);
      if (selectedStatusFilter !== 'ALL') params.append('status', selectedStatusFilter);

      const res = await fetch(apiUrl(`/api/v1/admin/subscriptions/posters?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const posters: any[] = postersData?.posters || [];

  // 3. Fetch Payments History
  const { data: paymentsData, isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['admin-subscription-payments', token, paymentSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (paymentSearch) params.append('q', paymentSearch);
      const res = await fetch(apiUrl(`/api/v1/admin/subscriptions/payments?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token && activeSubTab === 'PAYMENTS',
  });

  const payments: any[] = paymentsData?.payments || [];

  // Mutation: Grant/Revoke Access
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, hasUnlimitedAccess, adminNotes }: { userId: string; hasUnlimitedAccess: boolean; adminNotes?: string }) => {
      const res = await fetch(apiUrl(`/api/v1/admin/subscriptions/${userId}/grant-access`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hasUnlimitedAccess, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update access');
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || 'Access updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-posters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-summary'] });
    },
    onError: (err: any) => {
      showToast(err.message, 'error');
    },
  });

  // Mutation: Update Plan & Limits
  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan, durationDays, freeLimitPerJob, adminNotes }: any) => {
      const planRes = await fetch(apiUrl(`/api/v1/admin/subscriptions/${userId}/plan`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, durationDays, adminNotes }),
      });
      const planData = await planRes.json();
      if (!planRes.ok) throw new Error(planData.message || 'Failed to update plan');

      if (typeof freeLimitPerJob === 'number') {
        await fetch(apiUrl(`/api/v1/admin/subscriptions/${userId}/free-limit`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ freeLimitPerJob }),
        });
      }

      return planData;
    },
    onSuccess: () => {
      showToast('Job poster subscription & limits updated successfully.');
      setSelectedPosterForEdit(null);
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-posters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-summary'] });
    },
    onError: (err: any) => {
      showToast(err.message, 'error');
    },
  });

  // Mutation: Suspend/Activate Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
      const res = await fetch(apiUrl(`/api/v1/admin/subscriptions/${userId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || 'Status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-posters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-summary'] });
    },
    onError: (err: any) => {
      showToast(err.message, 'error');
    },
  });

  // Save Global Free Limit
  const handleSaveGlobalLimit = async () => {
    setIsUpdatingGlobalLimit(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/subscriptions/settings/free-limit'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ freeLimitPerJob: Number(globalFreeLimitInput) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save global limit');
      showToast(`Global free limit updated to ${globalFreeLimitInput} applicants per vacancy.`);
      refetchSummary();
      refetchPosters();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingGlobalLimit(false);
    }
  };

  // Export Payments CSV
  const handleExportPaymentsCSV = () => {
    if (payments.length === 0) {
      showToast('No payment records to export', 'error');
      return;
    }
    const headers = ['Payment ID', 'User Name', 'Email', 'Institution', 'Plan', 'Amount (INR)', 'Gateway', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.paymentId,
      p.userName,
      p.userEmail,
      p.institutionName,
      p.plan,
      p.amount,
      p.paymentGateway,
      p.status,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.map(x => `"${x}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SikchaKhub_Payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payment records exported successfully.');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Job Posters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Posters</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.totalPosters}</span>
            <span className="text-xs text-slate-400 font-medium">registered</span>
          </div>
        </div>

        {/* Card 2: Active Premium Subscribers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Premium Active</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{summary.premiumActiveCount}</span>
            <span className="text-xs text-emerald-600 font-bold">100% Unlocked</span>
          </div>
        </div>

        {/* Card 3: Free Tier Posters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Tier</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{summary.freeTierCount}</span>
            <span className="text-xs text-slate-400 font-medium">5 limit/job</span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">₹{summary.totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-xs text-amber-600 font-bold">Verified</span>
          </div>
        </div>

      </div>

      {/* 2. Platform-Wide Free Limit Configurator Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 p-4 sm:p-5 rounded-2xl border border-sky-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>Platform Default Free Applicant Access Limit</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 text-sky-800">
                Current: {summary.globalFreeLimit} per vacancy
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Default number of candidate applications a free Job Poster can fully view per job vacancy. Subsequent applicants are locked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center bg-white rounded-xl border border-slate-300 px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 mr-2">Limit:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={globalFreeLimitInput}
              onChange={(e) => setGlobalFreeLimitInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-sm font-black text-slate-900 outline-none text-center"
            />
            <span className="text-xs text-slate-400 ml-1">applicants</span>
          </div>
          <button
            type="button"
            onClick={handleSaveGlobalLimit}
            disabled={isUpdatingGlobalLimit}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isUpdatingGlobalLimit ? 'Saving...' : 'Save Limit'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Navigation Sub-tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('POSTERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'POSTERS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Job Posters & Access Management</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSubTab === 'POSTERS' ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {posters.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'PAYMENTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription History & Payments</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSubTab === 'PAYMENTS' ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {payments.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'PAYMENTS' && (
          <button
            type="button"
            onClick={handleExportPaymentsCSV}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* 4. TAB CONTENT 1: Job Posters & Access Management Table */}
      {activeSubTab === 'POSTERS' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job poster by name, email, school, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {/* Plan filter */}
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 outline-none"
              >
                <option value="ALL">All Membership Plans</option>
                <option value="FREE">Free Starter</option>
                <option value="PRO_MONTHLY">Pro Recruiter (Monthly)</option>
                <option value="ANNUAL_ENTERPRISE">Annual Enterprise</option>
                <option value="CUSTOM_ADMIN">Custom Admin Granted</option>
              </select>

              {/* Status filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 outline-none"
              >
                <option value="ALL">All Access Status</option>
                <option value="PREMIUM_ACTIVE">Premium Active (Unlocked)</option>
                <option value="FREE">Free Tier (5 Limit)</option>
                <option value="SUSPENDED">Suspended Access</option>
                <option value="EXPIRED">Expired Plans</option>
              </select>

              {(searchQuery || selectedPlanFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPlanFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">JOB POSTER / INSTITUTION</th>
                    <th className="py-3.5 px-3">MEMBERSHIP PLAN</th>
                    <th className="py-3.5 px-3">APPLICATION ACCESS</th>
                    <th className="py-3.5 px-3">VACANCIES & APPLICANTS</th>
                    <th className="py-3.5 px-3">SUBSCRIPTION VALIDITY</th>
                    <th className="py-3.5 px-4 text-right">ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingPosters ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Loading job posters subscription data...
                      </td>
                    </tr>
                  ) : posters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No job posters match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    posters.map((poster) => {
                      const isUnlimited = poster.subscription?.hasUnlimitedAccess;
                      const plan = poster.subscription?.plan || 'FREE';
                      const subStatus = poster.subscription?.status || 'ACTIVE';

                      return (
                        <tr key={poster.id} className="hover:bg-slate-50/60 transition">
                          
                          {/* Column 1: Poster & Institution */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold border border-slate-200">
                                {poster.fullName?.charAt(0) || 'P'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 leading-tight truncate">
                                  {poster.fullName}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {poster.email} • {poster.phone}
                                </p>
                                <p className="text-[11px] text-sky-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-sky-600" />
                                  <span>{poster.institutionName}</span>
                                  {poster.institutionVerified && (
                                    <span title="Verified Institution">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Plan Badge & Payment Status */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              {plan === 'ANNUAL_ENTERPRISE' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                  <Crown className="w-3 h-3 text-amber-600" />
                                  <span>Annual Enterprise</span>
                                </span>
                              ) : plan === 'PRO_MONTHLY' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
                                  <Sparkles className="w-3 h-3 text-sky-600" />
                                  <span>Pro Recruiter</span>
                                </span>
                              ) : plan === 'CUSTOM_ADMIN' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                                  <span>Custom Admin</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                  <span>Free Starter</span>
                                </span>
                              )}

                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className={`px-1.5 py-0.2 rounded-md font-bold ${
                                  subStatus === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {subStatus}
                                </span>
                                {poster.subscription?.grantedByAdmin && (
                                  <span className="text-purple-600 font-bold">Admin Granted</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Column 3: Application Access */}
                          <td className="py-3.5 px-3">
                            {isUnlimited ? (
                              <div className="space-y-0.5">
                                <span className="font-black text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Unlimited (All)</span>
                                </span>
                                <span className="text-[10px] text-slate-400 block">Full candidate CV access</span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>{poster.subscription?.freeLimitPerJob || 5} per vacancy</span>
                                </span>
                                <span className="text-[10px] text-amber-700 font-medium block">Subsequent locked</span>
                              </div>
                            )}
                          </td>

                          {/* Column 4: Jobs & Applicants */}
                          <td className="py-3.5 px-3">
                            <p className="font-bold text-slate-800">
                              {poster.jobsCount} {poster.jobsCount === 1 ? 'Job' : 'Jobs'} Posted
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {poster.totalApplicants} Total Applications
                            </p>
                          </td>

                          {/* Column 5: Validity */}
                          <td className="py-3.5 px-3">
                            {isUnlimited ? (
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-700 text-[11px]">
                                  Expires: {poster.subscription?.endDate ? new Date(poster.subscription.endDate).toLocaleDateString() : 'Active'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Paid: ₹{poster.subscription?.amountPaid || 0}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">
                                Free Tier (No Expiry)
                              </span>
                            )}
                          </td>

                          {/* Column 6: Admin Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Unlimited Access Button */}
                              {isUnlimited ? (
                                <button
                                  type="button"
                                  onClick={() => toggleAccessMutation.mutate({ userId: poster.id, hasUnlimitedAccess: false })}
                                  disabled={toggleAccessMutation.isPending}
                                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition active:scale-95 flex items-center gap-1"
                                  title="Revoke unlimited candidate access (revert to Free)"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Revoke</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleAccessMutation.mutate({ userId: poster.id, hasUnlimitedAccess: true })}
                                  disabled={toggleAccessMutation.isPending}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition active:scale-95 flex items-center gap-1"
                                  title="Manually grant 100% full application access"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Grant Access</span>
                                </button>
                              )}

                              {/* Edit Plan & Limits Modal Opener */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPosterForEdit(poster);
                                  setEditPlan(poster.subscription?.plan || 'PRO_MONTHLY');
                                  setEditFreeLimit(poster.subscription?.freeLimitPerJob || 5);
                                  setEditDurationDays(30);
                                  setEditAdminNotes(poster.subscription?.adminNotes || '');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-sky-300 text-sky-700 hover:bg-sky-50 font-bold text-xs transition active:scale-95"
                              >
                                Edit Plan
                              </button>

                              {/* Suspend / Activate Status */}
                              {subStatus === 'ACTIVE' ? (
                                <button
                                  type="button"
                                  onClick={() => toggleStatusMutation.mutate({ userId: poster.id, status: 'SUSPENDED' })}
                                  disabled={toggleStatusMutation.isPending}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                                  title="Suspend subscription access"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleStatusMutation.mutate({ userId: poster.id, status: 'ACTIVE' })}
                                  disabled={toggleStatusMutation.isPending}
                                  className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                                  title="Activate subscription access"
                                >
                                  <Check className="w-4 h-4" />
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

      {/* 5. TAB CONTENT 2: Payments & Transaction Records */}
      {activeSubTab === 'PAYMENTS' && (
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transaction by payment ID, user, email, school..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">PAYMENT ID</th>
                    <th className="py-3.5 px-3">JOB POSTER / SCHOOL</th>
                    <th className="py-3.5 px-3">PLAN PURCHASED</th>
                    <th className="py-3.5 px-3">AMOUNT</th>
                    <th className="py-3.5 px-3">GATEWAY</th>
                    <th className="py-3.5 px-3">STATUS</th>
                    <th className="py-3.5 px-4 text-right">TRANSACTION DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingPayments ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        Loading payment records...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                          {p.paymentId}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-slate-900 leading-tight">{p.userName}</p>
                          <p className="text-[11px] text-slate-500">{p.userEmail}</p>
                          <p className="text-[11px] text-slate-700 font-semibold">{p.institutionName}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-800">
                            {p.plan === 'ANNUAL_ENTERPRISE' ? 'Annual Enterprise' : 'Pro Recruiter Monthly'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-sm font-black text-slate-900">
                            ₹{p.amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {p.paymentGateway || 'DIRECT_PAY'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {p.status || 'SUCCESS'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
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

      {/* 6. Edit Plan & Limits Modal */}
      {selectedPosterForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Configure Poster Subscription</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPosterForEdit.fullName} • {selectedPosterForEdit.institutionName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPosterForEdit(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Membership Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-sky-500"
                >
                  <option value="FREE">Free Starter (Restricted to 5 applications)</option>
                  <option value="PRO_MONTHLY">Pro Recruiter (Monthly - Unlimited Access)</option>
                  <option value="ANNUAL_ENTERPRISE">Annual Enterprise (Yearly - Unlimited Access)</option>
                  <option value="CUSTOM_ADMIN">Custom Admin Clearance (Unlimited Access)</option>
                </select>
              </div>

              {editPlan === 'FREE' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Free Applicant View Limit (Per Vacancy)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editFreeLimit}
                    onChange={(e) => setEditFreeLimit(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">First X applicants for each job will be accessible. Remaining locked.</p>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Access Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={editDurationDays}
                    onChange={(e) => setEditDurationDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Number of days before subscription requires renewal.</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Super Admin Notes / Justification</label>
                <textarea
                  rows={3}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="e.g. Granted trial enterprise access per partnership MoU"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-sky-500 font-medium resize-none"
                />
              </div>

            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPosterForEdit(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updatePlanMutation.mutate({
                    userId: selectedPosterForEdit.id,
                    plan: editPlan,
                    durationDays: editDurationDays,
                    freeLimitPerJob: editFreeLimit,
                    adminNotes: editAdminNotes,
                  });
                }}
                disabled={updatePlanMutation.isPending}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {updatePlanMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
