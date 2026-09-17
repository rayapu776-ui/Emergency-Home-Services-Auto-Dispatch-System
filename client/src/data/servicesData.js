// Comprehensive service catalog with gender/audience targeting, pricing, and details

const image = (id, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const serviceImages = {
  cleaning: image("photo-1581578731548-c64695cc6952"),
  salon: image("photo-1560066984-138dadb4c035"),
  spa: image("photo-1540555700478-4be289fbecef"),
  home: image("photo-1600210492486-724fe5c67fb0", 1200),
  painting: image("photo-1562259949-e8e768b8e6e0"),
  panels: image("photo-1600566753190-17f0baa2a6c3"),
  repair: image("photo-1621905252507-b35492cc74b4"),
  appliance: image("photo-1631545806609-1e3b0a4d7a87"),
  massage: image("photo-1515377905703-c4788e51af15"),
  haircut: image("photo-1562322140-8baeececf3df"),
  purifier: image("photo-1584622650111-993a426fbf0a"),
  smart: image("photo-1558008258-3256797b43f3"),
  moving: image("photo-1600518464441-9154a4dea21b"),
};

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const allServicesCatalog = [
  // --- MEN'S SERVICES ---
  {
    id: "m1",
    slug: "mens-haircut",
    name: "Men's Haircut",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $20",
    numericPrice: 20,
    rating: "4.8",
    reviews: "4.2k",
    image: serviceImages.haircut,
    provider: "Certified Argent Stylists",
    duration: "40 - 50 mins",
    availability: "Available today · Next slot in 45 mins",
    description:
      "Expert haircut tailored to your face shape and personal style. Includes styling consultation, precise cut, neck shave, and post-cut hair wash & blow dry.",
    whatsIncluded: [
      "Personalized styling consultation",
      "Haircut & precision beard edging",
      "Clean neck razor shave with warm towel",
      "Organic shampoo wash & volume blow dry",
      "Premium styling matte clay or pomade finish",
    ],
    faqs: [
      {
        q: "Do I need to wash my hair before the appointment?",
        a: "Not necessarily! Our stylist brings all washing accessories, towels, and dry wash solutions.",
      },
      {
        q: "What styling tools does the professional bring?",
        a: "Our barber brings sanitized wireless trimmers, Japanese steel shears, styling combs, single-use capes, and premium organic styling products.",
      },
    ],
  },
  {
    id: "m2",
    slug: "beard-styling",
    name: "Beard Styling",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $15",
    numericPrice: 15,
    rating: "4.9",
    reviews: "3.6k",
    image: serviceImages.haircut,
    provider: "Certified Argent Stylists",
    duration: "30 mins",
    availability: "Available today · Same-day booking",
    description:
      "Precision beard shaping, line-ups, and luxury beard wash with nourishing beard oils and hot towel compress.",
    whatsIncluded: [
      "Beard shaping and length tapering",
      "Razor-sharp cheek & neckline definition",
      "Hot towel steam compress",
      "Cedarwood & Argan conditioning beard oil application",
    ],
    faqs: [
      {
        q: "Is razor shaping included?",
        a: "Yes, single-use sanitized safety blades are used for clean lines.",
      },
    ],
  },
  {
    id: "m3",
    slug: "mens-grooming-package",
    name: "Men's Grooming Package",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $42",
    numericPrice: 42,
    rating: "4.9",
    reviews: "5.1k",
    image: serviceImages.salon,
    provider: "Senior Argent Stylists",
    duration: "75 mins",
    availability: "Available today · Slots open",
    description:
      "Complete head-to-beard transformation: haircut, beard styling, exfoliating charcoal face scrub, and relaxing 10-minute head massage.",
    whatsIncluded: [
      "Designer haircut of your choice",
      "Beard shaping or clean shave",
      "Deep pore charcoal cleansing face scrub",
      "Stress relief head massage with cooling oil",
    ],
    faqs: [
      {
        q: "Can I customize the items in this package?",
        a: "Yes, you can exchange the clean shave for beard trimming or facial massage upon arrival.",
      },
    ],
  },
  {
    id: "m4",
    slug: "hair-spa-for-men",
    name: "Hair Spa for Men",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $35",
    numericPrice: 35,
    rating: "4.8",
    reviews: "2.3k",
    image: serviceImages.salon,
    provider: "Argent Hair Specialists",
    duration: "45 mins",
    availability: "Available today",
    description:
      "Intensive nourishment for scalp health, dandruff reduction, and hair strengthening with keratin cream bath and steam therapy.",
    whatsIncluded: [
      "Scalp diagnosis and deep cleanse",
      "Nutritive hair cream massage",
      "Hot towel steam wrap",
      "Revitalizing tonic application",
    ],
    faqs: [
      {
        q: "Is this suitable for thinning hair?",
        a: "Yes, gentle anti-hairfall serums are utilized during the spa treatment.",
      },
    ],
  },
  {
    id: "m5",
    slug: "mens-facial-cleanup",
    name: "Men's Facial Cleanup",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $29",
    numericPrice: 29,
    rating: "4.7",
    reviews: "1.9k",
    image: serviceImages.salon,
    provider: "Argent Skin Specialists",
    duration: "45 mins",
    availability: "Available today",
    description:
      "Targets sun damage, pollution dullness, and clogged pores. Leaves skin invigorated, radiant, and hydrated.",
    whatsIncluded: [
      "Deep enzyme cleanser",
      "Gentle blackhead extraction",
      "Soothing aloe & clay cooling mask",
      "SPF moisturizer application",
    ],
    faqs: [],
  },
  {
    id: "m6",
    slug: "quick-comfort-therapy",
    name: "Quick Comfort Therapy",
    category: "Massage for Men",
    targetAudience: "men",
    price: "From $35",
    numericPrice: 35,
    rating: "4.8",
    reviews: "2.8k",
    image: serviceImages.massage,
    provider: "Licensed Massage Therapists",
    duration: "45 mins",
    availability: "Available today · Verified masseur",
    description:
      "Targeted neck, shoulder, and upper back therapy designed to relieve tension from desk fatigue and workout soreness.",
    whatsIncluded: [
      "Deep tissue pressure point focus",
      "Warm therapeutic herbal oil",
      "Neck alignment and spinal decompression stretches",
    ],
    faqs: [],
  },
  {
    id: "m7",
    slug: "top-to-toe-relief",
    name: "Top-to-Toe Relief Massage",
    category: "Massage for Men",
    targetAudience: "men",
    price: "From $59",
    numericPrice: 59,
    rating: "4.9",
    reviews: "3.7k",
    image: serviceImages.massage,
    provider: "Licensed Massage Therapists",
    duration: "75 mins",
    availability: "Available today",
    description:
      "Full body rejuvenation combining Swedish flow with deep tissue work to release chronic stiffness and restore posture.",
    whatsIncluded: [
      "Full body deep tissue massage",
      "Aromatherapy eucalyptus & lavender oils",
      "Foot reflexology stimulation",
    ],
    faqs: [],
  },
  {
    id: "m8",
    slug: "mens-hair-coloring",
    name: "Men's Hair Coloring & Grey Blending",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $28",
    numericPrice: 28,
    rating: "4.8",
    reviews: "1.6k",
    image: serviceImages.haircut,
    provider: "Certified Argent Stylists",
    duration: "45 mins",
    availability: "Available today",
    description:
      "Ammonia-free natural hair color or beard blending for an authentic, refreshed, youthful appearance.",
    whatsIncluded: [
      "Shade matching consultation",
      "Even root & crown application",
      "Scalp protective barrier application",
      "Color lock shampoo & rinse",
    ],
    faqs: [],
  },
  {
    id: "m9",
    slug: "head-shoulder-massage",
    name: "Head & Shoulder Massage",
    category: "Massage for Men",
    targetAudience: "men",
    price: "From $25",
    numericPrice: 25,
    rating: "4.9",
    reviews: "3.4k",
    image: serviceImages.massage,
    provider: "Licensed Massage Therapists",
    duration: "35 mins",
    availability: "Available today · Verified masseur",
    description:
      "Deep relief acupressure massage focusing on head, temples, neck, and shoulder blades to dissolve stress, stiffness, and fatigue.",
    whatsIncluded: [
      "Acupressure point head & temple therapy",
      "Herbal eucalyptus & almond oil massage",
      "Upper trapezius and shoulder stretch",
      "Warm compress finish",
    ],
    faqs: [
      {
        q: "Can this be done without oil?",
        a: "Yes, dry acupressure head and shoulder therapy is also available on request.",
      },
    ],
  },

  // --- WOMEN'S SERVICES ---
  {
    id: "w1",
    slug: "roll-on-waxing",
    name: "Roll-on Waxing (Full Body / Arms / Legs)",
    category: "Women's Salon & Spa",
    targetAudience: "women",
    price: "From $24",
    numericPrice: 24,
    rating: "4.8",
    reviews: "6.4k",
    image: serviceImages.salon,
    provider: "Certified Beauty Specialists",
    duration: "45 - 60 mins",
    availability: "Available today · Immediate slot",
    description:
      "Hygienic, mess-free, and pain-minimized roll-on waxing cartridge system that removes fine hair with gentle skin cooling.",
    whatsIncluded: [
      "Pre-wax sanitization & numbing cooling gel",
      "Disposable roll-on wax cartridge technology",
      "After-wax soothing chamomile lotion",
      "Complimentary underarm touch-up",
    ],
    faqs: [
      {
        q: "Is it hygienic?",
        a: "100%! Cartridges are single-use or sanitized, and no double dipping occurs.",
      },
    ],
  },
  {
    id: "w2",
    slug: "at-home-salon-glow",
    name: "At-Home Salon Glow Facial",
    category: "Women's Salon & Spa",
    targetAudience: "women",
    price: "From $32",
    numericPrice: 32,
    rating: "4.9",
    reviews: "4.8k",
    image: serviceImages.salon,
    provider: "Senior Estheticians",
    duration: "60 mins",
    availability: "Available today · Slot in 1 hour",
    description:
      "Multi-step facial therapy incorporating gold peptides, hyaluronic hydration, and botanical peels to restore luminous skin radiance.",
    whatsIncluded: [
      "Deep cleansing & steam vapor",
      "Gentle ultrasonic exfoliation",
      "Brightening gold peptide ampoule",
      "Cooling hydro-jelly peel-off mask",
    ],
    faqs: [],
  },
  {
    id: "w3",
    slug: "crystal-rose-pedicure",
    name: "Crystal Rose Pedicure & Manicure",
    category: "Women's Salon & Spa",
    targetAudience: "women",
    price: "From $32",
    numericPrice: 32,
    rating: "4.9",
    reviews: "3.9k",
    image: serviceImages.spa,
    provider: "Argent Nail Specialists",
    duration: "55 mins",
    availability: "Available today",
    description:
      "A soothing rose petal foot soak, callus buffing, cuticle trimming, mineral salt scrub, and gel polish finish.",
    whatsIncluded: [
      "Organic rose petal hydro-soak",
      "Exfoliating pink Himalayan crystal scrub",
      "Cuticle shaping and nail filing",
      "Relaxing 10-minute foot massage with rose oil",
    ],
    faqs: [],
  },
  {
    id: "w4",
    slug: "power-glow-cleanup",
    name: "Power Glow Cleanup",
    category: "Women's Salon & Spa",
    targetAudience: "women",
    price: "From $29",
    numericPrice: 29,
    rating: "4.7",
    reviews: "2.8k",
    image: serviceImages.salon,
    provider: "Certified Beauty Specialists",
    duration: "40 mins",
    availability: "Available today",
    description:
      "Rapid skin refresh targeting blackheads, excess sebum, and everyday dullness with organic fruit enzymes.",
    whatsIncluded: [
      "Micellar milk cleanse",
      "Fruit enzyme gentle scrub",
      "Blackhead extraction",
      "Pore-tightening cooling toner pack",
    ],
    faqs: [],
  },
  {
    id: "w5",
    slug: "full-body-massage-scrub",
    name: "Full Body Massage & Scrub",
    category: "Spa for Women",
    targetAudience: "women",
    price: "From $69",
    numericPrice: 69,
    rating: "4.9",
    reviews: "3.2k",
    image: serviceImages.spa,
    provider: "Female Certified Therapists",
    duration: "80 mins",
    availability: "Available today · Female therapist",
    description:
      "Full body exfoliation with walnut & coffee butter, followed by a warm oil Swedish aromatherapy massage to melt away all fatigue.",
    whatsIncluded: [
      "Full body exfoliating coffee scrub",
      "Swedish warm lavender massage (60 mins)",
      "Warm towel body wipe down",
      "Complimentary scalp & pressure point massage",
    ],
    faqs: [
      {
        q: "Is privacy maintained during the home spa?",
        a: "Completely. Our therapist sets up a private sanitization drape and brings disposable undergarments and sterile towels.",
      },
    ],
  },
  {
    id: "w6",
    slug: "leg-relief-massage",
    name: "Leg & Foot Relief Massage",
    category: "Spa for Women",
    targetAudience: "women",
    price: "From $39",
    numericPrice: 39,
    rating: "4.8",
    reviews: "2.1k",
    image: serviceImages.massage,
    provider: "Female Certified Therapists",
    duration: "45 mins",
    availability: "Available today",
    description:
      "Specialized circulatory therapy relieving swollen feet, calf cramps, and knee fatigue using cooling arnica balm.",
    whatsIncluded: [
      "Lymphatic drainage calf strokes",
      "Foot arch pressure point therapy",
      "Cooling menthol & arnica compress",
    ],
    faqs: [],
  },

  // --- UNISEX / HOME & APPLIANCE SERVICES ---
  {
    id: "u1",
    slug: "ac-foam-jet-service",
    name: "AC Foam-Jet Deep Service",
    category: "AC & Appliance Repair",
    targetAudience: "unisex",
    price: "From $35",
    numericPrice: 35,
    rating: "4.9",
    reviews: "8.1k",
    image: serviceImages.appliance,
    provider: "HVAC Certified Technicians",
    duration: "45 mins per unit",
    availability: "Available today · Guaranteed 2-hour dispatch",
    description:
      "Deep high-pressure power washer cleaning with antifungal foam jet spray. Increases cooling speed by 30% and reduces power consumption.",
    whatsIncluded: [
      "High-pressure foam-jet coil cleaning",
      "Filter, blower wheel & tray power wash",
      "Drain pipe unclogging and leakage test",
      "Gas level check & airflow efficiency audit",
      "30-day post-service cooling guarantee",
    ],
    faqs: [
      {
        q: "Does this make a mess in the room?",
        a: "No! Our technicians use a specialized waterproof AC jacket bag to channel all dirty water directly into a bucket.",
      },
      {
        q: "How often should I do this?",
        a: "We recommend foam-jet deep cleaning once every 4 to 6 months for optimal air purity and lower power bills.",
      },
    ],
  },
  {
    id: "u2",
    slug: "water-purifier-service",
    name: "Water Purifier (RO/UV) Service",
    category: "AC & Appliance Repair",
    targetAudience: "unisex",
    price: "From $24",
    numericPrice: 24,
    rating: "4.8",
    reviews: "4.6k",
    image: serviceImages.purifier,
    provider: "Water Treatment Specialists",
    duration: "40 mins",
    availability: "Available today",
    description:
      "Complete multi-stage filter inspection, sediment flush, membrane TDS testing, and leak-proof fitting verification.",
    whatsIncluded: [
      "Sediment & pre-carbon filter backwash",
      "TDS testing of input and output water",
      "Pump pressure and electrical safety test",
      "Storage tank sanitization",
    ],
    faqs: [],
  },
  {
    id: "u3",
    slug: "home-refresh-clean",
    name: "Home Refresh Deep Cleaning",
    category: "Home Cleaning",
    targetAudience: "unisex",
    price: "From $19",
    numericPrice: 19,
    rating: "4.8",
    reviews: "5.4k",
    image: serviceImages.cleaning,
    provider: "Verified Argent Cleaning Team",
    duration: "2 - 3 hours",
    availability: "Available today · Same-day slots open",
    description:
      "Room-by-room meticulous cleaning covering fan blades, switchboards, floor buffing, window tracks, and sanitization.",
    whatsIncluded: [
      "High-grade HEPA vacuuming of furniture & mattresses",
      "Deep floor scrub with antibacterial disinfectant",
      "Kitchen counter, tile degreasing and stove scrub",
      "Bathroom descaling, mirror polish, and toilet sanitation",
    ],
    faqs: [
      {
        q: "Do I need to supply cleaning chemicals?",
        a: "No! The team arrives equipped with Taski professional eco-friendly cleaning agents, scrubbers, and vacuum machines.",
      },
    ],
  },
  {
    id: "u4",
    slug: "electrician-visit",
    name: "Electrician Expert Visit",
    category: "Electrician",
    targetAudience: "unisex",
    price: "From $19",
    numericPrice: 19,
    rating: "4.9",
    reviews: "7.2k",
    image: serviceImages.repair,
    provider: "Licensed City Electricians",
    duration: "30 - 60 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    description:
      "Safe repair of short circuits, MCB trip diagnostics, switchboard replacements, ceiling fan mounting, and heavy appliance cabling.",
    whatsIncluded: [
      "Thorough circuit voltage inspection",
      "Safe certified replacement of faulty components",
      "Testing under full appliance load",
      "30-day Argent safety warranty",
    ],
    faqs: [
      {
        q: "What if replacement parts are needed?",
        a: "Our electrician carries standard ISI-certified switches, wires, and MCBs with transparent upfront pricing.",
      },
    ],
  },
  {
    id: "u5",
    slug: "plumbing-service",
    name: "Plumbing Service & Leak Fix",
    category: "Plumbing",
    targetAudience: "unisex",
    price: "From $24",
    numericPrice: 24,
    rating: "4.8",
    reviews: "6.1k",
    image: serviceImages.repair,
    provider: "Licensed Plumbers",
    duration: "30 - 45 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    description:
      "Fast fix for leaking taps, clogged drains, toilet flush valves, water tank overflows, and pipeline installations.",
    whatsIncluded: [
      "Leak detection & pipe pressure check",
      "Drain snake blockage clearance",
      "Tap spindle & cartridge replacement",
      "Silicone sealant waterproofing finish",
    ],
    faqs: [],
  },
  {
    id: "u6",
    slug: "carpenter-visit",
    name: "Carpenter Visit & Furniture Repair",
    category: "Carpenter",
    targetAudience: "unisex",
    price: "From $29",
    numericPrice: 29,
    rating: "4.7",
    reviews: "2.9k",
    image: serviceImages.moving,
    provider: "Master Carpenters",
    duration: "45 mins",
    availability: "Available today",
    description:
      "Door lock repairs, hinge realignments, modular kitchen drawer channels, and custom wooden furniture assembly.",
    whatsIncluded: [
      "Hardware alignment and lubrication",
      "Heavy duty screw reinforcement",
      "Smooth glide and latch verification",
    ],
    faqs: [],
  },
  {
    id: "u7",
    slug: "smart-home-setup",
    name: "Smart Home Setup & Automation",
    category: "Smart Home Products",
    targetAudience: "unisex",
    price: "From $39",
    numericPrice: 39,
    rating: "4.9",
    reviews: "1.8k",
    image: serviceImages.smart,
    provider: "Smart Home Certified Engineers",
    duration: "60 mins",
    availability: "Available today",
    description:
      "Installation and phone app configuration for smart video doorbells, smart locks, Alexa/Google Home lighting, and Wi-Fi security cameras.",
    whatsIncluded: [
      "Device physical mounting & electrical wire-in",
      "Wi-Fi network connection & app pairing",
      "Voice assistant routine configuration",
      "Family member phone access walkthrough",
    ],
    faqs: [],
  },
  {
    id: "u8",
    slug: "home-painting",
    name: "Home Painting & Wall Refurbishment",
    category: "Home Painting",
    targetAudience: "unisex",
    price: "From $49",
    numericPrice: 49,
    rating: "4.8",
    reviews: "2.4k",
    image: serviceImages.painting,
    provider: "Master Painters",
    duration: "Consultation & site visit",
    availability: "Available today",
    description:
      "Wall inspection, moisture laser measurement, color shade preview, and dust-free mechanized wall painting.",
    whatsIncluded: [
      "Wall dampness laser audit",
      "Furniture plastic masking & floor cover",
      "Mechanized sanding with vacuum extraction",
      "Premium zero-VOC emulsion coat application",
    ],
    faqs: [],
  },
  {
    id: "u9",
    slug: "kitchen-bathroom-deep-cleaning",
    name: "Kitchen & Bathroom Deep Cleaning",
    category: "Home Cleaning",
    targetAudience: "unisex",
    price: "From $35",
    numericPrice: 35,
    rating: "4.9",
    reviews: "4.7k",
    image: serviceImages.cleaning,
    provider: "Argent Sanitization Crew",
    duration: "90 - 120 mins",
    availability: "Available today · Same day slot",
    description:
      "Intensive de-greasing of kitchen tiles, exhaust fans, stovetops, plus anti-limescale scrubbing and disinfection of bathroom sanitary fittings.",
    whatsIncluded: [
      "Mechanized scrubbing of wall tiles & grout",
      "Exhaust fan and chimney exterior de-greasing",
      "Sanitary fixture descaling & steam sanitization",
      "Anti-bacterial floor buffing",
    ],
    faqs: [],
  },
  {
    id: "u10",
    slug: "electrical-installation-fan-repair",
    name: "Electrical Wiring & Fan Installation",
    category: "Electrician",
    targetAudience: "unisex",
    price: "From $22",
    numericPrice: 22,
    rating: "4.8",
    reviews: "3.9k",
    image: serviceImages.repair,
    provider: "Certified Electricians",
    duration: "45 mins",
    availability: "Immediate emergency dispatch in 25 mins",
    description:
      "Ceiling fan mounting, heavy-duty regulator installation, LED panel wiring, and socket box replacement with complete load safety check.",
    whatsIncluded: [
      "Fan rod and motor assembly",
      "Concealed wiring inspection",
      "Regulator & capacitor replacement",
      "Safety earthing verification",
    ],
    faqs: [],
  },
  {
    id: "u11",
    slug: "bathroom-tap-fixture-fitting",
    name: "Bathroom Tap & Fixture Fitting",
    category: "Plumbing",
    targetAudience: "unisex",
    price: "From $20",
    numericPrice: 20,
    rating: "4.9",
    reviews: "3.5k",
    image: serviceImages.repair,
    provider: "Licensed Plumbers",
    duration: "30 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    description:
      "Installation and repair of bathroom diverters, showerheads, angle valves, health faucets (jet sprays), and sink drain pipes.",
    whatsIncluded: [
      "Fixture installation with Teflon seal",
      "Water pressure testing",
      "Gasket & washer leak protection",
      "Old fitting disposal assistance",
    ],
    faqs: [],
  },
];

/**
 * Intelligently returns personalized recommendations matching the selected service
 * Rule:
 * - If service is 'men': returns relevant men's services/products.
 * - If service is 'women': returns relevant women's services/products.
 * - If service is 'unisex': returns a balanced mix of unisex home care and top self-care services.
 */
export function getPersonalizedRecommendations(selectedService, limit = 4) {
  if (!selectedService) return allServicesCatalog.slice(0, limit);

  const audience =
    selectedService.targetAudience ||
    (selectedService.name.toLowerCase().includes("men") ? "men" : "unisex");

  const currentSlug = selectedService.slug;

  if (audience === "men") {
    // Show only relevant men's services
    return allServicesCatalog
      .filter((s) => s.targetAudience === "men" && s.slug !== currentSlug)
      .slice(0, limit);
  }

  if (audience === "women") {
    // Show only relevant women's services
    return allServicesCatalog
      .filter((s) => s.targetAudience === "women" && s.slug !== currentSlug)
      .slice(0, limit);
  }

  // Unisex or Home Care: return relevant unisex or both men and women popular care
  const unisexItems = allServicesCatalog.filter(
    (s) => s.targetAudience === "unisex" && s.slug !== currentSlug,
  );
  const crossCareItems = allServicesCatalog.filter(
    (s) => s.targetAudience !== "unisex",
  );

  return [...unisexItems.slice(0, 2), ...crossCareItems.slice(0, 2)].slice(
    0,
    limit,
  );
}

/**
 * Returns contextually related recommendations based on the searched keyword:
 * - Men's search → men's grooming/services
 * - Women's search → women's beauty/salon/services
 * - Home cleaning → cleaning/home services
 * - AC → AC repair/service
 * - Plumbing → plumbing services
 * - Electricity → electrician services
 * - Generic/unisex search → show relevant services for everyone
 */
export function getRelatedSearchRecommendations(query, limit = 5) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  const isMen =
    !q.includes("women") &&
    (/\b(men|man|mens|male|groom|beard|barber|shave|mustache|haircut)\b/i.test(
      q,
    ) ||
      q.startsWith("men") ||
      q === "men");

  const isWomen =
    /\b(women|woman|womens|female|salon|wax|facial|pedicure|manicure|glow|threading)\b/i.test(
      q,
    ) || q.includes("women");

  const isCleaning =
    /\b(clean|cleaning|cleaner|pest|deep clean|sanitize|sanitization|sofa|house|kitchen|bathroom)\b/i.test(
      q,
    );

  const isAC =
    /\b(ac|air conditioner|cooling|hvac|foam-jet|appliance|purifier|refrigerator|tv)\b/i.test(
      q,
    ) ||
    q === "ac" ||
    q.startsWith("ac ");

  const isPlumbing =
    /\b(plumb|plumbing|plumber|pipe|leak|drain|tap|faucet|basin|toilet|water tank)\b/i.test(
      q,
    );

  const isElectricity =
    /\b(electric|electrician|electricity|electrical|power|switch|socket|wire|wiring|fan|inverter|short circuit)\b/i.test(
      q,
    ) || q.includes("electr");

  const isCarpentry =
    /\b(carpenter|carpentry|furniture|door|hinge|wood|lock)\b/i.test(q);

  // Common high-utility general home services to append for Men/Women searches
  const popularHomeServices = allServicesCatalog.filter(
    (s) =>
      s.slug === "ac-foam-jet-service" ||
      s.slug === "home-refresh-clean" ||
      s.slug === "electrician-visit",
  );

  // 1. Men's search → relevant men's services first, plus useful general home services
  if (isMen) {
    const menServices = allServicesCatalog
      .filter(
        (s) => s.targetAudience === "men" && !s.name.toLowerCase().includes(q),
      )
      .concat(allServicesCatalog.filter((s) => s.targetAudience === "men"));
    const uniqueMen = menServices.filter(
      (v, i, a) => a.findIndex((t) => t.slug === v.slug) === i,
    );
    return [...uniqueMen.slice(0, 4), ...popularHomeServices.slice(0, 2)].slice(
      0,
      limit,
    );
  }

  // 2. Women's search → relevant women's services first, plus useful general home services
  if (isWomen) {
    const womenServices = allServicesCatalog
      .filter(
        (s) =>
          s.targetAudience === "women" && !s.name.toLowerCase().includes(q),
      )
      .concat(allServicesCatalog.filter((s) => s.targetAudience === "women"));
    const uniqueWomen = womenServices.filter(
      (v, i, a) => a.findIndex((t) => t.slug === v.slug) === i,
    );
    return [
      ...uniqueWomen.slice(0, 4),
      ...popularHomeServices.slice(0, 2),
    ].slice(0, limit);
  }

  // 3. Home cleaning → cleaning / home services
  if (isCleaning) {
    const cleaningList = allServicesCatalog.filter(
      (s) =>
        (s.category || "").toLowerCase().includes("cleaning") ||
        (s.category || "").toLowerCase().includes("pest") ||
        s.slug === "kitchen-bathroom-deep-cleaning" ||
        s.slug === "home-refresh-clean",
    );
    const nearby = allServicesCatalog.filter(
      (s) => s.slug === "ac-foam-jet-service" || s.slug === "home-painting",
    );
    return [...cleaningList, ...nearby].slice(0, limit);
  }

  // 4. AC → AC repair / service
  if (isAC) {
    const acList = allServicesCatalog.filter(
      (s) =>
        (s.category || "").toLowerCase().includes("appliance") ||
        (s.category || "").toLowerCase().includes("ac") ||
        s.slug === "ac-foam-jet-service" ||
        s.slug === "water-purifier-service",
    );
    const nearby = allServicesCatalog.filter(
      (s) => s.slug === "electrician-visit" || s.slug === "smart-home-setup",
    );
    return [...acList, ...nearby].slice(0, limit);
  }

  // 5. Plumbing → plumbing services
  if (isPlumbing) {
    const plumbingList = allServicesCatalog.filter(
      (s) =>
        (s.category || "").toLowerCase().includes("plumb") ||
        s.slug === "bathroom-tap-fixture-fitting" ||
        s.slug === "plumbing-service",
    );
    const nearby = allServicesCatalog.filter(
      (s) =>
        s.slug === "water-purifier-service" ||
        s.slug === "kitchen-bathroom-deep-cleaning",
    );
    return [...plumbingList, ...nearby].slice(0, limit);
  }

  // 6. Electricity → electrician services
  if (isElectricity) {
    const electricList = allServicesCatalog.filter(
      (s) =>
        (s.category || "").toLowerCase().includes("electr") ||
        s.slug === "electrician-visit" ||
        s.slug === "electrical-installation-fan-repair",
    );
    const nearby = allServicesCatalog.filter(
      (s) => s.slug === "smart-home-setup" || s.slug === "ac-foam-jet-service",
    );
    return [...electricList, ...nearby].slice(0, limit);
  }

  // 7. Carpentry → furniture, wood, doors, locks
  if (isCarpentry) {
    const carpList = allServicesCatalog.filter(
      (s) =>
        (s.category || "").toLowerCase().includes("carpenter") ||
        s.slug === "carpenter-visit",
    );
    const nearby = allServicesCatalog.filter(
      (s) =>
        s.slug === "home-painting" || s.slug === "bathroom-tap-fixture-fitting",
    );
    return [...carpList, ...nearby].slice(0, limit);
  }

  // 8. Generic / unisex search → show relevant services for everyone
  const topServices = allServicesCatalog.filter(
    (s) =>
      s.slug === "home-refresh-clean" ||
      s.slug === "ac-foam-jet-service" ||
      s.slug === "electrician-visit" ||
      s.slug === "mens-grooming-package" ||
      s.slug === "roll-on-waxing" ||
      s.slug === "plumbing-service",
  );
  return topServices.slice(0, limit);
}
