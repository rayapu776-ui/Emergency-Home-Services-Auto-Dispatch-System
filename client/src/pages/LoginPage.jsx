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
  LocateFixed,
  MapPin,
  Menu,
  Paintbrush,
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
import HeroPromoCarousel from "../components/common/HeroPromoCarousel";
import { allServicesCatalog } from "../data/servicesData";

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

function LegacyAuthPanel({ onClose }) {
  const { login, register, demoLogin } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (registering) await register({ ...form, role: "customer" });
      else await login(form.email, form.password);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const guest = async () => {
    setLoading(true);
    try {
      await demoLogin("customer");
      onClose();
    } catch {
      setError("Guest access is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl animate-rise-in">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="eyebrow">Argent Your</p>
        <h2 className="display-font mt-3 text-3xl">
          {registering ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Book trusted care for your home and yourself.
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-3">
          {registering && (
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="auth-input"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            className="auth-input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            className="auth-input"
          />
          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading
              ? "Opening..."
              : registering
                ? "Create account"
                : "Continue"}
          </button>
        </form>
        <button
          onClick={guest}
          className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:border-slate-400"
        >
          Explore as a guest
        </button>
        <button
          onClick={() => {
            setRegistering(!registering);
            setError("");
          }}
          className="mt-5 w-full text-xs font-semibold text-slate-500 hover:text-emerald-700"
        >
          {registering
            ? "Already have an account? Sign in"
            : "New to Argent Your? Create an account"}
        </button>
      </div>
    </div>
  );
}

function AuthPanel({ onClose, onNavigate }) {
  return <AuthModal onClose={onClose} onNavigate={onNavigate} />;
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

function DedicatedPage({
  route,
  onHome,
  onBook,
  authOpen,
  onAuthClose,
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
  const service = allServices.find((item) => item.slug === slug) || {
    name: slug.replace(/-/g, " "),
    image: images.home,
    rating: "4.9",
    reviews: "2.8k",
    price: "From $29",
    provider: "Argent Your professionals",
  };
  const items = isCategory
    ? categoryServices[slug] || allServices.slice(0, 5)
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
        services={allServices}
        onSelectService={(item) => onNavigate(`/services/${item.slug}`)}
      />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-36 lg:px-8">
        <button
          onClick={onHome}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Home
        </button>
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
      {authOpen && <AuthPanel onClose={onAuthClose} onNavigate={onNavigate} />}
    </div>
  );
}

export default function LoginPage({ onNavigateAdmin, onNavigateTechnician }) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname || "/");
  const [location, setLocation] = useState("Delhi NCR");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutService, setCheckoutService] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [cartItems, setCartItems] = useState([
    {
      name: "AC foam-jet service",
      price: "From $35",
      quantity: 1,
      image: images.appliance,
      slug: "ac-foam-jet-service",
    },
    {
      name: "Home refresh clean",
      price: "From $19",
      quantity: 1,
      image: images.cleaning,
      slug: "home-refresh-clean",
    },
  ]);

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.pathname || "/");
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setRoute("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goCategory = (name) => navigate(`/services/${slugify(name)}`);

  const book = (item) => {
    if (item?.booking) {
      if (!user) {
        setAuthOpen(true);
      } else {
        setCheckoutService(item);
        navigate("/checkout");
      }
    } else if (item?.name) {
      navigate(`/services/${slugify(item.name)}`);
    } else {
      setAuthOpen(true);
    }
  };

  const isInfoRoute =
    route !== "/" &&
    !route.startsWith("/services/") &&
    !route.startsWith("/category/") &&
    route !== "/profile" &&
    route !== "/checkout";

  if (isInfoRoute)
    return (
      <InfoPage
        path={route}
        onHome={goHome}
        onAuthOpen={() => setAuthOpen(true)}
      />
    );

  if (route === "/checkout")
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
        />
        <PaymentPage
          service={checkoutService || allServicesCatalog[0]}
          onHome={goHome}
          onViewBookings={() => navigate("/profile")}
          initialLocation={location}
          initialPromoCode={appliedCoupon}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={(key, qty) => {
            setCartItems((prev) =>
              prev.map((it) =>
                it.slug === key || it.name === key
                  ? { ...it, quantity: qty }
                  : it,
              ),
            );
          }}
          onRemoveItem={(key) => {
            setCartItems((prev) =>
              prev.filter((it) => it.slug !== key && it.name !== key),
            );
          }}
          onCheckout={() => setCartOpen(false)}
        />
        {authOpen && (
          <AuthPanel onClose={() => setAuthOpen(false)} onNavigate={navigate} />
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
        />
        <ServiceDetailPage
          service={service}
          onHome={goHome}
          onBookNow={(item) => {
            setCheckoutService(item);
            navigate("/checkout");
          }}
          onAddToCart={(item) => {
            setCartItems((prev) => {
              const exists = prev.find((it) => it.slug === item.slug);
              if (exists) {
                return prev.map((it) =>
                  it.slug === item.slug
                    ? { ...it, quantity: (it.quantity || 1) + 1 }
                    : it,
                );
              }
              return [...prev, { ...item, quantity: 1 }];
            });
            setCartOpen(true);
          }}
          onSelectRecommendation={(item) => navigate(`/services/${item.slug}`)}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={(key, qty) => {
            setCartItems((prev) =>
              prev.map((it) =>
                it.slug === key || it.name === key
                  ? { ...it, quantity: qty }
                  : it,
              ),
            );
          }}
          onRemoveItem={(key) => {
            setCartItems((prev) =>
              prev.filter((it) => it.slug !== key && it.name !== key),
            );
          }}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCheckoutService(cartItems[0]);
              setCartOpen(false);
              navigate("/checkout");
            }
          }}
        />
        {authOpen && (
          <AuthPanel onClose={() => setAuthOpen(false)} onNavigate={navigate} />
        )}
      </div>
    );
  }

  if (route === "/profile")
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
        />
        <ProfilePage
          onHome={goHome}
          onNavigateToService={(slug) => navigate(`/services/${slug}`)}
          onNavigateAdmin={onNavigateAdmin}
          onNavigateTechnician={onNavigateTechnician}
        />
        <Footer
          onNavigate={(path) => (path === "/" ? goHome() : navigate(path))}
        />
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={(key, qty) => {
            setCartItems((prev) =>
              prev.map((it) =>
                it.slug === key || it.name === key
                  ? { ...it, quantity: qty }
                  : it,
              ),
            );
          }}
          onRemoveItem={(key) => {
            setCartItems((prev) =>
              prev.filter((it) => it.slug !== key && it.name !== key),
            );
          }}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCheckoutService(cartItems[0]);
              setCartOpen(false);
              navigate("/checkout");
            }
          }}
        />
        {authOpen && (
          <AuthPanel onClose={() => setAuthOpen(false)} onNavigate={navigate} />
        )}
      </div>
    );

  if (route !== "/")
    return (
      <>
        <DedicatedPage
          route={route}
          onHome={goHome}
          onNavigate={navigate}
          onBook={book}
          authOpen={authOpen}
          onAuthClose={() => setAuthOpen(false)}
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
          onUpdateQuantity={(key, qty) => {
            setCartItems((prev) =>
              prev.map((it) =>
                it.slug === key || it.name === key
                  ? { ...it, quantity: qty }
                  : it,
              ),
            );
          }}
          onRemoveItem={(key) => {
            setCartItems((prev) =>
              prev.filter((it) => it.slug !== key && it.name !== key),
            );
          }}
          onCheckout={() => {
            if (cartItems.length > 0) {
              setCheckoutService(cartItems[0]);
              setCartOpen(false);
              navigate("/checkout");
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
      />
      <main>
        <section className="px-5 pb-12 pt-36 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="animate-rise-in">
              <p className="eyebrow">Trusted care, beautifully delivered</p>
              <h1 className="display-font mt-5 max-w-2xl text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[70px]">
                Home services at your{" "}
                <em className="text-emerald-800">doorstep.</em>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
                Professional services, delivered to your doorstep.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("categories")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="mt-8 flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-9 flex gap-5 text-xs font-semibold text-slate-500">
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
            <div className="w-full">
              <HeroPromoCarousel
                onSelectService={(item) => navigate(`/services/${item.slug}`)}
                onUseCoupon={(slug, coupon) => {
                  const target =
                    allServicesCatalog.find((s) => s.slug === slug) ||
                    allServicesCatalog[0];
                  setCheckoutService(target);
                  setAppliedCoupon(coupon);
                  navigate("/checkout");
                }}
              />
            </div>
          </div>
        </section>
        <section id="categories" className="bg-white px-5 py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="eyebrow">Find your fit</p>
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
        onUpdateQuantity={(key, qty) => {
          setCartItems((prev) =>
            prev.map((it) =>
              it.slug === key || it.name === key
                ? { ...it, quantity: qty }
                : it,
            ),
          );
        }}
        onRemoveItem={(key) => {
          setCartItems((prev) =>
            prev.filter((it) => it.slug !== key && it.name !== key),
          );
        }}
        onCheckout={() => {
          if (cartItems.length > 0) {
            setCheckoutService(cartItems[0]);
            setCartOpen(false);
            navigate("/checkout");
          }
        }}
      />
      {authOpen && (
        <AuthPanel onClose={() => setAuthOpen(false)} onNavigate={navigate} />
      )}
    </div>
  );
}
