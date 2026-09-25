import React, { useState, useRef } from "react";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Star,
  Award,
  Camera,
  Image as ImageIcon,
  Edit3,
  CreditCard,
  LogOut,
  Car,
  CheckCircle,
  HelpCircle,
  X,
  Lock,
  Smartphone,
  History,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Settings,
  ChevronRight,
  Shield,
  Layers,
  KeyRound,
  FileText,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianProfilePage() {
  const {
    techProfile,
    metrics,
    bankAccount,
    updateAvatar,
    handleOpenBankModal,
    handleLogoutClick,
    handleToggleServiceArea,
    isSavingAreas,
    showToast,
  } = useTechnician();

  // Active section in the horizontal navigation
  const [activeSection, setActiveSection] = useState("overview");

  // Photo change & crop/preview modal state
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Edit Personal Information modal state
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: "",
    phone: "",
    email: "",
    category: "Plumbing",
    experience_years: 5,
    bio: "",
    vehicle_type: "Rapid Response Van",
    service_areas: "Delhi NCR",
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Security / Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Two-step verification state
  const [twoStepEnabled, setTwoStepEnabled] = useState(true);

  // File & Camera input refs
  const localFileInputRef = useRef(null);
  const localCameraInputRef = useRef(null);

  const allAreas = [
    "Connaught Place & Central",
    "South Delhi (GK, Saket, Hauz Khas)",
    "Gurgaon / Cyber City",
    "Noida Sectors & Expressways",
    "West Delhi (Rajouri, Punjabi Bagh)",
    "Dwarka & Aerocity",
  ];

  const currentAreas = (techProfile?.service_areas || "Delhi NCR, South Delhi, Gurgaon")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Horizontal Profile Section Tabs
  const profileTabs = [
    { id: "overview", label: "Overview" },
    { id: "personal", label: "Personal Info" },
    { id: "areas", label: "Service Areas" },
    { id: "verification", label: "Verification" },
    { id: "bank", label: "Bank & Payout" },
    { id: "security", label: "Security" },
  ];

  // Open Edit Profile / Personal Information Modal
  const openEditModal = () => {
    setInfoForm({
      name: techProfile?.name || "Apu Ray",
      phone: techProfile?.phone || "+91 98765 43210",
      email: techProfile?.email || "partner@argentyour.com",
      category: techProfile?.category || "Plumbing",
      experience_years: techProfile?.experience_years || 5,
      bio:
        techProfile?.bio ||
        "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones.",
      vehicle_type: techProfile?.vehicle_type || "Rapid Response Van",
      service_areas: techProfile?.service_areas || "Delhi NCR, South Delhi, Gurgaon",
    });
    setShowEditInfoModal(true);
  };

  // Save Personal Information
  const handleSaveInfoSubmit = async (e) => {
    e.preventDefault();
    if (!infoForm.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    setIsSavingInfo(true);
    try {
      if (typeof window !== "undefined") {
        const stored = JSON.parse(
          localStorage.getItem("argent_technician_user") || "{}"
        );
        const updated = {
          ...stored,
          ...infoForm,
          technician: {
            ...(stored.technician || {}),
            ...infoForm,
          },
        };
        localStorage.setItem("argent_technician_user", JSON.stringify(updated));
      }
      showToast("Profile updated successfully", "success");
      setShowEditInfoModal(false);
      if (techProfile) {
        Object.assign(techProfile, infoForm);
      }
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle image file selection
  const onImageFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast("Selected image must be under 8MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreviewUrl(reader.result);
      setZoomLevel(1);
      setRotationDegrees(0);
      setShowPhotoOptionsModal(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Request camera permission and open camera
  const handleTriggerCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn("Camera access note:", err);
    }
    localCameraInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Open device image gallery
  const handleTriggerGallery = () => {
    localFileInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Save photo after crop/zoom/rotate
  const handleSaveCroppedPhoto = async () => {
    if (!photoPreviewUrl) return;
    setIsSavingPhoto(true);
    try {
      await updateAvatar(photoPreviewUrl);
      showToast("Profile updated successfully", "success");
      setPhotoPreviewUrl(null);
    } catch {
      showToast("Failed to save profile picture", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Save password change
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully.", "success");
    }, 600);
  };

  const proName = techProfile?.name || "Apu Ray";
  const proCategory = techProfile?.category || "Plumbing";
  const proExpYears = techProfile?.experience_years || 5;
  const proRating = metrics?.rating ? Number(metrics.rating).toFixed(1) : "4.9";
  const proJobsCount = metrics?.completedCount || 124;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-2xl mx-auto px-1 sm:px-4 pb-28 text-slate-900">
      {/* Hidden file pickers for camera & photo upload */}
      <input
        type="file"
        ref={localFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={onImageFileSelected}
      />
      <input
        type="file"
        ref={localCameraInputRef}
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onImageFileSelected}
      />

      {/* ========================================================
          1. PREMIUM PROFILE HEADER CARD (Circular photo, badges, info)
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden text-center space-y-3.5">
        {/* Soft background radial highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Large Circular Profile Photo with Camera Tap Overlay */}
        <div className="relative inline-block mx-auto">
          <div
            onClick={() => setShowPhotoOptionsModal(true)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-600/40 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-102 relative"
          >
            {techProfile?.avatar ? (
              <img
                src={techProfile.avatar}
                alt={proName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-emerald-800" />
            )}
          </div>

          {/* Interactive Camera Icon Button */}
          <button
            type="button"
            onClick={() => setShowPhotoOptionsModal(true)}
            aria-label="Change Profile Photo"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Identity & Badges */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {proName}
            </h1>
            <span
              title="Verified Professional"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-700 text-white"
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-emerald-800">
            {proCategory} Specialist &bull;{" "}
            <span className="text-slate-500 font-semibold">Level 3 Pro Partner</span>
          </p>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verified Professional
            </span>
          </div>
        </div>

        {/* Contact Info Pills */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-full sm:w-auto justify-center">
            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{techProfile?.phone || "+91 98765 43210"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-full sm:w-auto justify-center">
            <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{techProfile?.email || "partner@argentyour.com"}</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={openEditModal}
            className="w-full sm:w-auto px-6 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          STICKY HORIZONTAL SECTION NAVIGATION
          [ Overview ] [ Personal Info ] [ Service Areas ] [ Verification ] [ Bank & Payout ] [ Security ]
         ======================================================== */}
      <div className="sticky top-[53px] z-30 bg-[#f6f7f3]/95 backdrop-blur-md py-2 border-b border-slate-200/80 -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-0.5">
          {profileTabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`py-2 px-3.5 sm:px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none relative ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SELECTED PROFILE SECTION CONTENT
         ======================================================== */}

      {/* --------------------------------------------------------
          SECTION 1: OVERVIEW
         -------------------------------------------------------- */}
      {activeSection === "overview" && (
        <div className="space-y-4 animate-fade-in">
          {/* Profile Statistics Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm grid grid-cols-3 divide-x divide-slate-100 text-center">
            {/* Jobs Done */}
            <div className="px-2 space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {proJobsCount}
              </p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Jobs Done
              </p>
            </div>

            {/* Rating */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xl sm:text-2xl">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{proRating}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Rating (128 reviews)
              </p>
            </div>

            {/* Experience */}
            <div className="px-2 space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-emerald-700">
                {proExpYears}+ Yrs
              </p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Experience
              </p>
            </div>
          </div>

          {/* Quick Actions (4 Clean Action Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Edit Profile */}
            <button
              type="button"
              onClick={openEditModal}
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Edit3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Edit Profile</span>
            </button>

            {/* 2. Change Photo */}
            <button
              type="button"
              onClick={() => setShowPhotoOptionsModal(true)}
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Change Photo</span>
            </button>

            {/* 3. Bank Details */}
            <button
              type="button"
              onClick={() => setActiveSection("bank")}
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Bank Details</span>
            </button>

            {/* 4. Settings */}
            <button
              type="button"
              onClick={() => setActiveSection("security")}
              className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Settings</span>
            </button>
          </div>

          {/* Operational Hub & Vehicle Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Field Partner Overview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active Duty
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">
                  Primary Zone
                </span>
                <span className="font-bold text-slate-800">
                  {currentAreas[0] || "Delhi NCR"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">
                  Response Vehicle
                </span>
                <span className="font-bold text-slate-800">
                  {techProfile?.vehicle_type || "Rapid Response Van"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 2: PERSONAL INFO
         -------------------------------------------------------- */}
      {activeSection === "personal" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Personal Information
              </h2>
            </div>
            <button
              type="button"
              onClick={openEditModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Full Name */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Full Name</span>
              <span className="font-bold text-slate-800">{proName}</span>
            </div>

            {/* Phone Number */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Phone Number</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {techProfile?.phone || "+91 98765 43210"}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Email Address</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-none">
                  {techProfile?.email || "partner@argentyour.com"}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {/* Service Category */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Service Category</span>
              <span className="font-bold text-slate-800">{proCategory}</span>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Experience</span>
              <span className="font-bold text-slate-800">{proExpYears} Years</span>
            </div>

            {/* Professional Bio */}
            <div className="pt-1 space-y-1">
              <span className="text-slate-400 font-medium block">Professional Bio</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {techProfile?.bio ||
                  "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones."}
              </p>
            </div>

            {/* Edit Profile Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={openEditModal}
                className="w-full py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Personal Information</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 3: SERVICE AREAS
         -------------------------------------------------------- */}
      {activeSection === "areas" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Service Areas
                </h2>
                <p className="text-[11px] text-slate-400">
                  Tap to add or remove operational territories
                </p>
              </div>
            </div>
            {isSavingAreas && (
              <span className="text-[11px] font-bold text-emerald-700 animate-pulse">
                Saving...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allAreas.map((area) => {
              const isCovered = currentAreas.some(
                (a) =>
                  a.toLowerCase() === area.toLowerCase() ||
                  area.toLowerCase().includes(a.toLowerCase())
              );
              return (
                <div
                  key={area}
                  onClick={() => handleToggleServiceArea(area)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCovered
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold"
                      : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70"
                  }`}
                >
                  <span className="text-xs leading-snug">{area}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isCovered ? "bg-emerald-700 text-white" : "border border-slate-300"
                    }`}
                  >
                    {isCovered && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            Emergency requests are auto-dispatched within your selected coverage areas. Keeping multiple active areas increases dispatch opportunities.
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 4: VERIFICATION
         -------------------------------------------------------- */}
      {activeSection === "verification" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Verification Status
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Partner
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">Identity Verified</p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Government photo ID and Aadhaar biometric verification completed.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  Professional Credentials Verified
                </p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Trade certifications and professional background check approved.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">Account Verified</p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Authorized Argent Partner dispatch account fully active.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 5: BANK & PAYOUT
         -------------------------------------------------------- */}
      {activeSection === "bank" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Bank & Payout Details
                </h2>
                <p className="text-[11px] text-slate-400">
                  Daily settlement for completed service dispatches
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenBankModal}
              className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Edit Bank Details
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Bank Name</span>
              <span className="font-bold text-slate-900">
                {bankAccount?.bankName || "ICICI Bank"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Account Number</span>
              <span className="font-mono font-bold text-slate-800">
                {bankAccount?.accountNumberMasked || "•••• •••• 6620"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">IFSC</span>
              <span className="font-mono font-bold text-slate-800">
                {bankAccount?.ifsc || "ICIC0001234"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Payout Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Active (Daily IMPS)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenBankModal}
            className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Manage Settlement Account</span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 6: SECURITY
         -------------------------------------------------------- */}
      {activeSection === "security" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              Account Security
            </h2>
          </div>

          <div className="space-y-3">
            {/* Account Security status row */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Account Security</p>
                <p className="text-[11px] text-slate-400">Security shield active</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Protected
              </span>
            </div>

            {/* Two-step verification toggle row */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Two-Step Verification</p>
                <p className="text-[11px] text-slate-400">
                  OTP sent on every partner portal sign-in
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoStepEnabled(!twoStepEnabled);
                  showToast(
                    twoStepEnabled
                      ? "Two-step verification disabled"
                      : "Two-step verification enabled",
                    "info"
                  );
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  twoStepEnabled
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {twoStepEnabled ? "Enabled (SMS OTP)" : "Disabled"}
              </button>
            </div>

            {/* Change Password row */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Change Password</p>
                <p className="text-[11px] text-slate-400">
                  Regularly update your password for safety
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>

            {/* Login Activity row */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Login Activity</p>
                <p className="text-[11px] text-slate-400">
                  Current Session &bull; New Delhi &bull; Active Now
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-3 px-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Professional Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PHOTO OPTIONS SHEET (Take Photo | Choose Gallery | Cancel)
         ======================================================== */}
      {showPhotoOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Change Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoOptionsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an option to update your public certified partner picture:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Take Photo */}
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>

              {/* Option 2: Choose from Gallery */}
              <button
                type="button"
                onClick={handleTriggerGallery}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Choose from Gallery</span>
              </button>

              {/* Option 3: Cancel */}
              <button
                type="button"
                onClick={() => setShowPhotoOptionsModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl text-slate-500 font-semibold text-xs hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PROPER CROP & PREVIEW SCREEN
          (Crop, Zoom, Rotate, Reset, Cancel, Save Photo)
         ======================================================== */}
      {photoPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Crop & Preview Photo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Adjust picture framing for your partner credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoPreviewUrl(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Cropping Mask & Image Preview */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-600 shadow-xl bg-slate-900 relative flex items-center justify-center">
                <img
                  src={photoPreviewUrl}
                  alt="Crop Preview"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotationDegrees}deg)`,
                  }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              </div>

              {/* Interactive Controls: Zoom, Rotate, Reset */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {/* Zoom buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 px-1">
                    Zoom:
                  </span>
                  {[1, 1.25, 1.5, 2].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setZoomLevel(scale)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        zoomLevel === scale
                          ? "bg-emerald-800 text-white shadow-xs"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>

                {/* Rotate button */}
                <button
                  type="button"
                  onClick={() =>
                    setRotationDegrees((prev) => (prev + 90) % 360)
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setRotationDegrees(0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Action Buttons: Cancel | Save Photo */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPhotoPreviewUrl(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCroppedPhoto}
                disabled={isSavingPhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isSavingPhoto ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT PERSONAL INFORMATION MODAL
         ======================================================== */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Edit Personal Information
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Update profile credentials and trade bio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditInfoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInfoSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={infoForm.name}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Phone Number
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={infoForm.phone}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Email Address
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    value={infoForm.email}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={infoForm.category}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrician">Electrician</option>
                    <option value="AC & Appliance Repair">
                      AC & Appliance Repair
                    </option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={infoForm.experience_years}
                    onChange={(e) =>
                      setInfoForm({
                        ...infoForm,
                        experience_years: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={infoForm.bio}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditInfoModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  {isSavingInfo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          CHANGE PASSWORD MODAL
         ======================================================== */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
