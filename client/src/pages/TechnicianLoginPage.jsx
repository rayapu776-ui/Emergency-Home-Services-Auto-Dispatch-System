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
  const [otpValue, setOtpValue] = useState("");
  const [tempSessionToken, setTempSessionToken] = useState("");
  const [otpChannel, setOtpChannel] = useState("email");
  const [otpDestination, setOtpDestination] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP timer effect
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await technicianStore.loginWithPassword(
        identifier.trim(),
        password,
      );
      if (res.tempSessionToken) {
        setTempSessionToken(res.tempSessionToken);
      }
      setResendCooldown(30);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || "Failed to resend verification code",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit email/phone + password
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMessage("Please enter your registered mobile number or email");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password");
      return;
    }

    setLoading(true);
    try {
      const res = await technicianStore.loginWithPassword(
        trimmedIdentifier,
        password,
      );

      // If backend responded with OTP_REQUIRED
      if (res.status === "OTP_REQUIRED" || res.tempSessionToken) {
        setTempSessionToken(res.tempSessionToken);
        setOtpChannel(res.channel || "email");
        setOtpDestination(res.destination || trimmedIdentifier);
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

    if (!otpValue || otpValue.trim().length < 4) {
      setErrorMessage("Please enter the verification code sent to you");
      return;
    }

    setLoading(true);
    try {
      const res = await technicianStore.verifyOtp(
        tempSessionToken,
        otpValue.trim(),
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
        onLoginSuccess(res.user);
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

  // Quick Demo Login for instant testing
  const handleQuickDemo = async (category = "Plumbing") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await technicianStore.demoLogin(category);
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setErrorMessage("Demo technician login failed. Please try again.");
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

          {/* Heading */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {otpStep ? "Verification Required" : "Partner Sign In"}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {otpStep
                ? `Enter the 6-digit code sent to ${otpDestination}`
                : "Sign in to access your dispatch dashboard, active jobs, and client communications."}
            </p>
          </div>

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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. +91 98101 11223 or tech.plumber@demo.com"
                    className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password
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
                    placeholder="Enter partner password"
                    className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
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
                    <span>Verifying Partner...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Want to provide services with Argent Your?{" "}
                  <a
                    href="/professionals/register"
                    className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Register as a Professional</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </form>
          ) : (
            /* Step 2 Form (OTP) */
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtpValue("");
                      setErrorMessage("");
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Change Email/Phone
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) =>
                    setOtpValue(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="• • • • • •"
                  className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 text-center text-xl tracking-widest font-black text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
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
                      : "text-emerald-400 hover:text-emerald-300"
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
                    setErrorMessage("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-700 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Confirm & Enter"}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800 text-center space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Instant Demo Sign-In
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("Plumbing")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-400">Rajesh Kumar</p>
                <p className="text-[10px] text-slate-400">
                  Plumbing Specialist
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("Electrical")}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-amber-400">Vikram Singh</p>
                <p className="text-[10px] text-slate-400">Master Electrician</p>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Demo passwords: <code className="text-slate-300">tech123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Argent Your Partner Network • Dispatch & Operations Center
      </footer>
    </div>
  );
}
