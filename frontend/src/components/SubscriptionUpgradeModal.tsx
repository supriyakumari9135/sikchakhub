import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  FileText, 
  Calendar, 
  Building2,
  Lock,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPlan?: string;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlan = 'FREE',
}) => {
  const { token } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'ANNUAL_ENTERPRISE'>('PRO_MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch(apiUrl('/api/v1/subscriptions/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment processing failed. Please try again.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while processing your subscription upgrade.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white px-6 py-6 sm:px-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white w-fit text-xs font-bold mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SikchaKhub Recruiter Membership</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Unlock Full Access to All Teacher Applications
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
            Upgrade your institution to Pro to view every candidate profile, unmask direct phone numbers, and download verified CV documents.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Subscription Upgraded Successfully!
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Your account is now upgraded to <strong className="text-sky-700">{selectedPlan === 'PRO_MONTHLY' ? 'Pro Recruiter' : 'Annual Enterprise'}</strong>. All locked applicant profiles are automatically unlocked!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant access activated across all job openings</span>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Plan Cards Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pro Monthly Plan */}
              <div 
                onClick={() => setSelectedPlan('PRO_MONTHLY')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                  selectedPlan === 'PRO_MONTHLY'
                    ? 'border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700">
                    Monthly Flex
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'PRO_MONTHLY' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'PRO_MONTHLY' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-black text-slate-900">Pro Recruiter</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹1,999</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% full access</strong> to all candidates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Unlock phone, email & full educator CVs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Unlimited interview & demo scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Verified Institution badge</span>
                  </li>
                </ul>
              </div>

              {/* Annual Enterprise Plan */}
              <div 
                onClick={() => setSelectedPlan('ANNUAL_ENTERPRISE')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
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

                <div className="mt-3">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>Annual Enterprise</span>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">₹14,999</span>
                    <span className="text-xs text-slate-500 font-medium">/ year</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
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
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Save ₹8,989 compared to monthly plan</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Instant Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    paymentMethod === 'UPI'
                      ? 'bg-white border-sky-600 text-sky-700 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    paymentMethod === 'CARD'
                      ? 'bg-white border-sky-600 text-sky-700 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NET_BANKING')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    paymentMethod === 'NET_BANKING'
                      ? 'bg-white border-sky-600 text-sky-700 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {/* Total and Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 block">Total Investment</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedPlan === 'PRO_MONTHLY' ? '₹1,999' : '₹14,999'}
                </span>
                <span className="text-[11px] text-slate-400 block">All taxes included • Instant activation</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span>Processing Upgrade...</span>
                  ) : (
                    <>
                      <span>Upgrade & Unlock All</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted
              </span>
              <span>•</span>
              <span>Auto-unlocks all past & new applicants</span>
              <span>•</span>
              <span>Instant GST Invoice</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
