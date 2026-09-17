// Structured promotional banner data for Argent Your homepage
// Easily editable for Admin/Content managers to add, edit, or toggle promotions

export const promotionsData = [
  {
    id: "promo-cleaning-20",
    badge: "SPECIAL OFFER",
    badgeColor: "emerald",
    title: "20% OFF on Home Cleaning",
    headline: "Transform Your Living Space",
    discount: "20% OFF",
    couponCode: "CLEAN20",
    discountType: "percent",
    discountValue: 20,
    description:
      "Deep home scrubbing, kitchen sanitization & eco-safe doorstep care by background-verified professionals.",
    ctaText: "Book Now",
    targetSlug: "home-cleaning",
    validUntil: "Valid until 30 Sep",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
  {
    id: "promo-first-200",
    badge: "WELCOME DEAL",
    badgeColor: "amber",
    title: "Flat ₹200 OFF on Your First Booking",
    headline: "First Time With Argent Your?",
    discount: "FLAT ₹200 OFF",
    couponCode: "FIRST200",
    discountType: "flat",
    discountValue: 10, // $10 / ₹200 equivalent
    description:
      "Experience hassle-free repairs, grooming, AC servicing, and doorstep maintenance with instant discount.",
    ctaText: "Claim Offer",
    targetSlug: "ac-repair",
    validUntil: "For all new customers",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
  {
    id: "promo-men-salon",
    badge: "NEW SERVICE",
    badgeColor: "rose",
    title: "New: Premium Men's Salon & Grooming",
    headline: "Barbershop Precision at Doorstep",
    discount: "25% OFF",
    couponCode: "MENSTYLE25",
    discountType: "percent",
    discountValue: 25,
    description:
      "Tailored haircuts, beard styling, facial detan & relaxing head massage in complete comfort of home.",
    ctaText: "Explore Services",
    targetSlug: "mens-grooming-package",
    validUntil: "Limited slots today",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
  {
    id: "promo-weekend-special",
    badge: "WEEKEND SPECIAL",
    badgeColor: "indigo",
    title: "Up to 30% OFF on Selected Services",
    headline: "Weekend Maintenance Blitz",
    discount: "UP TO 30% OFF",
    couponCode: "WEEKEND30",
    discountType: "percent",
    discountValue: 30,
    description:
      "Instant AC foam-jet overhaul, electrical checks & plumbing diagnostics with 30-day warranty.",
    ctaText: "View Offers",
    targetSlug: "ac-repair",
    validUntil: "Valid this weekend only",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
  {
    id: "promo-women-spa",
    badge: "TRENDING",
    badgeColor: "purple",
    title: "At-Home Luxury Salon & Spa Glow",
    headline: "Unwind With Certified Therapists",
    discount: "20% OFF",
    couponCode: "GLOW20",
    discountType: "percent",
    discountValue: 20,
    description:
      "Single-use hygienic kits, organic facial care, deep tissue massage & relaxing manicure-pedicure.",
    ctaText: "Get Offer",
    targetSlug: "womens-salon-spa",
    validUntil: "Valid until 30 Sep",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
  {
    id: "promo-smart-home",
    badge: "LIMITED TIME",
    badgeColor: "sky",
    title: "Smart Home Setup & Safety Check",
    headline: "Modern Automation Made Simple",
    discount: "15% OFF",
    couponCode: "SMARTCARE",
    discountType: "percent",
    discountValue: 15,
    description:
      "Video doorbells, smart locks, lighting sensors & home security wiring installed by verified technicians.",
    ctaText: "Explore Offer",
    targetSlug: "smart-home",
    validUntil: "Limited Time Deal",
    image:
      "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=1200&q=85",
    active: true,
  },
];

/**
 * Validates a coupon code against active promotions.
 * Returns coupon details if valid, or null if invalid.
 */
export function validateCoupon(code) {
  if (!code || typeof code !== "string") return null;
  const clean = code.trim().toUpperCase();

  const foundPromo = promotionsData.find(
    (p) => p.active && p.couponCode && p.couponCode.toUpperCase() === clean,
  );

  if (foundPromo) {
    return {
      valid: true,
      code: foundPromo.couponCode,
      discountType: foundPromo.discountType,
      discountValue: foundPromo.discountValue,
      label: foundPromo.discount,
      title: foundPromo.title,
    };
  }

  // Support legacy default coupon GLOW20
  if (clean === "GLOW20") {
    return {
      valid: true,
      code: "GLOW20",
      discountType: "percent",
      discountValue: 20,
      label: "20% OFF",
      title: "Special Salon & Spa Offer",
    };
  }

  return null;
}
