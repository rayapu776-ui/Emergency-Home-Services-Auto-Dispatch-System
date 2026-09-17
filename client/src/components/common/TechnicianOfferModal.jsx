import React from "react";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import CountdownTimer from "./CountdownTimer";

export default function TechnicianOfferModal({ onJobAccepted }) {
  const { pendingOffer, clearPendingOffer, socket } = useSocket();
  const { user } = useAuth();

  if (!pendingOffer || user?.role !== "technician") return null;

  const techId = user?.technician?.id;

  const handleAccept = () => {
    if (socket && techId) {
      socket.emit("technician_accept_offer", {
        requestId: pendingOffer.requestId,
        techId,
      });
      if (onJobAccepted) onJobAccepted(pendingOffer.requestId);
    }
    clearPendingOffer();
  };

  const handleDecline = () => {
    if (socket && techId) {
      socket.emit("technician_decline_offer", {
        requestId: pendingOffer.requestId,
        techId,
        reason: "Manually declined by technician",
      });
    }
    clearPendingOffer();
  };

  const handleExpire = () => {
    // When timer naturally expires
    if (socket && techId) {
      socket.emit("technician_decline_offer", {
        requestId: pendingOffer.requestId,
        techId,
        reason: "Offer acceptance timer expired",
      });
    }
    clearPendingOffer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Glowing Top Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider">
                Emergency Dispatch Offer
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Auto-assigned by Priority Dispatch Engine
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              pendingOffer.priority === "Critical"
                ? "bg-white text-red-700 animate-bounce"
                : "bg-red-900/50 text-white"
            }`}
          >
            {pendingOffer.priority || "High"} Priority
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Circular Countdown */}
          <div className="flex justify-center py-2">
            <CountdownTimer
              initialSeconds={pendingOffer.expiresInSeconds || 45}
              onExpire={handleExpire}
            />
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400">
                  Distance
                </p>
                <p className="text-base font-bold text-slate-800">
                  {pendingOffer.distanceKm || "1.2"} km
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400">
                  Estimated Travel
                </p>
                <p className="text-base font-bold text-slate-800">
                  ~{pendingOffer.etaMinutes || "12"} mins
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Emergency Location
                </p>
                <p className="font-bold text-slate-800">
                  {pendingOffer.address}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Issue Description (
                {pendingOffer.category})
              </p>
              <p className="text-slate-700 text-sm italic">
                "{pendingOffer.description}"
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDecline}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-sm"
            >
              <XCircle className="w-5 h-5 text-slate-500" />
              Decline Job
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all text-sm animate-pulse"
            >
              <CheckCircle2 className="w-5 h-5" />
              Accept Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
