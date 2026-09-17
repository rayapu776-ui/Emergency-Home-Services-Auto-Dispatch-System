import React, { useEffect, useState } from "react";

export default function CountdownTimer({ initialSeconds = 45, onExpire }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const percentage = Math.max(0, (seconds / initialSeconds) * 100);
  const isUrgent = seconds <= 15;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-200"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={175.9}
            strokeDashoffset={175.9 - (175.9 * percentage) / 100}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              isUrgent ? "text-red-600 animate-pulse" : "text-amber-500"
            }`}
            fill="transparent"
          />
        </svg>
        <span
          className={`absolute text-lg font-extrabold ${
            isUrgent ? "text-red-600" : "text-slate-800"
          }`}
        >
          {seconds}s
        </span>
      </div>
      <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
        Auto-reassigning in
      </span>
    </div>
  );
}
