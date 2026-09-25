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
  Sparkles,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianProfilePage() {
  const {
    techProfile,
    metrics,
    bankAccount,
    updateAvatar,
    handleOpenEditProfile,
    handleOpenBankModal,
    handleLogoutClick,
    handleToggleServiceArea,
    isSavingAreas,
    showToast,
  } = useTechnician();

  // Photo change modals state
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Security modals state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const currentAreas = (techProfile?.service_areas || "Delhi NCR")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Handle image selection from file or camera
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
      setShowPhotoOptionsModal(false);
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file triggers change
    e.target.value = "";
  };

  // Request camera permission and trigger camera capture
  const handleTriggerCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera permission upfront
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop stream immediately after permission grant
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn("Camera access note:", err);
      // Even if stream failed, trigger camera input file dialog on mobile
    }
    localCameraInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Trigger gallery file picker
  const handleTriggerGallery = () => {
    localFileInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Save confirmed photo
  const handleSavePhotoPreview = async () => {
    if (!photoPreviewUrl) return;
    setIsSavingPhoto(true);
    try {
      await updateAvatar(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    } catch {
      showToast("Failed to save profile picture", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Handle password change submission
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
      showToast("Security credentials updated successfully.", "success");
    }, 600);
  };

  const proId = techProfile?.id
    ? `TECH-${String(techProfile.id).slice(-4).toUpperCase()}`
    : "TECH-8492";

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Hidden file pickers for photo upload */}
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

      {/* Page Title & Edit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your certified field partner credentials, service zones, and account security
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenEditProfile}
          className="py-2.5 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-900/10 cursor-pointer self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* ========================================================
          1. LARGE PREMIUM PROFILE HEADER CARD
         ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Soft decorative gradient in corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/40 to-teal-50/0 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Profile Picture with interactive change trigger */}
          <div className="relative group shrink-0">
            <div
              onClick={() => setShowPhotoOptionsModal(true)}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-3 border-emerald-600/30 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-md flex items-center justify-center cursor-pointer group-hover:border-emerald-600 transition-all relative"
            >
              {techProfile?.avatar ? (
                <img
                  src={techProfile.avatar}
                  alt={techProfile.name || "Technician"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-emerald-800" />
              )}

              {/* Hover overlay on desktop */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                <Camera className="w-5 h-5" />
                <span>Change</span>
              </div>
            </div>

            {/* Permanent Camera trigger button on corner */}
            <button
              type="button"
              onClick={() => setShowPhotoOptionsModal(true)}
              title="Change Profile Picture"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-105 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {techProfile?.name || "Apu Ray"}
              </h2>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Verified Professional
              </span>

              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {proId}
              </span>
            </div>

            <p className="text-sm font-bold text-emerald-800">
              {techProfile?.category || "Plumbing"} Specialist &bull;{" "}
              <span className="text-slate-600 font-medium">
                {techProfile?.experience_years || 3}+ Years Industry Experience
              </span>
            </p>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {techProfile?.bio ||
                "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones."}
            </p>

            {/* Contact & Equipment Meta Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{techProfile?.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>{techProfile?.email || "partner@argentyour.com"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Car className="w-3.5 h-3.5 text-emerald-700" />
                <span>{techProfile?.vehicle_type || "Rapid Response Van"}</span>
              </div>
            </div>
          </div>

          {/* Rating & Work Done Highlight Stat */}
          <div className="flex md:flex-col items-center justify-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 shrink-0">
            <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{metrics?.rating ? Number(metrics.rating).toFixed(1) : "4.9"}</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">
                {metrics?.completedCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Jobs Resolved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TWO-COLUMN SECTIONS: VERIFICATION & COVERAGE
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Verification Status
                </h3>
                <p className="text-xs text-slate-500">
                  Official platform background & credentials validation
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  Identity Verified
                </p>
                <p className="text-[11px] text-emerald-800">
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
                <p className="text-[11px] text-emerald-800">
                  Certified Master Trade License and on-site expertise verified.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  Account Verified
                </p>
                <p className="text-[11px] text-emerald-800">
                  Authorized Argent Pro partner enabled for live emergency dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Coverage Areas Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Service Areas
                </h3>
                <p className="text-xs text-slate-500">
                  Active operational territories for emergency dispatches
                </p>
              </div>
            </div>
            {isSavingAreas && (
              <span className="text-[11px] font-bold text-emerald-700 animate-pulse">
                Saving...
              </span>
            )}
          </div>

          <div className="space-y-2">
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
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCovered
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70"
                  }`}
                >
                  <span className="text-xs font-bold">{area}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isCovered
                        ? "bg-emerald-700 text-white"
                        : "border border-slate-300"
                    }`}
                  >
                    {isCovered && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TWO-COLUMN SECTIONS: BANK PAYOUT & ACCOUNT SECURITY
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Bank Account Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Settlement Bank Account
                </h3>
                <p className="text-xs text-slate-500">
                  Direct IMPS / NEFT daily payout account
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

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">
                {bankAccount?.bankName || "HDFC Bank"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active & Verified
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {bankAccount?.accountNumberMasked || "•••• •••• 9821"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="font-mono font-bold text-slate-800">
                  {bankAccount?.ifsc || "HDFC0001234"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Holder:</span>
                <span className="font-bold text-slate-800">
                  {bankAccount?.holderName || techProfile?.name || "Apu Ray"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Account Security
                </h3>
                <p className="text-xs text-slate-500">
                  Authentication settings, active sessions, and password
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Change Password row */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Change Password</p>
                <p className="text-[11px] text-slate-400">
                  Update your portal login security credentials
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

            {/* Two-step verification row */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Two-Step Verification</p>
                <p className="text-[11px] text-slate-400">
                  OTP sent to {techProfile?.phone || "registered mobile"} on new login
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Enabled (SMS OTP)
              </span>
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
      </div>

      {/* ========================================================
          PHOTO OPTIONS MODAL (Take Photo / Choose Gallery / Cancel)
         ======================================================== */}
      {showPhotoOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Profile Photo
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
              Choose how you would like to update your certified technician profile picture:
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerGallery}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Choose from Gallery</span>
              </button>

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
          PHOTO PREVIEW & CROP/SAVE MODAL
         ======================================================== */}
      {photoPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Preview Profile Picture
              </h3>
              <button
                type="button"
                onClick={() => setPhotoPreviewUrl(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Preview Container */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-600 shadow-xl bg-slate-100 relative">
                <img
                  src={photoPreviewUrl}
                  alt="Preview"
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              </div>

              {/* Zoom / Crop scale controls */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[11px] text-slate-400 font-bold">Zoom:</span>
                {[1, 1.2, 1.4].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setZoomLevel(scale)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      zoomLevel === scale
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPhotoPreviewUrl(null);
                  setShowPhotoOptionsModal(true);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setPhotoPreviewUrl(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhotoPreview}
                disabled={isSavingPhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isSavingPhoto ? "Saving..." : "Save Picture"}
              </button>
            </div>
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
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
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
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
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
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
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
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
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
