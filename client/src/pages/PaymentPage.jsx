import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  HelpCircle,
  Lock,
  LocateFixed,
  MapPin,
  Plus,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
  Building2,
  Banknote,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { validateCoupon } from "../data/promotionsData";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";

const formatServiceDate = (date) => new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(date);
const makeServiceDates = (customDate) => {
  const dates = Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      label:
        index === 0
          ? `Today · ${formatServiceDate(date)}`
          : index === 1
            ? `Tomorrow · ${formatServiceDate(date)}`
            : `Day ${index + 1} · ${formatServiceDate(date)}`,
    };
  });
  if (customDate && !dates.some((d) => d.value === customDate)) {
    try {
      const parsed = new Date(`${customDate}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        dates.push({
          value: customDate,
          label: formatServiceDate(parsed),
        });
      }
    } catch {}
  }
  return dates;
};
const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85";

// --- PAYMENT BRAND BADGES & LOGOS (Vector SVGs) ---
const VisaLogo = ({ className = "h-3.5" }) => (
  <svg
    viewBox="0 0 48 16"
    className={`${className} w-auto max-w-full shrink-0 inline-block`}
    fill="none"
  >
    <path
      d="M18.87 0.5L12.35 15.5H8.08L4.9 3.82C4.71 3.09 4.54 2.82 3.97 2.5C3.03 1.99 1.43 1.5 0 1.2L0.35 0.5H6.94C7.83 0.5 8.62 1.09 8.82 2.11L10.5 11.05L14.7 0.5H18.87ZM35.48 10.55C35.5 6.53 29.83 6.31 29.87 4.51C29.89 3.97 30.41 3.39 31.57 3.23C32.15 3.15 33.72 3.09 35.51 3.91L36.21 0.69C35.25 0.35 34.02 0.03 32.48 0.03C28.53 0.03 25.75 2.1 25.73 5.06C25.7 7.25 27.71 8.47 29.23 9.2C30.79 9.94 31.31 10.42 31.3 11.1C31.28 12.14 30.04 12.6 28.89 12.62C26.87 12.65 25.7 12.08 24.77 11.65L24.04 15.02C24.96 15.44 26.68 15.8 28.45 15.82C32.65 15.82 35.46 13.78 35.48 10.55ZM46.06 15.5H49.71L46.54 0.5H43.14C42.36 0.5 41.7 0.95 41.41 1.65L35.37 15.5H39.55L40.38 13.2H45.49L46.06 15.5ZM41.52 10.12L43.59 4.49L44.77 10.12H41.52ZM24.63 0.5L21.32 15.5H17.34L20.65 0.5H24.63Z"
      fill="#1A1F71"
    />
  </svg>
);

const MastercardLogo = ({ className = "h-4" }) => (
  <svg
    viewBox="0 0 36 22"
    className={`${className} w-auto max-w-full shrink-0 inline-block`}
    fill="none"
  >
    <circle cx="13" cy="11" r="10" fill="#EB001B" />
    <circle cx="23" cy="11" r="10" fill="#F79E1B" fillOpacity="0.88" />
  </svg>
);

const RuPayLogo = ({ className = "" }) => (
  <div
    className={`inline-flex items-center font-black tracking-tighter text-[10px] leading-none px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0 whitespace-nowrap ${className}`}
  >
    <span className="text-cyan-400">Ru</span>
    <span className="text-emerald-400">Pay</span>
    <span className="text-[8px] text-amber-400 ml-0.5">❯❯</span>
  </div>
);

const AmexLogo = ({ className = "" }) => (
  <div
    className={`inline-flex items-center justify-center font-black tracking-tight text-[10px] leading-none px-1.5 py-0.5 rounded bg-[#006FCF] text-white shrink-0 whitespace-nowrap ${className}`}
  >
    AMEX
  </div>
);

const UpiLogo = ({ className = "" }) => (
  <div
    className={`inline-flex items-center font-black tracking-tight text-[10px] leading-none px-1.5 py-0.5 rounded bg-emerald-950 text-white shrink-0 whitespace-nowrap ${className}`}
  >
    <span className="text-emerald-400">U</span>
    <span className="text-amber-400">P</span>
    <span className="text-cyan-400">I</span>
  </div>
);

const GPayBadge = () => (
  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200">
      <span className="text-xs font-black">
        <span className="text-[#4285F4]">G</span>
      </span>
    </div>
    <span>Google Pay</span>
  </div>
);

const PhonePeBadge = () => (
  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5f259f] text-white text-xs font-black shadow-xs">
      पे
    </div>
    <span>PhonePe</span>
  </div>
);

const PaytmBadge = () => (
  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002e6e] text-white text-[10px] font-black shadow-xs">
      Pay
    </div>
    <span>Paytm</span>
  </div>
);

const BhimBadge = () => (
  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00a859] text-white text-[10px] font-black shadow-xs">
      B
    </div>
    <span>BHIM</span>
  </div>
);

