import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Wrench,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  FileText,
  ChevronRight,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  Power,
  User,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const {
    techProfile,
    techFirstName,
    isOnline,
    handleToggleOnline,
    activeJobs,
    newRequests,
    completedJobs,
    metrics,
    bankAccount,
    handleOpenEditProfile,
  } = useTechnician();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================
          DESKTOP OVERVIEW (hidden md:block)
         ======================================================== */}
      <div className="hidden md:block space-y-6">
        {/* Header Greeting & Availability Quick Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Good Day, {techFirstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Here’s your operations overview. Ready to assist emergency requests!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isOnline
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${isOnline ? "text-emerald-700" : "text-slate-400"}`} />
              <span>{isOnline ? "Online for Dispatches" : "Offline"}</span>
            </button>

            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Hub
                </p>
                <p className="text-xs font-black text-slate-800">
                  {techProfile?.service_areas?.split(",")?.[0] || "Delhi NCR"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Statistics Cards in One Horizontal Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. New Job Requests */}
          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#fffbeb] p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800/80">
                New Requests
              </p>
              <p className="text-3xl font-black text-amber-950 mt-1.5 group-hover:text-amber-700 transition-colors">
                {newRequests.length}
              </p>
              <p className="text-[11px] text-amber-700/80 font-medium mt-1">
                Awaiting review
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
          </div>

          {/* 2. Active Jobs */}
          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#f0f9ff] p-5 rounded-3xl border border-sky-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-800/80">
                Active Jobs
              </p>
              <p className="text-3xl font-black text-sky-950 mt-1.5 group-hover:text-sky-700 transition-colors">
                {activeJobs.length}
              </p>
              <p className="text-[11px] text-sky-700/80 font-medium mt-1">
                Dispatches ongoing
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-xs">
              <Wrench className="w-6 h-6 text-sky-700" />
            </div>
          </div>

          {/* 3. Completed Jobs */}
          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#f0fdf4] p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                Completed Jobs
              </p>
              <p className="text-3xl font-black text-emerald-950 mt-1.5 group-hover:text-emerald-700 transition-colors">
                {metrics.completedCount || metrics.totalJobs || completedJobs.length}
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
          <div
            onClick={() => navigate("/technician/earnings")}
            className="bg-[#f0fdfa] p-5 rounded-3xl border border-teal-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800/80">
                Total Earnings
              </p>
              <p className="text-3xl font-black text-teal-950 mt-1.5 group-hover:text-teal-700 transition-colors">
                {metrics.earningsFormatted || "₹" + (metrics.totalEarnings || 0).toLocaleString()}
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

        {/* 2-Column Section: Banner & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Promotional Banner & Tasks */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-7 shadow-sm flex items-center justify-between">
              <div className="relative z-10 max-w-md">
                <h2 className="text-2xl font-black tracking-tight leading-snug">
                  More Jobs. More Income.
                  <br />A Brighter Tomorrow.
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 font-medium leading-relaxed">
                  Deliver quality emergency services, build your local reputation, and grow your career with Argent Your.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/technician/jobs")}
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
                  onClick={() => navigate("/technician/profile")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Profile Tasks</span>
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
                        Upload ID Proof & Trade Certificate
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Submit verified government ID or trade license for full verification
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
                      {techProfile?.id_document_url ? "Completed" : "Pending Action"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </div>

                {/* Task 2: Payout & Bank Account */}
                <div
                  onClick={() => navigate("/technician/earnings")}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                        Setup Bank Account for Daily Payouts
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {bankAccount?.isConnected ? `Connected: ${bankAccount.bankName}` : "Direct IMPS bank transfer for completed jobs"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-[10px] font-bold " +
                        (bankAccount?.isConnected
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800")
                      }
                    >
                      {bankAccount?.isConnected ? "Connected" : "Action Needed"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </div>

                {/* Task 3: Operating Service Areas */}
                <div
                  onClick={() => navigate("/technician/profile")}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                        Operating Service Locations
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Active: {techProfile?.service_areas || "Delhi NCR (All Zones)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Profile Completion & Support */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs text-center space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Profile Status
                </h3>
                <span
                  className={
                    "text-[10px] font-bold px-2 py-0.5 rounded-full " +
                    (techProfile?.status === "Approved"
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : techProfile?.status === "Rejected"
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : "text-amber-800 bg-amber-50 border border-amber-200")
                  }
                >
                  {techProfile?.status === "Approved"
                    ? "Verified ✓"
                    : techProfile?.status || "Pending Verification"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xs bg-emerald-50 flex items-center justify-center">
                  {techProfile?.avatar ? (
                    <img
                      src={techProfile.avatar}
                      alt={techProfile.name || "Technician"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-emerald-800" />
                  )}
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  {techProfile?.name || "Professional Partner"}
                </h4>
                <p className="text-xs text-emerald-700 font-bold">
                  {techProfile?.category || "General"}
                  {techProfile?.id ? ` • ID #${String(techProfile.id).slice(0, 8)}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/technician/profile")}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Need Support */}
            <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  24/7 Operations Desk
                </h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Need urgent route assistance, dispatch dispute clearance, or payout help?
              </p>
              <a
                href="tel:+919810111223"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 text-center shadow-xs block"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Support (+91 98101 11223)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE OVERVIEW (md:hidden)
         ======================================================== */}
      <div className="md:hidden space-y-4">
        {/* Mobile Header Greeting */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Welcome back, {techFirstName}
            </p>
          </div>
        </div>

        {/* Mobile Tasks from Admin */}
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

          <div className="space-y-2">
            <div
              onClick={() => navigate("/technician/profile")}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Upload ID Proof</p>
                  <p className="text-[11px] text-slate-500">
                    Trade license or Govt ID
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                {techProfile?.id_document_url ? "Done" : "Pending"}
              </span>
            </div>

            <div
              onClick={() => navigate("/technician/earnings")}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Bank Setup</p>
                  <p className="text-[11px] text-slate-500">
                    {bankAccount?.isConnected ? "Connected" : "Action Needed"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                {bankAccount?.isConnected ? "Active" : "Setup"}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards for Mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#fffbeb] p-3.5 rounded-2xl border border-amber-200/80 shadow-xs cursor-pointer"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80">
              New Requests
            </p>
            <p className="text-2xl font-black text-amber-950 mt-1">
              {newRequests.length}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">Click to view</p>
          </div>

          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#f0f9ff] p-3.5 rounded-2xl border border-sky-200/80 shadow-xs cursor-pointer"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800/80">
              Active Jobs
            </p>
            <p className="text-2xl font-black text-sky-950 mt-1">
              {activeJobs.length}
            </p>
            <p className="text-[10px] text-sky-700 mt-0.5">In progress</p>
          </div>

          <div
            onClick={() => navigate("/technician/jobs")}
            className="bg-[#f0fdf4] p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs cursor-pointer"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">
              Completed
            </p>
            <p className="text-2xl font-black text-emerald-950 mt-1">
              {metrics.completedCount || metrics.totalJobs || completedJobs.length}
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Verified</p>
          </div>

          <div
            onClick={() => navigate("/technician/earnings")}
            className="bg-[#f0fdfa] p-3.5 rounded-2xl border border-teal-200/80 shadow-xs cursor-pointer"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800/80">
              Total Earnings
            </p>
            <p className="text-xl font-black text-teal-950 mt-1 truncate">
              {metrics.earningsFormatted || "₹" + (metrics.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-teal-700 mt-0.5">Revenue</p>
          </div>
        </div>

        {/* Mobile Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 text-white space-y-2">
          <p className="text-sm font-black leading-snug">
            Ready to receive dispatches? Keep status Online!
          </p>
          <button
            type="button"
            onClick={() => navigate("/technician/jobs")}
            className="w-full py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <span>View Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
