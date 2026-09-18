// Comprehensive service catalog with gender/audience targeting, pricing, 4-photo galleries, and details

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
  // =========================================================================
  // --- MEN'S SERVICES ---
  // =========================================================================
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
    image: image("photo-1503951914875-452162b0f3f1"),
    gallery: [
      image("photo-1503951914875-452162b0f3f1"),
      image("photo-1599351431202-1e0f0137899a"),
      image("photo-1562322140-8baeececf3df"),
      image("photo-1622286342621-4bd786c2447c"),
    ],
    provider: "Certified Argent Stylists",
    duration: "40 - 50 mins",
    availability: "Available today · Next slot in 45 mins",
    tags: ["Doorstep Barber", "Single-Use Cape", "Sterilized Tools", "30-Day Guarantee"],
    description:
      "Expert haircut tailored to your face shape and personal style. Includes styling consultation, precise cut, neck shave, and post-cut hair wash & blow dry delivered in the comfort of your home.",
    whatsIncluded: [
      "Personalized styling consultation with face-shape mapping",
      "Precision cut, fade, scissor work & neck taper",
      "Clean neck razor shave with soothing warm towel",
      "Organic shampoo wash & volume blow dry styling",
      "Matte clay or pomade styling finish",
      "Complete post-service cleanup of hair clippings",
    ],
    whatsNotIncluded: [
      "Hair coloring, streaks, or grey blending (available as add-on)",
      "Chemical straightening or keratin smoothening treatments",
      "Major beard shaping (haircut only, quick sideburn touchup included)",
    ],
    suitableFor:
      "Busy professionals, students, and gentlemen wanting executive-grade grooming without waiting in salon queues.",
    importantDetails: [
      "Please ensure a chair with access to a power outlet and adequate room lighting is available.",
      "Our stylist brings sanitized wireless clippers, shears, clean mirrors, and disposable floor sheets.",
      "Revisit or adjustment guarantee valid within 3 days if length requires minor tweaking.",
    ],
    faqs: [
      {
        q: "Do I need to wash my hair before the appointment?",
        a: "Not necessarily! Our stylist brings portable rinse basins, dry-wash solutions, and sterile microfiber towels.",
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
    name: "Beard Styling & Shaping",
    category: "Men's Salon & Grooming",
    targetAudience: "men",
    price: "From $15",
    numericPrice: 15,
    rating: "4.9",
    reviews: "3.6k",
    image: image("photo-1621605815971-fbc98d665033"),
    gallery: [
      image("photo-1621605815971-fbc98d665033"),
      image("photo-1506794778202-cad84cf45f1d"),
      image("photo-1517832606589-7929c39259a4"),
      image("photo-1599351431202-1e0f0137899a"),
    ],
    provider: "Certified Argent Stylists",
    duration: "30 mins",
    availability: "Available today · Same-day booking",
    tags: ["Razor Sharp Lines", "Hot Towel Steam", "Organic Beard Oil"],
    description:
      "Precision beard shaping, sharp cheek line-ups, neckline tapering, and luxury beard wash finished with nourishing cedarwood oils and hot towel compress.",
    whatsIncluded: [
      "Beard shaping, symmetry alignment, and length tapering",
      "Razor-sharp cheek & neckline definition with safety straight razor",
      "Hot towel steam compress to open pores and soften follicles",
      "Cedarwood & Argan conditioning beard oil and butter massage",
    ],
    whatsNotIncluded: [
      "Full head haircut (available as package)",
      "Beard dye or chemical color treatments (can be booked separately)",
      "Ingrown hair surgical removal",
    ],
    suitableFor:
      "Men seeking crisp beard geometry, fade transitions, and deep follicle nourishment.",
    importantDetails: [
      "Single-use sanitized blades are opened in front of you.",
      "Let the stylist know if you have sensitive skin or razor burn tendencies.",
    ],
    faqs: [
      {
        q: "Is razor shaping included?",
        a: "Yes, single-use sanitized safety blades are used for clean lines and zero irritation.",
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
    image: image("photo-1585747860715-2ba37e788b70"),
    gallery: [
      image("photo-1585747860715-2ba37e788b70"),
      image("photo-1503951914875-452162b0f3f1"),
      image("photo-1512290900672-1f0233367123"),
      image("photo-1519823551278-64ac92734fb1"),
    ],
    provider: "Senior Argent Stylists",
    duration: "75 mins",
    availability: "Available today · Slots open",
    tags: ["Best Value Combo", "Hair + Beard + Facial", "Complimentary Head Massage"],
    description:
      "Complete head-to-beard transformation: haircut of choice, precision beard styling or clean shave, exfoliating charcoal face scrub, and relaxing 10-minute head massage.",
    whatsIncluded: [
      "Designer haircut of your choice with blow dry styling",
      "Beard shaping or clean shave with hot steam towel",
      "Deep pore charcoal cleansing face scrub and blackhead removal",
      "Stress relief head massage with cooling herbal oil",
      "Eyebrow & ear hair trimming",
    ],
    whatsNotIncluded: [
      "Advanced chemical hair treatments or keratin baths",
      "Deep back massage (covered under massage services)",
    ],
    suitableFor:
      "Gentlemen preparing for interviews, weddings, celebrations, or a complete monthly grooming overhaul.",
    importantDetails: [
      "Complete salon kit with single-use protective apron and floor cover included.",
      "Takes approximately 75 mins of uninterrupted relaxation.",
    ],
    faqs: [
      {
        q: "Can I customize the items in this package?",
        a: "Yes, you can exchange the clean shave for beard trimming or facial cleanup upon arrival.",
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
    image: image("photo-1522337360788-8b13dee7a37e"),
    gallery: [
      image("photo-1522337360788-8b13dee7a37e"),
      image("photo-1516975080664-ed2fc6a32937"),
      image("photo-1519823551278-64ac92734fb1"),
      image("photo-1585747860715-2ba37e788b70"),
    ],
    provider: "Argent Hair Specialists",
    duration: "45 mins",
    availability: "Available today",
    tags: ["Scalp Detox", "Dandruff Defense", "Keratin Nourishment"],
    description:
      "Intensive nourishment for scalp health, dandruff reduction, and hair strengthening with organic keratin cream bath, thermal steam therapy, and acupressure scalp massage.",
    whatsIncluded: [
      "Scalp diagnosis and deep pore purifying cleanse",
      "Nutritive hair cream massage with keratin infusion",
      "Hot towel thermal steam wrap for deep follicle absorption",
      "Revitalizing anti-hairfall tonic application and styling blow dry",
    ],
    whatsNotIncluded: [
      "Haircut or beard styling (can be bundled)",
      "Permanent hair chemical treatments",
    ],
    suitableFor:
      "Anyone experiencing dry scalp, pollution buildup, dandruff, or brittle hair from weather and helmet wear.",
    importantDetails: [
      "Stylist brings portable steam wrap equipment and organic salon-grade products.",
      "Recommended once every 3 to 4 weeks for long-term scalp vitality.",
    ],
    faqs: [
      {
        q: "Is this suitable for thinning hair?",
        a: "Yes, gentle anti-hairfall serums are utilized during the spa treatment to fortify hair roots.",
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
    image: image("photo-1570172619644-dfd03ed5d881"),
    gallery: [
      image("photo-1570172619644-dfd03ed5d881"),
      image("photo-1512290900672-1f0233367123"),
      image("photo-1516975080664-ed2fc6a32937"),
      image("photo-1540555700478-4be289fbecef"),
    ],
    provider: "Argent Skin Specialists",
    duration: "45 mins",
    availability: "Available today",
    tags: ["Tan Removal", "Blackhead Extraction", "Pollution Shield"],
    description:
      "Deep clinical skin cleanup targeting sun tan, city pollution dullness, clogged pores, and excess oil. Restores skin glow, hydration, and clarity.",
    whatsIncluded: [
      "Deep enzyme cleanser and gentle thermal vapor steam",
      "Painless ultrasonic blackhead & whitehead extraction",
      "Soothing aloe vera, tea tree & bentonite clay cooling mask",
      "Antioxidant vitamin C serum & SPF moisturizer application",
    ],
    whatsNotIncluded: [
      "Laser skin treatments or deep chemical peels",
      "Dermatological cyst or acne surgeries",
    ],
    suitableFor:
      "Men exposed to regular outdoor traffic, sun exposure, dust, and stubborn blackheads.",
    importantDetails: [
      "All products are dermatologist-tested and hypoallergenic.",
      "Avoid direct sun exposure for 3 hours post-treatment.",
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
    image: image("photo-1544161515-4ab6ce6db874"),
    gallery: [
      image("photo-1544161515-4ab6ce6db874"),
      image("photo-1519823551278-64ac92734fb1"),
      image("photo-1600334129128-685c5582fd35"),
      image("photo-1515377905703-c4788e51af15"),
    ],
    provider: "Licensed Massage Therapists",
    duration: "45 mins",
    availability: "Available today · Verified masseur",
    tags: ["Posture Correction", "Desk Fatigue Relief", "Deep Tissue"],
    description:
      "Targeted neck, shoulder, and upper back therapy designed to relieve tension from desk fatigue, screen time stiffness, and workout soreness.",
    whatsIncluded: [
      "Deep tissue pressure point focus on trapezius and rhomboids",
      "Warm therapeutic eucalyptus and almond herbal oil",
      "Neck alignment and spinal decompression assisted stretches",
      "Relaxing warm compress finish",
    ],
    whatsNotIncluded: [
      "Full body leg and foot massage (choose Top-to-Toe Relief)",
      "Medical chiropractic adjustments or fracture therapy",
    ],
    suitableFor:
      "Remote workers, desk employees, gym goers, and drivers experiencing upper back knots and stiff neck.",
    importantDetails: [
      "Therapist brings professional portable massage mat, sterile sheets, and warmers.",
      "Customizable pressure from medium to deep tissue.",
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
    image: image("photo-1519823551278-64ac92734fb1"),
    gallery: [
      image("photo-1519823551278-64ac92734fb1"),
      image("photo-1544161515-4ab6ce6db874"),
      image("photo-1507652313519-d4e9174996dd"),
      image("photo-1540555700478-4be289fbecef"),
    ],
    provider: "Licensed Massage Therapists",
    duration: "75 mins",
    availability: "Available today",
    tags: ["Full Body Rejuvenation", "Swedish Flow", "Foot Reflexology"],
    description:
      "Full body rejuvenation combining Swedish flow strokes with deep tissue acupressure to release chronic muscular stiffness, restore posture, and induce restful sleep.",
    whatsIncluded: [
      "Full body deep tissue massage covering back, arms, legs, and calves",
      "Aromatherapy eucalyptus & lavender cold-pressed oils",
      "Foot reflexology stimulation to ease plantar fasciitis and fatigue",
      "Hot towel wipe-down leaving skin fresh and residue-free",
    ],
    whatsNotIncluded: [
      "Surgical sports rehabilitation",
      "Facial skin treatments (can be booked as separate package)",
    ],
    suitableFor:
      "Individuals experiencing full-body physical fatigue, high stress levels, or post-travel jetlag.",
    importantDetails: [
      "Disposable undergarments and sterile medical-grade towels supplied.",
      "Therapists are background checked and government verified.",
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
    image: image("photo-1562322140-8baeececf3df"),
    gallery: [
      image("photo-1562322140-8baeececf3df"),
      image("photo-1522337360788-8b13dee7a37e"),
      image("photo-1503951914875-452162b0f3f1"),
      image("photo-1599351431202-1e0f0137899a"),
    ],
    provider: "Certified Argent Stylists",
    duration: "45 mins",
    availability: "Available today",
    tags: ["Ammonia-Free", "Natural Look", "Long-Lasting"],
    description:
      "Ammonia-free natural hair color and grey blending tailored to your natural shade. Leaves hair looking authentically refreshed, rich, and youthful without patchy artificial tint.",
    whatsIncluded: [
      "Shade matching consultation with premium color swatches",
      "Even root & crown application with scalp barrier cream",
      "Scalp protective barrier application to prevent skin staining",
      "Color-lock herbal shampoo wash and conditioning rinse",
    ],
    whatsNotIncluded: [
      "Bleaching, fashion neon highlights, or intense hair lightening",
      "Permanent hair rebonding",
    ],
    suitableFor:
      "Men wanting undetectable, natural grey coverage or a polished rich dark shade before events.",
    importantDetails: [
      "We use zero-ammonia Loreal Professional and Schwarzkopf formulas.",
      "Patch test provided if you have dye allergy history.",
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
    image: image("photo-1515377905703-c4788e51af15"),
    gallery: [
      image("photo-1515377905703-c4788e51af15"),
      image("photo-1519823551278-64ac92734fb1"),
      image("photo-1544161515-4ab6ce6db874"),
      image("photo-1600334129128-685c5582fd35"),
    ],
    provider: "Licensed Massage Therapists",
    duration: "35 mins",
    availability: "Available today · Verified masseur",
    tags: ["Quick Relief", "Headache Relief", "Acupressure Focus"],
    description:
      "Deep relief acupressure massage focusing on crown, temples, occipital ridge, neck, and shoulder blades to dissolve migraines, stiffness, and screen fatigue.",
    whatsIncluded: [
      "Acupressure point head & temple pressure therapy",
      "Herbal eucalyptus & almond warm oil massage",
      "Upper trapezius and shoulder blade mobility stretch",
      "Warm aromatic compress finish",
    ],
    whatsNotIncluded: [
      "Full body back or leg massage",
      "Hair wash (oil is absorbed naturally or towel dried)",
    ],
    suitableFor:
      "Anyone needing an instant mid-day productivity reset or relief from tension headaches.",
    importantDetails: [
      "Available with oil or as dry acupressure depending on your preference.",
      "Can be enjoyed sitting on a comfortable chair or sofa.",
    ],
    faqs: [
      {
        q: "Can this be done without oil?",
        a: "Yes, dry acupressure head and shoulder therapy is available upon request with zero mess.",
      },
    ],
  },

  // =========================================================================
  // --- WOMEN'S SERVICES ---
  // =========================================================================
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
    image: image("photo-1560066984-138dadb4c035"),
    gallery: [
      image("photo-1560066984-138dadb4c035"),
      image("photo-1570172619644-dfd03ed5d881"),
      image("photo-1487412720507-e7ab37603c6f"),
      image("photo-1522337360788-8b13dee7a37e"),
    ],
    provider: "Certified Beauty Specialists",
    duration: "45 - 60 mins",
    availability: "Available today · Immediate slot",
    tags: ["100% Hygienic", "No Double-Dipping", "Gentle Wax Cartridge"],
    description:
      "Hygienic, mess-free, and pain-minimized roll-on waxing cartridge system that removes fine hair smoothly with gentle soothing skin cooling.",
    whatsIncluded: [
      "Pre-wax skin sanitization and numbing cooling gel",
      "Single-use disposable roll-on wax cartridge technology",
      "Full coverage arms, legs, and underarms treatment",
      "After-wax soothing chamomile lotion and post-care wipe",
    ],
    whatsNotIncluded: [
      "Permanent laser hair reduction",
      "Facial threading or facial waxing (bookable separately)",
    ],
    suitableFor:
      "Women seeking clean, sanitary, salon-grade hair removal at home without wax burns or sticky residue.",
    importantDetails: [
      "Single-use cartridges ensure zero contamination.",
      "Avoid hot showers and direct sun for 12 hours after waxing.",
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
    image: image("photo-1570172619644-dfd03ed5d881"),
    gallery: [
      image("photo-1570172619644-dfd03ed5d881"),
      image("photo-1512290900672-1f0233367123"),
      image("photo-1516975080664-ed2fc6a32937"),
      image("photo-1540555700478-4be289fbecef"),
    ],
    provider: "Senior Estheticians",
    duration: "60 mins",
    availability: "Available today · Slot in 1 hour",
    tags: ["Gold Peptide Ampoule", "Hydro-Jelly Mask", "Instant Glow"],
    description:
      "Multi-step facial therapy incorporating 24k gold peptides, hyaluronic hydration, ultrasonic exfoliation, and botanical extracts to restore luminous skin radiance.",
    whatsIncluded: [
      "Deep micellar milk cleansing & warm botanical steam vapor",
      "Gentle ultrasonic exfoliation & painless blackhead removal",
      "Brightening 24k gold peptide ampoule infusion with jade roller",
      "Cooling hydro-jelly peel-off mask and radiance barrier cream",
    ],
    whatsNotIncluded: [
      "Chemical TCA peeling or micro-needling",
      "Eyebrow threading (can be selected as add-on)",
    ],
    suitableFor:
      "Women looking for instant glass-skin radiance before weddings, photo shoots, parties, or festive events.",
    importantDetails: [
      "Formulated for all skin types including sensitive skin.",
      "Esthetician brings sanitized kit, clean headbands, and protective sheets.",
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
    image: image("photo-1519014816548-bf5fe059798b"),
    gallery: [
      image("photo-1519014816548-bf5fe059798b"),
      image("photo-1632345031435-8727f6897d53"),
      image("photo-1604654894610-df63bc536371"),
      image("photo-1522337360788-8b13dee7a37e"),
    ],
    provider: "Argent Nail Specialists",
    duration: "55 mins",
    availability: "Available today",
    tags: ["Rose Petal Soak", "Callus Buffing", "Gel Polish Finish"],
    description:
      "A soothing rose petal foot hydro-soak, callus buffing, cuticle shaping, pink Himalayan mineral salt scrub, and gel polish finish for velvety soft hands and feet.",
    whatsIncluded: [
      "Organic rose petal and Epsom salt hydro-soak tub",
      "Exfoliating pink Himalayan crystal scrub with dead skin buffing",
      "Cuticle shaping, gentle filing, and nail buffing",
      "Relaxing 10-minute foot and hand massage with pure rose oil",
      "Long-wear nail color polish coat",
    ],
    whatsNotIncluded: [
      "Acrylic nail extensions or gel nail sculpture removal",
      "Fungal nail medical treatment",
    ],
    suitableFor:
      "Anyone wanting silky, hydrated feet, healthy cuticles, and beautiful nails at home.",
    importantDetails: [
      "All steel instruments are autoclave-sterilized in sealed medical pouches.",
      "Foot tub features disposable protective liner for supreme hygiene.",
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
    image: image("photo-1512290900672-1f0233367123"),
    gallery: [
      image("photo-1512290900672-1f0233367123"),
      image("photo-1570172619644-dfd03ed5d881"),
      image("photo-1487412720507-e7ab37603c6f"),
      image("photo-1540555700478-4be289fbecef"),
    ],
    provider: "Certified Beauty Specialists",
    duration: "40 mins",
    availability: "Available today",
    tags: ["Quick Glow", "Pore Purifying", "Fruit Enzyme Scrub"],
    description:
      "Rapid skin refresh targeting stubborn blackheads, excess sebum, and everyday dullness using organic fruit enzyme exfoliators.",
    whatsIncluded: [
      "Micellar purifying cleanse with botanical milk",
      "Fruit enzyme gentle scrub for dead skin removal",
      "Sanitized blackhead & sebum extraction",
      "Pore-tightening cooling toner pack and moisturizer",
    ],
    whatsNotIncluded: [
      "Multi-stage gold facial or chemical peels",
      "Neck and shoulder extensive massage",
    ],
    suitableFor:
      "Quick weekday skincare routines, working women, and college students needing rapid glow without lengthy sessions.",
    importantDetails: [
      "Takes 40 minutes and leaves zero redness.",
      "Safe during pregnancy and sensitive skin cycles.",
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
    image: image("photo-1540555700478-4be289fbecef"),
    gallery: [
      image("photo-1540555700478-4be289fbecef"),
      image("photo-1544161515-4ab6ce6db874"),
      image("photo-1507652313519-d4e9174996dd"),
      image("photo-1600334129128-685c5582fd35"),
    ],
    provider: "Female Certified Therapists",
    duration: "80 mins",
    availability: "Available today · Female therapist",
    tags: ["Complete Privacy", "Coffee Butter Scrub", "Swedish Aromatherapy"],
    description:
      "Full body exfoliation with organic walnut & coffee butter, followed by a warm oil Swedish aromatherapy massage to melt away all muscular fatigue.",
    whatsIncluded: [
      "Full body exfoliating coffee and walnut scrub",
      "Swedish warm lavender massage (60 mins)",
      "Warm towel body wipe down and steam wrap",
      "Complimentary scalp & pressure point temple massage",
    ],
    whatsNotIncluded: [
      "Facial skin treatments (available separately)",
      "Orthopedic medical spinal manipulations",
    ],
    suitableFor:
      "Women looking for supreme privacy, deep muscle relaxation, and skin brightening in their own bedroom.",
    importantDetails: [
      "Delivered exclusively by certified female spa therapists.",
      "Therapist brings portable spa mat, disposable garments, sterile towels, and soothing ambient music.",
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
    image: image("photo-1519823551278-64ac92734fb1"),
    gallery: [
      image("photo-1519823551278-64ac92734fb1"),
      image("photo-1544161515-4ab6ce6db874"),
      image("photo-1519014816548-bf5fe059798b"),
      image("photo-1540555700478-4be289fbecef"),
    ],
    provider: "Female Certified Therapists",
    duration: "45 mins",
    availability: "Available today",
    tags: ["Lymphatic Drainage", "Swelling Relief", "Cooling Arnica Balm"],
    description:
      "Specialized circulatory therapy relieving swollen feet, calf cramps, and knee fatigue using cooling arnica balm and gentle lymphatic drainage strokes.",
    whatsIncluded: [
      "Lymphatic drainage calf strokes to reduce water retention",
      "Foot arch pressure point reflexology therapy",
      "Cooling menthol & organic arnica compress wrap",
    ],
    whatsNotIncluded: [
      "Full body massage (choose Full Body Massage & Scrub)",
      "Pedicure nail shaping (bookable as Crystal Rose Pedicure)",
    ],
    suitableFor:
      "Expecting mothers (safe prenatal techniques), runners, healthcare professionals, and teachers on their feet all day.",
    importantDetails: [
      "Gentle, therapeutic non-invasive pressure.",
      "Can be done comfortably on your bed or recliner.",
    ],
    faqs: [],
  },

  // =========================================================================
  // --- UNISEX / HOME & APPLIANCE SERVICES ---
  // =========================================================================
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
    image: image("photo-1621905252507-b35492cc74b4"),
    gallery: [
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1631545806609-1e3b0a4d7a87"),
      image("photo-1581578731548-c64695cc6952"),
      image("photo-1584622650111-993a426fbf0a"),
    ],
    provider: "HVAC Certified Technicians",
    duration: "45 mins per unit",
    availability: "Available today · Guaranteed 2-hour dispatch",
    tags: ["Power Jet Wash", "30-Day Cooling Guarantee", "Zero-Spill Bag"],
    description:
      "Deep high-pressure power washer cleaning with antifungal foam jet spray. Restores peak cooling speed, purifies indoor airflow, and reduces monthly electricity bills.",
    whatsIncluded: [
      "High-pressure antifungal foam-jet coil cleaning",
      "Filter, blower wheel & drain tray deep pressure wash",
      "Drain pipe unclogging and condensate leakage inspection",
      "Gas pressure check, electrical amp audit & airflow measurement",
      "30-day post-service cooling performance guarantee",
    ],
    whatsNotIncluded: [
      "Refrigerant gas top-up or full refill (charged as per actual PSI needed)",
      "Compressor or PCB capacitor replacement (provided with upfront quote)",
      "AC uninstallation or wall re-mounting",
    ],
    suitableFor:
      "Split and window ACs with foul odor, weak cooling, water dripping, or uncleaned for over 6 months.",
    importantDetails: [
      "Technician uses a waterproof AC jacket bag so not a single drop hits your floor or walls.",
      "Requires active water tap and 16A power socket.",
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
    image: image("photo-1584622650111-993a426fbf0a"),
    gallery: [
      image("photo-1584622650111-993a426fbf0a"),
      image("photo-1600566753190-17f0baa2a6c3"),
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1581578731548-c64695cc6952"),
    ],
    provider: "Water Treatment Specialists",
    duration: "40 mins",
    availability: "Available today",
    tags: ["TDS Digital Audit", "Sanitized Tank", "Multi-Brand RO/UV"],
    description:
      "Complete multi-stage filter inspection, sediment flush, membrane TDS testing, booster pump pressure check, and leak-proof fitting verification.",
    whatsIncluded: [
      "Sediment & pre-carbon filter backwash and descaling",
      "Digital TDS testing of input raw water and output purified water",
      "Booster pump pressure and electrical solenoid valve safety test",
      "Food-grade storage tank sanitization",
    ],
    whatsNotIncluded: [
      "Replacement RO membrane or mineral cartridge (available with genuine warranty)",
      "New water purifier installation on raw tiles without water inlet",
    ],
    suitableFor:
      "All Kent, Aquaguard, Pureit, Livpure, and Havells RO, UV, and UF purifiers showing slow filtration or altered taste.",
    importantDetails: [
      "Technician carries genuine certified food-grade replacement filters.",
      "Before and after TDS values recorded digitally on your job card.",
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
    image: image("photo-1581578731548-c64695cc6952"),
    gallery: [
      image("photo-1581578731548-c64695cc6952"),
      image("photo-1527515637462-cff94eecc1ac"),
      image("photo-1584622650111-993a426fbf0a"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Verified Argent Cleaning Team",
    duration: "2 - 3 hours",
    availability: "Available today · Same-day slots open",
    tags: ["Mechanized Scrubbing", "Eco-Friendly Chemicals", "Complete Sanitization"],
    description:
      "Room-by-room meticulous cleaning covering ceiling fan blades, switchboards, floor buffing, window tracks, kitchen counters, and bathroom disinfection.",
    whatsIncluded: [
      "High-grade HEPA vacuuming of furniture, carpets & mattresses",
      "Deep floor scrub with antibacterial Taski disinfectants",
      "Kitchen counter, tile degreasing and stove scrub",
      "Bathroom descaling, mirror polish, and sanitary fixture sanitation",
      "Balcony wash and window track dusting",
    ],
    whatsNotIncluded: [
      "Exterior high-rise window washing requiring harnesses",
      "Disposal of heavy construction debris or renovation debris",
      "Upholstery dry cleaning (available as specialized add-on)",
    ],
    suitableFor:
      "Apartments and homes needing festive preparation, deep monthly sanitation, or post-tenant refresh.",
    importantDetails: [
      "Our 2-member crew arrives equipped with heavy-duty vacuum machines and eco-friendly Taski chemicals.",
      "Please keep delicate valuables and cash in secure lockers.",
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
    image: image("photo-1621905251189-08b45d6a269e"),
    gallery: [
      image("photo-1621905251189-08b45d6a269e"),
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1558008258-3256797b43f3"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Licensed City Electricians",
    duration: "30 - 60 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    tags: ["Emergency Dispatch", "ISI Certified Parts", "30-Day Safety Warranty"],
    description:
      "Fast, safe diagnostics and repair for short circuits, tripping MCBs, switchboard burning, ceiling fan wobble, chandelier hanging, and appliance power cabling.",
    whatsIncluded: [
      "Thorough circuit voltage & earthing resistance inspection",
      "Safe certified replacement of faulty switches, sockets, or breakers",
      "Testing under full appliance load with digital clamp meter",
      "30-day Argent electrical safety warranty",
    ],
    whatsNotIncluded: [
      "Full home concealed wall rewiring (quoted after site inspection)",
      "High-voltage electrical pole mainline connections (handled by electricity board)",
    ],
    suitableFor:
      "Homeowners experiencing power fluctuations, burnt switch smells, dead sockets, or tripping breakers.",
    importantDetails: [
      "Electrician carries standard ISI-certified switches, MCBs, and fire-resistant copper cables.",
      "Emergency 20-minute rapid dispatch available 24/7.",
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
    image: image("photo-1585704032915-c3400ca199e7"),
    gallery: [
      image("photo-1585704032915-c3400ca199e7"),
      image("photo-1584622650111-993a426fbf0a"),
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Licensed Plumbers",
    duration: "30 - 45 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    tags: ["Emergency Drain Unclog", "Leakage Seal", "Sanitary Hardware"],
    description:
      "Rapid resolution for pipe leaks, severe drain blockages, toilet flush malfunction, overhead water tank valve overflow, and bathroom fixture replacement.",
    whatsIncluded: [
      "Acoustic and visual leak detection & pipe pressure check",
      "Drain snake motorized blockage clearance for sinks and showers",
      "Tap spindle, washer & diverter cartridge replacement",
      "Waterproofing Teflon & silicone sealant finish",
    ],
    whatsNotIncluded: [
      "Municipal underground water mainline excavation",
      "Concrete bathroom slab demolition (quoted separately if required)",
    ],
    suitableFor:
      "Any urgent water pipe burst, overflowing toilet, leaking kitchen sink trap, or blocked bathroom drain.",
    importantDetails: [
      "Plumber carries motorized rotary drain augers and pressure fittings.",
      "All plumbing repairs are covered by our 30-day leak-free guarantee.",
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
    image: image("photo-1504148455328-c376907d081c"),
    gallery: [
      image("photo-1504148455328-c376907d081c"),
      image("photo-1600518464441-9154a4dea21b"),
      image("photo-1538688525198-9b88f6f53126"),
      image("photo-1621905252507-b35492cc74b4"),
    ],
    provider: "Master Carpenters",
    duration: "45 mins",
    availability: "Available today",
    tags: ["Door Lock Repairs", "Modular Kitchen Hinges", "Flat-Pack Assembly"],
    description:
      "Professional carpentry for sticky doors, broken door handles, hydraulic kitchen drawer slides, loose wardrobe hinges, and IKEA/flat-pack furniture assembly.",
    whatsIncluded: [
      "Hardware alignment, hinge adjustment, and silicone lubrication",
      "Heavy duty screw re-drilling and wooden wall plug reinforcement",
      "Door latch, deadbolt, and cylinder lock replacement",
      "Precision furniture assembly with level check",
    ],
    whatsNotIncluded: [
      "Custom full-room wardrobe building from raw lumber (requires custom quote)",
      "Wood chemical seasoning",
    ],
    suitableFor:
      "Homeowners with creaking doors, sagging kitchen cabinets, broken bed frames, or new online furniture to assemble.",
    importantDetails: [
      "Carpenter brings cordless impact drills, precision saws, clamps, and hardware fasteners.",
      "Hardware costs (hinges, locks) are billed at MRP or you may supply your own.",
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
    image: image("photo-1558008258-3256797b43f3"),
    gallery: [
      image("photo-1558008258-3256797b43f3"),
      image("photo-1518770660439-4636190af475"),
      image("photo-1563770660941-20978e870e26"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Smart Home Certified Engineers",
    duration: "60 mins",
    availability: "Available today",
    tags: ["Smart Lock", "Video Doorbell", "Alexa/Google Integration"],
    description:
      "Expert physical installation and mobile app integration for smart video doorbells, biometric door locks, smart Wi-Fi switches, automated curtains, and Alexa/Google Home voice assistants.",
    whatsIncluded: [
      "Device physical mounting & electrical wire-in safety setup",
      "Wi-Fi network connection, cloud pairing, and firmware updates",
      "Voice assistant routine & automation scene configuration",
      "Family member phone access sharing walkthrough and demo",
    ],
    whatsNotIncluded: [
      "Providing the physical smart lock or camera hardware (installation service)",
      "High-speed home router broadband provisioning",
    ],
    suitableFor:
      "Families upgrading home security with smart door locks, video doorbells, and hands-free voice-controlled lighting.",
    importantDetails: [
      "Ensure your home 2.4GHz / 5GHz Wi-Fi credentials are handy during the visit.",
      "We configure notifications and live video feeds on all your devices.",
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
    image: image("photo-1562259949-e8e768b8e6e0"),
    gallery: [
      image("photo-1562259949-e8e768b8e6e0"),
      image("photo-1589939705384-5185137a7f0f"),
      image("photo-1600566753190-17f0baa2a6c3"),
      image("photo-1504148455328-c376907d081c"),
    ],
    provider: "Master Painters",
    duration: "Consultation & site visit",
    availability: "Available today",
    tags: ["Laser Dampness Audit", "Dust-Free Mechanized Sanding", "Low-VOC Paint"],
    description:
      "Professional wall inspection, moisture laser measurement, digital color shade consultation, and dust-free mechanized wall painting with complete furniture masking.",
    whatsIncluded: [
      "Wall dampness laser audit and crack diagnostics",
      "Complete furniture plastic masking & floor protective drop sheets",
      "Mechanized sanding with vacuum extraction for dust-free preparation",
      "Double coat premium low-VOC washable emulsion coat application",
      "Final touchup and site cleanup",
    ],
    whatsNotIncluded: [
      "Structural masonry wall rebuilding or external building scaffolding",
      "Specialty Venetian stucco plastering (custom quoted)",
    ],
    suitableFor:
      "Single accent wall touchups, rental handover painting, or full home interior repaint.",
    importantDetails: [
      "Includes initial consultation, shade preview cards, and laser square-foot calculation.",
      "Zero paint splatter guarantee on furniture and flooring.",
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
    image: image("photo-1584622650111-993a426fbf0a"),
    gallery: [
      image("photo-1584622650111-993a426fbf0a"),
      image("photo-1556911220-e15b29be8c8f"),
      image("photo-1581578731548-c64695cc6952"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Argent Sanitization Crew",
    duration: "90 - 120 mins",
    availability: "Available today · Same day slot",
    tags: ["Oil & Grease Removal", "Limescale Descaling", "Steam Sanitization"],
    description:
      "Intensive de-greasing of kitchen backsplash tiles, exhaust fans, stovetops, plus high-temperature steam descaling and anti-bacterial disinfection of bathroom tiles and sanitary fixtures.",
    whatsIncluded: [
      "Mechanized rotary scrubbing of kitchen and bathroom tiles & grout lines",
      "Heavy-duty chemical degreasing of chimney exterior, gas stove & slab",
      "Limescale removal from taps, showerheads, washbasins, and glass partitions",
      "Steam sanitization of toilet bowl, seat, and drain traps",
    ],
    whatsNotIncluded: [
      "Internal chimney motor disassembly (book Chimney Service for full motor service)",
      "Washing utensil piles left in the sink",
    ],
    suitableFor:
      "Homes dealing with greasy kitchen grime, yellow tile grout, hard water stains on taps, or stubborn bathroom limescale.",
    importantDetails: [
      "Our team brings high-temperature commercial steamers and descaling agents.",
      "Tiles look virtually like new after our mechanized scrub.",
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
    image: image("photo-1621905251189-08b45d6a269e"),
    gallery: [
      image("photo-1621905251189-08b45d6a269e"),
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1558008258-3256797b43f3"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Certified Electricians",
    duration: "45 mins",
    availability: "Immediate emergency dispatch in 25 mins",
    tags: ["Ceiling Fan Mounting", "LED Panel Wiring", "Regulator Replacement"],
    description:
      "Ceiling fan mounting, heavy-duty regulator installation, LED false ceiling panel wiring, and socket box replacement with complete load safety check.",
    whatsIncluded: [
      "Ceiling hook inspection, downrod assembly, and blade balancing",
      "Concealed wiring testing with digital circuit tester",
      "Electronic fan regulator & capacitor replacement for proper speed control",
      "Safety earthing verification and run-in test",
    ],
    whatsNotIncluded: [
      "Chandelier heavy crystal assembly requiring specialized scaffolding",
      "Drilling into concrete beams without pre-installed ceiling fan hook",
    ],
    suitableFor:
      "Installing new BLDC energy-saving fans, noisy or wobbling ceiling fans, and dimming regulators.",
    importantDetails: [
      "Electrician brings step ladders and insulated electrical tools.",
      "BLDC remote control pairing included.",
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
    image: image("photo-1584622650111-993a426fbf0a"),
    gallery: [
      image("photo-1584622650111-993a426fbf0a"),
      image("photo-1585704032915-c3400ca199e7"),
      image("photo-1621905252507-b35492cc74b4"),
      image("photo-1600566753190-17f0baa2a6c3"),
    ],
    provider: "Licensed Plumbers",
    duration: "30 mins",
    availability: "Immediate emergency dispatch in 20 mins",
    tags: ["Teflon Seal Protection", "Health Faucet Repair", "Diverter Fitting"],
    description:
      "Installation and repair of bathroom diverters, showerheads, angle valves, health faucets (jet sprays), sink traps, and bottle traps.",
    whatsIncluded: [
      "Fixture installation with high-grade Teflon tape seal",
      "Water pressure testing and aerator cleaning",
      "Rubber gasket & washer leak prevention",
      "Disposal assistance for old corroded fittings",
    ],
    whatsNotIncluded: [
      "Under-tile copper pipe cutting or soldering",
      "Sanitary ware ceramic bowl replacement (quoted as full bathroom refit)",
    ],
    suitableFor:
      "Dripping showerheads, leaking health faucets, loose sink taps, or installing new chrome fixtures.",
    importantDetails: [
      "Plumber carries spare washer kits, braided connection hoses, and angle stop cocks.",
      "Tested under high pressure before job sign-off.",
    ],
    faqs: [],
  },
];

/**
 * Returns a guaranteed 4-item photo gallery for any service
 */
export function getServiceGallery(service) {
  if (service?.gallery && Array.isArray(service.gallery) && service.gallery.length >= 4) {
    return service.gallery.slice(0, 4);
  }
  const baseImg = service?.image || serviceImages.home;
  return [
    baseImg,
    serviceImages.cleaning,
    serviceImages.repair,
    serviceImages.salon,
  ];
}

/**
 * Intelligently returns personalized recommendations matching the selected service
 */
export function getPersonalizedRecommendations(selectedService, limit = 4) {
  if (!selectedService) return allServicesCatalog.slice(0, limit);

  const audience =
    selectedService.targetAudience ||
    (selectedService.name?.toLowerCase().includes("men") ? "men" : "unisex");

  const currentSlug = selectedService.slug;

  if (audience === "men") {
    return allServicesCatalog
      .filter((s) => s.targetAudience === "men" && s.slug !== currentSlug)
      .slice(0, limit);
  }

  if (audience === "women") {
    return allServicesCatalog
      .filter((s) => s.targetAudience === "women" && s.slug !== currentSlug)
      .slice(0, limit);
  }

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
 * Returns contextually related recommendations based on the searched keyword
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

  const popularHomeServices = allServicesCatalog.filter(
    (s) =>
      s.slug === "ac-foam-jet-service" ||
      s.slug === "home-refresh-clean" ||
      s.slug === "electrician-visit",
  );

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
