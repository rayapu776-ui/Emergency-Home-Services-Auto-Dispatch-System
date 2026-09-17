import React, { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Radio,
  Search,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

export default function Navbar({
  activePage,
  setActivePage,
  selectedCity,
  setSelectedCity,
}) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const cities = [
    "Delhi NCR",
    "Gurugram",
    "Noida",
    "South Delhi",
    "Central Delhi",
  ];
  const links =
    user?.role === "customer"
      ? [
          ["customer-request", "Request Emergency"],
          ["live-tracking", "Live Track"],
          ["history", "Bookings"],
        ]
      : user?.role === "technician"
        ? [
            ["technician-dashboard", "Partner Console"],
            ["history", "Jobs Done"],
          ]
        : [
            ["admin-dashboard", "Control Room"],
            ["admin-workforce", "Partners"],
            ["analytics", "Analytics"],
            ["history", "Audit Logs"],
          ];
  const goHome = () => setActivePage("argent-home");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={goHome}
              className="flex items-center gap-2.5 cursor-pointer text-left"
            >
              <img
                src="/argent-logo.png"
                alt="Argent Your"
                className="w-10 h-10 rounded-xl object-contain shadow-sm"
              />
              <span>
                <span className="block font-extrabold text-lg tracking-tight text-slate-900">
                  Argent Your
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  Trusted services, delivered to your doorstep.
                </span>
              </span>
            </button>
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded-xl text-left"
              >
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-slate-900">
                  {selectedCity || "Delhi NCR"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
              {showCityMenu && (
                <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select City Region
                  </p>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity?.(city);
                        setShowCityMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between"
                    >
                      {city}
                      {(selectedCity || "Delhi NCR") === city && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search for a service..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent focus:border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            {links.map(([page, label]) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${activePage === page ? "bg-black text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
              >
                {page === "live-tracking" && (
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                )}
                {page === "technician-dashboard" && (
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {page === "admin-dashboard" && (
                  <LayoutDashboard className="w-3.5 h-3.5" />
                )}
                {page === "admin-workforce" && (
                  <Users className="w-3.5 h-3.5" />
                )}
                {page === "analytics" && <BarChart3 className="w-3.5 h-3.5" />}
                {page === "history" && <History className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 text-slate-700 hover:bg-slate-100"
              >
                <User className="w-3.5 h-3.5" /> {user?.name || "Account"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {[
                    ["My Profile", "profile"],
                    ["My Bookings", "history"],
                    ["Saved Services", "profile"],
                    ["Addresses", "profile"],
                    ["Payment Methods", "profile"],
                    ["Settings", "profile"],
                  ].map(([label, page]) => (
                    <button
                      key={label}
                      onClick={() => {
                        setActivePage(page);
                        setShowProfileMenu(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={logout}
                    className="mt-1 block w-full border-t border-slate-100 px-3 py-2 text-left text-xs font-bold text-red-600"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </nav>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="hidden rounded-xl p-2 text-slate-700 hover:bg-slate-100 max-md:block"
            aria-label="Open navigation menu"
            aria-expanded={showMobileMenu}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <div className="flex items-center gap-3">
            <div
              title={connected ? "Real-time WebSocket Live" : "Reconnecting..."}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-600"
            >
              <span
                className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {connected ? "Live" : "Connecting"}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="border-t border-slate-200 px-4 py-3 md:hidden">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search for a service..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {links.map(([page, label]) => (
                <button
                  key={page}
                  onClick={() => {
                    setActivePage(page);
                    setShowMobileMenu(false);
                  }}
                  className="min-h-11 rounded-xl bg-slate-50 px-3 text-left text-xs font-bold text-slate-700"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setActivePage("profile");
                  setShowMobileMenu(false);
                }}
                className="min-h-11 rounded-xl bg-slate-50 px-3 text-left text-xs font-bold text-slate-700"
              >
                My Profile
              </button>
              <button
                onClick={logout}
                className="min-h-11 rounded-xl bg-red-50 px-3 text-left text-xs font-bold text-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
