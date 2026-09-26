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
  const {
    login,
    register,
    forgotPassword,
    resetPassword,
    loginStep1,
    verifyOtp,
    resendOtp,
    demoLogin,
  } = useAuth();
  const [accountType, setAccountType] = useState("customer"); // "customer" | "professional"
  const [screen, setScreen] = useState("login"); // "login" | "signup" | "otp" | "forgot"
  const [loginValue, setLoginValue] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Customer Forgot Password State
  const [custResetStep, setCustResetStep] = useState("request"); // 'request' | 'verify'
  const [custResetIdentifier, setCustResetIdentifier] = useState("");
  const [custResetToken, setCustResetToken] = useState("");
  const [custResetMasked, setCustResetMasked] = useState("");
  const [custResetCode, setCustResetCode] = useState("");
  const [custNewPassword, setCustNewPassword] = useState("");
  const [custConfirmPassword, setCustConfirmPassword] = useState("");
  const [custShowNewPassword, setCustShowNewPassword] = useState(false);
  const [custShowConfirmPassword, setCustShowConfirmPassword] = useState(false);
  const [custResetCooldown, setCustResetCooldown] = useState(0);
  const [custResetLoading, setCustResetLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (custResetCooldown > 0) {
      timer = setTimeout(() => setCustResetCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [custResetCooldown]);

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

  // Professional Forgot Password State
  const [profScreen, setProfScreen] = useState("login"); // 'login' | 'forgot'
  const [profResetStep, setProfResetStep] = useState("request"); // 'request' | 'verify'
  const [profResetIdentifier, setProfResetIdentifier] = useState("");
  const [profResetToken, setProfResetToken] = useState("");
  const [profResetMasked, setProfResetMasked] = useState("");
  const [profResetCode, setProfResetCode] = useState("");
  const [profNewPassword, setProfNewPassword] = useState("");
  const [profConfirmPassword, setProfConfirmPassword] = useState("");
  const [profShowNewPassword, setProfShowNewPassword] = useState(false);
  const [profShowConfirmPassword, setProfShowConfirmPassword] = useState(false);
  const [profResetCooldown, setProfResetCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (profResetCooldown > 0) {
      timer = setTimeout(() => setProfResetCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [profResetCooldown]);

  const [profOtpSession, setProfOtpSession] = useState(null);
  const [profOtpDigits, setProfOtpDigits] = useState(["", "", "", "", "", ""]);
  const profOtpInputRefs = useRef([]);
  const [profCooldown, setProfCooldown] = useState(0);

  // Professional OTP cooldown timer
  useEffect(() => {
    let timer;
    if (profCooldown > 0) {
      timer = setTimeout(() => setProfCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [profCooldown]);

  // Auto-focus first digit box when professional OTP screen opens
  useEffect(() => {
    if (profOtpSession) {
      setTimeout(() => profOtpInputRefs.current[0]?.focus(), 100);
    }
  }, [profOtpSession]);

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
  const isForgot = screen === "forgot";

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

    setStatus("Signing in...");
    try {
      await login(trimmedValue, loginPassword);
      setStatus("Sign in successful!");
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err) {
      setStatus("");
      console.error("[Auth] Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          "Invalid email/phone or password. Please try again.",
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

    // Auto-advance to next box
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
    if (cooldown > 0 || !otpSession?.tempSessionToken) return;
    resetMessage();
    setStatus("Resending code...");
    try {
      const res = await resendOtp(otpSession.tempSessionToken);
      setCooldown(res.cooldownSeconds || 30);
      setStatus("A fresh 6-digit verification code has been dispatched.");
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
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

  // Customer Forgot Password Handlers
  const handleCustomerForgotRequest = async (e) => {
    if (e) e.preventDefault();
    resetMessage();
    const trimmed = custResetIdentifier.trim();
    if (!trimmed) {
      return setError("Please enter your registered email address or mobile number.");
    }
    setCustResetLoading(true);
    setStatus("Verifying account...");
    try {
      const res = await forgotPassword(trimmed, "customer");
      setCustResetToken(res.tempSessionToken || "");
      setCustResetMasked(res.maskedDestination || trimmed);
      setCustResetCooldown(res.cooldownSeconds || 60);
      setCustResetStep("verify");
      setStatus("");
    } catch (err) {
      setStatus("");
      console.error("[Auth] Forgot password error:", err);
      setError(
        err.response?.data?.error ||
          "No account found with this email or mobile number."
      );
    } finally {
      setCustResetLoading(false);
    }
  };

  const handleCustomerResetSubmit = async (e) => {
    if (e) e.preventDefault();
    resetMessage();
    const cleanCode = custResetCode.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return setError("Please enter the complete 6-digit verification code.");
    }
    if (!custNewPassword || custNewPassword.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (custNewPassword !== custConfirmPassword) {
      return setError("Passwords do not match.");
    }
    setCustResetLoading(true);
    setStatus("Updating password...");
    try {
      const res = await resetPassword({
        tempSessionToken: custResetToken,
        identifier: custResetIdentifier.trim(),
        code: cleanCode,
        newPassword: custNewPassword,
        confirmPassword: custConfirmPassword,
      });
      setStatus(
        res.message || "Password updated successfully! Please sign in with your new password."
      );
      setLoginValue(custResetIdentifier.trim());
      setLoginPassword("");
      setScreen("login");
      setCustResetStep("request");
      setCustResetCode("");
      setCustNewPassword("");
      setCustConfirmPassword("");
    } catch (err) {
      setStatus("");
      console.error("[Auth] Reset password error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please check the code and try again."
      );
    } finally {
      setCustResetLoading(false);
    }
  };

  const handleCustomerResendReset = async () => {
    if (custResetCooldown > 0 || custResetLoading) return;
    resetMessage();
    setStatus("Resending code...");
    try {
      const res = await forgotPassword(custResetIdentifier.trim(), "customer");
      setCustResetToken(res.tempSessionToken || custResetToken);
      setCustResetCooldown(res.cooldownSeconds || 60);
      setCustResetCode("");
      setStatus("A fresh verification code has been dispatched.");
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setStatus("");
      setError(
        err.response?.data?.error || "Unable to resend verification code."
      );
    }
  };

  // Professional Forgot Password Handlers
  const handleProfForgotRequest = async (e) => {
    if (e) e.preventDefault();
    setProfError("");
    setProfStatus("");
    const trimmed = profResetIdentifier.trim();
    if (!trimmed) {
      return setProfError("Please enter your registered number or email.");
    }
    setProfLoading(true);
    setProfStatus("Verifying account...");
    try {
      const res = await technicianStore.forgotPassword(trimmed);
      setProfResetToken(res.tempSessionToken || "");
      setProfResetMasked(res.maskedDestination || trimmed);
      setProfResetCooldown(res.cooldownSeconds || 60);
      setProfResetStep("verify");
      setProfStatus("");
    } catch (err) {
      setProfStatus("");
      console.error("[Auth] Prof forgot password error:", err);
      setProfError(
        err.response?.data?.error ||
          "No partner account found with this email or mobile number."
      );
    } finally {
      setProfLoading(false);
    }
  };

  const handleProfResetSubmit = async (e) => {
    if (e) e.preventDefault();
    setProfError("");
    setProfStatus("");
    const cleanCode = profResetCode.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return setProfError("Please enter the complete 6-digit verification code.");
    }
    if (!profNewPassword || profNewPassword.length < 6) {
      return setProfError("Password must be at least 6 characters long.");
    }
    if (profNewPassword !== profConfirmPassword) {
      return setProfError("Passwords do not match.");
    }
    setProfLoading(true);
    setProfStatus("Updating password...");
    try {
      const res = await technicianStore.resetPassword({
        tempSessionToken: profResetToken,
        identifier: profResetIdentifier.trim(),
        code: cleanCode,
        newPassword: profNewPassword,
        confirmPassword: profConfirmPassword,
      });
      setProfStatus(
        res.message || "Password updated successfully! Please sign in with your new password."
      );
      setProfIdentifier(profResetIdentifier.trim());
      setProfPassword("");
      setProfScreen("login");
      setProfResetStep("request");
      setProfResetCode("");
      setProfNewPassword("");
      setProfConfirmPassword("");
    } catch (err) {
      setProfStatus("");
      console.error("[Auth] Prof reset password error:", err);
      setProfError(
        err.response?.data?.error ||
          "Failed to reset password. Please check the code and try again."
      );
    } finally {
      setProfLoading(false);
    }
  };

  const handleProfResendReset = async () => {
    if (profResetCooldown > 0 || profLoading) return;
    setProfError("");
    setProfStatus("Resending code...");
    try {
      const res = await technicianStore.forgotPassword(profResetIdentifier.trim());
      setProfResetToken(res.tempSessionToken || profResetToken);
      setProfResetCooldown(res.cooldownSeconds || 60);
      setProfResetCode("");
      setProfStatus("A fresh verification code has been dispatched.");
      setTimeout(() => setProfStatus(""), 4000);
    } catch (err) {
      setProfStatus("");
      setProfError(
        err.response?.data?.error || "Unable to resend verification code."
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
      return setProfError("Please enter your password.");
    }
    setProfLoading(true);
    setProfStatus("Signing in...");
    try {
      const res = await technicianStore.login(trimmed, profPassword);
      if (res.token && res.user) {
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
          "Invalid email/phone or password. Please verify and try again.",
      );
    } finally {
      setProfLoading(false);
    }
  };

  const handleProfResendOtp = async () => {
    if (profCooldown > 0 || !profOtpSession?.tempSessionToken || profLoading)
      return;
    setProfError("");
    setProfStatus("Resending code...");
    try {
      const res = await technicianStore.resendOtp(
        profOtpSession.tempSessionToken,
        profIdentifier.trim(),
      );
      setProfCooldown(res.cooldownSeconds || 60);
      setProfOtpDigits(["", "", "", "", "", ""]);
      setProfStatus(res.message || "A fresh verification code has been sent.");
      setTimeout(() => setProfStatus(""), 4000);
      setTimeout(() => profOtpInputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setProfStatus("");
      console.error("Professional OTP resend error:", err);
      setProfError(
        err.response?.data?.error ||
          "Unable to send verification code. Please try again.",
      );
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
    if (cleaned.length > 1) {
      const newDigits = [...profOtpDigits];
      const digitsToFill = cleaned.slice(0, 6);
      for (let i = 0; i < digitsToFill.length && index + i < 6; i++) {
        newDigits[index + i] = digitsToFill[i];
      }
      setProfOtpDigits(newDigits);
      const nextFocus = Math.min(index + digitsToFill.length, 5);
      profOtpInputRefs.current[nextFocus]?.focus();
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
      if (profOtpDigits[index]) {
        const newDigits = [...profOtpDigits];
        newDigits[index] = "";
        setProfOtpDigits(newDigits);
      } else if (index > 0) {
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
        profIdentifier.trim(),
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
        setProfStatus("Verification successful! Opening Dashboard...");
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

        {/* Centered Argent Your Branding */}
        <div className="flex flex-col items-center justify-center text-center mx-auto mb-1">
          <img
            src="/argent-logo.png"
            alt="Argent Your"
            className="h-12 w-12 rounded-2xl object-contain shadow-sm"
          />
          <p className="eyebrow mt-2 text-xs font-black tracking-widest text-emerald-800 uppercase">
            Argent Your
          </p>
        </div>

        {/* Account Type Selector: Customer vs Professional */}
        {!isOtp && !profOtpSession && !isForgot && profScreen !== "forgot" && (
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

            {profScreen === "forgot" ? (
              /* PROFESSIONAL FORGOT PASSWORD VIEW */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfScreen("login");
                      setProfError("");
                      setProfStatus("");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Professional Login</span>
                  </button>
                </div>

                {profResetStep === "request" ? (
                  /* Step 1: Identifier */
                  <form onSubmit={handleProfForgotRequest} className="space-y-3">
                    <label className="auth-field">
                      <span>Registered Mobile Number or Email</span>
                      <input
                        className="auth-input"
                        value={profResetIdentifier}
                        onChange={(e) => setProfResetIdentifier(e.target.value)}
                        placeholder="Enter your registered number or email"
                        required
                        autoFocus
                      />
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
                      className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {profLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Code and New Password */
                  <form onSubmit={handleProfResetSubmit} className="space-y-3">
                    <label className="auth-field">
                      <div className="flex items-center justify-between mb-1">
                        <span>6-Digit Verification Code</span>
                        <button
                          type="button"
                          disabled={profResetCooldown > 0 || profLoading}
                          onClick={handleProfResendReset}
                          className="text-[11px] text-emerald-700 hover:text-emerald-900 disabled:text-slate-400 font-semibold cursor-pointer"
                        >
                          {profResetCooldown > 0
                            ? `Resend in ${profResetCooldown}s`
                            : "Resend Code"}
                        </button>
                      </div>
                      <input
                        className="auth-input text-center tracking-widest text-lg font-mono font-bold"
                        maxLength={6}
                        value={profResetCode}
                        onChange={(e) =>
                          setProfResetCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="000000"
                        required
                        autoFocus
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Sent to {profResetMasked}
                      </span>
                    </label>

                    <label className="auth-field">
                      <span>New Password (min 6 characters)</span>
                      <div className="auth-password-wrap">
                        <input
                          className="auth-input"
                          value={profNewPassword}
                          onChange={(e) => setProfNewPassword(e.target.value)}
                          placeholder="Create new password"
                          type={profShowNewPassword ? "text" : "password"}
                          required
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setProfShowNewPassword(!profShowNewPassword)}
                        >
                          {profShowNewPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </label>

                    <label className="auth-field">
                      <span>Confirm New Password</span>
                      <div className="auth-password-wrap">
                        <input
                          className="auth-input"
                          value={profConfirmPassword}
                          onChange={(e) => setProfConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          type={profShowConfirmPassword ? "text" : "password"}
                          required
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setProfShowConfirmPassword(!profShowConfirmPassword)}
                        >
                          {profShowConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
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
                      className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {profLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <>
                          <span>Save New Password & Log In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* PROFESSIONAL LOGIN FORM */
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
                      placeholder="Enter your number or email"
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
                  <span>Password</span>
                  <div className="auth-password-wrap">
                    <input
                      className="auth-input"
                      value={profPassword}
                      onChange={(e) => setProfPassword(e.target.value)}
                      placeholder="Enter your password"
                      type={profShowPassword ? "text" : "password"}
                      autoComplete="current-password"
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

                {/* Clean Arrow-Style Action */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfError("");
                      setProfStatus("");
                      setProfResetIdentifier(profIdentifier.trim());
                      setProfResetStep("request");
                      setProfScreen("forgot");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors group cursor-pointer"
                  >
                    <span>Forgot Password?</span>
                    <span className="text-[11px] text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Reset Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
            )}

            {/* Create Professional Account Link */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">Don't have an account?</p>
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
                Create Professional Account
              </button>
            </div>
          </div>
        ) : isForgot ? (
          /* CUSTOMER FORGOT PASSWORD SCREEN */
          <div className="mt-1 text-left w-full animate-fade-in">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setScreen("login");
                  resetMessage();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-semibold mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Customer Login</span>
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block mb-0.5">
                CUSTOMER ACCOUNT RECOVERY
              </span>
              <h2 className="display-font text-2xl font-bold text-slate-950">
                Reset Password
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {custResetStep === "request"
                  ? "Enter your registered email address or mobile number to receive a 6-digit verification code."
                  : `Enter the 6-digit code sent to ${custResetMasked} and choose a new password.`}
              </p>
            </div>

            {custResetStep === "request" ? (
              <form onSubmit={handleCustomerForgotRequest} className="space-y-3">
                <label className="auth-field">
                  <span>Registered Mobile Number or Email</span>
                  <input
                    className="auth-input"
                    value={custResetIdentifier}
                    onChange={(e) => setCustResetIdentifier(e.target.value)}
                    placeholder="Enter your registered number or email"
                    required
                    autoFocus
                  />
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
                  disabled={custResetLoading}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {custResetLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomerResetSubmit} className="space-y-3">
                <label className="auth-field">
                  <div className="flex items-center justify-between mb-1">
                    <span>6-Digit Verification Code</span>
                    <button
                      type="button"
                      disabled={custResetCooldown > 0 || custResetLoading}
                      onClick={handleCustomerResendReset}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 disabled:text-slate-400 font-semibold cursor-pointer"
                    >
                      {custResetCooldown > 0
                        ? `Resend in ${custResetCooldown}s`
                        : "Resend Code"}
                    </button>
                  </div>
                  <input
                    className="auth-input text-center tracking-widest text-lg font-mono font-bold"
                    maxLength={6}
                    value={custResetCode}
                    onChange={(e) =>
                      setCustResetCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    required
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Sent to {custResetMasked}
                  </span>
                </label>

                <label className="auth-field">
                  <span>New Password (min 6 characters)</span>
                  <div className="auth-password-wrap">
                    <input
                      className="auth-input"
                      value={custNewPassword}
                      onChange={(e) => setCustNewPassword(e.target.value)}
                      placeholder="Create new password"
                      type={custShowNewPassword ? "text" : "password"}
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setCustShowNewPassword(!custShowNewPassword)}
                    >
                      {custShowNewPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>

                <label className="auth-field">
                  <span>Confirm New Password</span>
                  <div className="auth-password-wrap">
                    <input
                      className="auth-input"
                      value={custConfirmPassword}
                      onChange={(e) => setCustConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      type={custShowConfirmPassword ? "text" : "password"}
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setCustShowConfirmPassword(!custShowConfirmPassword)
                      }
                    >
                      {custShowConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
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
                  disabled={custResetLoading}
                  className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {custResetLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
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
                  {/* Clean Arrow-Style Action */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        resetMessage();
                        setCustResetIdentifier(loginValue.trim());
                        setCustResetStep("request");
                        setScreen("forgot");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors group cursor-pointer"
                    >
                      <span>Forgot Password?</span>
                      <span className="text-[11px] text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Reset Password</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
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
                  "Log in"
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
