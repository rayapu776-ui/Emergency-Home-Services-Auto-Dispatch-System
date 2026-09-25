import React from "react";
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
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianProfilePage() {
  const {
    techProfile,
    metrics,
    bankAccount,
    fileInputRef,
    cameraInputRef,
    handleOpenEditProfile,
    handleOpenBankModal,
    handleLogoutClick,
    handleToggleServiceArea,
    isSavingAreas,
  } = useTechnician();

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
    .map((s) => s.trim());

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Professional Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your public credentials, service coverage, bank accounts, and preferences
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenEditProfile}
          className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Camera/Upload actions */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-emerald-600/30 bg-emerald-50 shadow-md flex items-center justify-center">
              {techProfile?.avatar ? (
                <img
                  src={techProfile.avatar}
                  alt={techProfile?.name || "Technician"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-emerald-800" />
              )}
            </div>

            {/* Quick action buttons for camera and gallery */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-white p-1 rounded-2xl shadow-md border border-slate-200">
              <button
                type="button"
                title="Take photo with camera"
                onClick={() => cameraInputRef.current?.click()}
                className="w-7 h-7 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Choose from photo library"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Profile Name & Badges */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {techProfile?.name || "Certified Technician"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Pro
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {techProfile?.category || "Emergency Home Services"} Specialist &bull;{" "}
              {techProfile?.experience_years || 3}+ Years Industry Experience
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{techProfile?.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{techProfile?.email || "technician@urgenthelp.in"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>{techProfile?.vehicle_type || "Rapid Response Van"}</span>
              </div>
            </div>
          </div>

          {/* Rating & Completed Stats pill */}
          <div className="flex sm:flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
            <div className="flex items-center gap-1 text-amber-500 font-black text-base">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{metrics?.rating ? Number(metrics.rating).toFixed(1) : "4.9"}</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900">
                {metrics?.completedCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Jobs Done
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage Areas Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Operational Dispatch Zones
              </h3>
            </div>
            {isSavingAreas && (
              <span className="text-[11px] text-emerald-700 font-bold animate-pulse">
                Saving zones...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Toggle neighborhoods where you are actively ready to receive instant high-priority emergency requests.
          </p>

          <div className="space-y-2 pt-1">
            {allAreas.map((area) => {
              const isCovered = currentAreas.some(
                (a) => a.toLowerCase() === area.toLowerCase() || area.toLowerCase().includes(a.toLowerCase())
              );
              return (
                <div
                  key={area}
                  onClick={() => handleToggleServiceArea(area)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCovered
                      ? "bg-emerald-50/60 border-emerald-200/90 text-emerald-950"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100/60"
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
                    {isCovered && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank & Settlement Account */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Settlement Bank Account
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenBankModal}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {bankAccount?.isConnected ? "Edit" : "Connect"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Payouts are wired automatically to this verified bank account.
            </p>

            {bankAccount?.isConnected ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {bankAccount.bankName || "Verified Bank"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Account: {bankAccount.accountNumberMasked || "•••• •••• 9821"}
                </p>
                <p className="text-[11px] text-slate-400">
                  IFSC: {bankAccount.ifsc || "HDFC0001234"} &bull; {bankAccount.holderName || techProfile?.name}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  No bank account linked yet. Link your account to receive your daily dispatch earnings.
                </p>
                <button
                  type="button"
                  onClick={handleOpenBankModal}
                  className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Link Bank Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Account Security & Sign Out */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Account Security & Session
            </h3>
            <p className="text-xs text-slate-500">
              Signed in as certified field partner on Argent Dispatch Portal.
            </p>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-3 px-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Technician Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
