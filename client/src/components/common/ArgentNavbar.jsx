import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Home,
  LayoutGrid,
  LocateFixed,
  MapPin,
  Plus,
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

  // Add New Address toggle & form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    houseNo: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home",
  });
  const [formError, setFormError] = useState("");

  // Saved addresses list initialized with default or persisted items
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem("argent_saved_addresses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: "addr-home",
        type: "Home",
        title: "Home",
        line1: "Flat 402, Green Glen Heights",
        line2: "Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201304",
        formattedAddress:
          "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh - 201304",
      },
      {
        id: "addr-work",
        type: "Work",
        title: "Work",
        line1: "Tower B, 7th Floor, Cyber City",
        line2: "DLF Phase 2, Sector 24",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        formattedAddress:
          "Tower B, 7th Floor, Cyber City, DLF Phase 2, Sector 24, Gurugram, Haryana - 122002",
      },
      {
        id: "addr-other",
        type: "Other",
        title: "Parents Home",
        line1: "Villa 14, Palm Grove Enclave",
        line2: "Greater Kailash II",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110048",
        formattedAddress:
          "Villa 14, Palm Grove Enclave, Greater Kailash II, New Delhi, Delhi - 110048",
      },
    ];
  });

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
        if (Array.isArray(list) && list.length > 0) {
          setSearchResults(list);
        } else {
          // Fallback matching query to major urban localities
          const fallbackKeywords = [
            "Sector 62, Noida, Uttar Pradesh",
            "Indirapuram, Ghaziabad, Uttar Pradesh",
            "Cyber City, DLF Phase 2, Gurugram",
            "Connaught Place, Central Delhi",
            "Hauz Khas, South Delhi",
            "Greater Kailash, New Delhi",
            "Sector 18, Noida, Uttar Pradesh",
            "Whitefield, Bengaluru, Karnataka",
            "Koramangala, Bengaluru, Karnataka",
            "Bandra West, Mumbai, Maharashtra",
          ];
          const matches = fallbackKeywords
            .filter((item) =>
              item.toLowerCase().includes(searchQuery.trim().toLowerCase()),
            )
            .map((item) => ({ description: item, name: item }));
          setSearchResults(matches);
        }
      } catch (err) {
        console.warn("Location search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (loc, coords) => {
    onChange(loc, coords);
    try {
      localStorage.setItem("argent_selected_location", loc);
    } catch {}
    onClose();
  };

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
        setStatus("Resolving address via Maps...");

        try {
          const res = await fetch(
            `/api/location/reverse-geocode?lat=${lat}&lon=${lon}`,
          );
          const data = await res.json();

          if (data && (data.formattedAddress || data.city)) {
            const display = data.city
              ? `${data.city}, ${data.state || "India"}`
              : data.formattedAddress;
            setStatus(`Detected: ${data.city || display}`);
            setTimeout(() => {
              handleSelect(display, {
                lat,
                lon,
                fullAddress: data.fullAddress || data.formattedAddress,
                city: data.city,
              });
            }, 600);
          } else {
            setStatus("Detected current GPS location");
            setTimeout(() => {
              handleSelect("Current Location", { lat, lon });
            }, 600);
          }
        } catch (err) {
          console.warn("Geocoding failed:", err);
          setStatus("Detected coordinates");
          setTimeout(() => {
            handleSelect("Current Location", { lat, lon });
          }, 600);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus(
            "Location permission denied. Please search or add your address below.",
          );
        } else {
          setStatus(
            "Could not get GPS location. Please search or add your address below.",
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!addressForm.houseNo.trim() || !addressForm.area.trim()) {
      setFormError("Please provide House/Flat No. and Area/Locality");
      return;
    }
    const city = addressForm.city.trim() || "Noida";
    const state = addressForm.state.trim() || "Uttar Pradesh";
    const pincode = addressForm.pincode.trim() || "";
    const pinPart = pincode ? ` - ${pincode}` : "";
    const formatted = `${addressForm.houseNo.trim()}, ${addressForm.area.trim()}, ${city}, ${state}${pinPart}`;

    const newAddr = {
      id: `addr-${Date.now()}`,
      type: addressForm.type,
      title: addressForm.type === "Other" ? "Other Address" : addressForm.type,
      line1: addressForm.houseNo.trim(),
      line2: addressForm.area.trim(),
      city,
      state,
      pincode,
      formattedAddress: formatted,
    };

    const updated = [newAddr, ...savedAddresses];
    setSavedAddresses(updated);
    try {
      localStorage.setItem("argent_saved_addresses", JSON.stringify(updated));
    } catch {}

    handleSelect(formatted, { fullAddress: formatted, city, state });
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md md:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-rise-in text-slate-900 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Select Location + Subtitle + Close (✕) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Select Location
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Choose where you want doorstep service
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close location selector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto overscroll-contain py-3.5 space-y-4 pr-1 scrollbar-thin">
          {/* 1. SEARCH ADDRESS / AREA */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Search Address or Area
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search an address or area..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isSearching && (
              <p className="text-[11px] text-emerald-700 mt-1.5 pl-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Searching addresses...
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-44 overflow-y-auto space-y-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md">
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
                      className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. USE CURRENT LOCATION (Directly below search field) */}
          <div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-50 py-3 px-4 text-xs sm:text-sm font-bold text-emerald-950 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <LocateFixed
                className={`h-4 w-4 text-emerald-700 shrink-0 ${isDetecting ? "animate-spin" : ""}`}
              />
              <span>
                {isDetecting
                  ? "Detecting GPS Location..."
                  : "Use Current Location"}
              </span>
            </button>
            {status && (
              <p className="mt-2 text-center text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 rounded-xl py-1.5 px-2.5 border border-emerald-200/50">
                {status}
              </p>
            )}
          </div>

          {/* 3. ADD NEW ADDRESS (Directly below current location) */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormError("");
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 hover:bg-slate-100 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 border border-slate-200/70 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2 text-emerald-800">
                <Plus className="h-4 w-4" />
                <span>Add New Address</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showAddForm ? "rotate-180" : ""}`}
              />
            </button>

            {/* Expandable Add Address Form */}
            {showAddForm && (
              <form
                onSubmit={handleSaveNewAddress}
                className="mt-3 rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-3 animate-rise-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    New Address Details
                  </span>
                  {/* Address Type selector */}
                  <div className="flex items-center gap-1.5">
                    {["Home", "Work", "Other"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setAddressForm((prev) => ({ ...prev, type: t }))
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          addressForm.type === t
                            ? "bg-emerald-800 text-white shadow-2xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      House / Flat / Building No. *
                    </label>
                    <input
                      type="text"
                      value={addressForm.houseNo}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          houseNo: e.target.value,
                        }))
                      }
                      placeholder="e.g. Flat 402, Tower B, Green Glen Heights"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      value={addressForm.area}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          area: e.target.value,
                        }))
                      }
                      placeholder="e.g. Sector 62, Near Metro Station"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Noida"
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        placeholder="UP"
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            pincode: e.target.value,
                          }))
                        }
                        placeholder="201304"
                        className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-[11px] text-rose-600 font-semibold">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-slate-950 hover:bg-emerald-900 text-white font-bold py-2.5 text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 4. ZERO POPULAR REGIONS - COMPLETELY REMOVED */}

          {/* 5. SAVED ADDRESSES (Directly below Add New Address) */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Saved Addresses ({savedAddresses.length})
              </span>
            </div>

            <div className="space-y-2">
              {savedAddresses.map((addr) => {
                const isSelected =
                  value === addr.formattedAddress ||
                  value === addr.city ||
                  value.includes(addr.city);
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() =>
                      handleSelect(addr.formattedAddress, {
                        fullAddress: addr.formattedAddress,
                        city: addr.city,
                        state: addr.state,
                      })
                    }
                    className={`w-full text-left rounded-2xl p-3 border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 shadow-2xs"
                        : "border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {addr.type === "Home" ? (
                        <Home className="h-4 w-4" />
                      ) : addr.type === "Work" ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {addr.title || addr.type}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                        {addr.formattedAddress}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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
      if (notificationsOpen) setNotificationsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setLocationOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

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
      {/* Global Location Selection Modal */}
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

      {/* =========================================================================
          TOP HEADER (Fixed at top)
          - Desktop (md+): Single Main Navbar
          - Mobile (<md):
            - Logged Out: Search Bar Only
            - Logged In:  Row 1 [Logo] [Location][Cart][Notification] -> Row 2 Search Bar
         ========================================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50 select-none">
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
                    className="absolute left-0 right-0 top-full mt-2.5 z-[100] rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] animate-rise-in text-slate-900 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* LEFT SIDE — SEARCH RESULTS */}
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col bg-white">
                      <div className="px-1 pb-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-100 mb-3">
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
                            <p className="text-sm font-bold text-slate-800">
                              No services found
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Try searching for another service.
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
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {/* Location button: Displayed for BOTH Logged-In and Logged-Out */}
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen(true);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  title="Choose service location"
                >
                  <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="max-w-[120px] truncate font-medium text-slate-800">
                    {location || "Delhi NCR"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </button>

                {!isAuthenticated ? (
                  /* BEFORE LOGIN: [ Sign in / Log in ] ONLY (No Cart, No Notification, No Profile) */
                  <button
                    type="button"
                    onClick={onAuthOpen}
                    className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow cursor-pointer"
                  >
                    <CircleUserRound className="h-4 w-4" />
                    <span className="whitespace-nowrap">Sign in / Log in</span>
                  </button>
                ) : (
                  /* AFTER LOGIN: [ Cart ] [ Notification ] [ Profile ] */
                  <>
                    {/* Cart button */}
                    <button
                      type="button"
                      onClick={onCartClick}
                      className="relative rounded-xl p-2.5 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
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
                        className="relative rounded-xl p-2.5 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
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
                      onClick={() => {
                        if (currentRoute === "/profile") return;
                        if (onNavigate) onNavigate("/profile");
                        else onProfileClick?.();
                      }}
                      className={`relative rounded-xl p-2.5 transition-colors cursor-pointer ${
                        currentRoute === "/profile"
                          ? "bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-500/30"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                      aria-label="Profile"
                      title="My Profile"
                    >
                      <CircleUserRound className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MOBILE (under md) ==================== */}
        {/* Sequence: EXACTLY TWO SEPARATE ROWS
            1. TOP ROW:
               - Logged Out: [ Argent Your ]                     [ 📍 Location ]
               - Logged In:  [ Argent Your ] [ 📍 Location ] [ 🛒 Cart ] [ 🔔 Notification ]
            2. SECOND ROW:
               [ 🔍 Search for services, e.g. Home Cleaning, AC Repair... ]
        */}
        <div className="block md:hidden px-3 pt-2.5">
          <div
            className={`rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_30px_rgba(27,45,39,0.08)] backdrop-blur-xl p-2.5 sm:p-3 ${
              isAuthenticated ? "space-y-2" : ""
            }`}
          >
            {/* ROW 1: ONLY WHEN LOGGED IN
                - When NOT logged in: Row 1 is completely omitted (no logo, no company name, no location, no cart, no notification).
                - When logged in: [ Argent Your ] on left, [ 📍 Location ] [ 🛒 Cart ] [ 🔔 Notification ] on right.
            */}
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {/* Left: Argent Your Logo */}
                <button
                  type="button"
                  onClick={onLogoClick}
                  className="flex shrink-0 items-center gap-1.5 sm:gap-2 cursor-pointer"
                  title="Argent Your"
                >
                  <img
                    src="/argent-logo.png"
                    alt="Argent Your"
                    className="h-8 w-8 rounded-xl object-contain shadow-xs shrink-0"
                  />
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 whitespace-nowrap">
                    Argent Your
                  </span>
                </button>

                {/* Right: Location + Cart + Notification */}
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  {/* 📍 Location Selector (ONLY after login on mobile) */}
                  <button
                    type="button"
                    onClick={() => {
                      setLocationOpen(true);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer bg-slate-50/90 border border-slate-200/70 shrink-0"
                    title="Select service location"
                  >
                    <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span className="max-w-[60px] min-[360px]:max-w-[95px] sm:max-w-[130px] truncate font-bold text-slate-900">
                      {location || "Delhi NCR"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                  </button>

                  {/* 🛒 Cart */}
                  <button
                    type="button"
                    onClick={onCartClick}
                    className="relative p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    aria-label="Cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-black text-white">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* 🔔 Notification */}
                  <div
                    className="relative shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setLocationOpen(false);
                      }}
                      className="relative p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-600 ring-1 ring-white" />
                    </button>
                    {notificationsOpen && (
                      <NotificationDropdown
                        onClose={() => setNotificationsOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ROW 2 (OR ONLY ROW WHEN LOGGED OUT): SEARCH BAR (Occupies available width in its own row) */}
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
                  placeholder="Search for services, e.g. Home Cleaning, AC Repair..."
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

              {/* Mobile Search Dropdown Results: 100% Solid Opaque Background */}
              {dropdownOpen && search.trim() && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 z-[100] rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden flex flex-col max-h-[60vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <span>Search Results ({searchResults.length})</span>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      aria-label="Close search results"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto overscroll-contain p-2 space-y-2 max-h-[50vh] scrollbar-thin bg-white">
                    {searchResults.map((item) => (
                      <button
                        key={item.slug || item.name}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left bg-white hover:bg-emerald-50/80 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-100 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                              {item.name}
                            </p>
                            <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200/60">
                              {item.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-emerald-700 truncate">
                              {item.category || "Argent Service"}
                            </span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                              <span>{item.rating || "4.8"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0 ml-1">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}

                    {searchResults.length === 0 && (
                      <div className="py-8 px-4 text-center bg-white">
                        <p className="text-sm font-bold text-slate-800">
                          No services found
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Try searching for another service.
                        </p>
                        {relatedRecommendations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 text-left">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Popular suggestions:
                            </p>
                            <div className="space-y-1.5">
                              {relatedRecommendations.slice(0, 3).map((rec) => (
                                <button
                                  key={rec.slug || rec.name}
                                  type="button"
                                  onClick={() => handleSelectResult(rec)}
                                  className="flex w-full items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                                >
                                  <span>{rec.name}</span>
                                  <span className="text-emerald-700 font-bold">
                                    {rec.price}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
          Home | Bookings | Services | Offers | Profile / Account
         ========================================================================= */}
      {(() => {
        const isHomeActive = currentRoute === "/";
        const isBookingsActive =
          currentRoute === "/bookings" ||
          currentRoute === "/my-bookings" ||
          Boolean(currentRoute?.startsWith("/bookings/"));
        const isServicesActive =
          currentRoute === "/services" ||
          Boolean(currentRoute?.startsWith("/services/")) ||
          Boolean(currentRoute?.startsWith("/category/"));
        const isOffersActive =
          currentRoute === "/offers" ||
          Boolean(currentRoute?.startsWith("/offers/"));
        const isProfileActive =
          currentRoute === "/profile" ||
          currentRoute === "/addresses" ||
          currentRoute === "/payments" ||
          currentRoute === "/payment-methods" ||
          currentRoute === "/saved" ||
          currentRoute === "/saved-services" ||
          currentRoute === "/notifications" ||
          currentRoute === "/settings" ||
          currentRoute === "/support" ||
          currentRoute === "/help";

        return (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] backdrop-blur-xl select-none pb-[env(safe-area-inset-bottom)]"
            aria-label="Mobile Bottom Navigation"
          >
            <div className="grid grid-cols-5 h-15 items-center px-1 max-w-md mx-auto">
              {/* 1. Home */}
              <button
                type="button"
                onClick={() => {
                  if (isHomeActive) return;
                  if (onNavigate) onNavigate("/");
                  else onLogoClick?.();
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
                  isHomeActive
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Home
                  className={`h-5 w-5 ${isHomeActive ? "stroke-[2.5]" : "stroke-2"}`}
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
                    if (isBookingsActive) return;
                    if (onNavigate) onNavigate("/bookings");
                    else onProfileClick?.();
                  } else {
                    onAuthOpen?.();
                  }
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
                  isBookingsActive
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CalendarCheck
                  className={`h-5 w-5 ${isBookingsActive ? "stroke-[2.5]" : "stroke-2"}`}
                />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  Bookings
                </span>
              </button>

              {/* 3. Services */}
              <button
                type="button"
                onClick={() => {
                  if (currentRoute === "/services") return;
                  if (onNavigate) onNavigate("/services");
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
                  isServicesActive
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid
                  className={`h-5 w-5 ${isServicesActive ? "stroke-[2.5]" : "stroke-2"}`}
                />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  Services
                </span>
              </button>

              {/* 4. Offers */}
              <button
                type="button"
                onClick={() => {
                  if (isOffersActive) return;
                  if (onNavigate) onNavigate("/offers");
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
                  isOffersActive
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Tag
                  className={`h-5 w-5 ${isOffersActive ? "stroke-[2.5]" : "stroke-2"}`}
                />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  Offers
                </span>
              </button>

              {/* 5. Profile or Account */}
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    if (currentRoute === "/profile") return;
                    if (onNavigate) onNavigate("/profile");
                    else onProfileClick?.();
                  } else {
                    onAuthOpen?.();
                  }
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
                  isProfileActive
                    ? "text-emerald-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CircleUserRound
                  className={`h-5 w-5 ${isProfileActive ? "stroke-[2.5]" : "stroke-2"}`}
                />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {isAuthenticated ? "Profile" : "Account"}
                </span>
              </button>
            </div>
          </nav>
        );
      })()}
    </>
  );
}
