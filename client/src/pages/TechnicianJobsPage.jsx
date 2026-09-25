import React, { useState } from "react";
import {
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Navigation,
  Check,
  ChevronRight,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianJobsPage() {
  const {
    activeJobs,
    newRequests,
    upcomingJobs,
    completedJobs,
    actionLoadingId,
    handleAcceptJob,
    setDeclineConfirmJob,
    handleStartTrip,
    handleArriveDoorstep,
    handleStartService,
    setCompleteConfirmJob,
    openJobDetails,
    handleOpenMap,
  } = useTechnician();

  const [activeSubTab, setActiveSubTab] = useState("active");

  const subTabs = [
    { id: "active", label: "Active Jobs", count: activeJobs.length, icon: Wrench },
    { id: "requests", label: "New Requests", count: newRequests.length, icon: Clock },
    { id: "upcoming", label: "Upcoming", count: upcomingJobs.length, icon: Calendar },
    { id: "completed", label: "Completed", count: completedJobs.length, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Subtab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Job Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming requests, active dispatches, and work history
          </p>
        </div>

        {/* Subtabs Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {Boolean(tab.count) && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          1. ACTIVE JOBS TAB
         ======================================================== */}
      {activeSubTab === "active" && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Active Jobs Right Now
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you accept an emergency dispatch, it will appear here with live tracking, navigation, and service milestone actions.
              </p>
              {newRequests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab("requests")}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all"
                >
                  <span>Review {newRequests.length} Pending Requests</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeJobs.map((job) => {
                const isActionLoading = actionLoadingId === job.id;
                const status = job.status || "ACCEPTED";
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-md space-y-4 hover:border-emerald-600 transition-all"
                  >
                    {/* Header: Service Name + Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active Dispatch #{job.id}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {job.category || "Emergency Service"}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-1">
                          {job.service_name || job.title || "Emergency Repair Service"}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-700 text-white shadow-xs">
                          {status === "ON_THE_WAY"
                            ? "In-Transit"
                            : status === "ARRIVED"
                              ? "At Doorstep"
                              : status === "IN_PROGRESS"
                                ? "Service Ongoing"
                                : "Dispatch Accepted"}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-2 text-slate-500">
                          <User className="w-4 h-4 text-emerald-700" />
                          <span className="font-bold text-slate-800">
                            {job.customer_name || "Verified Customer"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-4 h-4 text-emerald-700" />
                          <a
                            href={`tel:${job.customer_phone || "+919810111223"}`}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            {job.customer_phone || "+91 98101 11223"}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-start gap-2 text-slate-500">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800 leading-snug">
                              {job.address || "South Extension II, New Delhi"}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Est. Arrival: 8-12 mins
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Description */}
                    {job.problem_description && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-0.5">
                        <span className="font-bold text-[10px] uppercase text-amber-800">
                          Reported Emergency:
                        </span>
                        <p className="leading-relaxed font-medium">
                          {job.problem_description}
                        </p>
                      </div>
                    )}

                    {/* Sequential Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      {/* 1. Map Navigation */}
                      <button
                        type="button"
                        onClick={() => handleOpenMap(job)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open In-App Map</span>
                      </button>

                      {/* 2. Step 1: Start Trip */}
                      {status === "ACCEPTED" && (
                        <button
                          type="button"
                          onClick={() => handleStartTrip(job.id)}
                          disabled={isActionLoading}
                          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{isActionLoading ? "Starting..." : "Start Trip"}</span>
                        </button>
                      )}

                      {/* 3. Step 2: Arrived at Doorstep */}
                      {status === "ON_THE_WAY" && (
                        <button
                          type="button"
                          onClick={() => handleArriveDoorstep(job.id)}
                          disabled={isActionLoading}
                          className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{isActionLoading ? "Confirming..." : "Mark Arrived at Doorstep"}</span>
                        </button>
                      )}

                      {/* 4. Step 3: Start Service */}
                      {status === "ARRIVED" && (
                        <button
                          type="button"
                          onClick={() => handleStartService(job.id)}
                          disabled={isActionLoading}
                          className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{isActionLoading ? "Starting..." : "Start Service"}</span>
                        </button>
                      )}

                      {/* 5. Step 4: Mark Complete */}
                      {status === "IN_PROGRESS" && (
                        <button
                          type="button"
                          onClick={() => setCompleteConfirmJob(job)}
                          disabled={isActionLoading}
                          className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Complete</span>
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => openJobDetails(job)}
                        className="py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          2. NEW REQUESTS TAB
         ======================================================== */}
      {activeSubTab === "requests" && (
        <div className="space-y-4">
          {newRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No New Requests Pending
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Keep your status Online. New customer dispatches within your operational radius will automatically trigger high-priority alerts here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {newRequests.map((req) => {
                const isActionLoading = actionLoadingId === req.id;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-4 hover:border-amber-400 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            Immediate Emergency Request #{req.id}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {req.category || "Home Service"}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-1">
                          {req.service_name || req.title || "Emergency Callout"}
                        </h3>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-800">
                          ₹{req.estimated_cost || req.price || "499"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          Estimated Payout
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-amber-600" />
                          <span className="font-bold">{req.customer_name || "Verified Customer"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{req.customer_phone || "+91 98101 11223"}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div className="flex items-start gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="font-bold leading-snug">{req.address || "Delhi NCR"}</span>
                        </div>
                      </div>
                    </div>

                    {req.problem_description && (
                      <p className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                        <strong className="text-amber-900 font-bold">Issue Description: </strong>
                        {req.problem_description}
                      </p>
                    )}

                    {/* Action Buttons: Accept, Decline, View Details */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openJobDetails(req)}
                        className="py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeclineConfirmJob(req)}
                        disabled={isActionLoading}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptJob(req.id)}
                        disabled={isActionLoading}
                        className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isActionLoading ? "Accepting..." : "Accept Job"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. UPCOMING JOBS TAB
         ======================================================== */}
      {activeSubTab === "upcoming" && (
        <div className="space-y-4">
          {upcomingJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Scheduled Upcoming Jobs
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pre-booked non-emergency customer appointments will appear in this schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {job.scheduled_date || "Today, 03:00 PM"}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {job.service_name || job.category}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => openJobDetails(job)}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{job.address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. COMPLETED JOBS / HISTORY TAB
         ======================================================== */}
      {activeSubTab === "completed" && (
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Completed Jobs Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Completed service orders and verified customer feedback will be archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          Order #{job.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {job.completed_at || job.updated_at || "Recent"}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {job.service_name || job.category}
                      </h4>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-base font-black text-emerald-800">
                        ₹{job.final_amount || job.price || "499"}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Payment Recorded
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.address}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openJobDetails(job)}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
