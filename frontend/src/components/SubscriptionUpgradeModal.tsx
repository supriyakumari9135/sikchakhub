import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Phone,
  User,
  MessageSquare,
  Clock,
  RotateCcw,
  CheckCircle2,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPlan?: string;
  isPendingRequest?: boolean;
  institutionName?: string;
  defaultContactPerson?: string;
  defaultPhone?: string;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlan = 'FREE',
  isPendingRequest = false,
  institutionName = 'Educational Institution',
  defaultContactPerson = '',
  defaultPhone = '',
}) => {
  const { token, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'ANNUAL_ENTERPRISE'>('PRO_MONTHLY');
  const [contactPerson, setContactPerson] = useState(defaultContactPerson || user?.fullName || '');
  const [contactPhone, setContactPhone] = useState(defaultPhone || user?.phone || '');
  const [requestNotes, setRequestNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successResponseMsg, setSuccessResponseMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync defaults if provided
  useEffect(() => {
    if (defaultContactPerson) setContactPerson(defaultContactPerson);
    if (defaultPhone) setContactPhone(defaultPhone);
  }, [defaultContactPerson, defaultPhone]);

  if (!isOpen) return null;

  const handleApplyPremium = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch(apiUrl('/api/v1/subscriptions/request-upgrade'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          contactPerson: contactPerson || user?.fullName || 'Recruiter',
          contactPhone: contactPhone || user?.phone || 'N/A',
          notes: requestNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit upgrade application. Please try again.');
      }

      setSuccessResponseMsg(data.message || 'Your Premium Upgrade application has been submitted successfully!');
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while submitting your request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-6 sm:px-8 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer z-10"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 w-fit text-xs font-bold mb-2.5 border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SikchaKhub Institutional Premium Suite</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Apply for Premium Recruiter Access (Unlimited)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Submit your request. The SikshaHub administration team will connect with you directly to verify payment and activate your 100% unlocked candidate access via the Admin Desk.
          </p>
        </div>

        {/* State 1: Request Already Pending Prior to opening */}
        {isPendingRequest && !isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 ring-8 ring-amber-100/80">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                Application Under Admin Review
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Your Upgrade Request is Being Processed
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Your institution (<strong>{institutionName}</strong>) has already submitted an upgrade request for Premium access. 
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-left max-w-lg mx-auto text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Next Steps for Activation:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>Our administration desk is reviewing your institution credentials.</li>
                <li>An executive will contact you shortly via phone or WhatsApp to assist with payment.</li>
                <li>Immediately after payment verification, your <strong>👑 Premium Active (Unlimited)</strong> status will be activated live on your dashboard.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : isSuccess ? (
          /* State 2: Freshly Submitted Application Success */
          <div className="py-14 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-100/80 animate-in zoom-in-75">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">
                Upgrade Request Received!
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {successResponseMsg || 'Your application has been received by the SikshaHub Administration Team.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto text-xs text-emerald-900 text-left space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What Happens Next:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Our Admin Desk will connect with you at <strong>{contactPhone || 'your registered phone'}</strong> to complete the payment confirmation. Once confirmed, your <strong>👑 Premium Active</strong> access will be enabled immediately!
              </p>
            </div>

            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Plan Selection & Submission Form */
          <form onSubmit={handleApplyPremium} className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step Indicators: 3-step transparent workflow */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-700">1. Apply</span>
                <p className="text-[11px] font-bold text-slate-800">Select Plan</p>
              </div>
              <div className="space-y-0.5 border-x border-slate-200">
                <span className="text-[10px] font-black uppercase text-amber-700">2. Admin Connect</span>
                <p className="text-[11px] font-bold text-slate-800">Payment Check</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-emerald-700">3. Activate</span>
                <p className="text-[11px] font-bold text-slate-800">100% Unlocked</p>
              </div>
            </div>

            {/* Plan Cards Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pro Monthly Plan */}
              <div 
                onClick={() => setSelectedPlan('PRO_MONTHLY')}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all relative ${
                  selectedPlan === 'PRO_MONTHLY'
                    ? 'border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700">
                    Monthly Plan
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'PRO_MONTHLY' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'PRO_MONTHLY' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-base font-black text-slate-900">Pro Recruiter</h4>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹1,999</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% full access</strong> to all applicants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Unmasked phone, email & CV downloads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Unlimited virtual demo scheduling</span>
                  </li>
                </ul>
              </div>

              {/* Annual Enterprise Plan */}
              <div 
                onClick={() => setSelectedPlan('ANNUAL_ENTERPRISE')}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all relative ${
                  selectedPlan === 'ANNUAL_ENTERPRISE'
                    ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Save ~38% • Best Value
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'ANNUAL_ENTERPRISE' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'ANNUAL_ENTERPRISE' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>Annual Enterprise</span>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </h4>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹14,999</span>
                    <span className="text-xs text-slate-500 font-medium">/ year</span>
                  </div>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Year-round unlimited recruitment</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Multi-campus vacancy postings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Priority dedicated HR coordinator</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Recruiter Contact Credentials for Admin to Connect */}
            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>Contact Details for Admin to Connect</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  Admin will call / WhatsApp here for payment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Contact Person / Principal *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Sharma"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Direct Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Optional Note / Hiring Requirements for Admin
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Need immediate access for upcoming CBSE PGT Physics & Math interviews..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Total and Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 block font-medium">Plan Value</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedPlan === 'PRO_MONTHLY' ? '₹1,999' : '₹14,999'}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Verified payment taken directly by Admin desk
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Apply for Premium Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SikshaHub Admin Governance
              </span>
              <span>•</span>
              <span>Direct offline/UPI payment</span>
              <span>•</span>
              <span>Activated via Admin Panel</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
