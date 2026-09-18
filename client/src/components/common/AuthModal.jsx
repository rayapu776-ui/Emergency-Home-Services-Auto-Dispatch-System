import {
  Apple,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  Phone,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^[+\d][\d\s()-]{7,}$/.test(value);

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
  const { login, register, demoLogin } = useAuth();
  const [screen, setScreen] = useState("login");
  const [method, setMethod] = useState("email");
  const [loginValue, setLoginValue] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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
  const submitLogin = async (event) => {
    event.preventDefault();
    resetMessage();
    if (method === "email" && !isEmail(loginValue))
      return setError("Enter a valid email address.");
    if (method === "phone" && !isPhone(loginValue))
      return setError("Enter a valid phone number.");
    setStatus("Signing you in...");
    try {
      if (method === "email") await login(loginValue, loginPassword);
      else await demoLogin("customer");
      setStatus("Signed in successfully");
      if (onSuccess) onSuccess();
      window.setTimeout(onClose, 300);
    } catch (err) {
      setStatus("");
      setError(
        err.response?.data?.error ||
          "We could not sign you in. Please try again.",
      );
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
        <h2 id="auth-title" className="display-font mt-2 text-3xl">
          {isSignup ? "Create your Argent Your account" : "Log in or Sign up"}
        </h2>
        {!isSignup && (
          <p className="auth-subtitle">
            Sign in to your Argent Your account and manage your services,
            bookings and preferences.
          </p>
        )}
        {!isSignup && (
          <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
            <button
              type="button"
              role="tab"
              aria-selected={method === "email"}
              onClick={() => {
                setMethod("email");
                resetMessage();
              }}
              className={method === "email" ? "is-active" : ""}
            >
              <Mail /> Email address
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === "phone"}
              onClick={() => {
                setMethod("phone");
                resetMessage();
              }}
              className={method === "phone" ? "is-active" : ""}
            >
              <Phone /> Phone number
            </button>
          </div>
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
              <label className="auth-field">
                <span>
                  {method === "email" ? "Email Address" : "Phone Number"}
                </span>
                <input
                  className="auth-input"
                  value={loginValue}
                  onChange={(event) => setLoginValue(event.target.value)}
                  placeholder={
                    method === "email"
                      ? "Enter your email address"
                      : "Enter your phone number"
                  }
                  type={method === "email" ? "email" : "tel"}
                  autoComplete={method === "email" ? "email" : "tel"}
                  required
                />
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
      </section>
    </div>
  );
}
