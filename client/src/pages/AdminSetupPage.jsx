import React, { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import adminStore from "../services/adminStore";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [setupAvailable, setSetupAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminStore.api
      .get("/auth/admin/setup/status")
      .then(({ data }) => setSetupAvailable(Boolean(data.setupAvailable)))
      .catch((statusError) => {
        setError(
          statusError.response?.data?.error ||
            "Could not check the initial admin setup status.",
        );
      });
  }, []);

  const submitSetup = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await adminStore.api.post("/auth/admin/setup", {
        name,
        email,
        password,
        confirmPassword,
      });
      navigate("/admin/login", {
        replace: true,
        state: { setupComplete: true },
      });
    } catch (setupError) {
      if (setupError.response?.status === 409) setSetupAvailable(false);
      setError(
        setupError.response?.data?.error ||
          "Could not create Super Admin account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#101a16] px-4 py-10 text-white flex items-center justify-center">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
          {setupAvailable === null ? (
            <p
              role={error ? "alert" : "status"}
              className={error ? "text-sm text-red-200" : "text-sm text-slate-300"}
            >
              {error || "Checking initial admin setup..."}
            </p>
          ) : setupAvailable ? (
            <>
              <ShieldCheck className="mb-4 h-6 w-6 text-emerald-400" />
              <h1 className="text-2xl font-bold">Create Super Admin Account</h1>
              <p className="mt-2 text-sm text-slate-400">
                This one-time setup is disabled as soon as an admin account
                exists.
              </p>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}
              <form onSubmit={submitSetup} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-slate-200">
                  Full Name
                  <input
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  Admin Email
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 text-white outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  Password (12+ characters)
                  <span className="relative mt-1.5 block">
                    <input
                      required
                      minLength={12}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 pr-12 text-white outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  Confirm Password
                  <span className="relative mt-1.5 block">
                    <input
                      required
                      minLength={12}
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-3 pr-12 text-white outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Super Admin Account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">
                Admin setup has already been completed.
              </h1>
              {error && (
                <p role="alert" className="mt-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <Link
                to="/admin/login"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                <ArrowLeft size={16} /> Go to Admin Login
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
