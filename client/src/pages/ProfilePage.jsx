import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Heart,
  HelpCircle,
  History,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  UserCheck,
  Wrench,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { allServicesCatalog } from "../data/servicesData";
import { promotionsData } from "../data/promotionsData";

export default function ProfilePage({
  onHome,
  onNavigateToService,
  onBookService,
  onNavigateAdmin,
  onNavigateTechnician,
}) {
  const { user, updateUser, logout } = useAuth();

  // Active Menu Navigation Tab
  // 'overview' | 'bookings' | 'addresses' | 'payments' | 'saved' | 'notifications' | 'offers' | 'support' | 'settings'
  const [activeTab, setActiveTab] = useState("overview");

  // Mobile horizontal scroll navigation references
  const mobileNavScrollRef = useRef(null);
  const mobileTabRefs = useRef({});

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileTabRefs.current[tabId]) {
      mobileTabRefs.current[tabId].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Automatically scroll selected tab into view when activeTab changes
  useEffect(() => {
    if (mobileTabRefs.current[activeTab]) {
      mobileTabRefs.current[activeTab].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  // Booking status filter
  const [bookingFilter, setBookingFilter] = useState("all");

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] =
    useState(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "Rahul Sharma",
    email: user?.email || "rahul.sharma@example.com",
    phone: user?.phone || "+91 98765 43210",
    address:
      user?.address ||
      "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
    avatar:
      user?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  });

  const [toastMessage, setToastMessage] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Helper to construct cross-platform SMS URL
  const getSmsUrl = (phone, booking) => {
    if (!phone) return "#";
    const cleanNumber = phone.replace(/[^\d+]/g, "");
    const bookingIdText = booking?.id ? ` (Booking #${booking.id})` : "";
    const prefilledMessage = `Hi, I'm contacting you regarding my Argent Your service booking${bookingIdText}.`;
    const encodedMessage = encodeURIComponent(prefilledMessage);

    // iOS uses &body= or ?&body=, Android/others use ?body=
    const isIOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent || "");
    const separator = isIOS ? "&" : "?";
    return `sms:${cleanNumber}${separator}body=${encodedMessage}`;
  };

  // Call assigned professional with native trigger and fallback
  const handleCallTechnician = (e, tech) => {
    if (!tech || !tech.phone) {
      e.preventDefault();
      showToast("Professional contact number is not available.");
      return;
    }

    const cleanNumber = tech.phone.replace(/[^\d+]/g, "");

    // Fallback: Copy number to clipboard for devices/browsers without native dialer capability
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanNumber).catch(() => {});
    }

    showToast(`Connecting call to ${tech.name}... (Dialer opened)`);
  };

  // SMS assigned professional with native trigger and pre-filled message fallback
  const handleSmsTechnician = (e, tech, booking) => {
    if (!tech || !tech.phone) {
      e.preventDefault();
      showToast("Professional contact number is not available.");
      return;
    }

    const bookingIdText = booking?.id ? ` (Booking #${booking.id})` : "";
    const prefilledMessage = `Hi, I'm contacting you regarding my Argent Your service booking${bookingIdText}.`;

    // Fallback: Copy pre-filled message to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prefilledMessage).catch(() => {});
    }

    showToast(`Opening messaging app for ${tech.name}...`);
  };

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  // Demo Bookings Data
  const [bookings, setBookings] = useState([
    {
      id: "AY-9402",
      serviceName: "AC Foam-Jet Service",
      category: "AC & Appliance Repair",
      image:
        "https://images.unsplash.com/photo-1631545806609-1e3b0a4d7a87?auto=format&fit=crop&w=400&q=85",
      slug: "ac-foam-jet-service",
      scheduledDate: "Today, Sep 18",
      scheduledTime: "3:00 PM - 4:30 PM",
      status: "In Progress",
      statusStep: 3, // 1: Requested, 2: Assigned, 3: In Progress, 4: Completed
      price: "$35.00",
      totalPaid: "$38.50",
      paymentMethod: "UPI (Google Pay)",
      address: "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
      technician: {
        name: "Rajesh Kumar",
        rating: "4.9",
        reviews: "348",
        experience: "7 years",
        phone: "+91 98765 21000",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      },
    },
    {
      id: "AY-8911",
      serviceName: "Home Refresh Clean",
      category: "Home Cleaning",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=85",
      slug: "home-refresh-clean",
      scheduledDate: "Tomorrow, Sep 19",
      scheduledTime: "10:00 AM - 11:30 AM",
      status: "Confirmed",
      statusStep: 2,
      price: "$29.00",
      totalPaid: "$32.50",
      paymentMethod: "Saved Card (•••• 4242)",
      address: "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
      technician: {
        name: "Amit Sharma",
        rating: "4.8",
        reviews: "215",
        experience: "5 years",
        phone: "+91 98112 34567",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      },
    },
    {
      id: "AY-7810",
      serviceName: "Electrician Visit & Repairs",
      category: "Home Repair",
      image:
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=85",
      slug: "electrician-visit",
      scheduledDate: "14 Sep 2026",
      scheduledTime: "1:00 PM - 2:00 PM",
      status: "Completed",
      statusStep: 4,
      price: "$19.00",
      totalPaid: "$22.50",
      paymentMethod: "Cash on Service",
      address: "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
      technician: {
        name: "Sunil Verma",
        rating: "5.0",
        reviews: "520",
        experience: "9 years",
        phone: "+91 98450 99881",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      },
    },
    {
      id: "AY-6932",
      serviceName: "Water Purifier Service",
      category: "Appliance Repair",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=85",
      slug: "water-purifier-service",
      scheduledDate: "02 Sep 2026",
      scheduledTime: "11:30 AM - 12:30 PM",
      status: "Completed",
      statusStep: 4,
      price: "$24.00",
      totalPaid: "$27.50",
      paymentMethod: "Saved Card (•••• 8812)",
      address: "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
      technician: {
        name: "Ravi Shankar",
        rating: "4.9",
        reviews: "190",
        experience: "4 years",
        phone: "+91 98710 44332",
        avatar:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
      },
    },
  ]);

  // Saved Addresses
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      type: "Home",
      isDefault: true,
      line1: "Flat 402, Green Glen Heights",
      line2: "Sector 62, Near Electronic City Metro",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201304",
      phone: "+91 98765 43210",
      recipient: "Rahul Sharma",
    },
    {
      id: "addr-2",
      type: "Work",
      isDefault: false,
      line1: "Tower B, 7th Floor, Cyber City",
      line2: "DLF Phase 2, Sector 24",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122002",
      phone: "+91 98765 43210",
      recipient: "Rahul Sharma (Office)",
    },
    {
      id: "addr-3",
      type: "Other",
      isDefault: false,
      line1: "Villa 14, Palm Grove Enclave",
      line2: "Greater Kailash II",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110048",
      phone: "+91 98110 55443",
      recipient: "Parents Home",
    },
  ]);

  // Payment Methods (Strictly masked card numbers)
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "card-1",
      brand: "Visa",
      maskedNumber: "•••• •••• •••• 4242",
      cardholder: "Rahul Sharma",
      expiry: "08/28",
      isDefault: true,
      type: "Credit Card",
    },
    {
      id: "card-2",
      brand: "Mastercard",
      maskedNumber: "•••• •••• •••• 8812",
      cardholder: "Rahul Sharma",
      expiry: "11/29",
      isDefault: false,
      type: "Debit Card",
    },
    {
      id: "upi-1",
      brand: "UPI",
      maskedNumber: "rahul.sharma@okaxis",
      cardholder: "Rahul Sharma",
      expiry: "N/A",
      isDefault: false,
      type: "UPI ID",
    },
  ]);

  // Saved / Wishlisted Services
  const [savedServicesList, setSavedServicesList] = useState([
    {
      name: "At-Home Salon Glow",
      category: "Women's Salon & Spa",
      price: "From $29",
      rating: "4.9",
      reviews: "3.4k",
      slug: "at-home-salon-glow",
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "AC Foam-Jet Service",
      category: "AC & Appliance Repair",
      price: "From $35",
      rating: "4.8",
      reviews: "1.9k",
      slug: "ac-foam-jet-service",
      image:
        "https://images.unsplash.com/photo-1631545806609-1e3b0a4d7a87?auto=format&fit=crop&w=500&q=85",
    },
    {
      name: "Smart Home Setup",
      category: "Smart Home Products",
      price: "From $39",
      rating: "4.9",
      reviews: "1.2k",
      slug: "smart-home-setup",
      image:
        "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=500&q=85",
    },
  ]);

  // Notifications List
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Technician En Route",
      message:
        "Rajesh Kumar has departed and is scheduled to reach your location in 15 mins for AC Foam-Jet Service.",
      time: "10 minutes ago",
      read: false,
      type: "service",
    },
    {
      id: "notif-2",
      title: "Booking Confirmed",
      message:
        "Your booking for Home Refresh Clean (#AY-8911) is confirmed for Tomorrow, 10:00 AM.",
      time: "2 hours ago",
      read: true,
      type: "booking",
    },
    {
      id: "notif-3",
      title: "Special Member Discount Unlocked",
      message:
        "Use coupon code CLEAN20 to get 20% off on your next deep home cleaning appointment.",
      time: "Yesterday",
      read: true,
      type: "promo",
    },
    {
      id: "notif-4",
      title: "Service Completed",
      message:
        "Electrician Visit (#AY-7810) was successfully completed. Please take a moment to rate Sunil.",
      time: "4 days ago",
      read: true,
      type: "service",
    },
  ]);

  // Form State for Add Address Modal
  const [newAddressForm, setNewAddressForm] = useState({
    type: "Home",
    recipient: profileForm.name,
    phone: profileForm.phone,
    line1: "",
    line2: "",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "",
    isDefault: false,
  });

  // Form State for Add Payment Modal
  const [newPaymentForm, setNewPaymentForm] = useState({
    cardNumber: "",
    cardholder: profileForm.name,
    expiry: "",
    cvv: "",
    brand: "Visa",
    isDefault: false,
  });

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({ ...user, ...profileForm });
    setIsEditProfileOpen(false);
    showToast("Profile information updated successfully!");
  };

  // Add Address Handler
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.line1 || !newAddressForm.postalCode) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      ...newAddressForm,
    };

    if (newAddressForm.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr),
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }

    setIsAddAddressOpen(false);
    setNewAddressForm({
      type: "Home",
      recipient: profileForm.name,
      phone: profileForm.phone,
      line1: "",
      line2: "",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "",
      isDefault: false,
    });
    showToast("New service address added!");
  };

  // Set Default Address
  const handleSetDefaultAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast("Default delivery address updated.");
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast("Address removed.");
  };

  // Add Payment Method Handler
  const handleAddPayment = (e) => {
    e.preventDefault();
    const cleanNum = newPaymentForm.cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 12) return;

    const last4 = cleanNum.slice(-4);
    const newCard = {
      id: `card-${Date.now()}`,
      brand: newPaymentForm.brand,
      maskedNumber: `•••• •••• •••• ${last4}`,
      cardholder: newPaymentForm.cardholder || profileForm.name,
      expiry: newPaymentForm.expiry || "12/29",
      isDefault: newPaymentForm.isDefault,
      type: "Credit / Debit Card",
    };

    if (newPaymentForm.isDefault) {
      setPaymentMethods((prev) =>
        prev.map((p) => ({ ...p, isDefault: false })).concat(newCard),
      );
    } else {
      setPaymentMethods((prev) => [...prev, newCard]);
    }

    setIsAddPaymentOpen(false);
    setNewPaymentForm({
      cardNumber: "",
      cardholder: profileForm.name,
      expiry: "",
      cvv: "",
      brand: "Visa",
      isDefault: false,
    });
    showToast("Payment method added securely.");
  };

  // Set Default Payment
  const handleSetDefaultPayment = (id) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id })),
    );
    showToast("Default payment method updated.");
  };

  // Delete Payment
  const handleDeletePayment = (id) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    showToast("Payment method removed.");
  };

  // Copy Coupon Code Handler
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(""), 2500);
  };

  // Remove Saved Service
  const handleRemoveSavedService = (slug) => {
    setSavedServicesList((prev) => prev.filter((s) => s.slug !== slug));
    showToast("Service removed from saved list.");
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    onHome?.();
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "upcoming")
      return b.status === "In Progress" || b.status === "Confirmed";
    if (bookingFilter === "completed") return b.status === "Completed";
    if (bookingFilter === "cancelled") return b.status === "Cancelled";
    return true;
  });

  const totalBookingsCount = 12;
  const upcomingCount = bookings.filter(
    (b) => b.status === "In Progress" || b.status === "Confirmed",
  ).length;
  const completedCount = 10;
  const savedCount = savedServicesList.length;

  const sidebarMenuItems = [
    { id: "overview", label: "My Profile", icon: User },
    {
      id: "bookings",
      label: "My Bookings",
      icon: Calendar,
      badge: upcomingCount > 0 ? `${upcomingCount} Active` : null,
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      badge: addresses.length,
    },
    {
      id: "payments",
      label: "Payment Methods",
      icon: CreditCard,
      badge: paymentMethods.length,
    },
    {
      id: "saved",
      label: "Saved Services",
      icon: Heart,
      badge: savedServicesList.length,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: notifications.filter((n) => !n.read).length || null,
    },
    {
      id: "offers",
      label: "Offers & Rewards",
      icon: Sparkles,
      highlight: true,
    },
    { id: "support", label: "Help & Support", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const mobileNavItems = [
    ...sidebarMenuItems,
    { id: "logout", label: "Logout", icon: LogOut },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f7f3] text-slate-950 pb-20 pt-28 sm:pt-32 box-border">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-rise-in border border-white/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 box-border min-w-0">
        {/* Top Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-5 w-5 rounded-md object-contain shadow-2xs shrink-0"
            />
            <span className="hidden sm:inline">Back to Argent Your Home</span>
            <span className="sm:hidden">Home</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </button>
        </div>

        {/* ===================================================================
            1. PROFILE HEADER CARD
        =================================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-4 sm:p-8 shadow-sm backdrop-blur-xl w-full max-w-full box-border">
          {/* Subtle decorative background tint */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
              {/* Circular Avatar with Camera/Edit Button */}
              <div className="relative group shrink-0">
                <div className="relative h-20 w-20 sm:h-28 sm:w-28 overflow-hidden rounded-full border-4 border-white bg-slate-900 shadow-xl ring-2 ring-emerald-600/30">
                  <img
                    src={profileForm.avatar}
                    alt={profileForm.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-950 text-white shadow-md hover:bg-emerald-700 hover:scale-105 transition-all border-2 border-white"
                  title="Update profile photo"
                >
                  <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>

              {/* User Details */}
              <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 break-words">
                    {profileForm.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-900 border border-emerald-300/60 shadow-2xs">
                    <ShieldCheck className="h-3 w-3 text-emerald-700" />
                    <span>Verified Customer</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 sm:gap-x-4 text-xs font-semibold text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{profileForm.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Phone className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span>{profileForm.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 w-full sm:w-auto">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate max-w-[220px] sm:max-w-[280px]">
                      {profileForm.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Edit Profile Button */}
            <div className="flex items-center gap-3 w-full md:w-auto pt-1 md:pt-0">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            MAIN LAYOUT: SIDEBAR MENU + CONTENT AREA
        =================================================================== */}
        <div className="w-full max-w-full min-w-0 grid gap-6 lg:gap-8 lg:grid-cols-[260px_1fr] items-start">
          {/* =================================================================
              2. PROFILE SIDEBAR / NAVIGATION MENU
          ================================================================= */}
          <aside className="w-full max-w-full min-w-0 space-y-4">
            {/* Desktop Navigation Menu Card */}
            <div className="rounded-3xl border border-white/80 bg-white/90 p-3.5 shadow-sm backdrop-blur-md hidden lg:block">
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Dashboard Menu
              </p>
              <nav className="space-y-1">
                {sidebarMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                        isActive
                          ? "bg-slate-950 text-white shadow-md"
                          : item.highlight
                            ? "text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-emerald-300"
                              : item.highlight
                                ? "text-emerald-700"
                                : "text-slate-500"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="my-2 border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Mobile Responsive Navigation Slider / Tabs (Horizontally scrollable with ALL 10 items) */}
            <div className="lg:hidden w-full max-w-full min-w-0">
              <div
                ref={mobileNavScrollRef}
                className="w-full max-w-full overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain py-1"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x",
                }}
              >
                <div className="flex items-center gap-2 w-max px-0.5 pb-1">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isLogout = item.id === "logout";

                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          mobileTabRefs.current[item.id] = el;
                        }}
                        type="button"
                        onClick={() => {
                          if (isLogout) {
                            handleLogout();
                          } else {
                            handleTabClick(item.id);
                          }
                        }}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all shadow-2xs touch-manipulation cursor-pointer active:scale-95 shrink-0 ${
                          isLogout
                            ? "bg-rose-50/90 text-rose-700 border border-rose-200/80 hover:bg-rose-100"
                            : isActive
                              ? "bg-slate-950 text-white shadow-md ring-2 ring-slate-950/10"
                              : item.highlight
                                ? "bg-emerald-50/90 text-emerald-950 border border-emerald-300/80 hover:bg-emerald-100/80"
                                : "bg-white/95 text-slate-700 border border-slate-200/90 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isLogout
                              ? "text-rose-600"
                              : isActive
                                ? "text-emerald-300"
                                : item.highlight
                                  ? "text-emerald-700"
                                  : "text-slate-500"
                          }`}
                        />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Membership & Trust Guarantee Card */}
            <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-5 shadow-xs backdrop-blur-md space-y-3 hidden lg:block">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                <img
                  src="/argent-logo.png"
                  alt="Argent Your"
                  className="h-4 w-4 object-contain"
                />
                <span>Argent Member Privileges</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy zero convenience fees, priority emergency dispatch, and
                30-day revisit assurance.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("offers")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>View Member Rewards</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* =================================================================
              CONTENT AREA (DASHBOARD CARDS, BOOKINGS, ADDRESSES, PAYMENTS, OFFERS)
          ================================================================= */}
          <main className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8">
            {/* ===============================================================
                3. PROFILE DASHBOARD SUMMARY CARDS (4 Cards)
            =============================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
              {/* Card 1: Total Bookings */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-3.5 sm:p-5 shadow-xs backdrop-blur-md hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Total Orders
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/50 shrink-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                  {totalBookingsCount}
                </p>
                <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 truncate">
                  +2 this month
                </p>
              </div>

              {/* Card 2: Upcoming Bookings */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-3.5 sm:p-5 shadow-xs backdrop-blur-md hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Upcoming
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/50 shrink-0">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">
                    {upcomingCount}
                  </p>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
                  Next: Today 3:00 PM
                </p>
              </div>

              {/* Card 3: Completed Bookings */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-3.5 sm:p-5 shadow-xs backdrop-blur-md hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Completed
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-slate-200/60 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                  {completedCount}
                </p>
                <p className="mt-1 text-[10px] sm:text-[11px] font-semibold text-teal-700 truncate">
                  100% On-time guarantee
                </p>
              </div>

              {/* Card 4: Saved Services */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-3.5 sm:p-5 shadow-xs backdrop-blur-md hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Saved Services
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-200/50 shrink-0">
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                  {savedCount}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("saved")}
                  className="mt-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer truncate block"
                >
                  Quick Rebook &rarr;
                </button>
              </div>
            </div>

            {/* ===============================================================
                TAB 1: OVERVIEW & RECENT BOOKINGS
            =============================================================== */}
            {(activeTab === "overview" || activeTab === "bookings") && (
              <section className="space-y-6 animate-rise-in w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Recent Bookings
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Track active appointments and review completed doorstep
                      services
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-200/60 p-1 text-xs font-bold text-slate-700 self-start sm:self-auto">
                    {[
                      { id: "all", label: "All" },
                      { id: "upcoming", label: "Upcoming" },
                      { id: "completed", label: "Completed" },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setBookingFilter(chip.id)}
                        className={`rounded-xl px-3 py-1.5 transition-colors cursor-pointer ${
                          bookingFilter === chip.id
                            ? "bg-white text-slate-950 shadow-xs"
                            : "hover:text-slate-950"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking Cards Grid / Stack */}
                <div className="space-y-3.5 w-full">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-3xl border border-white/80 bg-white/95 p-3.5 sm:p-5 shadow-xs backdrop-blur-md hover:border-emerald-200 hover:shadow-md transition-all group w-full"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Service Thumbnail & Core Details */}
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                          <img
                            src={booking.image}
                            alt={booking.serviceName}
                            className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                                {booking.category}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                #{booking.id}
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                              {booking.serviceName}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Calendar className="h-3 w-3 text-emerald-700 shrink-0" />
                                <span>{booking.scheduledDate}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{booking.scheduledTime}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status, Price & Action Buttons */}
                        <div className="flex flex-col sm:flex-col items-stretch sm:items-end justify-between w-full sm:w-auto gap-2.5 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                                booking.status === "In Progress"
                                  ? "bg-amber-50 text-amber-900 border-amber-200"
                                  : booking.status === "Confirmed"
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                    : "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              {booking.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedBookingForDetails(booking)
                              }
                              className="flex-1 sm:flex-initial text-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const matched = allServicesCatalog.find(
                                  (s) => s.slug === booking.slug,
                                ) || {
                                  name: booking.serviceName,
                                  image: booking.image,
                                  slug: booking.slug,
                                  price: booking.price,
                                };
                                if (onBookService) {
                                  onBookService(matched);
                                } else if (onNavigateToService) {
                                  onNavigateToService(booking.slug);
                                }
                              }}
                              className="flex-1 sm:flex-initial text-center rounded-xl bg-slate-950 hover:bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
                            >
                              Book Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredBookings.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center space-y-2">
                      <p className="text-sm font-bold text-slate-800">
                        No bookings found under this filter
                      </p>
                      <p className="text-xs text-slate-500">
                        Explore our home services catalog to schedule a service.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 2: SAVED ADDRESSES
            =============================================================== */}
            {(activeTab === "overview" || activeTab === "addresses") && (
              <section className="space-y-4 animate-rise-in w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Saved Addresses
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage your doorstep service delivery locations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-3xl border p-5 shadow-xs backdrop-blur-md transition-all ${
                        addr.isDefault
                          ? "border-emerald-300 bg-white/95 ring-2 ring-emerald-600/10"
                          : "border-white/80 bg-white/85 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-800">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-extrabold text-emerald-900">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete address"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {addr.recipient}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.line1}
                        <br />
                        {addr.line2 && <>{addr.line2}, </>}
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Ph: {addr.phone}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Primary Service
                            Address
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 3: PAYMENT METHODS
            =============================================================== */}
            {(activeTab === "overview" || activeTab === "payments") && (
              <section className="space-y-4 animate-rise-in w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Payment Methods
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Secure payment options for faster doorstep bookings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Payment Method</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className={`rounded-3xl border p-5 shadow-xs backdrop-blur-md transition-all ${
                        pm.isDefault
                          ? "border-emerald-300 bg-white/95 ring-2 ring-emerald-600/10"
                          : "border-white/80 bg-white/85 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-700" />
                          <span className="font-bold text-xs text-slate-900">
                            {pm.brand}
                          </span>
                        </div>
                        {pm.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-extrabold text-emerald-900">
                            Default
                          </span>
                        )}
                      </div>

                      {/* STRICT SECURITY: Never display full card numbers */}
                      <p className="font-mono text-sm font-black text-slate-900 tracking-widest">
                        {pm.maskedNumber}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>{pm.cardholder}</span>
                        {pm.expiry !== "N/A" && <span>Exp: {pm.expiry}</span>}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        {!pm.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultPayment(pm.id)}
                            className="font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                          >
                            Set Default
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Default Payment
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(pm.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 4: SAVED SERVICES
            =============================================================== */}
            {(activeTab === "overview" || activeTab === "saved") && (
              <section className="space-y-4 animate-rise-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Saved Services
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your bookmarked and most requested home care favorites
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {savedServicesList.map((svc) => (
                    <div
                      key={svc.slug}
                      className="group rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xs backdrop-blur-md hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-3 bg-slate-100">
                          <img
                            src={svc.image}
                            alt={svc.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSavedService(svc.slug)}
                            className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm hover:scale-110 transition-transform"
                            title="Remove from saved"
                          >
                            <Heart className="h-3.5 w-3.5 fill-rose-600" />
                          </button>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          {svc.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                          {svc.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{svc.rating}</span>
                          <span className="text-slate-400 font-normal">
                            ({svc.reviews})
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-black text-slate-900">
                          {svc.price}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onBookService) {
                              onBookService(svc);
                            } else if (onNavigateToService) {
                              onNavigateToService(svc.slug);
                            }
                          }}
                          className="rounded-xl bg-slate-950 hover:bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-2xs"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===============================================================
                7. OFFERS & REWARDS SECTION
            =============================================================== */}
            {(activeTab === "overview" || activeTab === "offers") && (
              <section className="space-y-4 animate-rise-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Exclusive Offers for You
                      </h2>
                      <p className="text-xs text-slate-500">
                        Handpicked discounts and promo codes for your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "off-1",
                      title: "20% OFF on Home Cleaning",
                      discount: "20% OFF",
                      code: "CLEAN20",
                      description:
                        "Deep scrubbing, bathroom & kitchen sanitization with verified cleaners.",
                      validity: "Valid until 30 Sep",
                      slug: "home-refresh-clean",
                    },
                    {
                      id: "off-2",
                      title: "Flat ₹200 OFF First Order",
                      discount: "FLAT ₹200 OFF",
                      code: "FIRST200",
                      description:
                        "Valid across all AC repair, appliance maintenance, and salon services.",
                      validity: "For verified members",
                      slug: "ac-foam-jet-service",
                    },
                    {
                      id: "off-3",
                      title: "25% OFF Men's Grooming",
                      discount: "25% OFF",
                      code: "MENSTYLE25",
                      description:
                        "Barbershop styling, haircut & stress relief head massage in comfort of home.",
                      validity: "Limited slots today",
                      slug: "mens-grooming-package",
                    },
                  ].map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 p-5 shadow-xs backdrop-blur-md flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <span className="inline-block rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-900">
                          {offer.discount}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        {/* Coupon Code Chip with Click-to-Copy */}
                        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100/80 px-3 py-2 border border-dashed border-emerald-400">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                            <Tag className="h-3.5 w-3.5 text-emerald-700" />
                            <span>{offer.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCoupon(offer.code)}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                          >
                            {copiedCoupon === offer.code ? "Copied!" : "Copy"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {offer.validity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const targetSvc =
                                allServicesCatalog.find(
                                  (s) => s.slug === offer.slug,
                                ) || allServicesCatalog[0];
                              if (onBookService) {
                                onBookService(targetSvc, offer.code);
                              } else if (onNavigateToService) {
                                onNavigateToService(offer.slug);
                              }
                            }}
                            className="rounded-xl bg-slate-950 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-800 transition-colors"
                          >
                            Use Coupon
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 5: NOTIFICATIONS TAB
            =============================================================== */}
            {activeTab === "notifications" && (
              <section className="space-y-4 animate-rise-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Notifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Important updates regarding your appointments and account
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true })),
                      );
                      showToast("All notifications marked as read.");
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-2xl border p-4 shadow-xs backdrop-blur-md transition-all ${
                        !notif.read
                          ? "border-emerald-200 bg-white/95 ring-1 ring-emerald-500/20"
                          : "border-white/80 bg-white/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                              !notif.read ? "bg-emerald-600" : "bg-transparent"
                            }`}
                          />
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 6: HELP & SUPPORT TAB
            =============================================================== */}
            {activeTab === "support" && (
              <section className="space-y-6 animate-rise-in">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Help & Support
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We're here to help you 24/7 with any doorstep service
                    inquiry
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xs space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                      <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">
                      24/7 Priority Helpline
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct phone access to our dedicated service care team.
                    </p>
                    <p className="text-sm font-mono font-bold text-emerald-800">
                      +91 1800 200 4000
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xs space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">
                      WhatsApp Quick Assist
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chat with support agents for instant rescheduling or
                      queries.
                    </p>
                    <p className="text-sm font-mono font-bold text-emerald-800">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      {
                        q: "How do I reschedule a booked service?",
                        a: "You can reschedule for free up to 2 hours before your scheduled appointment directly from the My Bookings section.",
                      },
                      {
                        q: "What does the 30-Day Argent Warranty cover?",
                        a: "If any repair or service issue re-occurs within 30 days of the appointment, a verified technician will visit and resolve it at zero extra charge.",
                      },
                      {
                        q: "How are Argent Your professionals vetted?",
                        a: "All service professionals undergo 3-tier background checks, police verification, skill test certification, and identity validation.",
                      },
                    ].map((faq, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-slate-50/70 p-3.5 border border-slate-100"
                      >
                        <p className="font-bold text-slate-900">{faq.q}</p>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ===============================================================
                TAB 7: SETTINGS TAB
            =============================================================== */}
            {activeTab === "settings" && (
              <section className="space-y-6 animate-rise-in">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Account Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage security credentials and communication preferences
                  </p>
                </div>

                <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xs space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Communication Preferences
                  </h3>
                  <div className="space-y-3 text-xs font-semibold text-slate-700">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>SMS & WhatsApp status updates</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Promotional discounts & coupon alerts</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Email invoices & service receipts</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Security & Login
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        Account Password
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        showToast("Password reset link sent to email.")
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-800 hover:bg-slate-100"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* ===================================================================
          MODAL 1: EDIT PROFILE MODAL
      =================================================================== */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                Edit Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Location / Address
                </label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: BOOKING DETAILS MODAL
      =================================================================== */}
      {selectedBookingForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setSelectedBookingForDetails(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-7 py-4.5 bg-white shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Booking Receipt
                </span>
                <h3 className="text-base font-black text-slate-900">
                  #{selectedBookingForDetails.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close receipt"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Scrollbar completely hidden to eliminate vertical line/strip */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4 text-xs scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Service Item Header */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <img
                  src={selectedBookingForDetails.image}
                  alt={selectedBookingForDetails.serviceName}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 truncate">
                    {selectedBookingForDetails.serviceName}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {selectedBookingForDetails.scheduledDate} ·{" "}
                    {selectedBookingForDetails.scheduledTime}
                  </p>
                  <span className="text-xs font-black text-emerald-800">
                    {selectedBookingForDetails.price}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Service Tracking
                </p>
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                  {["Requested", "Assigned", "In Progress", "Completed"].map(
                    (step, idx) => {
                      const isPast =
                        idx + 1 <= selectedBookingForDetails.statusStep;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full ${
                              isPast ? "bg-emerald-600" : "bg-slate-200"
                            }`}
                          />
                          <span
                            className={
                              isPast ? "text-emerald-900" : "text-slate-400"
                            }
                          >
                            {step}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Technician Info Card - Assigned Doorstep Professional with Call & SMS */}
              {selectedBookingForDetails.technician && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                      Assigned Doorstep Professional
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Pro
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={selectedBookingForDetails.technician.avatar}
                        alt={selectedBookingForDetails.technician.name}
                        className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {selectedBookingForDetails.technician.name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-amber-600">
                            ★ {selectedBookingForDetails.technician.rating}
                          </span>
                          <span>·</span>
                          <span>
                            {selectedBookingForDetails.technician.experience}{" "}
                            exp
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* [ 📞 Call ]   [ 💬 SMS ] Buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <a
                        href={`tel:${selectedBookingForDetails.technician.phone ? selectedBookingForDetails.technician.phone.replace(/[^\d+]/g, "") : ""}`}
                        onClick={(e) =>
                          handleCallTechnician(
                            e,
                            selectedBookingForDetails.technician,
                          )
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm active:scale-95 touch-manipulation min-h-[38px] whitespace-nowrap"
                        title={`Call ${selectedBookingForDetails.technician.name}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Call</span>
                      </a>

                      <a
                        href={getSmsUrl(
                          selectedBookingForDetails.technician.phone,
                          selectedBookingForDetails,
                        )}
                        onClick={(e) =>
                          handleSmsTechnician(
                            e,
                            selectedBookingForDetails.technician,
                            selectedBookingForDetails,
                          )
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50 transition-colors shadow-sm active:scale-95 touch-manipulation min-h-[38px] whitespace-nowrap"
                        title={`Send SMS to ${selectedBookingForDetails.technician.name}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                        <span>SMS</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Address */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Service Address
                </p>
                <p className="text-slate-800 font-semibold">
                  {selectedBookingForDetails.address}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {selectedBookingForDetails.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safety & Convenience Fee</span>
                  <span className="font-bold text-slate-900">$3.50</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 border-t border-slate-100 pt-1.5 text-sm">
                  <span>Total Paid</span>
                  <span className="text-emerald-800">
                    {selectedBookingForDetails.totalPaid}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Paid via {selectedBookingForDetails.paymentMethod}
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast("Receipt downloaded to your device.")
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookingForDetails(null);
                    setActiveTab("support");
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>Need Help?</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: ADD NEW ADDRESS MODAL
      =================================================================== */}
      {isAddAddressOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsAddAddressOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/80 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Add New Service Address
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddAddress}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Home", "Work", "Other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setNewAddressForm({ ...newAddressForm, type: t })
                      }
                      className={`py-2 text-center rounded-xl font-bold border transition-colors ${
                        newAddressForm.type === t
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  House / Flat / Building No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Green Glen Heights"
                  value={newAddressForm.line1}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      line1: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Street / Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62"
                  value={newAddressForm.line2}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      line2: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.city}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        city: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 201304"
                    value={newAddressForm.postalCode}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-700">
                <input
                  type="checkbox"
                  checked={newAddressForm.isDefault}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>Set as default service delivery address</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 font-bold text-white hover:bg-emerald-800"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: ADD PAYMENT METHOD MODAL
      =================================================================== */}
      {isAddPaymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsAddPaymentOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/80 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Add New Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPaymentOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddPayment}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="4242 •••• •••• 4242"
                  maxLength={19}
                  value={newPaymentForm.cardNumber}
                  onChange={(e) =>
                    setNewPaymentForm({
                      ...newPaymentForm,
                      cardNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={newPaymentForm.cardholder}
                  onChange={(e) =>
                    setNewPaymentForm({
                      ...newPaymentForm,
                      cardholder: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={newPaymentForm.expiry}
                    onChange={(e) =>
                      setNewPaymentForm({
                        ...newPaymentForm,
                        expiry: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={newPaymentForm.cvv}
                    onChange={(e) =>
                      setNewPaymentForm({
                        ...newPaymentForm,
                        cvv: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-700">
                <input
                  type="checkbox"
                  checked={newPaymentForm.isDefault}
                  onChange={(e) =>
                    setNewPaymentForm({
                      ...newPaymentForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>Set as default payment method</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 font-bold text-white hover:bg-emerald-800"
                >
                  Save Card Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: CHANGE AVATAR MODAL
      =================================================================== */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-rise-in"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/80 bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Choose Profile Avatar
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Select from verified Argent Your avatars or enter an image URL:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                ].map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setProfileForm((prev) => ({ ...prev, avatar: src }));
                      updateUser({ ...user, avatar: src });
                      setIsAvatarModalOpen(false);
                      showToast("Profile avatar updated!");
                    }}
                    className={`relative overflow-hidden rounded-full aspect-square border-2 transition-transform hover:scale-105 ${
                      profileForm.avatar === src
                        ? "border-emerald-600 ring-4 ring-emerald-500/20"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={src}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
