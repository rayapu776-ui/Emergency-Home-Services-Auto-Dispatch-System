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
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState(
    location.state?.setupComplete
      ? "Super Admin account created successfully. Sign in to continue."
      : "",
  );

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

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");
    try {
      const result = await adminStore.requestPasswordReset(resetEmail.trim());
      if (!result.tempSessionToken) {
        setResetMessage(result.message);
        return;
      }
      setResetToken(result.tempSessionToken);
      setResetMessage(`Code sent to ${result.maskedDestination}.`);
      setResetStep("password");
    } catch (requestError) {
      setResetError(
        requestError.response?.data?.error || "Could not request a reset code.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");
    try {
      await adminStore.resetPassword({
        tempSessionToken: resetToken,
        code: resetCode,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetMessage("Password updated. Sign in with your new password.");
      setResetStep("done");
    } catch (resetError) {
      setResetError(
        resetError.response?.data?.error ||
          "Could not reset the admin password.",
      );
    } finally {
      setResetLoading(false);
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
          {setupMessage && (
            <p
              role="status"
              className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-950/40 p-3 text-sm text-emerald-200"
            >
              {setupMessage}
            </p>
          )}
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
                onClick={() => {
                  setForgotNotice((shown) => !shown);
                  setResetEmail(email);
                  setResetStep("email");
                  setResetMessage("");
                  setResetError("");
                }}
                className="text-emerald-300 hover:text-emerald-200"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {forgotNotice && (
            <div className="mt-4 space-y-3 rounded-lg bg-white/5 p-3">
              {resetStep === "email" && (
                <form onSubmit={handleRequestReset} className="space-y-3">
                  <label className="block text-xs font-medium text-slate-300">
                    Admin email for password recovery
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                  <button
                    disabled={resetLoading}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-60"
                  >
                    {resetLoading
                      ? "Sending code..."
                      : "Send verification code"}
                  </button>
                </form>
              )}
              {resetStep === "password" && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <label className="block text-xs font-medium text-slate-300">
                    Verification code
                    <input
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={(event) => setResetCode(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    New password (12+ characters)
                    <input
                      type="password"
                      minLength={12}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Confirm new password
                    <input
                      type="password"
                      minLength={12}
                      autoComplete="new-password"
                      required
                      value={confirmNewPassword}
                      onChange={(event) =>
                        setConfirmNewPassword(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    />
                  </label>
                  <button
                    disabled={resetLoading}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-60"
                  >
                    {resetLoading ? "Updating password..." : "Update password"}
                  </button>
                </form>
              )}
              {resetMessage && (
                <p role="status" className="text-xs text-emerald-200">
                  {resetMessage}
                </p>
              )}
              {resetError && (
                <p role="alert" className="text-xs text-red-200">
                  {resetError}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
