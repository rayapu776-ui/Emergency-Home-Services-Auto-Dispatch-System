import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Home,
  LayoutGrid,
  LocateFixed,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import { getRelatedSearchRecommendations } from "../../data/servicesData";

function LocationPicker({ value, onChange, onClose }) {
  const [status, setStatus] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/location/search?query=${encodeURIComponent(searchQuery.trim())}`,
        );
        const data = await res.json();
        const list = data.suggestions || data.results || [];
        if (Array.isArray(list)) {
          setSearchResults(list);
        }
      } catch (err) {
        console.warn("Location search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Location detection is unavailable in your browser");
      return;
    }
    setIsDetecting(true);
    setStatus("Accessing GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setStatus("Resolving address via Google / Maps...");

        try {
          const res = await fetch(
            `/api/location/reverse-geocode?lat=${lat}&lon=${lon}`,
          );
          const data = await res.json();

          if (data && (data.formattedAddress || data.city)) {
            const display = data.city
              ? `${data.city}, ${data.state || "India"}`
              : data.formattedAddress;
            onChange(display, {
              lat,
              lon,
              fullAddress: data.fullAddress || data.formattedAddress,
              city: data.city,
            });
            setStatus(`Detected: ${data.city || display}`);
            setTimeout(onClose, 500);
          } else {
            onChange("Current Location", { lat, lon });
            onClose();
          }
        } catch (err) {
          console.warn("Geocoding failed:", err);
          onChange("Delhi NCR", { lat: 28.6139, lon: 77.209 });
          onClose();
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Location permission denied. Pick your city below.");
        } else {
          setStatus("Could not get location. Pick your city below.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSelect = (loc, coords) => {
    onChange(loc, coords);
    onClose();
  };

  const popularRegions = [
    { name: "Delhi NCR", lat: 28.6139, lon: 77.209 },
    { name: "Noida", lat: 28.5355, lon: 77.391 },
    { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
    { name: "South Delhi", lat: 28.5494, lon: 77.2001 },
    { name: "Central Delhi", lat: 28.6328, lon: 77.2197 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  ];

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur-xl animate-rise-in text-slate-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Select Location</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose where you want doorstep service
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={detectLocation}
        disabled={isDetecting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 border border-emerald-200/60 hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
      >
        <LocateFixed
          className={`h-4 w-4 text-emerald-700 ${isDetecting ? "animate-spin" : ""}`}
        />
        <span>
          {isDetecting ? "Detecting GPS..." : "Detect Current Location"}
        </span>
      </button>

      {status && (
        <p className="mt-2 text-center text-[11px] font-medium text-emerald-700 bg-emerald-50/50 rounded-lg py-1 px-2">
          {status}
        </p>
      )}

      {/* Location Search Bar with live autocomplete */}
      <div className="mt-4">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Search Area, Colony or Street
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Indirapuram, Sector 62, Hauz Khas"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Live Search Suggestions dropdown */}
        {isSearching && (
          <p className="text-[10px] text-slate-400 mt-1 pl-1">
            Searching locations...
          </p>
        )}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-36 overflow-y-auto space-y-1 rounded-xl border border-slate-100 bg-slate-50/80 p-1.5">
            {searchResults.map((item, idx) => {
              const label =
                typeof item === "string"
                  ? item
                  : item.description || item.formattedAddress || item.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelect(label, {
                      lat: item.lat || 28.6139,
                      lon: item.lon || 77.209,
                    })
                  }
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-800 hover:bg-emerald-100/60 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Cities */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Popular Regions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {popularRegions.map((region) => (
            <button
              key={region.name}
              type="button"
              onClick={() =>
                handleSelect(region.name, {
                  lat: region.lat,
                  lon: region.lon,
                })
              }
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-all cursor-pointer ${
                value === region.name
                  ? "bg-emerald-950 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-950"
              }`}
            >
              <MapPin
                className={`h-3 w-3 ${value === region.name ? "text-emerald-400" : "text-slate-400"}`}
              />
              <span className="truncate">{region.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArgentNavbar({
  onLogoClick,
  onAuthOpen,
  onProfileClick,
  onCartClick,
  cartCount = 0,
  location = "Delhi NCR",
  onLocationChange,
  services = [],
  onSelectService,
  currentRoute = "/",
  onNavigate,
}) {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const desktopSearchWrapRef = useRef(null);
  const mobileSearchWrapRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideDesktop =
        desktopSearchWrapRef.current &&
        desktopSearchWrapRef.current.contains(e.target);
      const insideMobile =
        mobileSearchWrapRef.current &&
        mobileSearchWrapRef.current.contains(e.target);

      if (!insideDesktop && !insideMobile) {
        setDropdownOpen(false);
      }
      if (locationOpen) setLocationOpen(false);
      if (notificationsOpen) setNotificationsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [locationOpen, notificationsOpen]);

  const searchResults = search.trim()
    ? services
        .filter((item) => {
          const q = search.trim().toLowerCase();
          const name = item.name.toLowerCase();
          const cat = (item.category || "").toLowerCase();
          const prov = (item.provider || "").toLowerCase();
          const aud = (item.targetAudience || "").toLowerCase();

          if (name.includes(q)) return true;
          if (cat.includes(q)) return true;
          if (prov.includes(q)) return true;
          if (q === "men" && aud === "men") return true;
          if (q === "women" && aud === "women") return true;
          return false;
        })
        .sort((a, b) => {
          const q = search.trim().toLowerCase();
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          // Specific user example ordering for "men" query
          if (q === "men") {
            const priority = [
              "men's grooming package",
              "men's facial cleanup",
              "men's haircut",
              "beard styling",
              "head & shoulder massage",
            ];
            const aIdx = priority.findIndex((p) => aName.includes(p));
            const bIdx = priority.findIndex((p) => bName.includes(p));
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
          }

          // Exact prefix matches first
          const aStarts = aName.startsWith(q) ? -1 : 0;
          const bStarts = bName.startsWith(q) ? -1 : 0;
          if (aStarts !== bStarts) return aStarts - bStarts;

          // Name contains before other fields
          const aInName = aName.includes(q) ? -1 : 0;
          const bInName = bName.includes(q) ? -1 : 0;
          if (aInName !== bInName) return aInName - bInName;

          return 0;
        })
        .slice(0, 8)
    : [];

  const relatedRecommendations = search.trim()
    ? getRelatedSearchRecommendations(search, 5)
    : [];

  const handleSelectResult = (item) => {
    setDropdownOpen(false);
    onSelectService?.(item);
  };

  return (
    <>
      {/* =========================================================================
          TOP HEADER (Fixed at top)
          - Desktop (md+): Single Main Navbar
          - Mobile (<md): Row 1 Main Header -> Row 2 Location -> Row 3 Search Bar
         ========================================================================= */}
      <header className="fixed left-0 right-0 top-0 z-40 select-none">
        {/* ==================== DESKTOP / LAPTOP (md and above) ==================== */}
        <div className="hidden md:block px-4 lg:px-7 pt-4">
          <div className="mx-auto max-w-7xl rounded-2xl border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(27,45,39,0.08)] backdrop-blur-xl">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:gap-4 lg:gap-6 lg:px-7">
              {/* LEFT: Logo */}
              <button
                type="button"
                onClick={onLogoClick}
                className="flex shrink-0 items-center gap-2.5 sm:gap-3 cursor-pointer group"
                title="Argent Your - Back to Home"
              >
                <img
                  src="/argent-logo.png"
                  alt="Argent Your"
                  className="h-10 w-10 rounded-xl object-contain shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  Argent Your
                </span>
              </button>

              {/* CENTER: LARGE SEARCH BAR */}
              <div
                ref={desktopSearchWrapRef}
                className="relative flex-1 max-w-2xl lg:max-w-3xl mx-1 sm:mx-4"
              >
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (search.trim()) setDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setDropdownOpen(false);
                      }
                    }}
                    placeholder="Search anything..."
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 shadow-xs"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Panel Desktop */}
                {dropdownOpen && search.trim() && (
                  <div
                    className="absolute left-0 right-0 top-full mt-2.5 z-50 rounded-3xl border border-white/70 bg-white/95 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] backdrop-blur-2xl animate-rise-in text-slate-900 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100/90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* LEFT SIDE — SEARCH RESULTS */}
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col">
                      <div className="px-1 pb-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-100/80 mb-3">
                        <span>
                          Search Results ({searchResults.length}) for '{search}'
                        </span>
                      </div>

                      <div className="max-h-[384px] overflow-y-auto overscroll-contain space-y-2 pr-1.5 scrollbar-thin">
                        {searchResults.map((item) => (
                          <button
                            key={item.slug || item.name}
                            type="button"
                            onClick={() => handleSelectResult(item)}
                            className="group flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 bg-white/60 hover:bg-emerald-50/70 border border-slate-200/50 hover:border-emerald-200/80 shadow-2xs hover:shadow-xs cursor-pointer"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-14 w-14 rounded-xl object-cover border border-slate-100/90 shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-950 truncate">
                                  {item.name}
                                </span>
                                <span className="text-xs font-black text-emerald-900 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0">
                                  {item.price}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-emerald-700 truncate">
                                  {item.category || "Argent Service"}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 truncate">
                                  {item.provider || "Argent Verified"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mt-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                <span>{item.rating || "4.8"}</span>
                                <span className="text-slate-400 font-normal">
                                  ({item.reviews || "2.4k"} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100/80 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0 ml-1">
                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        ))}
                        {searchResults.length === 0 && (
                          <div className="py-12 px-4 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                              No direct matches found for '{search}'
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Check related services on the right or try another keyword.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT SIDE — RELATED SERVICES */}
                    <div className="w-full md:w-72 lg:w-80 shrink-0 bg-slate-50/60 p-4 sm:p-5 flex flex-col">
                      <div className="px-1 pb-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-100/80 mb-3">
                        <span className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          Related Services
                        </span>
                      </div>
                      <div className="max-h-[384px] overflow-y-auto overscroll-contain space-y-2 pr-1.5 scrollbar-thin">
                        {relatedRecommendations.map((rec) => (
                          <button
                            key={rec.slug || rec.name}
                            type="button"
                            onClick={() => handleSelectResult(rec)}
                            className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-200 bg-white/90 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-200 shadow-2xs hover:shadow-xs cursor-pointer"
                          >
                            {rec.image && (
                              <img
                                src={rec.image}
                                alt={rec.name}
                                className="h-11 w-11 rounded-xl object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-200"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                                {rec.name}
                              </span>
                              <span className="block text-[11px] font-semibold text-emerald-800 mt-0.5">
                                {rec.price}
                              </span>
                            </div>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/70 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
                              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE ACTIONS */}
              {!isAuthenticated ? (
                /* BEFORE LOGIN: [ Cart ] [ Sign in / Log in ] */
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={onCartClick}
                    className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors"
                    aria-label="Cart"
                    title="View cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-black text-white shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onAuthOpen}
                    className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow"
                  >
                    <CircleUserRound className="h-4 w-4" />
                    <span className="whitespace-nowrap">Sign in / Log in</span>
                  </button>
                </div>
              ) : (
                /* AFTER LOGIN: [ Location ] [ Cart ] [ Notification ] [ Profile ] */
                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                  {/* Location button */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setLocationOpen(!locationOpen);
                        setNotificationsOpen(false);
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 hover:bg-white/80 transition-colors cursor-pointer"
                      title="Choose service location"
                    >
                      <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                      <span className="max-w-[120px] truncate">{location}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </button>
                    {locationOpen && (
                      <LocationPicker
                        value={location}
                        onChange={(newLoc, coords) => {
                          onLocationChange?.(newLoc, coords);
                          setLocationOpen(false);
                        }}
                        onClose={() => setLocationOpen(false)}
                      />
                    )}
                  </div>

                  {/* Cart button */}
                  <button
                    type="button"
                    onClick={onCartClick}
                    className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors cursor-pointer"
                    aria-label="Cart"
                    title="View cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-black text-white shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* Notification button */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setLocationOpen(false);
                      }}
                      className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors cursor-pointer"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                    </button>
                    {notificationsOpen && (
                      <NotificationDropdown
                        onClose={() => setNotificationsOpen(false)}
                      />
                    )}
                  </div>

                  {/* Profile button */}
                  <button
                    type="button"
                    onClick={onProfileClick}
                    className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors cursor-pointer"
                    aria-label="Profile"
                    title="My Profile"
                  >
                    <CircleUserRound className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== MOBILE (under md) ==================== */}
        {/* Sequence:
            1. MAIN HEADER (Logo + Cart, Notification, Profile/Login)
            2. LOCATION (Above Search Bar)
            3. SEARCH BAR
        */}
        <div className="block md:hidden px-3 pt-2.5">
          <div className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_30px_rgba(27,45,39,0.08)] backdrop-blur-xl p-3 space-y-2.5">
            {/* ROW 1: MAIN HEADER */}
            <div className="flex items-center justify-between gap-2">
              {/* Left: Argent Your Logo */}
              <button
                type="button"
                onClick={onLogoClick}
                className="flex items-center gap-2 cursor-pointer"
                title="Argent Your"
              >
                <img
                  src="/argent-logo.png"
                  alt="Argent Your"
                  className="h-8 w-8 rounded-xl object-contain shadow-xs"
                />
                <span className="text-base font-black tracking-tight text-slate-900">
                  Argent Your
                </span>
              </button>

              {/* Right: Cart, Notification, Profile / Login */}
              <div className="flex items-center gap-1 text-slate-700">
                {/* 🛒 Cart */}
                <button
                  type="button"
                  onClick={onCartClick}
                  className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-black text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* 🔔 Notification */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        setNotificationsOpen(!notificationsOpen);
                        setLocationOpen(false);
                      } else {
                        onAuthOpen?.();
                      }
                    }}
                    className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {isAuthenticated && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-1 ring-white" />
                    )}
                  </button>
                  {notificationsOpen && (
                    <NotificationDropdown
                      onClose={() => setNotificationsOpen(false)}
                    />
                  )}
                </div>

                {/* 👤 Profile / Login */}
                <button
                  type="button"
                  onClick={isAuthenticated ? onProfileClick : onAuthOpen}
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label={isAuthenticated ? "Profile" : "Sign in / Log in"}
                  title={isAuthenticated ? "Profile" : "Sign in"}
                >
                  <CircleUserRound className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ROW 2: LOCATION (MUST appear ABOVE the Search Bar for authenticated users) */}
            {isAuthenticated && (
              <div
                className="relative border-t border-slate-100/90 pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen(!locationOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-emerald-800 transition-colors w-full cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="truncate font-bold text-slate-900">
                    {location || "Noida, Uttar Pradesh"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-0.5" />
                </button>
                {locationOpen && (
                  <LocationPicker
                    value={location}
                    onChange={(newLoc, coords) => {
                      onLocationChange?.(newLoc, coords);
                      setLocationOpen(false);
                    }}
                    onClose={() => setLocationOpen(false)}
                  />
                )}
              </div>
            )}

            {/* ROW 3: SEARCH BAR */}
            <div ref={mobileSearchWrapRef} className="relative w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (search.trim()) setDropdownOpen(true);
                  }}
                  placeholder="Search for services..."
                  className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 shadow-2xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setDropdownOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Dropdown Results */}
              {dropdownOpen && search.trim() && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/80 bg-white/98 shadow-2xl backdrop-blur-2xl text-slate-900 overflow-hidden flex flex-col max-h-[65vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between">
                    <span>Results ({searchResults.length})</span>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="text-slate-400 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto p-2 space-y-1.5 max-h-[48vh]">
                    {searchResults.map((item) => (
                      <button
                        key={item.slug || item.name}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left bg-slate-50/80 hover:bg-emerald-50 border border-slate-100 transition-colors cursor-pointer"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-11 w-11 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-bold text-emerald-800">
                            {item.price}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      </button>
                    ))}

                    {searchResults.length === 0 && (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No matches found for '{search}'
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (Fixed at bottom, md:hidden)
          The ONLY additional navigation allowed on mobile:
          Home | Bookings | Services | Offers | Profile
         ========================================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl select-none"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 h-15 items-center px-1 max-w-md mx-auto">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate("/");
              else onLogoClick?.();
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentRoute === "/"
                ? "text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home
              className={`h-5 w-5 ${currentRoute === "/" ? "stroke-[2.5]" : "stroke-2"}`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Home
            </span>
          </button>

          {/* 2. Bookings */}
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                if (onNavigate) onNavigate("/profile");
                else onProfileClick?.();
              } else {
                onAuthOpen?.();
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentRoute === "/profile"
                ? "text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarCheck
              className={`h-5 w-5 ${currentRoute === "/profile" ? "stroke-[2.5]" : "stroke-2"}`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Bookings
            </span>
          </button>

          {/* 3. Services */}
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate("/services");
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentRoute === "/services" || currentRoute?.startsWith("/category/")
                ? "text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid
              className={`h-5 w-5 ${currentRoute === "/services" || currentRoute?.startsWith("/category/") ? "stroke-[2.5]" : "stroke-2"}`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Services
            </span>
          </button>

          {/* 4. Offers */}
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate("/offers");
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentRoute === "/offers"
                ? "text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tag
              className={`h-5 w-5 ${currentRoute === "/offers" ? "stroke-[2.5]" : "stroke-2"}`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Offers
            </span>
          </button>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                if (onNavigate) onNavigate("/profile");
                else onProfileClick?.();
              } else {
                onAuthOpen?.();
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentRoute === "/profile"
                ? "text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CircleUserRound
              className={`h-5 w-5 ${currentRoute === "/profile" ? "stroke-[2.5]" : "stroke-2"}`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {isAuthenticated ? "Profile" : "Login"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
