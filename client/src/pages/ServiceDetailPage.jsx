import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Heart,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  getPersonalizedRecommendations,
  getServiceGallery,
} from "../data/servicesData";

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85";

export default function ServiceDetailPage({
  service,
  onHome,
  onBookNow,
  onAddToCart,
  onSelectRecommendation,
}) {
  const gallery = getServiceGallery(service);
  const [selectedImage, setSelectedImage] = useState(
    service?.image || gallery[0],
  );
  const [activeFaq, setActiveFaq] = useState(null);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Interactive booking date chips
  const dateSlots = Array.from({ length: 4 }, (_, index) => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    value.setDate(value.getDate() + index);
    return {
      id: value.toISOString().slice(0, 10),
      label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : `Day ${index + 1}`,
      date: new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(value),
    };
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Interactive booking time slot chips
  const timeSlots = [
    "09:00 AM - 10:30 AM",
    "12:00 PM - 01:30 PM",
    "03:30 PM - 05:00 PM",
    "06:00 PM - 07:30 PM",
  ];
  const [selectedTime, setSelectedTime] = useState(timeSlots[1]);

  // Update image when service changes
  useEffect(() => {
    if (service) {
      setSelectedImage(service.image || gallery[0]);
    }
  }, [service]);

  // Derive intelligent recommendations based on selected service
  const recommendations = getPersonalizedRecommendations(service, 4);

  const handleAdd = () => {
    onAddToCart?.({
      ...service,
      selectedDate: dateSlots.find((d) => d.id === selectedDate)?.id,
      selectedTime,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBook = () => {
    const chosenDateObj = dateSlots.find((d) => d.id === selectedDate);
    onBookNow?.(
      {
        ...service,
        selectedDate: chosenDateObj?.id,
        selectedTime,
      },
      {
        scheduledDate: chosenDateObj?.id,
        scheduledTime: selectedTime,
      },
    );
  };

  const handleCopyCoupon = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  // Default reviews
  const defaultReviews = [
    {
      name: "Aditi Sharma",
      rating: 5,
      date: "2 days ago",
      comment:
        "Remarkable doorstep service! The professional arrived right on time, fully equipped, verified ID, and very courteous. The quality is truly premium.",
    },
    {
      name: "Rohit Malhotra",
      rating: 5,
      date: "Last week",
      comment:
        "Extremely hassle-free booking. Professional carried all clean tools and single-use kits. Mess-free cleanup at the end was impressive.",
    },
    {
      name: "Kavita Reddy",
      rating: 4.8,
      date: "2 weeks ago",
      comment:
        "Loved how smooth and clean the whole process was. Transparent pricing with no hidden surprises. Highly recommend Argent Your!",
    },
  ];

  const defaultFaqs = [
    {
      q: "How are Argent Your service professionals vetted?",
      a: "Every professional undergoes 3 levels of background verification, police verification, hands-on technical testing, and Argent hospitality hygiene training.",
    },
    {
      q: "What if I need to reschedule or cancel?",
      a: "You can reschedule or cancel for free up to 2 hours before your scheduled appointment slot directly from your account profile without any fee.",
    },
    {
      q: "Is there any warranty on the service performed?",
      a: "Yes! All Argent Your doorstep services come with a standard 30-day post-service guarantee. If any issue arises, we provide a free revisit.",
    },
    {
      q: "Are prices all-inclusive?",
      a: "Yes. The price you see includes service charges, tools, and applicable taxes. If replacement parts or consumables are needed, you are shown upfront rates before proceeding.",
    },
  ];

  const faqs =
    service?.faqs && service.faqs.length > 0 ? service.faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-28 sm:pb-32 md:pb-20 pt-4 sm:pt-6 md:pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Section: Interactive Multi-Photo Gallery & Service Specs */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* Left Column: Interactive Multi-Photo Gallery */}
          <div className="space-y-3.5">
            {/* Main Featured Photo */}
            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-md backdrop-blur-md">
              <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={selectedImage || FALLBACK_SERVICE_IMAGE}
                  alt={service?.name}
                  className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                />
                <span className="absolute top-4 left-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow-sm">
                  {service?.category || "Doorstep Service"}
                </span>
                <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm backdrop-blur-sm flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{service?.rating || "4.9"}</span>
                  <span className="text-slate-500 font-normal">
                    ({service?.reviews || "2.8k"} reviews)
                  </span>
                </span>
              </div>
            </div>

            {/* 4 Interactive Thumbnail Preview Buttons */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => {
                const isActive = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-18 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-102 shadow-sm"
                        : "border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={imgUrl || FALLBACK_SERVICE_IMAGE}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                    />
                    {isActive && (
                      <span className="absolute inset-0 bg-emerald-600/15" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 font-medium pl-1">
              Click any photo thumbnail to inspect details & equipment
            </p>
          </div>

          {/* Right Column: Service Information, Slot Picker, & Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">
                  {service?.targetAudience === "men"
                    ? "Men's Specialized Grooming"
                    : service?.targetAudience === "women"
                      ? "Women's Beauty & Wellness"
                      : "Doorstep Home Maintenance"}
                </span>
                {service?.tags?.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="display-font mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
                {service?.name}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {service?.description ||
                  "A thoughtful, professional service delivered right at your doorstep by trusted, background-verified Argent Your experts."}
              </p>
            </div>

            {/* Quick Specs: Duration, Availability, Transparent Price */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Duration</span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {service?.duration || "45 - 60 mins"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Availability</span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {service?.availability ? "Today / Same Day" : "Same Day"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 backdrop-blur-sm col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-500 font-medium">
                  Transparent Price
                </div>
                <p className="text-base font-black text-emerald-800 mt-0.5">
                  {service?.price || "From ₹749"}
                </p>
              </div>
            </div>

            {/* Verified Professional Trust Card */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {service?.provider || "Argent Your Certified Experts"}
                  </span>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
                    Verified
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-normal">
                  Background checked, police verified, and trained under Argent
                  safety & hygiene protocols.
                </p>
              </div>
            </div>

            {/* Serviceability Live Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 rounded-xl bg-slate-100/80 px-3.5 py-2.5">
              <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                Available at <strong>Sector 62, Noida & Delhi NCR</strong> · Pro
                ready in ~30 mins
              </span>
            </div>

            {/* Promotional Coupon Chip */}
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span>Use coupon</span>
                    <span className="rounded-md bg-white px-2 py-0.5 font-black text-emerald-800 border border-emerald-300">
                      ARGENT20
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Flat 20% off on your doorstep booking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCoupon("ARGENT20")}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                {copiedCoupon ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Select Date Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Preferred Date
              </label>
              <div className="grid grid-cols-4 gap-2">
                {dateSlots.map((d) => {
                  const isSelected = selectedDate === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDate(d.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-1 border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold">{d.label}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {d.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Time Slot Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl py-2.5 px-3 text-xs font-bold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Book Now & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleBook}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-800 hover:shadow-lg cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-4 px-6 text-sm font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-800" />
                <span>{addedAnimation ? "Added to Cart!" : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: What's Included & What's Not Included */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* What's Included */}
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-bold text-slate-900">
                What's Included
              </h2>
            </div>
            <div className="space-y-2.5">
              {(
                service?.whatsIncluded || [
                  "Comprehensive diagnostic assessment",
                  "Sanitized tools & eco-friendly materials",
                  "Mess-free post-service cleanup",
                  "30-day post-service warranty guarantee",
                ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs font-semibold text-slate-800 leading-relaxed"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Not Included */}
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2.5">
              <XCircle className="h-5 w-5 text-rose-600" />
              <h2 className="text-xl font-bold text-slate-900">
                What's Not Included
              </h2>
            </div>
            <div className="space-y-2.5">
              {(
                service?.whatsNotIncluded || [
                  "Major replacement spare parts (quoted upfront if required)",
                  "Chemical treatments outside of package scope",
                  "Demolition or structural masonry work",
                ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-rose-100/60 bg-rose-50/40 p-3.5 text-xs font-semibold text-slate-800 leading-relaxed"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-[11px] font-black mt-0.5">
                    ✕
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Suitable For & Important Guidelines */}
        {(service?.suitableFor || service?.importantDetails) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Suitable For */}
            {service?.suitableFor && (
              <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Users className="h-4 w-4" />
                  <span>Recommended Audience</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Who is this service suitable for?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.suitableFor}
                </p>
              </div>
            )}

            {/* Important Guidelines */}
            {service?.importantDetails && (
              <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Important Instructions & Preparation</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Before the professional arrives
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {service.importantDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-800">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Section: Customer Reviews */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real feedback from verified homeowners and residents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-black text-slate-900">
                {service?.rating || "4.9"} out of 5
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {defaultReviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-3 w-3 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Frequently Asked Questions */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-5">
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-emerald-700 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 pl-1 animate-rise-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Intelligent Personalized Recommendations */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Personalized Suggestions</span>
              </div>
              <h2 className="display-font mt-1 text-2xl sm:text-3xl font-bold text-slate-950">
                Recommended for You
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {service?.targetAudience === "men"
                  ? "Carefully matched grooming & care services tailored for men"
                  : service?.targetAudience === "women"
                    ? "Carefully matched beauty, wellness & spa services for women"
                    : "Popular complementary doorstep & lifestyle maintenance services"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((item) => (
              <div
                key={item.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md hover:border-emerald-700/30 transition-all"
              >
                <div>
                  <div
                    onClick={() => onSelectRecommendation?.(item)}
                    className="cursor-pointer overflow-hidden aspect-[16/10] bg-slate-100 relative"
                  >
                    <img
                      src={item.image || FALLBACK_SERVICE_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => onSelectRecommendation?.(item)}
                      className="cursor-pointer font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({item.reviews})
                      </span>
                    </div>
                    <p className="text-xs font-black text-emerald-800">
                      {item.price}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRecommendation?.(item)}
                    className="flex-1 rounded-xl bg-slate-950 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 text-center cursor-pointer"
                  >
                    View / Book
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart?.(item)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-colors cursor-pointer"
                    title="Add to cart"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
