import React, { useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Check,
  Clock,
  Copy,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { allServicesCatalog } from "../data/servicesData";

const ACTIVE_COUPONS = [
  {
    code: "ARGENT50",
    discount: "Flat ₹200 OFF",
    title: "Sitewide Welcome Savings",
    description:
      "Get ₹200 off on all doorstep services with a cart value of ₹1,499 or more.",
    minOrder: "₹1,499",
    expiry: "Valid till end of month",
    badge: "Most Popular",
    color: "from-emerald-900 to-emerald-950",
    serviceSlug: "home-refresh-clean",
  },
  {
    code: "CLEAN20",
    discount: "20% OFF",
    title: "Deep Sanitization Special",
    description:
      "Enjoy 20% discount on complete home deep cleaning, kitchen & bathroom packages.",
    minOrder: "₹999",
    expiry: "Limited slots today",
    badge: "Trending",
    color: "from-teal-900 to-slate-950",
    serviceSlug: "deep-home-cleaning",
  },
  {
    code: "FIRSTFREE",
    discount: "FREE Diagnostic",
    title: "First Doorstep Inspection Free",
    description:
      "Zero diagnostic fee on your very first emergency plumbing, electrical, or appliance service.",
    minOrder: "₹0",
    expiry: "New customers only",
    badge: "Zero Risk",
    color: "from-indigo-950 to-slate-950",
    serviceSlug: "ac-foam-jet-service",
  },
  {
    code: "FESTIVE25",
    discount: "25% OFF",
    title: "Salon & Spa Care Bundle",
    description:
      "Pamper yourself with 25% discount on all at-home salon, waxing, facial, and massage therapies.",
    minOrder: "₹1199",
    expiry: "Valid this week",
    badge: "Self-Care",
    color: "from-rose-950 to-slate-950",
    serviceSlug: "at-home-salon-glow",
  },
  {
    code: "EMERGENCY10",
    discount: "Instant ₹200 OFF",
    title: "Priority Rapid Dispatch",
    description:
      "Direct ₹200 deduction applied automatically on priority electrical and plumbing repairs.",
    minOrder: "₹649",
    expiry: "24/7 Support",
    badge: "Emergency",
    color: "from-amber-950 to-slate-950",
    serviceSlug: "electrician-visit",
  },
];

const COMBO_PACKAGES = [
  {
    id: "combo-1",
    title: "Summer Fresh Comfort Package",
    services: "AC Foam-Jet Cleaning + Living Room Refresh Clean",
    originalPrice: "₹1,499",
    comboPrice: "₹1199",
    savings: "Save ₹300",
    image:
      "https://images.unsplash.com/photo-1631545806609-1e3b0a4d7a87?auto=format&fit=crop&w=600&q=85",
    coupon: "ARGENT50",
    serviceSlug: "ac-foam-jet-service",
  },
  {
    id: "combo-2",
    title: "Total Radiance Glow Duo",
    services: "Power Glow Cleanup + Crystal Rose Pedicure",
    originalPrice: "₹1,399",
    comboPrice: "₹999",
    savings: "Save ₹400",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=85",
    coupon: "FESTIVE25",
    serviceSlug: "at-home-salon-glow",
  },
  {
    id: "combo-3",
    title: "Safe Home Electrical & Plumbing Health Check",
    services: "Master Fuse & Earthing Check + Tap Leakage & Trap Inspection",
    originalPrice: "₹999",
    comboPrice: "₹749",
    savings: "Save ₹250",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=85",
    coupon: "EMERGENCY10",
    serviceSlug: "electrician-visit",
  },
];

export default function OffersPage({ onHome, onNavigate, onBookWithCoupon }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyAndBook = (coupon) => {
    const targetService =
      allServicesCatalog.find((s) => s.slug === coupon.serviceSlug) ||
      allServicesCatalog[0];
    onBookWithCoupon?.(targetService, coupon.code);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1613] via-[#102a20] to-[#0b1411] text-white p-6 sm:p-8 lg:p-12 shadow-xl mb-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 mb-3">
            <Flame className="h-3.5 w-3.5" />
            <span>Limited-Time Member Privileges</span>
          </div>

          <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Exclusive Deals & Promo Codes
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Copy active promotional coupons to save on certified home cleaning,
            appliance repairs, salon sessions, and doorstep services.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" /> Instant Discount
              at Checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Quality
              Guaranteed
            </span>
          </div>
        </div>

        {/* Decorative Badge Icon */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none hidden md:block">
          <BadgePercent className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Coupons Section */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Verified & Active
            </p>
            <h2 className="display-font text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              Doorstep Service Coupons
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ACTIVE_COUPONS.map((item) => (
            <div
              key={item.code}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Tag className="h-3 w-3" /> {item.badge}
                </span>
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.expiry}
                </span>
              </div>

              {/* Title and Discount */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {item.discount}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Min. order:{" "}
                  <strong className="text-slate-700">{item.minOrder}</strong>
                </p>
              </div>

              {/* Coupon Box & Action Buttons */}
              <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(item.code)}
                  className="group flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/60 px-3 py-2 text-xs font-black text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Click to copy coupon code"
                >
                  <span className="font-mono tracking-wider">{item.code}</span>
                  {copiedCode === item.code ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-700 font-bold">
                      <Check className="h-3.5 w-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAndBook(item)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Apply & Book</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combo Packages */}
      <div className="mb-12">
        <div className="mb-6">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Bundled Savings
          </p>
          <h2 className="display-font text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Curated Service Combos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Book 2 popular services together and save up to 30% upfront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COMBO_PACKAGES.map((combo) => (
            <div
              key={combo.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="relative aspect-[1.4/1] w-full overflow-hidden bg-slate-100">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-xs font-black shadow-xs">
                    {combo.savings}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {combo.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {combo.services}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-1.5">
                    {combo.originalPrice}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {combo.comboPrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onBookWithCoupon?.(
                      allServicesCatalog.find(
                        (s) => s.slug === combo.serviceSlug,
                      ) || allServicesCatalog[0],
                      combo.coupon,
                    )
                  }
                  className="flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Book Bundle</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
