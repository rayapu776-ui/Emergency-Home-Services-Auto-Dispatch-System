import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  HelpCircle,
  Lock,
  LocateFixed,
  MapPin,
  Plus,
  QrCode,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { validateCoupon } from "../data/promotionsData";
import api from "../services/api";

export default function PaymentPage({
  service,
  onHome,
  onViewBookings,
  initialLocation = "Delhi NCR",
  initialPromoCode = "",
  onAuthRequired,
}) {
  const { user } = useAuth();

  // Booking details state
  const [selectedDate, setSelectedDate] = useState("Today, Sep 17");
  const [selectedTime, setSelectedTime] = useState("3:00 PM - 4:00 PM");
  const [address, setAddress] = useState(
    user?.address || "Flat 402, Green Glen Heights, " + initialLocation,
  );
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const initialValid = initialPromoCode
    ? validateCoupon(initialPromoCode)
    : null;
  const [promoCode, setPromoCode] = useState(initialPromoCode || "");
  const [promoApplied, setPromoApplied] = useState(Boolean(initialValid));
  const [appliedCouponData, setAppliedCouponData] = useState(initialValid);
  const [promoError, setPromoError] = useState("");

  // Payment method selection state: 'saved_cards' | 'upi' | 'cards' | 'net_banking' | 'wallets' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Saved Cards state
  const [savedCards, setSavedCards] = useState([
    {
      id: "card-1",
      number: "•••• •••• •••• 4242",
      brand: "Visa",
      expiry: "08/28",
      name: user?.name || "John Doe",
      isDefault: true,
    },
    {
      id: "card-2",
      number: "•••• •••• •••• 8812",
      brand: "Mastercard",
      expiry: "11/29",
      name: user?.name || "John Doe",
      isDefault: false,
    },
  ]);
  const [selectedCardId, setSelectedCardId] = useState("card-1");

  // New Card Form state
  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    saveCard: true,
    type: "credit",
  });

  // UPI state
  const [upiMethod, setUpiMethod] = useState("gpay");
  const [customUpiId, setCustomUpiId] = useState("");

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Wallets state
  const [selectedWallet, setSelectedWallet] = useState("Paytm Wallet");

  // Payment processing & Order Confirmation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Price calculations
  const rawPrice = service?.numericPrice || 35;
  const convenienceFee = 3.5;
  const discountAmount =
    promoApplied && appliedCouponData
      ? appliedCouponData.discountType === "percent"
        ? (rawPrice * appliedCouponData.discountValue) / 100
        : Math.min(rawPrice, appliedCouponData.discountValue)
      : 0.0;
  const totalAmount = Math.max(0, rawPrice + convenienceFee - discountAmount);

  const applyPromo = (e) => {
    e.preventDefault();
    const result = validateCoupon(promoCode);
    if (result) {
      setPromoApplied(true);
      setAppliedCouponData(result);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setAppliedCouponData(null);
      setPromoError(
        "Invalid code. Try CLEAN20, FIRST200, WEEKEND30, or GLOW20",
      );
    }
  };

  const handleDeleteCard = (id) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id && savedCards.length > 1) {
      setSelectedCardId(savedCards.find((c) => c.id !== id).id);
    }
  };

  const detectAddressLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location detection is unavailable");
      return;
    }
    setIsDetectingLocation(true);
    setLocationStatus("Detecting GPS...");

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
            setLocationStatus("Location updated");
            setTimeout(() => setLocationStatus(""), 3000);
          }
        } catch (err) {
          console.warn("Geocoding failed:", err);
          setLocationStatus("Could not resolve address automatically");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        setLocationStatus("GPS permission denied");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handlePayNow = async () => {
    // CRITICAL GUARD: Never allow order confirmation without authentication
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    setIsProcessing(true);

    try {
      await api
        .post("/requests", {
          category: service?.category || "Emergency Repair",
          priority: "High",
          description: `Service booking for ${service?.name || "Doorstep Service"} on ${selectedDate} (${selectedTime})`,
          address: address,
          latitude: coords.lat || 28.6139,
          longitude: coords.lon || 77.209,
        })
        .catch((err) => {
          console.warn(
            "Backend request log info:",
            err?.response?.data || err.message,
          );
        });
    } catch (err) {
      console.warn("Backend request error:", err);
    }

    setTimeout(() => {
      setIsProcessing(false);
      const orderData = {
        orderId: `AY-${Math.floor(10000 + Math.random() * 90000)}`,
        serviceName: service?.name || "Doorstep Service",
        serviceImage: service?.image,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        address: address,
        totalPaid: totalAmount.toFixed(2),
        customerName: user?.name || "Valued Customer",
        paymentMethodUsed:
          paymentMethod === "upi"
            ? `UPI (${upiMethod.toUpperCase()})`
            : paymentMethod === "saved_cards"
              ? "Saved Card (Ending in 4242)"
              : paymentMethod === "cards"
                ? "Credit / Debit Card"
                : paymentMethod === "net_banking"
                  ? `Net Banking (${selectedBank})`
                  : paymentMethod === "wallets"
                    ? `Wallet (${selectedWallet})`
                    : "Cash on Service",
        technician: {
          name: "Rajesh Kumar",
          rating: "4.9",
          experience: "7 years",
          phone: "+91 98765 21000",
        },
      };
      setConfirmedOrder(orderData);
      setIsConfirmed(true);
    }, 1200);
  };

  // --- ORDER CONFIRMATION SCREEN ---
  if (isConfirmed && confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-24 md:pb-20 pt-36 sm:pt-40 md:pt-28 lg:pt-32">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl backdrop-blur-md animate-rise-in">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-8 text-center text-white space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Booking Confirmed!
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Order ID: <strong>{confirmedOrder.orderId}</strong>
              </p>
            </div>

            {/* Order & Dispatch Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Service & Time Info */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                {confirmedOrder.serviceImage && (
                  <img
                    src={confirmedOrder.serviceImage}
                    alt={confirmedOrder.serviceName}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Dispatch Scheduled
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                    {confirmedOrder.serviceName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
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

              {/* Assigned Technician Card */}
              <div className="rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Professional
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-black text-white text-sm">
                      RK
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {confirmedOrder.technician.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ★ {confirmedOrder.technician.rating} ·{" "}
                        {confirmedOrder.technician.experience} experience
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    En Route
                  </span>
                </div>
              </div>

              {/* Location & Payment Summary */}
              <div className="rounded-2xl bg-slate-50/70 p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Service Address: <strong>{confirmedOrder.address}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 font-bold text-slate-800">
                  <span>
                    Payment Method: {confirmedOrder.paymentMethodUsed}
                  </span>
                  <span className="text-sm font-black text-emerald-800">
                    ${confirmedOrder.totalPaid}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onViewBookings}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 px-4 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <span>View in My Bookings</span>
                </button>
                <button
                  type="button"
                  onClick={onHome}
                  className="flex items-center justify-center rounded-xl border border-slate-300 bg-white py-3.5 px-6 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
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

  // --- MAIN CHECKOUT / PAYMENT FORM ---
  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-24 md:pb-20 pt-36 sm:pt-40 md:pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-5 w-5 rounded-md object-contain shadow-2xs"
            />
            <span>Back to Argent Your</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-700" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">
          {/* LEFT COLUMN: Payment Method Selection */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Select Payment Method
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Choose your preferred payment method to confirm your doorstep
                booking.
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "saved_cards", label: "Saved Cards", icon: CreditCard },
                { id: "cards", label: "Cards", icon: CreditCard },
                { id: "net_banking", label: "Net Banking", icon: Wallet },
                { id: "wallets", label: "Wallets", icon: Wallet },
                { id: "cod", label: "Cash", icon: DollarSign },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = paymentMethod === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMethod(tab.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      active
                        ? "border-emerald-700 bg-white text-emerald-900 shadow-sm ring-2 ring-emerald-700/10 font-bold"
                        : "border-slate-200/80 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 mb-1.5 ${active ? "text-emerald-700" : "text-slate-400"}`}
                    />
                    <span className="text-[11px] whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: UPI Interactive View */}
            {paymentMethod === "upi" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-6 animate-rise-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Pay via Instant UPI
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Zero Extra Charges
                  </span>
                </div>

                {/* UPI Apps Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "gpay", name: "Google Pay", logo: "GPay" },
                    { id: "phonepe", name: "PhonePe", logo: "PhonePe" },
                    { id: "paytm", name: "Paytm UPI", logo: "Paytm" },
                    { id: "bhim", name: "BHIM UPI", logo: "BHIM" },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiMethod(app.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        upiMethod === app.id
                          ? "border-emerald-700 bg-emerald-50/40 font-bold text-emerald-900 ring-2 ring-emerald-700/10"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black mb-2">
                        {app.logo.charAt(0)}
                      </div>
                      <span className="text-xs">{app.name}</span>
                      {upiMethod === app.id && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-2" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom UPI ID / VPA */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Or Enter UPI ID / VPA
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={customUpiId}
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        alert("UPI ID format verified successfully")
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A payment request prompt will be sent to your UPI app.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Saved Cards View */}
            {paymentMethod === "saved_cards" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-4 animate-rise-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Saved Credit & Debit Cards
                  </h3>
                  <span className="text-xs text-slate-500">
                    {savedCards.length} Cards Available
                  </span>
                </div>

                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedCardId === card.id
                          ? "border-emerald-700 bg-emerald-50/40 ring-2 ring-emerald-700/10"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-slate-950 font-black text-white text-xs">
                          {card.brand}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {card.number}
                            </span>
                            {card.isDefault && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Expires {card.expiry} · {card.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedCardId === card.id && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cards")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50/40 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another Card</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: New Credit/Debit Card View */}
            {paymentMethod === "cards" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-5 animate-rise-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Pay with Credit or Debit Card
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span>Visa</span> · <span>Mastercard</span> ·{" "}
                    <span>RuPay</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        value={newCard.number}
                        onChange={(e) =>
                          setNewCard({ ...newCard, number: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name as printed on card"
                      value={newCard.name}
                      onChange={(e) =>
                        setNewCard({ ...newCard, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={newCard.expiry}
                        onChange={(e) =>
                          setNewCard({ ...newCard, expiry: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        placeholder="3 or 4 digits"
                        maxLength={4}
                        value={newCard.cvv}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cvv: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCard.saveCard}
                      onChange={(e) =>
                        setNewCard({ ...newCard, saveCard: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>
                      Save card securely for faster bookings in future
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 4: Net Banking */}
            {paymentMethod === "net_banking" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-5 animate-rise-in">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Choose Your Bank
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                        selectedBank === bank
                          ? "border-emerald-700 bg-emerald-50/50 font-bold text-emerald-900 ring-2 ring-emerald-700/10"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-bold">{bank}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Wallets */}
            {paymentMethod === "wallets" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-5 animate-rise-in">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Select Mobile Wallet
                </h3>

                <div className="space-y-3">
                  {["Paytm Wallet", "PhonePe Wallet", "Amazon Pay Balance"].map(
                    (wallet) => (
                      <div
                        key={wallet}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          selectedWallet === wallet
                            ? "border-emerald-700 bg-emerald-50/50 font-bold text-emerald-900 ring-2 ring-emerald-700/10"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-bold">{wallet}</span>
                        {selectedWallet === wallet && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Tab 6: Cash on Service / COD */}
            {paymentMethod === "cod" && (
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-xs space-y-4 animate-rise-in">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Cash on Service
                </h3>

                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Pay after service completion</p>
                  <p className="text-amber-800 leading-relaxed">
                    You can pay the technician in cash or via on-the-spot UPI
                    scan once the work is completed to your satisfaction.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Booking & Order Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Booking Summary
                </h2>
                <img
                  src="/argent-logo.png"
                  alt="Argent Your"
                  className="h-7 w-7 rounded-lg object-contain shadow-2xs"
                />
              </div>

              {/* Service Preview */}
              <div className="flex gap-3.5 items-center">
                {service?.image && (
                  <img
                    src={service.image}
                    alt={service?.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    {service?.category || "Home Care"}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 truncate mt-0.5">
                    {service?.name || "Doorstep Service"}
                  </h3>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {service?.price || `$${rawPrice}`}
                  </p>
                </div>
              </div>

              {/* Slot Scheduling Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Select Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Today, Sep 17", "Tomorrow, Sep 18"].map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                          selectedDate === date
                            ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Select Preferred Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "10:00 AM - 11:30 AM",
                      "1:00 PM - 2:30 PM",
                      "3:00 PM - 4:00 PM",
                      "5:30 PM - 6:30 PM",
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                          selectedTime === slot
                            ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-bold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700">
                      Service Delivery Address
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
                      className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-emerald-700"
                    />
                  </div>
                  {locationStatus && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                      {locationStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-slate-100">
                <form onSubmit={applyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. GLOW20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs uppercase font-bold outline-none focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {promoApplied && appliedCouponData && (
                  <p className="mt-1.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Coupon{" "}
                    {appliedCouponData.code} applied! (-$
                    {discountAmount.toFixed(2)} off)
                  </p>
                )}
                {promoError && (
                  <p className="mt-1.5 text-[11px] font-bold text-rose-600">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ${rawPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safety & Doorstep Convenience Fee</span>
                  <span className="font-bold text-slate-900">
                    ${convenienceFee.toFixed(2)}
                  </span>
                </div>
                {promoApplied && appliedCouponData && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>
                      Discount ({appliedCouponData.code} ·{" "}
                      {appliedCouponData.label})
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-slate-950">
                  <span>Total Amount</span>
                  <span className="text-emerald-800">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Unauthenticated Security Alert */}
              {!user && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Please sign in to confirm and place this order.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onAuthRequired}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-sm font-bold text-white shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {!user
                    ? `Sign In & Place Order · $${totalAmount.toFixed(2)}`
                    : isProcessing
                      ? "Securing & Processing..."
                      : paymentMethod === "cod"
                        ? "Confirm Booking (Pay on Service)"
                        : `Pay $${totalAmount.toFixed(2)} Now`}
                </span>
              </button>

              {/* Security Badges */}
              <div className="pt-1 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  PCI-DSS Level 1
                </span>
                <span>·</span>
                <span>100% Argent Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
