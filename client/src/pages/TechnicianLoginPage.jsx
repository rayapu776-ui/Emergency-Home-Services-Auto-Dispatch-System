import React, { useState } from "react";
import {
  Wrench,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import technicianStore from "../services/technicianStore";

export default function TechnicianLoginPage({ onLoginSuccess, onBackToHome }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // OTP Step State
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = React.useRef([]);
  const [tempSessionToken, setTempSessionToken] = useState("");
  const [otpChannel, setOtpChannel] = useState("email");
  const [otpDestination, setOtpDestination] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Resend OTP timer effect
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus first digit box when entering OTP step
  React.useEffect(() => {
    if (otpStep) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [otpStep]);

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }
    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      const digitsToFill = cleaned.slice(0, 6);
      for (let i = 0; i < digitsToFill.length && index + i < 6; i++) {
        newDigits[index + i] = digitsToFill[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + digitsToFill.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }
    const lastDigit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastDigit;
    setOtpDigits(newDigits);
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    const targetFocus = Math.min(pasted.length, 5);
    otpInputRefs.current[targetFocus]?.focus();
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !tempSessionToken || loading) return;
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await technicianStore.resendOtp(
        tempSessionToken,
        identifier.trim(),
      );
      setResendCooldown(res.cooldownSeconds || 60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage(
        res.message || "A fresh verification code has been sent.",
      );
      setTimeout(() => setSuccessMessage(""), 4000);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error ||
          "Failed to resend verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request a backend-generated code. Password remains optional for legacy accounts.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMessage("Please enter your registered mobile number or email");
      return;
    }
    setLoading(true);
    try {
      const res = await technicianStore.sendOtp(trimmedIdentifier, password);

      // If backend responded with OTP_REQUIRED
      if (res.status === "OTP_REQUIRED" || res.tempSessionToken) {
        setTempSessionToken(res.tempSessionToken);
        setOtpChannel(res.channel || "email");
        setOtpDestination(
          res.maskedDestination || res.destination || trimmedIdentifier,
        );
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCooldown(res.cooldownSeconds || 30);
        setOtpStep(true);
      } else if (res.token && res.user) {
        if (res.user.role !== "technician" && res.user.role !== "admin") {
          setErrorMessage(
            "This account is registered as a customer. Please log in with a partner/technician account or register as a professional.",
          );
          technicianStore.logout();
          setLoading(false);
          return;
        }
        technicianStore.saveSession(res.token, res.user);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.error("Technician login failed:", err);
      const errMsg =
        err.response?.data?.error ||
        "Invalid credentials. Please verify your email/phone and password.";
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP code
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const code = otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await technicianStore.verifyOtp(
        tempSessionToken,
        code,
        identifier.trim(),
      );
      if (res.user) {
        if (res.user.role !== "technician" && res.user.role !== "admin") {
          setErrorMessage(
            "This account is registered as a customer. Please log in with a partner/technician account.",
          );
          technicianStore.logout();
          setLoading(false);
          return;
        }
        setSuccessMessage("Verification successful! Accessing dashboard...");
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 400);
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setErrorMessage(
        err.response?.data?.error || "Invalid or expired verification code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1613] text-white flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar */}
      <header className="px-6 py-5 border-b border-emerald-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/argent-logo.png"
            alt="Argent Your"
            className="h-9 w-9 rounded-xl object-contain shadow-lg shadow-emerald-900/30"
          />
          <div>
            <span className="text-base font-black tracking-tight text-white block">
              Argent Your
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
              Partner & Technician Portal
            </span>
          </div>
        </div>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <span>Customer Website</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Centered Argent Your Branding & Heading */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
              <img
                src="/argent-logo.png"
                alt="Argent Your"
                className="h-12 w-12 rounded-2xl object-contain shadow-lg shadow-emerald-950/40"
              />
              <span className="text-sm font-black tracking-widest text-emerald-400 uppercase">
                Argent Your
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300/90 block">
              SERVICE PARTNER & TECHNICIAN
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {otpStep ? "Partner Verification Code" : "Professional Login"}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {otpStep
                ? `Security code sent to: ${otpDestination}`
                : "Sign in with your registered number or email to access the professional operations dashboard."}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{successMessage}</p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs animate-shake">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Forgot Password Notification Dialog */}
          {showForgotPassword && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300">
                  Password Reset Support
                </span>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                For partner security, password resets are processed via dispatch
                operations or your registered emergency contact number. Contact
                field dispatch at{" "}
                <strong className="text-white">+91 98101 11223</strong> or
                request a one-time OTP login below.
              </p>
            </div>
          )}

          {/* Step 1 Form */}
          {!otpStep ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your number or email"
                    className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password{" "}
                    <span className="normal-case text-slate-500">
                      (optional)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password (optional)"
                    className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <a
                    href="/professionals/register"
                    className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create Professional Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </form>
          ) : (
            /* Step 2 Form (OTP) */
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtpDigits(["", "", "", "", "", ""]);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Change Email/Phone
                  </button>
                </div>

                <div className="flex items-center justify-center w-full my-3">
                  <div
                    className="flex items-center justify-center gap-1.5 sm:gap-2.5"
                    onPaste={handleOtpPaste}
                  >
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleDigitKeyDown(index, e)}
                        onFocus={(e) => e.target.select()}
                        className="w-9 h-11 sm:w-11 sm:h-12 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border border-slate-700 bg-slate-800/90 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all caret-emerald-400 p-0 shrink-0 shadow-inner"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-bold transition-colors cursor-pointer ${
                    resendCooldown > 0
                      ? "text-slate-500 cursor-not-allowed"
                      : "text-emerald-400 hover:text-emerald-300 underline"
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtpDigits(["", "", "", "", "", ""]);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-700 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length < 6}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify & Access Dashboard"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Argent Your Partner Network • Dispatch & Operations Center
      </footer>
    </div>
  );
}
