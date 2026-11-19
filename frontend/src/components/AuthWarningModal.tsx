import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  X, 
  LogIn, 
  ArrowRight, 
  Mail, 
  Phone, 
  ShieldAlert, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  email?: string;
  phone?: string;
  onSwitchToSignIn?: () => void;
  onSwitchPortal?: (portal: 'TEACHER' | 'EMPLOYER' | 'ADMIN' | 'HR') => void;
  suggestedPortal?: 'TEACHER' | 'EMPLOYER' | 'ADMIN' | 'HR';
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export const AuthWarningModal: React.FC<AuthWarningModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  email,
  phone,
  onSwitchToSignIn,
  onSwitchPortal,
  suggestedPortal,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const lowerMsg = message.toLowerCase();
  const isDuplicateEmail = lowerMsg.includes('already exists') && lowerMsg.includes('email');
  const isDuplicatePhone = lowerMsg.includes('already exists') && (lowerMsg.includes('mobile') || lowerMsg.includes('phone'));
  const isDuplicate = isDuplicateEmail || isDuplicatePhone || lowerMsg.includes('already exists');

  // Compute smart title if not explicitly provided
  const modalTitle = title || (
    isDuplicateEmail ? 'Email Already Registered' :
    isDuplicatePhone ? 'Mobile Number Already In Use' :
    lowerMsg.includes('invalid credentials') ? 'Authentication Notice' :
    'Registration Notice'
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Decorative Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        {/* Ambient background glow inside modal */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 text-center relative z-10">
          {/* Animated/Glowing Warning Badge */}
          <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/25 flex items-center justify-center ring-8 ring-amber-100/80">
            <AlertTriangle className="w-8 h-8 drop-shadow-md animate-pulse" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {modalTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>SikshaHub Security & Identity Policy</span>
          </p>

          {/* Warning Content Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/30 border border-amber-200/90 text-left shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs text-amber-950 font-medium leading-relaxed flex-1">
                {message}
              </div>
            </div>

            {/* Email identifier badge */}
            {email && (
              <div className="mt-3 pt-3 border-t border-amber-200/70 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-600" />
                  <span>Target Email:</span>
                </span>
                <span className="font-bold text-amber-950 bg-white/90 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs font-mono text-[11px] truncate max-w-[200px]">
                  {email}
                </span>
              </div>
            )}

            {/* Mobile identifier badge */}
            {phone && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>Target Mobile:</span>
                </span>
                <span className="font-bold text-amber-950 bg-white/90 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs font-mono text-[11px]">
                  +91 {phone}
                </span>
              </div>
            )}

            {/* Helpful guidance note */}
            {isDuplicate && (
              <div className="mt-3 text-[11px] text-amber-800 leading-normal bg-amber-100/70 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Already have an account?</strong> You don't need to register again. You can sign in right away, or use a different email/phone if registering for another entity.
                </span>
              </div>
            )}
          </div>

          {/* Portal Switch CTA if relevant */}
          {suggestedPortal && onSwitchPortal && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onSwitchPortal(suggestedPortal)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>Switch to {suggestedPortal === 'EMPLOYER' ? 'Job Poster' : suggestedPortal === 'TEACHER' ? 'Job Seeker' : suggestedPortal} Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {onSwitchToSignIn && (
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{primaryActionLabel || 'Sign In to Existing Account'}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl font-semibold text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{secondaryActionLabel || (isDuplicate ? 'Use Different Credentials / Edit' : 'Dismiss & Try Again')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
