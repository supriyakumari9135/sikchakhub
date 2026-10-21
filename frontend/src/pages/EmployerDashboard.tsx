import React, { useState } from 'react';
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
  Filter, 
  ExternalLink,
  ChevronDown,
  Clock,
  MapPin,
  TrendingUp,
  FileText
} from 'lucide-react';
import { JobVacancy, JobApplication, ApplicationStage } from '@sikchakhub/shared-types';
import { CandidateMatchDrawer } from '../components/CandidateMatchDrawer';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { PostJobModal } from '../components/PostJobModal';

export const EmployerDashboard: React.FC = () => {
  const { user, institution, token } = useAuth();

  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchCandidate, setSearchCandidate] = useState<string>('');
  
  // Modals & Drawers
  const [evaluatingApplication, setEvaluatingApplication] = useState<JobApplication | null>(null);
  const [schedulingApplication, setSchedulingApplication] = useState<JobApplication | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  // Fetch employer jobs
  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/jobs');
      return res.json();
    },
  });

  const jobs: JobVacancy[] = jobsData?.jobs || [];
  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Fetch candidates for selected job
  const { data: candidatesData, refetch: refetchCandidates } = useQuery({
    queryKey: ['job-candidates', selectedJobId, selectedStageFilter],
    queryFn: async () => {
      const stageParam = selectedStageFilter !== 'ALL' ? `?stage=${selectedStageFilter}` : '';
      const res = await fetch(`/api/v1/applications/job/${selectedJobId}${stageParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!selectedJobId && !!token,
  });

  const candidates: JobApplication[] = candidatesData?.candidates || [];

  // Filter candidates by name or query
  const filteredCandidates = candidates.filter(c => {
    if (!searchCandidate) return true;
    const q = searchCandidate.toLowerCase();
    return (
      c.teacher?.fullName.toLowerCase().includes(q) ||
      c.teacher?.profile?.highestQualification.toLowerCase().includes(q) ||
      c.teacher?.profile?.currentCity.toLowerCase().includes(q)
    );
  });

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      await fetch(`/api/v1/applications/${appId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });
      refetchCandidates();
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHORTLISTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SCREENING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SELECTED':
        return 'bg-green-600 text-white border-green-700';
      case 'REJECTED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Recruiter Header Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={institution?.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=120&h=120&q=80'}
              alt={institution?.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 font-serif">
                  {institution?.name || 'Recruiter Portal'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Organization
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {institution?.address}, {institution?.city} • Affiliation: {institution?.affiliationNumber || 'CBSE / State'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPostJobModal(true)}
            className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy Opening</span>
          </button>
        </div>

        {/* 4 Recruitment KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Openings</span>
            <span className="text-2xl font-bold text-slate-900 font-serif">{jobs.length}</span>
            <p className="text-[10px] text-emerald-600 font-medium">Recruitment live</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Applicants</span>
            <span className="text-2xl font-bold text-slate-900 font-serif">
              {jobs.reduce((acc, j) => acc + (j.totalApplicants || 0), 0) || 48}
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Filtered by screening engine</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Shortlisted Pool</span>
            <span className="text-2xl font-bold text-emerald-600 font-serif">14</span>
            <p className="text-[10px] text-emerald-600 font-medium">&gt; 80% Match score</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Interviews & Demos</span>
            <span className="text-2xl font-bold text-purple-600 font-serif">6</span>
            <p className="text-[10px] text-purple-600 font-medium">Google Meet slots</p>
          </div>
        </div>

        {/* Vacancy Selector & Pipeline Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden space-y-4 p-6">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Vacancy Opening:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-bold text-slate-900 px-3 py-2 rounded-xl border border-slate-300 bg-white shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.subject} • ₹{j.minSalaryLPA}-{j.maxSalaryLPA}L)
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Search in job */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or skill..."
                value={searchCandidate}
                onChange={(e) => setSearchCandidate(e.target.value)}
                className="w-full bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Recruitment Stages Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {['ALL', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStageFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  selectedStageFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Candidate Applicants Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate & Profile</th>
                  <th className="py-3 px-3">Subject & Degree</th>
                  <th className="py-3 px-3">Exp / Location</th>
                  <th className="py-3 px-3">AI Match Score</th>
                  <th className="py-3 px-3">Current Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No candidate applications match this stage filter.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Name & Headline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                            {cand.teacher?.fullName.charAt(0) || 'C'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{cand.teacher?.fullName}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
                              {cand.teacher?.profile?.headline || cand.teacher?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Degree */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {cand.teacher?.profile?.subjects?.join(', ') || 'Teaching'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cand.teacher?.profile?.highestQualification}
                        </span>
                      </td>

                      {/* Experience & Location */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {cand.teacher?.profile?.experienceYears || 0} Years Exp
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cand.teacher?.profile?.currentCity}
                        </span>
                      </td>

                      {/* Match Score */}
                      <td className="py-3.5 px-3">
                        {cand.matchResult ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              cand.matchResult.overallScore >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              <Sparkles className="w-3 h-3" />
                              {cand.matchResult.overallScore}% MATCH
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {cand.matchResult.autoFilteredStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Evaluating</span>
                        )}
                      </td>

                      {/* Stage Selector */}
                      <td className="py-3.5 px-3">
                        <select
                          value={cand.stage}
                          onChange={(e) => handleStageChange(cand.id, e.target.value as ApplicationStage)}
                          className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="SCREENING">Screening</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW_SCHEDULED">Interview</option>
                          <option value="SELECTED">Selected</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEvaluatingApplication(cand)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                          >
                            Evaluate
                          </button>
                          <button
                            onClick={() => setSchedulingApplication(cand)}
                            className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-xs transition"
                          >
                            Schedule Demo
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
      </div>

      {/* Evaluating Candidate Drawer */}
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
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {schedulingApplication && (
        <ScheduleInterviewModal
          application={schedulingApplication}
          onClose={() => setSchedulingApplication(null)}
          onSuccess={() => {
            refetchCandidates();
          }}
        />
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <PostJobModal
          onClose={() => setShowPostJobModal(false)}
          onJobCreated={() => {
            refetchJobs();
          }}
        />
      )}
    </div>
  );
};
