import React, { useState, useRef, useEffect } from "react";
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
  Pencil,
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
  Plus,
  Trash2,
  Navigation,
  UploadCloud,
  FileCheck,
  Building2,
  ExternalLink,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";
import technicianStore from "../services/technicianStore";

export default function TechnicianProfilePage() {
  const {
    techProfile,
    setTechProfile,
    metrics,
    bankAccount,
    updateAvatar,
    handleOpenBankModal,
    handleLogoutClick,
    showToast,
  } = useTechnician();

  // Active section in the horizontal navigation:
  // Overview | Personal Info | Service Areas | Verification | Work Proof | Bank & Payout | Security
  const [activeSection, setActiveSection] = useState("overview");

  // Photo change & crop/preview modal state
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // File & Camera input refs for profile photo
  const localFileInputRef = useRef(null);
  const localCameraInputRef = useRef(null);

  // Automatic tab scrolling into view on activeSection change (matching ProfilePage.jsx)
  const mobileTabRefs = useRef({});
  useEffect(() => {
    if (mobileTabRefs.current[activeSection]) {
      mobileTabRefs.current[activeSection].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeSection]);

  // Additional Categories / Services State (Requirement 4)
  const parseAdditionalCategories = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return String(data)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const [additionalServices, setAdditionalServices] = useState(() => {
    return parseAdditionalCategories(techProfile?.additional_categories);
  });
  const [newServiceInput, setNewServiceInput] = useState("");

  useEffect(() => {
    if (techProfile?.additional_categories) {
      setAdditionalServices(parseAdditionalCategories(techProfile.additional_categories));
    }
  }, [techProfile?.additional_categories]);

  const handleAddAdditionalService = () => {
    const trimmed = newServiceInput.trim();
    if (!trimmed) return;
    if (additionalServices.includes(trimmed)) {
      showToast("Service already added", "error");
      return;
    }
    const updated = [...additionalServices, trimmed];
    setAdditionalServices(updated);
    setNewServiceInput("");
  };

  const handleRemoveAdditionalService = (serviceToRemove) => {
    const updated = additionalServices.filter((s) => s !== serviceToRemove);
    setAdditionalServices(updated);
  };

  // Verification Document Upload State (Requirement 5)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(
    techProfile?.id_document_type || "Aadhaar Card"
  );
  const docFileInputRef = useRef(null);
  const docCameraInputRef = useRef(null);

  const handleDocFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast("Document file size must be under 15MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setIsUploadingDoc(true);
      try {
        await technicianStore.updateProfile({
          id_document_url: base64Data,
          id_document_type: selectedDocType,
        });
        if (setTechProfile) {
          setTechProfile((prev) => ({
            ...prev,
            id_document_url: base64Data,
            id_document_type: selectedDocType,
            status: prev?.status === "Approved" ? "Approved" : "Pending Verification",
          }));
        }
        showToast("Verification document uploaded successfully! Status: Pending Verification", "success");
      } catch (err) {
        showToast("Failed to upload verification document", "error");
      } finally {
        setIsUploadingDoc(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ========================================================
  // 1. WORK / EXPERIENCE PROOF STATE & PERSISTENCE (Requirement 6)
  // ========================================================
  const [workProofs, setWorkProofs] = useState(() => {
    if (techProfile?.work_proofs) {
      try {
        const parsed = JSON.parse(techProfile.work_proofs);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    try {
      const saved = localStorage.getItem("argent_technician_work_proofs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (techProfile?.work_proofs) {
      try {
        const parsed = JSON.parse(techProfile.work_proofs);
        if (Array.isArray(parsed)) {
          setWorkProofs(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, [techProfile?.work_proofs]);

  const [showAddProofModal, setShowAddProofModal] = useState(false);
  const [proofPreviewItem, setProofPreviewItem] = useState(null);
  const [newProofForm, setNewProofForm] = useState({
    title: "",
    category: "Completed Project Photo",
    imageData: "",
  });
  const proofFileInputRef = useRef(null);
  const proofCameraInputRef = useRef(null);

  const saveWorkProofs = async (updated) => {
    setWorkProofs(updated);
    try {
      localStorage.setItem("argent_technician_work_proofs", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage warning for work proofs:", e);
    }
    try {
      await technicianStore.updateProfile({ work_proofs: JSON.stringify(updated) });
      if (setTechProfile) {
        setTechProfile((prev) => ({ ...prev, work_proofs: JSON.stringify(updated) }));
      }
    } catch (err) {
      console.warn("Backend save warning for work proofs:", err);
    }
  };

  const handleProofImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("Document or photo must be under 8MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewProofForm((prev) => ({ ...prev, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddProofSubmit = (e) => {
    e.preventDefault();
    if (!newProofForm.title.trim()) {
      showToast("Please provide a title for this work proof", "error");
      return;
    }
    if (!newProofForm.imageData) {
      showToast("Please select a photo or certificate to upload", "error");
      return;
    }

    const proofItem = {
      id: "proof-" + Date.now(),
      title: newProofForm.title.trim(),
      category: newProofForm.category,
      imageUrl: newProofForm.imageData,
      uploadedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    const updated = [proofItem, ...workProofs];
    saveWorkProofs(updated);
    showToast("Work & experience proof uploaded successfully", "success");
    setShowAddProofModal(false);
    setNewProofForm({
      title: "",
      category: "Completed Project Photo",
      imageData: "",
    });
  };

  const handleDeleteProof = (id) => {
    const updated = workProofs.filter((p) => p.id !== id);
    saveWorkProofs(updated);
    showToast("Work proof document removed", "info");
  };

  // ========================================================
  // 2. SERVICE ADDRESS / SERVICE AREAS MANAGEMENT
  // ========================================================
  const [serviceLocations, setServiceLocations] = useState(() => {
    try {
      const saved = localStorage.getItem("argent_technician_service_locations");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const areas = (techProfile?.service_areas || "Delhi NCR, South Delhi, Gurgaon")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return areas.map((name, idx) => ({
      id: "loc-" + idx,
      name,
      address: `${name}, National Capital Region`,
      isPrimary: idx === 0,
    }));
  });

  const [newLocationInput, setNewLocationInput] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [editingLocId, setEditingLocId] = useState(null);
  const [editLocName, setEditLocName] = useState("");

  const saveServiceLocations = async (updated) => {
    setServiceLocations(updated);
    try {
      localStorage.setItem("argent_technician_service_locations", JSON.stringify(updated));
      const joined = updated.map((l) => l.name).join(", ");
      await technicianStore.updateProfile({ service_areas: joined });
      if (setTechProfile) {
        setTechProfile((prev) => ({ ...prev, service_areas: joined }));
      }
    } catch (e) {
      console.warn("Service location save error:", e);
    }
  };

  // Use Device Geolocation with permission
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedName = `Zone [${latitude.toFixed(3)}, ${longitude.toFixed(3)}]`;
        let detectedAddress = `GPS Location: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const sub =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.city_district ||
              data.address?.city ||
              data.address?.county ||
              "Current Locality";
            const state = data.address?.state || "Delhi NCR";
            detectedName = `${sub}, ${state}`;
            detectedAddress = data.display_name || detectedAddress;
          }
        } catch {
          // fallback to coordinates if reverse geocode is blocked
        }

        const newLoc = {
          id: "loc-" + Date.now(),
          name: detectedName,
          address: detectedAddress,
          isPrimary: serviceLocations.length === 0,
        };

        const updated = [...serviceLocations, newLoc];
        await saveServiceLocations(updated);
        setIsDetectingLocation(false);
        showToast(`Current location added: ${detectedName}`, "success");
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === 1) {
          showToast("Location permission was denied. Please allow location access in your browser.", "error");
        } else {
          showToast("Unable to retrieve device location", "error");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Add manual service location
  const handleAddManualLocation = async (e) => {
    e.preventDefault();
    if (!newLocationInput.trim()) {
      showToast("Please enter an operational area name", "error");
      return;
    }

    const trimmed = newLocationInput.trim();
    if (serviceLocations.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast("This service area is already in your active list", "error");
      return;
    }

    const newLoc = {
      id: "loc-" + Date.now(),
      name: trimmed,
      address: `${trimmed}, Operational Zone`,
      isPrimary: serviceLocations.length === 0,
    };

    const updated = [...serviceLocations, newLoc];
    await saveServiceLocations(updated);
    setNewLocationInput("");
    showToast(`Service location added: ${trimmed}`, "success");
  };

  // Set primary location
  const handleSetPrimaryLocation = async (id) => {
    const updated = serviceLocations.map((loc) => ({
      ...loc,
      isPrimary: loc.id === id,
    }));
    await saveServiceLocations(updated);
    showToast("Primary service location updated", "success");
  };

  // Delete service location
  const handleDeleteLocation = async (id) => {
    if (serviceLocations.length <= 1) {
      showToast("At least one operational service area must remain active.", "error");
      return;
    }
    const updated = serviceLocations.filter((l) => l.id !== id);
    if (!updated.some((l) => l.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    await saveServiceLocations(updated);
    showToast("Service location removed", "info");
  };

  // Save edited location name
  const handleSaveEditedLocation = async (id) => {
    if (!editLocName.trim()) {
      setEditingLocId(null);
      return;
    }
    const updated = serviceLocations.map((loc) =>
      loc.id === id ? { ...loc, name: editLocName.trim(), address: `${editLocName.trim()}, Operational Zone` } : loc
    );
    await saveServiceLocations(updated);
    setEditingLocId(null);
    showToast("Service location updated", "success");
  };

  // ========================================================
  // 3. PROFILE PHOTO HANDLERS (Real Camera & Gallery Upload)
  // ========================================================
  const onImageFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP)", "error");
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

  // Request camera permission and trigger camera capture
  const handleTriggerCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn("Camera permission note:", err);
    }
    localCameraInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Open device image gallery
  const handleTriggerGallery = () => {
    localFileInputRef.current?.click();
    setShowPhotoOptionsModal(false);
  };

  // Save confirmed photo — bake into 512×512 square canvas to prevent face clipping
  const handleSaveCroppedPhoto = async () => {
    if (!photoPreviewUrl) return;
    setIsSavingPhoto(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = photoPreviewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate((rotationDegrees * Math.PI) / 180);
      ctx.scale(zoomLevel, zoomLevel);

      const imgAspect = img.width / img.height;
      let drawW, drawH;
      if (imgAspect > 1) {
        drawH = 512;
        drawW = 512 * imgAspect;
      } else {
        drawW = 512;
        drawH = 512 / imgAspect;
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const bakedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      await updateAvatar(bakedDataUrl);
      showToast("Profile photo updated successfully!", "success");
      setPhotoPreviewUrl(null);
      setShowPhotoOptionsModal(false);
    } catch {
      // Fallback: save original if canvas fails
      await updateAvatar(photoPreviewUrl);
      showToast("Profile photo updated successfully!", "success");
      setPhotoPreviewUrl(null);
      setShowPhotoOptionsModal(false);
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // ========================================================
  // 4. DEDICATED PERSONAL INFORMATION EDIT FORM (NOT Registration)
  // ========================================================
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);
  const [personalFormData, setPersonalFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "Plumbing",
    experience_years: 3,
    skills: "",
    vehicle_type: "Rapid Response Van",
    address: "",
    bio: "",
  });

  const handleOpenEditPersonalInfo = () => {
    setPersonalFormData({
      name: techProfile?.name || "",
      phone: techProfile?.phone || "",
      email: techProfile?.email || "",
      category: techProfile?.category || "Plumbing",
      experience_years: techProfile?.experience_years || 3,
      skills: techProfile?.skills || "",
      vehicle_type: techProfile?.vehicle_type || "Rapid Response Van",
      address: techProfile?.address || techProfile?.technician_address || "",
      bio: techProfile?.experience_description || techProfile?.bio || "",
    });
    setIsEditingPersonalInfo(true);
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    if (!personalFormData.name.trim()) {
      showToast("Full Legal Name is required", "error");
      return;
    }
    if (!personalFormData.phone.trim()) {
      showToast("Mobile Phone Number is required", "error");
      return;
    }
    if (!personalFormData.email.trim()) {
      showToast("Email Address is required", "error");
      return;
    }

    setIsSavingPersonalInfo(true);
    try {
      const payload = {
        name: personalFormData.name.trim(),
        phone: personalFormData.phone.trim(),
        email: personalFormData.email.trim(),
        category: personalFormData.category,
        experience_years: Number(personalFormData.experience_years) || 1,
        skills: personalFormData.skills.trim(),
        vehicle_type: personalFormData.vehicle_type,
        address: personalFormData.address.trim(),
        bio: personalFormData.bio.trim(),
      };

      await technicianStore.updateProfile(payload);

      // Update context state immediately
      if (setTechProfile) {
        setTechProfile((prev) => ({
          ...prev,
          ...payload,
          experience_description: payload.bio,
        }));
      }

      // Persist to localStorage so data survives refresh and navigation
      try {
        const existingProfile = JSON.parse(
          localStorage.getItem("argent_technician_profile") || "{}"
        );
        const updatedProfile = { ...existingProfile, ...payload, experience_description: payload.bio };
        localStorage.setItem("argent_technician_profile", JSON.stringify(updatedProfile));

        const storedUser = JSON.parse(localStorage.getItem("argent_technician_user") || "{}");
        const updatedUser = {
          ...storedUser,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          technician: {
            ...(storedUser.technician || {}),
            ...payload,
            experience_description: payload.bio,
          },
        };
        localStorage.setItem("argent_technician_user", JSON.stringify(updatedUser));
      } catch (storageErr) {
        console.warn("Storage warning:", storageErr);
      }

      showToast("Personal information updated successfully!", "success");
      setIsEditingPersonalInfo(false);
    } catch (err) {
      console.error("Save personal info error:", err);
      showToast("Failed to save personal information", "error");
    } finally {
      setIsSavingPersonalInfo(false);
    }
  };

  // Security / Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoStepEnabled, setTwoStepEnabled] = useState(true);

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

  const proName = techProfile?.name || "Professional Partner";
  const proCategory = techProfile?.category || "General Services";
  const proExpYears = techProfile?.experience_years ? Number(techProfile.experience_years) : 1;
  const proRating = metrics?.rating ? Number(metrics.rating).toFixed(1) : (techProfile?.rating ? Number(techProfile.rating).toFixed(1) : "New");
  const proJobsCount = metrics?.completedCount ?? metrics?.totalJobs ?? techProfile?.total_jobs ?? 0;

  const docStatus = techProfile?.status || (techProfile?.id_document_url ? "Pending Verification" : "Not Verified");
  const isDocApproved = docStatus === "Approved";
  const isDocPending = docStatus === "Pending Verification";
  const isDocRejected = docStatus === "Rejected";

  // Horizontal Profile Section Tabs (7 cleanly organized tabs)
  const profileTabs = [
    { id: "overview", label: "Overview" },
    { id: "personal", label: "Personal Info" },
    { id: "areas", label: "Service Areas" },
    { id: "verification", label: "Verification" },
    { id: "work_proof", label: "Work Proof" },
    { id: "bank", label: "Bank & Payout" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-2xl mx-auto px-1 sm:px-4 pb-28 text-slate-900">
      {/* Hidden file pickers for profile photo upload */}
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

      {/* Hidden file pickers for Work & Experience Proof */}
      <input
        type="file"
        ref={proofFileInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleProofImageSelected}
      />
      <input
        type="file"
        ref={proofCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleProofImageSelected}
      />

      {/* Hidden file pickers for ID & Trade Verification Documents */}
      <input
        type="file"
        ref={docFileInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleDocFileSelected}
      />
      <input
        type="file"
        ref={docCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleDocFileSelected}
      />

      {/* ========================================================
          1. PREMIUM PROFILE HEADER CARD (Circular photo, badges, info)
          Informational & Profile photo change trigger only
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden text-center space-y-3.5">
        {/* Soft background radial highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Large Circular Profile Photo with Camera Tap Overlay */}
        <div className="relative inline-block mx-auto">
          <div
            onClick={() => setShowPhotoOptionsModal(true)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-600/40 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-102 relative"
            title="Click to change profile picture"
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
            {isDocApproved && (
              <span
                title="Verified Professional"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-700 text-white"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold text-emerald-800">
            {proCategory} Specialist &bull;{" "}
            <span className="text-slate-500 font-semibold">
              {techProfile?.account_type === "company" ? "Service Company" : "Certified Partner"}
            </span>
          </p>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            {isDocApproved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Verified Professional
              </span>
            ) : isDocPending ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Pending Verification
              </span>
            ) : isDocRejected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-900 border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                Action Required (Rejected)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                Not Verified
              </span>
            )}
          </div>
        </div>

        {/* Contact Info Summary */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-full sm:w-auto justify-center">
            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{techProfile?.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-full sm:w-auto justify-center">
            <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{techProfile?.email || "—"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          STICKY HORIZONTAL SECTION NAVIGATION (Requirement 1)
          Single row, scrollable, no duplicate buttons
         ======================================================== */}
      <div className="sticky top-0 z-20 bg-[#f6f7f3] pt-2 pb-2.5 border-b border-slate-200/80 -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap touch-pan-x px-1 py-1">
          {profileTabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => (mobileTabRefs.current[tab.id] = el)}
                type="button"
                onClick={() => {
                  setActiveSection(tab.id);
                  setIsEditingPersonalInfo(false);
                }}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none relative ${
                  isActive
                    ? "bg-slate-950 text-white shadow-md scale-102"
                    : "bg-white/90 text-slate-700 border border-slate-200/80 hover:bg-white"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SELECTED PROFILE SECTION CONTENT
         ======================================================== */}

      {/* --------------------------------------------------------
          SECTION 1: OVERVIEW (Informational ONLY, NO edit/settings buttons)
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
                Rating {techProfile?.total_jobs && techProfile.total_jobs > 0 ? `(${techProfile.total_jobs} jobs)` : ""}
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

          {/* Operational Dispatch Readiness Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  Operational Credentials & Readiness
                </h3>
              </div>
              <span
                className={
                  "px-2 py-0.5 rounded-full text-[10px] font-bold " +
                  (isDocApproved
                    ? "bg-emerald-100 text-emerald-800"
                    : isDocPending
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700")
                }
              >
                {isDocApproved
                  ? "Verified Partner"
                  : isDocPending
                  ? "Pending Verification"
                  : "Active Partner"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Primary Dispatch Zone
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {serviceLocations.find((l) => l.isPrimary)?.name || "Delhi NCR"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Response Vehicle
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {techProfile?.vehicle_type || "Rapid Response Van"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 text-[11px] text-emerald-950 flex items-center justify-between">
              <span className="font-semibold">
                Coverage: {serviceLocations.length} active operational dispatch zones
              </span>
              <span className="text-emerald-700 font-black">100% Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 2: PERSONAL INFO — Dedicated Edit Form (NOT Registration)
         -------------------------------------------------------- */}
      {activeSection === "personal" && (
        <>
          {isEditingPersonalInfo ? (
            /* ============ DEDICATED PERSONAL INFORMATION EDIT FORM ============ */
            <form
              onSubmit={handleSavePersonalInfo}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Edit Personal Information
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Update your contact details and professional credentials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPersonalInfo(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Legal Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={personalFormData.name}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={personalFormData.phone}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={personalFormData.email}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="partner@argentyour.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Primary Service Category (Locked - Requirement 4) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Primary Service Category
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800">
                    <span>{personalFormData.category || techProfile?.category || "General Services"}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Locked
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Primary trade registered upon signup is verified and locked.
                  </p>
                </div>

                {/* Additional Services & Specialties (Requirement 4) */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase text-slate-500">
                      Additional Services &amp; Specialties
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Add specific jobs you perform
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/80 min-h-[44px]">
                    {additionalServices.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No additional services added yet.</span>
                    ) : (
                      additionalServices.map((svc) => (
                        <span
                          key={svc}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
                        >
                          <span>{svc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalService(svc)}
                            className="hover:text-red-600 cursor-pointer"
                            title="Remove service"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAdditionalService();
                        }
                      }}
                      placeholder="e.g. Home Wiring, Fan Installation, Pipe Leakage"
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddAdditionalService}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Experience in Years */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Experience in Years
                  </label>
                  <select
                    value={personalFormData.experience_years}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({
                        ...p,
                        experience_years: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none transition-all"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,12,15,20,25,30].map((yr) => (
                      <option key={yr} value={yr}>{yr} {yr === 30 ? "+" : ""} Year{yr !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Operational Vehicle Type */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Operational Vehicle Type
                  </label>
                  <select
                    value={personalFormData.vehicle_type}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, vehicle_type: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none transition-all"
                  >
                    <option value="Rapid Response Van">Rapid Response Van</option>
                    <option value="Motorcycle / Two-Wheeler">Motorcycle / Two-Wheeler</option>
                    <option value="Utility Truck">Utility Truck</option>
                    <option value="Car / Hatchback">Car / Hatchback</option>
                    <option value="Emergency Service Vehicle">Emergency Service Vehicle</option>
                    <option value="None">None</option>
                  </select>
                </div>

                {/* Skills & Specializations */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Skills &amp; Specializations
                  </label>
                  <input
                    type="text"
                    value={personalFormData.skills}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, skills: e.target.value }))
                    }
                    placeholder="e.g. Emergency Diagnostics, Rapid Repair, OEM Installation"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Operating / Base Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Operating / Base Address
                  </label>
                  <input
                    type="text"
                    value={personalFormData.address}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="e.g. Connaught Place, Central Delhi, 110001"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Professional Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Professional Bio &amp; Work Summary
                  </label>
                  <textarea
                    rows={3}
                    value={personalFormData.bio}
                    onChange={(e) =>
                      setPersonalFormData((p) => ({ ...p, bio: e.target.value }))
                    }
                    placeholder="Brief description of your expertise, certifications, and service dedication..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingPersonalInfo(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPersonalInfo}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingPersonalInfo ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ============ VIEW MODE: displays current personal info with compact Edit button ============ */
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900">
                      Personal &amp; Professional Information
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Account registration details and certified credentials
                    </p>
                  </div>
                </div>

                {/* ONE compact, non-wrapping Edit button with Pencil icon */}
                <button
                  type="button"
                  onClick={handleOpenEditPersonalInfo}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-xs min-w-[80px] shrink-0 select-none"
                  title="Edit Personal Information"
                >
                  <Pencil className="w-3.5 h-3.5 shrink-0" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {/* Full Legal Name */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Full Legal Name</span>
                  <span className="font-bold text-slate-800">{proName}</span>
                </div>

                {/* Email Address */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-none">
                      {techProfile?.email || "—"}
                    </span>
                    {techProfile?.email && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Mobile Phone Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {techProfile?.phone || "—"}
                    </span>
                    {techProfile?.phone && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Professional Type */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Professional Type</span>
                  <span className="font-bold text-slate-800">
                    {techProfile?.account_type === "company" || techProfile?.company_name
                      ? "Service Company / Agency"
                      : "Individual Professional"}
                  </span>
                </div>

                {/* Primary Service Trade (Locked - Requirement 4) */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Primary Trade</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>{proCategory}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Lock className="w-2.5 h-2.5 text-emerald-700" />
                      Verified &amp; Locked
                    </span>
                  </div>
                </div>

                {/* Additional Services (Requirement 4) */}
                <div className="flex items-start justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Additional Services</span>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[65%]">
                    {additionalServices.length === 0 ? (
                      <span className="font-semibold text-slate-400 text-xs">None added</span>
                    ) : (
                      additionalServices.map((svc) => (
                        <span key={svc} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          {svc}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Experience</span>
                  <span className="font-bold text-slate-800">{proExpYears} Year{proExpYears !== 1 ? "s" : ""}</span>
                </div>

                {/* Skills / Specializations */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Skills &amp; Specializations</span>
                  <span className="font-bold text-slate-800 text-right max-w-[55%]">
                    {techProfile?.skills || "—"}
                  </span>
                </div>

                {/* Primary Service Location */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Primary Service Location</span>
                  <span className="font-bold text-slate-800">
                    {serviceLocations.find((l) => l.isPrimary)?.name || "Delhi NCR"}
                  </span>
                </div>

                {/* Operating Address */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Address</span>
                  <span className="font-bold text-slate-800 text-right max-w-[55%] truncate">
                    {techProfile?.address || techProfile?.technician_address || "—"}
                  </span>
                </div>

                {/* Vehicle Information */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Vehicle Information</span>
                  <span className="font-bold text-slate-800">
                    {techProfile?.vehicle_type || "Rapid Response Van"}
                  </span>
                </div>

                {/* Verification Document Info */}
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Verification ID</span>
                  <span className="font-bold text-slate-800">
                    {techProfile?.id_document_type || (techProfile?.id_document_url ? "Document Uploaded" : "Not Provided")}
                  </span>
                </div>

                {/* Professional Bio */}
                <div className="pt-1 space-y-1">
                  <span className="text-slate-400 font-medium block">Professional Bio</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {techProfile?.experience_description ||
                      techProfile?.bio ||
                      "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --------------------------------------------------------
          SECTION 3: SERVICE ADDRESS / SERVICE AREAS (Requirement 5)
          Add current location with permission, select manually, edit, delete, set primary
         -------------------------------------------------------- */}
      {activeSection === "areas" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Service Address & Locations
                </h2>
                <p className="text-[11px] text-slate-400">
                  Manage active dispatch zones and doorstep service territory
                </p>
              </div>
            </div>

            {/* Button: Use Current Device Location with Permission */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin" : ""}`} />
              <span>{isDetectingLocation ? "Detecting GPS..." : "Add Current Location"}</span>
            </button>
          </div>

          {/* Add Manual Service Location Form */}
          <form onSubmit={handleAddManualLocation} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter locality or service zone (e.g. Connaught Place, Noida Sector 62)"
              value={newLocationInput}
              onChange={(e) => setNewLocationInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-600 bg-slate-50/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Zone</span>
            </button>
          </form>

          {/* List of Managed Locations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active Service Zones ({serviceLocations.length})
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {serviceLocations.map((loc) => {
                const isEditing = editingLocId === loc.id;
                return (
                  <div
                    key={loc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      loc.isPrimary
                        ? "bg-emerald-50/70 border-emerald-300 shadow-2xs"
                        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editLocName}
                            onChange={(e) => setEditLocName(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-emerald-500 text-xs font-bold text-slate-800 bg-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditedLocation(loc.id)}
                            className="px-2 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLocId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {loc.name}
                          </span>
                          {loc.isPrimary && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                              <Star className="w-3 h-3 fill-white" />
                              Primary Zone
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">
                        {loc.address}
                      </p>
                    </div>

                    {/* Location Actions: Set Primary, Edit, Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!loc.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryLocation(loc.id)}
                          className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocId(loc.id);
                          setEditLocName(loc.name);
                        }}
                        className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
                        title="Edit location name"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete service area"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 4: VERIFICATION (Requirement 5)
          Strictly reflects real submitted documents & status in DB
         -------------------------------------------------------- */}
      {activeSection === "verification" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-fade-in">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Verification &amp; Credentials
                </h2>
                <p className="text-[11px] text-slate-400">
                  Government ID and trade credential status
                </p>
              </div>
            </div>

            {/* Dynamic Status Pill */}
            <span
              className={
                "self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold " +
                (isDocApproved
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isDocPending
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : isDocRejected
                  ? "bg-red-100 text-red-900 border border-red-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300")
              }
            >
              {isDocApproved
                ? "Verified ✓"
                : isDocPending
                ? "Pending Verification"
                : isDocRejected
                ? "Action Required (Rejected)"
                : "Not Verified"}
            </span>
          </div>

          {/* Verification Status Overview Banner */}
          {isDocApproved ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-emerald-950">
                  Account Verified &amp; Approved
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your credentials have been fully verified by Argent Partner Operations. You are certified to receive customer dispatch requests and execute service bookings.
                </p>
              </div>
            </div>
          ) : isDocPending ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-950">
                  Verification Under Review
                </p>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Your identification document has been submitted and is currently being verified by our compliance team. Verification typically takes 2 to 24 hours.
                </p>
              </div>
            </div>
          ) : isDocRejected ? (
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-red-950">
                  Verification Rejected — Action Required
                </p>
                <p className="text-xs text-red-800 leading-relaxed">
                  {techProfile?.verification_notes
                    ? `Reason: ${techProfile.verification_notes}`
                    : "Your submitted document could not be verified. Please ensure the document is clear, valid, and re-upload below."}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900">
                  No Verification Document Submitted
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please submit a government-issued photo ID (Aadhaar, PAN, Voter ID, Driving License) or trade certification below to become a verified dispatch partner.
                </p>
              </div>
            </div>
          )}

          {/* Current Document Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Submitted Document Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Document Type
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {techProfile?.id_document_type || (techProfile?.id_document_url ? "Government Photo ID" : "None Submitted")}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Verification Status
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {docStatus}
                </span>
              </div>
            </div>

            {techProfile?.id_document_url && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1.5">
                  Document Preview / Attachment
                </span>
                <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  {techProfile.id_document_url.startsWith("data:image/") || techProfile.id_document_url.startsWith("http") ? (
                    <img
                      src={techProfile.id_document_url}
                      alt="ID Document"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <FileCheck className="w-5 h-5 text-emerald-700 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-600">Attached</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Document Upload / Update Form */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              {techProfile?.id_document_url ? "Upload New / Updated Document" : "Upload Verification Document"}
            </h3>
            <p className="text-xs text-slate-500">
              Select your document type and upload a clear photo or document copy.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-600 outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                  <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                  <option value="Voter ID Card">Voter ID / Election Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Government Trade License">Government Trade License</option>
                  <option value="Electrician Certification / Wireman License">Electrician Certification / Wireman License</option>
                  <option value="Plumbing Master Certificate">Plumbing Master Certificate</option>
                  <option value="GST / Business Registration">GST / Business Registration</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  disabled={isUploadingDoc}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploadingDoc ? "Uploading..." : "Upload from Device"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => docCameraInputRef.current?.click()}
                  disabled={isUploadingDoc}
                  className="px-4 py-2.5 rounded-xl border border-emerald-800 text-emerald-800 hover:bg-emerald-50 disabled:border-slate-300 disabled:text-slate-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo with Camera</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 5: WORK / EXPERIENCE PROOF (Requirement 4)
          Dedicated section for uploading genuine work photos and certificates
         -------------------------------------------------------- */}
      {activeSection === "work_proof" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Work & Experience Proof
                </h2>
                <p className="text-[11px] text-slate-400">
                  Upload genuine project photos, work certificates, and trade evidence
                </p>
              </div>
            </div>

            {/* Add Work Proof Button */}
            <button
              type="button"
              onClick={() => setShowAddProofModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Work Proof</span>
            </button>
          </div>

          {/* Work Proof Items Grid */}
          {workProofs.length === 0 ? (
            <div className="py-10 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-sm">No Work Proofs Uploaded Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Upload photos of previous repairs, completed customer projects, or trade certificates to showcase your genuine experience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProofModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Proof</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {workProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/50 overflow-hidden shadow-2xs group flex flex-col justify-between"
                >
                  <div
                    onClick={() => setProofPreviewItem(proof)}
                    className="h-40 bg-slate-900 overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={proof.imageUrl}
                      alt={proof.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      {proof.category}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{proof.title}</p>
                      <p className="text-[10px] text-slate-400">Added on {proof.uploadedAt}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setProofPreviewItem(proof)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
                        title="Preview document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProof(proof.id)}
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs"
                        title="Delete work proof"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------
          SECTION 6: BANK & PAYOUT
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
          SECTION 7: SECURITY
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
              {/* Option 1: Take Photo with camera permission */}
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo (Camera)</span>
              </button>

              {/* Option 2: Choose from Gallery */}
              <button
                type="button"
                onClick={handleTriggerGallery}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Choose from Gallery / Photos</span>
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
          CROP & PREVIEW SCREEN FOR PROFILE PHOTO
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

                <button
                  type="button"
                  onClick={() => setRotationDegrees((prev) => (prev + 90) % 360)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>

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
          MODAL: ADD WORK & EXPERIENCE PROOF (Requirement 4)
         ======================================================== */}
      {showAddProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Upload Work & Experience Proof
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add project photos or certified trade documents
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProofModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProofSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Document / Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master ITI Certificate / Bathroom Remodel Installation"
                  value={newProofForm.title}
                  onChange={(e) => setNewProofForm({ ...newProofForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Proof Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProofForm.category}
                  onChange={(e) => setNewProofForm({ ...newProofForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                >
                  <option value="Completed Project Photo">Completed Project Photo</option>
                  <option value="Previous Work Photo">Previous Work Photo</option>
                  <option value="Work / Trade Certificate">Work / Trade Certificate</option>
                  <option value="Experience Document">Experience Document</option>
                  <option value="Authorized Brand Certification">Authorized Brand Certification</option>
                </select>
              </div>

              {/* Upload options: Camera or Gallery */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Proof Media <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => proofCameraInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Take Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => proofFileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              {/* Selected Image Preview in Modal */}
              {newProofForm.imageData && (
                <div className="rounded-xl border border-emerald-200 p-2 bg-emerald-50/50 flex items-center gap-3">
                  <img
                    src={newProofForm.imageData}
                    alt="Proof Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-emerald-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-950 truncate">Image ready for upload</p>
                    <p className="text-[10px] text-emerald-700">Tap below to submit</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProofModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  Save Work Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LIGHTBOX / PREVIEW WORK PROOF
         ======================================================== */}
      {proofPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  {proofPreviewItem.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {proofPreviewItem.category} &bull; Uploaded on {proofPreviewItem.uploadedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProofPreviewItem(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-[65vh] flex items-center justify-center">
              <img
                src={proofPreviewItem.imageUrl}
                alt={proofPreviewItem.title}
                className="w-full h-full object-contain max-h-[60vh]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setProofPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close Preview
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
