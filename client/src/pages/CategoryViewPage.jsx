import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85";
import { allServicesCatalog } from "../data/servicesData";

const CATEGORY_DEFINITIONS = {
  cleaning: {
    title: "Cleaning Services",
    eyebrow: "Professional Doorstep Hygiene",
    description:
      "Deep home cleaning, kitchen & bathroom sanitization, sofa & upholstery shampooing with hospital-grade eco-friendly solutions.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Full Home Deep Clean",
      "Kitchen & Bath",
      "Sofa & Carpet",
      "Balcony & Glass",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("cleaning") ||
      s.name.toLowerCase().includes("clean") ||
      s.tags?.some((t) => t.toLowerCase().includes("clean")),
  },
  appliances: {
    title: "Appliance Repair & Servicing",
    eyebrow: "Certified Expert Technicians",
    description:
      "High-precision AC foam-jet servicing, refrigerator cooling fixes, washing machine motors, and microwave & RO purifier tune-ups.",
    image:
      "https://images.unsplash.com/photo-1631545806609-1e3b0a4d7a87?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "AC Service",
      "Refrigerator",
      "Washing Machine",
      "Microwave & RO",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("appliance") ||
      s.name.toLowerCase().includes("ac ") ||
      s.name.toLowerCase().includes("refrigerator") ||
      s.name.toLowerCase().includes("washing") ||
      s.name.toLowerCase().includes("purifier") ||
      s.name.toLowerCase().includes("microwave"),
  },
  "beauty-wellness": {
    title: "Beauty & Wellness",
    eyebrow: "Salon & Spa at Home",
    description:
      "Certified aestheticians and therapists delivering manicures, pedicures, roll-on waxing, stress-relief massages, and haircuts in privacy.",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Women's Salon",
      "Women's Spa",
      "Men's Haircut & Beard",
      "Full Body Massage",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("salon") ||
      s.category.toLowerCase().includes("spa") ||
      s.category.toLowerCase().includes("grooming") ||
      s.category.toLowerCase().includes("massage") ||
      s.name.toLowerCase().includes("waxing") ||
      s.name.toLowerCase().includes("pedicure") ||
      s.name.toLowerCase().includes("haircut") ||
      s.name.toLowerCase().includes("glow"),
  },
  "repairs-installation": {
    title: "Repairs & Installation",
    eyebrow: "Doorstep Trade Specialists",
    description:
      "Licensed electricians, master plumbers, skilled carpenters, and smart home technicians for fast diagnostics and permanent fixes.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Electrician",
      "Plumbing",
      "Carpentry",
      "Smart Home Setup",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("electrician") ||
      s.category.toLowerCase().includes("plumbing") ||
      s.category.toLowerCase().includes("carpenter") ||
      s.category.toLowerCase().includes("smart home") ||
      s.name.toLowerCase().includes("repair") ||
      s.name.toLowerCase().includes("pipe") ||
      s.name.toLowerCase().includes("tap"),
  },
  "home-care": {
    title: "Home Care & Renovation",
    eyebrow: "Craftsmanship & Protection",
    description:
      "Express interior & exterior home painting, decorative 3D wall panels, dampness waterproofing, and curated handyman home maintenance.",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e768b8e6e0?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Home Painting",
      "Wall Paneling",
      "Waterproofing",
      "Handyman Refresh",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("painting") ||
      s.category.toLowerCase().includes("wall panels") ||
      s.name.toLowerCase().includes("painting") ||
      s.name.toLowerCase().includes("panel") ||
      s.name.toLowerCase().includes("refresh"),
  },
  "moving-pest-control": {
    title: "Moving & Pest Control",
    eyebrow: "Seamless Relocation & Defense",
    description:
      "Verified local packers & movers, furniture shifting, anti-termite wood treatment, and government-approved odorless pest control.",
    image:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Packers & Movers",
      "Pest Control",
      "Termite Treatment",
      "Furniture Shifting",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("pest") ||
      s.category.toLowerCase().includes("moving") ||
      s.name.toLowerCase().includes("pest") ||
      s.name.toLowerCase().includes("termite") ||
      s.name.toLowerCase().includes("mover") ||
      s.name.toLowerCase().includes("furniture"),
  },
  others: {
    title: "Specialized Doorstep Services",
    eyebrow: "Emergency & Custom Care",
    description:
      "Certified emergency locksmiths, cooking gas leak safety inspections, CCTV security installation, and rooftop solar panel maintenance.",
    image:
      "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=1200&q=85",
    subcategories: [
      "All",
      "Emergency Locksmith",
      "Gas Safety Check",
      "CCTV Installation",
      "Solar Care",
    ],
    matches: (s) =>
      s.category.toLowerCase().includes("smart") ||
      s.tags?.some((t) => t.toLowerCase().includes("emergency")) ||
      s.name.toLowerCase().includes("gas") ||
      s.name.toLowerCase().includes("locksmith") ||
      s.name.toLowerCase().includes("solar"),
  },
};

