import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Wrench,
  DollarSign,
  AlertCircle,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTechnician } from "../context/TechnicianContext";

export default function TechnicianNotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useTechnician();

  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "jobs") {
      const type = (notif.type || "").toLowerCase();
      return type.includes("job") || type.includes("dispatch") || type.includes("request");
    }
    if (filter === "earnings") {
      const type = (notif.type || "").toLowerCase();
      return type.includes("pay") || type.includes("earn") || type.includes("money");
    }
    return true;
  });

  const getNotificationIcon = (notif) => {
    const type = (notif.type || "").toLowerCase();
    const title = (notif.title || "").toLowerCase();

    if (type.includes("pay") || type.includes("earn") || title.includes("payout") || title.includes("payment")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
          <DollarSign className="w-5 h-5" />
        </div>
      );
    }
    if (type.includes("job") || type.includes("dispatch") || title.includes("request") || title.includes("service")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
          <Wrench className="w-5 h-5" />
        </div>
      );
    }
    if (type.includes("urgent") || type.includes("alert") || title.includes("emergency")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
          <AlertCircle className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
        <Info className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadNotificationsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {unreadNotificationsCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency dispatch updates, booking alerts, and account notices
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Activity" },
          { id: "unread", label: "Unread" },
          { id: "jobs", label: "Dispatches & Jobs" },
          { id: "earnings", label: "Payouts & Earnings" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              No notifications here
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {filter === "unread"
                ? "You are all caught up! No unread notices right now."
                : "When you receive new job dispatches, customer arrivals, or payment notices, they will appear here in real-time."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  isUnread
                    ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                    : "hover:bg-slate-50/60"
                }`}
              >
                {getNotificationIcon(notif)}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-sm tracking-tight ${
                        isUnread ? "font-black text-slate-950" : "font-bold text-slate-800"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.time || "Recently"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message || notif.body || notif.desc}
                  </p>

                  {notif.job_id && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Dispatch #{String(notif.job_id).slice(-4)}
                      </span>
                    </div>
                  )}
                </div>

                {isUnread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Info Tip */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Pro Tip:</strong> Keep your mobile sound active to instantly receive emergency dispatch notifications even when your screen is locked.
        </p>
      </div>
    </div>
  );
}
