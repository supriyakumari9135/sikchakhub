import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  institutionName?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  institutionName = 'SikchaKhub',
}) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  if (!isOpen) return null;

  const isWrongRole = Boolean(token && user && user.role !== 'TEACHER');

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-sky-100 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-90"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Lock Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 mb-4">
          {isWrongRole ? (
            <ShieldAlert className="w-8 h-8 text-amber-200" />
          ) : (
            <Lock className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Header */}
        <h3 className="text-xl font-black text-slate-900 tracking-tight font-serif">
          {isWrongRole ? 'Educator Account Required' : 'Please Sign In or Sign Up First'}
        </h3>

        {/* Context message */}
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {isWrongRole ? (
            <>
              You are currently logged in as a{' '}
              <span className="font-bold text-slate-900">{user?.role}</span>. Vacancy
              applications on SikchaKhub are reserved for verified teaching candidates.
              Please switch to an Educator account.
            </>
          ) : (
            <>
              You must be logged in to apply for{' '}
              {jobTitle ? (
                <span className="font-bold text-slate-900">"{jobTitle}"</span>
              ) : (
                'this vacancy'
              )}{' '}
              on <span className="font-bold text-sky-700">{institutionName}</span>. Please log in or create a free educator account.
            </>
          )}
        </p>

        {/* Highlights */}
        {!isWrongRole && (
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 my-5 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Direct AI Syllabus & Experience Matching</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time status updates in Teacher Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Free for Educators • Zero agency fees</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/login?role=TEACHER');
            }}
            className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isWrongRole ? 'Switch / Sign In as Educator' : 'Sign In as Educator'}</span>
          </button>

          {!isWrongRole && (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/signup?role=TEACHER');
              }}
              className="cursor-pointer w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm rounded-xl border border-sky-200 hover:border-sky-300 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-sky-600" />
              <span>Create Free Educator Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

