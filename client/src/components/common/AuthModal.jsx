import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  Wrench,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import technicianStore from "../../services/technicianStore";

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^[+\d][\d\s()-]{7,}$/.test(value);

const detectIdentifierType = (val) => {
  if (!val) return "none";
  if (val.includes("@")) return "email";
  if (/[a-zA-Z]/.test(val)) return "email";
  if (/^[+\d\s()-]+$/.test(val)) return "phone";
  return "unknown";
};

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-password-wrap">
        <input
          className="auth-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </span>
    </label>
  );
}

export default function AuthModal({
  onClose,
  onNavigate,
  onSuccess,
  onCancel,
}) {
  const { loginStep1, verifyOtp, resendOtp, register, demoLogin } = useAuth();
  const [accountType, setAccountType] = useState("customer"); // "customer" | "professional"
  const [screen, setScreen] = useState("login"); // "login" | "signup" | "otp"
  const [loginValue, setLoginValue] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // OTP state (Customer)
  const [otpSession, setOtpSession] = useState(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRefs = useRef([]);

  // Professional Login State
  const [profIdentifier, setProfIdentifier] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [profShowPassword, setProfShowPassword] = useState(false);
  const [profLoading, setProfLoading] = useState(false);
  const [profError, setProfError] = useState("");
  const [profStatus, setProfStatus] = useState("");
  const [profShowForgot, setProfShowForgot] = useState(false);
  const [profOtpSession, setProfOtpSession] = useState(null);
  const [profOtpDigits, setProfOtpDigits] = useState(["", "", "", "", "", ""]);
  const profOtpInputRefs = useRef([]);

  const [signup, setSignup] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef(null);
  const isSignup = screen === "signup";
  const isOtp = screen === "otp";

  const handleCancelAndClose = () => {
    if (onCancel) onCancel();
    onClose();
  };

  useEffect(() => {
    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    modalRef.current?.focus();
    const closeOnEscape = (event) =>
      event.key === "Escape" && handleCancelAndClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);

  // Focus first OTP box when entering OTP screen
  useEffect(() => {
    if (screen === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 50);
    }
  }, [screen]);

  // Resend cooldown timer
  useEffect(() => {
    if (screen !== "otp" || cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, cooldown]);

  const resetMessage = () => {
    setError("");
    setStatus("");
  };

  const switchScreen = (next) => {
    setScreen(next);
    resetMessage();
  };

  const updateSignup = (field) => (event) =>
    setSignup((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  const socialLogin = async (provider) => {
    resetMessage();
    setStatus(`Connecting with ${provider}...`);
    try {
      await demoLogin("customer");
      setStatus("Signed in successfully");
      if (onSuccess) onSuccess();
      window.setTimeout(onClose, 300);
    } catch {
      setStatus("");
      setError(`${provider} sign-in is unavailable right now.`);
    }
  };

  // Step 1: Submit email/phone and password to trigger 2FA
  const submitLogin = async (event) => {
    event.preventDefault();
    resetMessage();

    const trimmedValue = loginValue.trim();
    if (!trimmedValue) {
      return setError("Enter your email address or phone number.");
    }

    if (trimmedValue.includes("@")) {
      if (!isEmail(trimmedValue)) {
        return setError("Please enter a valid email address.");
      }
    } else {
      if (!isPhone(trimmedValue)) {
        return setError(
          "Please enter a valid phone number (at least 8 digits).",
        );
      }
    }

    if (!loginPassword) {
      return setError("Please enter your password.");
    }

    setStatus("Verifying credentials...");
    try {
      const res = await loginStep1(trimmedValue, loginPassword);
      if (res.status === "OTP_REQUIRED") {
        setOtpSession({
          tempSessionToken: res.tempSessionToken,
          channel: res.channel,
          maskedDestination: res.maskedDestination,
          devCode: res.devCode,
        });
        if (res.devCode) {
          setOtpDigits(res.devCode.split(""));
        } else {
          setOtpDigits(["", "", "", "", "", ""]);
        }
        setCooldown(res.cooldownSeconds || 30);
        setStatus("");
        setScreen("otp");
      }
    } catch (err) {
      setStatus("");
      console.error("[Auth] Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          "Unable to send authentication code. Please try again.",
      );
    }
  };

  // Step 2: Handle 6-digit OTP input boxes
  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const lastDigit = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastDigit;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
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
    if (cooldown > 0 || !otpSession?.tempSessionToken) return;
    resetMessage();
    setStatus("Resending code...");
    try {
      const res = await resendOtp(otpSession.tempSessionToken);
      setCooldown(res.cooldownSeconds || 30);
      setStatus("A fresh 6-digit verification code has been dispatched.");
      if (res.devCode) {
        setOtpDigits(res.devCode.split(""));
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setStatus("");
      console.error("[Auth] Resend error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          "Unable to send authentication code. Please try again.",
      );
    }
  };

  const submitOtp = async (event) => {
    if (event) event.preventDefault();
    resetMessage();
    const code = otpDigits.join("");
    if (code.length < 6) {
      return setError("Please enter the complete 6-digit verification code.");
    }

    setStatus("Verifying code...");
    try {
      await verifyOtp(otpSession.tempSessionToken, code);
      setStatus("Signed in successfully!");
      if (onSuccess) onSuccess();
      window.setTimeout(onClose, 300);
    } catch (err) {
      setStatus("");
      console.error(
        "[Auth] OTP verify error:",
        err.response?.data || err.message,
      );
      setError(err.response?.data?.error || "Invalid authentication code.");
    }
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    resetMessage();
    if (!isEmail(signup.email)) return setError("Enter a valid email address.");
    if (!isPhone(signup.phone)) return setError("Enter a valid phone number.");
    if (signup.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (signup.password !== signup.confirmPassword)
      return setError("Passwords do not match.");
    if (!signup.agreed)
      return setError("Please agree to the Terms of Use and Privacy Policy.");
    setStatus("Creating your account...");
    try {
      await register({
        name: signup.name,
        email: signup.email,
        phone: signup.phone,
        password: signup.password,
        role: "customer",
      });
      setStatus("Account created successfully");
      if (onSuccess) onSuccess();
      window.setTimeout(onClose, 300);
    } catch (err) {
      setStatus("");
      setError(
        err.response?.data?.error ||
          "We could not create your account. Please try again.",
      );
    }
  };

  // Professional Login Handlers
  const submitProfLogin = async (e) => {
    if (e) e.preventDefault();
    setProfError("");
    setProfStatus("");

    const trimmed = profIdentifier.trim();
    if (!trimmed) {
      return setProfError("Enter your registered mobile number or email.");
    }
    if (!profPassword) {
      return setProfError("Enter your partner account password.");
    }

    setProfLoading(true);
    setProfStatus("Verifying credentials...");
    try {
      const res = await technicianStore.loginWithPassword(
        trimmed,
        profPassword,
      );
      if (res.status === "OTP_REQUIRED" || res.tempSessionToken) {
        setProfOtpSession({
          tempSessionToken: res.tempSessionToken,
          channel: res.channel,
          maskedDestination: res.maskedDestination || trimmed,
          devCode: res.devCode,
        });
        if (res.devCode) {
          setProfOtpDigits(res.devCode.split(""));
        } else {
          setProfOtpDigits(["", "", "", "", "", ""]);
        }
        setProfStatus("");
      } else if (res.token && res.user) {
        if (res.user.role !== "technician" && res.user.role !== "admin") {
          technicianStore.logout();
          setProfStatus("");
          setProfError(
            "This account is registered as a customer. Please switch to the Customer tab or register as a professional.",
          );
          setProfLoading(false);
          return;
        }
        technicianStore.saveSession(res.token, res.user);
        setProfStatus("Signed in successfully! Redirecting...");
        setTimeout(() => {
          onClose();
          if (onNavigate) {
            onNavigate("/technician/dashboard");
          } else {
            window.location.assign("/technician/dashboard");
          }
        }, 300);
      }
    } catch (err) {
      console.error("Professional login error:", err);
      setProfStatus("");
      setProfError(
        err.response?.data?.error ||
          "Invalid credentials. Please verify your email/phone and password.",
      );
    } finally {
      setProfLoading(false);
    }
  };

  const handleProfDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...profOtpDigits];
      newDigits[index] = "";
      setProfOtpDigits(newDigits);
      return;
    }
    const lastDigit = cleaned.slice(-1);
    const newDigits = [...profOtpDigits];
    newDigits[index] = lastDigit;
    setProfOtpDigits(newDigits);
    if (index < 5) {
      profOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleProfDigitKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!profOtpDigits[index] && index > 0) {
        const newDigits = [...profOtpDigits];
        newDigits[index - 1] = "";
        setProfOtpDigits(newDigits);
        profOtpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      profOtpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      profOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleProfOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = [...profOtpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setProfOtpDigits(newDigits);
    const targetFocus = Math.min(pasted.length, 5);
    profOtpInputRefs.current[targetFocus]?.focus();
  };

  const submitProfOtp = async (e) => {
    if (e) e.preventDefault();
    setProfError("");
    setProfStatus("");
    const code = profOtpDigits.join("");
    if (code.length < 6) {
      return setProfError(
        "Please enter the complete 6-digit verification code.",
      );
    }

    setProfLoading(true);
    setProfStatus("Verifying code...");
    try {
      const res = await technicianStore.verifyOtp(
        profOtpSession.tempSessionToken,
        code,
      );
      if (res.user) {
        if (res.user.role !== "technician" && res.user.role !== "admin") {
          technicianStore.logout();
          setProfStatus("");
          setProfError(
            "This account is registered as a customer. Please use Customer login.",
          );
          setProfLoading(false);
          return;
        }
        setProfStatus("Verified! Redirecting to Dashboard...");
        setTimeout(() => {
          onClose();
          if (onNavigate) {
            onNavigate("/technician/dashboard");
          } else {
            window.location.assign("/technician/dashboard");
          }
        }, 300);
      }
    } catch (err) {
      console.error("Prof OTP verify error:", err);
      setProfStatus("");
      setProfError(err.response?.data?.error || "Invalid authentication code.");
    } finally {
      setProfLoading(false);
    }
  };

  const handleProfDemo = async (category = "Plumbing") => {
    setProfError("");
    setProfStatus(`Connecting as ${category} Specialist...`);
    setProfLoading(true);
    try {
      const res = await technicianStore.demoLogin(category);
      if (res.user) {
        setProfStatus("Signed in! Redirecting to Dashboard...");
        setTimeout(() => {
          onClose();
          if (onNavigate) {
            onNavigate("/technician/dashboard");
          } else {
            window.location.assign("/technician/dashboard");
          }
        }, 300);
      }
    } catch (err) {
      setProfStatus("");
      setProfError("Demo professional login failed. Please try again.");
    } finally {
      setProfLoading(false);
    }
  };

  const detectedType = detectIdentifierType(loginValue.trim());
  const profDetectedType = detectIdentifierType(profIdentifier.trim());

  return (
    <div
      className="auth-overlay"
      onMouseDown={(event) =>
        event.target === event.currentTarget && handleCancelAndClose()
      }
    >
      <section
        ref={modalRef}
        tabIndex="-1"
        className={`auth-modal ${isSignup ? "auth-modal--signup" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          onClick={handleCancelAndClose}
          className="auth-close"
          aria-label="Close authentication dialog"
        >
          <X />
        </button>

        <img
          src="/argent-logo.png"
          alt="Argent Your"
          className="h-12 w-12 rounded-2xl object-contain shadow-sm"
        />
        <p className="eyebrow mt-4">Argent Your</p>

        {/* Account Type Selector: Customer vs Professional */}
        {!isOtp && !profOtpSession && (
          <div className="mt-4 mb-3 grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl w-full border border-slate-200 box-border">
            <button
              type="button"
              onClick={() => {
                setAccountType("customer");
                resetMessage();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountType === "customer"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType("professional");
                resetMessage();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountType === "professional"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Professional</span>
            </button>
          </div>
        )}

        {accountType === "professional" ? (
          profOtpSession ? (
            /* PROFESSIONAL OTP VERIFICATION */
            <div className="mt-2 text-left w-full animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setProfOtpSession(null);
                  setProfError("");
                  setProfStatus("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-3 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Mobile / Email</span>
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="display-font text-2xl font-bold text-slate-950">
                  Partner Verification Code
                </h2>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1">
                <p className="text-xs font-bold text-slate-500">
                  Security code sent to:
                </p>
                <p className="text-sm font-black text-slate-900 font-mono">
                  {profOtpSession?.maskedDestination || profIdentifier}
                </p>
              </div>

              <form onSubmit={submitProfOtp} className="auth-form mt-4">
                <label className="auth-field">
                  <span className="text-xs font-bold text-slate-700">
                    Enter 6-Digit Code
                  </span>
                  <div
                    className="grid grid-cols-6 gap-2 mt-2"
                    onPaste={handleProfOtpPaste}
                  >
                    {profOtpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (profOtpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleProfDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleProfDigitKeyDown(index, e)}
                        className="w-full aspect-square text-center text-lg sm:text-xl font-black rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    ))}
                  </div>
                </label>

                {profError && (
                  <p className="auth-error" role="alert">
                    {profError}
                  </p>
                )}
                {profStatus && (
                  <p className="auth-status">
                    <Check /> {profStatus}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={profLoading}
                  className="auth-primary mt-2"
                >
                  {profLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Verify & Access Dashboard"
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* PROFESSIONAL LOGIN FORM */
            <div className="mt-1 text-left w-full animate-fade-in">
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-0.5">
                  SERVICE PARTNER & TECHNICIAN
                </span>
                <h2 className="display-font text-2xl font-bold text-slate-950">
                  Professional Login
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sign in to access your dispatch dashboard, active jobs, and
                  customer requests.
                </p>
              </div>

              {/* Forgot Password Helper Banner */}
              {profShowForgot && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 text-emerald-950 animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>Password Assistance</span>
                    <button
                      type="button"
                      onClick={() => setProfShowForgot(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    For partner security, credential resets are assisted by
                    dispatch operations. Contact partner desk at{" "}
                    <strong className="text-slate-900">+91 98101 11223</strong>{" "}
                    or verify via your registered emergency contact.
                  </p>
                </div>
              )}

              <form onSubmit={submitProfLogin} className="auth-form space-y-3">
                {/* Identifier Input */}
                <label className="auth-field">
                  <div className="flex items-center justify-between mb-1">
                    <span>Mobile Number or Email</span>
                    {profDetectedType === "phone" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Phone className="h-3 w-3" /> Phone
                      </span>
                    )}
                    {profDetectedType === "email" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      className="auth-input pr-10"
                      value={profIdentifier}
                      onChange={(e) => setProfIdentifier(e.target.value)}
                      placeholder="e.g. +91 98101 11223 or partner@email.com"
                      autoComplete="username"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      {profDetectedType === "email" ? (
                        <Mail className="h-4 w-4 text-emerald-600" />
                      ) : profDetectedType === "phone" ? (
                        <Phone className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <KeyRound className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </label>

                {/* Password Input */}
                <label className="auth-field">
                  <span>Account Password</span>
                  <div className="auth-password-wrap">
                    <input
                      className="auth-input"
                      value={profPassword}
                      onChange={(e) => setProfPassword(e.target.value)}
                      placeholder="Enter partner password"
                      type={profShowPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setProfShowPassword(!profShowPassword)}
                      aria-label={
                        profShowPassword ? "Hide password" : "Show password"
                      }
                    >
                      {profShowPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => setProfShowForgot(!profShowForgot)}
                    className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {profError && (
                  <p className="auth-error" role="alert">
                    {profError}
                  </p>
                )}
                {profStatus && (
                  <p className="auth-status">
                    <Check /> {profStatus}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={profLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {profLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Partner Demo Logins for Testing */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
                  Instant Evaluator Demo Sign-In
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleProfDemo("Plumbing")}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-[11px] font-bold text-slate-700 text-center transition-colors cursor-pointer"
                  >
                    Demo Plumber
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfDemo("AC & Appliance Repair")}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-[11px] font-bold text-slate-700 text-center transition-colors cursor-pointer"
                  >
                    Demo AC Tech
                  </button>
                </div>
              </div>

              {/* Create Professional Account Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Want to provide services with Argent Your?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate("/professionals/register");
                    } else {
                      window.location.assign("/professionals/register");
                    }
                  }}
                  className="mt-1 text-xs font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Create Professional Account / Register as a Professional
                </button>
              </div>
            </div>
          )
        ) : isOtp ? (
          /* STEP 2: TWO-STEP OTP VERIFICATION SCREEN (Customer) */
          <div className="mt-2 text-left w-full">
            <button
              type="button"
              onClick={() => {
                setScreen("login");
                resetMessage();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-3 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Email / Phone</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2
                id="auth-title"
                className="display-font text-2xl sm:text-3xl font-bold text-slate-950"
              >
                Enter Authentication Code
              </h2>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1">
              <p className="text-xs font-bold text-slate-500">Code sent to:</p>
              <p className="text-sm sm:text-base font-black text-slate-900 tracking-wide font-mono">
                {otpSession?.maskedDestination || "your registered contact"}
              </p>
            </div>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
              {otpSession?.channel === "email" ? (
                <>
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Channel: Email Address</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Channel: Mobile SMS</span>
                </>
              )}
            </div>

            <form onSubmit={submitOtp} className="auth-form mt-4">
              <label className="auth-field">
                <span className="text-xs font-bold text-slate-700">
                  Enter 6-Digit Code
                </span>
                <div className="auth-otp-group" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      className="auth-otp-box"
                      required
                    />
                  ))}
                </div>
              </label>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              {status && (
                <p className="auth-status">
                  <Check /> {status}
                </p>
              )}

              <button
                type="submit"
                disabled={Boolean(status) || otpDigits.join("").length < 6}
                className="auth-primary w-full justify-center mt-2"
              >
                {status ? <LoaderCircle className="animate-spin" /> : "Verify"}
              </button>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Didn't receive the code?</span>
                {cooldown > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend code in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-emerald-700 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: LOGIN OR SIGNUP SCREEN */
          <>
            <h2 id="auth-title" className="display-font mt-2 text-3xl">
              {isSignup
                ? "Create your Argent Your account"
                : "Log in or Sign up"}
            </h2>
            {!isSignup && (
              <p className="auth-subtitle">
                Sign in to your Argent Your account and manage your services,
                bookings and preferences.
              </p>
            )}

            <form
              onSubmit={isSignup ? submitSignup : submitLogin}
              className="auth-form"
            >
              {isSignup ? (
                <>
                  <label className="auth-field">
                    <span>Full Name</span>
                    <input
                      className="auth-input"
                      value={signup.name}
                      onChange={updateSignup("name")}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Email Address</span>
                    <input
                      className="auth-input"
                      value={signup.email}
                      onChange={updateSignup("email")}
                      placeholder="Enter your email address"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Phone Number</span>
                    <input
                      className="auth-input"
                      value={signup.phone}
                      onChange={updateSignup("phone")}
                      placeholder="Enter your phone number"
                      type="tel"
                      autoComplete="tel"
                      required
                    />
                  </label>
                  <PasswordField
                    label="Password"
                    placeholder="Create a password"
                    value={signup.password}
                    onChange={updateSignup("password")}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={signup.confirmPassword}
                    onChange={updateSignup("confirmPassword")}
                    autoComplete="new-password"
                  />
                  <label className="auth-agreement">
                    <input
                      type="checkbox"
                      checked={signup.agreed}
                      onChange={updateSignup("agreed")}
                    />
                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigate?.("/terms");
                        }}
                      >
                        Terms of Use
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigate?.("/privacy");
                        }}
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                </>
              ) : (
                <>
                  {/* Single Unified Input for Email or Phone */}
                  <label className="auth-field">
                    <div className="flex items-center justify-between mb-1">
                      <span>Email or Phone Number</span>
                      {detectedType === "email" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Mail className="h-3 w-3" /> Email
                        </span>
                      )}
                      {detectedType === "phone" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Phone className="h-3 w-3" /> Phone
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        className="auth-input pr-10"
                        value={loginValue}
                        onChange={(event) => setLoginValue(event.target.value)}
                        placeholder="Enter email or phone number"
                        autoComplete="username"
                        required
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {detectedType === "email" ? (
                          <Mail className="h-4 w-4 text-emerald-600" />
                        ) : detectedType === "phone" ? (
                          <Phone className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <KeyRound className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </label>

                  <PasswordField
                    label="Password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => {
                      setError("");
                      setStatus("Password recovery will be available soon.");
                    }}
                  >
                    Forgot password?
                  </button>
                </>
              )}

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              {status && (
                <p className="auth-status">
                  <Check /> {status}
                </p>
              )}

              <button disabled={Boolean(status)} className="auth-primary">
                {status ? (
                  <LoaderCircle className="animate-spin" />
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Continue / Log in"
                )}
              </button>
            </form>

            <div className="auth-or">
              <span>Or continue with</span>
            </div>
            <div className="auth-socials">
              <button
                type="button"
                onClick={() => socialLogin("Google")}
                className="auth-social"
              >
                <b className="auth-google">G</b> Google
              </button>
              <button
                type="button"
                onClick={() => socialLogin("Apple")}
                className="auth-social"
              >
                <Apple /> Apple
              </button>
              <button
                type="button"
                onClick={() => socialLogin("Facebook")}
                className="auth-social"
              >
                <b className="auth-facebook">f</b> Facebook
              </button>
            </div>

            <p className="auth-switch">
              {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button
                type="button"
                onClick={() => switchScreen(isSignup ? "login" : "signup")}
              >
                {isSignup ? "Log in" : "Create Account"}
              </button>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
