import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Droplets,
  Fan,
  Flame,
  Hammer,
  Heart,
  LocateFixed,
  MapPin,
  Menu,
  Paintbrush,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/common/Footer";
import InfoPage from "./InfoPage";
import AuthModal from "../components/common/AuthModal";
import ArgentNavbar from "../components/common/ArgentNavbar";
import CartDrawer from "../components/common/CartDrawer";
import ProfilePage from "./ProfilePage";
import ServiceDetailPage from "./ServiceDetailPage";
import PaymentPage from "./PaymentPage";
import CategoryViewPage from "./CategoryViewPage";
import OffersPage from "./OffersPage";
import HeroPromoCarousel from "../components/common/HeroPromoCarousel";
import { allServicesCatalog } from "../data/servicesData";
import userStore from "../services/userStore";

const image = (id, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const images = {
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

const categories = [
  ["Home Cleaning", Sparkles, images.cleaning],
  ["Women's Salon & Spa", Bath, images.salon],
  ["Men's Salon & Massage", CircleUserRound, images.haircut],
  ["Cleaning & Pest Control", Droplets, images.cleaning],
  ["Wall Panels", Store, images.panels],
  ["Home Painting", Paintbrush, images.painting],
  ["AC & Appliance Repair", Fan, images.appliance],
  ["Electrician", Zap, images.repair],
  ["Plumbing", Wrench, images.repair],
  ["Carpenter", Hammer, images.moving],
  ["Smart Home Products", Store, images.smart],
];
const makeServices = (items) =>
  items.map((item, index) => ({
    ...item,
    rating: item.rating || (4.7 + (index % 3) / 10).toFixed(1),
    reviews: item.reviews || `${(2.4 + index * 0.7).toFixed(1)}k`,
    price: item.price || `From $${19 + index * 5}`,
  }));
const rails = {
  noteworthy: makeServices([
    { name: "Home refresh clean", image: images.cleaning, badge: "New" },
    { name: "At-home salon glow", image: images.salon, badge: "New" },
    { name: "Smart home setup", image: images.smart, badge: "Popular" },
    { name: "AC foam-jet service", image: images.appliance, badge: "New" },
  ]),
  salon: makeServices([
    { name: "Roll-on waxing", image: images.salon, price: "From $24" },
    { name: "Crystal rose pedicure", image: images.spa, price: "From $32" },
    { name: "Power glow cleanup", image: images.salon, price: "From $29" },
    { name: "Spatula waxing", image: images.salon, price: "From $19" },
  ]),
  spa: makeServices([
    { name: "Leg Relief Massage", image: images.massage, price: "From $39" },
    { name: "Quick Comfort Therapy", image: images.spa, price: "From $35" },
    {
      name: "Top-to-Toe Stress Relief",
      image: images.massage,
      price: "From $59",
    },
    { name: "Full Body Massage & Scrub", image: images.spa, price: "From $69" },
    { name: "Back Relief Massage", image: images.massage, price: "From $32" },
  ]),
  appliance: makeServices([
    { name: "AC Repair", image: images.appliance, price: "From $29" },
    { name: "Foam-Jet AC Service", image: images.appliance, price: "From $35" },
    {
      name: "Water Purifier Service",
      image: images.purifier,
      price: "From $24",
    },
    { name: "TV Check-up", image: images.smart, price: "From $19" },
  ]),
  repairs: makeServices([
    { name: "Electrician visit", image: images.repair, price: "From $19" },
    { name: "Electrical Installation", image: images.smart, price: "From $29" },
    { name: "Plumbing service", image: images.repair, price: "From $24" },
    { name: "Fan Repair", image: images.repair, price: "From $19" },
    { name: "Fixture Installation", image: images.home, price: "From $25" },
    { name: "Carpenter visit", image: images.moving, price: "From $29" },
  ]),
  menMassage: makeServices([
    { name: "Quick Comfort Therapy", image: images.massage, price: "From $35" },
    { name: "Leg Relief Massage", image: images.spa, price: "From $39" },
    { name: "Top-to-Toe Relief", image: images.massage, price: "From $59" },
    { name: "Back Relief Massage", image: images.spa, price: "From $32" },
  ]),
  menSalon: makeServices([
    { name: "Haircut", image: images.haircut, price: "From $20" },
    { name: "Beard Styling", image: images.haircut, price: "From $15" },
    { name: "Hair Styling", image: images.salon, price: "From $22" },
    { name: "Facial", image: images.salon, price: "From $29" },
    { name: "Head Massage", image: images.massage, price: "From $19" },
    { name: "Hair Spa", image: images.salon, price: "From $35" },
  ]),
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const allServices = [
  ...Object.values(rails).flat(),
  ...categories.map(([name, , image]) => ({
    name,
    image,
    rating: "4.8",
    reviews: "3.1k",
    price: "Explore packages",
  })),
].map((service) => ({
  ...service,
  slug: slugify(service.name),
  provider: "Argent Your professionals",
}));
const categoryMap = Object.fromEntries(
  categories.map(([name, Icon, src]) => [
    slugify(name),
    {
      name,
      Icon,
      image: src,
      description: `Trusted ${name.toLowerCase()} professionals, booked around your day.`,
    },
  ]),
);
categoryMap["womens-salon"] = categoryMap["womens-salon-spa"];
categoryMap["mens-salon"] = categoryMap["mens-salon-massage"];
const categoryServices = {
  "womens-salon-spa": rails.salon.concat(rails.spa.slice(0, 2)),
  "mens-salon-massage": rails.menSalon.concat(rails.menMassage.slice(0, 2)),
  "ac-appliance-repair": rails.appliance,
  electrician: rails.repairs.slice(0, 2),
  plumbing: [rails.repairs[2], rails.repairs[4]],
  carpenter: [rails.repairs[5]],
};

function AuthPanel({ onClose, onNavigate, onSuccess, onCancel }) {
  return (
    <AuthModal
      onClose={onClose}
      onNavigate={onNavigate}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

function LocationPicker({ value, onChange, onClose }) {
  const [status, setStatus] = useState("");
  const detect = () => {
    if (!navigator.geolocation) {
      setStatus("Location detection is unavailable");
      return;
    }
    setStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      () => {
        onChange("Current location");
        setStatus("Location detected");
        onClose();
      },
      () => setStatus("Please choose a region manually"),
    );
  };
  return (
    <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <button
        onClick={detect}
        className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold hover:bg-emerald-50"
      >
        <LocateFixed className="h-4 w-4 text-emerald-700" /> Detect my location
      </button>
      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Choose a region
      </p>
      {["Delhi NCR", "Gurugram", "Noida", "South Delhi"].map((region) => (
        <button
          key={region}
          onClick={() => {
            onChange(region);
            onClose();
          }}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          {region}
        </button>
      ))}
      {status && (
        <p className="px-3 pt-2 text-[11px] text-slate-500">{status}</p>
      )}
    </div>
  );
}

function ServiceRail({
  title,
  subtitle,
  items,
  onBook,
  seeAll = true,
  dark = false,
}) {
  const rail = useRef(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const scroll = (amount) =>
    rail.current?.scrollBy({ left: amount, behavior: "smooth" });
  const down = (event) => {
    setDragging(true);
    startX.current = event.pageX;
    startScroll.current = rail.current.scrollLeft;
  };
  const move = (event) => {
    if (!dragging) return;
    rail.current.scrollLeft =
      startScroll.current - (event.pageX - startX.current);
  };
  return (
    <section
      className={`px-5 py-14 lg:px-8 ${dark ? "bg-[#e9eee8]" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Argent Your edit</p>
            <h2 className="display-font mt-3 text-3xl tracking-tight sm:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll(-360)}
              className="circle-button"
              aria-label={`Previous ${title}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(360)}
              className="circle-button"
              aria-label={`Next ${title}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {seeAll && (
              <button
                onClick={() => onBook({ name: title })}
                className="hidden text-sm font-bold text-emerald-800 sm:block"
              >
                See all
              </button>
            )}
          </div>
        </div>
        <div
          ref={rail}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          className={`service-rail ${dragging ? "is-dragging" : ""}`}
        >
          {items.map((item) => (
            <article key={item.name} className="market-card">
              <button
                onClick={() => onBook(item)}
                className="block w-full text-left"
              >
                <div className="relative aspect-[1.16/0.82] overflow-hidden bg-slate-100">
                  <img src={item.image} alt={item.name} draggable="false" />
                  {item.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                    {item.rating}{" "}
                    <span className="font-normal text-slate-400">
                      ({item.reviews})
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    {item.price}
                  </p>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkImageCards({ onBook }) {
  const cards = [
    ["Wall Panels", images.panels],
    ["Wood Polishing", images.home],
    ["Painting", images.painting],
    ["Interior Improvement", images.home],
  ];
  return (
    <section className="bg-white px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="eyebrow">A considered home</p>
          <h2 className="display-font mt-3 text-3xl sm:text-4xl">
            Revamp your space with
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map(([name, src]) => (
            <button
              key={name}
              onClick={() => onBook({ name })}
              className="image-tile"
            >
              <img src={src} alt={name} />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <span className="absolute bottom-4 left-4 text-left text-lg font-bold text-white">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AllServicesCatalogPage({
  onHome,
  onNavigate,
  onAddToCart,
  onProfileClick,
  onCartClick,
  cartCount = 0,
  location = "Delhi NCR",
  onLocationChange,
  onAuthOpen,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);

  const toggleFavorite = (slug) => {
    setFavoriteSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const categories = [
    "All",
    "Men's Salon & Grooming",
    "Women's Salon & Spa",
    "Home Cleaning",
    "AC & Appliance Repair",
    "Electrician",
    "Plumbing",
    "Carpenter",
    "Smart Home Products",
    "Home Painting",
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const queryTokens = trimmedQuery
    ? trimmedQuery.split(/\s+/).filter(Boolean)
    : [];

  const synonymMap = {
    ac: [
      "air conditioner",
      "cooling",
      "hvac",
      "foam jet",
      "gas refill",
      "appliance",
      "ac service",
    ],
    repair: [
      "service",
      "fix",
      "leak",
      "maintenance",
      "installation",
      "replacement",
      "unclog",
    ],
    plumbing: [
      "plumber",
      "pipe",
      "tap",
      "leak",
      "drain",
      "water tank",
      "flush",
    ],
    cleaning: [
      "clean",
      "deep clean",
      "vacuum",
      "sanitize",
      "wash",
      "scrub",
      "maid",
    ],
    electrician: [
      "electric",
      "wiring",
      "fan",
      "switch",
      "light",
      "mcb",
      "fuse",
    ],
    salon: [
      "grooming",
      "haircut",
      "facial",
      "spa",
      "massage",
      "barber",
      "waxing",
    ],
    carpenter: [
      "wood",
      "door",
      "furniture",
      "lock",
      "cabinet",
      "shelf",
      "hinge",
    ],
    painting: ["paint", "wall", "color", "whitewash", "distemper"],
  };

  const filteredServices = allServicesCatalog.filter((item) => {
    const searchableCorpus = [
      item.name,
      item.category,
      item.description,
      item.slug?.replace(/-/g, " "),
      item.provider,
      ...(item.tags || []),
      ...(item.whatsIncluded || []),
      ...(item.importantDetails || []),
      item.suitableFor,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      queryTokens.length === 0 ||
      queryTokens.every((token) => {
        if (searchableCorpus.includes(token)) return true;
        const related = synonymMap[token] || [];
        return related.some((syn) => searchableCorpus.includes(syn));
      });

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return queryTokens.length > 0
      ? matchesSearch
      : matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
      <ArgentNavbar
        onLogoClick={onHome}
        onAuthOpen={onAuthOpen}
        onProfileClick={onProfileClick}
        onCartClick={onCartClick}
        cartCount={cartCount}
        location={location}
        onLocationChange={onLocationChange}
        services={allServicesCatalog}
        onSelectService={(item) => onNavigate(`/services/${item.slug}`)}
        currentRoute="/services"
        onNavigate={onNavigate}
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 sm:pb-32 md:pb-16 pt-4 sm:pt-6 md:pt-24 lg:pt-26 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Complete Doorstep Catalog</p>
            <h1 className="display-font mt-1 text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              All Argent Your Services
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl">
              Certified doorstep experts for home repair, appliance service,
              deep cleaning, and personal grooming.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services (e.g. AC Repair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Status Pill */}
        {trimmedQuery && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Search className="h-3.5 w-3.5 text-emerald-700" />
              <span>
                Showing {filteredServices.length}{" "}
                {filteredServices.length === 1 ? "service" : "services"}{" "}
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-slate-950 text-white shadow-xs scale-102"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Results or Empty State */}
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-2xs">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                No services found for &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any services matching this search. Try
                searching for &ldquo;AC&rdquo;, &ldquo;Cleaning&rdquo;,
                &ldquo;Plumbing&rdquo;, &ldquo;Electrical&rdquo;, or
                &ldquo;Salon&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
            >
              Reset Search & Show All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map((item) => {
              const isFav = favoriteSlugs.includes(item.slug);
              return (
                <div
                  key={item.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xs hover:shadow-md hover:border-emerald-700/30 transition-all"
                >
                  <div>
                    <div
                      onClick={() => onNavigate(`/services/${item.slug}`)}
                      className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black text-slate-800 shadow-2xs flex items-center gap-1">
                        <span>📷 4 Photos</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.slug);
                        }}
                        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                        title={isFav ? "Saved" : "Save service"}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${isFav ? "fill-rose-600 text-rose-600" : "text-slate-400"}`}
                        />
                      </button>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h3
                        onClick={() => onNavigate(`/services/${item.slug}`)}
                        className="cursor-pointer font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-1 font-bold text-slate-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating || "4.9"}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({item.reviews || "2.5k"})
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-800">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/services/${item.slug}`)}
                      className="flex-1 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors text-center cursor-pointer shadow-2xs"
                    >
                      View & Book
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart(item)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-colors cursor-pointer"
                      title="Add to cart"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer
        onNavigate={(path) => (path === "/" ? onHome() : onNavigate(path))}
      />
    </div>
  );
}

function DedicatedPage({
  route,
  onHome,
  onBook,
  authOpen,
  onAuthClose,
  onAuthSuccess,
  onAuthCancel,
  onNavigate,
  onProfileClick,
  onCartClick,
  cartCount = 0,
  location = "Delhi NCR",
  setLocation,
}) {
  const { user } = useAuth();
  const slug = route.split("/").pop();
  const category = categoryMap[slug];
  const isCategory = route.startsWith("/category/") || Boolean(category);
  const service = allServicesCatalog.find((item) => item.slug === slug) ||
    allServices.find((item) => item.slug === slug) || {
      name: slug.replace(/-/g, " "),
      image: images.home,
      rating: "4.9",
      reviews: "2.8k",
      price: "From $29",
      provider: "Argent Your professionals",
    };
  const items = isCategory
    ? categoryServices[slug] || allServicesCatalog.slice(0, 5)
    : [service];
  const title = isCategory ? category?.name || service.name : service.name;
  const description = isCategory
    ? category?.description
    : "A thoughtful, professional service delivered at your doorstep by a trusted Argent Your provider.";

  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950">
      <ArgentNavbar
        onLogoClick={onHome}
        onAuthOpen={() => onBook({ booking: true })}
        onProfileClick={onProfileClick}
        onCartClick={onCartClick}
        cartCount={cartCount}
        location={location}
        onLocationChange={setLocation}
        services={allServicesCatalog}
        onSelectService={(item) => onNavigate(`/services/${item.slug}`)}
        currentRoute={route}
        onNavigate={onNavigate}
      />
      <main className="mx-auto max-w-7xl px-5 pb-28 sm:pb-32 md:pb-16 pt-4 sm:pt-6 md:pt-28 lg:pt-32 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">
              Argent Your / {isCategory ? "Category" : "Service"}
            </p>
            <h1 className="display-font mt-5 text-5xl capitalize leading-tight">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {description}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm font-bold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
              {service.rating}{" "}
              <span className="font-normal text-slate-500">
                ({service.reviews} reviews)
              </span>
            </div>
            <button
              onClick={() => onBook({ ...service, booking: true })}
              className="mt-8 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              Book now <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
          </div>
          <div className="hero-image">
            <img src={category?.image || service.image} alt={title} />
          </div>
        </div>
        <div className="mt-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Curated for you</p>
              <h2 className="display-font mt-3 text-3xl">
                {isCategory ? "Popular services" : "What you get"}
              </h2>
            </div>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.name} className="market-card">
                <button
                  onClick={() => onBook(item)}
                  className="block w-full text-left"
                >
                  <div className="aspect-[1.16/0.82] overflow-hidden">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold capitalize">{item.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Vetted provider, flexible scheduling, and clear upfront
                      pricing.
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                      {item.rating}{" "}
                      <span className="font-normal text-slate-400">
                        ({item.reviews})
                      </span>
                    </div>
                    <p className="mt-3 font-bold">{item.price}</p>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6">
            <h3 className="font-bold">How it works</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose a service, select a convenient time, and let a trusted
              professional take care of the rest.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <h3 className="font-bold">What customers say</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              "Clear communication, lovely work, and no surprises."
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <h3 className="font-bold">Need to know</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reschedule free up to 2 hours before your appointment.
            </p>
          </div>
        </div>
      </main>
      <Footer
        onNavigate={(path) => (path === "/" ? onHome() : onNavigate(path))}
      />
      {authOpen && (
        <AuthPanel
          onClose={onAuthClose}
          onNavigate={onNavigate}
          onSuccess={onAuthSuccess}
          onCancel={onAuthCancel}
        />
      )}
    </div>
  );
}

export default function LoginPage({ onNavigateAdmin, onNavigateTechnician }) {
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();
  const isAuthenticated = Boolean(authIsAuthenticated || user);
  const [authOpen, setAuthOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname || "/");
  const [routeHistory, setRouteHistory] = useState(() => [
    window.location.pathname || "/",
  ]);
  const [location, setLocation] = useState(() => {
    try {
      return localStorage.getItem("argent_selected_location") || "Delhi NCR";
    } catch {
      return "Delhi NCR";
    }
  });

  useEffect(() => {
    if (location) {
      try {
        localStorage.setItem("argent_selected_location", location);
      } catch {}
    }
  }, [location]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutService, setCheckoutService] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    return userStore.getCart(user?.id);
  });

  useEffect(() => {
    const activeCart = userStore.getCart(user?.id);
    setCartItems(activeCart);
    if (user?.id) {
      userStore.fetchCartFromApi(user.id).then((apiCart) => {
        if (Array.isArray(apiCart)) setCartItems(apiCart);
      });
    }
  }, [user?.id]);

  const handleAddToCart = (item) => {
    const updated = userStore.addToCart(user?.id, item);
    setCartItems(updated);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (key, qty) => {
    const updated = userStore.updateCartQuantity(user?.id, key, qty);
    setCartItems(updated);
  };

  const handleRemoveCartItem = (key) => {
    const updated = userStore.removeFromCart(user?.id, key);
    setCartItems(updated);
  };

  const navigate = (path) => {
    if (route === path) return;
    setRouteHistory((prev) => [...prev, path]);
    window.history.pushState({ path }, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    if (route === "/") return;
    setRouteHistory((prev) => [...prev, "/"]);
    window.history.pushState({ path: "/" }, "", "/");
    setRoute("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop(); // remove current route
      const previousRoute = newHistory[newHistory.length - 1];
      setRouteHistory(newHistory);
      window.history.pushState({ path: previousRoute }, "", previousRoute);
      setRoute(previousRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (route !== "/" && route !== "/profile") {
      navigate("/profile");
    } else {
      goHome();
    }
  };

  const goCategory = (name) => navigate(`/services/${slugify(name)}`);

  useEffect(() => {
    const syncRoute = () => {
      const current = window.location.pathname || "/";
      setRoute(current);
      setRouteHistory((prev) => {
        if (prev[prev.length - 1] === current) return prev;
        const index = prev.lastIndexOf(current);
        if (index !== -1) {
          return prev.slice(0, index + 1);
        }
        return [...prev, current];
      });
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  // Restore pending booking after login/signup
  useEffect(() => {
    if (user) {
      try {
        const pendingStr = sessionStorage.getItem("argent_pending_booking");
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          if (pending?.service) {
            setCheckoutService(pending.service);
          }
          if (pending?.couponCode) {
            setAppliedCoupon(pending.couponCode);
          }
          if (pending?.location) {
            setLocation(pending.location);
          }
          sessionStorage.removeItem("argent_pending_booking");
          if (pending?.action === "checkout") {
            navigate("/checkout");
          }
        }
      } catch (err) {
        console.warn("Failed restoring pending booking:", err);
      }
    }
  }, [user]);

  // Guard /checkout route: if unauthenticated, prompt login immediately
  useEffect(() => {
    if (route === "/checkout" && !user) {
      setAuthOpen(true);
    }
  }, [route, user]);

  const handleAuthSuccess = () => {
    try {
      const pendingStr = sessionStorage.getItem("argent_pending_booking");
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending?.service) {
          setCheckoutService(pending.service);
        }
        if (pending?.couponCode) {
          setAppliedCoupon(pending.couponCode);
        }
        if (pending?.location) {
          setLocation(pending.location);
        }
        sessionStorage.removeItem("argent_pending_booking");
        navigate("/checkout");
        return;
      }
    } catch (err) {
      console.warn("Failed restoring booking on auth success:", err);
    }
  };

  const handleAuthCancel = () => {
    sessionStorage.removeItem("argent_pending_booking");
    setAuthOpen(false);
    if (route === "/checkout") {
      goHome();
    }
  };

  const handleProtectedBooking = (item, extra = {}) => {
    if (!user) {
      const pending = {
        service: item,
        serviceId: item?.slug || item?.id || item?.name,
        couponCode: extra.couponCode || appliedCoupon || "",
        location: extra.location || location,
        scheduledDate: extra.scheduledDate || item?.selectedDate || "",
        scheduledTime: extra.scheduledTime || item?.selectedTime || "",
        action: "checkout",
        timestamp: Date.now(),
      };
      sessionStorage.setItem("argent_pending_booking", JSON.stringify(pending));
      setAuthOpen(true);
      return false;
    }
    setCheckoutService({
      ...item,
      selectedDate: extra.scheduledDate || item?.selectedDate,
      selectedTime: extra.scheduledTime || item?.selectedTime,
    });
    if (extra.couponCode) setAppliedCoupon(extra.couponCode);
    navigate("/checkout");
    return true;
  };

  const book = (item) => {
    if (item?.booking || item?.price) {
      handleProtectedBooking(item);
    } else if (item?.name) {
      navigate(`/services/${slugify(item.name)}`);
    } else {
      setAuthOpen(true);
    }
  };

  const profileTabRoutes = {
    "/profile": "overview",
    "/bookings": "bookings",
    "/my-bookings": "bookings",
    "/addresses": "addresses",
    "/payments": "payments",
    "/payment-methods": "payments",
    "/saved": "saved",
    "/saved-services": "saved",
    "/notifications": "notifications",
    "/offers-and-rewards": "offers",
    "/support": "support",
    "/help": "support",
    "/settings": "settings",
  };

  const isCustomerDashboardRoute = Boolean(
    profileTabRoutes[route] || route.startsWith("/bookings/"),
  );

  const handleProfileTabChange = (tabId) => {
    const tabToPath = {
      overview: "/profile",
      bookings: "/bookings",
      addresses: "/addresses",
      payments: "/payment-methods",
      saved: "/saved-services",
      notifications: "/notifications",
      offers: "/offers",
      support: "/support",
      settings: "/settings",
    };
    const targetPath = tabToPath[tabId] || "/profile";
    navigate(targetPath);
  };

  const isBookingsRoute =
    route === "/bookings" ||
    route === "/my-bookings" ||
    route.startsWith("/bookings/");

  if (isCustomerDashboardRoute) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200 w-full max-w-full overflow-x-hidden">
          <ArgentNavbar
            onLogoClick={goHome}
            onAuthOpen={() => setAuthOpen(true)}
            onProfileClick={() => setAuthOpen(true)}
            onCartClick={() => setCartOpen(true)}
            cartCount={cartItems.length}
            location={location}
            onLocationChange={setLocation}
            services={allServicesCatalog}
            onSelectService={(item) => navigate(`/services/${item.slug}`)}
            currentRoute={route}
            onNavigate={navigate}
          />
          <main className="mx-auto max-w-md px-5 py-12 sm:py-16 text-center space-y-6 pt-6 sm:pt-8 md:pt-28">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
              <CircleUserRound className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sign In Required
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Please sign in to your Argent Your account to access your{" "}
                {isBookingsRoute
                  ? "bookings and appointments"
                  : "profile and account details"}
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                Sign In / Register
              </button>
              <button
                type="button"
                onClick={goHome}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </main>
          <AuthPanel
            onClose={() => goHome()}
            onNavigate={navigate}
            onSuccess={(loggedUser) => {
              handleAuthSuccess(loggedUser);
              navigate(route);
            }}
            onCancel={() => goHome()}
          />
          <Footer
            onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
          />
        </div>
      );
    }

    const initialTab = profileTabRoutes[route] || "overview";
    const isStandaloneBookings = isBookingsRoute;

    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200 w-full max-w-full overflow-x-hidden">
        <ArgentNavbar
          onLogoClick={goHome}
          onAuthOpen={() => setAuthOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          services={allServicesCatalog}
          onSelectService={(item) => navigate(`/services/${item.slug}`)}
          currentRoute={route}
          onNavigate={navigate}
        />
        <ProfilePage
          initialTab={initialTab}
          onTabChange={handleProfileTabChange}
          onHome={goHome}
          onBack={goBack}
          onNavigateToService={(slug) => navigate(`/services/${slug}`)}
          onBookService={(service, coupon) => {
            setCheckoutService(service);
            if (coupon) setAppliedCoupon(coupon);
            navigate("/checkout");
          }}
          onNavigateAdmin={onNavigateAdmin}
          onNavigateTechnician={onNavigateTechnician}
          standaloneBookings={isStandaloneBookings}
          isGuest={false}
          onAuthOpen={() => setAuthOpen(true)}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );
  }

  const isInfoRoute =
    !isCustomerDashboardRoute &&
    route !== "/" &&
    route !== "/services" &&
    route !== "/offers" &&
    !route.startsWith("/services/") &&
    !route.startsWith("/category/") &&
    route !== "/checkout";

  if (isInfoRoute)
    return (
      <InfoPage
        path={route}
        onHome={goBack}
        onAuthOpen={() => setAuthOpen(true)}
      />
    );

  if (route === "/checkout")
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200 pb-20 md:pb-0">
        <ArgentNavbar
          onLogoClick={goHome}
          onAuthOpen={() => setAuthOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          services={allServicesCatalog}
          onSelectService={(item) => navigate(`/services/${item.slug}`)}
          currentRoute={route}
          onNavigate={navigate}
        />
        <PaymentPage
          service={checkoutService || allServicesCatalog[0]}
          onHome={goBack}
          onViewBookings={() => navigate("/bookings")}
          onOrderCreated={(orderData) => {
            userStore.addBooking(user?.id, orderData);
            if (orderData.slug) {
              const remaining = userStore.removeFromCart(
                user?.id,
                orderData.slug,
              );
              setCartItems(remaining);
            }
          }}
          initialLocation={location}
          initialPromoCode={appliedCoupon}
          onAuthRequired={() => setAuthOpen(true)}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );

  if (route.startsWith("/services/")) {
    const slug = route.split("/").pop();
    const service = allServicesCatalog.find((s) => s.slug === slug) ||
      allServices.find((s) => s.slug === slug) || {
        name: slug.replace(/-/g, " "),
        image: images.home,
        rating: "4.9",
        reviews: "2.8k",
        price: "From $29",
        numericPrice: 29,
        targetAudience: "unisex",
        slug: slug,
      };

    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
        <ArgentNavbar
          onLogoClick={goHome}
          onAuthOpen={() => setAuthOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          services={allServicesCatalog}
          onSelectService={(item) => navigate(`/services/${item.slug}`)}
          currentRoute={route}
          onNavigate={navigate}
        />
        <ServiceDetailPage
          service={service}
          onHome={goBack}
          onBookNow={(item, extra) => handleProtectedBooking(item, extra)}
          onAddToCart={handleAddToCart}
          onSelectRecommendation={(item) => navigate(`/services/${item.slug}`)}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );
  }

  if (route === "/services")
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
        <AllServicesCatalogPage
          onHome={goBack}
          onNavigate={navigate}
          onAddToCart={handleAddToCart}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          onAuthOpen={() => setAuthOpen(true)}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );

  if (route === "/offers")
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
        <ArgentNavbar
          onLogoClick={goHome}
          onAuthOpen={() => setAuthOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          services={allServicesCatalog}
          onSelectService={(item) => navigate(`/services/${item.slug}`)}
          currentRoute={route}
          onNavigate={navigate}
        />
        <div className="pt-4 sm:pt-6 md:pt-24 lg:pt-26 pb-28 sm:pb-32 md:pb-10">
          <OffersPage
            onHome={goBack}
            onNavigate={navigate}
            onBookWithCoupon={(service, coupon) => {
              handleProtectedBooking(service, { couponCode: coupon });
            }}
          />
        </div>
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );

  if (route.startsWith("/category/")) {
    let catSlug = route.replace("/category/", "").split("/")[0];
    const categorySlugAliases = {
      "home-cleaning": "cleaning",
      "ac-appliance-repair": "appliances",
      "ac-and-appliance-repair": "appliances",
      "womens-salon-spa": "beauty-wellness",
      "mens-salon-massage": "beauty-wellness",
      "womens-salon": "beauty-wellness",
      "mens-salon": "beauty-wellness",
      electrician: "repairs-installation",
      plumbing: "repairs-installation",
      carpenter: "repairs-installation",
      "smart-home-products": "repairs-installation",
      "home-painting": "home-care",
      "wall-panels": "home-care",
      "cleaning-pest-control": "moving-pest-control",
      "pest-control": "moving-pest-control",
      "packers-movers": "moving-pest-control",
    };
    if (categorySlugAliases[catSlug]) {
      catSlug = categorySlugAliases[catSlug];
    }
    return (
      <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
        <ArgentNavbar
          onLogoClick={goHome}
          onAuthOpen={() => setAuthOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          onLocationChange={setLocation}
          services={allServicesCatalog}
          onSelectService={(item) => navigate(`/services/${item.slug}`)}
          currentRoute={route}
          onNavigate={navigate}
        />
        <div className="pt-4 sm:pt-6 md:pt-24 lg:pt-26 pb-28 sm:pb-32 md:pb-10">
          <CategoryViewPage
            categorySlug={catSlug}
            onHome={goBack}
            onNavigate={navigate}
            onBookService={(service) => handleProtectedBooking(service)}
            onAddToCart={handleAddToCart}
          />
        </div>
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
        {authOpen && (
          <AuthPanel
            onClose={() => setAuthOpen(false)}
            onNavigate={navigate}
            onSuccess={handleAuthSuccess}
            onCancel={handleAuthCancel}
          />
        )}
      </div>
    );
  }

  if (route !== "/")
    return (
      <>
        <DedicatedPage
          route={route}
          onHome={goBack}
          onNavigate={navigate}
          onBook={book}
          authOpen={authOpen}
          onAuthClose={() => setAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          onAuthCancel={handleAuthCancel}
          onProfileClick={() => navigate("/profile")}
          onCartClick={() => setCartOpen(true)}
          cartCount={cartItems.length}
          location={location}
          setLocation={setLocation}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCartOpen(false);
              handleProtectedBooking(cartItems[0]);
            }
          }}
        />
      </>
    );
  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950 selection:bg-emerald-200">
      <ArgentNavbar
        onLogoClick={goHome}
        onAuthOpen={() => setAuthOpen(true)}
        onProfileClick={() => navigate("/profile")}
        onCartClick={() => setCartOpen(true)}
        cartCount={cartItems.length}
        location={location}
        onLocationChange={setLocation}
        services={allServicesCatalog}
        onSelectService={(item) => navigate(`/services/${item.slug}`)}
        currentRoute={route}
        onNavigate={navigate}
      />
      <main>
        <section className="px-5 pb-12 pt-36 sm:pt-40 md:pt-24 lg:pt-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:gap-12 lg:grid-cols-2">
            <div className="animate-rise-in">
              <p className="eyebrow tracking-wider uppercase">
                Trusted care, beautifully delivered
              </p>
              <h1 className="display-font mt-4 max-w-xl text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.04] tracking-tight text-slate-950">
                Home services at your{" "}
                <em className="text-emerald-800 not-italic">doorstep.</em>
              </h1>
              <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600">
                Professional services, delivered to your doorstep.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("categories")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="mt-7 flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-emerald-800 shadow-sm cursor-pointer"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-700" /> Same-day
                  support
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-700" /> Vetted
                  professionals
                </span>
              </div>
            </div>
            <div className="w-full flex items-center justify-center">
              <HeroPromoCarousel
                onSelectService={(item) => navigate(`/services/${item.slug}`)}
                onUseCoupon={(slug, coupon) => {
                  const target =
                    allServicesCatalog.find((s) => s.slug === slug) ||
                    allServicesCatalog[0];
                  handleProtectedBooking(target, { couponCode: coupon });
                }}
              />
            </div>
          </div>
        </section>
        <section id="categories" className="bg-white px-5 py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="eyebrow tracking-wider uppercase">Our Services</p>
                <h2 className="display-font mt-3 text-3xl sm:text-4xl">
                  What can we help with?
                </h2>
              </div>
              <p className="hidden max-w-xs text-sm leading-6 text-slate-500 sm:block">
                Professional hands, thoughtful service, all in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map(([name, Icon, src]) => (
                <button
                  key={name}
                  onClick={() => goCategory(name)}
                  className="category-card"
                >
                  <div className="category-image">
                    <img src={src} alt={name} />
                    <span>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-5">{name}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        <ServiceRail
          title="New and Noteworthy"
          items={rails.noteworthy}
          onBook={book}
          dark
        />
        <ServiceRail
          title="Salon for Women"
          subtitle="Pamper yourself at home"
          items={rails.salon}
          onBook={book}
        />
        <DarkImageCards onBook={book} />
        <ServiceRail
          title="Spa for Women"
          items={rails.spa}
          onBook={book}
          dark
        />
        <ServiceRail
          title="Appliance Repair & Service"
          items={rails.appliance}
          onBook={book}
        />
        <ServiceRail
          title="Home Repair & Installation"
          items={rails.repairs}
          onBook={book}
          dark
        />
        <section className="promo-section">
          <img
            src={images.smart}
            alt="Smart home product in a modern interior"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="relative z-10 max-w-xl text-white">
            <p className="eyebrow text-emerald-200">Argent Your living</p>
            <h2 className="display-font mt-4 text-4xl sm:text-5xl">
              Upgrade your home
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
              Smart solutions for modern living, selected to make every room
              work better.
            </p>
            <button
              onClick={book}
              className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-100"
            >
              Explore now
            </button>
          </div>
        </section>
        <ServiceRail
          title="Salon for Men"
          items={rails.menSalon}
          onBook={book}
        />
        <ServiceRail
          title="Massage for Men"
          items={rails.menMassage}
          onBook={book}
          dark
        />
        <ServiceRail
          title="Most Booked Services"
          subtitle="The services your neighbours return to"
          items={[...rails.repairs.slice(0, 3), ...rails.salon.slice(0, 2)]}
          onBook={book}
        />
      </main>
      <Footer onNavigate={(path) => navigate(path)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          if (cartItems.length > 0) {
            setCartOpen(false);
            handleProtectedBooking(cartItems[0]);
          }
        }}
      />
      {authOpen && (
        <AuthPanel
          onClose={() => setAuthOpen(false)}
          onNavigate={navigate}
          onSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
        />
      )}
    </div>
  );
}
