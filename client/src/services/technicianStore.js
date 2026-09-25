import axios from "axios";

const TECH_TOKEN_KEY = "argent_technician_token";
const TECH_USER_KEY = "argent_technician_user";
const TECH_ONLINE_KEY = "argent_technician_online";

// Separate axios instance with technician authorization interceptor
const techApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

techApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TECH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

techApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TECH_TOKEN_KEY);
      localStorage.removeItem(TECH_USER_KEY);
    }
    return Promise.reject(error);
  },
);

class TechnicianStore {
  getToken() {
    return localStorage.getItem(TECH_TOKEN_KEY);
  }

  getTechnician() {
    try {
      const data = localStorage.getItem(TECH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!this.getToken() && !!this.getTechnician();
  }

  getAvailability() {
    const saved = localStorage.getItem(TECH_ONLINE_KEY);
    return saved === "OFFLINE" ? "OFFLINE" : "ONLINE";
  }

  async setAvailability(status) {
    const isOnline = status === "ONLINE";
    localStorage.setItem(TECH_ONLINE_KEY, isOnline ? "ONLINE" : "OFFLINE");
    try {
      await techApi.put("/technicians/availability", { is_online: isOnline });
    } catch (err) {
      console.warn("Failed to sync availability to server:", err);
    }
    return isOnline ? "ONLINE" : "OFFLINE";
  }

  // Alias for setAvailability — both names work
  async toggleAvailability(status) {
    return this.setAvailability(status);
  }

  saveSession(token, user) {
    localStorage.setItem(TECH_TOKEN_KEY, token);
    localStorage.setItem(TECH_USER_KEY, JSON.stringify(user));
    if (user.technician && user.technician.is_online !== undefined) {
      localStorage.setItem(
        TECH_ONLINE_KEY,
        user.technician.is_online ? "ONLINE" : "OFFLINE",
      );
    }
  }

  logout() {
    localStorage.removeItem(TECH_TOKEN_KEY);
    localStorage.removeItem(TECH_USER_KEY);
    localStorage.removeItem(TECH_ONLINE_KEY);
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if sessionStorage is disabled
    }
  }

  async login(identifier, password) {
    const res = await techApi.post("/professional/auth/login", {
      identifier,
      password,
    });
    if (res.data.token && res.data.user) {
      this.saveSession(res.data.token, res.data.user);
    }
    return res.data;
  }

  async sendOtp(identifier, password) {
    const channel = identifier.includes("@") ? "email" : "sms";
    const res = await techApi.post("/professional/auth/send-otp", {
      identifier,
      channel,
      ...(password ? { password } : {}),
    });
    return res.data;
  }

  async sendCode(identifier, password) {
    const res = await techApi.post("/auth/send-code", {
      identifier,
      role: "professional",
      ...(password ? { password } : {}),
    });
    return res.data;
  }

  async verifyOtp(tempSessionToken, otp, identifier) {
    const res = await techApi.post("/professional/auth/verify-otp", {
      tempSessionToken,
      otp,
      ...(identifier ? { identifier } : {}),
    });
    if (res.data.token && res.data.user) {
      this.saveSession(res.data.token, res.data.user);
    }
    return res.data;
  }

  async verifyCode(code, identifier, tempSessionToken) {
    const res = await techApi.post("/auth/verify-code", {
      code,
      identifier,
      role: "professional",
      ...(tempSessionToken ? { tempSessionToken } : {}),
    });
    if (res.data.token && res.data.user) {
      this.saveSession(res.data.token, res.data.user);
    }
    return res.data;
  }

  async resendOtp(tempSessionToken, identifier) {
    const res = await techApi.post("/professional/auth/resend-otp", {
      tempSessionToken,
      ...(identifier ? { identifier } : {}),
    });
    return res.data;
  }

  async resendCode(identifier, tempSessionToken) {
    const res = await techApi.post("/auth/resend-code", {
      identifier,
      role: "professional",
      ...(tempSessionToken ? { tempSessionToken } : {}),
    });
    return res.data;
  }

  async markNotificationRead(notificationId) {
    const res = await techApi.put(
      `/technicians/notifications/${notificationId}/read`,
    );
    return res.data;
  }

  async getDashboardSummary() {
    const res = await techApi.get("/technicians/dashboard-summary");
    return res.data;
  }

  async acceptJob(jobId) {
    const res = await techApi.post(`/technicians/jobs/${jobId}/accept`);
    return res.data;
  }

  async rejectJob(jobId, reason) {
    const res = await techApi.post(`/technicians/jobs/${jobId}/reject`, {
      reason,
    });
    return res.data;
  }

  async updateJobStatus(jobId, newStatus, coords = {}) {
    const res = await techApi.post(`/technicians/jobs/${jobId}/status`, {
      newStatus,
      ...coords,
    });
    return res.data;
  }

  async completeJob(jobId) {
    const res = await techApi.post(`/technicians/jobs/${jobId}/complete`);
    return res.data;
  }

  async registerTechnician(formData) {
    const res = await techApi.post("/auth/register-technician", formData);
    return res.data;
  }

  async updateVerificationStatus(techId, status, verification_notes) {
    const res = await techApi.put(
      `/technicians/${techId}/verification-status`,
      {
        status,
        verification_notes,
      },
    );
    return res.data;
  }

  async updateLocation(latitude, longitude) {
    const res = await techApi.put("/technicians/location", {
      latitude,
      longitude,
    });
    return res.data;
  }

  async updateProfile(profileData) {
    let resData = null;
    try {
      const res = await techApi.put("/technicians/profile", profileData);
      resData = res.data;
    } catch (err) {
      console.warn("API profile update note:", err);
    }
    const current = this.getTechnician() || {};
    const updated = {
      ...current,
      ...profileData,
      technician: {
        ...(current.technician || {}),
        ...profileData,
      },
    };
    if (resData?.user) {
      this.saveSession(this.getToken(), resData.user);
    } else {
      localStorage.setItem(TECH_USER_KEY, JSON.stringify(updated));
    }
    return resData || { user: updated };
  }

  async connectBankAccount(bankData) {
    const res = await techApi.post("/technicians/bank-account", bankData);
    return res.data;
  }

  async requestPayout(amount) {
    const res = await techApi.post("/technicians/payouts/request", { amount });
    return res.data;
  }

  async markNotificationsRead() {
    const res = await techApi.put("/technicians/notifications/read-all");
    return res.data;
  }
}

export const technicianStore = new TechnicianStore();
export default technicianStore;
