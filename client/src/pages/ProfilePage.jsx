import React, { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Award,
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FlipHorizontal,
  Heart,
  HelpCircle,
  History,
  Image as ImageIcon,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Moon,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  User,
  UserCheck,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { allServicesCatalog } from "../data/servicesData";
import userStore from "../services/userStore";
import { promotionsData } from "../data/promotionsData";

function AvatarSourceModal({
  isOpen,
  onClose,
  currentAvatar,
  onSave,
  showToast,
}) {
  const [mode, setMode] = useState("select"); // "select" | "camera" | "preview" | "camera-fallback"
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [facingMode, setFacingMode] = useState("user");

  const videoRef = useRef(null);
  const galleryInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const handleClose = () => {
    stopCamera();
    setMode("select");
    setPreviewImage(null);
    setValidationError("");
    setCameraError("");
    onClose();
  };

  const startCamera = async (facing = facingMode) => {
    stopCamera();
    setCameraError("");
    setValidationError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Live camera is not supported on this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      setCameraStream(stream);
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 60);
    } catch (err) {
      console.warn("Live camera access failed:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser or use Choose from Gallery."
          : "Could not access device camera directly. You can use your device's native camera or choose from gallery.",
      );
      setMode("camera-fallback");
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setPreviewImage(dataUrl);
    setMode("preview");
  };

  const processImageFile = (file) => {
    setValidationError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const hasValidExt = validExtensions.some((ext) =>
      file.name?.toLowerCase().endsWith(ext),
    );

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setValidationError(
        "Unsupported file format. Please choose a JPG, JPEG, PNG, or WEBP photo.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError(
        "Image size exceeds 10MB limit. Please choose a smaller photo.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      stopCamera();
      setPreviewImage(e.target?.result);
      setMode("preview");
    };
    reader.onerror = () => {
      setValidationError(
        "Failed to read image file. Please try another image.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = "";
  };

  const handleSave = () => {
    if (!previewImage) return;
    onSave(previewImage);
    showToast?.("Profile photo updated successfully!");
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Camera className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {mode === "camera"
                ? "Take Photo"
                : mode === "preview"
                  ? "Preview Profile Photo"
                  : "Profile Photo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hidden File Pickers */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={handleGalleryChange}
        />
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleGalleryChange}
        />

        {validationError && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* MODE 1: SOURCE SELECTION */}
        {mode === "select" && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative">
                <img
                  src={currentAvatar}
                  alt="Current Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100 shadow-md"
                />
                <span className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-1.5 text-white shadow-xs">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Choose an image source below:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={() => startCamera()}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-600 hover:bg-emerald-50/50 hover:shadow-sm cursor-pointer"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 transition-transform group-hover:scale-105">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                    <span>📷 Take Photo</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open device camera & capture a live photo
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-600 hover:bg-emerald-50/50 hover:shadow-sm cursor-pointer"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 transition-transform group-hover:scale-105">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                    <span>🖼️ Choose from Gallery</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select photo from device gallery (JPG, JPEG, PNG, WEBP)
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: LIVE CAMERA STREAM */}
        {mode === "camera" && (
          <div className="mt-4 space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-square flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="h-56 w-56 rounded-full border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setMode("select");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                title="Switch camera"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <FlipHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: CAMERA FALLBACK IF PERMISSION DENIED */}
        {mode === "camera-fallback" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-700" />
                <span>Camera Notice</span>
              </div>
              <p>{cameraError}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer shadow-sm"
              >
                <Camera className="h-4 w-4" />
                <span>Open Device Camera</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Choose from Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("select")}
                className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Back to Image Options
              </button>
            </div>
          </div>
        )}

        {/* MODE 4: PREVIEW AND CONFIRM */}
        {mode === "preview" && (
          <div className="mt-5 space-y-5 text-center">
            <div className="flex flex-col items-center">
              <img
                src={previewImage}
                alt="New Profile"
                className="h-36 w-36 rounded-full object-cover border-4 border-emerald-600 shadow-xl"
              />
              <p className="mt-3 text-xs font-bold text-emerald-800">
                Photo ready to set as profile picture
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                Save as Profile Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setMode("select");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Retake / Choose Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({
  initialTab = "overview",
  onTabChange,
  onHome,
  onBack,
  onNavigateToService,
  onBookService,
  onNavigateAdmin,
  onNavigateTechnician,
  standaloneBookings = false,
  isGuest = false,
  onAuthOpen,
}) {
  const { user, updateUser, logout } = useAuth();
  const { socket, joinRoom } = useSocket();

  const formatBookingDate = (date) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(date);
  const availableRescheduleDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return { value: date.toISOString().slice(0, 10), label: formatBookingDate(date) };
  });
  const rescheduleSlots = ["09:00 AM - 10:30 AM", "12:00 PM - 01:30 PM", "03:30 PM - 05:00 PM", "06:00 PM - 07:30 PM"];

  // Active Menu Navigation Tab
  // 'overview' | 'bookings' | 'addresses' | 'payments' | 'saved' | 'notifications' | 'offers' | 'support' | 'settings' | 'logout'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Mobile horizontal scroll navigation references
  const mobileNavScrollRef = useRef(null);
  const mobileTabRefs = useRef({});

  const handleTabClick = (tabId) => {
    if (tabId === "logout") {
      setIsLogoutModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
    if (mobileTabRefs.current[tabId]) {
      mobileTabRefs.current[tabId].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onHome?.();
    }
  };

  // Automatically scroll selected tab into view when activeTab changes
  useEffect(() => {
    if (mobileTabRefs.current[activeTab]) {
      mobileTabRefs.current[activeTab].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  // Booking status filter in My Bookings tab: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'
  const [bookingFilter, setBookingFilter] = useState("all");

  // Guest booking lookup state
  const [guestTrackingInput, setGuestTrackingInput] = useState("");
  const [guestTrackingError, setGuestTrackingError] = useState("");

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] =
    useState(null);
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [editAddressTarget, setEditAddressTarget] = useState(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "Rahul Sharma",
    email: user?.email || "rahul.sharma@example.com",
    phone: user?.phone || "+91 98765 43210",
    address:
      user?.address ||
      "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
    avatar:
      localStorage.getItem("profile_avatar") ||
      user?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  });

  const [toastMessage, setToastMessage] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveAvatar = (newAvatar) => {
    setProfileForm((prev) => ({ ...prev, avatar: newAvatar }));
    try {
      localStorage.setItem("profile_avatar", newAvatar);
    } catch {
      // Storage quota safety
    }
    if (user && updateUser) {
      updateUser({ ...user, avatar: newAvatar });
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        avatar:
          localStorage.getItem("profile_avatar") || user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  // Real Persistent Bookings Data
  const [bookings, setBookings] = useState(() => {
    return [];
  });

  useEffect(() => {
    if (user?.id) {
      userStore.fetchBookingsFromApi(user.id)
        .then(setBookings)
        .catch((error) => showToast(error.message));
    } else {
      setBookings([]);
    }
  }, [user?.id]);

  // Saved Addresses
  const [addresses, setAddresses] = useState(() => {
    return userStore.getAddresses(user?.id, user);
  });

  useEffect(() => {
    setAddresses(userStore.getAddresses(user?.id, user));
  }, [user?.id]);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState(() => {
    return userStore.getPaymentMethods(user?.id);
  });

  useEffect(() => {
    setPaymentMethods(userStore.getPaymentMethods(user?.id));
  }, [user?.id]);

  // Saved / Wishlisted Services
  const [savedServicesList, setSavedServicesList] = useState(() => {
    return userStore.getSavedServices(user?.id);
  });

  useEffect(() => {
    setSavedServicesList(userStore.getSavedServices(user?.id));
  }, [user?.id]);

  // Notifications List
  const [notifications, setNotifications] = useState(() => {
    return userStore.getNotifications(user?.id);
  });

  useEffect(() => {
    const localNotifs = userStore.getNotifications(user?.id);
    setNotifications(localNotifs);
    if (user?.id) {
      userStore.fetchNotificationsFromApi(user.id).then((apiNotifs) => {
        if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          setNotifications(apiNotifs);
        }
      });
    }
  }, [user?.id]);

  // Rating modal states
  const [ratingTargetBooking, setRatingTargetBooking] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TKT-8491",
      category: "AC Cooling Inquiry",
      subject: "Post-service cooling follow-up question",
      status: "Under Review",
      created: "Yesterday",
      priority: "Normal",
    },
  ]);

  // Live Chat messages state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "agent",
      text: "Hello! Welcome to Argent Your Doorstep Support. How can we assist your home service today?",
      time: "Just now",
    },
  ]);
  const [inputChatMessage, setInputChatMessage] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // Settings State
  const [settingsState, setSettingsState] = useState({
    smsUpdates: true,
    whatsappAlerts: true,
    promoEmails: false,
    darkMode: false,
    language: "English",
  });

  // Location detection spinner state
  const [isLocating, setIsLocating] = useState(false);

  // Form State for Add Address Modal
  const [newAddressForm, setNewAddressForm] = useState({
    type: "Home",
    recipient: profileForm.name,
    phone: profileForm.phone,
    line1: "",
    line2: "",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "",
    isDefault: false,
  });

  // Form State for Add Payment Modal
  const [paymentTab, setPaymentTab] = useState("card"); // 'card' | 'upi' | 'netbanking'
  const [newPaymentForm, setNewPaymentForm] = useState({
    cardNumber: "",
    cardholder: profileForm.name,
    expiry: "",
    cvv: "",
    brand: "Visa",
    upiId: "",
    bankName: "HDFC Bank",
    isDefault: false,
  });

  // Reschedule Form state
  const [rescheduleDate, setRescheduleDate] = useState(availableRescheduleDates[0].value);
  const [rescheduleTime, setRescheduleTime] = useState("12:00 PM - 01:30 PM");

  // Cancel Form state
  const [cancelReason, setCancelReason] = useState("Change of plans");
  const [cancelNotes, setCancelNotes] = useState("");

  // Raise Ticket Form state
  const [ticketCategory, setTicketCategory] = useState("Service Quality");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({ ...user, ...profileForm });
    setIsEditProfileOpen(false);
    showToast("Profile information updated successfully!");
  };

  // Real GPS Geolocation for Address
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    showToast("Detecting your GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            },
          );

          if (!res.ok) throw new Error("Reverse geocoding failed");

          const data = await res.json();
          const addr = data.address || {};

          const road =
            addr.road || addr.street || addr.neighbourhood || addr.suburb || "";
          const houseNumber = addr.house_number || "";
          const line1 = houseNumber
            ? `${houseNumber}, ${road}`
            : road || "Detected Location";
          const line2 =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            "Sector 62";
          const city = addr.city || addr.town || addr.county || "Noida";
          const state = addr.state || "Uttar Pradesh";
          const postalCode = addr.postcode || "201304";

          setNewAddressForm((prev) => ({
            ...prev,
            line1: line1 || prev.line1,
            line2: line2 || prev.line2,
            city: city || prev.city,
            state: state || prev.state,
            postalCode: postalCode || prev.postalCode,
          }));

          showToast("Address populated from your live GPS location!");
        } catch (err) {
          console.error("Geocoding lookup error:", err);
          showToast("GPS detected! Please enter street name.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          showToast(
            "Location permission was denied. Please enter address manually.",
          );
        } else {
          showToast(
            "Unable to get GPS fix. Please enter address details manually.",
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Add Address Handler
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.line1 || !newAddressForm.postalCode) {
      showToast("Please fill in the required address fields.");
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      ...newAddressForm,
    };

    if (newAddressForm.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr),
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }

    setIsAddAddressOpen(false);
    setNewAddressForm({
      type: "Home",
      recipient: profileForm.name,
      phone: profileForm.phone,
      line1: "",
      line2: "",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "",
      isDefault: false,
    });
    showToast("New service address added successfully!");
  };

  // Update Address Handler
  const handleUpdateAddress = (e) => {
    e.preventDefault();
    if (!editAddressTarget) return;

    setAddresses((prev) =>
      prev.map((a) =>
        a.id === editAddressTarget.id ? { ...editAddressTarget } : a,
      ),
    );
    setEditAddressTarget(null);
    showToast("Address updated successfully.");
  };

  // Set Default Address
  const handleSetDefaultAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast("Default service address updated.");
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast("Address removed.");
  };

  // Add Payment Method Handler
  const handleAddPayment = (e) => {
    e.preventDefault();

    let newPaymentItem = null;

    if (paymentTab === "card") {
      const cleanNum = newPaymentForm.cardNumber.replace(/\s+/g, "");
      if (cleanNum.length < 12) {
        showToast("Please enter a valid 16-digit card number.");
        return;
      }
      const last4 = cleanNum.slice(-4);
      newPaymentItem = {
        id: `card-${Date.now()}`,
        brand: newPaymentForm.brand || "Visa",
        maskedNumber: `•••• •••• •••• ${last4}`,
        cardholder: newPaymentForm.cardholder || profileForm.name,
        expiry: newPaymentForm.expiry || "12/29",
        isDefault: newPaymentForm.isDefault,
        type: "Credit / Debit Card",
      };
    } else if (paymentTab === "upi") {
      if (!newPaymentForm.upiId || !newPaymentForm.upiId.includes("@")) {
        showToast("Please enter a valid UPI ID (e.g. name@okaxis).");
        return;
      }
      newPaymentItem = {
        id: `upi-${Date.now()}`,
        brand: "UPI",
        maskedNumber: newPaymentForm.upiId,
        cardholder: profileForm.name,
        expiry: "N/A",
        isDefault: newPaymentForm.isDefault,
        type: "UPI ID",
      };
    } else {
      newPaymentItem = {
        id: `nb-${Date.now()}`,
        brand: "Net Banking",
        maskedNumber: newPaymentForm.bankName,
        cardholder: profileForm.name,
        expiry: "Active",
        isDefault: newPaymentForm.isDefault,
        type: "Net Banking",
      };
    }

    if (newPaymentForm.isDefault) {
      setPaymentMethods((prev) =>
        prev.map((p) => ({ ...p, isDefault: false })).concat(newPaymentItem),
      );
    } else {
      setPaymentMethods((prev) => [...prev, newPaymentItem]);
    }

    setIsAddPaymentOpen(false);
    setNewPaymentForm({
      cardNumber: "",
      cardholder: profileForm.name,
      expiry: "",
      cvv: "",
      brand: "Visa",
      upiId: "",
      bankName: "HDFC Bank",
      isDefault: false,
    });
    showToast("Payment method securely saved.");
  };

  // Set Default Payment
  const handleSetDefaultPayment = (id) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id })),
    );
    showToast("Default payment method updated.");
  };

  // Delete Payment
  const handleDeletePayment = (id) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    showToast("Payment method removed.");
  };

  // Reschedule Booking Handler
  const handleConfirmReschedule = async () => {
    if (!rescheduleBookingTarget) return;
    try {
      const updated = await userStore.rescheduleBooking(user?.id, rescheduleBookingTarget.id, rescheduleDate, rescheduleTime);
      if (updated) setBookings(updated);
      showToast(`Booking #${rescheduleBookingTarget.id} rescheduled to ${rescheduleDate} (${rescheduleTime})!`);
      setRescheduleBookingTarget(null);
    } catch (error) {
      showToast(error.message);
    }
  };

  const openReschedule = (booking) => {
    const savedDate = /^\d{4}-\d{2}-\d{2}$/.test(booking.scheduledDate || "") ? booking.scheduledDate : availableRescheduleDates[0].value;
    setRescheduleDate(availableRescheduleDates.some((d) => d.value === savedDate) ? savedDate : availableRescheduleDates[0].value);
    setRescheduleTime(rescheduleSlots.includes(booking.scheduledTime) ? booking.scheduledTime : rescheduleSlots[0]);
    setRescheduleBookingTarget(booking);
  };

  useEffect(() => {
    if (!socket || !user?.id) return undefined;
    const activeIds = bookings.map((booking) => booking.id);
    activeIds.forEach((id) => joinRoom(`request_${id}`));
    const refreshBookings = () => userStore.fetchBookingsFromApi(user.id).then(setBookings);
    socket.on("request_updated", refreshBookings);
    return () => socket.off("request_updated", refreshBookings);
  }, [socket, user?.id, bookings.map((booking) => booking.id).join(",")]);

  // Cancel Booking Handler
  const handleConfirmCancellation = async () => {
    if (!cancelBookingTarget) return;
    try {
      const updated = await userStore.cancelBooking(user?.id, cancelBookingTarget.id, cancelReason);
      if (updated) setBookings(updated);
      showToast(`Booking #${cancelBookingTarget.id} has been cancelled. Refund initiated if applicable.`);
      setCancelBookingTarget(null);
    } catch (error) {
      showToast(error.message);
    }
  };

  // Complete Booking Handler
  const handleCompleteBooking = async (target) => {
    if (!target) return;
    try {
      const updated = await userStore.completeBooking(user?.id, target.id);
      if (updated) setBookings(updated);
      if (selectedBookingForDetails?.id === target.id) {
        setSelectedBookingForDetails((prev) => ({ ...prev, status: "Completed", statusStep: 4 }));
      }
      showToast(`Booking #${target.id} marked as completed! You can now rate your technician.`);
    } catch (error) {
      showToast(error.message);
    }
  };

  // Submit Rating & Review Handler
  const handleSubmitRating = async (e) => {
    e?.preventDefault();
    if (!ratingTargetBooking) return;
    setIsSubmittingRating(true);
    try {
      const updated = await userStore.rateBooking(
        user?.id,
        ratingTargetBooking.id,
        ratingStars,
        ratingFeedback,
      );
      if (updated) setBookings(updated);
      if (selectedBookingForDetails?.id === ratingTargetBooking.id) {
        setSelectedBookingForDetails((prev) => ({
          ...prev,
          rating: ratingStars,
          feedback: ratingFeedback,
        }));
      }
      showToast(`Thank you! Your ${ratingStars}-star rating has been saved.`);
      setRatingTargetBooking(null);
      setRatingFeedback("");
    } catch {
      showToast("Could not record review, please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Live Chat Send Message Handler
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!inputChatMessage.trim()) return;

    const userText = inputChatMessage.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: "Just now" },
    ]);
    setInputChatMessage("");
    setIsAgentTyping(true);

    setTimeout(() => {
      let reply =
        "Thank you for contacting Argent Your. Our support team is looking into this and a representative will follow up shortly.";
      const lower = userText.toLowerCase();

      if (
        lower.includes("technician") ||
        lower.includes("arriving") ||
        lower.includes("reach")
      ) {
        reply =
          "Your assigned technician is tracked via live GPS and is on schedule. You can also tap the 'Call' or 'SMS' button directly on your booking card.";
      } else if (lower.includes("cancel") || lower.includes("refund")) {
        reply =
          "You can cancel any booking up to 2 hours before the slot with zero fee from 'My Bookings'. Refunds are credited back within 2-4 business hours.";
      } else if (
        lower.includes("invoice") ||
        lower.includes("receipt") ||
        lower.includes("bill")
      ) {
        reply =
          "Your official GST tax invoice is generated upon service completion. You can view and download it anytime from the Booking Receipt.";
      } else if (
        lower.includes("discount") ||
        lower.includes("coupon") ||
        lower.includes("offer")
      ) {
        reply =
          "You have an exclusive 20% discount coupon 'ARGENT20' active! Apply it during checkout to save instantly.";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: reply, time: "Just now" },
      ]);
      setIsAgentTyping(false);
    }, 700);
  };

  // Submit Support Ticket Handler
  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) {
      showToast("Please provide subject and description.");
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      subject: ticketSubject,
      status: "Under Review",
      created: "Today",
      priority: "Normal",
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    setIsRaiseTicketOpen(false);
    setTicketSubject("");
    setTicketDesc("");
    showToast(
      `Support Ticket #${newTicket.id} registered! We'll reply in 2 hours.`,
    );
  };

  // Copy Coupon Code Handler
  const handleCopyCoupon = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(""), 2500);
  };

  // Remove Saved Service
  const handleRemoveSavedService = (slug) => {
    setSavedServicesList((prev) => prev.filter((s) => s.slug !== slug));
    showToast("Service removed from saved bookmarks.");
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  // Clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    showToast("Notifications cleared.");
  };

  // Delete individual notification
  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    onHome?.();
  };

  // Filtered Bookings for My Bookings tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "upcoming")
      return b.status === "Confirmed" || b.status === "Scheduled";
    if (bookingFilter === "active")
      return b.status === "In Progress" || b.status === "Assigned";
    if (bookingFilter === "completed") return b.status === "Completed";
    if (bookingFilter === "cancelled") return b.status === "Cancelled";
    return true; // 'all'
  });

  const totalBookingsCount = bookings.length;
  const upcomingCount = bookings.filter(
    (b) => b.status === "In Progress" || b.status === "Confirmed",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === "Completed",
  ).length;
  const savedCount = savedServicesList.length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const upcomingBookingsCount = bookings.filter(
    (b) => b.status === "Confirmed" || b.status === "Scheduled",
  ).length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === "In Progress" || b.status === "Assigned",
  ).length;
  const completedBookingsCount = bookings.filter(
    (b) => b.status === "Completed",
  ).length;
  const cancelledBookingsCount = bookings.filter(
    (b) => b.status === "Cancelled",
  ).length;

  const handleGuestTrackBooking = (e) => {
    e?.preventDefault();
    const query = guestTrackingInput.trim().toLowerCase();
    if (!query) {
      setGuestTrackingError(
        "Please enter your Booking ID or service name.",
      );
      return;
    }
    const found = bookings.find(
      (b) =>
        b.id.toLowerCase().includes(query) ||
        b.serviceName.toLowerCase().includes(query) ||
        (b.technician &&
          b.technician.phone &&
          b.technician.phone.includes(query)),
    );
    if (found) {
      setGuestTrackingError("");
      setSelectedBookingForDetails(found);
    } else {
      setGuestTrackingError(
        `No booking found matching "${guestTrackingInput}". Check the Booking ID and try again.`,
      );
    }
  };

  const sidebarMenuItems = [
    { id: "overview", label: "My Profile", icon: User },
    {
      id: "bookings",
      label: "My Bookings",
      icon: Clock,
      badge: upcomingCount > 0 ? `${upcomingCount}` : null,
    },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    {
      id: "saved",
      label: "Saved Services",
      icon: Heart,
      badge: savedCount > 0 ? `${savedCount}` : null,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge:
        unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
    },
    { id: "offers", label: "Offers & Rewards", icon: Tag, highlight: true },
    { id: "support", label: "Help & Support", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logout", label: "Logout", icon: LogOut, isDanger: true },
  ];

  // Call assigned technician helper
  const handleCallTechnician = (e, tech) => {
    if (!tech || !tech.phone) {
      e.preventDefault();
      showToast("Professional contact number is not available.");
      return;
    }
    const cleanNumber = tech.phone.replace(/[^\d+]/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanNumber).catch(() => {});
    }
    showToast(`Connecting call to ${tech.name}... (Dialer opened)`);
  };

  // SMS assigned technician helper
  const handleSmsTechnician = (e, tech, booking) => {
    if (!tech || !tech.phone) {
      e.preventDefault();
      showToast("Professional contact number is not available.");
      return;
    }
    const bookingIdText = booking?.id ? ` (Booking #${booking.id})` : "";
    const prefilledMessage = `Hi, I'm contacting you regarding my Argent Your service booking${bookingIdText}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(prefilledMessage).catch(() => {});
    }
    showToast(`Opening messaging app for ${tech.name}...`);
  };

  // Reusable Bookings Dashboard Component (Used for standalone /bookings and in profile tab)
  const renderBookingsSection = () => (
    <div className="space-y-6 animate-rise-in w-full max-w-full min-w-0 box-border">
      {/* Argent Dark Emerald Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-5 sm:p-7 text-white shadow-lg w-full max-w-full min-w-0 box-border">
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 min-w-0">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Doorstep Service Management</span>
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words">
              My Bookings & Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
              Review, reschedule, track live technician dispatch, or cancel your
              home service appointments.
            </p>
          </div>

          {/* Metric summary badges */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10 text-center min-w-[75px]">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                Total
              </span>
              <span className="text-lg font-black text-white">
                {totalBookingsCount}
              </span>
            </div>
            <div className="flex-1 sm:flex-initial rounded-2xl bg-emerald-500/20 backdrop-blur-md px-4 py-2 border border-emerald-400/30 text-center min-w-[75px]">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Active
              </span>
              <span className="text-lg font-black text-emerald-300 flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {upcomingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Mode Callout / Lookup (if guest) */}
      {isGuest && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-700" />
                <span>Track Any Doorstep Booking</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Instant Lookup
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Enter your Booking ID or service name
              to track technician dispatch and view receipts without signing in.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Booking ID..."
                value={guestTrackingInput}
                onChange={(e) => {
                  setGuestTrackingInput(e.target.value);
                  setGuestTrackingError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGuestTrackBooking();
                }}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={handleGuestTrackBooking}
                className="rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                Track Booking
              </button>
            </div>
            {guestTrackingError && (
              <p className="text-xs text-rose-600 font-medium">
                {guestTrackingError}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/70 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Sign In for Full Account History & One-Tap Management
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in to view all past appointments, download GST tax
                invoices, manage saved addresses, and reschedule instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={onAuthOpen}
              className="shrink-0 rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Appointment Records
          </h2>
          <p className="text-xs text-slate-500">
            Showing {filteredBookings.length}{" "}
            {bookingFilter !== "all" ? bookingFilter : ""}{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        {/* Status Filter Tabs - Horizontally scrollable on mobile, flexible on desktop */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-200/70 p-1.5 text-xs font-bold text-slate-700 max-w-full overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {[
            { id: "all", label: "All", count: bookings.length },
            { id: "upcoming", label: "Upcoming", count: upcomingBookingsCount },
            { id: "active", label: "In Progress", count: activeBookingsCount },
            {
              id: "completed",
              label: "Completed",
              count: completedBookingsCount,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: cancelledBookingsCount,
            },
          ].map((tab) => {
            const isActive = bookingFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBookingFilter(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap text-xs shrink-0 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs font-black"
                    : "text-slate-700 hover:text-slate-950 hover:bg-white/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              <Clock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                {bookings.length === 0
                  ? "No bookings yet"
                  : `No ${bookingFilter} bookings found`}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {bookings.length === 0
                  ? "You have not booked any doorstep services yet. Certified professionals are ready to assist you."
                  : `You currently have no doorstep service appointments under the "${bookingFilter}" filter.`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {bookingFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setBookingFilter("all")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  View All Bookings
                </button>
              )}
              <button
                type="button"
                onClick={onHome}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                Explore Services & Book
              </button>
            </div>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all space-y-3 sm:space-y-4 w-full max-w-full min-w-0 box-border overflow-hidden"
            >
              {/* Card Top: compact horizontal row */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-4 min-w-0 w-full">
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-wrap">
                  <span className="rounded-lg sm:rounded-xl bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black text-slate-800 shrink-0">
                    #{b.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 ${
                      b.status === "In Progress"
                        ? "bg-amber-100 text-amber-950 border border-amber-300/60"
                        : b.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-950 border border-emerald-300/60"
                          : b.status === "Completed"
                            ? "bg-teal-100 text-teal-950 border border-teal-300/60"
                            : "bg-rose-100 text-rose-950 border border-rose-300/60"
                    }`}
                  >
                    {b.status === "In Progress" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                    )}
                    {b.status === "Confirmed" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    )}
                    {b.status}
                  </span>
                  {isGuest && (
                    <span className="rounded-full bg-slate-100 px-1.5 sm:px-2 py-0.5 text-[9px] font-extrabold uppercase text-slate-500 shrink-0">
                      Sample
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-700 shrink-0 text-right">
                  <span>
                    Paid:{" "}
                    <strong className="text-emerald-900 text-xs sm:text-sm font-black">
                      {b.totalPaid}
                    </strong>
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
                    {b.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Service Details & Assigned Technician */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 min-w-0 w-full">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full flex-1">
                  <img
                    src={b.image}
                    alt={b.serviceName}
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl object-cover shadow-2xs shrink-0 border border-slate-100"
                  />
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                      {b.category}
                    </span>
                    <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                      {b.serviceName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-emerald-900 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg border border-emerald-100 shrink-0">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700" />
                        {b.scheduledDate}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg border border-slate-100 shrink-0">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" />
                        {b.scheduledTime}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-full flex items-center gap-1 pt-0.5 min-w-0">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-700 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </p>
                  </div>
                </div>

                {/* Technician Card */}
                {b.technician && (
                  <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100 p-2 sm:p-3 w-full lg:w-auto min-w-0 box-border shrink-0">
                    <img
                      src={b.technician.avatar}
                      alt={b.technician.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                    />
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                        {b.technician.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="font-extrabold text-amber-600">
                          ★ {b.technician.rating}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-800 font-semibold">
                          Assigned Pro
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellation Reason if cancelled */}
              {b.status === "Cancelled" && b.cancellationReason && (
                <div className="rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 p-2.5 sm:p-3 text-xs text-rose-800 break-words">
                  <strong>Reason for cancellation:</strong>{" "}
                  {b.cancellationReason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-slate-100 w-full min-w-0 flex-wrap sm:flex-nowrap">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForDetails(b)}
                    className="rounded-lg sm:rounded-xl bg-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                  </button>

                  {(b.status === "Confirmed" || b.status === "In Progress") && (
                    <button
                      type="button"
                      onClick={() => openReschedule(b)}
                      className="rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                  )}

                  {(b.status === "Confirmed" || b.status === "In Progress") && (
                    <button
                      type="button"
                      onClick={() => setCancelBookingTarget(b)}
                      className="rounded-lg sm:rounded-xl border border-rose-200 bg-rose-50/60 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  {b.status === "Completed" &&
                    (b.rating ? (
                      <span className="inline-flex items-center gap-1 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200/80 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-amber-900">
                        ★ {b.rating}/5 Rated
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingTargetBooking(b);
                          setRatingStars(5);
                          setRatingFeedback("");
                        }}
                        className="rounded-lg sm:rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        ★ Rate Service
                      </button>
                    ))}

                  {(b.status === "Completed" || b.status === "Cancelled") && (
                    <button
                      type="button"
                      onClick={() => onNavigateToService?.(b.slug)}
                      className="rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Book Again
                    </button>
                  )}
                </div>

                {b.technician && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-600 shrink-0">
                    <a
                      href={`tel:${b.technician.phone ? b.technician.phone.replace(/[^\d+]/g, "") : ""}`}
                      onClick={(e) => handleCallTechnician(e, b.technician)}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-[11px] sm:text-xs"
                      title={`Call ${b.technician.name}`}
                    >
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`sms:${b.technician.phone ? b.technician.phone.replace(/[^\d+]/g, "") : ""}?body=${encodeURIComponent("Hello, I have a service booking with Argent Your.")}`}
                      onClick={(e) => handleSmsTechnician(e, b.technician)}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-[11px] sm:text-xs"
                      title={`SMS ${b.technician.name}`}
                    >
                      <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700" />
                      <span>SMS</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-28 sm:pb-32 md:pb-20 pt-4 sm:pt-6 md:pt-24 lg:pt-26 w-full max-w-full overflow-x-hidden box-border">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-2xl border border-slate-800 animate-rise-in max-w-sm">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-8 w-full max-w-full min-w-0 box-border">
        {standaloneBookings ? (
          <div className="mx-auto max-w-5xl space-y-6 w-full max-w-full min-w-0 box-border">
            {renderBookingsSection()}
          </div>
        ) : (
          <>
            {/* Profile Master Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-5 sm:p-7 shadow-sm backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                  {/* Avatar with Camera Overlay */}
                  <div className="relative group shrink-0">
                    <img
                      src={profileForm.avatar}
                      alt={profileForm.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-3 border-white shadow-md transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute bottom-0 right-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm hover:bg-emerald-800 transition-colors cursor-pointer"
                      title="Change avatar"
                    >
                      <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>

                  {/* User Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                        {profileForm.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                        Verified Customer
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {profileForm.email}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {profileForm.phone}
                      </span>
                    </div>

                    <p className="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium pt-0.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed text-slate-600">
                        {profileForm.address}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Quick Action Button: Edit Profile */}
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Horizontally Scrollable 10-Tab Navigation Strip */}
            <div className="md:hidden">
              <div
                ref={mobileNavScrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
              >
                {sidebarMenuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => (mobileTabRefs.current[item.id] = el)}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`shrink-0 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-slate-950 text-white shadow-md scale-102"
                          : item.isDanger
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-white/80 text-slate-700 border border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          isActive
                            ? "text-emerald-400"
                            : item.isDanger
                              ? "text-rose-600"
                              : "text-slate-500"
                        }`}
                      />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                            isActive
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main 2-Column Dashboard Layout: Desktop Sidebar + Dynamic Tab Content */}
            <div className="grid gap-8 md:grid-cols-[260px_1fr] items-start">
              {/* Desktop Left Sidebar Menu */}
              <aside className="hidden md:block space-y-2 sticky top-32">
                <div className="rounded-3xl border border-white/80 bg-white/80 p-3 shadow-xs backdrop-blur-md space-y-1">
                  {sidebarMenuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-slate-950 text-white shadow-md"
                            : item.isDanger
                              ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 ${
                              isActive
                                ? "text-emerald-400"
                                : item.isDanger
                                  ? "text-rose-600"
                                  : "text-slate-500"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isActive
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Helpline Quick Card in Sidebar */}
                <div className="rounded-3xl border border-emerald-200/60 bg-emerald-50/70 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                    <LifeBuoy className="h-4 w-4 text-emerald-700" />
                    <span>24/7 Argent Support</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Need urgent assistance with an active booking? Our team is
                    live.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLiveChatOpen(true)}
                    className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-100/70 transition-colors text-center cursor-pointer border border-emerald-200"
                  >
                    Chat with Agent
                  </button>
                </div>
              </aside>

              {/* Dynamic Content Area for Each Dedicated Section */}
              <main className="min-w-0 space-y-8">
                {/* ===============================================================
                SECTION 1: MY PROFILE (OVERVIEW DASHBOARD)
            =============================================================== */}
                {activeTab === "overview" && (
                  <div className="space-y-8 animate-rise-in">
                    {/* 4 Summary Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Card 1: Total Bookings */}
                      <div
                        onClick={() => handleTabClick("bookings")}
                        className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Total Orders
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                            <PackageCheck className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                          {totalBookingsCount}
                        </p>
                        <span className="mt-1 text-[11px] font-bold text-emerald-800 group-hover:underline block">
                          View booking history &rarr;
                        </span>
                      </div>

                      {/* Card 2: Upcoming */}
                      <div
                        onClick={() => {
                          setBookingFilter("upcoming");
                          handleTabClick("bookings");
                        }}
                        className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Upcoming
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <p className="text-2xl sm:text-3xl font-black text-slate-900">
                            {upcomingCount}
                          </p>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="mt-1 text-[11px] font-bold text-emerald-800 group-hover:underline block truncate">
                          Track active slot &rarr;
                        </span>
                      </div>

                      {/* Card 3: Completed */}
                      <div
                        onClick={() => {
                          setBookingFilter("completed");
                          handleTabClick("bookings");
                        }}
                        className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Completed
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                          {completedCount}
                        </p>
                        <span className="mt-1 text-[11px] font-bold text-emerald-800 group-hover:underline block">
                          100% Guaranteed &rarr;
                        </span>
                      </div>

                      {/* Card 4: Saved Services */}
                      <div
                        onClick={() => handleTabClick("saved")}
                        className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Saved
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <Heart className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                          {savedCount}
                        </p>
                        <span className="mt-1 text-[11px] font-bold text-emerald-800 group-hover:underline block">
                          Quick rebook &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Active Offers Preview Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-900 to-slate-950 p-6 sm:p-7 text-white shadow-lg">
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="space-y-1 max-w-lg">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3" />
                            Exclusive Member Privilege
                          </span>
                          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            Flat 20% OFF on All Doorstep Services
                          </h3>
                          <p className="text-xs text-slate-300">
                            Use code{" "}
                            <strong className="text-white">ARGENT20</strong> for
                            immediate discount at checkout. Valid until 30 Sep.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCoupon("ARGENT20")}
                            className="rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white border border-white/20 hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            {copiedCoupon === "ARGENT20" ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy ARGENT20</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTabClick("offers")}
                            className="rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-100 transition-all shadow-md cursor-pointer"
                          >
                            View All Offers
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Next Upcoming Appointment Highlight */}
                    {bookings.find(
                      (b) =>
                        b.status === "In Progress" || b.status === "Confirmed",
                    ) && (
                      <div className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <h3 className="text-base font-black text-slate-900">
                              Next Upcoming Service Appointment
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTabClick("bookings")}
                            className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                          >
                            See All ({upcomingCount})
                          </button>
                        </div>

                        {(() => {
                          const nextBooking = bookings.find(
                            (b) =>
                              b.status === "In Progress" ||
                              b.status === "Confirmed",
                          );
                          if (!nextBooking) return null;
                          return (
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={nextBooking.image}
                                  alt={nextBooking.serviceName}
                                  className="h-16 w-16 rounded-2xl object-cover shadow-2xs shrink-0"
                                />
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                                    #{nextBooking.id} · {nextBooking.category}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {nextBooking.serviceName}
                                  </h4>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                                    <span>{nextBooking.scheduledDate}</span>
                                    <span>·</span>
                                    <Clock className="h-3.5 w-3.5 text-emerald-700" />
                                    <span>{nextBooking.scheduledTime}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedBookingForDetails(nextBooking)
                                  }
                                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                                >
                                  Track & Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReschedule(nextBooking)
                                  }
                                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  Reschedule
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Quick Access Grid to Key Sections */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div
                        onClick={() => handleTabClick("addresses")}
                        className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3">
                          Manage Addresses
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {addresses.length} saved doorstep service locations
                        </p>
                      </div>

                      <div
                        onClick={() => handleTabClick("payments")}
                        className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3">
                          Payment Methods
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {paymentMethods.length} securely saved cards & UPI
                        </p>
                      </div>

                      <div
                        onClick={() => handleTabClick("support")}
                        className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3">
                          Help & Live Support
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          FAQs, live agent chat & WhatsApp assist
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 2: MY BOOKINGS
            =============================================================== */}
                {activeTab === "bookings" && renderBookingsSection()}

                {/* ===============================================================
                SECTION 3: ADDRESSES
            =============================================================== */}
                {activeTab === "addresses" && (
                  <div className="space-y-6 animate-rise-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Manage Addresses
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Doorstep service locations for appointments and
                          equipment delivery
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`relative rounded-3xl border p-5 sm:p-6 backdrop-blur-md transition-all ${
                            addr.isDefault
                              ? "border-emerald-600/40 bg-white shadow-sm ring-1 ring-emerald-500/20"
                              : "border-white/80 bg-white/80 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-800">
                                {addr.type}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditAddressTarget(addr)}
                                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Address"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Address"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 space-y-1 text-xs">
                            <p className="font-bold text-slate-900 text-sm">
                              {addr.recipient}
                            </p>
                            <p className="text-slate-600">{addr.line1}</p>
                            {addr.line2 && (
                              <p className="text-slate-500">{addr.line2}</p>
                            )}
                            <p className="text-slate-600">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                            <p className="text-slate-500 pt-1 flex items-center gap-1 font-medium">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {addr.phone}
                            </p>
                          </div>

                          {!addr.isDefault && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                              >
                                Set as Default
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 4: PAYMENT METHODS
            =============================================================== */}
                {activeTab === "payments" && (
                  <div className="space-y-6 animate-rise-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Payment Methods
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Secure payment options with bank-grade encryption &
                          masked card data
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddPaymentOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Payment Method</span>
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          className={`relative rounded-3xl border p-5 sm:p-6 backdrop-blur-md transition-all ${
                            pm.isDefault
                              ? "border-emerald-600/40 bg-white shadow-sm ring-1 ring-emerald-500/20"
                              : "border-white/80 bg-white/80 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-800">
                                {pm.brand}
                              </span>
                              {pm.isDefault && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                  Default
                                </span>
                              )}
                            </div>

                            {!pm.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(pm.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Payment Method"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="mt-4 space-y-1 text-xs">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                              {pm.type}
                            </p>
                            <p className="font-mono text-base font-black text-slate-900 tracking-wider">
                              {pm.maskedNumber}
                            </p>
                            <div className="flex items-center justify-between text-slate-500 pt-2">
                              <span>{pm.cardholder}</span>
                              {pm.expiry !== "N/A" && (
                                <span>Expires {pm.expiry}</span>
                              )}
                            </div>
                          </div>

                          {!pm.isDefault && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleSetDefaultPayment(pm.id)}
                                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                              >
                                Set as Default
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Additional Payment Info */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-5 flex items-start gap-3.5 text-xs text-slate-600">
                      <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">
                          PCI-DSS Compliant 256-Bit SSL Protection
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Your full card numbers are never stored on Argent Your
                          servers. We use RBI & PCI-DSS tokenization to secure
                          all transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 5: SAVED SERVICES
            =============================================================== */}
                {activeTab === "saved" && (
                  <div className="space-y-6 animate-rise-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Saved Services
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Your bookmarked home services for one-tap booking
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {savedServicesList.length} saved
                      </span>
                    </div>

                    {savedServicesList.length === 0 ? (
                      <div className="rounded-3xl border border-white/80 bg-white/80 p-12 text-center space-y-3">
                        <Heart className="h-10 w-10 text-slate-300 mx-auto" />
                        <h4 className="text-base font-bold text-slate-800">
                          No saved services yet
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Bookmark your favorite doorstep maintenance and
                          grooming services to access them quickly here.
                        </p>
                        <button
                          type="button"
                          onClick={onHome}
                          className="rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                        >
                          Browse Service Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savedServicesList.map((srv) => (
                          <div
                            key={srv.slug}
                            className="rounded-3xl border border-white/80 bg-white shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                          >
                            <div>
                              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                                <img
                                  src={srv.image}
                                  alt={srv.name}
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSavedService(srv.slug)
                                  }
                                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                  title="Remove from saved"
                                >
                                  <Heart className="h-4 w-4 fill-rose-600" />
                                </button>
                                <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-white">
                                  {srv.category}
                                </span>
                              </div>

                              <div className="p-4 space-y-1.5">
                                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                                  {srv.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span>{srv.rating}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({srv.reviews})
                                  </span>
                                </div>
                                <p className="text-sm font-black text-emerald-800">
                                  {srv.price}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <button
                                type="button"
                                onClick={() => onNavigateToService?.(srv.slug)}
                                className="w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs text-center cursor-pointer"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===============================================================
                SECTION 6: NOTIFICATIONS
            =============================================================== */}
                {activeTab === "notifications" && (
                  <div className="space-y-6 animate-rise-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Notifications
                          </h2>
                          {unreadNotificationsCount > 0 && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                              {unreadNotificationsCount} unread
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Real-time updates regarding service bookings,
                          technician dispatch & offers
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {unreadNotificationsCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllNotificationsRead}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearNotifications}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <div className="rounded-3xl border border-white/80 bg-white/80 p-12 text-center space-y-3">
                          <Bell className="h-10 w-10 text-slate-300 mx-auto" />
                          <h4 className="text-base font-bold text-slate-800">
                            No notifications right now
                          </h4>
                          <p className="text-xs text-slate-500">
                            We'll alert you here when your technician is
                            assigned or when new offers drop!
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex items-start justify-between gap-4 rounded-3xl border p-4 sm:p-5 backdrop-blur-md transition-all ${
                              n.read
                                ? "border-white/80 bg-white/70"
                                : "border-emerald-500/30 bg-white shadow-xs ring-1 ring-emerald-500/15"
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                  n.type === "service"
                                    ? "bg-amber-50 text-amber-800"
                                    : n.type === "promo"
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-emerald-50 text-emerald-800"
                                }`}
                              >
                                <Bell className="h-4 w-4" />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-900">
                                    {n.title}
                                  </h4>
                                  {!n.read && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium block">
                                  {n.time}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteNotification(n.id)}
                              className="text-slate-300 hover:text-slate-500 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Dismiss notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 7: OFFERS & REWARDS
            =============================================================== */}
                {activeTab === "offers" && (
                  <div className="space-y-6 animate-rise-in">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Offers & Reward Coupons
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Exclusive promo discount vouchers available for your
                        doorstep services
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          code: "ARGENT20",
                          discount: "Flat 20% OFF",
                          title: "Universal Doorstep Discount",
                          desc: "Applicable on all Home Cleaning, AC, Electrical & Plumbing services",
                          validUntil: "30 Sep 2026",
                          minOrder: "₹649",
                          color: "emerald",
                        },
                        {
                          code: "CLEAN15",
                          discount: "₹399 OFF",
                          title: "Deep Home Clean Refresh",
                          desc: "Special discount on Kitchen, Bathroom & Full Home Refresh clean",
                          validUntil: "15 Oct 2026",
                          minOrder: "₹799",
                          color: "teal",
                        },
                        {
                          code: "SUMMERAC",
                          discount: "Free AC Inspection",
                          title: "AC Foam-Jet Combo Deal",
                          desc: "Free gas pressure & electrical load audit with every AC service",
                          validUntil: "31 Oct 2026",
                          minOrder: "₹899",
                          color: "amber",
                        },
                        {
                          code: "FIRST50",
                          discount: "Flat ₹200 OFF",
                          title: "Welcome Bonus Voucher",
                          desc: "Special new customer token valid on your next appointment",
                          validUntil: "31 Dec 2026",
                          minOrder: "₹499",
                          color: "purple",
                        },
                      ].map((coupon) => (
                        <div
                          key={coupon.code}
                          className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
                                {coupon.discount}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Min Order {coupon.minOrder}
                              </span>
                            </div>

                            <h3 className="font-extrabold text-base text-slate-900">
                              {coupon.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {coupon.desc}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                {coupon.code}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Expires {coupon.validUntil}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyCoupon(coupon.code)}
                              className="flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                            >
                              {copiedCoupon === coupon.code ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 8: HELP & SUPPORT
            =============================================================== */}
                {activeTab === "support" && (
                  <div className="space-y-6 animate-rise-in">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Help & Support
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Frequently asked questions, live chat assistant & ticket
                        tracking
                      </p>
                    </div>

                    {/* Quick Contact Cards */}
                    <div className="grid sm:grid-cols-4 gap-3">
                      <a
                        href="tel:+918000500200"
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border border-white/80 bg-white/90 hover:bg-white text-center shadow-xs transition-all cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                          <Phone className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          24/7 Helpline
                        </span>
                        <span className="text-[10px] text-slate-500">
                          +91 8000 500 200
                        </span>
                      </a>

                      <a
                        href="https://wa.me/918000500200"
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border border-white/80 bg-white/90 hover:bg-white text-center shadow-xs transition-all cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          WhatsApp Assist
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Instant response
                        </span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setIsLiveChatOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border border-white/80 bg-white/90 hover:bg-white text-center shadow-xs transition-all cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-2">
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Live Chat
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Chat with Agent
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRaiseTicketOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border border-white/80 bg-white/90 hover:bg-white text-center shadow-xs transition-all cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-2">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Raise Ticket
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Track resolution
                        </span>
                      </button>
                    </div>

                    {/* Active Tickets Tracker */}
                    {supportTickets.length > 0 && (
                      <div className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          Your Active Support Tickets
                        </h3>
                        <div className="space-y-2">
                          {supportTickets.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">
                                  #{t.id} · {t.category}
                                </span>
                                <p className="text-slate-500 text-[11px]">
                                  {t.subject}
                                </p>
                              </div>
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FAQ Accordion */}
                    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md space-y-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Frequently Asked Questions
                      </h3>

                      <div className="divide-y divide-slate-100 text-xs">
                        {[
                          {
                            q: "How does the Argent 30-day warranty work?",
                            a: "Every doorstep service booked through Argent Your includes a complimentary 30-day warranty. If any issue arises from the work executed, we dispatch a senior expert for a free revisit.",
                          },
                          {
                            q: "Can I reschedule or cancel my appointment?",
                            a: "Yes! You can reschedule or cancel for free up to 2 hours before the scheduled slot directly from the 'My Bookings' section with zero cancellation fee.",
                          },
                          {
                            q: "How are prices calculated?",
                            a: "All prices shown are completely upfront and all-inclusive of service charges, standard equipment, and taxes. If specialized spare parts are required, our professional shares an upfront quotation before beginning.",
                          },
                          {
                            q: "Are the doorstep professionals verified?",
                            a: "Yes! Every single professional undergoes police verification, criminal background checks, identity matching, and hands-on technical skill certification.",
                          },
                        ].map((faq, i) => (
                          <div key={i} className="py-3">
                            <p className="font-bold text-slate-900 text-sm">
                              {faq.q}
                            </p>
                            <p className="text-slate-600 mt-1 leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                SECTION 9: SETTINGS
            =============================================================== */}
                {activeTab === "settings" && (
                  <div className="space-y-6 animate-rise-in">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Account Settings & Preferences
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage notification alerts, language, and security
                      </p>
                    </div>

                    {/* Notifications Preferences */}
                    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md space-y-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Notification Preferences
                      </h3>

                      <div className="space-y-3 divide-y divide-slate-100 text-xs">
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="font-bold text-slate-900">
                              SMS Notifications
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Receive appointment confirmations and OTPs via SMS
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsState.smsUpdates}
                            onChange={(e) =>
                              setSettingsState((prev) => ({
                                ...prev,
                                smsUpdates: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-emerald-600 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              WhatsApp Order Alerts
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Get live technician tracking links and receipts on
                              WhatsApp
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsState.whatsappAlerts}
                            onChange={(e) =>
                              setSettingsState((prev) => ({
                                ...prev,
                                whatsappAlerts: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-emerald-600 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-3">
                          <div>
                            <p className="font-bold text-slate-900">
                              Promotional Emails & Discounts
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Occasional updates on seasonal discounts and
                              member rewards
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsState.promoEmails}
                            onChange={(e) =>
                              setSettingsState((prev) => ({
                                ...prev,
                                promoEmails: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Language & Appearance */}
                    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md space-y-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Regional & Appearance
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Preferred Language
                          </label>
                          <select
                            value={settingsState.language}
                            onChange={(e) => {
                              setSettingsState((prev) => ({
                                ...prev,
                                language: e.target.value,
                              }));
                              showToast(`Language set to ${e.target.value}`);
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none cursor-pointer"
                          >
                            <option value="English">English</option>
                            <option value="Hindi">हिन्दी (Hindi)</option>
                            <option value="Bengali">বাংলা (Bengali)</option>
                            <option value="Marathi">मराठी (Marathi)</option>
                            <option value="Tamil">தமிழ் (Tamil)</option>
                            <option value="Telugu">తెలుగు (Telugu)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Display Theme
                          </label>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSettingsState((prev) => ({
                                  ...prev,
                                  darkMode: false,
                                }));
                                showToast("Light mode active");
                              }}
                              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 border font-bold text-xs cursor-pointer ${
                                !settingsState.darkMode
                                  ? "bg-slate-950 text-white border-slate-950"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              <Sun className="h-3.5 w-3.5" />
                              <span>Light</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSettingsState((prev) => ({
                                  ...prev,
                                  darkMode: true,
                                }));
                                showToast("Dark mode preference saved");
                              }}
                              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 border font-bold text-xs cursor-pointer ${
                                settingsState.darkMode
                                  ? "bg-slate-950 text-white border-slate-950"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              <Moon className="h-3.5 w-3.5" />
                              <span>Dark</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Security & Danger Zone */}
                    <div className="rounded-3xl border border-rose-100 bg-rose-50/40 p-5 sm:p-6 space-y-4">
                      <h3 className="text-base font-bold text-rose-950">
                        Security & Danger Zone
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            Delete Account
                          </p>
                          <p className="text-slate-500">
                            Permanently delete your profile, saved addresses,
                            and booking history.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsDeleteAccountOpen(true)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>

      {/* ===================================================================
          MODAL 1: EDIT PROFILE MODAL
      =================================================================== */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Edit Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Primary Location / Address
                </label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: BOOKING RECEIPT & LIVE TRACKING MODAL (With Call & SMS)
      =================================================================== */}
      {selectedBookingForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setSelectedBookingForDetails(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-7 py-4.5 bg-white shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Booking Receipt
                </span>
                <h3 className="text-base font-black text-slate-900">
                  #{selectedBookingForDetails.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close receipt"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Clean scrollbar */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4 text-xs scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Service Item Header */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <img
                  src={selectedBookingForDetails.image}
                  alt={selectedBookingForDetails.serviceName}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 truncate">
                    {selectedBookingForDetails.serviceName}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {selectedBookingForDetails.scheduledDate} ·{" "}
                    {selectedBookingForDetails.scheduledTime}
                  </p>
                  <span className="text-xs font-black text-emerald-800">
                    {selectedBookingForDetails.price}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Service Tracking
                </p>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                  {["Requested", "Assigned", "In Progress", "Completed"].map(
                    (step, idx) => {
                      const isPast =
                        idx + 1 <= selectedBookingForDetails.statusStep;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full ${
                              isPast ? "bg-emerald-600" : "bg-slate-200"
                            }`}
                          />
                          <span
                            className={
                              isPast ? "text-emerald-900" : "text-slate-400"
                            }
                          >
                            {step}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Assigned Doorstep Professional Card with Call & SMS */}
              {selectedBookingForDetails.technician && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                      Assigned Doorstep Professional
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Pro
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={selectedBookingForDetails.technician.avatar}
                        alt={selectedBookingForDetails.technician.name}
                        className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {selectedBookingForDetails.technician.name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-amber-600">
                            ★ {selectedBookingForDetails.technician.rating}
                          </span>
                          <span>·</span>
                          <span>
                            {selectedBookingForDetails.technician.experience}{" "}
                            exp
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* [ 📞 Call ]   [ 💬 SMS ] Buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <a
                        href={`tel:${selectedBookingForDetails.technician.phone ? selectedBookingForDetails.technician.phone.replace(/[^\d+]/g, "") : ""}`}
                        onClick={(e) =>
                          handleCallTechnician(
                            e,
                            selectedBookingForDetails.technician,
                          )
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm active:scale-95 touch-manipulation min-h-[38px] whitespace-nowrap"
                        title={`Call ${selectedBookingForDetails.technician.name}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`sms:${selectedBookingForDetails.technician.phone ? selectedBookingForDetails.technician.phone.replace(/[^\d+]/g, "") : ""}?body=Hi%20${encodeURIComponent(selectedBookingForDetails.technician.name)}%2C%20I%20am%20contacting%20you%20regarding%20my%20Argent%20Your%20booking%20%23${selectedBookingForDetails.id}.`}
                        onClick={(e) =>
                          handleSmsTechnician(
                            e,
                            selectedBookingForDetails.technician,
                            selectedBookingForDetails,
                          )
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs active:scale-95 touch-manipulation min-h-[38px] whitespace-nowrap"
                        title={`SMS ${selectedBookingForDetails.technician.name}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-800" />
                        <span>SMS</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Address */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Service Location
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {selectedBookingForDetails.address}
                </p>
              </div>

              {/* Payment Summary Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Payment Summary
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>Item Total</span>
                  <span>{selectedBookingForDetails.price}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Safety & Equipment Fee</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & GST</span>
                  <span>₹20</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span className="text-emerald-800">
                    {selectedBookingForDetails.totalPaid}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Paid via {selectedBookingForDetails.paymentMethod}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-6 sm:px-7 py-3 bg-slate-50 shrink-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedBookingForDetails.status !== "Completed" &&
                  selectedBookingForDetails.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCompleteBooking(selectedBookingForDetails)
                      }
                      className="rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                {selectedBookingForDetails.status === "Completed" &&
                  !selectedBookingForDetails.rating && (
                    <button
                      type="button"
                      onClick={() => {
                        setRatingTargetBooking(selectedBookingForDetails);
                        setRatingStars(5);
                        setRatingFeedback("");
                      }}
                      className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Star className="h-3.5 w-3.5 fill-white" />
                      Rate Service
                    </button>
                  )}
                {selectedBookingForDetails.status === "Completed" &&
                  selectedBookingForDetails.rating && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      Rated {selectedBookingForDetails.rating}/5
                    </span>
                  )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: RESCHEDULE BOOKING MODAL
      =================================================================== */}
      {rescheduleBookingTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setRescheduleBookingTarget(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Reschedule Appointment
                </span>
                <h3 className="text-base font-black text-slate-900">
                  #{rescheduleBookingTarget.id} ·{" "}
                  {rescheduleBookingTarget.serviceName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleBookingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select New Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRescheduleDates.map((dateOption) => (
                    <button
                      key={dateOption.value}
                      type="button"
                      onClick={() => setRescheduleDate(dateOption.value)}
                      className={`rounded-2xl p-2.5 font-bold border transition-all text-center cursor-pointer ${
                        rescheduleDate === dateOption.value
                          ? "bg-slate-950 text-white border-slate-950"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {dateOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select New Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rescheduleSlots.filter((timeOption) => {
                    if (rescheduleDate !== availableRescheduleDates[0].value) return true;
                    const match = timeOption.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                    if (!match) return false;
                    let hour = Number(match[1]) % 12;
                    if (match[3].toUpperCase() === "PM") hour += 12;
                    const start = new Date();
                    start.setHours(hour, Number(match[2]), 0, 0);
                    return start > new Date();
                  }).map((timeOption) => (
                    <button
                      key={timeOption}
                      type="button"
                      onClick={() => setRescheduleTime(timeOption)}
                      className={`rounded-2xl p-2.5 font-bold border transition-all text-center cursor-pointer ${
                        rescheduleTime === timeOption
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {timeOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-500">
                Rescheduling is 100% free up to 2 hours before the appointment.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBookingTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Keep Original Slot
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: CANCEL BOOKING MODAL
      =================================================================== */}
      {cancelBookingTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setCancelBookingTarget(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                  Cancel Booking
                </span>
                <h3 className="text-base font-black text-slate-900">
                  #{cancelBookingTarget.id} · {cancelBookingTarget.serviceName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelBookingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Please let us know why you need to cancel this doorstep booking:
              </p>

              <div className="space-y-2">
                {[
                  "Change of plans / Not available at home",
                  "Found another alternate solution",
                  "Emergency / Rescheduling later",
                  "Booked wrong service by mistake",
                  "Other reason",
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer font-medium"
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="accent-rose-600"
                    />
                    <span className="text-slate-800">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-[11px] text-rose-800">
                Any prepaid amount will be refunded immediately to your original
                payment method.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelBookingTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 font-bold text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4B: RATE SERVICE MODAL
      =================================================================== */}
      {ratingTargetBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setRatingTargetBooking(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                  Rate Your Experience
                </span>
                <h3 className="text-base font-black text-slate-900">
                  #{ratingTargetBooking.id} · {ratingTargetBooking.serviceName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRatingTargetBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitRating}
              className="mt-4 space-y-4 text-xs"
            >
              {ratingTargetBooking.technician && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                  <img
                    src={ratingTargetBooking.technician.photo}
                    alt={ratingTargetBooking.technician.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">
                      {ratingTargetBooking.technician.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Service Professional · Certified
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-2 text-center">
                  How would you rate the service quality?
                </label>
                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= ratingStars
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center font-bold text-slate-700 text-xs">
                  {ratingStars === 5 && "Excellent! ⭐⭐⭐⭐⭐"}
                  {ratingStars === 4 && "Very Good! ⭐⭐⭐⭐"}
                  {ratingStars === 3 && "Average ⭐⭐⭐"}
                  {ratingStars === 2 && "Poor ⭐⭐"}
                  {ratingStars === 1 && "Terrible ⭐"}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Feedback / Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Share details about the technician's punctuality, work quality, or cleanliness..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingTargetBooking(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRating ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: ADD ADDRESS MODAL (With REAL Geolocation GPS Button)
      =================================================================== */}
      {isAddAddressOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsAddAddressOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Add New Doorstep Address
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddAddress}
              className="mt-4 space-y-4 text-xs"
            >
              {/* Real GPS Geolocation Trigger */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span className="font-bold text-emerald-950">
                    Auto-detect via GPS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isLocating ? "animate-spin" : ""}`}
                  />
                  <span>
                    {isLocating ? "Locating..." : "Use Current Location"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setNewAddressForm({ ...newAddressForm, type: t })
                    }
                    className={`rounded-2xl py-2 font-bold border transition-all cursor-pointer text-center ${
                      newAddressForm.type === t
                        ? "bg-slate-950 text-white border-slate-950"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.recipient}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        recipient: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddressForm.phone}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  House / Flat No. & Building Name (Line 1)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Green Glen Heights"
                  value={newAddressForm.line1}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      line1: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Street / Area / Landmark (Line 2)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62, Near Metro Station"
                  value={newAddressForm.line2}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      line2: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.city}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        city: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.state}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        state: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.postalCode}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddressForm.isDefault}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="accent-emerald-600 h-4 w-4 rounded cursor-pointer"
                />
                <span>Set as default doorstep service address</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 6: EDIT ADDRESS TARGET MODAL
      =================================================================== */}
      {editAddressTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setEditAddressTarget(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Edit Service Address
              </h3>
              <button
                type="button"
                onClick={() => setEditAddressTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateAddress}
              className="mt-4 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressTarget.recipient}
                    onChange={(e) =>
                      setEditAddressTarget({
                        ...editAddressTarget,
                        recipient: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editAddressTarget.phone}
                    onChange={(e) =>
                      setEditAddressTarget({
                        ...editAddressTarget,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={editAddressTarget.line1}
                  onChange={(e) =>
                    setEditAddressTarget({
                      ...editAddressTarget,
                      line1: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={editAddressTarget.line2}
                  onChange={(e) =>
                    setEditAddressTarget({
                      ...editAddressTarget,
                      line2: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressTarget.city}
                    onChange={(e) =>
                      setEditAddressTarget({
                        ...editAddressTarget,
                        city: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressTarget.state}
                    onChange={(e) =>
                      setEditAddressTarget({
                        ...editAddressTarget,
                        state: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressTarget.postalCode}
                    onChange={(e) =>
                      setEditAddressTarget({
                        ...editAddressTarget,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAddressTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Update Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 7: ADD PAYMENT METHOD MODAL (3 Tabs: Card, UPI, Net Banking)
      =================================================================== */}
      {isAddPaymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsAddPaymentOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Add Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPaymentOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 3 Tabs: Card, UPI, Net Banking */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mt-4 text-xs font-bold text-slate-700">
              {[
                { id: "card", label: "Credit/Debit Card" },
                { id: "upi", label: "UPI ID" },
                { id: "netbanking", label: "Net Banking" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentTab(tab.id)}
                  className={`flex-1 rounded-xl py-2 transition-all cursor-pointer ${
                    paymentTab === tab.id
                      ? "bg-white text-slate-950 shadow-xs"
                      : "hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleAddPayment}
              className="mt-4 space-y-4 text-xs"
            >
              {paymentTab === "card" && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 4242"
                      maxLength={19}
                      value={newPaymentForm.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 16);
                        const formatted = val.replace(/.{4}/g, (group) => `${group} `).trim();
                        setNewPaymentForm({
                          ...newPaymentForm,
                          cardNumber: formatted,
                        });
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newPaymentForm.cardholder}
                      onChange={(e) =>
                        setNewPaymentForm({
                          ...newPaymentForm,
                          cardholder: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={newPaymentForm.expiry}
                        onChange={(e) =>
                          setNewPaymentForm({
                            ...newPaymentForm,
                            expiry: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        maxLength={4}
                        value={newPaymentForm.cvv}
                        onChange={(e) =>
                          setNewPaymentForm({
                            ...newPaymentForm,
                            cvv: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentTab === "upi" && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@okhdfcbank"
                      value={newPaymentForm.upiId}
                      onChange={(e) =>
                        setNewPaymentForm({
                          ...newPaymentForm,
                          upiId: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  {/* Quick UPI Handle Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {["@okaxis", "@okhdfcbank", "@paytm", "@ybl"].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          const base =
                            newPaymentForm.upiId.split("@")[0] || "rahul";
                          setNewPaymentForm({
                            ...newPaymentForm,
                            upiId: `${base}${h}`,
                          });
                        }}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {paymentTab === "netbanking" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Your Bank
                  </label>
                  <select
                    value={newPaymentForm.bankName}
                    onChange={(e) =>
                      setNewPaymentForm({
                        ...newPaymentForm,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 focus:border-emerald-600 outline-none cursor-pointer"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">
                      State Bank of India
                    </option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">
                      Kotak Mahindra Bank
                    </option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPaymentForm.isDefault}
                  onChange={(e) =>
                    setNewPaymentForm({
                      ...newPaymentForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="accent-emerald-600 h-4 w-4 rounded cursor-pointer"
                />
                <span>Set as default payment method</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 8: LIVE CHAT MODAL
      =================================================================== */}
      {isLiveChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsLiveChatOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl h-[520px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-950 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-xs">
                    AY
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-950" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    Argent Support Assistant
                  </h4>
                  <p className="text-[10px] text-emerald-300">
                    Online · Average response &lt; 1 min
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveChatOpen(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat message body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-slate-950 text-white rounded-br-xs"
                        : "bg-slate-100 text-slate-900 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isAgentTyping && (
                <div className="flex items-center gap-1 text-slate-400 text-[11px] pl-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                  <span className="ml-1">Agent is typing...</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={inputChatMessage}
                onChange={(e) => setInputChatMessage(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 p-2.5 text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 9: RAISE A TICKET MODAL
      =================================================================== */}
      {isRaiseTicketOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsRaiseTicketOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                Raise Support Ticket
              </h3>
              <button
                type="button"
                onClick={() => setIsRaiseTicketOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleRaiseTicket}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Issue Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="Service Quality">
                    Service Quality & Revisit
                  </option>
                  <option value="Billing & Payment">
                    Billing & Refund Status
                  </option>
                  <option value="Technician Delay">
                    Technician Delay / No Show
                  </option>
                  <option value="Reschedule Help">
                    Rescheduling Assistance
                  </option>
                  <option value="Other Inquiry">Other General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain details so our senior supervisor can investigate immediately..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseTicketOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 10: CHANGE AVATAR MODAL (CAMERA + GALLERY)
      =================================================================== */}
      <AvatarSourceModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profileForm.avatar}
        onSave={handleSaveAvatar}
        showToast={showToast}
      />

      {/* ===================================================================
          MODAL 11: DELETE ACCOUNT MODAL
      =================================================================== */}
      {isDeleteAccountOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsDeleteAccountOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-rose-600">
                Delete Account
              </h3>
              <button
                type="button"
                onClick={() => setIsDeleteAccountOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete your Argent Your
              account? This action cannot be undone. All saved addresses,
              payment methods, and booking warranties will be lost.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAccountOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAccountOpen(false);
                  logout();
                  onHome?.();
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 12: LOGOUT CONFIRMATION MODAL
      =================================================================== */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900">
                Log Out of Argent Your?
              </h3>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              You will need to sign back in with your credentials to book
              doorstep services and track appointments.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
