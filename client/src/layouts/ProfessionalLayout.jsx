import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  DollarSign,
  Bell,
  User,
  HelpCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Pencil,
  ArrowDownToLine,
} from "lucide-react";
import { useTechnician, TechnicianProvider } from "../context/TechnicianContext";
import TechnicianJobDetailsModal from "../components/common/TechnicianJobDetailsModal";
import InAppMapNavigationSheet from "../components/common/InAppMapNavigationSheet";

function ProfessionalLayoutContent() {
  const {
    isOnline,
    hasActiveJob,
    handleToggleOnline,
    newRequests,
    unreadNotificationsCount,
    toastMessage,
    // Modals
    selectedJobForModal,
    closeJobDetails,
    navigationJob,
    closeMap,
    completeConfirmJob,
    setCompleteConfirmJob,
    handleCompleteJob,
    declineConfirmJob,
    setDeclineConfirmJob,
    handleDeclineJob,
    showBankModal,
    setShowBankModal,
    bankFormData,
    setBankFormData,
    isSavingBank,
    handleSaveBankAccount,
    showPayoutModal,
    setShowPayoutModal,
    payoutAmount,
    setPayoutAmount,
    isSubmittingPayout,
    handleRequestPayout,
    showEditProfile,
    setShowEditProfile,
    editFormData,
    setEditFormData,
    isSavingProfile,
    handleSaveProfile,
    actionLoadingId,
    fileInputRef,
    cameraInputRef,
    handlePhotoFileChange,
    handleStartTrip,
    handleArriveDoorstep,
    handleStartService,
  } = useTechnician();

  const location = useLocation();

  const navItems = [
    {
      to: "/technician/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: location.pathname === "/technician/dashboard" || location.pathname === "/technician",
    },
    {
      to: "/technician/jobs",
      label: "Jobs",
      icon: Wrench,
      badge: newRequests.length,
      isActive: location.pathname.startsWith("/technician/jobs"),
    },
    {
      to: "/technician/earnings",
      label: "Earnings",
      icon: DollarSign,
      isActive: location.pathname.startsWith("/technician/earnings"),
    },
    {
      to: "/technician/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount,
      isActive: location.pathname.startsWith("/technician/notifications"),
    },
    {
      to: "/technician/profile",
      label: "Profile",
      icon: User,
      isActive: location.pathname.startsWith("/technician/profile"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-900 font-sans technician-dashboard selection:bg-emerald-200 flex flex-col">
      {/* Hidden file & camera inputs for Profile photo capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handlePhotoFileChange}
      />

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

      {/* Top Navbar: Argent Your logo + name on Left, Online/Offline status switch on Right */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs">
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

        {/* Online/Offline status switch */}
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

      {/* Main Body: Desktop Sidebar + Single Responsive Content Container */}
      <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-57px)]">
        {/* Left Sidebar on Desktop (hidden on mobile) */}
        <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={
                      "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer " +
                      (item.isActive
                        ? "bg-emerald-800 text-white shadow-sm shadow-emerald-800/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {Boolean(item.badge) && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
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

        {/* Page Content Area: Single Outlet for selected child route */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Fixed Navigation (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
                item.isActive
                  ? "text-emerald-700 font-black"
                  : "text-slate-400 hover:text-slate-600 font-semibold"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    item.isActive ? "text-emerald-700" : "text-slate-400"
                  }`}
                />
                {Boolean(item.badge) && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Complete Job Confirmation Dialog */}
      {completeConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
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
                type="button"
                onClick={() => setCompleteConfirmJob(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteJob(completeConfirmJob.id)}
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
                onClick={() => setDeclineConfirmJob(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeclineJob(declineConfirmJob.id)}
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
          onClose={closeMap}
          onStatusUpdate={async (jobId, newStatus) => {
            if (newStatus === "ARRIVED") {
              await handleArriveDoorstep(jobId);
            } else if (newStatus === "ON_THE_WAY") {
              await handleStartTrip(jobId);
            } else if (newStatus === "IN_PROGRESS") {
              await handleStartService(jobId);
            } else if (newStatus === "COMPLETED") {
              await handleCompleteJob(jobId);
            }
          }}
        />
      )}

      {/* Job Details Modal */}
      {selectedJobForModal && (
        <TechnicianJobDetailsModal
          job={selectedJobForModal}
          onClose={closeJobDetails}
          onStartTrip={async (jobId) => {
            await handleStartTrip(jobId);
            closeJobDetails();
          }}
          onArrive={async (jobId) => {
            await handleArriveDoorstep(jobId);
            closeJobDetails();
          }}
          onStartService={async (jobId) => {
            await handleStartService(jobId);
            closeJobDetails();
          }}
          onComplete={async (job) => {
            closeJobDetails();
            setCompleteConfirmJob(job);
          }}
          actionLoadingId={actionLoadingId}
        />
      )}

      {/* Bank Account Setup Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">
                  Setup Direct Bank Transfer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.holder_name}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, holder_name: e.target.value })
                  }
                  placeholder="As per bank records"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.bank_name}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bank_name: e.target.value })
                  }
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="password"
                  required
                  value={bankFormData.account_number}
                  onChange={(e) =>
                    setBankFormData({
                      ...bankFormData,
                      account_number: e.target.value,
                    })
                  }
                  placeholder="•••• •••• ••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.ifsc}
                  onChange={(e) =>
                    setBankFormData({
                      ...bankFormData,
                      ifsc: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden uppercase font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  {isSavingBank ? "Verifying..." : "Save & Verify Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">
                  Withdraw Balance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden font-bold text-base"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  {isSubmittingPayout ? "Processing..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">
                  Edit Professional Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Specialist Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editFormData.experience_years}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        experience_years: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Skills & Specialized Trade Competencies
                </label>
                <textarea
                  rows="2"
                  value={editFormData.skills}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, skills: e.target.value })
                  }
                  placeholder="e.g. Pipe burst repair, water heater diagnostics"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  value={editFormData.vehicle_type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vehicle_type: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-colors"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfessionalLayout({ onLogout }) {
  return (
    <TechnicianProvider onLogout={onLogout}>
      <ProfessionalLayoutContent />
    </TechnicianProvider>
  );
}
