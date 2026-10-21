import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  ExternalLink
} from 'lucide-react';
import { Institution, AuditLog } from '@sikchakhub/shared-types';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'AUDIT_LOGS' | 'ANALYTICS'>('VERIFICATION');
  const [actionNotes, setActionNotes] = useState('');

  // Fetch admin KPIs
  const { data: kpiData } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/kpis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch pending institutions
  const { data: pendingData, refetch: refetchPending } = useQuery({
    queryKey: ['admin-pending-institutions'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/pending-institutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch audit logs
  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const kpis = kpiData?.kpis || {
    totalTeachers: 18520,
    totalInstitutions: 1250,
    pendingInstitutions: 1,
    totalVacancies: 1420,
    activeVacancies: 890,
    totalApplications: 4120,
    interviewsScheduled: 340,
  };

  const pendingInstitutions: Institution[] = pendingData?.pending || [];
  const logs: AuditLog[] = auditData?.logs || [];

  const handleVerify = async (institutionId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await fetch('/api/v1/admin/verify-institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ institutionId, status, notes: actionNotes || `Status updated to ${status} by admin` }),
      });
      setActionNotes('');
      refetchPending();
    } catch (err) {
      console.error('Failed to verify institution:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-sky-950 text-white rounded-2xl p-6 shadow-md border border-sky-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img src="/logo.jpeg" alt="SikshaHub Governance" className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-300/60 bg-white shadow-md shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif">SikshaHub Super Admin Governance Portal</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
                  Full Compliance Access
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-0.5">
                Centralized institution approval, candidate data privacy auditing, and recruitment operations monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Educators</span>
            <span className="text-2xl font-bold text-slate-900 font-serif">{kpis.totalTeachers}</span>
            <p className="text-[10px] text-emerald-600 font-medium">Active teacher profiles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Verified Institutions</span>
            <span className="text-2xl font-bold text-slate-900 font-serif">{kpis.totalInstitutions}</span>
            <p className="text-[10px] text-amber-600 font-medium">{pendingInstitutions.length} Pending verification</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Live Vacancies</span>
            <span className="text-2xl font-bold text-slate-900 font-serif">{kpis.activeVacancies}</span>
            <p className="text-[10px] text-brand-600 font-medium">Published across India</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Recruitment Applications</span>
            <span className="text-2xl font-bold text-purple-700 font-serif">{kpis.totalApplications}</span>
            <p className="text-[10px] text-purple-600 font-medium">Automated screen rate: 94%</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'VERIFICATION'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending Verification Queue ({pendingInstitutions.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'AUDIT_LOGS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security & Compliance Audit Trail ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'ANALYTICS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Platform Recruitment Analytics
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === 'VERIFICATION' && (
          <div className="space-y-4">
            {pendingInstitutions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-2 border border-slate-200/90 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Verification Queue Clear!</h4>
                <p className="text-xs text-slate-500">
                  All submitted educational institutions, schools, and coaching academies are currently reviewed.
                </p>
              </div>
            ) : (
              pendingInstitutions.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white rounded-2xl p-6 shadow-xs border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={inst.logoUrl || '/logo.jpeg'}
                      alt={inst.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-300/40 bg-white shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 font-serif">{inst.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {inst.type} • {inst.address}, {inst.city}, {inst.state} - {inst.pincode}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Board Affiliation Number: <strong>{inst.affiliationNumber || 'Pending'}</strong> • Website: {inst.website}
                      </p>
                      {inst.verificationNotes && (
                        <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 max-w-lg">
                          <strong>Note:</strong> {inst.verificationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                      onClick={() => handleVerify(inst.id, 'REJECTED')}
                      className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-xl border border-red-200 transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleVerify(inst.id, 'VERIFIED')}
                      className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Job Posting</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden space-y-2 p-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Security & Administrative Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of role access, candidate evaluations, stage transitions, and institution verification decisions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">User Email</th>
                    <th className="py-3 px-3">Resource Target</th>
                    <th className="py-3 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.map((log) => (
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
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-serif">Openings by Educational Category</h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'IIT-JEE & NEET Coaching Faculty', count: '42%' },
                  { name: 'PGT Senior Secondary (CBSE / ICSE)', count: '28%' },
                  { name: 'TGT & Primary School Educators', count: '18%' },
                  { name: 'College Lecturers & University Faculty', count: '12%' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: item.count }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-serif">Top Recruitment Hub Cities</h4>
              <div className="space-y-2 text-xs">
                {[
                  { city: 'Kota, Rajasthan', share: '34% (National Coaching Hub)' },
                  { city: 'Delhi NCR (Dwarka, Noida, Gurugram)', share: '29% (Top K-12 Board Schools)' },
                  { city: 'Bengaluru, Karnataka', share: '18% (Cambridge & EdTech)' },
                  { city: 'Pune & Hyderabad', share: '19% (Universities & Medical Wing)' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.city}</span>
                    <span className="text-slate-500 font-medium">{item.share}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
