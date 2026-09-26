import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import technicianStore from "../services/technicianStore";
import { useSocket } from "./SocketContext";

const TechnicianContext = createContext(null);

export const useTechnician = () => {
  const context = useContext(TechnicianContext);
  if (!context) {
    throw new Error("useTechnician must be used within a TechnicianProvider");
  }
  return context;
};

export function TechnicianProvider({ children, onLogout }) {
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [techProfile, setTechProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(
    technicianStore.getAvailability() === "ONLINE"
  );

  const [activeJobs, setActiveJobs] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [cancelledJobs, setCancelledJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    completedCount: 0,
    activeCount: 0,
    pendingCount: 0,
    rating: null,
    totalEarnings: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    pendingPayments: 0,
    availableBalance: 0,
    pendingBalance: 0,
    earningsFormatted: "₹0",
    todayEarningsFormatted: "₹0",
    weekEarningsFormatted: "₹0",
    pendingPaymentsFormatted: "₹0",
    availableBalanceFormatted: "₹0",
    pendingBalanceFormatted: "₹0",
  });
  const [bankAccount, setBankAccount] = useState({
    holderName: "",
    bankName: "",
    accountNumberMasked: "",
    ifsc: "",
    verificationStatus: "Not Connected",
    payoutStatus: "Active",
    isConnected: false,
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modals state
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [completeConfirmJob, setCompleteConfirmJob] = useState(null);
  const [declineConfirmJob, setDeclineConfirmJob] = useState(null);
  const [navigationJob, setNavigationJob] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form states
  const [bankFormData, setBankFormData] = useState({
    holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc: "",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [isSavingAreas, setIsSavingAreas] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    category: "Plumbing",
    experience_years: 3,
    skills: "",
    vehicle_type: "Rapid Response Van",
    avatar: "",
    service_areas: "Delhi NCR",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // File upload refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, message: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await technicianStore.getDashboardSummary();

      // Merge locally saved profile data so edits are never overwritten by server on reload
      let mergedTechnician = data.technician;
      try {
        const savedProfile = localStorage.getItem("argent_technician_profile");
        if (savedProfile) {
          const localProfile = JSON.parse(savedProfile);
          mergedTechnician = { ...data.technician, ...localProfile };
        }
      } catch { /* ignore */ }
      setTechProfile(mergedTechnician);

      // Sync online status: localStorage is the source of truth (prevents server lag from reverting)
      const savedOnline = localStorage.getItem("argent_technician_online");
      if (savedOnline === "OFFLINE" || savedOnline === "ONLINE") {
        setIsOnline(savedOnline === "ONLINE");
      } else {
        setIsOnline(data.availability === "ONLINE");
      }

      setActiveJobs(data.activeJobs || []);
      setNewRequests(data.newRequests || []);
      setUpcomingJobs(data.upcomingJobs || []);
      setCompletedJobs(data.completedJobs || []);
      setCancelledJobs(data.cancelledJobs || []);
      setReviews(data.reviews || []);
      if (data.metrics) setMetrics(data.metrics);
      if (data.bankAccount) setBankAccount(data.bankAccount);
      if (data.payoutHistory) setPayoutHistory(data.payoutHistory);
      if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error("Error loading technician dashboard:", err);
      const stored = technicianStore.getTechnician();
      if (stored) setTechProfile(stored);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const intervalId = setInterval(() => {
      loadDashboardData(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = () => {
      loadDashboardData(true);
    };

    socket.on("new_emergency_alert", handleJobUpdate);
    socket.on("request_updated", handleJobUpdate);

    return () => {
      socket.off("new_emergency_alert", handleJobUpdate);
      socket.off("request_updated", handleJobUpdate);
    };
  }, [socket]);

  const hasActiveJob = (activeJobs || []).some((j) =>
    ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "ASSIGNED"].includes(
      j.status
    )
  );

  const handleToggleOnline = async () => {
    if (hasActiveJob && isOnline) {
      showToast(
        "You have an active service. Complete the current service before going offline.",
        "error"
      );
      return;
    }
    const newStatus = isOnline ? "OFFLINE" : "ONLINE";
    const nextBool = newStatus === "ONLINE";
    // Optimistic update immediately so UI responds instantly
    setIsOnline(nextBool);
    localStorage.setItem("argent_technician_online", newStatus);
    try {
      await technicianStore.setAvailability(newStatus);
      showToast(
        newStatus === "ONLINE"
          ? "You are now ONLINE and ready to receive dispatches!"
          : "You are now OFFLINE. New requests will not be dispatched.",
        newStatus === "ONLINE" ? "success" : "info"
      );
      await loadDashboardData(true);
    } catch {
      // Revert optimistic update on failure
      setIsOnline(isOnline);
      localStorage.setItem("argent_technician_online", isOnline ? "ONLINE" : "OFFLINE");
      showToast("Failed to change availability status", "error");
    }
  };

  // Job Actions
  const handleAcceptJob = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.acceptJob(jobId);
      showToast("Job accepted! Preparing dispatch route...", "success");
      await loadDashboardData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to accept job", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineJob = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.declineJob(jobId);
      showToast("Job request declined and released back to queue.", "info");
      setDeclineConfirmJob(null);
      await loadDashboardData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to decline job", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartTrip = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "ON_THE_WAY");
      showToast("Trip started! In-transit tracking enabled.", "success");
      await loadDashboardData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to start trip", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArriveDoorstep = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "ARRIVED");
      showToast("Arrival confirmed at customer doorstep!", "success");
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to mark doorstep arrival",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartService = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "IN_PROGRESS");
      showToast("Service timer started! Job in progress.", "success");
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to start service",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteJob = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "COMPLETED");
      showToast("Service successfully completed! Earnings recorded.", "success");
      setCompleteConfirmJob(null);
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to complete service",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Notification actions
  const markAllNotificationsAsRead = async () => {
    try {
      await technicianStore.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: 0 })));
      showToast("All notifications marked as read", "success");
    } catch {
      showToast("Failed to mark notifications read", "error");
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: 0 } : n))
    );
  };

  // Profile and Photo Actions
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        await technicianStore.updateProfile({ avatar: base64Data });
        setTechProfile((prev) => ({ ...prev, avatar: base64Data }));
        setEditFormData((prev) => ({ ...prev, avatar: base64Data }));
        showToast("Profile updated successfully.", "success");
        await loadDashboardData(true);
      };
      reader.readAsDataURL(file);
    } catch {
      showToast("Failed to upload photo", "error");
    }
  };

  const updateAvatar = async (base64Data) => {
    try {
      await technicianStore.updateProfile({ avatar: base64Data });
      setTechProfile((prev) => ({ ...prev, avatar: base64Data }));
      setEditFormData((prev) => ({ ...prev, avatar: base64Data }));
      showToast("Profile updated successfully.", "success");
      await loadDashboardData(true);
    } catch {
      showToast("Failed to update profile picture", "error");
    }
  };

  const handleOpenEditProfile = () => {
    setEditFormData({
      name: techProfile?.name || "",
      phone: techProfile?.phone || "",
      email: techProfile?.email || "",
      category: techProfile?.category || "Plumbing",
      experience_years: techProfile?.experience_years || 3,
      skills: techProfile?.skills || "",
      vehicle_type: techProfile?.vehicle_type || "Rapid Response Van",
      avatar: techProfile?.avatar || "",
      bio: techProfile?.bio || "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones.",
      service_areas: techProfile?.service_areas || "Delhi NCR",
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingProfile(true);
    try {
      await technicianStore.updateProfile(editFormData);
      setTechProfile((prev) => ({ ...prev, ...editFormData }));
      showToast("Profile updated successfully.", "success");
      setShowEditProfile(false);
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to update profile",
        "error"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenBankModal = () => {
    setBankFormData({
      holder_name: bankAccount?.holderName || techProfile?.name || "",
      bank_name: bankAccount?.bankName || "",
      account_number: "",
      ifsc: bankAccount?.ifsc || "",
    });
    setShowBankModal(true);
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault();
    if (!bankFormData.holder_name.trim()) {
      showToast("Please enter account holder name", "error");
      return;
    }
    if (!bankFormData.bank_name.trim()) {
      showToast("Please enter bank name", "error");
      return;
    }
    if (
      !bankFormData.account_number.trim() ||
      bankFormData.account_number.trim().length < 8
    ) {
      showToast(
        "Please enter a valid bank account number (min 8 digits)",
        "error"
      );
      return;
    }
    if (!bankFormData.ifsc.trim() || bankFormData.ifsc.trim().length < 10) {
      showToast("Please enter a valid IFSC code (11 characters)", "error");
      return;
    }

    setIsSavingBank(true);
    try {
      await technicianStore.connectBankAccount(bankFormData);
      showToast(
        "Bank account connected and verified for instant payouts!",
        "success"
      );
      setShowBankModal(false);
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to connect bank account",
        "error"
      );
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      showToast("Please enter a valid payout withdrawal amount", "error");
      return;
    }
    if (amountNum > (metrics.availableBalance || 0)) {
      showToast(
        `Requested amount exceeds available balance of ₹${(metrics.availableBalance || 0).toLocaleString("en-IN")}`,
        "error"
      );
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await technicianStore.requestPayout(amountNum);
      showToast(
        res.message || "Payout request submitted successfully!",
        "success"
      );
      setShowPayoutModal(false);
      setPayoutAmount("");
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to request payout",
        "error"
      );
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleToggleServiceArea = async (areaName) => {
    const currentAreas = (techProfile?.service_areas || "Delhi NCR")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let updated;
    if (currentAreas.includes(areaName)) {
      if (currentAreas.length === 1) {
        showToast(
          "At least one operational service area must remain active.",
          "error"
        );
        return;
      }
      updated = currentAreas.filter((a) => a !== areaName);
    } else {
      updated = [...currentAreas, areaName];
    }
    const joined = updated.join(", ");

    setIsSavingAreas(true);
    try {
      await technicianStore.updateProfile({ service_areas: joined });
      showToast(`Service areas updated: ${joined}`, "success");
      await loadDashboardData(true);
    } catch {
      showToast("Failed to update service areas", "error");
    } finally {
      setIsSavingAreas(false);
    }
  };

  const handleLogoutClick = () => {
    technicianStore.logout();
    if (onLogout) {
      onLogout();
    } else {
      window.location.assign("/technician/login");
    }
  };

  const unreadNotificationsCount = (notifications || []).filter(
    (n) => n.unread
  ).length;

  const techFirstName = techProfile?.name
    ? techProfile.name.split(" ")[0]
    : "Professional";

  const value = {
    loading,
    refreshing,
    techProfile,
    setTechProfile,
    techFirstName,
    isOnline,
    hasActiveJob,
    handleToggleOnline,
    activeJobs,
    newRequests,
    upcomingJobs,
    completedJobs,
    cancelledJobs,
    reviews,
    metrics,
    bankAccount,
    payoutHistory,
    recentTransactions,
    notifications,
    unreadNotificationsCount,
    actionLoadingId,
    toastMessage,
    showToast,
    loadDashboardData,

    // Actions
    handleAcceptJob,
    handleDeclineJob,
    handleStartTrip,
    handleArriveDoorstep,
    handleStartService,
    handleCompleteJob,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    handlePhotoFileChange,
    updateAvatar,
    handleLogoutClick,

    // Modals
    selectedJobForModal,
    setSelectedJobForModal,
    openJobDetails: (job) => setSelectedJobForModal(job),
    closeJobDetails: () => setSelectedJobForModal(null),
    completeConfirmJob,
    setCompleteConfirmJob,
    declineConfirmJob,
    setDeclineConfirmJob,
    navigationJob,
    setNavigationJob,
    handleOpenMap: (job) => setNavigationJob(job),
    closeMap: () => setNavigationJob(null),

    // Profile & Bank Modals
    showBankModal,
    setShowBankModal,
    bankFormData,
    setBankFormData,
    isSavingBank,
    handleOpenBankModal,
    handleSaveBankAccount,
    showPayoutModal,
    setShowPayoutModal,
    payoutAmount,
    setPayoutAmount,
    isSubmittingPayout,
    handleRequestPayout,
    showEditProfile,
    setShowEditProfile,
    editFormData,
    setEditFormData,
    isSavingProfile,
    handleOpenEditProfile,
    handleSaveProfile,
    isSavingAreas,
    handleToggleServiceArea,

    // Refs
    fileInputRef,
    cameraInputRef,
  };

  return (
    <TechnicianContext.Provider value={value}>
      {children}
    </TechnicianContext.Provider>
  );
}

export default TechnicianContext;
