import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  FileText, 
  Download, 
  Eye, 
  Check, 
  Plus, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Award, 
  RotateCw, 
  CheckSquare, 
  Square, 
  Layers, 
  X, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  Building
} from 'lucide-react';
import { apiUrl } from '../../config/api';

interface AdminCvScreeningVaultProps {
  token: string | null;
  userRole?: string;
  onPreviewCv: (doc: any) => void;
  onShortlistCreated?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const INDIAN_STATES = [
  'ALL',
  'Delhi NCR',
  'Uttar Pradesh',
  'Bihar',
  'Maharashtra',
  'Karnataka',
  'Haryana',
  'Punjab',
  'Rajasthan',
  'Madhya Pradesh',
  'West Bengal',
  'Gujarat',
  'Tamil Nadu',
  'Telangana',
  'Kerala',
  'Jharkhand',
  'Uttarakhand'
];

const TEACHING_LEVELS = [
  { id: 'PRE_PRIMARY', label: 'Nursery / Pre-Primary' },
  { id: 'PRT', label: 'PRT (Primary Teacher)' },
  { id: 'TGT', label: 'TGT (Trained Graduate)' },
  { id: 'PGT', label: 'PGT (Post Graduate)' },
  { id: 'COACHING_JEE', label: 'IIT-JEE Faculty' },
  { id: 'COACHING_NEET', label: 'NEET Medical Faculty' },
  { id: 'COLLEGE_PROFESSOR', label: 'College Professor' }
];

const SUBJECT_LIST = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Computer Science',
  'Social Science',
  'History',
  'Geography',
  'Economics',
  'Commerce & Accounts',
  'Sanskrit',
  'Physical Education'
];

