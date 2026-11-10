import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Users, 
  Download, 
  Trash2, 
  Eye, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Check, 
  X, 
  Search, 
  RotateCw, 
  Plus, 
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { apiUrl } from '../../config/api';

interface AdminCandidateGroupsManagerProps {
  token: string | null;
  userRole?: string;
  onPreviewCv: (doc: any) => void;
  onNavigateToScreening?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminCandidateGroupsManager: React.FC<AdminCandidateGroupsManagerProps> = ({
  token,
  userRole,
  onPreviewCv,
  onNavigateToScreening,
  showToast,
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'>('ALL');

  // Selected Group Details Modal
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Fetch all candidate groups
  const fetchGroups = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/candidate-groups'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups || []);
      }
    } catch (e) {
      showToast('Failed to load candidate groups', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  // Open Detailed Group View
  const handleOpenGroupDetail = async (groupId: string) => {
    if (!token) return;
    setIsLoadingDetail(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/candidate-groups/${groupId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedGroupDetail(data.group);
        setEditingNotes(data.group.notes || '');
      }
    } catch (e) {
      showToast('Failed to load group details', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Remove Candidate from Group
  const handleRemoveCandidate = async (candidateId: string) => {
    if (!selectedGroupDetail || !token) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/candidate-groups/${selectedGroupDetail.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          removeCandidateId: candidateId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Candidate removed from group.', 'success');
        setSelectedGroupDetail((prev: any) => ({
          ...prev,
          candidates: (prev.candidates || []).filter((c: any) => c.id !== candidateId),
          candidateIds: (prev.candidateIds || []).filter((id: string) => id !== candidateId),
        }));
        fetchGroups();
      }
    } catch (e) {
      showToast('Failed to remove candidate', 'error');
    }
  };

  // Save Group Notes
  const handleSaveNotes = async () => {
    if (!selectedGroupDetail || !token) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/candidate-groups/${selectedGroupDetail.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: editingNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Recruitment notes updated.', 'success');
        setSelectedGroupDetail((prev: any) => ({ ...prev, notes: editingNotes }));
        fetchGroups();
      }
    } catch (e) {
      showToast('Failed to update notes', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!window.confirm(`Are you sure you want to remove candidate group "${groupName}"?`)) return;
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/v1/admin/candidate-groups/${groupId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Group "${groupName}" removed.`, 'success');
        if (selectedGroupDetail?.id === groupId) {
          setSelectedGroupDetail(null);
        }
        fetchGroups();
      }
    } catch (e) {
      showToast('Failed to delete group', 'error');
    }
  };

  // Export Group to CSV
  const handleExportGroup = (groupId: string, groupName: string) => {
    if (!token) return;
    const downloadUrl = apiUrl(`/api/v1/admin/candidate-groups/${groupId}/export`);
    
    // Create an anchor and fetch with auth header
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Shortlist_${groupName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast(`Exported "${groupName}" to CSV successfully!`, 'success');
      })
      .catch(() => showToast('Failed to export group to CSV', 'error'));
  };

  // Filtered Groups
  const filteredGroups = groups.filter(g => {
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      const match = 
        g.name.toLowerCase().includes(q) ||
        (g.targetVacancyTitle && g.targetVacancyTitle.toLowerCase().includes(q)) ||
        (g.targetLocation && g.targetLocation.toLowerCase().includes(q)) ||
        (g.createdByName && g.createdByName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalCandidatesAcrossGroups = groups.reduce((acc, g) => acc + (g.candidateIds?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Stats */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Candidate Shortlist Groups & Vacancy Cohorts
              </h2>
              <p className="text-xs text-slate-500">
                Manage organized applicant pools, review CV documents, log recruiter notes, and export candidate dossiers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToScreening && (
            <button
              onClick={onNavigateToScreening}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Screen & Shortlist Candidates</span>
            </button>
          )}

          <button
            onClick={fetchGroups}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh groups"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Three Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Shortlist Groups</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{groups.length}</span>
            <span className="text-[10px] text-sky-600 font-medium">Dedicated vacancy pools</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Candidates Shortlisted</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">{totalCandidatesAcrossGroups}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Across all vacancy groups</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Vacancy Cohorts</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block font-mono">
              {groups.filter(g => g.status === 'ACTIVE').length}
            </span>
            <span className="text-[10px] text-purple-700 font-medium">Ready for interview stage</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search groups by name, vacancy or author..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Groups Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/90 space-y-2">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-sky-600" />
          <p className="text-xs font-semibold text-slate-600">Loading candidate groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/90 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <p className="text-sm font-bold text-slate-800">No Candidate Groups Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Screen candidates in the CV Vault and click "Create Named Candidate Group" to organize teacher cohorts.
            </p>
          </div>
          {onNavigateToScreening && (
            <button
              onClick={onNavigateToScreening}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-2xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Go to CV Screening Vault</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Top: Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug font-serif">
                      {group.name}
                    </h3>
                    {group.targetVacancyTitle && (
                      <p className="text-xs text-sky-700 font-semibold mt-0.5">
                        {group.targetVacancyTitle}
                      </p>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    group.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : group.status === 'COMPLETED'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {group.status}
                  </span>
                </div>

                {/* Location and Info */}
                {group.targetLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.targetLocation}</span>
                  </div>
                )}

                {/* Candidate Count */}
                <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-sky-900 font-bold">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>{group.candidatesCount || (group.candidateIds || []).length} Candidates</span>
                  </div>
                  <span className="text-[10px] text-sky-600 font-semibold">Shortlisted Cohort</span>
                </div>

                {/* Created By details */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    Created by: <strong className="text-slate-600">{group.createdByName}</strong> ({group.createdByRole})
                  </span>
                  <span>
                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenGroupDetail(group.id)}
                  className="flex-1 py-1.5 px-3 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Candidates</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportGroup(group.id, group.name)}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                  title="Export Group to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                  title="Delete Group"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Detailed Group Candidates Modal */}
      {selectedGroupDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      {selectedGroupDetail.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {(selectedGroupDetail.candidates || []).length} Candidates
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Created by {selectedGroupDetail.createdByName} • {selectedGroupDetail.targetLocation || 'All India'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportGroup(selectedGroupDetail.id, selectedGroupDetail.name)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedGroupDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Recruiter Notes Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recruiter Shortlisting Notes & Evaluation Criteria
                  </label>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record client interview dates, salary negotiation limits, or candidate test scores..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>

              {/* Shortlisted Candidates List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Shortlisted Candidates ({selectedGroupDetail.candidates?.length || 0})
                </h4>

                {(!selectedGroupDetail.candidates || selectedGroupDetail.candidates.length === 0) ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs">No candidates in this group yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedGroupDetail.candidates.map((cand: any) => (
                      <div
                        key={cand.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-slate-900">{cand.fullName}</h5>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              {cand.profileCompletionScore || 80}% ATS
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{cand.highestQualification}</span>
                            <span>•</span>
                            <span>{cand.experienceYears} Yrs Exp</span>
                            <span>•</span>
                            <span>Expected: ₹{cand.expectedSalaryLPA || 0} LPA</span>
                            <span>•</span>
                            <span>{cand.currentCity || 'City unverified'}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {(cand.subjects || []).map((sub: string, sIdx: number) => (
                              <span key={sIdx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                {sub}
                              </span>
                            ))}
                            {(cand.teachingLevels || []).map((lvl: string, lIdx: number) => (
                              <span key={lIdx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">
                                {lvl}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                          {cand.resumeUrl && (
                            <button
                              onClick={() => {
                                onPreviewCv({
                                  id: cand.id,
                                  candidateName: cand.fullName,
                                  candidateEmail: cand.email,
                                  jobTitle: selectedGroupDetail.name,
                                  fileName: cand.resumeFileName || `${cand.fullName}_CV.pdf`,
                                  fileUrl: cand.resumeUrl,
                                  atsScore: cand.profileCompletionScore || 80,
                                  parsedDegree: cand.highestQualification,
                                });
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview CV</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveCandidate(cand.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove candidate from this shortlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Authorized Candidate Shortlisting Group • SikchaKhub.AI
              </span>
              <button
                onClick={() => setSelectedGroupDetail(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

