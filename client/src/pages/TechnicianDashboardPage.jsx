import React, { useEffect, useState, useRef } from "react";
import {
  Wrench,
  Power,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Star,
  ExternalLink,
  ChevronRight,
  LogOut,
  RefreshCw,
  User,
  ShieldCheck,
  Check,
  XCircle,
  Bell,
  TrendingUp,
  Pencil,
  DollarSign,
  Filter,
  Mail,
  X,
  Building2,
  CreditCard,
  ArrowDownToLine,
  Globe,
  History,
  Sparkles,
  Shield,
  FileText,
  CheckCircle,
} from "lucide-react";
import technicianStore from "../services/technicianStore";
import { useSocket } from "../context/SocketContext";
import TechnicianJobDetailsModal from "../components/common/TechnicianJobDetailsModal";

export default function TechnicianDashboardPage({ onLogout, onBackToHome }) {
  const { socket, joinRoom } = useSocket();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [techProfile, setTechProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(
    technicianStore.getAvailability() === "ONLINE",
  );
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'requests' | 'active' | 'upcoming' | 'completed' | 'earnings' | 'payout_setup' | 'notifications' | 'service_areas' | 'reviews' | 'profile'

  // Data lists from backend
  const [activeJobs, setActiveJobs] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [cancelledJobs, setCancelledJobs] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all"); // 'all' | 'completed' | 'cancelled'
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    completedCount: 0,
    activeCount: 0,
    pendingCount: 0,
    rating: "4.9",
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
  const [reviews, setReviews] = useState([]);
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
  const [isMarkingNotifications, setIsMarkingNotifications] = useState(false);

  // Bank Setup Modal State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc: "",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  // Payout Request Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Service Areas State
  const [isSavingAreas, setIsSavingAreas] = useState(false);

  // Edit Profile Modal State
  const [showEditProfile, setShowEditProfile] = useState(false);
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

  // Modals
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [completeConfirmJob, setCompleteConfirmJob] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenEditProfile = () => {
    setEditFormData({
      name: techProfile?.name || "",
      phone: techProfile?.phone || "",
      category: techProfile?.category || "Plumbing",
      experience_years: techProfile?.experience_years || 3,
      skills: techProfile?.skills || "",
      vehicle_type: techProfile?.vehicle_type || "Rapid Response Van",
      avatar: techProfile?.avatar || "",
      service_areas: techProfile?.service_areas || "Delhi NCR",
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await technicianStore.updateProfile(editFormData);
      showToast("Professional profile updated successfully!", "success");
      setShowEditProfile(false);
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to update profile",
        "error",
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
        "error",
      );
      return;
    }
    if (!bankFormData.ifsc.trim() || bankFormData.ifsc.trim().length < 10) {
      showToast("Please enter a valid IFSC code (11 characters)", "error");
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await technicianStore.connectBankAccount(bankFormData);
      showToast(
        "Bank account connected and verified for instant payouts!",
        "success",
      );
      setShowBankModal(false);
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to connect bank account",
        "error",
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
        "error",
      );
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await technicianStore.requestPayout(amountNum);
      showToast(
        res.message || "Payout request submitted successfully!",
        "success",
      );
      setShowPayoutModal(false);
      setPayoutAmount("");
      await loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to request payout",
        "error",
      );
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setIsMarkingNotifications(true);
    try {
      await technicianStore.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: 0 })));
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark notifications read", "error");
    } finally {
      setIsMarkingNotifications(false);
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
          "error",
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
    } catch (err) {
      showToast("Failed to update service areas", "error");
    } finally {
      setIsSavingAreas(false);
    }
  };

  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await technicianStore.getDashboardSummary();
      setTechProfile(data.technician);
      setIsOnline(data.availability === "ONLINE");
      setActiveJobs(data.activeJobs || []);
      setNewRequests(data.newRequests || []);
      setUpcomingJobs(data.upcomingJobs || []);
      setCompletedJobs(data.completedJobs || []);
      setCancelledJobs(data.cancelledJobs || []);
      setReviews(data.reviews || []);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      if (data.bankAccount) {
        setBankAccount(data.bankAccount);
      }
      if (data.payoutHistory) {
        setPayoutHistory(data.payoutHistory);
      }
      if (data.recentTransactions) {
        setRecentTransactions(data.recentTransactions);
      }
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error loading technician dashboard:", err);
      // Fallback to stored profile if offline or network error
      const stored = technicianStore.getTechnician();
      if (stored) setTechProfile(stored);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen to realtime socket events for incoming jobs or updates
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

  // Handle Availability Toggle (ONLINE / OFFLINE)
  const handleToggleOnline = async () => {
    if (!isOnline && techProfile?.status && techProfile.status !== "Approved") {
      showToast(
        `Cannot go ONLINE. Your account status is '${techProfile.status}'. Only Approved technicians can go online and receive customer jobs.`,
        "error",
      );
      return;
    }

    const nextStatus = isOnline ? "OFFLINE" : "ONLINE";
    try {
      await technicianStore.setAvailability(nextStatus);
      setIsOnline(!isOnline);
      showToast(
        nextStatus === "ONLINE"
          ? "You are now ONLINE and ready to receive job requests."
          : "You are now OFFLINE. New job requests paused.",
        nextStatus === "ONLINE" ? "success" : "info",
      );
      // Refresh to update new requests availability
      loadDashboardData(true);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to update availability",
        "error",
      );
    }
  };

  // Simulate Operations Approval for testing
  const handleSimulateAdminApproval = async () => {
    if (!techProfile?.id) return;
    try {
      await technicianStore.updateVerificationStatus(
        techProfile.id,
        "Approved",
        "Approved by operations review",
      );
      showToast(
        "Technician account Approved! You can now switch ONLINE.",
        "success",
      );
      await loadDashboardData(true);
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  // Accept a Job
  const handleAcceptJob = async (jobId) => {
    if (!isOnline) {
      showToast("Please switch to ONLINE to accept job requests.", "error");
      return;
    }

    setActionLoadingId(jobId);
    try {
      const res = await technicianStore.acceptJob(jobId);
      showToast("Job accepted! Moved to Active Jobs.", "success");
      setSelectedJobForModal(null);
      setActiveTab("active");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Accept job error:", err);
      showToast(err.response?.data?.error || "Failed to accept job", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject a Job
  const handleRejectJob = async (jobId, reason) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.rejectJob(jobId, reason);
      showToast("Job request declined.", "info");
      setSelectedJobForModal(null);
      await loadDashboardData(true);
    } catch (err) {
      console.error("Reject job error:", err);
      showToast("Failed to decline job", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Progress Job Status (Sequential Flow)
  const handleStatusTransition = async (jobId, nextStatus, label) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, nextStatus);
      showToast(`Status updated: ${label}`, "success");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Status progression error:", err);
      showToast(
        err.response?.data?.error || "Failed to update status",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm and Complete Job
  const handleCompleteJob = async () => {
    if (!completeConfirmJob) return;
    const jobId = completeConfirmJob.id;
    setActionLoadingId(jobId);
    try {
      await technicianStore.completeJob(jobId);
      showToast(
        `Job #${jobId} completed successfully! Earnings logged.`,
        "success",
      );
      setCompleteConfirmJob(null);
      setActiveTab("completed");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Complete job error:", err);
      showToast("Failed to mark job as complete", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Logout
  const handleLogoutClick = () => {
    technicianStore.logout();
    if (onLogout) {
      onLogout();
    } else {
      window.location.assign("/technician/login");
    }
  };

  const unreadNotificationsCount = (notifications || []).filter(
    (n) => n.unread === 1 || n.unread === true,
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f3] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xl animate-pulse">
          <Wrench className="w-6 h-6" />
        </div>
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
          Connecting to Technician Dispatch...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-900 selection:bg-emerald-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold ${
              toastMessage.type === "error"
                ? "bg-red-600 text-white"
                : toastMessage.type === "info"
                  ? "bg-slate-800 text-white"
                  : "bg-emerald-700 text-white"
            }`}
          >
            {toastMessage.type === "error" ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-700/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                Argent Your
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Partner
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Technician Operations Portal
            </p>
          </div>
        </div>

        {/* Right Actions: Refresh, Home, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Customer Home</span>
            </button>
          )}

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Sign out of technician session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Profile & Availability Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  techProfile?.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                }
                alt={techProfile?.name || "Technician"}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {techProfile?.name || "Certified Technician"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {techProfile?.category || "Plumbing"} Specialist
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {techProfile?.experience_years || 3}+ Yrs Exp
                </span>
                {techProfile?.status === "Pending Verification" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                    <span>Pending Verification</span>
                  </span>
                ) : techProfile?.status === "Approved" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>Approved Partner</span>
                  </span>
                ) : techProfile?.status === "Rejected" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                    Application Rejected
                  </span>
                ) : techProfile?.status === "Suspended" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                    Account Suspended
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Phone: {techProfile?.phone || "+91 98101 11223"} • Email:{" "}
                {techProfile?.email || "partner@argentyour.com"} • Vehicle:{" "}
                {techProfile?.vehicle_type || "Rapid Response Van"}
              </p>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs mt-2 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* ONLINE / OFFLINE Switcher */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 w-full md:w-auto justify-between md:justify-end">
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Availability Status
              </p>
              <p
                className={`text-xs font-black ${
                  techProfile?.status && techProfile.status !== "Approved"
                    ? "text-amber-800"
                    : isOnline
                      ? "text-emerald-700"
                      : "text-slate-500"
                }`}
              >
                {techProfile?.status && techProfile.status !== "Approved"
                  ? `LOCKED (${techProfile.status.toUpperCase()})`
                  : isOnline
                    ? "ONLINE — RECEIVING JOBS"
                    : "OFFLINE — PAUSED"}
              </p>
            </div>

            <button
              onClick={handleToggleOnline}
              disabled={
                !isOnline &&
                techProfile?.status &&
                techProfile.status !== "Approved"
              }
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-2 ${
                techProfile?.status && techProfile.status !== "Approved"
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : isOnline
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              }`}
              title={
                techProfile?.status && techProfile.status !== "Approved"
                  ? `Cannot go ONLINE. Account status is '${techProfile.status}'`
                  : isOnline
                    ? "Go Offline"
                    : "Go Online"
              }
            >
              <Power className="w-4 h-4" />
              <span>
                {techProfile?.status && techProfile.status !== "Approved"
                  ? "Pending Approval"
                  : isOnline
                    ? "Switch to Offline"
                    : "Switch to Online"}
              </span>
            </button>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {techProfile?.status === "Pending Verification" && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                    Account Status: Pending Verification
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                    Review In Progress
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
                  Your technician credentials and trade details are currently
                  under review by our partner onboarding team. Only{" "}
                  <strong>Approved</strong> professionals can switch{" "}
                  <strong>ONLINE</strong> and receive real-time emergency
                  customer bookings.
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateAdminApproval}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              title="Test evaluation: simulate approval to test online dispatch flow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Admin Approval</span>
            </button>
          </div>
        )}

        {techProfile?.status === "Rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-xs flex items-center gap-3 text-red-900 text-xs animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p>
              <strong>Application Status: Rejected.</strong> Your partner
              application was not approved. Please contact operations support at{" "}
              <strong>+91 98101 11223</strong> for guidance.
            </p>
          </div>
        )}

        {techProfile?.status === "Suspended" && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-xs flex items-center gap-3 text-red-900 text-xs animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p>
              <strong>Account Status: Suspended.</strong> Your technician
              account has been temporarily suspended by operations dispatch.
              Contact partner desk for reinstatement.
            </p>
          </div>
        )}

        {/* Real Metrics Cards: Today's Earnings, This Week's, Total, Completed Jobs, Pending Payments, Rating */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Today's Earnings */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Today's Earnings
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1.5">
              {metrics.todayEarningsFormatted}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Completed today
            </p>
          </div>

          {/* 2. This Week's Earnings */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                This Week's
              </span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              {metrics.weekEarningsFormatted || metrics.earningsFormatted}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              Last 7 days
            </p>
          </div>

          {/* 3. Total Earnings */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Total Earnings
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              {metrics.earningsFormatted}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              All-time payouts
            </p>
          </div>

          {/* 4. Completed Jobs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Completed Jobs
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              {metrics.completedCount || metrics.totalJobs}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Verified orders
            </p>
          </div>

          {/* 5. Pending Payments */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Pending Payments
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-800 mt-1.5">
              {metrics.pendingPaymentsFormatted || "₹0"}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Active in transit
            </p>
          </div>

          {/* 6. Customer Rating */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Rating
              </span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-1">
              {metrics.rating}
              <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Customer score
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "overview"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "requests"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Job Requests</span>
            {newRequests.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "requests"
                    ? "bg-white text-emerald-900"
                    : "bg-red-500 text-white animate-pulse"
                }`}
              >
                {newRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "active"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Active Jobs</span>
            {activeJobs.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "active"
                    ? "bg-white text-emerald-900"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {activeJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "upcoming"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming</span>
            {upcomingJobs.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "upcoming"
                    ? "bg-white text-emerald-900"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {upcomingJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "completed"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            {(completedJobs.length > 0 || cancelledJobs.length > 0) && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "completed"
                    ? "bg-white text-emerald-900"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {completedJobs.length + cancelledJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "earnings"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Earnings & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab("payout_setup")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "payout_setup"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bank & Payout Setup</span>
            {!bankAccount.isConnected && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "notifications"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "notifications"
                    ? "bg-white text-emerald-900"
                    : "bg-red-500 text-white"
                }`}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("service_areas")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "service_areas"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Service Areas</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "reviews"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reviews</span>
            {reviews.length > 0 && (
              <span className="text-[10px] text-amber-500 font-bold">
                ({reviews.length})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "profile"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 0: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Dispatch Status */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dispatch Status
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isOnline
                      ? "Ready for Emergency Dispatches"
                      : "Offline / On Break"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isOnline
                      ? `Receiving requests across ${techProfile?.service_areas || "Delhi NCR"}`
                      : "Switch Online to begin receiving incoming customer jobs"}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-600 font-semibold">
                    {newRequests.length} Pending Request
                    {newRequests.length === 1 ? "" : "s"}
                  </span>
                  <button
                    onClick={() => setActiveTab("requests")}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Requests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Available Payout Balance */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Available Balance
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">
                    {metrics.availableBalanceFormatted || "₹0"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pending In-Transit:{" "}
                    {metrics.pendingBalanceFormatted || "₹0"}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {bankAccount.isConnected
                      ? bankAccount.bankName
                      : "No Bank Added"}
                  </span>
                  <button
                    onClick={() => {
                      if (!bankAccount.isConnected) {
                        handleOpenBankModal();
                      } else {
                        setShowPayoutModal(true);
                      }
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {bankAccount.isConnected
                        ? "Withdraw Payout"
                        : "Setup Bank"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: Account Verification & Type */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Partner Classification
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">
                      {techProfile?.account_type === "company"
                        ? techProfile.company_name || "Service Company"
                        : "Individual Partner"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {techProfile?.account_type === "company"
                        ? "Business"
                        : "Solo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Coverage: {techProfile?.service_areas || "Delhi NCR"}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-semibold text-emerald-700">
                    ★ {metrics.rating} Customer Rating
                  </span>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Job Alert Banner (if working on an order) */}
            {activeJobs.length > 0 && (
              <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                      Active In Progress
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      Order #{activeJobs[0].id}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {activeJobs[0].service_name || activeJobs[0].category}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">
                      {activeJobs[0].address}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("active")}
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Active Job ({activeJobs[0].status})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab("requests")}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <Clock className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">
                  Job Requests
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {newRequests.length} pending orders
                </p>
              </button>

              <button
                onClick={() => setActiveTab("earnings")}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <DollarSign className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">
                  Earnings & Payouts
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {metrics.availableBalanceFormatted} ready
                </p>
              </button>

              <button
                onClick={() => setActiveTab("payout_setup")}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <CreditCard className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">Bank Setup</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {bankAccount.isConnected
                    ? "Verified & Active"
                    : "Connect account"}
                </p>
              </button>

              <button
                onClick={() => setActiveTab("service_areas")}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <Globe className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">
                  Service Areas
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage coverage zones
                </p>
              </button>
            </div>

            {/* Recent Notifications & Activity Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Latest Activity */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Recent Completed Jobs</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {completedJobs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No completed jobs yet. Fulfill dispatches to build job
                    records.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {completedJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {job.service_name || job.category}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {job.customer_name || "Customer"} •{" "}
                            {job.address?.slice(0, 30)}...
                          </p>
                        </div>
                        <span className="font-black text-emerald-700">
                          {job.total_paid || job.price || "₹499"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Notifications Preview */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Recent Notifications</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No notifications at this time.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {notifications.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          n.unread
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {n.description || n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {n.created_at
                            ? new Date(n.created_at).toLocaleDateString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "Just now"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ACTIVE JOBS */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No Active Jobs In Progress
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isOnline
                    ? "You have no active bookings right now. Check the 'New Requests' tab to accept incoming emergency orders."
                    : "You are currently OFFLINE. Switch to ONLINE above to receive job dispatches."}
                </p>
                {isOnline && newRequests.length > 0 && (
                  <button
                    onClick={() => setActiveTab("requests")}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
                  >
                    <span>View {newRequests.length} Available Requests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              activeJobs.map((job) => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  job.address || "Customer Location",
                )}`;
                const telUrl = `tel:${job.customer_phone || "+919810111223"}`;
                const smsUrl = `sms:${job.customer_phone || "+919810111223"}`;

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-600/60 shadow-lg space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {job.status}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            Order #{job.id}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                          {job.service_name || job.category}
                        </h2>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700">
                          {job.total_paid || job.price || "₹499"}
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {job.payment_method || "UPI / Online"}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: Customer & Address */}
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Customer
                            </p>
                            <p className="font-bold text-slate-800 text-sm">
                              {job.customer_name || "Verified Customer"}
                            </p>
                            <p className="text-slate-500 font-medium">
                              {job.customer_phone || "+91 98101 11223"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 pt-1">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Customer Address
                            </p>
                            <p className="font-bold text-slate-800 leading-snug">
                              {job.address}
                            </p>
                          </div>
                        </div>

                        {job.description && (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic text-slate-600 mt-1">
                            "{job.description}"
                          </div>
                        )}
                      </div>

                      {/* Right: Real Navigation & Communications */}
                      <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Direct Navigation & Contact
                          </p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Connect with customer using verified order details
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-[11px] transition-all hover:bg-emerald-50 text-center"
                          >
                            <Navigation className="w-4 h-4 text-blue-600 mb-1" />
                            <span>Open Maps</span>
                          </a>

                          <a
                            href={telUrl}
                            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-[11px] transition-all hover:bg-emerald-50 text-center"
                          >
                            <Phone className="w-4 h-4 text-emerald-600 mb-1" />
                            <span>Call</span>
                          </a>

                          <a
                            href={smsUrl}
                            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-[11px] transition-all hover:bg-emerald-50 text-center"
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-600 mb-1" />
                            <span>SMS</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Status Flow */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        Job Workflow Stage:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Step 1: Start Trip */}
                        <button
                          onClick={() =>
                            handleStatusTransition(
                              job.id,
                              "ON_THE_WAY",
                              "Technician On the Way",
                            )
                          }
                          disabled={
                            job.status !== "ACCEPTED" ||
                            actionLoadingId === job.id
                          }
                          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            job.status === "ACCEPTED"
                              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md animate-pulse"
                              : [
                                    "ON_THE_WAY",
                                    "ARRIVED",
                                    "IN_PROGRESS",
                                    "COMPLETED",
                                  ].includes(job.status)
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>1. Start Trip</span>
                        </button>

                        {/* Step 2: Mark Arrived */}
                        <button
                          onClick={() =>
                            handleStatusTransition(
                              job.id,
                              "ARRIVED",
                              "Technician Arrived",
                            )
                          }
                          disabled={
                            job.status !== "ON_THE_WAY" ||
                            actionLoadingId === job.id
                          }
                          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            job.status === "ON_THE_WAY"
                              ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md animate-pulse"
                              : [
                                    "ARRIVED",
                                    "IN_PROGRESS",
                                    "COMPLETED",
                                  ].includes(job.status)
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>2. Mark Arrived</span>
                        </button>

                        {/* Step 3: Start Work */}
                        <button
                          onClick={() =>
                            handleStatusTransition(
                              job.id,
                              "IN_PROGRESS",
                              "Service In Progress",
                            )
                          }
                          disabled={
                            job.status !== "ARRIVED" ||
                            actionLoadingId === job.id
                          }
                          className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            job.status === "ARRIVED"
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-pulse"
                              : ["IN_PROGRESS", "COMPLETED"].includes(
                                    job.status,
                                  )
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>3. Start Work</span>
                        </button>

                        {/* Step 4: Complete Job */}
                        <button
                          onClick={() => setCompleteConfirmJob(job)}
                          disabled={
                            job.status !== "IN_PROGRESS" ||
                            actionLoadingId === job.id
                          }
                          className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            job.status === "IN_PROGRESS"
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 animate-pulse"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>4. Complete Job</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: NEW REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {!isOnline ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Power className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  You Are Currently Offline
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  New job requests are paused while you are offline. Switch to
                  ONLINE to receive real-time dispatches.
                </p>
                <button
                  onClick={handleToggleOnline}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Go Online Now
                </button>
              </div>
            ) : newRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No Pending Job Requests
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Listening for new emergency customer bookings matching your
                  specialty.
                </p>
              </div>
            ) : (
              newRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-emerald-500/50 transition-all shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                          {req.priority || "High"} Priority
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          #{req.id}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {req.service_name || req.category}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-sm font-black text-emerald-700">
                        {req.total_paid || req.price || "₹499"}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {req.payment_method || "UPI"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.customer_name || "Verified Customer"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {req.scheduled_date || "Today"} (
                        {req.scheduled_time || "Priority Slot"})
                      </span>
                    </div>
                    <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{req.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedJobForModal(req)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAcceptJob(req.id)}
                      disabled={actionLoadingId === req.id}
                      className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {actionLoadingId === req.id
                          ? "Accepting..."
                          : "Accept Job"}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleRejectJob(req.id, "Technician unavailable")
                      }
                      disabled={actionLoadingId === req.id}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: UPCOMING JOBS */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No Upcoming Scheduled Jobs
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Accepted future jobs will appear here in chronological order.
                </p>
              </div>
            ) : (
              upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        #{job.id}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {job.service_name || job.category}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.scheduled_date || "Today"} •{" "}
                      {job.scheduled_time || "Priority Slot"} • {job.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForModal(job)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: COMPLETED JOBS & CUSTOMER REVIEWS */}
        {activeTab === "completed" && (
          <div className="space-y-6">
            {/* Reviews Highlight */}
            {reviews.length > 0 && (
              <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h3 className="text-base font-black tracking-tight">
                      Customer Ratings & Feedback
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">
                    {reviews.length} Verified Reviews
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {reviews.slice(0, 4).map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-emerald-900/50 border border-emerald-800/60 p-4 rounded-2xl text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-200">
                          {rev.customerName}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-black">
                          <span>★ {rev.rating}</span>
                        </div>
                      </div>
                      <p className="italic text-slate-200">"{rev.feedback}"</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">
                        {rev.serviceName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job History Filters & List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Job History & Records
                </h3>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setHistoryFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "all"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({completedJobs.length + cancelledJobs.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("completed")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "completed"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Completed ({completedJobs.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("cancelled")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === "cancelled"
                        ? "bg-white text-red-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Cancelled & Declined ({cancelledJobs.length})
                  </button>
                </div>
              </div>

              {/* Filtered Job List */}
              {(() => {
                const showCompleted =
                  historyFilter === "all" || historyFilter === "completed";
                const showCancelled =
                  historyFilter === "all" || historyFilter === "cancelled";

                const displayItems = [
                  ...(showCompleted
                    ? completedJobs.map((j) => ({
                        ...j,
                        recordType: "completed",
                      }))
                    : []),
                  ...(showCancelled
                    ? cancelledJobs.map((j) => ({
                        ...j,
                        recordType: "cancelled",
                      }))
                    : []),
                ];

                if (displayItems.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        {historyFilter === "cancelled"
                          ? "No cancelled or declined jobs on record."
                          : historyFilter === "completed"
                            ? "No completed jobs yet. Fulfill active jobs to build your earnings."
                            : "No job history records found."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {displayItems.map((job) => {
                      const isCompleted = job.recordType === "completed";
                      const isDeclined =
                        job.status === "REJECTED" || job.status === "DECLINED";

                      return (
                        <div
                          key={`${job.recordType}-${job.id}`}
                          className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isCompleted
                              ? "border-slate-200"
                              : "border-red-100 bg-red-50/20"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isDeclined
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {isCompleted
                                  ? "COMPLETED"
                                  : isDeclined
                                    ? "DECLINED"
                                    : "CANCELLED"}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                #{job.id}
                              </span>
                              {job.rating && (
                                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                                  ★ {job.rating}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-black text-slate-800">
                              {job.service_name || job.category}
                            </p>

                            <p className="text-xs text-slate-500">
                              {job.customer_name || "Customer"} • {job.address}
                            </p>

                            {/* Reason for cancellation/rejection if present */}
                            {(job.notes ||
                              job.cancellation_reason ||
                              job.reject_reason) && (
                              <p className="text-[11px] text-red-600 font-medium italic mt-0.5">
                                Reason:{" "}
                                {job.notes ||
                                  job.cancellation_reason ||
                                  job.reject_reason}
                              </p>
                            )}

                            <p className="text-[10px] text-slate-400 font-medium">
                              Date:{" "}
                              {job.scheduled_date ||
                                job.date ||
                                job.created_at?.slice(0, 10) ||
                                "Recorded"}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-sm font-black ${
                                isCompleted
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {job.total_paid || job.price || "₹499"}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {isCompleted ? "Earned & Logged" : "Not Billed"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 5: EARNINGS & PAYOUTS */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            {/* Balances & Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Total All-Time Earnings
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {metrics.earningsFormatted || "₹0"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Across {metrics.completedCount || 0} completed orders
                </p>
              </div>

              <div className="bg-emerald-950 text-white rounded-3xl p-5 border border-emerald-900 shadow-md space-y-2">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Available for Payout
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">
                  {metrics.availableBalanceFormatted || "₹0"}
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (!bankAccount.isConnected) {
                        handleOpenBankModal();
                      } else {
                        setShowPayoutModal(true);
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>
                      {bankAccount.isConnected
                        ? "Withdraw Payout"
                        : "Setup Bank First"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Pending In-Transit
                  </span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-700">
                  {metrics.pendingBalanceFormatted || "₹0"}
                </p>
                <p className="text-[11px] text-slate-400">
                  From {activeJobs.length} active service bookings
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Payout Status
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-base font-black text-slate-900 mt-1">
                  {bankAccount.isConnected
                    ? "Direct Bank Transfer"
                    : "Bank Required"}
                </p>
                <button
                  onClick={() => setActiveTab("payout_setup")}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {bankAccount.isConnected
                      ? "Manage Bank Account"
                      : "Add Bank Account"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Connected Bank Snapshot */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      {bankAccount.isConnected
                        ? `${bankAccount.bankName} (${bankAccount.accountNumberMasked})`
                        : "No Payout Bank Account Connected"}
                    </h4>
                    {bankAccount.isConnected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {bankAccount.verificationStatus || "Verified"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {bankAccount.isConnected
                      ? `Holder: ${bankAccount.holderName} • IFSC: ${bankAccount.ifsc}`
                      : "Connect your bank account to enable direct payout withdrawals to your bank."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenBankModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  {bankAccount.isConnected ? "Change Bank" : "Connect Bank"}
                </button>
                {bankAccount.isConnected && (
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Request Payout</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recent Transactions (Credits & Debits) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Recent Transactions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Credits from completed jobs and payout withdrawal debits
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {recentTransactions.length} records
                </span>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No transaction activity recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTransactions.map((tx) => {
                    const isCredit = tx.type === "Credit";
                    return (
                      <div
                        key={tx.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {isCredit ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <ArrowDownToLine className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {tx.title}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isCredit
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-sky-100 text-sky-800"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {tx.customerName} • {tx.orderId} •{" "}
                              {tx.date
                                ? new Date(tx.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span
                            className={`text-sm font-black ${
                              isCredit ? "text-emerald-700" : "text-sky-800"
                            }`}
                          >
                            {tx.amountFormatted}
                          </span>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Payout Withdrawal History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Records of transfers processed to your registered bank
                    account
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {payoutHistory.length} requests
                </span>
              </div>

              {payoutHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No payout withdrawals requested yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutHistory.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                          <span className="font-bold text-slate-700">
                            Ref: {p.reference_id || p.id}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Transferred to account ending in •••
                          {p.bank_account_tail || "XXXX"} •{" "}
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Processed"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-base font-black text-slate-900">
                          ₹{Number(p.amount).toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          IMPS / NEFT Settlement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: BANK & PAYOUT SETUP */}
        {activeTab === "payout_setup" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Bank Account & Settlement Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect and verify your primary bank account for seamless
                    earnings settlements
                  </p>
                </div>
                <button
                  onClick={handleOpenBankModal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {bankAccount.isConnected
                      ? "Update Bank Account"
                      : "Connect Bank Account"}
                  </span>
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  bankAccount.isConnected
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                {bankAccount.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold">
                    {bankAccount.isConnected
                      ? "Bank Account Verified for Payouts"
                      : "Action Required: Connect a Bank Account"}
                  </h4>
                  <p className="mt-0.5 opacity-90 leading-relaxed">
                    {bankAccount.isConnected
                      ? "Your account details have been verified. Any requested payouts will be credited directly to this bank account within 24-48 banking hours."
                      : "You have not connected a bank account yet. You must add and verify a valid bank account to withdraw your completed job earnings."}
                  </p>
                </div>
              </div>

              {/* Account Details Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Account Holder Name
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {bankAccount.holderName || "Not configured"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bank Name
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {bankAccount.bankName || "Not configured"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bank Account Number
                  </span>
                  <p className="font-bold text-slate-900 text-sm tracking-wider">
                    {bankAccount.accountNumberMasked || "•••• •••• ••••"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    IFSC Code
                  </span>
                  <p className="font-bold text-slate-900 text-sm tracking-widest">
                    {bankAccount.ifsc || "Not configured"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Verification Status
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        bankAccount.isConnected
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {bankAccount.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payout Channel
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {bankAccount.payoutStatus === "Active"
                      ? "Active (IMPS / NEFT)"
                      : "Inactive"}
                  </p>
                </div>
              </div>

              {/* Settlement Guidelines */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Settlement & Payout Guidelines:
                </h4>
                <ul className="list-disc list-inside space-y-1 leading-relaxed text-slate-500">
                  <li>
                    Earnings from completed customer jobs are credited to your
                    Available Balance immediately after customer signoff.
                  </li>
                  <li>
                    You can request a payout withdrawal anytime with a minimum
                    amount of ₹100.
                  </li>
                  <li>
                    Automated direct transfers are executed via verified
                    IMPS/NEFT gateway with zero processing fees.
                  </li>
                  <li>
                    The registered bank account holder name must match the name
                    on your partner registration documents.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REAL NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Notifications & Dispatch Alerts
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time updates regarding new job assignments, reviews, and
                  payouts
                </p>
              </div>

              {unreadNotificationsCount > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  disabled={isMarkingNotifications}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
                >
                  {isMarkingNotifications
                    ? "Marking Read..."
                    : "Mark All as Read"}
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">
                  No Notifications Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Alerts for emergency requests, customer ratings, and balance
                  settlements will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      n.unread
                        ? "bg-white border-emerald-500/50 shadow-sm"
                        : "bg-white/70 border-slate-200"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.unread
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {n.created_at
                            ? new Date(n.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Just now"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.description || n.message}
                      </p>
                    </div>

                    {n.unread ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SERVICE AREAS */}
        {activeTab === "service_areas" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Operational Service Coverage Areas
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the localities where you or your response crew are
                  available for emergency service dispatch.
                </p>
              </div>

              {/* Coverage Chips */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Delhi NCR Operational Zones (Click to toggle coverage):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    "Delhi NCR",
                    "South Delhi",
                    "Central Delhi",
                    "West Delhi",
                    "North Delhi",
                    "East Delhi",
                    "Gurugram (Gurgaon)",
                    "Noida",
                    "Greater Noida",
                    "Faridabad",
                    "Ghaziabad",
                  ].map((area) => {
                    const activeZones = (
                      techProfile?.service_areas || "Delhi NCR"
                    )
                      .split(",")
                      .map((s) => s.trim());
                    const isActive = activeZones.includes(area);

                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleToggleServiceArea(area)}
                        disabled={isSavingAreas}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 border-emerald-500/60 text-emerald-950 shadow-xs"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`w-3.5 h-3.5 ${
                              isActive ? "text-emerald-700" : "text-slate-400"
                            }`}
                          />
                          <span>{area}</span>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>
                  Currently Active Coverage:{" "}
                  <strong className="text-slate-800">
                    {techProfile?.service_areas || "Delhi NCR"}
                  </strong>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">
                  Auto-Saved to Dispatch Network
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: REVIEWS & RATINGS */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Rating Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Performance Score
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-slate-900">
                    {metrics.rating}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Based on verified customer completions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:border-l sm:border-slate-200 sm:pl-6 text-xs">
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {metrics.completedCount || 0}
                  </p>
                  <p className="text-slate-400 text-[11px]">Completed Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">
                    {reviews.length}
                  </p>
                  <p className="text-slate-400 text-[11px]">Written Reviews</p>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
                  <Star className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-700">
                    No Reviews Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Customer ratings and verified comments will appear here once
                    jobs are fulfilled.
                  </p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {rev.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Verified Customer
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <span>★ {rev.rating}</span>
                      </div>
                    </div>
                    <p className="italic text-slate-700 leading-relaxed">
                      "{rev.feedback}"
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Service: {rev.serviceName}</span>
                      <span>
                        {rev.date
                          ? new Date(rev.date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Recorded"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 10: PROFILE & CREDENTIALS */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      techProfile?.avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    }
                    alt={techProfile?.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">
                        {techProfile?.name || "Professional"}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {techProfile?.account_type === "company"
                          ? "Service Company / Business"
                          : "Individual Professional"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {techProfile?.category} Specialist •{" "}
                      {techProfile?.experience_years || 3} Years Experience
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {techProfile?.account_type === "company" && (
                  <>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Company / Business Name
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {techProfile?.company_name || techProfile?.name}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Authorized Person / Representative
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {techProfile?.authorized_person || techProfile?.name}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Business Registration / GSTIN
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {techProfile?.business_registration_number ||
                          "Verified Registration"}
                      </p>
                    </div>
                  </>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contact Phone Number
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.phone || "+91 98101 11223"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contact Email Address
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.email || "partner@argentyour.com"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Trade / Discipline
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.category || "Plumbing"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Operating Service Areas
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.service_areas || "Delhi NCR"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dispatch Vehicle Type
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.vehicle_type || "Rapid Response Van"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Account Status
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        techProfile?.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {techProfile?.status || "Pending Verification"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Specialized Skills & Competencies
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {techProfile?.skills ||
                      "General Emergency Service & Repairs"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Complete Job Confirmation Dialog */}
      {completeConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Complete Service Job #{completeConfirmJob.id}?
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm service completion and signoff
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              By completing this job, you confirm that the service for{" "}
              <strong>
                {completeConfirmJob.service_name || completeConfirmJob.category}
              </strong>{" "}
              at <strong>{completeConfirmJob.address}</strong> has been
              thoroughly executed. The customer will be notified and invited to
              rate your service.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCompleteConfirmJob(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteJob}
                disabled={actionLoadingId === completeConfirmJob.id}
                className="flex-[2] py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black transition-all shadow-lg shadow-green-600/20 cursor-pointer"
              >
                {actionLoadingId === completeConfirmJob.id
                  ? "Marking Complete..."
                  : "Yes, Mark Job Completed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {selectedJobForModal && (
        <TechnicianJobDetailsModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          onAccept={handleAcceptJob}
          onReject={handleRejectJob}
          isAccepting={actionLoadingId === selectedJobForModal.id}
          isRejecting={actionLoadingId === selectedJobForModal.id}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Professional Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your trade credentials and contact info
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                    placeholder="+91 98101 11223"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={editFormData.experience_years}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        experience_years: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Trade / Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold bg-white"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC / Air Conditioning</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Cleaning">Cleaning & Sanitization</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Emergency Locksmith">
                      Emergency Locksmith
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dispatch Vehicle
                  </label>
                  <select
                    value={editFormData.vehicle_type}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        vehicle_type: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold bg-white"
                  >
                    <option value="Rapid Response Van">
                      Rapid Response Van
                    </option>
                    <option value="Motorcycle / Scooter">
                      Motorcycle / Scooter
                    </option>
                    <option value="Service Utility Truck">
                      Service Utility Truck
                    </option>
                    <option value="Personal Vehicle">Personal Vehicle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specialized Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editFormData.skills}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      skills: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  placeholder="e.g. Pipe Bursts, Drain Cleaning, Leak Detection, Water Heaters"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={editFormData.avatar}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      avatar: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-[2] py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile
                    ? "Saving Changes..."
                    : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Account Setup Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Connect Payout Bank Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct settlements for completed service orders
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveBankAccount}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Holder Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.holder_name}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      holder_name: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.bank_name}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      bank_name: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                  placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.account_number}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      account_number: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold tracking-wider"
                  placeholder="e.g. 50100412345678"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={bankFormData.ifsc}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      ifsc: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-xs font-semibold tracking-widest uppercase"
                  placeholder="e.g. SBIN0001234"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="flex-[2] py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingBank
                    ? "Verifying Account..."
                    : "Save & Verify Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Request Payout Withdrawal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transfer available funds to your verified bank
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available Balance Box */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Available for Withdrawal
                </span>
                <p className="text-2xl font-black text-emerald-900">
                  {metrics.availableBalanceFormatted || "₹0"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPayoutAmount(String(metrics.availableBalance || 0))
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
              >
                Max Amount
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={metrics.availableBalance || 0}
                    step="1"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 text-sm font-bold pl-8"
                    placeholder="Enter amount (e.g. 500)"
                  />
                  <span className="absolute left-3.5 top-3.5 font-bold text-slate-400">
                    ₹
                  </span>
                </div>
              </div>

              {/* Destination Bank Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Transfer Destination
                </span>
                <p className="font-bold text-slate-900">
                  {bankAccount.bankName} • {bankAccount.accountNumberMasked}
                </p>
                <p className="text-[11px] text-slate-500">
                  Beneficiary: {bankAccount.holderName} (IFSC:{" "}
                  {bankAccount.ifsc})
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingPayout ||
                    !payoutAmount ||
                    Number(payoutAmount) <= 0
                  }
                  className="flex-[2] py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayout
                    ? "Processing Transfer..."
                    : "Confirm & Withdraw"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
