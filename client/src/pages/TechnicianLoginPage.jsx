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
  const [successMessage, setSuccessMessage] = useState("");

  // Forgot Password state
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [resetStep, setResetStep] = useState("request"); // 'request' | 'verify'
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetSessionToken, setResetSessionToken] = useState("");
  const [resetMaskedDestination, setResetMaskedDestination] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Cooldown countdown timer
  React.useEffect(() => {
    let timer;
    if (resetCooldown > 0) {
      timer = setTimeout(() => setResetCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetCooldown]);

  // Step 1: Send Reset Verification Code
  const handleSendResetCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmed = resetIdentifier.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your registered mobile number or email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await technicianStore.forgotPassword(trimmed);
      setResetSessionToken(res.tempSessionToken || "");
      setResetMaskedDestination(res.maskedDestination || trimmed);
      setResetCooldown(res.cooldownSeconds || 60);
      setResetStep("verify");
      setSuccessMessage(
        res.message || "A 6-digit verification code has been dispatched."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMessage(
        err.response?.data?.error ||
          "No partner account found with this email or mobile number."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Save New Password
  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedCode = resetCode.trim();
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and Confirm Password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await technicianStore.resetPassword({
        tempSessionToken: resetSessionToken,
        identifier: resetIdentifier.trim(),
        code: trimmedCode,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(
        res.message || "Password updated successfully! Please sign in with your new password."
      );
      setIdentifier(resetIdentifier.trim());
      setPassword("");
      setIsResetFlow(false);
      setResetStep("request");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMessage(
        err.response?.data?.error ||
          "Failed to reset password. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendResetCode = async () => {
    if (resetCooldown > 0 || loading) return;
    setErrorMessage("");
    setSuccessMessage("Sending fresh code...");
    try {
      const res = await technicianStore.forgotPassword(resetIdentifier.trim());
      setResetSessionToken(res.tempSessionToken || resetSessionToken);
      setResetCooldown(res.cooldownSeconds || 60);
      setResetCode("");
      setSuccessMessage("A fresh verification code has been dispatched.");
    } catch (err) {
      setSuccessMessage("");
      setErrorMessage(
        err.response?.data?.error || "Unable to resend code right now."
      );
    }
  };

  // Direct Login: Submit identifier and password to access the Dashboard
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMessage("Please enter your registered mobile number or email");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const res = await technicianStore.login(trimmedIdentifier, password);
      if (res.token && res.user) {
        if (res.user.role !== "technician" && res.user.role !== "admin") {
          setErrorMessage(
            "This account is registered as a customer. Please log in with a partner/technician account or register as a professional.",
          );
          technicianStore.logout();
          setLoading(false);
          return;
        }
        technicianStore.saveSession(res.token, res.user);
        setSuccessMessage("Login successful! Accessing dashboard...");
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 300);
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
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <span>Customer Website</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      {/* Main Card */}
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
              {isResetFlow ? "Reset Password" : "Professional Login"}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {isResetFlow
                ? resetStep === "request"
                  ? "Enter your registered number or email to receive a password reset verification code."
                  : `Enter the 6-digit code sent to ${resetMaskedDestination} and choose a new password.`
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

          {/* RESET PASSWORD FLOW */}
          {isResetFlow ? (
            resetStep === "request" ? (
              /* Reset Step 1: Identifier Input */
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Registered Mobile Number or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="Enter your registered number or email"
                      className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
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
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetFlow(false);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to Professional Login
                  </button>
                </div>
              </form>
            ) : (
              /* Reset Step 2: Verification Code & New Password */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 px-4 text-center tracking-widest text-lg font-mono font-bold text-white placeholder:text-slate-500 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Sent to {resetMaskedDestination}</span>
                    <button
                      type="button"
                      disabled={resetCooldown > 0 || loading}
                      onClick={handleResendResetCode}
                      className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 font-semibold cursor-pointer"
                    >
                      {resetCooldown > 0 ? `Resend code in ${resetCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Save New Password & Log In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("request");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Change email or mobile number
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Direct Login Form */
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
                    Password
                  </label>
                  {/* Clean Arrow-Style Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setResetIdentifier(identifier.trim());
                      setResetStep("request");
                      setIsResetFlow(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold group cursor-pointer"
                  >
                    <span>Forgot Password?</span>
                    <span className="text-[10px] text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Reset Password</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                    <span>Signing in...</span>
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
