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
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
              Professional Login
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Sign in with your registered number or email to access the professional operations dashboard.
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
                request a password reset from administrator.
              </p>
            </div>
          )}

          {/* Direct Login Form */}
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
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Argent Your Partner Network • Dispatch & Operations Center
      </footer>
    </div>
  );
}
