import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Award, 
  Sparkles, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Save, 
  ExternalLink,
  ChevronRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { JobApplication, Interview } from '@sikchakhub/shared-types';

export const TeacherDashboard: React.FC = () => {
  const { user, profile, token, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'INTERVIEWS' | 'PROFILE'>('APPLICATIONS');
  const [selectedAppBreakdown, setSelectedAppBreakdown] = useState<JobApplication | null>(null);

  // Profile form state
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 5);
  const [highestQualification, setHighestQualification] = useState(profile?.highestQualification || 'M.Sc Physics');
  const [currentCity, setCurrentCity] = useState(profile?.currentCity || 'Kota');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState(profile?.expectedSalaryLPA || 20);
  const [noticePeriodDays, setNoticePeriodDays] = useState(profile?.noticePeriodDays || 30);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Fetch submitted applications
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

  const applications: JobApplication[] = appsData?.applications || [];
  const interviews: Interview[] = interviewsData?.interviews || [];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({
      headline,
      bio,
      experienceYears: Number(experienceYears),
      highestQualification,
      currentCity,
      expectedSalaryLPA: Number(expectedSalaryLPA),
      noticePeriodDays: Number(noticePeriodDays),
    });
    setIsSavingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
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
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl">
                {user?.fullName?.charAt(0) || 'T'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 font-serif">{user?.fullName}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Educator
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{profile?.headline || 'Educator Profile'}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                <span>{profile?.currentCity}</span>
                <span>•</span>
                <span>{profile?.experienceYears} Yrs Experience</span>
                <span>•</span>
                <span>Expected: ₹{profile?.expectedSalaryLPA} LPA</span>
              </p>
            </div>
          </div>

          {/* Gamified Profile Streak & Completion */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 w-full md:w-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Profile Strength</span>
                <span className="font-bold text-brand-700">{profile?.profileCompletionScore || 85}%</span>
              </div>
              <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full"
                  style={{ width: `${profile?.profileCompletionScore || 85}%` }}
                />
              </div>
            </div>

            <div className="border-l border-slate-200 pl-4 text-center">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm justify-center">
                <Flame className="w-4 h-4 fill-amber-500" />
                <span>{profile?.streakDays || 7} Days</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Activity Streak</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'APPLICATIONS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('INTERVIEWS')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'INTERVIEWS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Interviews & Demos ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'PROFILE'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile & CV Details
          </button>
        </div>

        {/* Tab 1: Applications */}
        {activeTab === 'APPLICATIONS' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/90 shadow-xs">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Applications Submitted Yet</h4>
                <p className="text-xs text-slate-500">
                  Explore available teaching vacancies and apply with your structured educator profile.
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 hover:border-brand-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStageBadgeColor(app.stage)}`}>
                        {app.stage.replace('_', ' ')}
                      </span>
                      {app.matchResult && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {app.matchResult.overallScore}% Match
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-serif line-clamp-1">
                      {app.job?.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {app.job?.institution?.name} • <span className="text-slate-400">{app.job?.city}, {app.job?.state}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    {app.recruiterNotes && (
                      <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-100 max-w-lg">
                        <strong>Recruiter Note:</strong> {app.recruiterNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setSelectedAppBreakdown(app)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Match Evaluation</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Interviews */}
        {activeTab === 'INTERVIEWS' && (
          <div className="space-y-4">
            {interviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/90 shadow-xs">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Scheduled Interviews Yet</h4>
                <p className="text-xs text-slate-500">
                  When a recruiter shortlists your application for a demo class or video call, your calendar invites will appear here.
                </p>
              </div>
            ) : (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-white rounded-2xl p-5 shadow-xs border border-purple-200 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        {interview.interviewType.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Duration: {interview.durationMinutes} Mins
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      {interview.job?.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Organization: <strong>{interview.institution?.name}</strong>
                    </p>
                    <p className="text-xs text-slate-700 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{new Date(interview.scheduledTime).toLocaleString()}</span>
                    </p>
                    {interview.feedback && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-w-lg italic">
                        {interview.feedback}
                      </p>
                    )}
                  </div>

                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition self-end md:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Join Demo Meeting</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'PROFILE' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Educator Profile & Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  These details feed into the automated candidate screening engine for instant scoring.
                </p>
              </div>
              {profileSaveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Changes Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Highest Qualification</label>
                <input
                  type="text"
                  value={highestQualification}
                  onChange={(e) => setHighestQualification(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Teaching Experience (Years)</label>
                <input
                  type="number"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Current Base City</label>
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Expected Annual CTC (₹ LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={expectedSalaryLPA}
                  onChange={(e) => setExpectedSalaryLPA(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notice Period (Days)</label>
                <input
                  type="number"
                  value={noticePeriodDays}
                  onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Professional Bio & Teaching Philosophy</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Match Breakdown Modal */}
      {selectedAppBreakdown && selectedAppBreakdown.matchResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-serif">Screening Match Breakdown</h4>
                <p className="text-xs text-slate-500">{selectedAppBreakdown.job?.title}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {selectedAppBreakdown.matchResult.overallScore}% MATCH
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {selectedAppBreakdown.matchResult.aiAnalysisSummary}
            </p>

            <div className="space-y-1.5">
              {selectedAppBreakdown.matchResult.breakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.criterion}</span>
                    <span className="font-bold text-emerald-700">+{item.scoreContribution} pts</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Required: {String(item.required)} • Candidate: {String(item.actual)}
                  </div>
                  <p className="text-[11px] text-slate-600 italic">{item.notes}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAppBreakdown(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900"
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
