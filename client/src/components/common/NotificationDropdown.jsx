import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import userStore from "../../services/userStore";

export default function NotificationDropdown({ onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() =>
    userStore.getNotifications(user?.id),
  );

  useEffect(() => {
    setNotifications(userStore.getNotifications(user?.id));
    if (user?.id) {
      userStore.fetchNotificationsFromApi(user.id).then((apiNotifs) => {
        if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          setNotifications(apiNotifs);
        }
      });
    }
  }, [user?.id]);

  const markAllAsRead = async () => {
    const updated = await userStore.markAllNotificationsRead(user?.id);
    if (updated) {
      setNotifications(updated);
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  };

  const markOneAsRead = async (id) => {
    const updated = await userStore.markNotificationRead(user?.id, id);
    if (updated) {
      setNotifications(updated);
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    }
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
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1 pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No notifications yet</p>
            <p className="text-[10px] mt-0.5">
              Booking updates and alerts will appear here
            </p>
          </div>
        ) : (
          notifications.map((item) => (
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
          ))
        )}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2 text-center">
        <p className="text-[10px] font-semibold text-slate-400">
          Emergency dispatch alerts are delivered in real-time
        </p>
      </div>
    </div>
  );
}
