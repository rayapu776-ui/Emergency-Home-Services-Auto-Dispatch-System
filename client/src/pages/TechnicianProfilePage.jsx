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
  Trash2,
  Plus,
  Navigation,
  Eye,
  UploadCloud,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  Compass,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";
import technicianStore from "../services/technicianStore";

// Standard service categories matching the original registration form
const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "AC & Appliance Repair",
  "Home Cleaning",
  "Home Painting",
  "Carpenter",
  "Smart Home Products",
  "Women's Salon & Spa",
  "Men's Salon & Massage",
];

// Experience brackets matching registration
const EXPERIENCE_OPTIONS = [
  { value: 1, label: "1 – 2 Years (Junior Technician)" },
  { value: 3, label: "3 – 5 Years (Certified Specialist)" },
  { value: 7, label: "6 – 10 Years (Senior Professional)" },
  { value: 12, label: "10+ Years (Master Technician)" },
];

// Government ID & Verification Document types matching registration
const ID_DOC_TYPES = [
  "Government Photo ID / Voter ID",
  "Aadhaar Card",
  "Driver's License (Commercial/Vehicle)",
  "National Trade Certificate (ITI)",
  "Authorized OEM / Brand Training Certificate",
  "GSTIN / Trade License",
];

// Common Delhi NCR regions matching registration
const SERVICE_REGIONS = [
  "Delhi NCR (All Zones)",
  "South Delhi",
  "Noida & Greater Noida",
  "Gurugram (Cyber City / Golf Course)",
  "North Delhi",
  "West Delhi",
  "East Delhi & Ghaziabad",
];

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

  // Active section in horizontal navigation
  const [activeSection, setActiveSection] = useState("overview");

  // =========================================================================
  // 1. REGISTRATION FORM MODAL STATE (Original Registration Form Fields)
  // =========================================================================
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);
  const [regForm, setRegForm] = useState({
    accountType: "individual", // 'individual' | 'company'
    name: "",
    email: "",
    phone: "",
    location: "Delhi NCR (All Zones)",
    address: "",
    category: "Plumbing",
    skills: "",
    experience_years: 3,
    experience_description: "",
    vehicle_type: "Rapid Response Van",
    id_document_type: ID_DOC_TYPES[1], // Aadhaar Card default
    id_document_url: "",
    // Company specific fields
    company_name: "",
    authorized_person: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    business_registration_number: "",
  });

  // Open the comprehensive original registration form
  const openRegistrationForm = () => {
    const isComp =
      techProfile?.account_type === "company" ||
      Boolean(techProfile?.company_name);

    setRegForm({
      accountType: isComp ? "company" : "individual",
      name: techProfile?.name || "Apu Ray",
      email: techProfile?.email || "partner@argentyour.com",
      phone: techProfile?.phone || "+91 98765 43210",
      location:
        techProfile?.location ||
        techProfile?.service_areas?.split(",")[0]?.trim() ||
        "Delhi NCR (All Zones)",
      address:
        techProfile?.address ||
        "124 Barakhamba Road, Connaught Place, New Delhi",
      category: techProfile?.category || "Plumbing",
      skills:
        techProfile?.skills ||
        "Emergency pipe leakage, water heater repair, sanitary installations, drainage clearing",
      experience_years: techProfile?.experience_years || 5,
      experience_description:
        techProfile?.experience_description ||
        techProfile?.bio ||
        "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones.",
      vehicle_type: techProfile?.vehicle_type || "Rapid Response Van",
      id_document_type: techProfile?.id_document_type || "Aadhaar Card",
      id_document_url: techProfile?.id_document_url || "UID-9821-4402-8819",
      company_name: techProfile?.company_name || techProfile?.name || "",
      authorized_person: techProfile?.authorized_person || techProfile?.name || "",
      business_email:
        techProfile?.business_email || techProfile?.email || "business@argentyour.com",
      business_phone:
        techProfile?.business_phone || techProfile?.phone || "+91 98765 43210",
      business_address:
        techProfile?.business_address ||
        techProfile?.address ||
        "Corporate Tower B, Cyber City, Gurugram",
      business_registration_number:
        techProfile?.business_registration_number || "GSTIN07AAACG6620M1ZX",
    });
    setShowRegistrationModal(true);
  };

  // Submit and save updated registration information
  const handleSaveRegistration = async (e) => {
    e.preventDefault();
    const isCompany = regForm.accountType === "company";

    if (isCompany) {
      if (!regForm.company_name.trim()) {
        showToast("Please enter Company / Business Name", "error");
        return;
      }
      if (!regForm.authorized_person.trim()) {
        showToast("Please enter Owner / Authorized Person Name", "error");
        return;
      }
      if (!regForm.business_email.trim() || !regForm.business_email.includes("@")) {
        showToast("Please enter a valid Business Email", "error");
        return;
      }
      if (!regForm.business_phone.trim()) {
        showToast("Please enter Business Phone Number", "error");
        return;
      }
      if (!regForm.business_address.trim()) {
        showToast("Please enter registered Business Address", "error");
        return;
      }
    } else {
      if (!regForm.name.trim()) {
        showToast("Please enter Full Legal Name", "error");
        return;
      }
      if (!regForm.email.trim() || !regForm.email.includes("@")) {
        showToast("Please enter a valid Email Address", "error");
        return;
      }
      if (!regForm.phone.trim()) {
        showToast("Please enter Mobile Phone Number", "error");
        return;
      }
      if (!regForm.address.trim()) {
        showToast("Please enter Operating Address", "error");
        return;
      }
    }

    setIsSavingRegistration(true);
    try {
      const payload = {
        name: isCompany ? regForm.company_name.trim() : regForm.name.trim(),
        email: isCompany ? regForm.business_email.trim() : regForm.email.trim(),
        phone: isCompany ? regForm.business_phone.trim() : regForm.phone.trim(),
        address: isCompany ? regForm.business_address.trim() : regForm.address.trim(),
        category: regForm.category,
        skills: regForm.skills.trim(),
        experience_years: Number(regForm.experience_years),
        experience_description: regForm.experience_description.trim(),
        bio: regForm.experience_description.trim(),
        vehicle_type: regForm.vehicle_type.trim(),
        location: regForm.location,
        service_areas: regForm.location,
        account_type: regForm.accountType,
        id_document_type: regForm.id_document_type,
        id_document_url: regForm.id_document_url.trim(),
        ...(isCompany && {
          company_name: regForm.company_name.trim(),
          authorized_person: regForm.authorized_person.trim(),
          business_email: regForm.business_email.trim(),
          business_phone: regForm.business_phone.trim(),
          business_address: regForm.business_address.trim(),
          business_registration_number:
            regForm.business_registration_number.trim(),
        }),
      };

      await technicianStore.updateProfile(payload);

      if (setTechProfile) {
        setTechProfile((prev) => ({ ...prev, ...payload }));
      } else if (techProfile) {
        Object.assign(techProfile, payload);
      }

      showToast("Registration information updated successfully!", "success");
      setShowRegistrationModal(false);
    } catch (err) {
      console.error("Save registration error:", err);
      showToast("Failed to save registration details. Please try again.", "error");
    } finally {
      setIsSavingRegistration(false);
    }
  };

  // =========================================================================
  // 2. PROFILE PHOTO SYSTEM (Camera Capture, Gallery Picker, Crop/Preview)
  // =========================================================================
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);
  const [showLiveCameraModal, setShowLiveCameraModal] = useState(false);
  const [showCropPreviewModal, setShowCropPreviewModal] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputFallbackRef = useRef(null);

  // Stop video stream cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Launch live camera with device permission
  const handleStartLiveCamera = async () => {
    setShowPhotoPickerModal(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        setShowLiveCameraModal(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        // Fallback to native capture input
        if (cameraInputFallbackRef.current) {
          cameraInputFallbackRef.current.click();
        }
      }
    } catch (err) {
      console.warn("Camera stream access issue:", err);
      showToast("Camera access unavailable. Opening photo capture...", "info");
      if (cameraInputFallbackRef.current) {
        cameraInputFallbackRef.current.click();
      }
    }
  };

  // Snap photo frame from live camera stream
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      stopCameraStream();
      setShowLiveCameraModal(false);
      setCapturedPhotoUrl(dataUrl);
      setZoomLevel(1);
      setRotationDegrees(0);
      setShowCropPreviewModal(true);
    } catch {
      showToast("Failed to snap picture from camera", "error");
    }
  };

  // Handle image selected from gallery or fallback file input
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WEBP)", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Selected image must be under 10MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setShowPhotoPickerModal(false);
        setCapturedPhotoUrl(dataUrl);
        setZoomLevel(1);
        setRotationDegrees(0);
        setShowCropPreviewModal(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Confirm and persist cropped personal profile picture
  const handleSaveCroppedPhoto = async () => {
    if (!capturedPhotoUrl) return;
    setIsSavingPhoto(true);
    try {
      await updateAvatar(capturedPhotoUrl);
      showToast("Profile photo updated successfully!", "success");
      setShowCropPreviewModal(false);
      setCapturedPhotoUrl(null);
    } catch {
      showToast("Failed to update profile photo", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // =========================================================================
  // 3. WORK & EXPERIENCE PROOF SECTION (Upload genuine photos & certificates)
  // =========================================================================
  const [workProofs, setWorkProofs] = useState([]);
  const [showAddProofModal, setShowAddProofModal] = useState(false);
  const [selectedProofPreview, setSelectedProofPreview] = useState(null);
  const [proofForm, setProofForm] = useState({
    title: "",
    category: "Completed Project Photo",
    description: "",
    imageDataUrl: "",
  });
  const proofFileInputRef = useRef(null);

  // Load genuine work proofs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("argent_technician_work_proofs");
      if (saved) {
        setWorkProofs(JSON.parse(saved));
      } else {
        setWorkProofs([]);
      }
    } catch {
      setWorkProofs([]);
    }
  }, []);

  // Handle proof image file chosen
  const handleProofImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image (PNG, JPG, WEBP)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofForm((prev) => ({
        ...prev,
        imageDataUrl: event.target?.result || "",
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save new proof item
  const handleSaveProof = (e) => {
    e.preventDefault();
    if (!proofForm.title.trim()) {
      showToast("Please enter a title for this proof", "error");
      return;
    }
    if (!proofForm.imageDataUrl) {
      showToast("Please upload a photo or document image", "error");
      return;
    }

    const newProof = {
      id: "proof-" + Date.now(),
      title: proofForm.title.trim(),
      category: proofForm.category,
      description: proofForm.description.trim(),
      imageUrl: proofForm.imageDataUrl,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    const updated = [newProof, ...workProofs];
    setWorkProofs(updated);
    try {
      localStorage.setItem("argent_technician_work_proofs", JSON.stringify(updated));
    } catch {
      // Ignore if quota exceeded
    }
    showToast("Work & experience proof added to verification portfolio!", "success");
    setProofForm({
      title: "",
      category: "Completed Project Photo",
      description: "",
      imageDataUrl: "",
    });
    setShowAddProofModal(false);
  };

  // Delete proof item
  const handleDeleteProof = (proofId) => {
    const updated = workProofs.filter((p) => p.id !== proofId);
    setWorkProofs(updated);
    try {
      localStorage.setItem("argent_technician_work_proofs", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    showToast("Proof removed from verification portfolio.", "info");
  };

  // =========================================================================
  // 4. SERVICE ADDRESS & SERVICE AREAS MANAGEMENT SECTION
  // =========================================================================
  const defaultLocations = [
    {
      id: "loc-1",
      name: "Connaught Place Central Hub",
      address: "124 Barakhamba Road, Connaught Place, New Delhi",
      isPrimary: true,
    },
    {
      id: "loc-2",
      name: "South Delhi Operations Base",
      address: "Greater Kailash II & Saket District Centre",
      isPrimary: false,
    },
    {
      id: "loc-3",
      name: "Gurugram / Cyber City Rapid Zone",
      address: "DLF Cyber City, Phase 2, Gurugram",
      isPrimary: false,
    },
    {
      id: "loc-4",
      name: "Noida Sectors Expressway",
      address: "Sector 62 & Expressway Corridor, Noida",
      isPrimary: false,
    },
  ];

  const [serviceLocations, setServiceLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isEditingLocationId, setIsEditingLocationId] = useState(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: "",
    address: "",
    isPrimary: false,
  });

  // Load locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("argent_technician_locations");
      if (saved) {
        setServiceLocations(JSON.parse(saved));
      } else {
        setServiceLocations(defaultLocations);
      }
    } catch {
      setServiceLocations(defaultLocations);
    }
  }, []);

  const saveLocationsToStorage = (list) => {
    setServiceLocations(list);
    try {
      localStorage.setItem("argent_technician_locations", JSON.stringify(list));
      const areasJoined = list.map((l) => l.name).join(", ");
      technicianStore.updateProfile({ service_areas: areasJoined });
    } catch {
      // Ignore
    }
  };

  // 4.1 Use Device Current Location with Permission
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      showToast("Device geolocation is not supported on this browser.", "error");
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsCapturingLocation(false);
        const { latitude, longitude } = pos.coords;
        const locationName = `GPS Station (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
        const locationAddr = `Current live device coordinate station, Delhi NCR`;

        const newLoc = {
          id: "loc-gps-" + Date.now(),
          name: locationName,
          address: locationAddr,
          isPrimary: true,
        };

        const updated = [
          newLoc,
          ...serviceLocations.map((l) => ({ ...l, isPrimary: false })),
        ];
        saveLocationsToStorage(updated);
        try {
          await technicianStore.updateLocation(latitude, longitude);
        } catch {
          // Ignore
        }
        showToast("Current device location saved as primary service zone!", "success");
      },
      (err) => {
        setIsCapturingLocation(false);
        console.warn("Location permission error:", err);
        showToast(
          "Location access denied or timed out. Please allow location permissions in your browser.",
          "error"
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 4.2 Save manual location (add or edit)
  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!locationForm.name.trim()) {
      showToast("Please enter an operational area name", "error");
      return;
    }
    if (!locationForm.address.trim()) {
      showToast("Please enter street / locality address", "error");
      return;
    }

    let updated;
    if (isEditingLocationId) {
      updated = serviceLocations.map((loc) => {
        if (loc.id === isEditingLocationId) {
          return {
            ...loc,
            name: locationForm.name.trim(),
            address: locationForm.address.trim(),
            ...(locationForm.isPrimary && { isPrimary: true }),
          };
        }
        return locationForm.isPrimary ? { ...loc, isPrimary: false } : loc;
      });
      showToast("Service location updated successfully!", "success");
    } else {
      const newLoc = {
        id: "loc-" + Date.now(),
        name: locationForm.name.trim(),
        address: locationForm.address.trim(),
        isPrimary: locationForm.isPrimary || serviceLocations.length === 0,
      };
      if (newLoc.isPrimary) {
        updated = [newLoc, ...serviceLocations.map((l) => ({ ...l, isPrimary: false }))];
      } else {
        updated = [...serviceLocations, newLoc];
      }
      showToast("Service location added successfully!", "success");
    }

    saveLocationsToStorage(updated);
    setShowLocationModal(false);
    setIsEditingLocationId(null);
    setLocationForm({ name: "", address: "", isPrimary: false });
  };

  // 4.3 Set primary location
  const handleSetPrimaryLocation = (locId) => {
    const updated = serviceLocations.map((loc) => ({
      ...loc,
      isPrimary: loc.id === locId,
    }));
    saveLocationsToStorage(updated);
    showToast("Primary dispatch location updated!", "success");
  };

  // 4.4 Delete location
  const handleDeleteLocation = (locId) => {
    if (serviceLocations.length <= 1) {
      showToast("At least one operational service area must remain active.", "error");
      return;
    }
    const deleting = serviceLocations.find((l) => l.id === locId);
    let updated = serviceLocations.filter((l) => l.id !== locId);
    if (deleting?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    saveLocationsToStorage(updated);
    showToast("Service location removed.", "info");
  };

  // =========================================================================
  // 5. SECURITY & PASSWORD MODAL STATE
  // =========================================================================
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
    if (!passwordForm.currentPassword) {
      showToast("Please enter current password", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated securely!", "success");
    }, 700);
  };

  // Horizontal Tabs configuration (7 clean sections)
  const profileTabs = [
    { id: "overview", label: "Overview" },
    { id: "personal", label: "Personal Info" },
    { id: "areas", label: "Service Areas" },
    { id: "verification", label: "Verification" },
    { id: "proof", label: "Work/Experience Proof" },
    { id: "bank", label: "Bank & Payout" },
    { id: "security", label: "Security" },
  ];

  const proName = techProfile?.name || "Apu Ray";
  const proCategory = techProfile?.category || "Plumbing";
  const proExpYears = techProfile?.experience_years || 5;
  const proRating = (techProfile?.rating || 4.9).toFixed(1);
  const proJobsCount = metrics?.completedJobs || techProfile?.total_jobs || 124;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-12 text-slate-900 font-sans">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        type="file"
        ref={cameraInputFallbackRef}
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        type="file"
        ref={proofFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleProofImageSelected}
      />

      {/* ========================================================
          1. PREMIUM PROFILE HEADER CARD (Circular photo, badges, info)
          (Zero duplicate edit buttons)
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden text-center space-y-3.5">
        {/* Soft background radial highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Large Circular Profile Photo with Camera Tap Overlay */}
        <div className="relative inline-block mx-auto">
          <div
            onClick={() => setShowPhotoPickerModal(true)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-600/40 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-102 relative"
            title="Click to change profile photo"
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
            onClick={() => setShowPhotoPickerModal(true)}
            aria-label="Change Profile Photo"
            title="Change Profile Photo"
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
              title="Verified Professional Partner"
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
      </div>

      {/* ========================================================
          STICKY HORIZONTAL SECTION NAVIGATION (Single horizontal row)
          [ Overview ] [ Personal Info ] [ Service Areas ] [ Verification ] [ Work/Experience Proof ] [ Bank & Payout ] [ Security ]
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
          SECTION 1: OVERVIEW (Informational only, zero edit buttons)
         ======================================================== */}
      {activeSection === "overview" && (
        <div className="space-y-4 animate-fade-in">
          {/* Profile Statistics Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs grid grid-cols-3 divide-x divide-slate-100 text-center">
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

          {/* Verification Status Overview Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Partner Credential Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Active Duty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Registration Type
                </span>
                <span className="font-bold text-slate-800">
                  {techProfile?.account_type === "company"
                    ? "Service Company / Business"
                    : "Individual Professional Partner"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Dispatch Vehicle
                </span>
                <span className="font-bold text-slate-800">
                  {techProfile?.vehicle_type || "Rapid Response Van"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Primary Hub
                </span>
                <span className="font-bold text-slate-800">
                  {serviceLocations.find((l) => l.isPrimary)?.name || "Connaught Place Central"}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Government ID Verification
                </span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  {techProfile?.id_document_type || "Aadhaar Card"} (Verified)
                </span>
              </div>
            </div>
          </div>

          {/* Professional Bio Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Professional Trade Bio
            </span>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {techProfile?.bio ||
                techProfile?.experience_description ||
                "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: PERSONAL INFORMATION (Original Registration Form View & Edit)
         ======================================================== */}
      {activeSection === "personal" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Personal Information
                </h2>
                <p className="text-[11px] text-slate-400">
                  Official partner registration credentials
                </p>
              </div>
            </div>
            {/* Single clean edit button that opens original registration form */}
            <button
              type="button"
              onClick={openRegistrationForm}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Registration Details</span>
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Account Type */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Registration Type</span>
              <span className="font-bold text-slate-800">
                {techProfile?.account_type === "company"
                  ? "Service Company / Business"
                  : "Individual Professional"}
              </span>
            </div>

            {/* Full Name */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Full Legal Name</span>
              <span className="font-bold text-slate-800">{proName}</span>
            </div>

            {/* Phone Number */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Mobile Phone</span>
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

            {/* Operating Region */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Service Location</span>
              <span className="font-bold text-slate-800">
                {techProfile?.location || "Delhi NCR (All Zones)"}
              </span>
            </div>

            {/* Operating Address */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Service / Operating Address</span>
              <span className="font-bold text-slate-800 text-right truncate max-w-[220px] sm:max-w-none">
                {techProfile?.address || "124 Barakhamba Road, Connaught Place, New Delhi"}
              </span>
            </div>

            {/* Vehicle Information */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Vehicle Information</span>
              <span className="font-bold text-slate-800">
                {techProfile?.vehicle_type || "Rapid Response Van"}
              </span>
            </div>

            {/* Key Skills */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Skills & Specializations</span>
              <span className="font-bold text-slate-800 text-right truncate max-w-[220px] sm:max-w-none">
                {techProfile?.skills || "Emergency Leakage, Sanitary Fittings, Drainage"}
              </span>
            </div>

            {/* Government ID Type & Reference */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Verification ID Reference</span>
              <span className="font-bold text-slate-800">
                {techProfile?.id_document_type || "Aadhaar Card"} &bull;{" "}
                <span className="font-mono text-emerald-800">
                  {techProfile?.id_document_url || "UID-9821-4402-8819"}
                </span>
              </span>
            </div>

            {/* Professional Bio */}
            <div className="pt-1 space-y-1">
              <span className="text-slate-400 font-medium block">Trade / Experience Bio</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {techProfile?.bio ||
                  techProfile?.experience_description ||
                  "Certified emergency home services technician committed to swift arrival, accurate diagnostics, and quality craftsmanship across all service zones."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 3: SERVICE ADDRESS / SERVICE AREAS
          (Device Location permission, Manual Add, Edit, Delete, Set Primary)
         ======================================================== */}
      {activeSection === "areas" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Service Address & Operating Areas
                </h2>
                <p className="text-[11px] text-slate-400">
                  Manage territories for automated customer dispatch
                </p>
              </div>
            </div>

            {/* Top Area Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseDeviceLocation}
                disabled={isCapturingLocation}
                className="py-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Capture device GPS coordinates with your permission"
              >
                <Compass className={`w-3.5 h-3.5 text-emerald-700 ${isCapturingLocation ? "animate-spin" : ""}`} />
                <span>{isCapturingLocation ? "Getting GPS..." : "Use Current Location"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditingLocationId(null);
                  setLocationForm({ name: "", address: "", isPrimary: false });
                  setShowLocationModal(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Area</span>
              </button>
            </div>
          </div>

          {/* Service Locations List */}
          <div className="space-y-3">
            {serviceLocations.map((loc) => (
              <div
                key={loc.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  loc.isPrimary
                    ? "bg-emerald-50/60 border-emerald-300 shadow-2xs"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      loc.isPrimary
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900">
                        {loc.name}
                      </span>
                      {loc.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                          Primary Dispatch Base
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {loc.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!loc.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryLocation(loc.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLocationId(loc.id);
                      setLocationForm({
                        name: loc.name,
                        address: loc.address,
                        isPrimary: loc.isPrimary,
                      });
                      setShowLocationModal(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Edit Location"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Argent Your dispatches emergency service requests based on your primary and active service territories. Device location permissions are requested only when you click "Use Current Location".
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 4: VERIFICATION STATUS
         ======================================================== */}
      {activeSection === "verification" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Verification & Compliance Status
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Authorized Partner
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">Identity Verified</p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Government photo ID ({techProfile?.id_document_type || "Aadhaar Card"}) and biometric verification completed.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  Trade Credentials & Skill Certification Verified
                </p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Verified trade competency certifications and professional background check approved.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  Dispatch Account & Insurance Active
                </p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Covered under Argent Partner Damage Protection Policy up to ₹50,000 per customer doorstep visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 5: WORK & EXPERIENCE PROOF
          (Upload genuine photos, certifications, view gallery, delete)
         ======================================================== */}
      {activeSection === "proof" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Work & Experience Proof
                </h2>
                <p className="text-[11px] text-slate-400">
                  Authentic completed project photos, trade certificates & documents
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setProofForm({
                  title: "",
                  category: "Completed Project Photo",
                  description: "",
                  imageDataUrl: "",
                });
                setShowAddProofModal(true);
              }}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Work Proof</span>
            </button>
          </div>

          {/* Proof Gallery */}
          {workProofs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">
                  No Work or Experience Proofs Uploaded Yet
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Upload genuine completed project photos, trade diplomas, or service certificates to strengthen your verification rating.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProofModal(true)}
                className="py-2 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Proof</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {workProofs.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => setSelectedProofPreview(item)}
                    className="h-36 w-full overflow-hidden bg-slate-900 relative cursor-pointer"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                      <span>Added: {item.date}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProofPreview(item)}
                          className="p-1 hover:text-emerald-700 cursor-pointer"
                          title="View full preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProof(item.id)}
                          className="p-1 hover:text-red-600 cursor-pointer"
                          title="Delete proof"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SECTION 6: BANK & PAYOUT DETAILS
         ======================================================== */}
      {activeSection === "bank" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Bank & Payout Settlement
                </h2>
                <p className="text-[11px] text-slate-400">
                  Daily automated IMPS payout account
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
              <span className="text-slate-400 font-medium">IFSC Code</span>
              <span className="font-mono font-bold text-slate-800">
                {bankAccount?.ifsc || "ICIC0001234"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Payout Settlement</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Active (Instant Daily IMPS)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 7: SECURITY
         ======================================================== */}
      {activeSection === "security" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              Account Security & Session
            </h2>
          </div>

          <div className="space-y-3">
            {/* Account Security Row */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Account Security Status</p>
                <p className="text-[11px] text-slate-400">Security shield active</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Protected
              </span>
            </div>

            {/* Two-step Verification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Two-Step Verification</p>
                <p className="text-[11px] text-slate-400">
                  SMS OTP on every portal sign-in
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

            {/* Change Password */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Password</p>
                <p className="text-[11px] text-slate-400">
                  Update credentials regularly for safety
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Change Password
              </button>
            </div>

            {/* Sign Out */}
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

      {/* =====================================================================
          MODAL 1: ORIGINAL REGISTRATION FORM MODAL (Comprehensive Edit)
          ===================================================================== */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Edit Professional Registration Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Same complete structure as partner account onboarding
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Registration Type Selector */}
            <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRegForm({ ...regForm, accountType: "individual" })}
                className={`py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  regForm.accountType === "individual"
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Individual Professional</span>
              </button>
              <button
                type="button"
                onClick={() => setRegForm({ ...regForm, accountType: "company" })}
                className={`py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  regForm.accountType === "company"
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Service Company</span>
              </button>
            </div>

            <form onSubmit={handleSaveRegistration} className="space-y-4 text-xs">
              {regForm.accountType === "company" ? (
                <>
                  {/* Mode Company */}
                  <div className="space-y-3">
                    <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-400">
                      1. Business Entity Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Company / Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.company_name}
                          onChange={(e) =>
                            setRegForm({ ...regForm, company_name: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Owner / Authorized Person Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.authorized_person}
                          onChange={(e) =>
                            setRegForm({ ...regForm, authorized_person: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={regForm.business_email}
                          onChange={(e) =>
                            setRegForm({ ...regForm, business_email: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Business Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.business_phone}
                          onChange={(e) =>
                            setRegForm({ ...regForm, business_phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Registered Business Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.business_address}
                          onChange={(e) =>
                            setRegForm({ ...regForm, business_address: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mode Individual */}
                  <div className="space-y-3">
                    <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-400">
                      1. Personal & Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.name}
                          onChange={(e) =>
                            setRegForm({ ...regForm, name: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) =>
                            setRegForm({ ...regForm, email: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.phone}
                          onChange={(e) =>
                            setRegForm({ ...regForm, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Service Location Region *
                        </label>
                        <select
                          value={regForm.location}
                          onChange={(e) =>
                            setRegForm({ ...regForm, location: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                        >
                          {SERVICE_REGIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Operating / Residential Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.address}
                          onChange={(e) =>
                            setRegForm({ ...regForm, address: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Section 2: Trade & Skills */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-400">
                  2. Trade, Experience & Vehicle Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Service Category *
                    </label>
                    <select
                      value={regForm.category}
                      onChange={(e) =>
                        setRegForm({ ...regForm, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Years of Experience *
                    </label>
                    <select
                      value={regForm.experience_years}
                      onChange={(e) =>
                        setRegForm({ ...regForm, experience_years: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                    >
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Vehicle Information
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rapid Response Van, Utility Bike, Commercial Carrier"
                      value={regForm.vehicle_type}
                      onChange={(e) =>
                        setRegForm({ ...regForm, vehicle_type: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Key Skills & Specializations
                    </label>
                    <input
                      type="text"
                      value={regForm.skills}
                      onChange={(e) =>
                        setRegForm({ ...regForm, skills: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      About / Professional Experience Bio
                    </label>
                    <textarea
                      rows={3}
                      value={regForm.experience_description}
                      onChange={(e) =>
                        setRegForm({ ...regForm, experience_description: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Identity Verification Information */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-black uppercase tracking-wider text-[11px] text-slate-400">
                  3. Identity Verification & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Document Type *
                    </label>
                    <select
                      value={regForm.id_document_type}
                      onChange={(e) =>
                        setRegForm({ ...regForm, id_document_type: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                    >
                      {ID_DOC_TYPES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Document Reference / Number
                    </label>
                    <input
                      type="text"
                      value={regForm.id_document_url}
                      onChange={(e) =>
                        setRegForm({ ...regForm, id_document_url: e.target.value })
                      }
                      placeholder="e.g. UID / DL / ITI Certificate #"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRegistration}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black transition-colors cursor-pointer shadow-xs"
                >
                  {isSavingRegistration ? "Saving..." : "Save Registration Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: PHOTO PICKER SHEET (Camera Option | Gallery Option | Cancel)
          ===================================================================== */}
      {showPhotoPickerModal && (
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
                onClick={() => setShowPhotoPickerModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload your genuine partner photo for customer dispatch identification:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Live Camera Capture */}
              <button
                type="button"
                onClick={handleStartLiveCamera}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo (Camera)</span>
              </button>

              {/* Option 2: Gallery Picker */}
              <button
                type="button"
                onClick={() => {
                  setShowPhotoPickerModal(false);
                  if (galleryInputRef.current) galleryInputRef.current.click();
                }}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Choose from Gallery / Photos</span>
              </button>

              {/* Option 3: Cancel */}
              <button
                type="button"
                onClick={() => setShowPhotoPickerModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl text-slate-500 font-semibold text-xs hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: LIVE CAMERA VIEWFINDER MODAL (Camera Permission & Capture)
          ===================================================================== */}
      {showLiveCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Camera Viewfinder
                </h3>
                <p className="text-[10px] text-slate-400">
                  Align face in circle and snap photo
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowLiveCameraModal(false);
                }}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-emerald-600 bg-slate-900 shadow-xl flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowLiveCameraModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CROP & PREVIEW MODAL (Zoom, Rotate, Reset, Confirm & Save)
          ===================================================================== */}
      {showCropPreviewModal && capturedPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Preview & Confirm Profile Photo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Framing for your official verified partner credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCropPreviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular preview mask */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-600 shadow-xl bg-slate-900 relative flex items-center justify-center">
                <img
                  src={capturedPhotoUrl}
                  alt="Crop Preview"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotationDegrees}deg)`,
                  }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              </div>

              {/* Zoom & Rotate Controls */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 px-1">Zoom:</span>
                  {[1, 1.25, 1.5, 2].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setZoomLevel(scale)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

            {/* Save Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCropPreviewModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCroppedPhoto}
                disabled={isSavingPhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSavingPhoto ? "Saving Photo..." : "Confirm & Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: ADD / EDIT SERVICE LOCATION MODAL
          ===================================================================== */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isEditingLocationId ? "Edit Service Location" : "Add Service Location"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Territory for automated order routing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Location / Area Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place & Central Hub"
                  value={locationForm.name}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Locality / Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barakhamba Road, Connaught Place, New Delhi"
                  value={locationForm.address}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryCheckbox"
                  checked={locationForm.isPrimary}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, isPrimary: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isPrimaryCheckbox" className="font-bold text-slate-700 cursor-pointer">
                  Set as Primary Dispatch Base
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black transition-colors shadow-xs"
                >
                  {isEditingLocationId ? "Save Changes" : "Add Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 6: ADD WORK & EXPERIENCE PROOF MODAL
          ===================================================================== */}
      {showAddProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Upload Work & Experience Proof
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add completed project or certification proof
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProofModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProof} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Proof Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Pipe Replacement / ITI Diploma"
                  value={proofForm.title}
                  onChange={(e) =>
                    setProofForm({ ...proofForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Proof Category *
                </label>
                <select
                  value={proofForm.category}
                  onChange={(e) =>
                    setProofForm({ ...proofForm, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 bg-white"
                >
                  <option value="Completed Project Photo">Completed Project Photo</option>
                  <option value="Work Certificate">Work Certificate</option>
                  <option value="Experience Document">Experience Document</option>
                  <option value="Before & After Service Photo">Before & After Service Photo</option>
                  <option value="Trade License">Trade License</option>
                </select>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Upload Photo or Certificate *
                </label>
                {proofForm.imageDataUrl ? (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-300 bg-slate-900 group">
                    <img
                      src={proofForm.imageDataUrl}
                      alt="Proof"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setProofForm({ ...proofForm, imageDataUrl: "" })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 cursor-pointer shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (proofFileInputRef.current) proofFileInputRef.current.click();
                    }}
                    className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-center"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="font-bold text-slate-700">Click to upload from device</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG or WEBP (up to 10MB)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Details about this job, tools used, or issuing authority"
                  value={proofForm.description}
                  onChange={(e) =>
                    setProofForm({ ...proofForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProofModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black transition-colors shadow-xs"
                >
                  Save Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 7: FULLSCREEN PROOF PREVIEW MODAL
          ===================================================================== */}
      {selectedProofPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedProofPreview.category}
                </span>
                <h3 className="font-black text-slate-900 text-sm mt-1">
                  {selectedProofPreview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofPreview(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-h-80 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={selectedProofPreview.imageUrl}
                alt={selectedProofPreview.title}
                className="w-full h-full object-contain"
              />
            </div>

            {selectedProofPreview.description && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedProofPreview.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Date: {selectedProofPreview.date}</span>
              <button
                type="button"
                onClick={() => setSelectedProofPreview(null)}
                className="py-1 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 8: CHANGE PASSWORD MODAL
          ===================================================================== */}
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
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors cursor-pointer"
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