export default function CategoryViewPage({
  categorySlug = "cleaning",
  onHome,
  onNavigate,
  onBookService,
  onAddToCart,
}) {
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const categoryDef =
    CATEGORY_DEFINITIONS[categorySlug] || CATEGORY_DEFINITIONS.cleaning;

  // Filter services from catalog
  const filteredServices = useMemo(() => {
    let list = allServicesCatalog.filter(categoryDef.matches);

    // Fallback: If matching yielded fewer than 3 items, supply relevant related catalog services
    if (list.length < 3) {
      const remaining = allServicesCatalog.filter((s) => !list.includes(s));
      list = [...list, ...remaining.slice(0, 4 - list.length)];
    }

    // Apply subcategory filter
    if (selectedSubcategory !== "All") {
      const subq = selectedSubcategory.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(subq) ||
          s.category.toLowerCase().includes(subq) ||
          s.tags?.some((t) => t.toLowerCase().includes(subq)) ||
          s.description?.toLowerCase().includes(subq),
      );
    }

    // Apply search query within this category with tokenized and synonym matching
    if (searchQuery.trim()) {
      const qTokens = searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      const synMap = {
        ac: ["air conditioner", "cooling", "hvac", "foam jet", "appliance"],
        repair: ["service", "fix", "leak", "maintenance", "installation"],
        plumbing: ["plumber", "pipe", "tap", "leak", "drain"],
        cleaning: ["clean", "deep clean", "vacuum", "sanitize", "wash"],
      };

      list = list.filter((s) => {
        const corpus = [
          s.name,
          s.category,
          s.description,
          s.slug?.replace(/-/g, " "),
          s.provider,
          ...(s.tags || []),
          ...(s.whatsIncluded || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return qTokens.every((token) => {
          if (corpus.includes(token)) return true;
          const syns = synMap[token] || [];
          return syns.some((syn) => corpus.includes(syn));
        });
      });
    }

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => (a.numericPrice || 25) - (b.numericPrice || 25));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.numericPrice || 25) - (a.numericPrice || 25));
    } else if (sortBy === "rating") {
      list.sort(
        (a, b) => parseFloat(b.rating || "4.8") - parseFloat(a.rating || "4.8"),
      );
    }

    return list;
  }, [categoryDef, selectedSubcategory, searchQuery, sortBy]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-5">
        <button
          type="button"
          onClick={onHome}
          className="hover:text-emerald-800 transition-colors cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate?.("/services")}
          className="hover:text-emerald-800 transition-colors cursor-pointer"
        >
          Categories
        </button>
        <span>/</span>
        <span className="text-slate-900 font-bold">{categoryDef.title}</span>
      </div>

      {/* Hero Category Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1613] via-[#10231c] to-[#0a120f] text-white p-6 sm:p-8 lg:p-10 shadow-lg mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{categoryDef.eyebrow}</span>
          </div>

          <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {categoryDef.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {categoryDef.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200/90">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 30-Day
              Post-Service Guarantee
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />{" "}
              Background-Verified Pros
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-400" /> Upfront Pricing
            </span>
          </div>
        </div>

        {/* Decorative Background Image Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
          <img
            src={categoryDef.image || FALLBACK_SERVICE_IMAGE}
            alt={categoryDef.title}
            className="w-full h-full object-cover"
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1613] to-transparent" />
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        {/* Subcategory Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categoryDef.subcategories.map((sub) => {
            const isActive = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Right Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "Service" : "Services"}
          </p>
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Filter className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              No services found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your subcategory or clearing the search filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubcategory("All");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map((item) => (
              <div
                key={item.slug || item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  {/* Service Image with Click to Detail */}
                  <div
                    onClick={() => onNavigate?.(`/services/${item.slug}`)}
                    className="relative aspect-[1.3/1] w-full overflow-hidden rounded-xl bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={item.image || FALLBACK_SERVICE_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_SERVICE_IMAGE; }}
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-black text-white shadow-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="mt-3.5">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      {item.category}
                    </p>
                    <h3
                      onClick={() => onNavigate?.(`/services/${item.slug}`)}
                      className="mt-1 text-base font-bold text-slate-900 line-clamp-1 hover:text-emerald-800 cursor-pointer transition-colors"
                    >
                      {item.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA Controls */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Starting at
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddToCart?.(item)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Add to Cart"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onBookService?.(item)}
                      className="flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assurance Section */}
      <div className="mt-16 rounded-3xl bg-slate-100/80 border border-slate-200/80 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                30-Day Doorstep Guarantee
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                If you encounter any issue with the completed job, we dispatch a
                senior expert for a free revisit.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ThumbsUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Upfront Transparent Pricing
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                No hidden costs or unexpected charges. You approve the
                diagnostic quote before work begins.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Standard 45-Min Arrival
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Our automated dispatch system routes nearest verified
                professionals straight to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
