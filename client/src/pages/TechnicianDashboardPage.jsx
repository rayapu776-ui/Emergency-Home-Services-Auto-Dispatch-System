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
  LayoutDashboard,
  Search,
  ArrowRight,
  HelpCircle,
  Settings,
} from "lucide-react";
import technicianStore from "../services/technicianStore";
import { useSocket } from "../context/SocketContext";
import TechnicianJobDetailsModal from "../components/common/TechnicianJobDetailsModal";
import InAppMapNavigationSheet from "../components/common/InAppMapNavigationSheet";

const portalPathForTab = (tab) => {
  if (["jobs", "active", "requests", "upcoming", "completed"].includes(tab)) return "/technician/jobs";
  if (["earnings", "payout_setup"].includes(tab)) return "/technician/earnings";
  if (tab === "notifications") return "/technician/notifications";
  if (["profile", "service_areas", "reviews"].includes(tab)) return "/technician/profile";
  return "/technician/dashboard";
};

const tabForPortalPath = (path) => {
  if (path === "/technician/jobs") return "active";
  if (path === "/technician/earnings") return "earnings";
  if (path === "/technician/notifications") return "notifications";
  if (path === "/technician/profile") return "profile";
  return "overview";
};

export default function TechnicianDashboardPage({ onLogout, onBackToHome }) {
  const { socket, joinRoom } = useSocket();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [techProfile, setTechProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(
    technicianStore.getAvailability() === "ONLINE",
  );
  const [activeTab, setActiveTab] = useState(() =>
    window.history.state?.tab || tabForPortalPath(window.location.pathname),
  ); // 'overview' | 'requests' | 'active' | 'upcoming' | 'completed' | 'earnings' | 'payout_setup' | 'notifications' | 'service_areas' | 'reviews' | 'profile'
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileJobsTab, setMobileJobsTab] = useState("active"); // 'active' | 'requests' | 'upcoming' | 'history'

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
  const [declineConfirmJob, setDeclineConfirmJob] = useState(null);
  const [navigationJob, setNavigationJob] = useState(null);
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
    openEditProfile();
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
    openBankModal();
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

    // Silent background auto-refresh every 10 seconds without resetting tabs or modals
    const intervalId = setInterval(() => {
      loadDashboardData(true);
    }, 10000);

    return () => clearInterval(intervalId);
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

  const hasActiveJob = (activeJobs || []).some((j) =>
    ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "ASSIGNED"].includes(
      j.status,
    ),
  );

  // Exact Geolocation & Arrival Radius State (100 meters)
  const ARRIVAL_RADIUS_METERS = 100;
  const [currentTechCoords, setCurrentTechCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // 'idle' | 'locating' | 'granted' | 'denied' | 'error'
  const [geoError, setGeoError] = useState(null);

  // Haversine distance in meters
  const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const φ1 = (Number(lat1) * Math.PI) / 180;
    const φ2 = (Number(lat2) * Math.PI) / 180;
    const Δφ = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const Δλ = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const getLiveTechnicianPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error("Geolocation is not supported by your browser.");
        setGeoError(err.message);
        setGeoStatus("error");
        reject(err);
        return;
      }
      setGeoStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setCurrentTechCoords(coords);
          setGeoStatus("granted");
          setGeoError(null);
          resolve(coords);
        },
        (err) => {
          let msg = "Unable to determine device location.";
          if (err.code === 1) {
            msg =
              "Location permission denied. Please allow location access in your browser to confirm arrival.";
            setGeoStatus("denied");
          } else if (err.code === 2) {
            msg =
              "GPS signal unavailable. Please ensure location is turned on.";
            setGeoStatus("error");
          } else if (err.code === 3) {
            msg = "GPS request timed out. Please check your signal.";
            setGeoStatus("error");
          }
          setGeoError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    });
  };

  const getJobDistanceMeters = (job) => {
    if (!currentTechCoords) return null;
    const destLat = Number(job.latitude || job.lat);
    const destLng = Number(job.longitude || job.lng);
    if (!destLat || !destLng) return null;
    return calculateDistanceMeters(
      currentTechCoords.lat,
      currentTechCoords.lng,
      destLat,
      destLng,
    );
  };

  // Watch position when job is ON_THE_WAY
  useEffect(() => {
    const hasEnRoute = activeJobs.some((j) => j.status === "ON_THE_WAY");
    if (!hasEnRoute) return;

    getLiveTechnicianPosition().catch(() => {});

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentTechCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
          setGeoStatus("granted");
          setGeoError(null);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeJobs]);

  // Safe Navigation History Management (Preserves session, handles Back button like a native app)
  const navigateToTab = (tab, subTab = null, replace = false) => {
    // Dismiss any open modals
    setSelectedJobForModal(null);
    setNavigationJob(null);
    setShowPayoutModal(false);
    setShowBankModal(false);
    setShowEditProfile(false);
    setShowDocumentsModal(false);
    setShowContactModal(false);
    setShowSecurityModal(false);
    setCompleteConfirmJob(null);
    setDeclineConfirmJob(null);

    let effectiveTab = tab;
    let effectiveSubTab = subTab;
    if (tab === "jobs") {
      effectiveTab = subTab || mobileJobsTab || "active";
      effectiveSubTab = effectiveTab;
    }

    setActiveTab(effectiveTab);
    if (effectiveSubTab) {
      setMobileJobsTab(effectiveSubTab);
    }

    const stateObj = {
      tab: effectiveTab,
      subTab: effectiveSubTab,
      modal: null,
      timestamp: Date.now(),
    };

    if (replace) {
      window.history.replaceState(stateObj, "", portalPathForTab(effectiveTab));
    } else {
      window.history.pushState(stateObj, "", portalPathForTab(effectiveTab));
    }
  };

  const openJobDetails = (job) => {
    window.history.pushState(
      {
        tab: activeTab,
        subTab: mobileJobsTab,
        modal: "job-details",
        jobId: job.id,
      },
      "",
      portalPathForTab(activeTab),
    );
    setSelectedJobForModal(job);
  };

  const openMapNavigation = (job) => {
    window.history.pushState(
      {
        tab: activeTab,
        subTab: mobileJobsTab,
        modal: "map-navigation",
        jobId: job.id,
      },
      "",
      portalPathForTab(activeTab),
    );
    setNavigationJob(job);
  };

  const openPayoutModal = () => {
    window.history.pushState(
      { tab: activeTab, modal: "payout" },
      "",
      portalPathForTab(activeTab),
    );
    setShowPayoutModal(true);
  };

  const openBankModal = () => {
    window.history.pushState(
      { tab: activeTab, modal: "bank" },
      "",
      portalPathForTab(activeTab),
    );
    setShowBankModal(true);
  };

  const openEditProfile = () => {
    window.history.pushState(
      { tab: activeTab, modal: "edit-profile" },
      "",
      portalPathForTab(activeTab),
    );
    setShowEditProfile(true);
  };

  const openCompleteConfirm = (job) => {
    window.history.pushState(
      { tab: activeTab, modal: "complete-confirm", jobId: job.id },
      "",
      portalPathForTab(activeTab),
    );
    setCompleteConfirmJob(job);
  };

  const openDeclineConfirm = (job) => {
    window.history.pushState(
      { tab: activeTab, modal: "decline-confirm", jobId: job.id },
      "",
      portalPathForTab(activeTab),
    );
    setDeclineConfirmJob(job);
  };

  // Handle browser Back button to preserve section history without logging out
  useEffect(() => {
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState(
        { tab: tabForPortalPath(window.location.pathname), modal: null },
        "",
        portalPathForTab(tabForPortalPath(window.location.pathname)),
      );
    }

    const handleDashboardPop = (e) => {
      const state = e.state;

      // 1. If currently a modal is open, but popped state has no modal, close modals!
      if (!state?.modal) {
        setSelectedJobForModal(null);
        setNavigationJob(null);
        setShowPayoutModal(false);
        setShowBankModal(false);
        setShowEditProfile(false);
        setShowDocumentsModal(false);
        setShowContactModal(false);
        setShowSecurityModal(false);
        setCompleteConfirmJob(null);
        setDeclineConfirmJob(null);
      } else {
        if (state.modal === "job-details" && state.jobId) {
          const found = [
            ...activeJobs,
            ...newRequests,
            ...upcomingJobs,
            ...completedJobs,
          ].find((j) => j.id === state.jobId);
          if (found) setSelectedJobForModal(found);
        } else if (state.modal === "map-navigation" && state.jobId) {
          const found = activeJobs.find((j) => j.id === state.jobId);
          if (found) setNavigationJob(found);
        } else if (state.modal === "payout") {
          setShowPayoutModal(true);
        } else if (state.modal === "bank") {
          setShowBankModal(true);
        } else if (state.modal === "edit-profile") {
          setShowEditProfile(true);
        }
      }

      // 2. Restore active tab from state history
      if (state?.tab) {
        setActiveTab(state.tab);
        if (state.subTab) {
          setMobileJobsTab(state.subTab);
        }
      } else {
        // At the base of the dashboard: maintain overview and never exit or log out
        const baseTab = tabForPortalPath(window.location.pathname);
        setActiveTab(baseTab);
        window.history.pushState(
          { tab: baseTab, modal: null },
          "",
          portalPathForTab(baseTab),
        );
      }
    };

    window.addEventListener("popstate", handleDashboardPop);
    return () => window.removeEventListener("popstate", handleDashboardPop);
  }, [activeJobs, newRequests, upcomingJobs, completedJobs]);

  // Handle Availability Toggle (ONLINE / OFFLINE)
  const handleToggleOnline = async () => {
    if (isOnline && hasActiveJob) {
      showToast(
        "Active job in progress — stay online until completion.",
        "error",
      );
      return;
    }

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
      await technicianStore.acceptJob(jobId);
      showToast("Job accepted! Moved to Active Jobs.", "success");
      setSelectedJobForModal(null);
      setActiveTab("active");
      setMobileJobsTab("active");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Accept job error:", err);
      showToast(err.response?.data?.error || "Failed to accept job", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Trip (On The Way)
  const handleStartTrip = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "ON_THE_WAY");
      setActiveJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "ON_THE_WAY" } : j)),
      );
      showToast(
        "Trip started! You are on the way to customer location.",
        "success",
      );
      // Immediately initiate GPS watch
      getLiveTechnicianPosition().catch(() => {});
      await loadDashboardData(true);
    } catch (err) {
      console.error("Start trip error:", err);
      showToast(err.response?.data?.error || "Failed to start trip", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark Arrived at Customer Doorstep (Exact Location Validation)
  const handleMarkArrived = async (jobId, providedCoords = null) => {
    const job = activeJobs.find((j) => j.id === jobId);
    if (!job) return;

    setActionLoadingId(jobId);
    try {
      let verifiedCoords = providedCoords;
      if (!verifiedCoords) {
        try {
          verifiedCoords = await getLiveTechnicianPosition();
        } catch (e) {
          if (currentTechCoords) {
            verifiedCoords = currentTechCoords;
          } else {
            showToast(
              "Location access is required to confirm arrival. Please enable GPS.",
              "error",
            );
            setActionLoadingId(null);
            return;
          }
        }
      }

      // Check distance against customer location
      const destLat = Number(job.latitude || job.lat);
      const destLng = Number(job.longitude || job.lng);

      if (destLat && destLng) {
        const dist = calculateDistanceMeters(
          verifiedCoords.lat,
          verifiedCoords.lng,
          destLat,
          destLng,
        );

        if (dist !== null && dist > ARRIVAL_RADIUS_METERS) {
          showToast(
            `You are ${dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist}m`} away from the customer doorstep. Arrival can only be marked within ${ARRIVAL_RADIUS_METERS} meters.`,
            "error",
          );
          setActionLoadingId(null);
          return;
        }
      }

      // Send to backend with verified coordinates
      await technicianStore.updateJobStatus(jobId, "ARRIVED", {
        lat: verifiedCoords.lat,
        lng: verifiedCoords.lng,
      });

      setActiveJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "ARRIVED" } : j)),
      );
      showToast(
        "Verified doorstep arrival! Status updated to Arrived.",
        "success",
      );
      await loadDashboardData(true);
    } catch (err) {
      console.error("Mark arrived error:", err);
      showToast(
        err.response?.data?.error || "Failed to mark arrived at doorstep",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Work
  const handleStartWork = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.updateJobStatus(jobId, "IN_PROGRESS");
      setActiveJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "IN_PROGRESS" } : j)),
      );
      showToast("Service started! Work is now in progress.", "success");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Start work error:", err);
      showToast(err.response?.data?.error || "Failed to start work", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Decline Job Request Dialog
  const handleDeclineJob = (jobOrId) => {
    if (typeof jobOrId === "object" && jobOrId !== null) {
      setDeclineConfirmJob(jobOrId);
    } else {
      const found = newRequests.find((r) => r.id === jobOrId);
      setDeclineConfirmJob(found || { id: jobOrId });
    }
  };

  // Confirm Decline and persist to backend
  const handleConfirmDecline = async () => {
    if (!declineConfirmJob) return;
    const jobId = declineConfirmJob.id;
    setActionLoadingId(jobId);
    try {
      await technicianStore.rejectJob(jobId, "Declined by technician");
      setNewRequests((prev) => prev.filter((r) => r.id !== jobId));
      showToast("Job request declined and removed.", "info");
      setDeclineConfirmJob(null);
      await loadDashboardData(true);
    } catch (err) {
      console.error("Decline job error:", err);
      showToast(
        err.response?.data?.error || "Failed to decline job request",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject a Job directly (used by modals)
  const handleRejectJob = async (jobId, reason) => {
    setActionLoadingId(jobId);
    try {
      await technicianStore.rejectJob(jobId, reason);
      setNewRequests((prev) => prev.filter((r) => r.id !== jobId));
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
    if (nextStatus === "ARRIVED") {
      return handleMarkArrived(jobId);
    }
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

  // Confirm and Complete Job (Service Completed Workflow)
  const handleCompleteJob = async () => {
    if (!completeConfirmJob) return;
    const jobId = completeConfirmJob.id;
    setActionLoadingId(jobId);
    try {
      await technicianStore.completeJob(jobId);
      setActiveJobs((prev) => prev.filter((j) => j.id !== jobId));
      setCompletedJobs((prev) => [
        {
          ...completeConfirmJob,
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      showToast(
        `Job #${jobId} marked complete! Earnings logged and moved to History.`,
        "success",
      );
      setCompleteConfirmJob(null);
      setSelectedJobForModal(null);
      navigateToTab("jobs", "completed");
      await loadDashboardData(true);
    } catch (err) {
      console.error("Complete job error:", err);
      showToast(
        err.response?.data?.error || "Failed to mark job as complete",
        "error",
      );
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

  const handleBottomNavClick = (targetTab) => {
    // Silently re-fetch latest data from database
    loadDashboardData(true);

    if (targetTab === "overview") {
      navigateToTab("overview");
    } else if (targetTab === "jobs") {
      const sub =
        newRequests.length > 0 && activeJobs.length === 0
          ? "requests"
          : mobileJobsTab || "active";
      navigateToTab("jobs", sub);
    } else if (targetTab === "earnings") {
      navigateToTab("earnings");
    } else if (targetTab === "notifications") {
      navigateToTab("notifications");
    } else if (targetTab === "profile") {
      navigateToTab("profile");
    }
  };

  const unreadNotificationsCount = (notifications || []).filter(
    (n) => n.unread === 1 || n.unread === true,
  ).length;

  const techFirstName = techProfile?.name
    ? techProfile.name.trim().split(" ")[0]
    : "Professional";

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Filter items by search query
  const filterBySearch = (
    items = [],
    fields = ["service_name", "category", "address", "customer_name", "id"],
  ) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) =>
      fields.some(
        (field) => item[field] && String(item[field]).toLowerCase().includes(q),
      ),
    );
  };

  const filteredActiveJobs = filterBySearch(activeJobs);
  const filteredNewRequests = filterBySearch(newRequests);
  const filteredUpcomingJobs = filterBySearch(upcomingJobs);
  const filteredCompletedJobs = filterBySearch(completedJobs);
  const filteredCancelledJobs = filterBySearch(cancelledJobs);
  const filteredNotifications = (notifications || []).filter((notif) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (notif.title && notif.title.toLowerCase().includes(q)) ||
      (notif.description && notif.description.toLowerCase().includes(q)) ||
      (notif.message && notif.message.toLowerCase().includes(q))
    );
  });

  // Persistent real data without fake fallbacks
  const displayUpcomingJobs = upcomingJobs || [];

  const recentActivities = [
    ...(completedJobs || []).map((j) => ({
      id: `act-job-${j.id}`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 text-emerald-800",
      title: "Job Completed",
      subtitle: j.service_name || j.category || "Emergency Service",
      tag: `+₹${j.total_paid || j.price || 499}`,
      tagColor: "text-emerald-700",
      time: j.updated_at
        ? new Date(j.updated_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recent",
    })),
    ...(payoutHistory || []).map((p) => ({
      id: `act-pay-${p.id}`,
      icon: DollarSign,
      iconBg: "bg-teal-100 text-teal-800",
      title: "Payment Received",
      subtitle: `Payout transfer to bank ${p.bank_account_tail ? `•••${p.bank_account_tail}` : ""}`,
      tag: `₹${p.amount}`,
      tagColor: "text-slate-900",
      time: p.created_at
        ? new Date(p.created_at).toLocaleDateString()
        : "Recent",
    })),
    ...(activeJobs || []).map((j) => ({
      id: `act-active-${j.id}`,
      icon: Wrench,
      iconBg: "bg-sky-100 text-sky-800",
      title: "Job In Progress",
      subtitle: j.service_name || j.category || "Active Dispatch",
      tag: j.status,
      tagColor: "text-sky-700",
      time: "Now",
    })),
  ].slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f3] flex flex-col items-center justify-center space-y-4 font-sans technician-dashboard">
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
    <div className="min-h-screen bg-[#f6f7f3] text-slate-900 font-sans technician-dashboard selection:bg-emerald-200">
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

      {/* Top Navbar: ONLY Argent Your logo + company name on Left, Online/Offline status icon on Right */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Argent Your Logo + Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/argent-logo.png"
            alt="Argent Your"
            className="h-8 w-8 rounded-xl object-contain shadow-xs"
          />
          <span className="text-base font-black text-slate-900 tracking-tight">
            Argent Your
          </span>
        </div>

        {/* Right: Online/Offline status icon ONLY (NO words "Online" or "Offline") */}
        <button
          type="button"
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
            isOnline
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs hover:bg-emerald-100/70"
              : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/60"
          }`}
          title={
            hasActiveJob
              ? "Active job — stay online"
              : isOnline
                ? "Status: Online (Click to switch)"
                : "Status: Offline (Click to switch)"
          }
          aria-label={isOnline ? "Online" : "Offline"}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <div
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isOnline ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                isOnline ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>
      </header>

      {/* ========================================================
          DESKTOP VIEW (Visible on desktop: hidden md:flex)
          Left Sidebar + Main Dashboard Content
         ======================================================== */}
      <div className="hidden md:flex min-h-[calc(100vh-57px)] bg-[#f8faf9]">
        {/* Left Sidebar: ONLY Dashboard, Jobs, Earnings, Notifications, Profile + Need Help at bottom */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1.5">
              {/* 1. Dashboard */}
              <button
                type="button"
                onClick={() => handleBottomNavClick("overview")}
                className={
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                  (activeTab === "overview"
                    ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* 2. Jobs */}
              <button
                type="button"
                onClick={() => handleBottomNavClick("jobs")}
                className={
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                  ([
                    "jobs",
                    "active",
                    "requests",
                    "upcoming",
                    "completed",
                  ].includes(activeTab)
                    ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4" />
                  <span>Jobs</span>
                </div>
                {newRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    {newRequests.length}
                  </span>
                )}
              </button>

              {/* 3. Earnings */}
              <button
                type="button"
                onClick={() => handleBottomNavClick("earnings")}
                className={
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                  (["earnings", "payout_setup"].includes(activeTab)
                    ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <DollarSign className="w-4 h-4" />
                <span>Earnings</span>
              </button>

              {/* 4. Notifications */}
              <button
                type="button"
                onClick={() => handleBottomNavClick("notifications")}
                className={
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                  (activeTab === "notifications"
                    ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* 5. Profile */}
              <button
                type="button"
                onClick={() => handleBottomNavClick("profile")}
                className={
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                  (activeTab === "profile"
                    ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>

          {/* Need Help? Box at bottom of sidebar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-emerald-50/70 border border-emerald-100/90 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  Need Help?
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Have questions about dispatches or payments? We're here 24/7.
              </p>
              <a
                href="tel:+919810111223"
                className="w-full mt-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs block text-center cursor-pointer"
              >
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Desktop Main Content Area */}
        <div className="flex-1 min-w-0 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* ========================================================
              DASHBOARD OVERVIEW TAB (activeTab === "overview")
             ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Greeting & Right Side Date + Location */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                    Good Morning, {techFirstName}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Here’s your overview for today. Keep going, you’re making a
                    difference!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Availability quick switch */}
                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    className={
                      "px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border " +
                      (isOnline
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200")
                    }
                    title={isOnline ? "Switch to Offline" : "Switch to Online"}
                  >
                    <span
                      className={
                        "w-2 h-2 rounded-full " +
                        (isOnline
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-slate-400")
                      }
                    />
                    <span>{isOnline ? "Online" : "Offline"}</span>
                  </button>

                  {/* Date & Service Location */}
                  <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {currentDateFormatted}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {techProfile?.location ||
                            techProfile?.address ||
                            techProfile?.service_areas ||
                            "Delhi NCR, India"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Statistics Cards in One Horizontal Row (Pastel Card Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. New Job Requests */}
                <div className="bg-[#fffbeb] p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800/80">
                      New Job Requests
                    </p>
                    <p className="text-3xl font-black text-amber-950 mt-1.5">
                      {newRequests.length}
                    </p>
                    <p className="text-[11px] text-amber-700/80 font-medium mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Awaiting response</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                    <Clock className="w-6 h-6 text-amber-700" />
                  </div>
                </div>

                {/* 2. Active Jobs */}
                <div className="bg-[#f0f9ff] p-5 rounded-3xl border border-sky-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-800/80">
                      Active Jobs
                    </p>
                    <p className="text-3xl font-black text-sky-950 mt-1.5">
                      {activeJobs.length}
                    </p>
                    <p className="text-[11px] text-sky-700/80 font-medium mt-1">
                      Currently in progress
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-xs">
                    <Wrench className="w-6 h-6 text-sky-700" />
                  </div>
                </div>

                {/* 3. Completed Jobs */}
                <div className="bg-[#ecfdf5] p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                      Completed Jobs
                    </p>
                    <p className="text-3xl font-black text-emerald-950 mt-1.5">
                      {metrics.completedCount || metrics.totalJobs || 0}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 font-medium mt-1">
                      Verified orders
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>

                {/* 4. Total Earnings */}
                <div className="bg-[#f0fdf4] p-5 rounded-3xl border border-teal-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800/80">
                      Total Earnings
                    </p>
                    <p className="text-3xl font-black text-teal-950 mt-1.5">
                      {metrics.earningsFormatted ||
                        "₹" + (metrics.totalEarnings || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-teal-700/80 font-medium mt-1">
                      Lifetime revenue
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                    <DollarSign className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
              </div>

              {/* Main Content Grid: 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT / MAIN COLUMN */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* Promotional Banner */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-7 shadow-sm flex items-center justify-between">
                    <div className="relative z-10 max-w-md">
                      <h2 className="text-2xl font-black tracking-tight leading-snug">
                        More Jobs. More Income.
                        <br />A Brighter Tomorrow.
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 font-medium leading-relaxed">
                        Deliver quality service, build your reputation, and grow
                        with Argent Your.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("active")}
                        className="mt-4 px-5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>View Available Jobs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative z-10 hidden sm:block shrink-0 ml-4">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-emerald-900/40">
                        <img
                          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
                          alt="Technician Partner"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    {/* Subtle Background Glow */}
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  </div>

                  {/* Tasks from Admin */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Tasks from Admin
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Task 1: Upload ID Proof */}
                      <div
                        onClick={() => handleOpenEditProfile()}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-amber-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                              Upload ID Proof
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Submit verified government ID or trade certificate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span
                            className={
                              "px-2.5 py-1 rounded-full text-[10px] font-bold " +
                              (techProfile?.id_document_url
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800")
                            }
                          >
                            {techProfile?.id_document_url
                              ? "Completed"
                              : "Pending Action"}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </div>
                      </div>

                      {/* Task 2: Complete Training Module */}
                      <div
                        onClick={() => setActiveTab("overview")}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                              Complete Training Module
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Argent Your standard emergency safety and service
                              protocols
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </div>
                      </div>

                      {/* Task 3: Update Service Location */}
                      <div
                        onClick={() => setActiveTab("service_areas")}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-blue-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                              Update Service Location
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Confirm your primary coverage radius for rapid
                              dispatch
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Jobs */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Upcoming Jobs
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                        {displayUpcomingJobs.length} scheduled
                      </span>
                    </div>

                    <div className="space-y-3">
                      {displayUpcomingJobs.length === 0 ? (
                        <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-700">
                            No Upcoming Bookings
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Scheduled appointments for future dates will appear
                            here.
                          </p>
                        </div>
                      ) : (
                        displayUpcomingJobs.map((job, idx) => (
                          <div
                            key={job.id || idx}
                            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                  {job.scheduled_date || "Today, 02:30 PM"}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700">
                                  {job.duration || "Est. 45 mins"}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900">
                                {job.service_name ||
                                  job.category ||
                                  "Emergency Service Inspection"}
                              </h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>
                                  {job.address ||
                                    "South Extension II, New Delhi"}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {job.status === "in_progress"
                                  ? "In Progress"
                                  : job.status || "Confirmed"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (job.id) {
                                    openJobDetails(job);
                                  } else if (activeJobs.length > 0) {
                                    openJobDetails(activeJobs[0]);
                                  } else {
                                    navigateToTab("jobs", "active");
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* Complete Your Profile */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs text-center space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                        Profile Completion
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Level 2 Verified
                      </span>
                    </div>

                    {/* Circular Progress Ring */}
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center my-2">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 88 88"
                      >
                        <circle
                          cx="44"
                          cy="44"
                          r="36"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="44"
                          cy="44"
                          r="36"
                          stroke="#047857"
                          strokeWidth="8"
                          strokeDasharray={226.2}
                          strokeDashoffset={33.93}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-900 leading-none">
                          85%
                        </span>
                        <span className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">
                          Score
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Almost there!
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Add your bank details and verified credentials to unlock
                        high-priority emergency dispatches.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          Recent Activity
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Live feed
                      </span>
                    </div>

                    <div className="space-y-3">
                      {recentActivities.length === 0 ? (
                        <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <History className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-700">
                            No Recent Activity
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Completed jobs, dispatches, and payouts will appear
                            here in real time.
                          </p>
                        </div>
                      ) : (
                        recentActivities.map((act) => {
                          const IconComp = act.icon;
                          return (
                            <div
                              key={act.id}
                              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100"
                            >
                              <div
                                className={`w-8 h-8 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black text-slate-900">
                                    {act.title}
                                  </p>
                                  <span
                                    className={`text-[10px] font-bold ${act.tagColor}`}
                                  >
                                    {act.tag}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                  {act.subtitle}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {act.time}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Need Support */}
                  <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Need Support?
                      </h3>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Our dedicated partner dispatch desk is available 24/7 to
                      assist with live routes, client coordination, or disputes.
                    </p>
                    <div className="pt-1 flex flex-col gap-2">
                      <a
                        href="tel:+919810111223"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 text-center shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Support (+91 98101 11223)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs sub-tabs when viewing any job-related section on desktop */}
          {["jobs", "active", "requests", "upcoming", "completed"].includes(
            activeTab,
          ) && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Job Operations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage incoming requests, active dispatches, and work history
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (["jobs", "active"].includes(activeTab)
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800")
                  }
                >
                  Active ({activeJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("requests")}
                  className={
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeTab === "requests"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800")
                  }
                >
                  Requests ({newRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upcoming")}
                  className={
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeTab === "upcoming"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800")
                  }
                >
                  Upcoming ({upcomingJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeTab === "completed"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800")
                  }
                >
                  History ({completedJobs.length})
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: ACTIVE JOBS */}
          {["jobs", "active"].includes(activeTab) && (
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
                            <button
                              type="button"
                              onClick={() => openMapNavigation(job)}
                              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-[11px] transition-all hover:bg-emerald-50 text-center cursor-pointer"
                            >
                              <Navigation className="w-4 h-4 text-emerald-600 mb-1" />
                              <span>Map Navigation</span>
                            </button>

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
                        {(() => {
                          const dist = getJobDistanceMeters(job);
                          const isWithin =
                            dist !== null && dist <= ARRIVAL_RADIUS_METERS;

                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                  Job Workflow Stage:
                                </p>
                                {job.status === "ON_THE_WAY" && (
                                  <div className="text-xs">
                                    {geoStatus === "denied" ? (
                                      <span className="text-red-600 font-bold flex items-center gap-1 text-[11px]">
                                        <AlertCircle className="w-3.5 h-3.5" />{" "}
                                        GPS access required
                                      </span>
                                    ) : isWithin ? (
                                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                        At service location (&lt;100m)
                                      </span>
                                    ) : (
                                      <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {dist !== null
                                          ? `${dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist}m`} away from doorstep`
                                          : "Detecting distance..."}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {job.status === "ON_THE_WAY" && (
                                <div className="mb-2">
                                  {geoStatus === "denied" ? (
                                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                                      <span>
                                        Location access is required to confirm
                                        arrival. Please enable GPS permissions.
                                      </span>
                                    </div>
                                  ) : isWithin ? (
                                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                                      <span>
                                        You are at the service location (within
                                        100m). Ready to mark arrived.
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>
                                          {dist !== null
                                            ? `You are ${dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist}m`} away from the customer location. Move closer to mark arrived.`
                                            : "Detecting distance to customer location..."}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          getLiveTechnicianPosition().catch(
                                            () => {},
                                          )
                                        }
                                        className="text-[10px] underline font-bold text-amber-900 shrink-0 cursor-pointer"
                                      >
                                        Update GPS
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

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
                                  onClick={() => handleMarkArrived(job.id)}
                                  disabled={
                                    job.status !== "ON_THE_WAY" ||
                                    actionLoadingId === job.id ||
                                    !isWithin
                                  }
                                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    job.status === "ON_THE_WAY"
                                      ? isWithin
                                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md animate-pulse cursor-pointer"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                      : [
                                            "ARRIVED",
                                            "IN_PROGRESS",
                                            "COMPLETED",
                                          ].includes(job.status)
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  }`}
                                  title={
                                    job.status === "ON_THE_WAY" && !isWithin
                                      ? `Within 100m required (${dist !== null ? `${dist}m away` : "locating..."})`
                                      : "Mark Arrived at Doorstep"
                                  }
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>
                                    {actionLoadingId === job.id &&
                                    job.status === "ON_THE_WAY"
                                      ? "Verifying GPS..."
                                      : "2. Mark Arrived"}
                                  </span>
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
                                  onClick={() => openCompleteConfirm(job)}
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
                            </>
                          );
                        })()}
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
                        onClick={() => openJobDetails(req)}
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
                        type="button"
                        onClick={() => handleDeclineJob(req)}
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
                    Accepted future jobs will appear here in chronological
                    order.
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
                        onClick={() => openJobDetails(job)}
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
                        <p className="italic text-slate-200">
                          "{rev.feedback}"
                        </p>
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
                          job.status === "REJECTED" ||
                          job.status === "DECLINED";

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
                                {job.customer_name || "Customer"} •{" "}
                                {job.address}
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
                          openPayoutModal();
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
                      onClick={() => openPayoutModal()}
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
                      The registered bank account holder name must match the
                      name on your partner registration documents.
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
                    Real-time updates regarding new job assignments, reviews,
                    and payouts
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
                    <p className="text-slate-400 text-[11px]">
                      Completed Orders
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-700">
                      {reviews.length}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Written Reviews
                    </p>
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
                      Customer ratings and verified comments will appear here
                      once jobs are fulfilled.
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
        </div>
      </div>
      {/* End of Desktop View (hidden md:flex) */}

      {/* ========================================================
          MOBILE VIEW (Visible on mobile only: md:hidden)
         ======================================================== */}
      <main className="md:hidden max-w-6xl mx-auto px-4 py-4 space-y-4 pb-28">
        <div className="space-y-4">
          {/* TAB 1: DASHBOARD (activeTab === 'overview') */}
          {activeTab === "overview" && (
            <div className="space-y-3.5">
              {/* Dashboard Title Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Welcome back, {techProfile?.name || "Professional"}
                  </p>
                </div>
              </div>

              {/* 1. TOP SECTION: TASKS FROM ADMIN / OFFICIAL UPDATES */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Tasks from Admin
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Official Updates
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Official Update / Notice */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-950">
                        Delhi NCR Operations Notice
                      </p>
                      <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                        High customer demand for emergency service dispatches in
                        your zone. Keep your availability updated for direct
                        routing.
                      </p>
                    </div>
                  </div>

                  {/* Partner Verification / Compliance Task */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <ShieldCheck
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          techProfile?.status === "Approved"
                            ? "text-emerald-600"
                            : "text-amber-500"
                        }`}
                      />
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          Partner Verification & Compliance
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
                          {techProfile?.status === "Approved"
                            ? "Identity and trade credentials verified (Level 2)"
                            : "Upload required identity document for fast clearance"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToTab("profile")}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 self-center cursor-pointer"
                    >
                      {techProfile?.status === "Approved"
                        ? "Verified"
                        : "Verify"}
                    </button>
                  </div>

                  {/* Training / SOP Update */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          Standard Operating Procedure (SOP)
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
                          Doorstep arrival verification (≤100m) & complete
                          service signoff
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 self-center">
                      Active
                    </span>
                  </div>

                  {/* Service Area / Policy Update */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Globe className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          Service Area & Response Policy
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
                          Assigned:{" "}
                          {techProfile?.service_areas ||
                            "Delhi NCR (All Zones)"}{" "}
                          • Emergency arrival ETA: ≤30 mins
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToTab("profile")}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900 shrink-0 self-center cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. BOTTOM / MAIN SECTION: PROFESSIONAL OVERVIEW */}
              <div className="space-y-3.5">
                {/* Overview Section Header */}
                <div className="flex items-center justify-between pt-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Professional Overview
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Real-time statistics
                  </span>
                </div>

                {/* 2.1 Job statistics & earnings summary (6 cards in 2 columns) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Today's Earnings */}
                  <button
                    onClick={() => navigateToTab("earnings")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-left hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Today's Earnings
                      </span>
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-lg font-black text-emerald-700 mt-1">
                      {metrics.todayEarningsFormatted}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Completed today
                    </p>
                  </button>

                  {/* Total Earnings */}
                  <button
                    onClick={() => navigateToTab("earnings")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-left hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Earnings
                      </span>
                      <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {metrics.earningsFormatted}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      All-time revenue
                    </p>
                  </button>

                  {/* Active Jobs */}
                  <button
                    onClick={() => navigateToTab("jobs", "active")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-left hover:border-sky-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Active Jobs
                      </span>
                      <Wrench className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <p className="text-lg font-black text-sky-800 mt-1">
                      {activeJobs.length}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {activeJobs.length === 1
                        ? "1 in progress"
                        : `${activeJobs.length} in progress`}
                    </p>
                  </button>

                  {/* Completed Jobs */}
                  <button
                    onClick={() => navigateToTab("jobs", "completed")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-left hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Completed Jobs
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {metrics.completedCount || metrics.totalJobs}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Verified orders
                    </p>
                  </button>

                  {/* Pending Requests */}
                  <button
                    onClick={() => navigateToTab("jobs", "requests")}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-left hover:border-amber-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pending Requests
                      </span>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <p className="text-lg font-black text-amber-700 mt-1">
                      {newRequests.length}
                    </p>
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting action
                    </p>
                  </button>

                  {/* Customer Rating */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Customer Rating
                      </span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    </div>
                    <p className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1">
                      ★ {metrics.rating}
                      <span className="text-[11px] text-slate-400 font-normal">
                        / 5.0
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Verified reviews
                    </p>
                  </div>
                </div>

                {/* 2.2 Availability Status Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Power
                        className={`w-4 h-4 ${isOnline ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                        Current Availability Status
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOnline
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isOnline
                      ? "You are Online and ready to receive emergency dispatch requests in your active service zone."
                      : "You are currently Offline. Bookings and new emergency dispatches are paused."}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isOnline
                        ? "Tap to pause incoming orders"
                        : "Tap to start receiving orders"}
                    </span>
                    <button
                      onClick={handleToggleOnline}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isOnline
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-emerald-700 text-white hover:bg-emerald-800"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOnline ? "Go Offline" : "Go Online"}</span>
                    </button>
                  </div>
                </div>

                {/* 2.3 Upcoming Job */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                        Upcoming Job
                      </h3>
                    </div>
                    {displayUpcomingJobs.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {displayUpcomingJobs.length} Scheduled
                      </span>
                    )}
                  </div>

                  {displayUpcomingJobs.length > 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {displayUpcomingJobs[0].service_name ||
                              displayUpcomingJobs[0].category ||
                              "Emergency Service"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {displayUpcomingJobs[0].address ||
                                "Customer Location"}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                          {displayUpcomingJobs[0].scheduled_time || "Scheduled"}
                        </span>
                      </div>
                      <button
                        onClick={() => navigateToTab("jobs", "upcoming")}
                        className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center justify-center gap-1 cursor-pointer pt-1"
                      >
                        <span>View in Jobs</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600">
                        No upcoming jobs scheduled
                      </p>
                      <p className="text-[11px]">
                        When new appointments are scheduled, they will appear
                        here.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2.4 Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                        Recent Activity
                      </h3>
                    </div>
                    <button
                      onClick={() => navigateToTab("jobs", "completed")}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {recentActivities.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600">
                        No recent activity
                      </p>
                      <p className="text-[11px]">
                        Completed jobs and dispatch updates will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentActivities.slice(0, 3).map((act) => {
                        const IconComp = act.icon;
                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0`}
                              >
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {act.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {act.subtitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p
                                className={`font-black text-xs ${act.tagColor}`}
                              >
                                {act.tag}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {act.time}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOBS (activeTab is in 'jobs', 'active', 'requests', 'upcoming', 'completed') */}
          {["jobs", "active", "requests", "upcoming", "completed"].includes(
            activeTab,
          ) && (
            <div className="space-y-3.5">
              {/* Jobs Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Jobs
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeJobs.length} active • {newRequests.length} new
                    request{newRequests.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Segmented Sub-Navigation for Jobs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMobileJobsTab("active")}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    mobileJobsTab === "active"
                      ? "bg-white text-emerald-900 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active ({activeJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileJobsTab("requests")}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer relative ${
                    mobileJobsTab === "requests"
                      ? "bg-white text-emerald-900 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Requests</span>
                  {newRequests.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-black">
                      {newRequests.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileJobsTab("upcoming")}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    mobileJobsTab === "upcoming"
                      ? "bg-white text-emerald-900 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Upcoming ({upcomingJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileJobsTab("completed")}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    ["history", "completed"].includes(mobileJobsTab)
                      ? "bg-white text-emerald-900 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Completed ({completedJobs.length})
                </button>
              </div>

              {/* Sub-tab: ACTIVE JOBS */}
              {mobileJobsTab === "active" && (
                <div className="space-y-3">
                  {filteredActiveJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-2xs space-y-2">
                      <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        No Active Jobs Right Now
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        When you accept an emergency customer booking, you can
                        track dispatch and complete it here.
                      </p>
                    </div>
                  ) : (
                    filteredActiveJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              {job.status === "ON_THE_WAY" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              )}
                              <span>
                                {job.status === "ON_THE_WAY"
                                  ? "On The Way"
                                  : job.status}
                              </span>
                            </span>
                            <span className="text-xs text-slate-400 font-bold ml-2">
                              #{job.id}
                            </span>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                            ₹{job.total_amount || 499}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            {job.service_name || job.category}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Customer: {job.customer_name || "Verified Customer"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{job.address}</span>
                          </p>
                        </div>

                        {/* Navigation & Contact Bar */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openMapNavigation(job)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Map Navigation</span>
                          </button>

                          {job.customer_phone && (
                            <a
                              href={`tel:${job.customer_phone}`}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Call Customer"
                            >
                              <Phone className="w-4 h-4 text-emerald-700" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => openJobDetails(job)}
                            className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Details
                          </button>
                        </div>

                        {/* Workflow Action Button */}
                        <div className="pt-1">
                          {["ACCEPTED", "ASSIGNED"].includes(job.status) && (
                            <button
                              type="button"
                              onClick={() => handleStartTrip(job.id)}
                              disabled={actionLoadingId === job.id}
                              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>
                                {actionLoadingId === job.id
                                  ? "Starting Trip..."
                                  : "Start Trip (On The Way)"}
                              </span>
                            </button>
                          )}

                          {job.status === "ON_THE_WAY" &&
                            (() => {
                              const dist = getJobDistanceMeters(job);
                              const isWithin =
                                dist !== null && dist <= ARRIVAL_RADIUS_METERS;

                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Navigation className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                                      <span>Trip Started / On The Way</span>
                                    </span>
                                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase">
                                      En Route
                                    </span>
                                  </div>

                                  {/* Proximity Indicator */}
                                  {geoStatus === "denied" ? (
                                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                                      <span>
                                        Location access is required to confirm
                                        arrival. Please enable GPS permissions.
                                      </span>
                                    </div>
                                  ) : isWithin ? (
                                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                                      <span>
                                        You are at the service location (within
                                        100m).
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>
                                          {dist !== null
                                            ? `You are ${dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist}m`} away from the customer location. Move closer to mark arrived.`
                                            : "Detecting distance to customer location..."}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          getLiveTechnicianPosition().catch(
                                            () => {},
                                          )
                                        }
                                        className="text-[10px] underline font-bold text-amber-900 shrink-0 cursor-pointer"
                                      >
                                        Refresh GPS
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleMarkArrived(job.id)}
                                    disabled={
                                      actionLoadingId === job.id || !isWithin
                                    }
                                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                                      isWithin
                                        ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                    }`}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>
                                      {actionLoadingId === job.id
                                        ? "Verifying GPS..."
                                        : isWithin
                                          ? "Mark Arrived at Doorstep"
                                          : "Reach Doorstep (<100m) to Mark Arrived"}
                                    </span>
                                  </button>
                                </div>
                              );
                            })()}

                          {job.status === "ARRIVED" && (
                            <button
                              onClick={() => handleStartWork(job.id)}
                              disabled={actionLoadingId === job.id}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Start Work</span>
                            </button>
                          )}

                          {job.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => openCompleteConfirm(job)}
                              disabled={actionLoadingId === job.id}
                              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Job & Signoff</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-tab: JOB REQUESTS */}
              {mobileJobsTab === "requests" && (
                <div className="space-y-3">
                  {filteredNewRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-2xs space-y-2">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        No Pending Requests
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        New emergency service requests matching your trade will
                        appear here when customers place bookings.
                      </p>
                    </div>
                  ) : (
                    filteredNewRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl border-2 border-emerald-500/40 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                            <span>Emergency Dispatch</span>
                          </span>
                          <span className="text-sm font-black text-emerald-800">
                            ₹{req.total_amount || 499}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            {req.service_name || req.category}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">
                            Customer: {req.customer_name || "Verified Customer"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{req.address}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAcceptJob(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs cursor-pointer shadow-xs text-center transition-colors"
                          >
                            {actionLoadingId === req.id
                              ? "Accepting..."
                              : "Accept Job"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineJob(req)}
                            disabled={actionLoadingId === req.id}
                            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs cursor-pointer text-center transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-tab: UPCOMING JOBS */}
              {mobileJobsTab === "upcoming" && (
                <div className="space-y-3">
                  {filteredUpcomingJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-2xs space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        No Upcoming Bookings
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Scheduled appointments for future dates and slots will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    filteredUpcomingJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            <span>
                              {job.scheduled_date || "Upcoming Booking"}
                            </span>
                          </span>
                          <span className="font-black text-slate-900">
                            ₹{job.total_amount || 499}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          {job.service_name || job.category}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {job.address}
                        </p>
                        <button
                          onClick={() => openJobDetails(job)}
                          className="w-full py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          View Booking Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-tab: HISTORY / COMPLETED */}
              {["history", "completed"].includes(mobileJobsTab) && (
                <div className="space-y-3">
                  {filteredCompletedJobs.length === 0 &&
                  filteredCancelledJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-2xs space-y-2">
                      <History className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        No History Records
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Past completed jobs and billing summaries will be listed
                        here.
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredCompletedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Completed</span>
                            </span>
                            <span className="text-sm font-black text-emerald-800">
                              +₹{job.total_amount || 499}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {job.service_name || job.category}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {job.address}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Completed on:{" "}
                            {job.completed_at || job.date || "Recent"}
                          </p>
                        </div>
                      ))}
                      {filteredCancelledJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2 opacity-80"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-red-800 bg-red-50 px-2 py-0.5 rounded-md">
                              Cancelled
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              #{job.id}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-700">
                            {job.service_name || job.category}
                          </h4>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EARNINGS (activeTab is in 'earnings', 'payout_setup') */}
          {["earnings", "payout_setup"].includes(activeTab) && (
            <div className="space-y-3.5">
              {/* Earnings Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Earnings
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Wallet balance & payout settlements
                  </p>
                </div>
              </div>

              {/* Available Balance Card with Withdraw Action */}
              <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-md border border-emerald-900 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Available for Payout
                </span>
                <p className="text-3xl font-black text-white">
                  {metrics.availableBalanceFormatted || "₹0"}
                </p>
                <p className="text-xs text-slate-300">
                  Pending Settlements: {metrics.pendingBalanceFormatted || "₹0"}
                </p>
                <button
                  onClick={() => {
                    if (!bankAccount.isConnected) {
                      handleOpenBankModal();
                    } else {
                      openPayoutModal();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>
                    {bankAccount.isConnected
                      ? "Withdraw Payout"
                      : "Connect Bank to Withdraw"}
                  </span>
                </button>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Today
                  </span>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">
                    {metrics.todayEarningsFormatted}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    This Week
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {metrics.weekEarningsFormatted}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    All-Time
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {metrics.earningsFormatted}
                  </p>
                </div>
              </div>

              {/* Bank Account Connection Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Payout Bank Account
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bankAccount.isConnected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {bankAccount.isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-0.5">
                  <p className="font-bold text-slate-900">
                    {bankAccount.bankName || "No Bank Added"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Account: {bankAccount.accountNumberMasked || "Not linked"} •
                    IFSC: {bankAccount.ifsc || "N/A"}
                  </p>
                </div>
                <button
                  onClick={handleOpenBankModal}
                  className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {bankAccount.isConnected
                    ? "Update Bank Details"
                    : "Add Bank Account"}
                </button>
              </div>

              {/* Recent Transactions & Payout History */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Activity & Payouts
                </h3>
                {recentTransactions.length === 0 &&
                payoutHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No transactions recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentTransactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{tx.note}</p>
                          <p className="text-[10px] text-slate-400">
                            {tx.timestamp}
                          </p>
                        </div>
                        <span
                          className={`font-black ${
                            tx.type === "CREDIT"
                              ? "text-emerald-700"
                              : "text-slate-800"
                          }`}
                        >
                          {tx.amountFormatted}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS (activeTab === 'notifications') */}
          {activeTab === "notifications" && (
            <div className="space-y-3.5">
              {/* Notifications Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {unreadNotificationsCount} unread update
                    {unreadNotificationsCount === 1 ? "" : "s"}
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    disabled={isMarkingNotifications}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-2xs space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">
                      No Notifications
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Real job requests, dispatch status changes, and payout
                      settlements will be notified here.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notif.unread
                          ? "bg-white border-emerald-300 shadow-xs"
                          : "bg-white/80 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900 truncate">
                              {notif.title}
                            </p>
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-slate-400 text-[10px] mt-1">
                            {notif.time || "Just now"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE (activeTab === 'profile') */}
          {activeTab === "profile" && (
            <div className="space-y-3.5">
              {/* Profile Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Profile
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Professional credentials & settings
                  </p>
                </div>
              </div>

              {/* Identity & Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      techProfile?.avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    }
                    alt={techProfile?.name || "Technician"}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-900 truncate">
                      {techProfile?.name || "Professional"}
                    </h3>
                    <p className="text-xs text-emerald-800 font-bold">
                      {techProfile?.category || "Plumbing"} Specialist
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>{techProfile?.rating || "4.9"}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Partner ID: #{techProfile?.id || "TECH-101"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile Phone:</span>
                    <span className="font-bold text-slate-900">
                      {techProfile?.phone || "+91 98101 11223"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registered Email:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">
                      {techProfile?.email || "partner@argentyour.com"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-bold text-slate-900">
                      {techProfile?.experience_years || 3}+ Years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-bold text-slate-900">
                      {techProfile?.vehicle_type || "Rapid Response Van"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Edit Profile Details</span>
                </button>
              </div>

              {/* Verification & Documents Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Verification & Documents
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      techProfile?.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {techProfile?.status || "Pending Verification"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Government ID & Trade Proof
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {techProfile?.id_document_url
                            ? "Verified Government Trade ID Document"
                            : "Trade credentials verified on file"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      Level 2 Verified
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Verified background and trade credentials by Argent Your
                  Operations.
                </p>
              </div>

              {/* Service & Trade Information Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Service Information
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Trade Skills:
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {techProfile?.skills ||
                        "General Emergency Service, Rapid Diagnostics, Safety Protocols"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Operating Zones:
                    </span>
                    <p className="font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-0.5">
                      {techProfile?.service_areas || "Delhi NCR (All Zones)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank & Payouts Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Bank & Payouts
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bankAccount.isConnected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {bankAccount.isConnected ? "Connected" : "Action Needed"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="font-bold text-slate-900">
                      {bankAccount.bankName || "HDFC Bank (Primary)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account:</span>
                    <span className="font-bold text-slate-900">
                      {bankAccount.accountNumberMasked || "•••• •••• 8821"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-bold text-slate-900">
                      {bankAccount.ifsc || "HDFC0001234"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payout Status:</span>
                    <span className="font-bold text-emerald-700">
                      {bankAccount.payoutStatus || "Active (Direct Transfer)"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenBankModal}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {bankAccount.isConnected
                      ? "Update Bank Details"
                      : "Setup Bank Account"}
                  </span>
                </button>
              </div>

              {/* Account Settings Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Settings className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Account Settings
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        Emergency Dispatch Alerts
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Audio and push alerts for leads
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Enabled
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        Password & Security
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Direct password login enabled
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        Partner Help Desk
                      </p>
                      <p className="text-[11px] text-slate-500">
                        24/7 dedicated support
                      </p>
                    </div>
                    <a
                      href="tel:+919810111223"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Call Support
                    </a>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Technician Portal</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          MOBILE BOTTOM FIXED NAVIGATION (5 Items ONLY)
         ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 flex items-center justify-around shadow-lg">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => handleBottomNavClick("overview")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "overview"
              ? "text-emerald-700 font-black"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 ${
              activeTab === "overview" ? "text-emerald-700" : "text-slate-400"
            }`}
          />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* 2. Jobs */}
        <button
          type="button"
          onClick={() => handleBottomNavClick("jobs")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            ["jobs", "active", "requests", "upcoming", "completed"].includes(
              activeTab,
            )
              ? "text-emerald-700 font-black"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div className="relative">
            <Wrench
              className={`w-5 h-5 ${
                [
                  "jobs",
                  "active",
                  "requests",
                  "upcoming",
                  "completed",
                ].includes(activeTab)
                  ? "text-emerald-700"
                  : "text-slate-400"
              }`}
            />
            {newRequests.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {newRequests.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Jobs</span>
        </button>

        {/* 3. Earnings */}
        <button
          type="button"
          onClick={() => handleBottomNavClick("earnings")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            ["earnings", "payout_setup"].includes(activeTab)
              ? "text-emerald-700 font-black"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <DollarSign
            className={`w-5 h-5 ${
              ["earnings", "payout_setup"].includes(activeTab)
                ? "text-emerald-700"
                : "text-slate-400"
            }`}
          />
          <span className="text-[10px]">Earnings</span>
        </button>

        {/* 4. Notifications */}
        <button
          type="button"
          onClick={() => handleBottomNavClick("notifications")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === "notifications"
              ? "text-emerald-700 font-black"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <div className="relative">
            <Bell
              className={`w-5 h-5 ${
                activeTab === "notifications"
                  ? "text-emerald-700"
                  : "text-slate-400"
              }`}
            />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Notifications</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => handleBottomNavClick("profile")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "text-emerald-700 font-black"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          <User
            className={`w-5 h-5 ${
              activeTab === "profile" ? "text-emerald-700" : "text-slate-400"
            }`}
          />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

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
                onClick={() => {
                  if (window.history.state?.modal) {
                    window.history.back();
                  } else {
                    setCompleteConfirmJob(null);
                  }
                }}
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

      {/* Decline Job Request Confirmation Dialog */}
      {declineConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Decline this job request?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to decline order #{declineConfirmJob.id} (
                {declineConfirmJob.service_name ||
                  declineConfirmJob.category ||
                  "Service"}
                )? This request will be removed and assigned to other available
                professionals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.history.state?.modal) {
                    window.history.back();
                  } else {
                    setDeclineConfirmJob(null);
                  }
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={actionLoadingId === declineConfirmJob.id}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
              >
                {actionLoadingId === declineConfirmJob.id
                  ? "Declining..."
                  : "Decline Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Map Navigation Bottom Sheet / Modal */}
      {navigationJob && (
        <InAppMapNavigationSheet
          job={navigationJob}
          technicianCoords={currentTechCoords}
          onClose={() => {
            if (window.history.state?.modal) {
              window.history.back();
            } else {
              setNavigationJob(null);
            }
          }}
          onStatusUpdate={async (jobId, newStatus, label, coords = null) => {
            if (newStatus === "ARRIVED") {
              await handleMarkArrived(jobId, coords);
            } else {
              await handleStatusTransition(jobId, newStatus, label);
            }
            setNavigationJob((prev) =>
              prev ? { ...prev, status: newStatus } : null,
            );
          }}
          actionLoading={actionLoadingId === navigationJob.id}
        />
      )}

      {/* View Job Details Modal */}
      {selectedJobForModal && (
        <TechnicianJobDetailsModal
          job={selectedJobForModal}
          onClose={() => {
            if (window.history.state?.modal) {
              window.history.back();
            } else {
              setSelectedJobForModal(null);
            }
          }}
          onAccept={handleAcceptJob}
          onReject={handleRejectJob}
          onOpenMapNavigation={(j) => openMapNavigation(j)}
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
                onClick={() => {
                  if (window.history.state?.modal) {
                    window.history.back();
                  } else {
                    setShowEditProfile(false);
                  }
                }}
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
                  onClick={() => {
                    if (window.history.state?.modal) {
                      window.history.back();
                    } else {
                      setShowEditProfile(false);
                    }
                  }}
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
                onClick={() => {
                  if (window.history.state?.modal) {
                    window.history.back();
                  } else {
                    setShowBankModal(false);
                  }
                }}
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
                  onClick={() => {
                    if (window.history.state?.modal) {
                      window.history.back();
                    } else {
                      setShowBankModal(false);
                    }
                  }}
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
                onClick={() => {
                  if (window.history.state?.modal) {
                    window.history.back();
                  } else {
                    setShowPayoutModal(false);
                  }
                }}
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
                  onClick={() => {
                    if (window.history.state?.modal) {
                      window.history.back();
                    } else {
                      setShowPayoutModal(false);
                    }
                  }}
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
