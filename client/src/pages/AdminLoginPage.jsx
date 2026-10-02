import React, { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import adminStore from "../services/adminStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminStore.login(email.trim(), password, rememberMe);
      navigate(location.state?.from?.pathname || "/admin/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError.response?.data?.error ||
          "Unable to sign in to the admin portal.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#101a16] text-white flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/argent-logo.png"
            alt="Argent Your"
            className="h-11 w-11 rounded-xl object-contain"
          />
          <div>
            <p className="font-bold leading-tight">Argent Your</p>
            <p className="text-xs text-emerald-300">Administration</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mb-4" />
            <h1 className="text-2xl font-bold">Admin sign in</h1>
            <p className="mt-2 text-sm text-slate-400">
              Use an active Argent Your administrator account.
            </p>
          </div>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">
              Admin email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 text-white outline-none focus:border-emerald-400"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <span className="relative mt-1.5 block">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 pr-12 text-white outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="accent-emerald-500"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotNotice((shown) => !shown)}
                className="text-emerald-300 hover:text-emerald-200"
              >
                Forgot password?
              </button>
            </div>
            {forgotNotice && (
              <p className="rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
                Contact a Super Admin to reset an administrator password.
                Self-service admin recovery is not configured.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
