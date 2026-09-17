import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { getPersonalizedRecommendations } from "../data/servicesData";

export default function ServiceDetailPage({
  service,
  onHome,
  onBookNow,
  onAddToCart,
  onSelectRecommendation,
}) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Derive intelligent recommendations based on selected service
  const recommendations = getPersonalizedRecommendations(service, 4);

  const handleAdd = () => {
    onAddToCart?.(service);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // Demo reviews if service doesn't have custom ones
  const defaultReviews = [
    {
      name: "Aditi S.",
      rating: 5,
      date: "2 days ago",
      comment:
        "Remarkable service! The professional arrived right on time, fully equipped and very courteous. The attention to detail is noticeable.",
    },
    {
      name: "Rohit M.",
      rating: 5,
      date: "Last week",
      comment:
        "Extremely hassle-free booking. Professional carried all clean tools and single-use kits. Worth every rupee!",
    },
    {
      name: "Kavita R.",
      rating: 4.8,
      date: "2 weeks ago",
      comment:
        "Loved how smooth and clean the whole process was. Transparent pricing with no hidden charges. Highly recommended!",
    },
  ];

  const defaultFaqs = [
    {
      q: "How are Argent Your service professionals vetted?",
      a: "Every professional goes through 3 levels of background verification, criminal record checks, hands-on skill evaluations, and safety compliance training.",
    },
    {
      q: "What if I need to reschedule or cancel?",
      a: "You can reschedule or cancel for free up to 2 hours before your scheduled appointment slot directly from your account profile.",
    },
    {
      q: "Is there any warranty on the service performed?",
      a: "Yes! All Argent Your doorstep services come with a standard 30-day post-service guarantee. If any issue arises, we provide a free revisit.",
    },
  ];

  const faqs =
    service?.faqs && service.faqs.length > 0 ? service.faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Back Button */}
        <div>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-5 w-5 rounded-md object-contain shadow-2xs"
            />
            <span>Back to Argent Your Home</span>
          </button>
        </div>

        {/* Hero Section: Large Image & Service Information */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Large Service Image Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-md">
            <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden">
              <img
                src={service?.image}
                alt={service?.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <span className="absolute top-4 left-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {service?.category}
              </span>
              <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm backdrop-blur-sm">
                ★ {service?.rating || "4.9"} ({service?.reviews || "2.8k"}{" "}
                reviews)
              </span>
            </div>
          </div>

          {/* Service Details & Primary Action Box */}
          <div className="space-y-6">
            <div>
              <span className="eyebrow">
                {service?.targetAudience === "men"
                  ? "Men's Specialized Grooming"
                  : service?.targetAudience === "women"
                    ? "Women's Beauty & Wellness"
                    : "Doorstep Home Care"}
              </span>
              <h1 className="display-font mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
                {service?.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
                {service?.description ||
                  "A thoughtful, professional service delivered at your doorstep by a trusted, background-verified Argent Your professional."}
              </p>
            </div>

            {/* Quick Metrics: Duration, Availability, Pricing */}
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
                  {service?.price || "From $29"}
                </p>
              </div>
            </div>

            {/* Verified Professional Trust Card */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {service?.provider || "Argent Your Certified Experts"}
                  </span>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.2 text-[10px] font-extrabold text-emerald-900">
                    Verified
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-normal">
                  Background checked, verified ID, and trained under Argent
                  safety standards.
                </p>
              </div>
            </div>

            {/* Action Buttons: Book Now & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => onBookNow?.(service)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-800 hover:shadow-lg"
              >
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-4 px-6 text-sm font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-800" />
                <span>{addedAnimation ? "Added to Bag!" : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: What's Included */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">
              What's Included
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              service?.whatsIncluded || [
                "Comprehensive diagnostic assessment",
                "Sanitized tools & eco-friendly materials",
                "Mess-free post-service cleanup",
                "30-day post-service warranty guarantee",
                "Transparent upfront quotation",
              ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs font-semibold text-slate-800 leading-relaxed"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

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
                    className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors"
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
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                    className="flex-1 rounded-xl bg-slate-950 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 text-center"
                  >
                    View / Book
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart?.(item)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-colors"
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
