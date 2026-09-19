import React, { useEffect, useRef } from "react";
import {
  Fan,
  Flower2,
  Home,
  Layers,
  LayoutGrid,
  Sparkles,
  Tag,
  Truck,
  Wrench,
} from "lucide-react";

export const CATEGORIES_NAV_ITEMS = [
  {
    id: "all",
    label: "All Services",
    path: "/services",
    icon: LayoutGrid,
    matchPaths: ["/services"],
  },
  {
    id: "cleaning",
    label: "Cleaning",
    path: "/category/cleaning",
    icon: Sparkles,
    matchPaths: ["/category/cleaning", "/category/home-cleaning"],
  },
  {
    id: "appliances",
    label: "Appliances",
    path: "/category/appliances",
    icon: Fan,
    matchPaths: [
      "/category/appliances",
      "/category/ac-appliance-repair",
      "/category/ac-and-appliance-repair",
    ],
  },
  {
    id: "beauty-wellness",
    label: "Beauty & Wellness",
    path: "/category/beauty-wellness",
    icon: Flower2,
    matchPaths: [
      "/category/beauty-wellness",
      "/category/womens-salon-spa",
      "/category/mens-salon-massage",
      "/category/womens-salon",
      "/category/mens-salon",
    ],
  },
  {
    id: "repairs-installation",
    label: "Repairs & Installation",
    path: "/category/repairs-installation",
    icon: Wrench,
    matchPaths: [
      "/category/repairs-installation",
      "/category/electrician",
      "/category/plumbing",
      "/category/carpenter",
      "/category/smart-home-products",
    ],
  },
  {
    id: "home-care",
    label: "Home Care",
    path: "/category/home-care",
    icon: Home,
    matchPaths: [
      "/category/home-care",
      "/category/home-painting",
      "/category/wall-panels",
    ],
  },
  {
    id: "moving-pest-control",
    label: "Moving & Pest Control",
    path: "/category/moving-pest-control",
    icon: Truck,
    matchPaths: [
      "/category/moving-pest-control",
      "/category/cleaning-pest-control",
      "/category/pest-control",
      "/category/packers-movers",
    ],
  },
  {
    id: "others",
    label: "Others",
    path: "/category/others",
    icon: Layers,
    matchPaths: ["/category/others"],
  },
  {
    id: "offers",
    label: "Offers",
    path: "/offers",
    icon: Tag,
    isSpecial: true,
    matchPaths: ["/offers"],
  },
];

export default function SecondaryCategoryNavbar({ currentRoute = "/", onNavigate }) {
  const activeTabRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll active category into view on mobile
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const el = activeTabRef.current;
      const parent = containerRef.current;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const parentWidth = parent.offsetWidth;

      // Center the active element in the scroll container
      parent.scrollTo({
        left: elLeft - parentWidth / 2 + elWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentRoute]);

  const isActive = (item) => {
    if (item.matchPaths) {
      return item.matchPaths.some((p) => currentRoute === p || currentRoute.startsWith(`${p}/`));
    }
    return currentRoute === item.path;
  };

  const handleClick = (e, item) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(item.path);
    } else {
      window.history.pushState({}, "", item.path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <nav
      className="w-full bg-[#0b1411]/95 text-slate-200 border-b border-white/10 shadow-md backdrop-blur-md select-none"
      aria-label="Secondary Category Navigation"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="flex items-center gap-1 sm:gap-2 py-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap"
          role="menubar"
        >
          {CATEGORIES_NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                ref={active ? activeTabRef : null}
                type="button"
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={(e) => handleClick(e, item)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold tracking-normal transition-all duration-200 cursor-pointer shrink-0 ${
                  active
                    ? item.isSpecial
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs"
                    : item.isSpecial
                    ? "text-amber-300/90 hover:text-amber-200 hover:bg-amber-400/10 border border-transparent"
                    : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active
                      ? item.isSpecial
                        ? "text-amber-300"
                        : "text-emerald-300"
                      : item.isSpecial
                      ? "text-amber-400"
                      : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>

                {item.isSpecial && (
                  <span className="ml-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/30 text-amber-200 border border-amber-300/30 uppercase tracking-wider">
                    Deals
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
