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
  Wifi,
  WifiOff,
  LogOut,
} from "lucide-react";
import { useTechnician, TechnicianProvider } from "../context/TechnicianContext";
import TechnicianJobDetailsModal from "../components/common/TechnicianJobDetailsModal";
import InAppMapNavigationSheet from "../components/common/InAppMapNavigationSheet";

function ProfessionalLayoutContent() {
  const {
    techProfile,
    techFirstName,
    handleLogoutClick,
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
      id: "dashboard",
      to: "/technician/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive:
        location.pathname === "/technician/dashboard" ||
        location.pathname === "/technician",
    },
    {
      id: "jobs",
      to: "/technician/jobs",
      label: "Jobs",
      icon: Wrench,
      badge: newRequests.length,
      isActive: location.pathname.startsWith("/technician/jobs"),
    },
    {
      id: "earnings",
      to: "/technician/earnings",
      label: "Earnings",
      icon: DollarSign,
      isActive: location.pathname.startsWith("/technician/earnings"),
    },
    {
      id: "notifications",
      to: "/technician/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount,
      isActive: location.pathname.startsWith("/technician/notifications"),
    },
    {
      id: "profile",
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

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              toastMessage.type === "error"
                ? "bg-red-50 text-red-900 border-red-200"
                : toastMessage.type === "info"
                ? "bg-blue-50 text-blue-900 border-blue-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-200"
            }`}
          >
            {toastMessage.type === "error" ? (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : toastMessage.type === "info" ? (
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Shared Professional Top Navbar - Fixed/Sticky, Light Premium Style */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 px-4 md:px-6 py-2.5 flex items-center justify-between border-b border-slate-200/90 shadow-xs">
        {/* Company Name & Brand */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/technician/dashboard"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900">
                  Argent Your
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Field Partner Portal
              </p>
            </div>
          </NavLink>
        </div>

        {/* Global Online / Offline Status Control */}
        <button
          type="button"
          onClick={handleToggleOnline}
          aria-label={isOnline ? "Status: Online" : "Status: Offline"}
          title={
            hasActiveJob && isOnline
              ? "Cannot switch offline while a service order is active"
              : isOnline
              ? "Status: Online (Click to go offline)"
              : "Status: Offline (Click to go online)"
          }
          className={`flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs select-none ${
            isOnline
              ? "bg-emerald-50/90 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              : "bg-slate-100/90 border-slate-300 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {/* Status Beacon & Icon */}
          {isOnline ? (
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 mr-0.5"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-700 relative z-10" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="inline-flex rounded-full h-2 w-2 bg-slate-400 mr-1"></span>
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}

          {/* Explicit Status Label */}
          <span className="text-[10px] sm:text-[11px] font-black tracking-wide uppercase whitespace-nowrap">
            {isOnline ? "ONLINE" : "YOU ARE OFFLINE"}
          </span>

          {/* Switch toggle slider */}
          <div
            className={`w-7 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
              isOnline ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                isOnline ? "translate-x-3" : "translate-x-0"
              }`}
            />
          </div>
        </button>
      </header>

      {/* Main Body: Desktop Sidebar + Single Responsive Content Container */}
      <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-57px)]">
        {/* Left Sidebar on Desktop */}
        <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    id={`sidebar-nav-${item.id}`}
                    data-testid={`sidebar-nav-${item.id}`}
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

          {/* Need Help? Box & Desktop Logout at bottom of sidebar */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
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

            {/* Clearly accessible Desktop Logout option */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-2.5 px-3 rounded-xl border border-red-200/90 bg-red-50/80 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Page Content Area: Single Outlet for selected child route */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Fixed Navigation (HIDDEN on desktop, active on mobile) */}
      <nav
        aria-label="Professional Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 flex items-center justify-around shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              id={`bottom-nav-${item.id}`}
              data-testid={`bottom-nav-${item.id}`}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 sm:px-5 rounded-xl transition-all cursor-pointer relative ${
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
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Complete Service
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm resolution and mark order completed
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure the emergency service for{" "}
              <strong>{completeConfirmJob.customer_name || "Customer"}</strong>{" "}
              is complete? This will generate the final invoice and credit
              earnings to your account.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompleteConfirmJob(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteJob(completeConfirmJob.id)}
                disabled={actionLoadingId === completeConfirmJob.id}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === completeConfirmJob.id ? (
                  <span>Saving...</span>
                ) : (
                  <span>Mark Complete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Job Confirmation Dialog */}
      {declineConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Decline Dispatch Request
                </h3>
                <p className="text-xs text-slate-500">
                  Release job back to emergency partner network
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Decline emergency dispatch for{" "}
              <strong>{declineConfirmJob.service_name || "Service"}</strong>?
              This will reassign the customer to the next closest available
              technician.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeclineConfirmJob(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Keep Job
              </button>
              <button
                type="button"
                onClick={() => handleDeclineJob(declineConfirmJob.id)}
                disabled={actionLoadingId === declineConfirmJob.id}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === declineConfirmJob.id ? (
                  <span>Declining...</span>
                ) : (
                  <span>Decline Job</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Navigation Sheets */}
      {selectedJobForModal && (
        <TechnicianJobDetailsModal
          job={selectedJobForModal}
          isOpen={Boolean(selectedJobForModal)}
          onClose={closeJobDetails}
          onStartTrip={handleStartTrip}
          onArrived={handleArriveDoorstep}
          onStartService={handleStartService}
          onComplete={(job) => setCompleteConfirmJob(job)}
          onDecline={(job) => setDeclineConfirmJob(job)}
        />
      )}

      {navigationJob && (
        <InAppMapNavigationSheet
          job={navigationJob}
          isOpen={Boolean(navigationJob)}
          onClose={closeMap}
          onStartTrip={handleStartTrip}
          onArrivedDoorstep={handleArriveDoorstep}
        />
      )}

      {/* Bank Account Connection Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Bank Account Setup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct IMPS/NEFT daily settlement account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
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
                  placeholder="As registered on bank passbook"
                  value={bankFormData.holder_name}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, holder_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  value={bankFormData.bank_name}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bank_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter complete bank account number"
                  value={bankFormData.account_number}
                  onChange={(e) =>
                    setBankFormData({
                      ...bankFormData,
                      account_number: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={bankFormData.ifsc}
                  onChange={(e) =>
                    setBankFormData({
                      ...bankFormData,
                      ifsc: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 font-mono uppercase"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
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
                  {isSavingBank ? "Verifying..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Withdrawal Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Withdraw Balance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant transfer to your linked bank account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  placeholder="Enter amount to withdraw"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800 text-base font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Minimum withdrawal: ₹100 &bull; Settlement processing: Under 30 minutes
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
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
                  {isSubmittingPayout ? "Processing..." : "Transfer to Bank"}
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Profile Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update public credentials and dispatch info
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
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
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
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
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Service
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
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
                    value={editFormData.experience_years}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        experience_years: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Emergency Response Vehicle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rapid Response Van, Hero Electric Service Bike"
                  value={editFormData.vehicle_type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vehicle_type: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your trade background and certifications..."
                  value={editFormData.bio || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      bio: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service Coverage Areas
                </label>
                <input
                  type="text"
                  placeholder="Delhi NCR, South Delhi, Gurgaon..."
                  value={editFormData.service_areas || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      service_areas: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
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
