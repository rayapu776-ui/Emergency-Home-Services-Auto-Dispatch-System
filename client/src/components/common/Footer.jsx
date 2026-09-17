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

const columns = [
  {
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
    title: "Support",
    links: [
      ["Help Center", "/help"],
      ["FAQs", "/faqs"],
      ["Contact Support", "/support"],
      ["Booking Help", "/booking-help"],
      ["Cancellation & Refund", "/refund-policy"],
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
  const [open, setOpen] = useState(null);
  const navigate = (path) =>
    onNavigate ? onNavigate(path) : window.location.assign(path);
  return (
    <footer className="argent-footer-wrap">
      <div className="argent-footer">
        <div className="footer-brand-row">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-10 w-10 rounded-xl object-contain shadow-sm shrink-0"
            />
            <span className="footer-brand-name">Argent Your</span>
          </button>
          <p className="footer-tagline">
            Trusted services, delivered to your doorstep.
          </p>
        </div>
        <div className="footer-divider" />
        <div className="footer-columns">
          {columns.map((column, index) => (
            <div className="footer-column" key={column.title}>
              <button
                className="footer-column-title"
                onClick={() => setOpen(open === index ? null : index)}
              >
                <span>{column.title}</span>
                <ChevronDown
                  className={`footer-chevron ${open === index ? "is-open" : ""}`}
                />
              </button>
              <div
                className={`footer-column-links ${open === index ? "is-open" : ""}`}
              >
                {column.links.map(([label, path]) => (
                  <button
                    className="footer-link"
                    key={path}
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="footer-column footer-connect">
            <button
              className="footer-column-title"
              onClick={() => setOpen(open === 3 ? null : 3)}
            >
              <span>Connect</span>
              <ChevronDown
                className={`footer-chevron ${open === 3 ? "is-open" : ""}`}
              />
            </button>
            <div
              className={`footer-column-links ${open === 3 ? "is-open" : ""}`}
            >
              <button
                className="footer-contact"
                onClick={() => navigate("/contact")}
              >
                <AtSign className="h-4 w-4" /> hello@argentyour.demo
              </button>
              <button
                className="footer-contact"
                onClick={() => navigate("/contact")}
              >
                <Phone className="h-4 w-4" /> +1 (800) 555-0199
              </button>
              <button
                className="footer-contact"
                onClick={() => navigate("/categories")}
              >
                <MapPin className="h-4 w-4" /> Your neighbourhood
              </button>
              <div className="footer-socials">
                {socials.map(([Icon, path, label]) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="footer-social"
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span>© 2026 Argent Your. All rights reserved.</span>
          <div className="footer-legal">
            <button onClick={() => navigate("/privacy")}>Privacy Policy</button>
            <button onClick={() => navigate("/terms")}>
              Terms & Conditions
            </button>
            <button onClick={() => navigate("/cookies")}>Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