const BOARD_OPTIONS = ['CBSE', 'ICSE', 'STATE_BOARD', 'IB', 'CAMBRIDGE'];
const CERT_OPTIONS = ['B.Ed', 'CTET Paper 1', 'CTET Paper 2', 'STET', 'UGC-NET', 'CSIR-NET'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Sanskrit', 'Bengali', 'Marathi', 'Regional'];

export const AdminCvScreeningVault: React.FC<AdminCvScreeningVaultProps> = ({
  token,
  userRole,
  onPreviewCv,
  onShortlistCreated,
  showToast,
}) => {
  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [minSalaryLPA, setMinSalaryLPA] = useState('');
  const [maxSalaryLPA, setMaxSalaryLPA] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [qualification, setQualification] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [joiningAvailability, setJoiningAvailability] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Results & Selection States
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [activeGroups, setActiveGroups] = useState<any[]>([]);

  // Create Group Modal State
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVacancyTitle, setNewGroupVacancyTitle] = useState('');
  const [newGroupLocation, setNewGroupLocation] = useState('');
  const [newGroupNotes, setNewGroupNotes] = useState('');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Add to Existing Group Modal State
  const [isAddToExistingOpen, setIsAddToExistingOpen] = useState(false);
  const [selectedExistingGroupId, setSelectedExistingGroupId] = useState('');

  // 1. Fetch screened candidates based on filters
  const fetchScreenedCandidates = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/cv-screening'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          q: searchQuery.trim(),
          state: selectedState,
          city: selectedCity.trim(),
          minSalaryLPA: minSalaryLPA ? Number(minSalaryLPA) : undefined,
          maxSalaryLPA: maxSalaryLPA ? Number(maxSalaryLPA) : undefined,
          teachingLevels: selectedLevels,
          subjects: selectedSubjects,
          qualification: qualification.trim(),
          minExperience: minExp ? Number(minExp) : undefined,
          maxExperience: maxExp ? Number(maxExp) : undefined,
          boardExperience: selectedBoards,
          certifications: selectedCerts,
          languages: selectedLangs,
          joiningAvailability: joiningAvailability,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
      } else {
        showToast(data.message || 'Failed to screen candidates', 'error');
      }
    } catch (err: any) {
      showToast('Network error during candidate screening', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active candidate groups for "Add to Existing"
  const fetchActiveGroups = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/v1/admin/candidate-groups'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActiveGroups(data.groups || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchScreenedCandidates();
    fetchActiveGroups();
  }, [token]);

  // Toggle Selection Helpers
  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidateIds.length === candidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(candidates.map(c => c.id));
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('ALL');
    setSelectedCity('');
    setMinSalaryLPA('');
    setMaxSalaryLPA('');
    setSelectedLevels([]);
    setSelectedSubjects([]);
    setQualification('');
    setMinExp('');
    setMaxExp('');
    setSelectedBoards([]);
    setSelectedCerts([]);
    setSelectedLangs([]);
    setJoiningAvailability('ALL');
    setTimeout(() => {
      fetchScreenedCandidates();
    }, 50);
  };

  // Create Shortlist Group Handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('Please enter a descriptive group name', 'error');
      return;
    }

    if (selectedCandidateIds.length === 0) {
      showToast('Please select at least 1 candidate for the shortlist group', 'error');
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/candidate-groups'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          targetVacancyTitle: newGroupVacancyTitle.trim(),
          targetLocation: newGroupLocation.trim(),
          candidateIds: selectedCandidateIds,
          notes: newGroupNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Candidate group created successfully!', 'success');
        setIsCreateGroupModalOpen(false);
        setNewGroupName('');
        setNewGroupVacancyTitle('');
        setNewGroupLocation('');
        setNewGroupNotes('');
        setSelectedCandidateIds([]);
        fetchScreenedCandidates();
        fetchActiveGroups();
        if (onShortlistCreated) onShortlistCreated();
      } else {
        showToast(data.message || 'Failed to create group', 'error');
      }
    } catch (err: any) {
      showToast('Error saving shortlist group', 'error');
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Add Candidates to Existing Group Handler
  const handleAddToExistingGroup = async () => {
    if (!selectedExistingGroupId) {
      showToast('Please select a candidate group', 'error');
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/v1/admin/candidate-groups/${selectedExistingGroupId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addCandidateIds: selectedCandidateIds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Added ${selectedCandidateIds.length} candidate(s) to shortlist group!`, 'success');
        setIsAddToExistingOpen(false);
        setSelectedExistingGroupId('');
        setSelectedCandidateIds([]);
        fetchScreenedCandidates();
        fetchActiveGroups();
        if (onShortlistCreated) onShortlistCreated();
      } else {
        showToast(data.message || 'Failed to update group', 'error');
      }
    } catch (err) {
      showToast('Error updating group', 'error');
    }
  };

  // CV Preview with Audit Logging
  const handlePreviewCandidateCv = (candidate: any) => {
    if (!candidate.resumeUrl) {
      showToast('No PDF CV uploaded for this candidate yet.', 'error');
      return;
    }

    // Log CV review
    try {
      fetch(apiUrl('/api/v1/admin/log-cv-view'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.fullName,
          fileName: candidate.resumeFileName || 'Candidate_CV.pdf',
        }),
      });
    } catch (e) {}

    onPreviewCv({
      id: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      jobTitle: candidate.headline,
      fileName: candidate.resumeFileName || `${candidate.fullName.replace(/\s+/g, '_')}_CV.pdf`,
      fileUrl: candidate.resumeUrl,
      atsScore: candidate.profileCompletionScore || 85,
      parsedDegree: candidate.highestQualification,
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Stats */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                CV & Document Vault • Candidate Screening Engine
              </h2>
              <p className="text-xs text-slate-500">
                Screen verified educators by 12 multi-parameter criteria, inspect uploaded PDF CVs, and shortlist candidates into named groups.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
            {candidates.length} Matched Educators
          </span>
          <button
            onClick={() => fetchScreenedCandidates()}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh candidate list"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Advanced Multi-Criteria Filter Console */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Quick Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Search Educator / Skills
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchScreenedCandidates()}
                placeholder="Name, email, phone, headline..."
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Location: State */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              State / Region
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none font-medium"
            >
              {INDIAN_STATES.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'All India (Any State)' : st}</option>
              ))}
            </select>
          </div>

          {/* Location: City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              City / District
            </label>
            <input
              type="text"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              placeholder="e.g. New Delhi, Patna, Bangalore..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Expected Salary LPA */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Salary Range (LPA)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Min LPA"
                value={minSalaryLPA}
                onChange={(e) => setMinSalaryLPA(e.target.value)}
                className="w-1/2 text-xs px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Max LPA"
                value={maxSalaryLPA}
                onChange={(e) => setMaxSalaryLPA(e.target.value)}
                className="w-1/2 text-xs px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Teaching Level Multi-select Pills */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Teaching Levels (PRT / TGT / PGT / Faculty)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEACHING_LEVELS.map(lvl => {
              const isSelected = selectedLevels.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setSelectedLevels(prev =>
                      prev.includes(lvl.id) ? prev.filter(x => x !== lvl.id) : [...prev, lvl.id]
                    );
                  }}
                  className={`text-xs px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teaching Subject Multi-select Chips */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Academic Subjects
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_LIST.map(sub => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSelectedSubjects(prev =>
                      prev.includes(sub) ? prev.filter(x => x !== sub) : [...prev, sub]
                    );
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Filters (Qualification, Board, Certs, Languages, Availability) */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Qualification */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Highest Qualification
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Ed, M.Sc, Ph.D..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none"
                />
              </div>

              {/* Teaching Experience Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Experience (Years)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min Yrs"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="w-1/2 text-xs px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max Yrs"
                    value={maxExp}
                    onChange={(e) => setMaxExp(e.target.value)}
                    className="w-1/2 text-xs px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Joining Availability */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Joining Availability
                </label>
                <select
                  value={joiningAvailability}
                  onChange={(e) => setJoiningAvailability(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white outline-none font-medium"
                >
                  <option value="ALL">Any Availability</option>
                  <option value="Immediate">Immediate Joining</option>
                  <option value="15 Days">Within 15 Days</option>
                  <option value="1 Month">1 Month Notice</option>
                  <option value="3 Months">3 Months Notice</option>
                </select>
              </div>
            </div>

            {/* Board Experience Chips */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Board Experience (CBSE / ICSE / State / IB)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BOARD_OPTIONS.map(b => {
                  const isSel = selectedBoards.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBoards(prev =>
                          prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                        );
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg transition font-medium ${
                        isSel ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teaching Certifications */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mandatory Certifications (B.Ed / CTET / STET)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CERT_OPTIONS.map(c => {
                  const isSel = selectedCerts.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedCerts(prev =>
                          prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                        );
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg transition font-medium ${
                        isSel ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instruction Languages
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGE_OPTIONS.map(l => {
                  const isSel = selectedLangs.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setSelectedLangs(prev =>
                          prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
                        );
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg transition font-medium ${
                        isSel ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            <span>{showAdvancedFilters ? 'Hide Advanced Filters' : 'More Filters (Board, CTET, Languages, Notice)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={fetchScreenedCandidates}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply Filters & Screen CVs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Floating Candidate Selection Action Bar */}
      {selectedCandidateIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs border border-sky-400/30">
              {selectedCandidateIds.length}
            </div>
            <div>
              <p className="text-xs font-bold">
                {selectedCandidateIds.length} candidate(s) selected for shortlisting
              </p>
              <p className="text-[10px] text-slate-400">
                Create a named cohort group for a specific school opening or add to an existing shortlist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Candidate Group</span>
            </button>

            {activeGroups.length > 0 && (
              <button
                onClick={() => setIsAddToExistingOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Add to Existing Group</span>
              </button>
            )}

            <button
              onClick={() => setSelectedCandidateIds([])}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Candidate Screening Results Cards */}
      <div className="space-y-3">
        {/* Bulk select check bar */}
        {candidates.length > 0 && (
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900"
            >
              {selectedCandidateIds.length === candidates.length ? (
                <CheckSquare className="w-4 h-4 text-sky-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All Candidates ({candidates.length})</span>
            </button>

            <span className="text-[11px] text-slate-500">
              Showing {candidates.length} filtered educator profiles
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/90 space-y-2">
            <RotateCw className="w-8 h-8 animate-spin mx-auto text-sky-600" />
            <p className="text-sm font-semibold text-slate-700">Screening candidates against criteria...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/90 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-base font-bold text-slate-800">No Candidates Match Your Screening Filters</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Try widening your location, salary range, or removing restrictive board/certification filters to view more candidates.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((cand) => {
              const isSelected = selectedCandidateIds.includes(cand.id);
              return (
                <div
                  key={cand.id}
                  className={`bg-white p-5 rounded-3xl border transition flex flex-col justify-between space-y-3 ${
                    isSelected 
                      ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md bg-sky-50/10' 
                      : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top row: Checkbox, Name, ATS Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCandidate(cand.id)}
                          className="mt-1 text-slate-400 hover:text-sky-600 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {cand.fullName}
                          </h4>
                          <p className="text-[11px] text-sky-700 font-semibold truncate max-w-[190px]">
                            {cand.headline || 'Teaching Professional'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {cand.profileCompletionScore}% Score
                      </span>
                    </div>

                    {/* Candidate Key Details */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {cand.currentCity || cand.state || 'Location unverified'}
                          {cand.state && cand.currentCity ? `, ${cand.state}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                          {cand.highestQualification} • {cand.experienceYears} Years Exp
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Expected: <strong className="text-slate-800">₹{cand.expectedSalaryLPA || 0} LPA</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>{cand.joiningAvailability}</span>
                      </div>
                    </div>

                    {/* Tags: Subjects & Levels */}
                    <div className="flex flex-wrap gap-1">
                      {(cand.subjects || []).slice(0, 3).map((sub: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          {sub}
                        </span>
                      ))}
                      {(cand.teachingLevels || []).slice(0, 2).map((lvl: string, lIdx: number) => (
                        <span key={lIdx} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700">
                          {lvl}
                        </span>
                      ))}
                      {(cand.boardExperience || []).slice(0, 2).map((b: string, bIdx: number) => (
                        <span key={bIdx} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Existing Groups Pill if already shortlisted */}
                    {cand.groups && cand.groups.length > 0 && (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">Shortlisted in: </span>
                        {cand.groups.map((g: any) => g.name).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Preview CV & Download */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {cand.resumeUrl ? (
                      <button
                        type="button"
                        onClick={() => handlePreviewCandidateCv(cand)}
                        className="flex-1 py-1.5 px-3 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview CV</span>
                      </button>
                    ) : (
                      <span className="flex-1 py-1.5 text-center text-[11px] font-medium text-slate-400 bg-slate-100 rounded-xl">
                        No CV Document
                      </span>
                    )}

                    {cand.resumeUrl && (
                      <a
                        href={cand.resumeUrl.startsWith('http') ? cand.resumeUrl : apiUrl(cand.resumeUrl)}
                        download={cand.resumeFileName || `${cand.fullName}_CV.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        title="Download candidate CV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleCandidate(cand.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                        isSelected 
                          ? 'bg-sky-100 text-sky-800' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Shortlist'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Create Named Candidate Group */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">Create Shortlist Group</h3>
                  <p className="text-xs text-slate-500">
                    Group {selectedCandidateIds.length} candidate(s) for a dedicated school vacancy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. PGT Physics – Delhi Vacancy or TGT Mathematics – Patna"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Vacancy Title
                  </label>
                  <input
                    type="text"
                    value={newGroupVacancyTitle}
                    onChange={(e) => setNewGroupVacancyTitle(e.target.value)}
                    placeholder="e.g. Senior PGT Physics Teacher"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vacancy Location / Campus
                  </label>
                  <input
                    type="text"
                    value={newGroupLocation}
                    onChange={(e) => setNewGroupLocation(e.target.value)}
                    placeholder="e.g. New Delhi / Dwarka"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recruiter Screening Notes
                </label>
                <textarea
                  rows={3}
                  value={newGroupNotes}
                  onChange={(e) => setNewGroupNotes(e.target.value)}
                  placeholder="Add evaluation criteria, interview round details, or school client preferences..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Shortlisted Candidates:</span>
                <span className="font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  {selectedCandidateIds.length} Educators
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGroup}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingGroup ? 'Saving...' : 'Save Shortlist Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add to Existing Group */}
      {isAddToExistingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add to Existing Shortlist Group</h3>
              <button onClick={() => setIsAddToExistingOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Select an active candidate group to add the {selectedCandidateIds.length} selected candidate(s):
              </p>

              <select
                value={selectedExistingGroupId}
                onChange={(e) => setSelectedExistingGroupId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 outline-none font-medium"
              >
                <option value="">-- Choose Candidate Group --</option>
                {activeGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.candidatesCount || (g.candidateIds || []).length} candidates)
                  </option>
                ))}
              </select>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddToExistingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddToExistingGroup}
                  disabled={!selectedExistingGroupId}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50"
                >
                  Add Candidates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