export default function PaymentPage({
  service,
  onHome,
  onGoHome,
  onViewBookings,
  onOrderCreated,
  initialLocation = "Delhi NCR",
  initialPromoCode = "",
  onAuthRequired,
}) {
  const { user } = useAuth();
  const { socket, joinRoom } = useSocket();
  const serviceDates = makeServiceDates(service?.selectedDate);
  const serviceSlots = Array.from(
    new Set(
      [
        service?.selectedTime,
        "09:00 AM - 10:30 AM",
        "12:00 PM - 01:30 PM",
        "03:30 PM - 05:00 PM",
        "06:00 PM - 07:30 PM",
      ].filter(Boolean),
    ),
  );

  // Determine base service price in INR
  const getBasePrice = () => {
    if (service?.finalAmount && Number(service.finalAmount) > 0) {
      return Number(service.finalAmount);
    }
    if (service?.inrPrice) return Number(service.inrPrice);
    if (service?.numericPrice) {
      if (service.numericPrice >= 100) return Number(service.numericPrice);
      // Map legacy small catalog values to the established INR price scale.
      return Math.round(service.numericPrice * 25);
    }
    if (typeof service?.price === "string") {
      const match = service.price.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (val >= 100) return val;
        return val * 25;
      }
    }
    return 599; // Default matching user's exact specification ₹599
  };

  const basePrice = getBasePrice();

  // Booking details state
  const [selectedDate, setSelectedDate] = useState(() => {
    const dates = makeServiceDates(service?.selectedDate);
    return service?.selectedDate && service.selectedDate.length >= 8
      ? service.selectedDate
      : dates[0].value;
  });
  const [selectedTime, setSelectedTime] = useState(() =>
    service?.selectedTime || serviceSlots[0],
  );
  const [selectedPackage, setSelectedPackage] = useState(
    service?.selectedPackage ||
      service?.package ||
      (service?.name?.toLowerCase()?.includes("cleaning")
        ? "2 BHK · Standard Cleaning"
        : `${service?.category || "Standard"} · Doorstep Care`),
  );

  const [address, setAddress] = useState(
    user?.address || service?.location || service?.customerLocation || "Flat 402, Green Glen Heights, " + initialLocation,
  );
  const [coords, setCoords] = useState(() => {
    if (user?.latitude && user?.longitude) {
      return { lat: Number(user.latitude), lon: Number(user.longitude) };
    }
    return { lat: 28.6139, lon: 77.2090 };
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // Processing & Confirmation state (declared before useEffect)
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!socket || !confirmedOrder?.id) return undefined;
    joinRoom(`request_${confirmedOrder.id}`);
    const updateOrder = (update) => {
      if (update.id && update.id !== confirmedOrder.id) return;
      const statusLabels = { REQUESTED: "Searching for nearby professionals", AUTO_DISPATCHED: "Professionals notified", ACCEPTED: "Professional assigned", ON_THE_WAY: "Professional on the way", ARRIVED: "Professional arrived", IN_PROGRESS: "Service started", COMPLETED: "Service completed", CANCELLED: "Request cancelled" };
      setConfirmedOrder((current) => current ? { ...current, ...update, status: statusLabels[update.status] || current.status, dispatchMessage: update.message || current.dispatchMessage, technician: update.technician ? { ...current.technician, ...update.technician } : current.technician } : current);
    };
    socket.on("request_updated", updateOrder);
    return () => socket.off("request_updated", updateOrder);
  }, [socket, confirmedOrder?.id]);

  // Coupon state
  const initialValid = (initialPromoCode || service?.couponCode)
    ? validateCoupon(initialPromoCode || service?.couponCode)
    : null;
  const [couponAccordionOpen, setCouponAccordionOpen] = useState(false);
  const [promoCode, setPromoCode] = useState(initialPromoCode || service?.couponCode || "");
  const [promoApplied, setPromoApplied] = useState(Boolean(initialValid));
  const [appliedCouponData, setAppliedCouponData] = useState(initialValid);
  const [promoError, setPromoError] = useState("");

  // Payment method selection: 'card' | 'upi' | 'net_banking' | 'wallet' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Card details
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: user?.name || "",
    expiry: "",
    cvv: "",
    saveCard: true,
  });

  // Saved cards
  const [savedCards, setSavedCards] = useState([
    {
      id: "card-1",
      number: "•••• •••• •••• 4242",
      brand: "Visa",
      expiry: "08/28",
      name: user?.name || "Rahul Sharma",
      isDefault: true,
    },
    {
      id: "card-2",
      number: "•••• •••• •••• 8812",
      brand: "RuPay",
      expiry: "11/29",
      name: user?.name || "Rahul Sharma",
      isDefault: false,
    },
  ]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState("card-1");
  const [useSavedCard, setUseSavedCard] = useState(true);

  // UPI state
  const [upiApp, setUpiApp] = useState("gpay");
  const [customUpiId, setCustomUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifyMsg, setUpiVerifyMsg] = useState("");

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [otherBank, setOtherBank] = useState("");

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState("Paytm Wallet");

  // Cash on service eligible
  const isCashEligible = true;

  // Calculate discount & totals
  const calculateDiscount = () => {
    if (!promoApplied || !appliedCouponData) return 0;
    if (appliedCouponData.discountType === "percent") {
      return Math.round((basePrice * appliedCouponData.discountValue) / 100);
    }
    // Flat discount
    const flatVal =
      appliedCouponData.discountValue >= 50
        ? appliedCouponData.discountValue
        : appliedCouponData.discountValue * 20;
    return Math.min(basePrice, flatVal);
  };

  const discountAmount = calculateDiscount();
  const convenienceFee = 0; // ₹0
  const taxes = 0; // Included
  const totalAmount = Math.max(
    0,
    basePrice - discountAmount + convenienceFee + taxes,
  );

  // Card brand detection helper
  const detectCardBrand = (number) => {
    const clean = number.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "American Express";
    if (/^(60|65|81|82|508)/.test(clean) || /^35/.test(clean)) return "RuPay";
    return null;
  };

  const cardBrand = detectCardBrand(cardDetails.number);

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardDetails((prev) => ({ ...prev, number: formatted }));
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardDetails((prev) => ({ ...prev, expiry: value }));
  };

  // Apply promo
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = (codeToApply || promoCode).trim().toUpperCase();
    if (!targetCode) {
      setPromoError("Please enter a coupon code");
      return;
    }

    // Extended validation with popular Argent Your promos
    let result = validateCoupon(targetCode);
    if (!result) {
      if (targetCode === "ARGENT20") {
        result = {
          valid: true,
          code: "ARGENT20",
          discountType: "percent",
          discountValue: 20,
          label: "20% OFF",
          title: "Argent Special Discount",
        };
      } else if (targetCode === "FIRST200") {
        result = {
          valid: true,
          code: "FIRST200",
          discountType: "flat",
          discountValue: 200,
          label: "FLAT ₹200 OFF",
          title: "First Booking Welcome Deal",
        };
      } else if (targetCode === "WEEKEND30") {
        result = {
          valid: true,
          code: "WEEKEND30",
          discountType: "percent",
          discountValue: 30,
          label: "30% OFF",
          title: "Weekend Flash Sale",
        };
      }
    }

    if (result) {
      setPromoApplied(true);
      setAppliedCouponData(result);
      setPromoCode(targetCode);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setAppliedCouponData(null);
      setPromoError(
        "Invalid coupon. Try ARGENT20, FIRST200, CLEAN20, or WEEKEND30",
      );
    }
  };

  const handleRemoveCoupon = () => {
    setPromoApplied(false);
    setAppliedCouponData(null);
    setPromoCode("");
    setPromoError("");
  };

  // Verify UPI ID
  const handleVerifyUpi = () => {
    const trimmed = customUpiId.trim();
    if (!trimmed || !trimmed.includes("@") || trimmed.length < 5) {
      setUpiVerified(false);
      setUpiVerifyMsg("Please enter a valid UPI ID (e.g. name@okaxis)");
      return;
    }
    setUpiVerified(true);
    setUpiVerifyMsg("Verified: Valid UPI ID");
  };

  // Address Geolocation
  const detectAddressLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location detection is unavailable on your browser");
      return;
    }
    setIsDetectingLocation(true);
    setLocationStatus("Detecting GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `/api/location/reverse-geocode?lat=${lat}&lon=${lon}`,
          );
          const data = await res.json();
          if (data && (data.fullAddress || data.formattedAddress)) {
            setAddress(data.fullAddress || data.formattedAddress);
            setCoords({ lat, lon });
            setLocationStatus("Location detected successfully via GPS");
            setTimeout(() => setLocationStatus(""), 3000);
          }
        } catch (err) {
          console.warn("Geocoding failed:", err);
            setCoords({ lat, lon });
            setLocationStatus("GPS coordinates captured. Please enter your service address.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        setLocationStatus("Location permission was denied. Enable location or enter and select a service address before requesting service.");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const resolveManualAddress = async () => {
    if (coords || address.trim().length < 5) return;
    try {
      const response = await fetch(`/api/location/search?query=${encodeURIComponent(address.trim())}`);
      const match = (await response.json()).suggestions?.find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)));
      if (match) {
        setAddress(match.formattedAddress);
        setCoords({ lat: Number(match.lat), lon: Number(match.lon) });
        setLocationStatus("Service address matched. You can request a professional.");
      } else setLocationStatus("We could not map that address. Enable location or enter a more specific address.");
    } catch { setLocationStatus("We could not map that address. Enable location or enter a more specific address."); }
  };

  // Execute payment & create real order
  const handlePayNow = async () => {
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    const currentCoords = coords || (user?.latitude && user?.longitude ? { lat: Number(user.latitude), lon: Number(user.longitude) } : { lat: 28.6139, lon: 77.2090 });
    const currentAddress = (address && address.trim()) || user?.address || "Flat 402, Green Glen Heights, " + initialLocation;

    setIsProcessing(true);

    const paymentMethodLabel =
      paymentMethod === "upi"
        ? `UPI (${customUpiId ? customUpiId : upiApp.toUpperCase()})`
        : paymentMethod === "card"
          ? useSavedCard && savedCards.length > 0
            ? `Card (${savedCards.find((c) => c.id === selectedSavedCardId)?.brand || "Card"} Ending in 4242)`
            : `Credit/Debit Card (${cardBrand || "Card"})`
          : paymentMethod === "net_banking"
            ? `Net Banking (${otherBank || selectedBank})`
            : paymentMethod === "wallet"
              ? `Wallet (${selectedWallet})`
              : "Cash on Service";

    let createdRecord = null;

    try {
      const res = await api.post("/requests", {
        category: service?.category || "Home Cleaning",
        priority: "High",
        description: `Service booking for ${service?.name || "Home Service"} (${selectedPackage}) on ${selectedDate} (${selectedTime})`,
        address: currentAddress,
        latitude: currentCoords.lat,
        longitude: currentCoords.lon,
        service_name: service?.name || "Home Service",
        service_slug: service?.slug || "home-cleaning",
        service_image:
          service?.image ||
          FALLBACK_SERVICE_IMAGE,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        package_name: selectedPackage,
        price: `₹${basePrice}`,
        total_paid: `₹${totalAmount}`,
        payment_method: paymentMethodLabel,
      });
      createdRecord = res.data;
    } catch (err) {
      setIsProcessing(false);
      setLocationStatus(err.response?.data?.error || "We could not create the service request.");
      return;
    }

    setIsProcessing(false);
    const orderId = createdRecord.id;

    const orderData = {
        id: orderId,
        orderId: orderId,
        serviceName: createdRecord.serviceName || service?.name || "Home Service",
        category: createdRecord.category || service?.category || "Home Service",
        package: selectedPackage,
        image: createdRecord.image || service?.image || FALLBACK_SERVICE_IMAGE,
        slug: createdRecord.slug || service?.slug || "home-cleaning",
        scheduledDate: createdRecord.scheduledDate || selectedDate,
        scheduledTime: createdRecord.scheduledTime || selectedTime,
        address: createdRecord.address || currentAddress,
        price: createdRecord.price || `₹${basePrice}`,
        totalPaid: createdRecord.totalPaid || `₹${totalAmount}`,
        customerName: user?.name || "Valued Customer",
        paymentMethod: paymentMethodLabel,
        paymentMethodUsed: paymentMethodLabel,
        status: createdRecord.status || "Searching for nearby professionals",
        statusStep: createdRecord.statusStep || 1,
        technician: null,
        nearbyProfessionals: createdRecord.nearbyProfessionals || [],
        dispatchMessage: createdRecord.dispatchMessage || "Professionals in your area have been notified.",
        createdAt: new Date().toISOString(),
    };

    setConfirmedOrder(orderData);
    setIsConfirmed(true);
    try {
      sessionStorage.removeItem("argent_checkout_booking");
      localStorage.removeItem("argent_checkout_booking");
      sessionStorage.removeItem("argent_pending_booking");
      localStorage.removeItem("argent_pending_booking");
    } catch {}
    onOrderCreated?.(orderData);
  };

  const increaseOffer = async (amount) => {
    if (!confirmedOrder?.id) return;
    try {
      const response = await api.post(`/requests/${confirmedOrder.id}/increase-offer`, { offerAmount: amount });
      setConfirmedOrder((current) => ({ ...current, price: `₹${amount}`, status: "Searching for professional", dispatchMessage: response.data.dispatch?.success ? "Updated offer sent to nearby professionals." : "No available professional found within 15 km." }));
    } catch (error) {
      setConfirmedOrder((current) => ({ ...current, dispatchMessage: error.response?.data?.error || "Could not update the service offer." }));
    }
  };

  const cancelPendingRequest = async () => {
    if (!confirmedOrder?.id) return;
    try {
      await api.post(`/requests/${confirmedOrder.id}/cancel`);
      setConfirmedOrder((current) => ({ ...current, status: "Request cancelled", dispatchMessage: "Your request was cancelled." }));
    } catch {
      setConfirmedOrder((current) => ({ ...current, dispatchMessage: "Could not cancel the request. Please try again." }));
    }
  };

  // --- POST-PAYMENT: ORDER CONFIRMATION VIEW ---
  if (isConfirmed && confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-24 pt-6 sm:pt-8 md:pt-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl backdrop-blur-md">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-8 text-center text-white space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Booking Confirmed ✓
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Order ID:{" "}
                <strong className="text-white">{confirmedOrder.orderId}</strong>
              </p>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Service Card */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <img
                  src={confirmedOrder.image || FALLBACK_SERVICE_IMAGE}
                  alt={confirmedOrder.serviceName}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {confirmedOrder.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {confirmedOrder.package}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                    {confirmedOrder.serviceName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                      {confirmedOrder.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-700" />
                      {confirmedOrder.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Address */}
              <div className="rounded-2xl border border-slate-200/80 p-4 space-y-1.5 bg-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Service Address</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800">
                  {confirmedOrder.address}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="rounded-2xl border border-slate-200/80 p-4 space-y-2 bg-white">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-bold text-slate-900">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-slate-100 pt-2 text-slate-900">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-800 text-base font-black">
                    {confirmedOrder.totalPaid}
                  </span>
                </div>
              </div>

              {/* Live dispatch status. No placeholder professional is shown. */}
              {confirmedOrder.technician ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Assigned Professional
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified &
                    Vaccinated
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={confirmedOrder.technician.avatar}
                      alt={confirmedOrder.technician.name}
                      className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {confirmedOrder.technician.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ★ {confirmedOrder.technician.rating} (
                        {confirmedOrder.technician.reviews} reviews) ·{" "}
                        {confirmedOrder.technician.experience}
                      </p>
                    </div>
                  </div>
                </div>
              </div> : <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950"><RefreshCw className="h-4 w-4 animate-spin" /> Finding nearby professionals...</div>
                <p className="text-xs text-slate-600">{confirmedOrder.dispatchMessage || "Professionals notified. Waiting for acceptance."}</p>
                {confirmedOrder.nearbyProfessionals?.length > 0 ? <div className="space-y-2">{confirmedOrder.nearbyProfessionals.map((pro) => <div key={pro.id} className="flex items-center gap-3 rounded-xl bg-white/80 p-2.5 text-xs"><div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-800">{pro.avatar ? <img src={pro.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : pro.name?.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="font-bold text-slate-900 truncate">{pro.name}</p><p className="text-slate-500">{pro.category} · {pro.distanceKm} km · ★ {pro.rating}</p></div><div className="text-right text-slate-500"><p>Verified</p><p>~{pro.etaMinutes} min</p></div></div>)}</div> : <div className="space-y-2"><p className="rounded-xl bg-white/80 p-3 text-xs font-semibold text-slate-600">No professional accepted the request yet. You can wait, cancel, or increase your offer.</p><div className="flex flex-wrap gap-2">{[50, 100, 150].map((extra) => { const amount = Number(String(confirmedOrder.price).replace(/[^0-9.]/g, "")) + extra; return <button type="button" key={amount} onClick={() => increaseOffer(amount)} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-800">₹{amount}</button>; })}<button type="button" onClick={cancelPendingRequest} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700">Cancel request</button></div></div>}
              </div>}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onViewBookings}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-900 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View in My Bookings</span>
                </button>
                <button
                  type="button"
                  onClick={
                    onGoHome || onHome || (() => (window.location.href = "/"))
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN PAYMENT SCREEN ---
  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-28 sm:pb-32 md:pb-20 pt-4 sm:pt-6 md:pt-24 lg:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header with Back Navigation & SSL Guarantee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            {onHome && (
              <button
                type="button"
                onClick={onHome}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors mb-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Service Details</span>
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Payment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Complete your payment to confirm your booking
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-bold text-emerald-900 shrink-0 self-start sm:self-center">
            <Lock className="h-3.5 w-3.5 text-emerald-700" />
            <span>256-Bit SSL Encrypted & 100% Secure</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid / Single-Column Mobile */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Booking Summary + Payment Method Selection                   */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {/* 1. BOOKING SUMMARY CARD */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Booking Summary
                </h2>
                <span className="rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  Step 2 of 2
                </span>
              </div>

              {/* Service Details Preview */}
              <div className="flex gap-4 items-center">
                <img
                  src={
                    service?.image || FALLBACK_SERVICE_IMAGE
                  }
                  alt={service?.name || "Service"}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                      {service?.category || "Home Care"}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {service?.name || "Home Cleaning"}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {selectedPackage}
                  </p>
                  <p className="text-sm font-black text-emerald-900">
                    ₹{basePrice}
                  </p>
                </div>
              </div>

              {/* Slot Scheduling Options */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Service Date
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {serviceDates.map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          selectedDate === date.value
                            ? "border-emerald-700 bg-emerald-50/70 text-emerald-900 shadow-2xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Service Time Slot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const isToday = selectedDate === serviceDates[0]?.value;
                      if (!isToday) return serviceSlots;
                      const now = new Date();
                      const futureSlots = serviceSlots.filter((slot) => {
                        if (slot === service?.selectedTime) return true;
                        const match = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (!match) return true;
                        let hour = Number(match[1]) % 12;
                        if (match[3].toUpperCase() === "PM") hour += 12;
                        const start = new Date();
                        start.setHours(hour, Number(match[2]), 0, 0);
                        return start > now;
                      });
                      return futureSlots.length > 0 ? futureSlots : serviceSlots;
                    })().map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-2.5 rounded-xl border text-center text-[11px] font-semibold transition-all ${
                          selectedTime === slot
                            ? "border-emerald-700 bg-emerald-50/70 text-emerald-900 font-bold shadow-2xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Address with GPS Locator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Service Address
                    </label>
                    <button
                      type="button"
                      onClick={detectAddressLocation}
                      disabled={isDetectingLocation}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer disabled:opacity-60"
                      title="Fetch precise address via GPS"
                    >
                      <LocateFixed
                        className={`h-3 w-3 ${isDetectingLocation ? "animate-spin" : ""}`}
                      />
                      <span>
                        {isDetectingLocation
                          ? "Detecting..."
                          : "Use Current GPS"}
                      </span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="h-4 w-4 text-emerald-700 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={resolveManualAddress}
                      placeholder="Enter flat / house no., street, area, city"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                  {locationStatus && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                      {locationStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. PAYMENT METHOD SELECTION CARD */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Select Payment Method
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your preferred option. All transactions are 100% safe &
                  encrypted.
                </p>
              </div>

              {/* Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {[
                  {
                    id: "card",
                    label: "Card",
                    sub: "Debit/Credit",
                    icon: CreditCard,
                  },
                  {
                    id: "upi",
                    label: "UPI",
                    sub: "Instant Pay",
                    icon: Smartphone,
                  },
                  {
                    id: "net_banking",
                    label: "Net Banking",
                    sub: "All Banks",
                    icon: Building2,
                  },
                  {
                    id: "wallet",
                    label: "Wallet",
                    sub: "Paytm/Amazon",
                    icon: Wallet,
                  },
                  {
                    id: "cash",
                    label: "Cash",
                    sub: "On Service",
                    icon: Banknote,
                  },
                ].map((tab, idx) => {
                  const Icon = tab.icon;
                  const active = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id)}
                      className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer min-w-0 ${
                        idx === 4 ? "col-span-2 sm:col-span-1" : ""
                      } ${
                        active
                          ? "border-emerald-700 bg-emerald-50/50 text-emerald-950 shadow-sm ring-2 ring-emerald-700/10 font-bold"
                          : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50/70 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 mb-1.5 shrink-0 ${
                          active ? "text-emerald-700" : "text-slate-400"
                        }`}
                      />
                      <span className="text-xs truncate w-full">
                        {tab.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal truncate w-full">
                        {tab.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC PAYMENT METHOD DETAILS */}

              {/* METHOD 1: CREDIT / DEBIT CARD */}
              {paymentMethod === "card" && (
                <div className="space-y-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Credit / Debit Card
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Enter card details or select a saved card
                      </p>
                    </div>
                    {/* Supported Card Logos (Clean, non-overlapping responsive row) */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                      <div className="h-7 px-2.5 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <VisaLogo className="h-3.5" />
                      </div>
                      <div className="h-7 px-2.5 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <MastercardLogo className="h-4" />
                      </div>
                      <div className="h-7 px-2 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <RuPayLogo />
                      </div>
                      <div className="h-7 px-2 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <AmexLogo />
                      </div>
                    </div>
                  </div>

                  {/* Saved Cards Toggle */}
                  {savedCards.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Saved Cards</span>
                        {!useSavedCard && (
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(true)}
                            className="text-emerald-800 text-[11px] font-bold hover:underline cursor-pointer"
                          >
                            Use Saved Card
                          </button>
                        )}
                      </div>

                      {useSavedCard ? (
                        <div className="space-y-2">
                          {savedCards.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => setSelectedSavedCardId(c.id)}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                selectedSavedCardId === c.id
                                  ? "border-emerald-700 bg-emerald-50/40 ring-1 ring-emerald-700/20"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <CreditCard className="h-5 w-5 text-emerald-700 shrink-0" />
                                <div className="min-w-0 truncate">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {c.brand} {c.number}
                                  </p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    Expires {c.expiry} · {c.name}
                                  </p>
                                </div>
                              </div>
                              {selectedSavedCardId === c.id && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 ml-2" />
                              )}
                            </div>
                          ))}

                          {/* Keep "+ Enter New Card" properly aligned below the payment methods */}
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(false)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-50/50 hover:border-emerald-600 transition-colors cursor-pointer mt-2"
                          >
                            <Plus className="h-3.5 w-3.5 shrink-0" />
                            <span>+ Enter New Card</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* New Card Form */}
                  {(!useSavedCard || savedCards.length === 0) && (
                    <div className="space-y-3.5 text-xs min-w-0">
                      {savedCards.length > 0 && (
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <span className="font-bold text-slate-700 text-xs">
                            New Card Details
                          </span>
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(true)}
                            className="text-emerald-800 text-[11px] font-bold hover:underline cursor-pointer"
                          >
                            ← Back to Saved Cards
                          </button>
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700">
                            Card Number
                          </label>
                          {cardBrand && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {cardBrand}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <CreditCard className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
                          <input
                            type="text"
                            placeholder="xxxx xxxx xxxx xxxx"
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 outline-none focus:border-emerald-700 font-mono text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block font-bold text-slate-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name as printed on card"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700 text-xs bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 min-w-0">
                        <div className="min-w-0">
                          <label className="block font-bold text-slate-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700 font-mono text-xs bg-white"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="block font-bold text-slate-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            placeholder="3 or 4 digits"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              if (val.length <= 4) {
                                setCardDetails((prev) => ({
                                  ...prev,
                                  cvv: val,
                                }));
                              }
                            }}
                            maxLength={4}
                            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700 font-mono text-xs bg-white"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 pt-1 text-slate-600 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={cardDetails.saveCard}
                          onChange={(e) =>
                            setCardDetails((prev) => ({
                              ...prev,
                              saveCard: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700 shrink-0"
                        />
                        <span>
                          Save this card securely for faster payments in future
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Security Statement */}
                  <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>
                      100% secure payment with 256-bit encryption. Card details
                      are never stored on unauthorized servers.
                    </span>
                  </div>
                </div>
              )}

              {/* METHOD 2: UPI */}
              {paymentMethod === "upi" && (
                <div className="space-y-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Pay via UPI
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Pay with any installed UPI app or enter your UPI ID
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      <div className="h-7 px-2.5 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <UpiLogo />
                      </div>
                    </div>
                  </div>

                  {/* Installed Apps Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select UPI App
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "gpay", component: <GPayBadge /> },
                        { id: "phonepe", component: <PhonePeBadge /> },
                        { id: "paytm", component: <PaytmBadge /> },
                        { id: "bhim", component: <BhimBadge /> },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setUpiApp(app.id);
                            setCustomUpiId("");
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            upiApp === app.id && !customUpiId
                              ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700/20"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {app.component}
                          {upiApp === app.id && !customUpiId && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom UPI ID / VPA */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Or Enter Custom UPI ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. mobile@okhdfcbank or yourname@upi"
                        value={customUpiId}
                        onChange={(e) => {
                          setCustomUpiId(e.target.value);
                          setUpiVerified(false);
                          setUpiVerifyMsg("");
                        }}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                    {upiVerifyMsg && (
                      <p
                        className={`text-[11px] font-bold ${
                          upiVerified ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {upiVerifyMsg}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      A payment request prompt will be sent to your UPI app upon
                      clicking Pay.
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 3: NET BANKING */}
              {paymentMethod === "net_banking" && (
                <div className="space-y-5 border-t border-slate-100 pt-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Net Banking
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select your bank to pay directly from your bank account
                    </p>
                  </div>

                  {/* Popular Banks Grid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        "HDFC Bank",
                        "ICICI Bank",
                        "State Bank of India",
                        "Axis Bank",
                        "Kotak Mahindra",
                        "Punjab National Bank",
                      ].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank);
                            setOtherBank("");
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                            selectedBank === bank && !otherBank
                              ? "border-emerald-700 bg-emerald-50/50 font-bold text-emerald-950 ring-1 ring-emerald-700/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span>{bank}</span>
                          {selectedBank === bank && !otherBank && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown for All Other Banks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      All Other Supported Banks
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => setOtherBank(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-800 outline-none focus:border-emerald-700 bg-white"
                    >
                      <option value="">-- Select from other banks --</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Union Bank of India">
                        Union Bank of India
                      </option>
                      <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                      <option value="Yes Bank">Yes Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="Central Bank of India">
                        Central Bank of India
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* METHOD 4: WALLET */}
              {paymentMethod === "wallet" && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mobile Wallets
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Link and pay using your active mobile balance
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Paytm Wallet", desc: "Fast 1-click checkout" },
                      {
                        name: "Amazon Pay",
                        desc: "Use Amazon balance & cashback",
                      },
                      {
                        name: "Mobikwik",
                        desc: "Pay with Mobikwik balance or ZIP",
                      },
                      {
                        name: "PhonePe Wallet",
                        desc: "Direct wallet deduction",
                      },
                      {
                        name: "Airtel Payments Bank",
                        desc: "Airtel wallet balance",
                      },
                    ].map((w) => (
                      <div
                        key={w.name}
                        onClick={() => setSelectedWallet(w.name)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedWallet === w.name
                            ? "border-emerald-700 bg-emerald-50/40 ring-1 ring-emerald-700/20"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{w.desc}</p>
                        </div>
                        {selectedWallet === w.name && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* METHOD 5: CASH ON SERVICE */}
              {paymentMethod === "cash" && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Cash on Service
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Pay cash or scan QR upon service completion
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Eligible for this booking
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Banknote className="h-4 w-4 text-amber-700" />
                      Pay after 100% satisfaction
                    </p>
                    <p className="text-amber-900/90 leading-relaxed text-[11px]">
                      No advance payment needed. You can pay the service
                      professional in cash or ask them for a spot UPI QR code
                      once the service is completed to your satisfaction.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Coupon + Price Details + Pay Button + Security Badges       */}
          {/* ========================================================================= */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* 1. EXPANDABLE COUPON CODE ACCORDION */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <button
                type="button"
                onClick={() => setCouponAccordionOpen(!couponAccordionOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Have a coupon code?
                  </span>
                  {promoApplied && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Applied
                    </span>
                  )}
                </div>
                {couponAccordionOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Accordion Content */}
              {(couponAccordionOpen || promoApplied) && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  {!promoApplied ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs uppercase font-bold outline-none focus:border-emerald-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Suggestions Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Suggested Offers:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {["ARGENT20", "FIRST200", "CLEAN20", "WEEKEND30"].map(
                            (code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => handleApplyCoupon(code)}
                                className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-2 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                {code}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {promoError && (
                        <p className="text-[11px] font-bold text-rose-600">
                          {promoError}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700" />
                        <div>
                          <p className="font-bold">
                            Coupon {appliedCouponData?.code} Applied!
                          </p>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            Saved ₹{discountAmount} on your booking
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. PRICE DETAILS BREAKDOWN */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Price Details
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Service Amount</span>
                  <span className="font-bold text-slate-900">₹{basePrice}</span>
                </div>

                {promoApplied && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCouponData?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Safety & Doorstep Convenience Fee</span>
                  <span className="font-bold text-emerald-700">₹0 (FREE)</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes & GST (18%)</span>
                  <span className="font-bold text-slate-500">Included</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-black text-slate-950">
                  <span>Total Amount</span>
                  <span className="text-emerald-800 text-lg">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Unauthenticated Note */}
              {!user && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span className="font-medium text-[11px]">
                    Please sign in to place this booking.
                  </span>
                  <button
                    type="button"
                    onClick={onAuthRequired}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-950 text-white font-bold text-[11px] hover:bg-emerald-800 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-sm font-bold text-white shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {!user
                    ? `Sign In to Pay · ₹${totalAmount}`
                    : isProcessing
                      ? "Securing & Processing Payment..."
                      : paymentMethod === "cash"
                        ? `Confirm Booking · ₹${totalAmount} (Pay on Service)`
                        : `Pay ₹${totalAmount}`}
                </span>
              </button>

              {/* Security Badges & Trust Logos */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>100% Secure Payment</span>
                  <span>·</span>
                  <span>256-Bit SSL Encryption</span>
                </div>

                {/* All Supported Payment Brands Bar */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
                  <div className="h-7 px-2 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <VisaLogo className="h-3.5" />
                  </div>
                  <div className="h-7 px-2 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <MastercardLogo className="h-4" />
                  </div>
                  <div className="h-7 px-2 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <RuPayLogo />
                  </div>
                  <div className="h-7 px-2 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <AmexLogo />
                  </div>
                  <div className="h-7 px-2 py-0.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <UpiLogo />
                  </div>
                  <div className="h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs text-[10px] font-bold text-slate-700">
                    GPay
                  </div>
                  <div className="h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs text-[10px] font-bold text-slate-700">
                    PhonePe
                  </div>
                  <div className="h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white flex items-center justify-center shrink-0 shadow-2xs text-[10px] font-bold text-slate-700">
                    Paytm
                  </div>
                </div>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  Argent Your Guarantee: Free rework or refund if not 100%
                  satisfied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
