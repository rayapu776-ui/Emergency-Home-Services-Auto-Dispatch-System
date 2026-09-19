import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Zap,
} from "lucide-react";
import { promotionsData } from "../../data/promotionsData";

export default function HeroPromoCarousel({ onSelectService, onUseCoupon }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const autoSlideTimerRef = useRef(null);

  const activePromos = promotionsData.filter((p) => p.active);
  const totalSlides = activePromos.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Automatic sliding every 5 seconds (pauses on hover or touch)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    autoSlideTimerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
    };
  }, [isPaused, handleNext, totalSlides]);

  // Handle clipboard copy
  const handleCopyCoupon = (e, code) => {
    e.stopPropagation();
    if (!code) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Handle navigation on CTA click
  const handleCtaClick = (e, promo) => {
    e.stopPropagation();
    if (promo.targetSlug) {
      if (promo.couponCode && onUseCoupon) {
        onUseCoupon(promo.targetSlug, promo.couponCode);
      } else if (onSelectService) {
        onSelectService({ slug: promo.targetSlug, name: promo.title });
      }
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      handleNext(); // swipe left -> next
    } else if (distance < -45) {
      handlePrev(); // swipe right -> prev
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (totalSlides === 0) return null;

  const currentPromo = activePromos[currentIndex];

  const getBadgeStyle = (color) => {
    switch (color) {
      case "amber":
        return "bg-amber-400 text-slate-950 font-black shadow-amber-400/20";
      case "rose":
        return "bg-rose-500 text-white font-bold shadow-rose-500/20";
      case "indigo":
        return "bg-indigo-500 text-white font-bold shadow-indigo-500/20";
      case "purple":
        return "bg-purple-500 text-white font-bold shadow-purple-500/20";
      case "sky":
        return "bg-sky-500 text-white font-bold shadow-sky-500/20";
      default:
        return "bg-emerald-600 text-white font-bold shadow-emerald-500/20";
    }
  };

  return (
    <div
      className="hero-promo-container relative w-full h-[400px] sm:h-[440px] lg:h-[470px] rounded-3xl lg:rounded-[2rem] overflow-hidden bg-slate-900 shadow-[0_20px_50px_rgba(25,53,45,0.12)] border border-white/60 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Latest Updates and Promotional Offers"
    >
      {/* Background Images with smooth fade */}
      {activePromos.map((promo, idx) => (
        <div
          key={promo.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            idx === currentIndex
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none z-0"
          }`}
          aria-hidden={idx !== currentIndex}
        >
          <img
            src={promo.image}
            alt={promo.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out transform group-hover:scale-105"
          />
          {/* Top subtle vignette */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-transparent" />
          {/* Bottom rich dark gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        </div>
      ))}

      {/* Slide Top Bar: Badges, Validity & Slide Counter */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Promotional Category / Type Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-sm backdrop-blur-md ${getBadgeStyle(
              currentPromo.badgeColor,
            )}`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{currentPromo.badge}</span>
          </span>

          {/* Validity Pill */}
          {currentPromo.validUntil && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white/90 bg-slate-950/45 backdrop-blur-md border border-white/20 shadow-xs">
              <Clock className="h-3 w-3 text-emerald-400" />
              <span>{currentPromo.validUntil}</span>
            </span>
          )}
        </div>

        {/* Slide Counter Indicator */}
        <div className="px-2.5 py-1 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white/80 shadow-xs">
          <span>{currentIndex + 1}</span>
          <span className="text-white/40 mx-1">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>

      {/* Navigation Arrows: Left & Right */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/80 hover:bg-white text-slate-900 backdrop-blur-md border border-white/70 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Previous promotion"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/80 hover:bg-white text-slate-900 backdrop-blur-md border border-white/70 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Next promotion"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom Main Content Card (Glassmorphism card) */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 z-20">
        <div className="rounded-2xl border border-white/25 bg-slate-950/75 backdrop-blur-xl p-4 sm:p-5 text-white shadow-2xl space-y-3 sm:space-y-3.5 transition-all">
          {/* Eyebrow & Validity on Mobile */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              {currentPromo.headline || "Special Promotion"}
            </p>
            {currentPromo.validUntil && (
              <span className="sm:hidden text-[10px] text-white/70 flex items-center gap-1 font-medium">
                <Clock className="h-2.5 w-2.5 text-emerald-400" />
                <span>{currentPromo.validUntil}</span>
              </span>
            )}
          </div>

          {/* Big Offer Headline & Discount Highlight Tag */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {currentPromo.title}
            </h2>
            <span className="inline-block w-fit px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black shrink-0 tracking-wider">
              {currentPromo.discount}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed font-normal">
            {currentPromo.description}
          </p>

          {/* Coupon Code Strip & CTA Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-white/10">
            {/* Coupon Chip with Click-to-Copy */}
            {currentPromo.couponCode ? (
              <div className="flex items-center gap-2">
                <div
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-400/70 bg-emerald-950/60 px-3 py-1.5 text-xs font-mono font-bold text-emerald-200 shadow-inner"
                  title="Coupon code for checkout"
                >
                  <Tag className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Code:</span>
                  <span className="tracking-wider text-white font-extrabold">
                    {currentPromo.couponCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyCoupon(e, currentPromo.couponCode)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  title="Copy coupon code"
                >
                  {copiedCode === currentPromo.couponCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-white/70 font-semibold">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Instant Doorstep Confirmation</span>
              </div>
            )}

            {/* Clear Primary CTA Button */}
            <button
              type="button"
              onClick={(e) => handleCtaClick(e, currentPromo)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <span>{currentPromo.ctaText || "Explore Offer"}</span>
              <ArrowRight className="h-4 w-4 text-emerald-800" />
            </button>
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2.5">
          {activePromos.map((promo, idx) => (
            <button
              key={promo.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-7 sm:w-8 h-2 rounded-full bg-emerald-400 shadow-sm"
                  : "w-2 h-2 rounded-full bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}: ${promo.title}`}
              aria-current={idx === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
