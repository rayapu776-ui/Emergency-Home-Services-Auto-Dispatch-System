import React, { useState } from "react";
import {
  Wrench,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Camera,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import technicianStore from "../../services/technicianStore";

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

const EXPERIENCE_YEARS = [
  { value: 1, label: "1 – 2 Years (Junior Technician)" },
  { value: 3, label: "3 – 5 Years (Certified Specialist)" },
  { value: 7, label: "6 – 10 Years (Senior Professional)" },
  { value: 12, label: "10+ Years (Master Technician)" },
];

const ID_DOC_TYPES = [
  "Government Photo ID / Voter ID",
  "Aadhaar Card",
  "Driver's License (Commercial/Vehicle)",
  "National Trade Certificate (ITI)",
  "Authorized OEM / Brand Training Certificate",
];

const PRESET_AVATARS = [
  {
    name: "Professional 1",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Professional 2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Professional 3",
    url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Professional 4",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
];

const COMPANY_LOGOS = [
  {
    name: "Corporate Crest",
    url: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Tech Solutions",
    url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Home Service Co",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Elite Maintenance",
    url: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=400&q=80",
  },
];

export default function ProfessionalRegisterForm({ onNavigate }) {
  const [accountType, setAccountType] = useState("individual"); // 'individual' | 'company'
  const [formData, setFormData] = useState({
    // Individual fields
    name: "",
    email: "",
    phone: "",
    location: "Delhi NCR",
    address: "",
    category: "Plumbing",
    skills: "",
    experience_years: 3,
    experience_description: "",
    avatar: PRESET_AVATARS[0].url,
    id_document_type: ID_DOC_TYPES[0],
    id_document_url: "",
    // Company fields
    company_name: "",
    authorized_person: "",
    business_email: "",
    business_phone: "",
    business_address: "",
    service_areas: "Delhi NCR (All Zones)",
    business_registration_number: "",
    company_logo: COMPANY_LOGOS[0].url,
    // Auth credentials
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationResult, setRegistrationResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const isCompany = accountType === "company";

    if (isCompany) {
      if (!formData.company_name.trim()) {
        setErrorMessage("Please enter your Company / Business Name.");
        return;
      }
      if (!formData.authorized_person.trim()) {
        setErrorMessage("Please enter the Owner / Authorized Person Name.");
        return;
      }
      if (
        !formData.business_email.trim() ||
        !formData.business_email.includes("@")
      ) {
        setErrorMessage("Please enter a valid Business Email Address.");
        return;
      }
      if (!formData.business_phone.trim()) {
        setErrorMessage("Please enter your Business Phone Number.");
        return;
      }
      if (!formData.business_address.trim()) {
        setErrorMessage("Please enter your registered Business Address.");
        return;
      }
    } else {
      if (!formData.name.trim()) {
        setErrorMessage("Please enter your Full Legal Name.");
        return;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMessage("Please enter a valid Email Address.");
        return;
      }
      if (!formData.phone.trim()) {
        setErrorMessage("Please enter your Mobile Phone Number.");
        return;
      }
      if (!formData.address.trim()) {
        setErrorMessage("Please enter your Residential / Operating Address.");
        return;
      }
      if (!formData.experience_description.trim()) {
        setErrorMessage("Please describe your work experience and skills.");
        return;
      }
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = isCompany
        ? {
            account_type: "company",
            company_name: formData.company_name.trim(),
            authorized_person: formData.authorized_person.trim(),
            name: formData.company_name.trim(),
            email: formData.business_email.trim(),
            phone: formData.business_phone.trim(),
            address: formData.business_address.trim(),
            location: formData.service_areas,
            service_areas: formData.service_areas,
            category: formData.category,
            skills: formData.skills,
            business_registration_number:
              formData.business_registration_number.trim(),
            avatar: formData.company_logo,
            id_document_type: "GSTIN / Trade License",
            id_document_url: formData.business_registration_number.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }
        : {
            account_type: "individual",
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            location: formData.location,
            address: formData.address.trim(),
            category: formData.category,
            skills: formData.skills,
            experience_years: formData.experience_years,
            experience_description: formData.experience_description.trim(),
            avatar: formData.avatar,
            id_document_type: formData.id_document_type,
            id_document_url: formData.id_document_url.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          };

      const res = await technicianStore.registerTechnician(payload);
      setRegistrationResult(
        res.application || {
          status: "Pending Verification",
          accountType,
          name: isCompany ? formData.company_name : formData.name,
          email: isCompany ? formData.business_email : formData.email,
          category: formData.category,
          location: isCompany ? formData.service_areas : formData.location,
        },
      );
    } catch (err) {
      console.error("Professional registration error:", err);
      setErrorMessage(
        err.response?.data?.error ||
          "Registration submission failed. Please check your information and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE: Clear confirmation panel with "Pending Verification" status
  if (registrationResult) {
    const isCompany =
      registrationResult.accountType === "company" || accountType === "company";

    return (
      <div className="rounded-2xl sm:rounded-3xl border border-emerald-200/80 bg-white p-4 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6 animate-fade-in text-center max-w-2xl mx-auto w-full box-border">
        {/* Animated Badge */}
        <div className="mx-auto flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-700 border-2 border-emerald-200 shadow-md">
          <CheckCircle2 className="h-7 w-7 sm:h-9 sm:w-9 text-emerald-600 animate-pulse" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>Status: Pending Verification</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
            Application Submitted Successfully
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Thank you for registering with Argent Your. Your{" "}
            <strong>
              {isCompany ? "Service Company" : "Professional Technician"}
            </strong>{" "}
            profile is now under review by our onboarding operations team.
          </p>
        </div>

        {/* Application Summary Card */}
        <div className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 text-left text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px]">
              Account Type
            </span>
            <span className="font-black text-emerald-800 uppercase text-xs">
              {isCompany
                ? "🏢 Company / Business"
                : "👤 Individual Professional"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase">
                {isCompany ? "Company Name" : "Applicant Name"}
              </p>
              <p className="font-black text-slate-800 text-sm">
                {registrationResult.name ||
                  (isCompany ? formData.company_name : formData.name)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase">
                Primary Specialty
              </p>
              <p className="font-bold text-emerald-700">
                {registrationResult.category || formData.category}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase">
                Registered Email
              </p>
              <p className="font-medium text-slate-700 break-all">
                {registrationResult.email ||
                  (isCompany ? formData.business_email : formData.email)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase">
                Operating Location / Areas
              </p>
              <p className="font-medium text-slate-700 break-words">
                {registrationResult.location ||
                  (isCompany ? formData.service_areas : formData.location)}
              </p>
            </div>
          </div>
        </div>

        {/* Notice on Verification Policy */}
        <div className="rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 sm:p-4 text-xs text-emerald-950 text-left space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>What happens next?</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            1. Our partner operations team will verify your trade certificates,
            identity documents, and business credentials within{" "}
            <strong>24–48 hours</strong>.
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            2. Once <strong>Approved</strong>, you can sign in via the dedicated
            <strong> Professional Login</strong> with your registered
            credentials.
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            3. After logging in, switch your status to <strong>ONLINE</strong>{" "}
            in the Professional Dashboard to start accepting customer job
            requests.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate("/technician/login")}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Professional Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const isCompany = accountType === "company";

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-8 md:p-10 shadow-sm max-w-3xl mx-auto space-y-5 sm:space-y-6 w-full box-border">
      {/* Form Header */}
      <div className="border-b border-slate-100 pb-4 sm:pb-5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 mb-1">
          <Wrench className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Professional Partner Registration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
          Join Argent Your Service Network
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Register your independent technician profile or professional service
          company. Create a dedicated partner account and receive verified
          doorstep customer dispatches.
        </p>

        {/* Account Type Selector: Individual vs Company */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
            Select Registration Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAccountType("individual");
                setErrorMessage("");
              }}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                accountType === "individual"
                  ? "bg-white text-emerald-900 shadow-sm scale-101 border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>Individual Professional</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType("company");
                setErrorMessage("");
              }}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                accountType === "company"
                  ? "bg-white text-emerald-900 shadow-sm scale-101 border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Service Company / Business</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 text-xs">
        {/* =========================================
            MODE A: INDIVIDUAL PROFESSIONAL
        ========================================= */}
        {!isCompany && (
          <>
            {/* Section 1: Individual Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Personal & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Verma"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh.partner@gmail.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98101 23456"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Service Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="Delhi NCR">Delhi NCR (All Zones)</option>
                      <option value="South Delhi">South Delhi</option>
                      <option value="Noida & Greater Noida">
                        Noida & Greater Noida
                      </option>
                      <option value="Gurugram (Cyber City / Golf Course)">
                        Gurugram (Cyber City / Golf Course)
                      </option>
                      <option value="North Delhi">North Delhi</option>
                      <option value="West Delhi">West Delhi</option>
                      <option value="East Delhi & Ghaziabad">
                        East Delhi & Ghaziabad
                      </option>
                    </select>
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Residential / Operating Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 301, Sector 62, Noida, Uttar Pradesh"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Trade & Experience */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                2. Professional Trade & Skills
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Primary Service Category{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Years of Field Experience{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.experience_years}
                    onChange={(e) =>
                      handleChange("experience_years", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {EXPERIENCE_YEARS.map((exp) => (
                      <option key={exp.value} value={exp.value}>
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Key Skills & Specializations
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pipe Leakage, Concealed Fitting, Water Heater Repair, RO Purifier, Drain Clearing"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Experience Description{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your apprenticeship, previous company/contracting work, equipment/tools carried, and customer service experience..."
                    value={formData.experience_description}
                    onChange={(e) =>
                      handleChange("experience_description", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Profile Photo & Verification Documents */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                3. Profile Photo & Identity Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Select Profile Photo
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-12 h-12 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
                    />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => handleChange("avatar", av.url)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer shrink-0 ${
                            formData.avatar === av.url
                              ? "border-emerald-700 scale-105"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Government ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.id_document_type}
                    onChange={(e) =>
                      handleChange("id_document_type", e.target.value)
                    }
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer box-border"
                  >
                    {ID_DOC_TYPES.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Document ID / Certificate Ref / Upload Link
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. DOC-98402-DL or Aadhaar / Certificate Ref / Document Link"
                      value={formData.id_document_url}
                      onChange={(e) =>
                        handleChange("id_document_url", e.target.value)
                      }
                      className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all box-border"
                    />
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used strictly for partner credential verification and
                    identity background checks.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================
            MODE B: SERVICE COMPANY / BUSINESS
        ========================================= */}
        {isCompany && (
          <>
            {/* Section 1: Business Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Company & Business Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Company / Business Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Home Care Solutions Pvt Ltd"
                      value={formData.company_name}
                      onChange={(e) =>
                        handleChange("company_name", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Owner / Authorized Person Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Singhal (Managing Director)"
                      value={formData.authorized_person}
                      onChange={(e) =>
                        handleChange("authorized_person", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Business Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. operations@apexhomecare.in"
                      value={formData.business_email}
                      onChange={(e) =>
                        handleChange("business_email", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Business Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 11 4590 1200 / +91 98101 55667"
                      value={formData.business_phone}
                      onChange={(e) =>
                        handleChange("business_phone", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Registered Business Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suite 402, Commercial Tower B, Okhla Phase 3, New Delhi"
                    value={formData.business_address}
                    onChange={(e) =>
                      handleChange("business_address", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Services & Areas */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                2. Service Categories & Service Areas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Primary Service Category{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Service Areas Covered{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.service_areas}
                    onChange={(e) =>
                      handleChange("service_areas", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    <option value="Delhi NCR (All Zones)">
                      Delhi NCR (All Zones)
                    </option>
                    <option value="South Delhi & Central Delhi">
                      South Delhi & Central Delhi
                    </option>
                    <option value="Noida, Greater Noida & Expressway">
                      Noida, Greater Noida & Expressway
                    </option>
                    <option value="Gurugram & Manesar">
                      Gurugram & Manesar
                    </option>
                    <option value="East Delhi & Ghaziabad">
                      East Delhi & Ghaziabad
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    GSTIN / Business Registration / Trade License Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 07AAAAA0000A1Z5 or CIN / MSME Registration Number"
                      value={formData.business_registration_number}
                      onChange={(e) =>
                        handleChange(
                          "business_registration_number",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all"
                    />
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Company Logo Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Company Logo
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <img
                      src={formData.company_logo}
                      alt="Company logo preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
                    />
                    <div className="flex items-center gap-2">
                      {COMPANY_LOGOS.map((logo, idx) => (
                        <button
                          key={logo.name}
                          type="button"
                          onClick={() => handleChange("company_logo", logo.url)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer shrink-0 ${
                            formData.company_logo === logo.url
                              ? "border-emerald-700 scale-105"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={logo.url}
                            alt={`Logo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION 4: Dedicated Security Credentials (Password) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {isCompany
              ? "3. Security Credentials (Professional Company Login)"
              : "4. Security Credentials (Separate Technician Login)"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Account Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all box-border"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Repeat account password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:bg-white outline-none transition-all box-border"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>
                  Submit {isCompany ? "Company" : "Professional"} Registration
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            By submitting, you agree to Argent Your's Partner Terms of Service &
            Quality Code.
          </p>
        </div>
      </form>
    </div>
  );
}
