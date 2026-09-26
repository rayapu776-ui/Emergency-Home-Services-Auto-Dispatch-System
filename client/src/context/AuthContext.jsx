import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("emergency_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem("emergency_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("emergency_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginStep1 = async (identifier, password) => {
    const res = await api.post("/auth/login-step1", { identifier, password });
    return res.data;
  };

  const sendCode = async (identifier, role = "customer", password = null) => {
    const res = await api.post("/auth/send-code", {
      identifier,
      role,
      ...(password ? { password } : {}),
    });
    return res.data;
  };

  const verifyOtp = async (tempSessionToken, otp) => {
    const res = await api.post("/auth/verify-otp", { tempSessionToken, otp });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("emergency_token", newToken);
    localStorage.setItem("emergency_user", JSON.stringify(newUser));
    return newUser;
  };

  const verifyCode = async (
    identifier,
    code,
    tempSessionToken = null,
    role = "customer",
  ) => {
    const res = await api.post("/auth/verify-code", {
      identifier,
      code,
      role,
      ...(tempSessionToken ? { tempSessionToken } : {}),
    });
    const { token: newToken, user: newUser } = res.data;
    if (newToken && newUser) {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("emergency_token", newToken);
      localStorage.setItem("emergency_user", JSON.stringify(newUser));
    }
    return res.data;
  };

  const resendOtp = async (tempSessionToken) => {
    const res = await api.post("/auth/resend-otp", { tempSessionToken });
    return res.data;
  };

  const resendCode = async (
    identifier,
    tempSessionToken = null,
    role = "customer",
  ) => {
    const res = await api.post("/auth/resend-code", {
      identifier,
      role,
      ...(tempSessionToken ? { tempSessionToken } : {}),
    });
    return res.data;
  };

  const login = async (identifier, password) => {
    const res = await api.post("/auth/login", { identifier, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("emergency_token", newToken);
    localStorage.setItem("emergency_user", JSON.stringify(newUser));
    return newUser;
  };

  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("emergency_token", newToken);
    localStorage.setItem("emergency_user", JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("emergency_token");
    localStorage.removeItem("emergency_user");
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("emergency_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        loginStep1,
        sendCode,
        verifyOtp,
        verifyCode,
        resendOtp,
        resendCode,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
