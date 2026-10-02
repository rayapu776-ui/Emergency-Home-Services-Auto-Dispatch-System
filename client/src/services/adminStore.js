import axios from "axios";

const TOKEN_KEY = "argent_admin_token";
const USER_KEY = "argent_admin_user";

const readStoredValue = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

const adminApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

adminApi.interceptors.request.use((config) => {
  const token = readStoredValue(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("argent:session-changed"));
};

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 && error.config?.url === "/auth/admin/me")
    ) {
      clearSession();
    }
    return Promise.reject(error);
  },
);

const adminStore = {
  api: adminApi,
  getToken: () => readStoredValue(TOKEN_KEY),
  getUser() {
    try {
      const user = readStoredValue(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  async login(email, password, rememberMe) {
    const { data } = await adminApi.post("/auth/admin/login", {
      email,
      password,
      rememberMe,
    });
    clearSession();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new Event("argent:session-changed"));
    return data.user;
  },
  async validateSession() {
    const { data } = await adminApi.get("/auth/admin/me");
    const storage = localStorage.getItem(TOKEN_KEY)
      ? localStorage
      : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },
  async requestPasswordReset(email) {
    const { data } = await adminApi.post("/auth/admin/forgot-password", {
      email,
    });
    return data;
  },
  async resetPassword({
    tempSessionToken,
    code,
    newPassword,
    confirmPassword,
  }) {
    const { data } = await adminApi.post("/auth/admin/reset-password", {
      tempSessionToken,
      code,
      newPassword,
      confirmPassword,
    });
    return data;
  },
  async logout() {
    try {
      if (this.getToken()) await adminApi.post("/auth/admin/logout");
    } catch (error) {
      console.error("Admin server logout failed:", error);
    } finally {
      clearSession();
    }
  },
};

export default adminStore;
