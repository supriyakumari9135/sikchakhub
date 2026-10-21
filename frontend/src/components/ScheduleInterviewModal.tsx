import React, { useState } from 'react';
import { JobApplication } from '@sikchakhub/shared-types';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, Video, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ScheduleInterviewModalProps {
  application: JobApplication;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [interviewType, setInterviewType] = useState<'DEMO_CLASS' | 'ONLINE_MEETING' | 'HR_ROUND' | 'CAMPUS_IN_PERSON'>('DEMO_CLASS');
  const [scheduledTime, setScheduledTime] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/sik-demo-session');
  const [locationDetails, setLocationDetails] = useState('Online Video Class & Interactive Demo');
  const [feedbackNotes, setFeedbackNotes] = useState('Topic: Core Pedagogical Concept Demo (30 mins teaching + 15 mins Q&A with Academic Panel)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: application.id,
          interviewType,
          scheduledTime: new Date(scheduledTime).toISOString(),
          durationMinutes: Number(durationMinutes),
          meetingLink,
          locationDetails,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Recruitment Stage Transition
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 font-serif">Schedule Interview Round</h3>
            <p className="text-xs text-slate-500">Candidate: {application.teacher?.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Interview Scheduled!</h4>
            <p className="text-xs text-slate-500">
              Application status moved to "Interview Scheduled" and calendar invite recorded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Interview Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Interview Format / Round</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { value: 'DEMO_CLASS', label: 'Demo Class Round' },
                  { value: 'ONLINE_MEETING', label: 'Online Video Meet' },
                  { value: 'HR_ROUND', label: 'HR & Salary Round' },
                  { value: 'CAMPUS_IN_PERSON', label: 'Campus In-Person' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInterviewType(opt.value as any)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      interviewType === opt.value
                        ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration</span>
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>
            </div>

            {/* Meeting link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-slate-400" />
                <span>Virtual Meeting Link (Google Meet / Zoom)</span>
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                placeholder="https://meet.google.com/..."
              />
            </div>

            {/* Topic & Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Assigned Demo Topic & Instructions for Educator
              </label>
              <textarea
                rows={2}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule & Notify'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
