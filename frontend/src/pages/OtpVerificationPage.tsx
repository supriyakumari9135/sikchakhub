import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Clock,
  Lock,
  Send,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";
import {
  firebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "../config/firebase";
import { OtpStatusResponse } from "../types";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

// Global singleton to prevent duplicate reCAPTCHA instances across React 18 mounts
let globalRecaptchaVerifier: RecaptchaVerifier | null = null;
let globalRecaptchaPromise: Promise<RecaptchaVerifier | null> | null = null;

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout, refreshUserStatus } = useAuth();

  // Verification status from server
  const [status, setStatus] = useState<OtpStatusResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Email OTP state (Step 1)
  const [emailOtp, setEmailOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailCooldown, setEmailCooldown] = useState<number>(0);

  // Mobile OTP state (Step 2 - Sequential)
  const [phoneOtp, setPhoneOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [phoneCooldown, setPhoneCooldown] = useState<number>(0);
  const [smsSent, setSmsSent] = useState<boolean>(false);
  const [sendingSms, setSendingSms] = useState<boolean>(false);
  const [isRecaptchaSolved, setIsRecaptchaSolved] = useState<boolean>(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const isRenderingRecaptchaRef = useRef<boolean>(false);
  const recaptchaWidgetIdRef = useRef<number | null>(null);

  // Overall completion & redirect countdown
  const [allVerified, setAllVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const isEmailDone = status?.emailVerified || false;
  const isPhoneDone = status?.phoneVerified || false;
  const verifiedCount = (isEmailDone ? 1 : 0) + (isPhoneDone ? 1 : 0);
  const progressPercent = verifiedCount === 2 ? 100 : verifiedCount === 1 ? 50 : 0;

  // Redirect if not logged in
  useEffect(() => {
    if (!token && !localStorage.getItem("sikchakhub_token")) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Load verification status from backend on mount
  const fetchStatus = async () => {
    const currentToken = token || localStorage.getItem("sikchakhub_token");
    if (!currentToken) return;

    try {
      const res = await fetch(apiUrl("/api/v1/auth/otp/status"), {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
        setEmailCooldown(data.status.emailCooldownRemaining || 0);
        // Only set phone cooldown if SMS was genuinely dispatched
        if (smsSent) {
          setPhoneCooldown(data.status.phoneCooldownRemaining || 0);
        } else {
          setPhoneCooldown(0);
        }

        if (
          data.status.isVerified ||
          (data.status.emailVerified && data.status.phoneVerified)
        ) {
          setAllVerified(true);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch OTP status:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  // Handle active cooldown countdown timers
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const interval = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const interval = setInterval(() => {
      setPhoneCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneCooldown]);

  // Handle auto-redirection once both are verified
  useEffect(() => {
    if (allVerified && redirectCountdown === null) {
      setRedirectCountdown(3);
    }
  }, [allVerified, redirectCountdown]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      handleGoToDashboard();
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const handleGoToDashboard = () => {
    if (user?.role === "EMPLOYER") {
      navigate("/employer-dashboard");
    } else if (user?.role === "ADMIN" || user?.role === "HR") {
      navigate("/admin-dashboard");
    } else {
      navigate("/teacher-dashboard");
    }
  };

  // --------------------------------------------------------------------------
  // OTP Input Utilities (Auto-Advance, Paste, Backspace)
  // --------------------------------------------------------------------------
  const handleOtpChange = (
    value: string,
    index: number,
    channel: "EMAIL" | "PHONE",
  ) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const otpArray = channel === "EMAIL" ? [...emailOtp] : [...phoneOtp];
    const setOtp = channel === "EMAIL" ? setEmailOtp : setPhoneOtp;
    const refs = channel === "EMAIL" ? emailInputRefs : phoneInputRefs;

    otpArray[index] = digit;
    setOtp(otpArray);

    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    channel: "EMAIL" | "PHONE",
  ) => {
    const otpArray = channel === "EMAIL" ? emailOtp : phoneOtp;
    const refs = channel === "EMAIL" ? emailInputRefs : phoneInputRefs;

    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent<any>,
    channel: "EMAIL" | "PHONE",
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split("");
    const filled = Array(6).fill("");
    digits.forEach((d, i) => {
      filled[i] = d;
    });

    if (channel === "EMAIL") {
      setEmailOtp(filled);
      const nextIndex = Math.min(digits.length, 5);
      emailInputRefs.current[nextIndex]?.focus();
    } else {
      setPhoneOtp(filled);
      const nextIndex = Math.min(digits.length, 5);
      phoneInputRefs.current[nextIndex]?.focus();
    }
  };

  // --------------------------------------------------------------------------
  // STEP 1: EMAIL OTP HANDLERS
  // --------------------------------------------------------------------------
  const handleResendEmailOtp = async () => {
    if (emailCooldown > 0 || emailLoading || status?.isEmailBlocked) return;
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    const currentToken = token || localStorage.getItem("sikchakhub_token");
    try {
      const res = await fetch(apiUrl("/api/v1/auth/otp/resend-email"), {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSuccess("A fresh 6-digit verification code has been dispatched to your Gmail.");
        setEmailCooldown(data.cooldownSeconds || 60);
        setEmailOtp(["", "", "", "", "", ""]);
        emailInputRefs.current[0]?.focus();
      } else {
        setEmailError(data.message || "Failed to resend email verification code.");
      }
      fetchStatus();
    } catch (err: any) {
      setEmailError(err.message || "Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const fullOtp = emailOtp.join("");
    if (fullOtp.length !== 6) {
      setEmailError("Please enter all 6 digits of the email verification code.");
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    const currentToken = token || localStorage.getItem("sikchakhub_token");
    try {
      const res = await fetch(apiUrl("/api/v1/auth/otp/verify-email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ otp: fullOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSuccess("Email verified successfully! Proceeding to Step 2: Mobile Number Verification.");
        await refreshUserStatus();
        await fetchStatus();

        if (data.isFullyVerified || status?.phoneVerified) {
          setAllVerified(true);
        } else {
          setPhoneSuccess("Email verified! Click 'Send SMS Code' below to receive your 6-digit verification code.");
        }
      } else {
        setEmailError(
          data.message || "Verification failed. Please check the code.",
        );
      }
    } catch (err: any) {
      setEmailError(err.message || "Network error during verification.");
    } finally {
      setEmailLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: MOBILE OTP HANDLERS (Firebase Phone Authentication)
  // --------------------------------------------------------------------------
  const initRecaptchaVerifier = async (): Promise<RecaptchaVerifier | null> => {
    // If a render is already in progress, await the existing promise
    if (globalRecaptchaPromise) {
      return globalRecaptchaPromise;
    }

    const container = document.getElementById("recaptcha-container");
    if (!container) return null;

    // Check if a live, functional widget is already rendered inside the DOM container
    const hasIframe = container.querySelector("iframe");
    if (hasIframe && (globalRecaptchaVerifier || recaptchaVerifierRef.current)) {
      const activeVerifier = globalRecaptchaVerifier || recaptchaVerifierRef.current;
      recaptchaVerifierRef.current = activeVerifier;
      window.recaptchaVerifier = activeVerifier || undefined;
      return activeVerifier;
    }

    // Clean container completely before fresh render
    container.innerHTML = "";
    if (globalRecaptchaVerifier) {
      try {
        globalRecaptchaVerifier.clear();
      } catch (e) {}
      globalRecaptchaVerifier = null;
    }
    recaptchaVerifierRef.current = null;
    window.recaptchaVerifier = undefined;

    globalRecaptchaPromise = (async () => {
      try {
        const freshContainer = document.getElementById("recaptcha-container");
        if (!freshContainer) return null;
        freshContainer.innerHTML = "";

        const verifier = new RecaptchaVerifier(
          firebaseAuth,
          freshContainer,
          {
            size: "normal",
            callback: (response: any) => {
              console.log("reCAPTCHA verified response token generated");
              setIsRecaptchaSolved(true);
              setPhoneError(null);
            },
            "expired-callback": () => {
              setIsRecaptchaSolved(false);
              setPhoneError("Security check expired. Please check the 'I'm not a robot' box again.");
            },
          }
        );

        const widgetId = await verifier.render();
        recaptchaWidgetIdRef.current = widgetId;
        recaptchaVerifierRef.current = verifier;
        globalRecaptchaVerifier = verifier;
        window.recaptchaVerifier = verifier;

        // Defensive guard: Ensure exactly one widget element exists in container by trimming any older orphaned elements
        if (freshContainer && freshContainer.children.length > 1) {
          while (freshContainer.children.length > 1) {
            freshContainer.removeChild(freshContainer.firstChild!);
          }
        }

        return verifier;
      } catch (recaptchaErr: any) {
        console.warn("reCAPTCHA verifier error:", recaptchaErr?.message || recaptchaErr);
        return null;
      } finally {
        globalRecaptchaPromise = null;
      }
    })();

    return globalRecaptchaPromise;
  };

  // Clean up verifier only when navigating away from verify-otp page
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/verify-otp")) {
        if (globalRecaptchaVerifier) {
          try {
            globalRecaptchaVerifier.clear();
          } catch (e) {}
          globalRecaptchaVerifier = null;
        }
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // MutationObserver to guarantee strictly ONE single reCAPTCHA widget child inside recaptcha-container
  useEffect(() => {
    const container = document.getElementById("recaptcha-container");
    if (!container) return;

    const enforceSingleChild = () => {
      if (container.children.length > 1) {
        while (container.children.length > 1) {
          container.removeChild(container.firstChild!);
        }
      }
    };

    enforceSingleChild();
    const observer = new MutationObserver(enforceSingleChild);
    observer.observe(container, { childList: true });
    return () => observer.disconnect();
  }, [isEmailDone, isPhoneDone, smsSent]);

  // Auto-appear reCAPTCHA exactly once whenever Mobile OTP verification is active
  useEffect(() => {
    if (isEmailDone && !isPhoneDone && !smsSent && !allVerified) {
      const timer = setTimeout(() => {
        initRecaptchaVerifier();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEmailDone, isPhoneDone, smsSent, allVerified]);

  const handleSendMobileOtp = async () => {
    if (phoneCooldown > 0 || sendingSms || status?.isPhoneBlocked) return;

    // Sequential Check: Email must be verified first!
    if (!status?.emailVerified) {
      setPhoneError("Please complete Step 1 (Email Verification) first before verifying your mobile number.");
      return;
    }

    // reCAPTCHA verification check: Must be completed before sending OTP!
    if (!isRecaptchaSolved) {
      setPhoneError("Please check the 'I\'m not a robot' box above before clicking Send Mobile OTP.");
      return;
    }

    setSendingSms(true);
    setPhoneError(null);
    setPhoneSuccess(null);

    const currentToken = token || localStorage.getItem("sikchakhub_token");
    try {
      // 1. Authorize ticket with backend rate limiter first
      const ticketRes = await fetch(apiUrl("/api/v1/auth/otp/send-phone"), {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const ticketData = await ticketRes.json();
      if (!ticketRes.ok || !ticketData.success) {
        setPhoneError(
          ticketData.message || "Failed to authorize mobile verification.",
        );
        setSendingSms(false);
        return;
      }

      // 2. Trigger Firebase Phone Auth SMS
      const rawPhone = user?.phone || "";
      const digitsOnly = rawPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        setPhoneError(
          "No valid 10-digit mobile number found on your account. Please update your mobile number.",
        );
        setSendingSms(false);
        return;
      }

      const formattedPhone = `+91${digitsOnly.slice(-10)}`;
      let verifier = recaptchaVerifierRef.current || globalRecaptchaVerifier;
      const containerEl = document.getElementById("recaptcha-container");
      if (!verifier || !containerEl || !containerEl.querySelector("iframe")) {
        verifier = await initRecaptchaVerifier();
      }

      if (!verifier) {
        throw new Error("Security verification check not ready. Please complete the reCAPTCHA box above.");
      }

      // Check if reCAPTCHA has genuinely produced a token
      let grecaptchaToken = "";
      if (typeof (window as any).grecaptcha !== "undefined" && recaptchaWidgetIdRef.current !== null) {
        try {
          grecaptchaToken = (window as any).grecaptcha.getResponse(recaptchaWidgetIdRef.current);
        } catch (e) {}
      }

      if (!grecaptchaToken) {
        setIsRecaptchaSolved(false);
        setPhoneError("Security check expired or empty. Please check the 'I\'m not a robot' box above before clicking Send Mobile OTP.");
        setSendingSms(false);
        return;
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          firebaseAuth,
          formattedPhone,
          verifier,
        );
        window.confirmationResult = confirmationResult;

        // ONLY on genuine successful dispatch:
        setSmsSent(true);
        setPhoneSuccess(`SMS OTP sent to ${formattedPhone}. Please check your messages and enter the 6-digit code below.`);
        // Start the 1-minute (60 seconds) timer ONLY when OTP is successfully sent!
        setPhoneCooldown(60);

        // Record successful dispatch on backend
        try {
          await fetch(apiUrl("/api/v1/auth/otp/confirm-phone-sent"), {
            method: "POST",
            headers: { Authorization: `Bearer ${currentToken}` },
          });
        } catch (e) {}

        setTimeout(() => {
          phoneInputRefs.current[0]?.focus();
        }, 150);
        fetchStatus();
      } catch (fbErr: any) {
        // ON FAILURE: Do NOT set smsSent, do NOT start timer, do NOT show resend button
        setSmsSent(false);
        setPhoneCooldown(0);
        setIsRecaptchaSolved(false);

        // Always reset the reCAPTCHA widget so user can re-check it immediately
        if (recaptchaWidgetIdRef.current !== null && (window as any).grecaptcha?.reset) {
          try {
            (window as any).grecaptcha.reset(recaptchaWidgetIdRef.current);
          } catch (e) {}
        }

        console.error("Firebase SMS trigger error:", fbErr);
        let errorMsg = fbErr.message || "Failed to send mobile verification SMS.";

        if (fbErr.code === "auth/invalid-app-credential") {
          errorMsg = "Firebase security verification rejected (auth/invalid-app-credential). Please ensure: 1) In Firebase Console > Authentication > Settings > Authorized domains, 'localhost' and '127.0.0.1' are added. 2) 'Phone' provider is Enabled under Sign-in method. 3) India (+91) is allowed in SMS Region Policy. (Check 'I\'m not a robot' to try again)";
        } else if (fbErr.code === "auth/captcha-check-failed") {
          errorMsg = "reCAPTCHA check expired or failed. Please check the 'I\'m not a robot' box above again.";
        } else if (fbErr.code === "auth/too-many-requests") {
          errorMsg = "Too many verification requests. Please wait a few minutes before trying again.";
        } else if (fbErr.code === "auth/quota-exceeded") {
          errorMsg = "SMS sending quota has been exceeded. Please contact support or check Firebase SMS quota.";
        } else if (fbErr.code === "auth/invalid-phone-number") {
          errorMsg = "Please enter a valid mobile number.";
        } else if (fbErr.code === "auth/network-request-failed") {
          errorMsg = "Network error. Please check your internet connection.";
        } else if (fbErr.code === "auth/operation-not-allowed") {
          errorMsg = "Phone sign-in is not enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable the Phone provider.";
        } else if (fbErr.code === "auth/billing-not-enabled") {
          errorMsg = "Firebase Phone Authentication requires active Blaze plan.";
        }
        setPhoneError(errorMsg);
      }
    } catch (err: any) {
      setSmsSent(false);
      setPhoneCooldown(0);
      setPhoneError(err.message || "Failed to send mobile verification SMS.");
    } finally {
      setSendingSms(false);
    }
  };

  const handleVerifyMobile = async () => {
    // Sequential Check: Email must be verified first!
    if (!status?.emailVerified) {
      setPhoneError("Please complete Step 1 (Email Verification) first.");
      return;
    }

    const fullOtp = phoneOtp.join("");
    if (fullOtp.length !== 6) {
      setPhoneError(
        "Please enter all 6 digits of the mobile verification code.",
      );
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneSuccess(null);

    const currentToken = token || localStorage.getItem("sikchakhub_token");

    try {
      // 1. Ensure SMS was triggered and confirmationResult exists
      if (!window.confirmationResult) {
        setPhoneError("Please click 'Send SMS Code' first to receive your mobile verification code.");
        setPhoneLoading(false);
        return;
      }

      let idToken: string;
      try {
        const userCredential = await window.confirmationResult.confirm(fullOtp);
        idToken = await userCredential.user.getIdToken();
      } catch (confirmErr: any) {
        console.error("Firebase confirmation error:", confirmErr);
        let errMsg = "Incorrect mobile verification code. Please check your SMS and try again.";
        if (confirmErr.code === "auth/invalid-verification-code") {
          errMsg = "Incorrect mobile verification code. Please check your SMS and try again.";
        } else if (confirmErr.code === "auth/code-expired") {
          errMsg = "Your SMS OTP has expired. Please click 'Resend SMS Code'.";
        } else if (confirmErr.code === "auth/too-many-requests") {
          errMsg = "Too many verification requests. Please wait before trying again.";
        } else if (confirmErr.code === "auth/network-request-failed") {
          errMsg = "Network error. Please check your internet connection.";
        } else if (confirmErr.message) {
          errMsg = confirmErr.message;
        }
        setPhoneError(errMsg);
        setPhoneLoading(false);
        return;
      }

      if (!idToken) {
        setPhoneError("Failed to obtain verified authentication token from Firebase. Please try again.");
        setPhoneLoading(false);
        return;
      }

      // 2. Send Firebase ID token to backend for cryptographic verification and status update
      const verifyRes = await fetch(apiUrl("/api/v1/auth/otp/verify-phone"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          idToken,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setPhoneSuccess("Mobile number verified successfully!");
        await refreshUserStatus();
        await fetchStatus();

        if (verifyData.isFullyVerified || status?.emailVerified) {
          setAllVerified(true);
        }
      } else {
        setPhoneError(verifyData.message || "Mobile verification failed.");
      }
    } catch (err: any) {
      setPhoneError(err.message || "Error during mobile verification.");
    } finally {
      setPhoneLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f3f7fe] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading verification gateway...
          </p>
        </div>
      </div>
    );
  }

  // Masking helpers
  const displayEmail = status?.email || (user?.email ? user.email.replace(/(?<=.{2}).(?=.*@)/g, "*") : "s***6@gmail.com");
  const displayPhone = status?.phone || (user?.phone ? `+91 ${user.phone.slice(0, 2)}******${user.phone.slice(-4)}` : "+91 ******4757");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4fe] via-[#f7faff] to-[#edf4fe] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Fluid Ambient SVG Waves in exact positions from design */}
      <svg
        className="absolute top-0 left-0 w-[380px] sm:w-[520px] h-[700px] pointer-events-none opacity-40 z-0"
        viewBox="0 0 600 800"
        fill="none"
      >
        <path
          d="M0,0 C220,120 340,260 260,460 C180,660 70,720 0,800 L0,0 Z"
          fill="url(#ambientWaveLeft)"
        />
        <defs>
          <linearGradient id="ambientWaveLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="absolute top-0 right-0 w-[380px] sm:w-[520px] h-[700px] pointer-events-none opacity-40 z-0"
        viewBox="0 0 600 800"
        fill="none"
      >
        <path
          d="M600,0 C380,120 260,260 340,460 C420,660 530,720 600,800 L600,0 Z"
          fill="url(#ambientWaveRight)"
        />
        <defs>
          <linearGradient id="ambientWaveRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Top Header Sign Out link */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white/70 hover:bg-red-50/50 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Center Logo & Branding matching screenshot */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex flex-col items-center justify-center">
            {/* Logo Icon matching open book with graduation cap */}
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 text-white">
                <BookOpen className="w-7 h-7" />
                <GraduationCap className="w-6 h-6 absolute -top-2 right-0 text-amber-300 drop-shadow" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-none">
              SikchaKhub
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
              Teacher Recruitment Platform
            </p>
          </div>

          {/* Dual-Factor Security Verification Pill Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200/90 text-[11px] sm:text-xs text-blue-800 font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Dual-Factor Security Verification
            </span>
          </div>

          {/* Big Editorial Headline matching image */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight pt-2">
            Verify Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Email & Mobile Number
            </span>
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-600 max-w-xl mx-auto leading-relaxed">
            To activate your verified account and ensure the security of your recruitment activities, please verify both your email address and mobile number with OTP.
          </p>
        </div>

        {/* Verification Progress Strip matching screenshot */}
        <div className="max-w-4xl mx-auto mb-8 bg-white/60 p-3 sm:p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2 px-1">
            <span>Verification Progress</span>
            <span className={verifiedCount === 2 ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
              {verifiedCount} of 2 Complete ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                verifiedCount === 2
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sequential Guidance Banner */}
        {!isEmailDone && (
          <div className="max-w-4xl mx-auto mb-6 bg-blue-50/90 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
              <span className="font-semibold">Step 1 in progress:</span>
              <span>Verify your Gmail OTP code first. Step 2 (Mobile SMS) will automatically activate once email is verified.</span>
            </div>
          </div>
        )}

        {isEmailDone && !isPhoneDone && (
          <div className="max-w-4xl mx-auto mb-6 bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-800 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">✓</span>
              <span className="font-semibold">Email Verified!</span>
              <span>Step 2 Activated: Please enter the SMS OTP sent to your registered mobile phone.</span>
            </div>
          </div>
        )}

        {/* Temporary Lockout Alert (if active) */}
        {(status?.isEmailBlocked || status?.isPhoneBlocked) && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Verification Temporarily Blocked
              </h4>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                Too many incorrect OTP attempts. Your verification has been temporarily blocked for 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Both Completed Success Banner */}
        {allVerified && (
          <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-3xl p-6 text-center shadow-lg shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900">
              Registration Fully Verified!
            </h3>
            <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto font-medium">
              Both your Gmail and Mobile Number have been confirmed. You are now officially registered on SikchaKhub.
            </p>
            {redirectCountdown !== null && redirectCountdown > 0 && (
              <p className="text-xs text-emerald-800 font-bold mt-4 flex items-center justify-center gap-2">
                <span>Redirecting to your dashboard in</span>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  {redirectCountdown}
                </span>
                <span>seconds...</span>
              </p>
            )}
            <button
              onClick={handleGoToDashboard}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Go to Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TWO CARDS SIDE BY SIDE (Exact match to uploaded image)                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
          
          {/* ======================================================================= */}
          {/* CARD 1: EMAIL VERIFICATION (Step 1)                                     */}
          {/* ======================================================================= */}
          <div className={`bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-500/5 border transition-all duration-300 flex flex-col justify-between ${
            isEmailDone ? "border-emerald-200" : "border-slate-100"
          }`}>
            <div>
              {/* Header: Icon, Title, Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Email Verification
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your registered email address
                    </p>
                  </div>
                </div>

                {isEmailDone ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending</span>
                  </span>
                )}
              </div>

              {/* Registered Email Display Box */}
              <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Registered Email
                  </span>
                  <span className="text-sm font-bold text-slate-800 tracking-tight truncate block">
                    {displayEmail}
                  </span>
                </div>
              </div>

              {/* Description Prompt */}
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Enter the 6-digit verification code sent to your email. The code is valid for 5 minutes.
              </p>

              {/* 6-Digit OTP Input Boxes */}
              <div className="grid grid-cols-6 gap-2 sm:gap-2.5 mb-4" onPaste={(e) => handleOtpPaste(e, "EMAIL")}>
                {emailOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { emailInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={isEmailDone || emailLoading || status?.isEmailBlocked}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index, "EMAIL")}
                    onKeyDown={(e) => handleOtpKeyDown(e, index, "EMAIL")}
                    className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 transition-all outline-hidden ${
                      isEmailDone
                        ? "bg-emerald-50/50 border-emerald-300 text-emerald-700 cursor-not-allowed"
                        : digit
                        ? "border-indigo-600 bg-white text-slate-900 shadow-xs"
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
                    }`}
                  />
                ))}
              </div>

              {/* Status Messages */}
              {emailError && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
              {emailSuccess && !isEmailDone && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              {/* Main Action Button */}
              {isEmailDone ? (
                <div className="w-full py-3.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Email Verified Successfully ✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={emailLoading || status?.isEmailBlocked}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {emailLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{emailLoading ? "Verifying Email..." : "Verify Email"}</span>
                </button>
              )}
            </div>

            {/* Bottom Section: Resend Row + Limits Strip */}
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={emailCooldown > 0 || isEmailDone || emailLoading || status?.isEmailBlocked}
                  className="cursor-pointer font-semibold text-slate-600 hover:text-indigo-600 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${emailLoading ? "animate-spin" : ""}`} />
                  <span>Resend Email OTP</span>
                </button>

                {emailCooldown > 0 && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold flex items-center gap-1 border border-blue-100">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>Resend in {emailCooldown} seconds</span>
                  </span>
                )}
              </div>

              {/* Limits Information Strip matching image */}
              <div className="bg-[#f8faff] border border-slate-100 rounded-xl py-2 px-3 text-[11px] text-slate-500 flex items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1">
                  <span>ℹ</span>
                  <span>OTP Attempts: {Math.max(0, 3 - (status?.emailFailedAttempts || 0))}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span>OTP Sends Left Today: {status?.emailSendsRemaining ?? 2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* CARD 2: MOBILE VERIFICATION (Step 2 - Sequential Flow)                  */}
          {/* ======================================================================= */}
          <div className={`bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-500/5 border transition-all duration-300 flex flex-col justify-between ${
            isPhoneDone
              ? "border-emerald-200"
              : !isEmailDone
              ? "border-slate-100 opacity-90"
              : "border-slate-100"
          }`}>
            <div>
              {/* Header: Icon, Title, Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${
                    !isEmailDone
                      ? "bg-slate-100 text-slate-400 border border-slate-200"
                      : "bg-sky-50 border border-sky-100 text-sky-600"
                  }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                      <span>Mobile Verification</span>
                      {!isEmailDone && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">Step 2</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your registered mobile number
                    </p>
                  </div>
                </div>

                {isPhoneDone ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                ) : !isEmailDone ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending</span>
                  </span>
                )}
              </div>

              {/* Registered Mobile Display Box */}
              <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Registered Mobile
                  </span>
                  <span className="text-sm font-bold text-slate-800 tracking-tight truncate block">
                    {displayPhone}
                  </span>
                </div>
              </div>

              {/* Sequential Notice when email is pending */}
              {!isEmailDone ? (
                <div>
                  <div className="p-3.5 mb-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Step 2 Locked</span>
                      <span>
                        Mobile number verification unlocks automatically once <strong>Email Verification</strong> is complete.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 px-6 bg-slate-200 text-slate-500 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Complete Email Verification First</span>
                  </button>
                </div>
              ) : isPhoneDone ? (
                <div className="w-full py-3.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile Verified Successfully ✓</span>
                </div>
              ) : !smsSent ? (
                /* =================================================================== */
                /* STEP 2A: FIRST-TIME SEND OTP BUTTON (Right after Gmail Verification)*/
                /* =================================================================== */
                <div className="space-y-4 mb-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click the button below to send a 6-digit SMS verification code to your registered mobile phone via Firebase secure SMS gateway.
                  </p>

                  {/* Security Verification & Auto-Appearing reCAPTCHA Box */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Firebase Security Verification</span>
                      </div>
                      <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full font-bold border border-blue-200/60">
                        Anti-Abuse Protection
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-2.5">
                      Please check the "I'm not a robot" box below before requesting your SMS code:
                    </p>

                    {/* Single Dedicated Auto-Appearing reCAPTCHA Container */}
                    <div className="flex justify-center items-center my-1 min-h-[78px] overflow-hidden">
                      <div
                        id="recaptcha-container"
                        className="flex justify-center items-center w-[304px] min-h-[78px] max-w-full overflow-hidden [&>div:nth-child(n+2)]:!hidden"
                        style={{ width: "304px", minHeight: "78px", maxWidth: "100%", overflow: "hidden" }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Messages for Step 2A */}
                  {phoneError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                  {phoneSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{phoneSuccess}</span>
                    </div>
                  )}

                  {/* reCAPTCHA Completion Guidance Helper Banner */}
                  {!isRecaptchaSolved ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200/90 py-2.5 px-3.5 rounded-xl animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Check the "I'm not a robot" box above to enable Send Mobile OTP</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/90 py-2.5 px-3.5 rounded-xl animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Security check verified ✓ Click below to send your SMS code</span>
                    </div>
                  )}

                  {/* Primary "Send Mobile OTP" Button - Disabled until reCAPTCHA is solved */}
                  <button
                    type="button"
                    onClick={handleSendMobileOtp}
                    disabled={!isRecaptchaSolved || phoneLoading || sendingSms || status?.isPhoneBlocked}
                    className={`w-full py-4 px-6 font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      !isRecaptchaSolved
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/60"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-indigo-500/25 hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {sendingSms ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {sendingSms
                        ? "Sending Mobile OTP via Firebase..."
                        : !isRecaptchaSolved
                        ? "Complete reCAPTCHA Above First"
                        : "Send Mobile OTP"}
                    </span>
                  </button>

                  {/* Direct Entry Option */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setSmsSent(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Already received the SMS code on your mobile? Enter OTP here
                    </button>
                  </div>
                </div>
              ) : (
                /* =================================================================== */
                /* STEP 2B: ENTER OTP & VERIFY (After SMS is dispatched)               */
                /* =================================================================== */
                <div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Enter the 6-digit SMS code received on your mobile phone. The code is valid for 5 minutes.
                  </p>

                  {/* 6-Digit OTP Input Boxes */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5 mb-4" onPaste={(e) => handleOtpPaste(e, "PHONE")}>
                    {phoneOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { phoneInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        disabled={isPhoneDone || phoneLoading || status?.isPhoneBlocked}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index, "PHONE")}
                        onKeyDown={(e) => handleOtpKeyDown(e, index, "PHONE")}
                        className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 transition-all outline-hidden ${
                          isPhoneDone
                            ? "bg-emerald-50/50 border-emerald-300 text-emerald-700 cursor-not-allowed"
                            : digit
                            ? "border-indigo-600 bg-white text-slate-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status Messages */}
                  {phoneError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                  {phoneSuccess && !isPhoneDone && (
                    <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{phoneSuccess}</span>
                    </div>
                  )}

                  {/* Verify Action Button */}
                  <button
                    type="button"
                    onClick={handleVerifyMobile}
                    disabled={phoneLoading || status?.isPhoneBlocked}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {phoneLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>{phoneLoading ? "Verifying Mobile..." : "Verify Mobile Number"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Section: Resend Row + Limits Strip */}
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              {/* Resend and 1-Minute Timer Row: STRICTLY ONLY WHEN SMS WAS SENT SUCCESSFULLY */}
              {isEmailDone && !isPhoneDone && smsSent ? (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsSent(false);
                      setIsRecaptchaSolved(false);
                      setPhoneError(null);
                      setPhoneSuccess(null);
                      if (recaptchaWidgetIdRef.current !== null && (window as any).grecaptcha?.reset) {
                        try {
                          (window as any).grecaptcha.reset(recaptchaWidgetIdRef.current);
                        } catch (e) {}
                      }
                    }}
                    disabled={phoneCooldown > 0 || sendingSms || status?.isPhoneBlocked}
                    className="cursor-pointer font-semibold text-slate-600 hover:text-indigo-600 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sendingSms ? "animate-spin" : ""}`} />
                    <span>Resend SMS Code</span>
                  </button>

                  {phoneCooldown > 0 && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold flex items-center gap-1 border border-blue-100">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>Resend in {phoneCooldown} seconds</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-xs">
                  {!isEmailDone ? "Awaiting email verification" : isPhoneDone ? "Mobile verified" : "Click Send Mobile OTP above"}
                </div>
              )}

              {/* Limits Information Strip matching image */}
              <div className="bg-[#f8faff] border border-slate-100 rounded-xl py-2 px-3 text-[11px] text-slate-500 flex items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1">
                  <span>ℹ</span>
                  <span>OTP Attempts: {Math.max(0, 3 - (status?.phoneFailedAttempts || 0))}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span>OTP Sends Left Today: {status?.phoneSendsRemaining ?? 2}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECURITY CARD (Exact match to uploaded image)                      */}
        {/* ========================================================================= */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-lg shadow-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Your Data is Secure with SikchaKhub
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                We use industry-standard encryption and Firebase security to keep your account and information safe.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit Encryption</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
