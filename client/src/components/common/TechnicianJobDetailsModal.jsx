import React, { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Navigation,
  Wrench,
} from "lucide-react";

export default function TechnicianJobDetailsModal({
  job,
  onClose,
  onAccept,
  onReject,
  onOpenMapNavigation,
  onStartTrip,
  onMarkArrived,
  onStartWork,
  onComplete,
  isAccepting = false,
  isRejecting = false,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (!job) return null;

  const handleConfirmReject = () => {
    onReject(job.id, rejectReason || "Technician unavailable");
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    job.address || "Customer Location",
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              AY
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Service Order #{job.id}
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {job.service_name || job.category || "Doorstep Service"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Priority & Category Banner */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  job.priority === "Critical"
                    ? "bg-red-100 text-red-700"
                    : job.priority === "High"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {job.priority || "High"} Priority
              </span>
              <span className="text-slate-500 font-medium">
                {job.category || "General Service"}
              </span>
            </div>
            <span className="text-sm font-black text-emerald-700">
              {job.total_paid || job.price || "₹499"}
            </span>
          </div>

          {/* Customer & Address Details */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {job.customer_name || "Verified Customer"}
                  </p>
                  {job.customer_phone && (
                    <p className="text-slate-500 font-medium">
                      {job.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${job.customer_phone || "+919810111223"}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-all"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call</span>
                </a>
                <a
                  href={`sms:${job.customer_phone || "+919810111223"}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition-all"
                  title="SMS Customer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>SMS</span>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
              <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Service Address
                </p>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {job.address}
                </p>
                {onOpenMapNavigation ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMapNavigation(job);
                    }}
                    className="inline-flex items-center gap-1.5 mt-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Open In-App Navigation</span>
                  </button>
                ) : (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">
                  {job.scheduled_date || "Today"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">
                  {job.scheduled_time || "Priority Slot"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-600">
                Payment:{" "}
                <strong className="text-slate-800">
                  {job.payment_method || "Online / Prepaid"}
                </strong>
              </span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Customer Notes / Details
              </p>
              <p className="text-slate-700 italic leading-relaxed">
                "{job.description}"
              </p>
            </div>
          )}

          {/* Reject Reason Form if active */}
          {showRejectConfirm && (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>Confirm Decline Reason:</span>
              </div>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-red-200 bg-white p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Select reason...</option>
                <option value="Schedule conflict / Outside working hours">
                  Schedule conflict / Outside working hours
                </option>
                <option value="Too far from current location">
                  Too far from current location
                </option>
                <option value="Specialized parts not available in kit">
                  Specialized parts not available in kit
                </option>
                <option value="Vehicle issue / Emergency maintenance">
                  Vehicle issue / Emergency maintenance
                </option>
                <option value="Other">Other reason</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isRejecting}
                  className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  {isRejecting ? "Declining..." : "Confirm Decline"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectConfirm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        {!showRejectConfirm && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            {["REQUESTED", "ASSIGNED"].includes(job.status) && (
              <>
                <button
                  type="button"
                  onClick={() => onAccept(job.id)}
                  disabled={isAccepting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isAccepting ? "Accepting Job..." : "Accept Job"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectConfirm(true)}
                  className="rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Reject Job
                </button>
              </>
            )}

            {job.status === "ACCEPTED" && onStartTrip && (
              <button
                type="button"
                onClick={() => onStartTrip(job.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 text-sm transition-all shadow-md cursor-pointer"
              >
                <Navigation className="h-4 w-4" />
                <span>Start Trip (On The Way)</span>
              </button>
            )}

            {job.status === "ON_THE_WAY" && (
              <div className="flex-1 flex gap-2">
                {onOpenMapNavigation && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMapNavigation(job);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs transition-all cursor-pointer"
                  >
                    <Navigation className="h-4 w-4 text-emerald-400" />
                    <span>Open Navigation</span>
                  </button>
                )}
                {onMarkArrived && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onMarkArrived(job.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 text-xs transition-all cursor-pointer"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Mark Arrived</span>
                  </button>
                )}
              </div>
            )}

            {job.status === "ARRIVED" && onStartWork && (
              <button
                type="button"
                onClick={() => onStartWork(job.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm transition-all shadow-md cursor-pointer"
              >
                <Wrench className="h-4 w-4" />
                <span>Start Work</span>
              </button>
            )}

            {job.status === "IN_PROGRESS" && onComplete && (
              <button
                type="button"
                onClick={() => onComplete(job)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 text-sm transition-all shadow-md cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark Complete</span>
              </button>
            )}

            {job.status === "COMPLETED" && (
              <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Service Completed &amp; Closed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
