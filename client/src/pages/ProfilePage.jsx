import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  HelpCircle,
  History,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wrench,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ProfilePage({
  onHome,
  onNavigateToService,
  onNavigateAdmin,
  onNavigateTechnician,
}) {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "+91 98765 43210",
    address: user?.address || "Flat 402, Green Glen Heights, Delhi NCR",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyRequests, setHistoryRequests] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "+91 98765 43210",
        address: user.address || "Flat 402, Green Glen Heights, Delhi NCR",
      });
    }
  }, [user]);

  useEffect(() => {
    api
      .get("/requests/my")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setHistoryRequests(res.data);
        }
      })
      .catch(() => {
        // Fallback to demo items if API not available
      });
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.put("/auth/profile", formData);
      updateUser({ ...user, ...res.data.user });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Offline / demo fallback: update in AuthContext
      updateUser({ ...user, ...formData });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onHome?.();
  };

  // Demo active bookings
  const activeBookings = [
    {
      id: "AY-9402",
      service: "AC foam-jet service",
      category: "AC & Appliance Repair",
      status: "Technician En Route",
      scheduledFor: "Today, 3:00 PM - 4:30 PM",
      technician: "Rajesh Kumar (4.9 ★)",
      price: "$35.00",
      isEmergency: false,
    },
    {
      id: "AY-8911",
      service: "Home refresh clean",
      category: "Home Cleaning",
      status: "Confirmed",
      scheduledFor: "Tomorrow, 10:00 AM",
      technician: "Assigned upon arrival",
      price: "$29.00",
      isEmergency: false,
    },
  ];

  // Demo past history
  const pastBookings = [
    {
      id: "AY-7810",
      service: "Electrician visit",
      date: "14 Sep 2026",
      technician: "Sunil Verma",
      rating: 5,
      price: "$19.00",
      status: "Completed",
    },
    {
      id: "AY-6932",
      service: "Water Purifier Service",
      date: "02 Sep 2026",
      technician: "Amit Sharma",
      rating: 5,
      price: "$24.00",
      status: "Completed",
    },
    {
      id: "AY-5421",
      service: "Roll-on waxing & Facial",
      date: "21 Aug 2026",
      technician: "Pooja Patel",
      rating: 4.8,
      price: "$53.00",
      status: "Completed",
    },
  ];

  // Demo saved services
  const savedServices = [
    {
      name: "At-home salon glow",
      category: "Women's Salon",
      price: "From $29",
      rating: "4.9",
      reviews: "3.4k",
      slug: "at-home-salon-glow",
    },
    {
      name: "Foam-Jet AC Service",
      category: "Appliance Repair",
      price: "From $35",
      rating: "4.8",
      reviews: "1.9k",
      slug: "foam-jet-ac-service",
    },
    {
      name: "Smart home setup",
      category: "Smart Home",
      price: "From $39",
      rating: "4.9",
      reviews: "1.2k",
      slug: "smart-home-setup",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top bar with Back to Home & Logout */}
        <div className="flex items-center justify-between">
          <button
            onClick={onHome}
            className="flex items-center gap-2.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-6 w-6 rounded-lg object-contain shadow-2xs"
            />
            <span>Back to Argent Your Home</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>

        {/* User Identity Header Card */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {user?.name || "Argent Customer"}
                  </h1>
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-950 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    <img
                      src="/argent-logo.png"
                      alt="Argent Your"
                      className="h-3.5 w-3.5 rounded-xs object-contain"
                    />
                    <span>Argent Member</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {user?.email || "customer@argentyour.com"} · {formData.phone}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    {user?.role === "technician"
                      ? "Certified Partner"
                      : user?.role === "admin"
                        ? "System Administrator"
                        : "Argent Priority Member"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Member since 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Quick role actions for staff */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              {user?.role === "technician" && onNavigateTechnician && (
                <button
                  onClick={onNavigateTechnician}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" /> Partner Console
                </button>
              )}
              {user?.role === "admin" && onNavigateAdmin && (
                <button
                  onClick={onNavigateAdmin}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Room
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200/80 gap-2 sm:gap-4 no-scrollbar">
          {[
            {
              id: "bookings",
              label: "My Bookings & Orders",
              icon: PackageCheck,
            },
            { id: "history", label: "Service History", icon: History },
            { id: "saved", label: "Saved Services", icon: Heart },
            { id: "settings", label: "Account Settings", icon: User },
            { id: "support", label: "Help & Support", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? "border-emerald-800 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: My Bookings & Orders */}
        {activeTab === "bookings" && (
          <div className="space-y-4 animate-rise-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Active & Scheduled Services
                </h2>
                <p className="text-xs text-slate-500">
                  Track upcoming visits, scheduled dates, and technician
                  dispatches.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Booking ID: {booking.id}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-0.5">
                        {booking.service}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {booking.category}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        booking.status === "Technician En Route"
                          ? "bg-amber-100 text-amber-900 animate-pulse"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-emerald-700" />
                      <span className="font-semibold">
                        {booking.scheduledFor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Wrench className="h-4 w-4 text-emerald-700" />
                      <span>
                        Provider: <strong>{booking.technician}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm font-black text-slate-900">
                      {booking.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          alert(
                            `Connecting to dispatch support for #${booking.id}`,
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Contact Provider
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Service History */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-rise-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Past Bookings
              </h2>
              <p className="text-xs text-slate-500">
                View completed home visits, professional ratings, and invoices.
              </p>
            </div>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {pastBookings.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/50 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {job.service}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {job.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Completed on {job.date} · Serviced by {job.technician}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 pt-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{job.rating}.0 Rated</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-black text-slate-900">
                      {job.price}
                    </span>
                    <button
                      onClick={() => onNavigateToService?.(job.service)}
                      className="rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Services */}
        {activeTab === "saved" && (
          <div className="space-y-4 animate-rise-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Saved Favorites
              </h2>
              <p className="text-xs text-slate-500">
                Services you frequently book or marked for later.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedServices.map((item) => (
                <div
                  key={item.slug}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-0.5">
                        {item.name}
                      </h3>
                    </div>
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({item.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm font-black text-slate-900">
                      {item.price}
                    </span>
                    <button
                      onClick={() => onNavigateToService?.(item.slug)}
                      className="rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Account Settings */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-rise-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal & Address Details
              </h2>
              <p className="text-xs text-slate-500">
                Keep your contact details up to date for emergency dispatches
                and receipts.
              </p>
            </div>

            {saved && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Contact Phone
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Delivery / Home Address
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "Saving..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Help & Support */}
        {activeTab === "support" && (
          <div className="space-y-6 animate-rise-in max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Help & Support
              </h2>
              <p className="text-xs text-slate-500">
                24/7 customer assistance, emergency dispatch, and booking FAQs.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Emergency Dispatch
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Call our 24/7 dedicated dispatch helpline for immediate
                  assistance.
                </p>
                <p className="text-xs font-black text-emerald-800 pt-1">
                  +91 1800-ARGENT-99
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Customer Care
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Email us for billing inquiries, service guarantees, and
                  partner feedback.
                </p>
                <p className="text-xs font-black text-emerald-800 pt-1">
                  support@argentyour.com
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800">
                    How does Argent Your verify professionals?
                  </h4>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Every service professional undergoes complete identity
                    verification, criminal background checks, and technical
                    skill certifications before receiving jobs.
                  </p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800">
                    What is the cancellation and rescheduling policy?
                  </h4>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    You can reschedule or cancel for free up to 2 hours before
                    your scheduled appointment time directly from your bookings
                    tab.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    What is the Argent Service Guarantee?
                  </h4>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    If you are not satisfied with your service, we provide free
                    revisits or full refunds under our 30-day service warranty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
