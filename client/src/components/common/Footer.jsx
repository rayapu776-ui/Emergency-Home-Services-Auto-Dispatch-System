import React, { useState } from "react";
import {
  AtSign,
  BriefcaseBusiness,
  ChevronDown,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const footerSections = [
  {
    id: "company",
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Our Story", "/our-story"],
      ["Careers", "/careers"],
      ["Contact Us", "/contact"],
      ["Testimonials", "/testimonials"],
    ],
  },
  {
    id: "services",
    title: "Services",
    links: [
      ["All Services", "/services"],
      ["Home Services", "/services/home"],
      ["Beauty & Wellness", "/services/beauty"],
      ["Repair & Maintenance", "/services/repair"],
      ["Smart Home", "/services/smart-home"],
    ],
  },
  {
    id: "support",
    title: "Support",
    links: [
      ["Help Center", "/help"],
      ["FAQs", "/faqs"],
      ["Contact Support", "/support"],
      ["Booking Help", "/booking-help"],
      ["Cancellation & Refund", "/cancellation-refund"],
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Use", "/terms"],
      ["Cookie Policy", "/cookies"],
      ["Safety & Trust", "/safety-trust"],
    ],
  },
  {
    id: "professionals",
    title: "For Professionals",
    links: [
      ["Partner With Us", "/professionals"],
      ["Professional Registration", "/professionals/register"],
      ["Partner Benefits", "/professionals"],
      ["Technician Portal", "/technician/login"],
    ],
  },
];

const socials = [
  [AtSign, "/social/instagram", "Instagram"],
  [MessageCircle, "/social/facebook", "Facebook"],
  [BriefcaseBusiness, "/social/linkedin", "LinkedIn"],
  [Send, "/social/x", "X"],
  [MessageCircle, "/social/youtube", "YouTube"],
];

export default function Footer({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  // Mobile accordion open states: allow multiple sections open simultaneously
  const [openSections, setOpenSections] = useState({});

  // Hide FOR PROFESSIONALS footer section when a customer is logged in
  const isCustomerLoggedIn = Boolean(
    isAuthenticated && user && user.role === "customer",
  );
  const visibleSections = footerSections.filter(
    (sec) => !(isCustomerLoggedIn && sec.id === "professionals"),
  );

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.assign(path);
    }
  };

  return (
    <footer className="argent-footer-wrap w-full max-w-full overflow-x-hidden box-border">
      <div className="argent-footer w-full max-w-7xl mx-auto box-border">
        {/* Brand Row */}
        <div className="footer-brand-row flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-10 w-10 rounded-xl object-contain shadow-sm shrink-0"
            />
            <div>
              <span className="footer-brand-name block text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Argent Your
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-widest block">
                Premium Doorstep Services
              </span>
            </div>
          </button>
          <p className="footer-tagline text-xs sm:text-sm text-slate-500 max-w-md">
            Trusted doorstep emergency &amp; home services delivered by verified
            professionals across Delhi NCR.
          </p>
        </div>

        <div className="footer-divider my-6 sm:my-8 border-t border-slate-200" />

        {/* Desktop Multi-Column */}
        <div
          className={`hidden md:grid gap-8 ${
            isCustomerLoggedIn ? "md:grid-cols-4" : "md:grid-cols-5"
          }`}
        >
          {visibleSections.map((section) => (
            <div key={section.id} className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map(([label, path]) => (
                  <li key={path + label}>
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className="text-xs text-slate-600 hover:text-emerald-800 transition-colors text-left cursor-pointer py-0.5 block w-full truncate"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Accordions (Clean collapsible sections on < md) */}
        <div className="md:hidden divide-y divide-slate-100 border-y border-slate-100">
          {visibleSections.map((section) => {
            const isOpen = Boolean(openSections[section.id]);
            return (
              <div key={section.id} className="py-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-800" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-3.5 pl-1 space-y-2.5">
                    {section.links.map(([label, path]) => (
                      <button
                        type="button"
                        key={path + label}
                        onClick={() => navigate(path)}
                        className="text-xs text-slate-600 hover:text-emerald-800 transition-colors text-left block w-full py-1 cursor-pointer"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Connect / Contact & Socials Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-1.5 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <AtSign className="h-3.5 w-3.5 text-emerald-700" />
              <span>hello@argentyour.demo</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-1.5 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-700" />
              <span>+1 (800) 555-0199</span>
            </button>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span>Delhi NCR · Regional Service Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {socials.map(([Icon, path, label]) => (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-2xs"
                aria-label={label}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="footer-divider my-6 border-t border-slate-100" />

        {/* Bottom Legal / Copyright Row */}
        <div className="footer-bottom flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; 2026 Argent Your. All rights reserved.</span>
          <div className="footer-legal flex flex-wrap gap-4 text-xs">
            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <button
              type="button"
              onClick={() => navigate("/cookies")}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              type="button"
              onClick={() => navigate("/safety-trust")}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Safety &amp; Trust
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
