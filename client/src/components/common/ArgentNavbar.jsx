import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  LocateFixed,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import SecondaryCategoryNavbar from "./SecondaryCategoryNavbar";
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
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  ];

  return (
    <div
      className="absolute right-0 top-14 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl animate-rise-in text-slate-900"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search city, area, pincode..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-700 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Real GPS Detect Button */}
      <button
        type="button"
        disabled={isDetecting}
        onClick={detectLocation}
        className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs font-bold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors cursor-pointer disabled:opacity-60"
      >
        <LocateFixed
          className={`h-4 w-4 text-emerald-700 shrink-0 ${isDetecting ? "animate-spin" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <span className="block text-xs font-bold">
            {isDetecting ? "Detecting location..." : "Use Current Location"}
          </span>
          <span className="block text-[10px] text-emerald-700/80 font-medium truncate">
            GPS & Google Geocoding
          </span>
        </div>
      </button>

      {status && (
        <p className="px-2 pt-2 text-[11px] font-semibold text-emerald-800">
          {status}
        </p>
      )}

      {/* Search Results if any */}
      {searchResults.length > 0 && (
        <div className="mt-2.5 max-h-36 overflow-y-auto space-y-1 pr-1 border-t border-slate-100 pt-2">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Search Results
          </p>
          {searchResults.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                handleSelect(
                  item.mainText || item.formattedAddress || item.city,
                  {
                    lat: item.lat,
                    lon: item.lon,
                    fullAddress: item.formattedAddress || item.mainText,
                  },
                )
              }
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block truncate">
                  {item.mainText || item.formattedAddress}
                </span>
                {item.secondaryText && (
                  <span className="text-[10px] text-slate-400 block truncate">
                    {item.secondaryText}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Cities */}
      <div className="mt-2.5 border-t border-slate-100 pt-2">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Popular Regions
        </p>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {popularRegions.map((region) => {
            const isCurrent =
              value && value.toLowerCase().includes(region.name.toLowerCase());
            return (
              <button
                key={region.name}
                type="button"
                onClick={() =>
                  handleSelect(region.name, {
                    lat: region.lat,
                    lon: region.lon,
                  })
                }
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "bg-emerald-50 font-bold text-emerald-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{region.name}</span>
                {isCurrent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
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
  currentRoute,
  onNavigate,
  showCategoryBar = true,
}) {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const searchWrapRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
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
    <header className="fixed left-0 right-0 top-0 z-40 select-none">
      <div className="px-3 sm:px-4 pt-2.5 sm:pt-3">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/70 bg-white/80 shadow-[0_12px_40px_rgba(27,45,39,0.08)] backdrop-blur-xl">
          <div className="flex h-[68px] sm:h-[72px] items-center gap-3 px-4 sm:gap-4 lg:gap-6 lg:px-7">
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

          {/* CENTER: LARGE SEARCH BAR (Occupies entire middle space) */}
          <div
            ref={searchWrapRef}
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

            {/* Premium Glassmorphism Search Results Panel */}
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

                  {/* Scrollable area showing 4 cards visibly at a time */}
                  <div className="max-h-[384px] overflow-y-auto overscroll-contain space-y-2 pr-1.5 scrollbar-thin">
                    {searchResults.map((item) => (
                      <button
                        key={item.slug || item.name}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        className="group flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 bg-white/60 hover:bg-emerald-50/70 border border-slate-200/50 hover:border-emerald-200/80 shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        {/* Service image */}
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 sm:h-15 sm:w-15 rounded-xl object-cover border border-slate-100/90 shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200"
                          />
                        )}

                        {/* Service details */}
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

                        {/* Right-arrow icon */}
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
                          Check related services on the right or try another
                          search keyword.
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

                  {/* Independent scrollable recommendations area */}
                  <div className="max-h-[384px] overflow-y-auto overscroll-contain space-y-2 pr-1.5 scrollbar-thin">
                    {relatedRecommendations.map((rec) => (
                      <button
                        key={rec.slug || rec.name}
                        type="button"
                        onClick={() => handleSelectResult(rec)}
                        className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-200 bg-white/90 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-200 shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        {/* Service image */}
                        {rec.image && (
                          <img
                            src={rec.image}
                            alt={rec.name}
                            className="h-11 w-11 rounded-xl object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-200"
                          />
                        )}

                        {/* Service info */}
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-950">
                            {rec.name}
                          </span>
                          <span className="block text-[11px] font-semibold text-emerald-800 mt-0.5">
                            {rec.price}
                          </span>
                        </div>

                        {/* Right-arrow icon */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/70 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}

                    {relatedRecommendations.length === 0 && (
                      <p className="text-xs text-slate-400 p-4 text-center">
                        No related recommendations available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          {!isAuthenticated ? (
            /* BEFORE LOGIN: [ Sign in / Log in ] only */
            <div className="flex shrink-0 items-center">
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
                className="relative hidden md:block"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen(!locationOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 hover:bg-white/80 transition-colors"
                  title="Choose service location"
                >
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span className="max-w-[110px] truncate">{location}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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

              {/* Notification button */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setLocationOpen(false);
                  }}
                  className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {/* Unread indicator dot */}
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                </button>
                {notificationsOpen && (
                  <NotificationDropdown
                    onClose={() => setNotificationsOpen(false)}
                  />
                )}
              </div>

              {/* Profile button - Clean & minimal icon only, no username text */}
              <button
                type="button"
                onClick={onProfileClick}
                className="relative rounded-xl p-2.5 text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors"
                aria-label="Profile"
                title="My Profile"
              >
                <CircleUserRound className="h-5 w-5" />
              </button>

              {/* Mobile menu toggle for small screens */}
              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenu)}
                className="p-2 md:hidden text-slate-700"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu dropdown for location on small viewports */}
        {mobileMenu && isAuthenticated && (
          <div className="space-y-3 border-t border-slate-200/80 p-4 md:hidden">
            <button
              onClick={() => {
                setLocationOpen(true);
                setMobileMenu(false);
              }}
              className="flex w-full items-center gap-2 text-sm font-bold text-slate-800"
            >
              <MapPin className="h-4 w-4 text-emerald-700" />
              <span>Location: {location}</span>
            </button>
            <button
              onClick={() => {
                onProfileClick?.();
                setMobileMenu(false);
              }}
              className="flex w-full items-center gap-2 text-sm font-bold text-slate-800"
            >
              <CircleUserRound className="h-4 w-4 text-emerald-700" />
              <span>My Account & Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* SECONDARY CATEGORY NAVIGATION BAR */}
    {showCategoryBar && (
      <div className="w-full">
        <SecondaryCategoryNavbar
          currentRoute={
            currentRoute ||
            (typeof window !== "undefined"
              ? window.location.pathname || "/"
              : "/")
          }
          onNavigate={onNavigate}
        />
      </div>
    )}
  </header>
);
}
