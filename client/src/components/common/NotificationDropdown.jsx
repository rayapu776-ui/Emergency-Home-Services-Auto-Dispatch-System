import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Wrench,
  X,
} from "lucide-react";

const initialNotifications = [
  {
    id: "1",
    title: "Booking confirmed: AC foam-jet service",
    description:
      "Your service booking #AY-9402 is confirmed for today at 3:00 PM.",
    time: "Just now",
    type: "booking",
    unread: true,
  },
  {
    id: "2",
    title: "Service provider assigned: Rajesh Kumar is on the way",
    description:
      "Rajesh Kumar (Plumbing & HVAC Expert) will arrive in approx. 18 mins.",
    time: "15m ago",
    type: "dispatch",
    unread: true,
  },
  {
    id: "3",
    title: "Service completed: Electrician visit",
    description:
      "Job #AY-9180 was completed. Tap here to rate your professional.",
    time: "Yesterday",
    type: "completed",
    unread: true,
  },
  {
    id: "4",
    title: "Exclusive offer: 20% off on Salon for Women",
    description:
      "Use coupon code GLOW20 at checkout on any women's salon or spa service.",
    time: "2 days ago",
    type: "offer",
    unread: false,
  },
  {
    id: "5",
    title: "Reminder: Upcoming Water Purifier Service tomorrow at 10:00 AM",
    description:
      "Scheduled filter inspection and cleaning by Argent Your vetted technician.",
    time: "3 days ago",
    type: "reminder",
    unread: false,
  },
];

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOneAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "dispatch":
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "offer":
        return <Tag className="h-4 w-4 text-rose-500" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div
      className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-xl animate-rise-in text-slate-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          {notifications.some((n) => n.unread) && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              {notifications.filter((n) => n.unread).length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close notifications"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1 pr-1">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markOneAsRead(item.id)}
            className={`cursor-pointer rounded-xl p-2.5 transition-colors hover:bg-slate-50 ${
              item.unread ? "bg-emerald-50/40" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 shadow-xs">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </p>
                  {item.unread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                  {item.description}
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-medium text-slate-400">
                  {item.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2 text-center">
        <p className="text-[10px] font-semibold text-slate-400">
          Emergency dispatch alerts are delivered in real-time
        </p>
      </div>
    </div>
  );
}
