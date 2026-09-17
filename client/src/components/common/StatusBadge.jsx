import React from "react";

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Requested",
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  AUTO_DISPATCHED: {
    label: "Auto-Dispatching",
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    dot: "bg-indigo-500 animate-ping",
  },
  ASSIGNED: {
    label: "Assigned",
    bg: "bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    dot: "bg-cyan-500",
  },
  ON_THE_WAY: {
    label: "En Route",
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500 animate-pulse",
  },
  ARRIVED: {
    label: "Arrived On-Site",
    bg: "bg-sky-100",
    text: "text-sky-800",
    dot: "bg-sky-500",
  },
  IN_PROGRESS: {
    label: "Work In Progress",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500 animate-pulse",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-100",
    text: "text-rose-800",
    dot: "bg-rose-500",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-800",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
