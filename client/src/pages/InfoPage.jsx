import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Wrench,
} from "lucide-react";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/common/AuthModal";
import ArgentNavbar from "../components/common/ArgentNavbar";
import { allServicesCatalog } from "../data/servicesData";

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const serviceGroups = [
  [
    "Home Cleaning",
    "Deep cleaning, home refreshes and pest control",
    "cleaning",
  ],
  ["Women's Salon & Spa", "Salon, beauty and wellness at home", "beauty"],
  [
    "Men's Salon & Grooming",
    "Grooming and massage for modern routines",
    "grooming",
  ],
  ["Home Repair", "Everyday repairs and installation help", "repair"],
  ["Appliance Repair", "AC, TV, purifier and appliance care", "appliance"],
  ["Painting", "Fresh colour and considered finishes", "painting"],
  ["Plumbing", "Fast, dependable water and fixture help", "plumbing"],
  ["Electrical", "Safe electrical repairs and installations", "electrical"],
  ["Carpentry", "Furniture, fixtures and woodwork", "carpentry"],
  ["Pest Control", "A calmer, cleaner home", "pest"],
  [
    "Interior & Wall Panels",
    "Make your space feel more like yours",
    "interior",
  ],
  ["Smart Home Services", "Simple technology for better living", "smart-home"],
];
const content = {
  "/about": [
    "Our purpose",
    "About Argent Your",
    "Making everyday services simpler, safer and more accessible.",
    [
      [
        "Who we are",
        "Argent Your is a service marketplace built around the everyday needs of homes, families, renters, and independent professionals.",
      ],
      [
        "What we do",
        "We make it easier to discover, compare, and book trusted services with clear information and thoughtful support.",
      ],
      [
        "Our mission",
        "Make reliable care feel as simple as opening an app and as personal as asking someone you trust.",
      ],
      [
        "Our vision",
        "A world where every home can access quality help, and every skilled professional can build a rewarding business.",
      ],
      [
        "Our core values",
        "Clarity, respect, craft, accountability, and care guide every product and service decision we make.",
      ],
      [
        "Why Argent Your",
        "One considered experience brings services, scheduling, communication, and support together.",
      ],
      [
        "How the platform works",
        "Choose a category, compare a service, select your time and location, then follow the booking from confirmation to completion.",
      ],
      [
        "Customer experience",
        "Clear pricing, verified profiles, flexible scheduling, and human support keep customers in control.",
      ],
      [
        "Trusted professionals",
        "We review identity, skills, service history, and conduct expectations before professionals join the network.",
      ],
      [
        "Our future goals",
        "We are building toward broader service coverage, better accessibility, and sustainable opportunities for local professionals.",
      ],
    ],
  ],
  "/our-story": [
    "Since day one",
    "Our Story",
    "We started with a simple question: why should getting reliable help feel like another problem to solve?",
    [
      [
        "The idea",
        "Homeowners and professionals told us the same story: too much searching, unclear expectations, and fragmented communication.",
      ],
      [
        "Development",
        "We brought those insights into a calm marketplace experience designed around discovery, trust, and follow-through.",
      ],
      [
        "Launch",
        "Argent Your launched with essential home, beauty, repair, and maintenance services in one connected platform.",
      ],
      [
        "Growth",
        "Every customer conversation and professional partnership helps us improve the service experience.",
      ],
      [
        "Future",
        "We are expanding thoughtfully, investing in quality, and building a platform that works better for every neighbourhood.",
      ],
    ],
  ],
  "/privacy": [
    "Your trust matters",
    "Privacy Policy",
    "Demo content for Argent Your. Please have this policy reviewed by qualified legal counsel before production use.",
    [
      [
        "Information We Collect",
        "We collect account details, service preferences, booking information, location details needed to deliver a service, and support messages.",
      ],
      [
        "How We Use Information",
        "We use information to provide services, coordinate professionals, process payments, improve reliability, and communicate important updates.",
      ],
      [
        "Data Protection",
        "Access controls, encryption practices, and operational safeguards help protect information from unauthorized access.",
      ],
      [
        "Cookies",
        "Essential cookies keep sessions secure. Analytics and preference cookies help us improve the experience when permitted.",
      ],
      [
        "Payment and third-party services",
        "Payment, map, communication, and analytics providers may process limited information under their own terms.",
      ],
      [
        "User rights and retention",
        "You may request access, correction, export, or deletion. We retain information only as long as operational or legal needs require.",
      ],
      [
        "Contact information",
        "For privacy questions, contact privacy@argentyour.demo.",
      ],
    ],
  ],
  "/terms": [
    "The clear version",
    "Terms & Conditions",
    "Demo content for Argent Your. Please have these terms reviewed by qualified legal counsel before production use.",
    [
      [
        "Introduction",
        "By using Argent Your, you agree to use the platform lawfully and respectfully.",
      ],
      [
        "User accounts",
        "Keep your details accurate, protect your credentials, and notify us about unauthorized access.",
      ],
      [
        "Service bookings and payments",
        "A booking is confirmed after service details, availability, and price are accepted. Payment terms appear before confirmation.",
      ],
      [
        "Cancellation and refunds",
        "Cancellation eligibility depends on timing and the provider's service policy. The available amount is shown before confirmation.",
      ],
      [
        "Service providers",
        "Professionals operate independently while meeting Argent Your profile, quality, and conduct expectations.",
      ],
      [
        "User responsibilities",
        "Do not misuse the platform, interfere with service delivery, or create misleading accounts.",
      ],
      [
        "Disputes and changes",
        "We aim to resolve concerns fairly and may update these terms with reasonable notice.",
      ],
    ],
  ],
  "/cookies": [
    "A clearer web experience",
    "Cookie Policy",
    "A practical explanation of how Argent Your uses cookies in this demo experience.",
    [
      [
        "What cookies are",
        "Cookies are small files that help a website remember preferences and understand how pages are used.",
      ],
      [
        "Essential cookies",
        "These support login sessions, security, routing, and core platform functions.",
      ],
      [
        "Analytics",
        "Analytics tools may help us understand performance and improve page structure using aggregated information.",
      ],
      [
        "Preferences",
        "Preference cookies remember choices such as location or display settings when available.",
      ],
      [
        "Managing cookies",
        "You can manage cookies through browser controls. Disabling essential cookies may affect platform functionality.",
      ],
    ],
  ],
  "/safety": [
    "Care with confidence",
    "Safety & Trust",
    "A dependable marketplace starts with people feeling safe, informed, and respected.",
    [
      [
        "Verified professionals",
        "We review identity details, skills, service history, and profile information before activation.",
      ],
      [
        "Professional standards",
        "Punctuality, respectful communication, care for property, and clear scope are part of our service expectations.",
      ],
      [
        "Customer safety",
        "Keep communication on the platform, confirm booking details, and contact support if something feels unusual.",
      ],
      [
        "Secure booking",
        "Booking records, service details, and support history stay connected so everyone knows what was agreed.",
      ],
      [
        "Issue reporting",
        "Report concerns to safety@argentyour.demo. Our team reviews every report carefully.",
      ],
      [
        "Customer support",
        "Our support team can help before, during, and after a visit.",
      ],
    ],
  ],
};
const genericContent = (title) => [
  "Argent Your",
  title,
  "A clear, useful place to find the information and support you need.",
  [
    [
      "Start here",
      "Argent Your brings trusted services, clear options, and thoughtful support into one calm experience.",
    ],
    [
      "Need help?",
      "Contact support@argentyour.demo and our team will guide you to the right next step.",
    ],
  ],
];
const faqs = [
  [
    "General",
    "What is Argent Your?",
    "Argent Your is a service marketplace connecting customers with trusted home, beauty, repair, and wellness professionals.",
  ],
  [
    "Booking",
    "How do I book a service?",
    "Choose a category, select a service, review availability and price, then confirm your preferred time and location.",
  ],
  [
    "Payments",
    "When do I see the price?",
    "The service price and relevant terms are shown before you confirm the booking.",
  ],
  [
    "Cancellation",
    "Can I reschedule?",
    "Most bookings can be rescheduled up to two hours before the appointment, subject to availability.",
  ],
  [
    "Professionals",
    "How are professionals selected?",
    "We review identity, skills, service history, and conduct expectations before activation.",
  ],
];
const jobs = [
  [
    "Product Designer",
    "Product",
    "Remote / Delhi NCR",
    "Full-time",
    "Shape simple, trustworthy experiences for everyday services.",
  ],
  [
    "Customer Experience Lead",
    "Operations",
    "Delhi NCR",
    "Full-time",
    "Help customers and professionals feel supported at every step.",
  ],
  [
    "Service Quality Partner",
    "City Operations",
    "Multiple cities",
    "Contract",
    "Build relationships with talented local professionals.",
  ],
];
const testimonials = [
  [
    "Maya R.",
    "Home Cleaning",
    "The booking was clear, the professional arrived on time, and the whole experience felt calm.",
  ],
  [
    "Daniel K.",
    "AC Repair",
    "I could compare the options quickly and got a clear update before the technician arrived.",
  ],
  [
    "Priya S.",
    "Salon & Spa",
    "A lovely at-home experience with careful work and kind communication.",
  ],
];

function PublicNav({
  onHome,
  search,
  setSearch,
  location,
  setLocation,
  onNavigate,
  onAuthOpen,
}) {
  const { user } = useAuth();
  return (
    <header className="info-header">
      <button onClick={onHome} className="flex shrink-0 items-center gap-3">
        <img
          src="/argent-logo.png"
          alt="Argent Your"
          className="h-10 w-10 rounded-xl object-contain shadow-sm"
        />
        <span className="text-lg font-semibold">Argent Your</span>
      </button>
      <div className="relative hidden max-w-sm flex-1 sm:flex">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && search.trim())
              onNavigate(`/services/${slug(search)}`);
          }}
          className="w-full rounded-xl border border-slate-200/80 bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700"
          placeholder="Search services"
        />
      </div>
      <button
        onClick={() => setLocation(location ? "" : "Select your location")}
        className="hidden items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold hover:bg-white md:flex"
      >
        <MapPin className="h-4 w-4 text-emerald-700" />
        {location || "Select your location"}
      </button>
      <button className="rounded-xl p-2.5 hover:bg-white" aria-label="Cart">
        <ShoppingBag className="h-5 w-5" />
      </button>
      <button
        onClick={onAuthOpen}
        className="rounded-xl bg-slate-950 p-2.5 text-white hover:bg-emerald-800"
        aria-label="Profile"
      >
        <CircleUserRound className="h-4 w-4" />
        <span className="hidden sm:inline">
          {user ? user.name : "Sign in / Log in"}
        </span>
      </button>
    </header>
  );
}

function FormCard({ type = "contact" }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold">
        {type === "professional"
          ? "Register as a Professional"
          : "Send us a message"}
      </h2>
      {sent ? (
        <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
          Thank you. Your demo submission has been received and our team will
          follow up soon.
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          {["Full Name", "Email", "Phone Number", "Location"].map((label) => (
            <input
              key={label}
              required
              placeholder={label}
              className="auth-input"
            />
          ))}
          <input
            placeholder={
              type === "professional"
                ? "Service category and experience"
                : "Subject"
            }
            className="auth-input sm:col-span-2"
          />
          {type === "professional" && (
            <input type="file" className="auth-input sm:col-span-2" />
          )}
          <textarea
            required
            placeholder={
              type === "professional"
                ? "Tell us about your experience"
                : "Message"
            }
            rows="5"
            className="auth-input sm:col-span-2"
          />
          <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 sm:col-span-2">
            {type === "professional" ? "Submit Application" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}

function ServicesPage({ onNavigate }) {
  return (
    <PageShell
      title="Services"
      subtitle="Everything you need, thoughtfully delivered."
      onNavigate={onNavigate}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceGroups.map(([name, description]) => (
          <button
            key={name}
            onClick={() => onNavigate(`/services/${slug(name)}`)}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Wrench className="h-6 w-6 text-emerald-700" />
            <h2 className="mt-5 text-lg font-bold">{name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
            <span className="mt-5 block text-xs font-bold text-emerald-800">
              Explore services{" "}
              <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function ServiceCategoryPage({ name, onNavigate }) {
  const description =
    serviceGroups.find(([label]) => slug(label) === name)?.[1] ||
    "Thoughtful service, delivered by trusted professionals.";
  return (
    <PageShell
      title={name.replace(/-/g, " ")}
      subtitle={description}
      onNavigate={onNavigate}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["Essential service", "Premium care", "Complete solution"].map(
          (packageName, index) => (
            <article
              key={packageName}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Package {index + 1}
              </span>
              <h2 className="mt-4 text-xl font-bold">{packageName}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                A carefully scoped option with clear pricing, flexible
                scheduling, and a vetted Argent Your professional.
              </p>
              <p className="mt-5 font-bold">From ${29 + index * 20}</p>
              <button
                onClick={() => onNavigate(`/services/${name}-essential`)}
                className="mt-5 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white"
              >
                View service
              </button>
            </article>
          ),
        )}
      </div>
    </PageShell>
  );
}

function FAQPage({ onNavigate }) {
  const [open, setOpen] = useState(null);
  return (
    <PageShell
      title="Frequently Asked Questions"
      subtitle="Clear answers for booking, payments, services, and support."
      onNavigate={onNavigate}
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map(([category, question, answer], index) => (
          <div
            key={question}
            className="rounded-2xl border border-slate-200 bg-white"
          >
            <button
              onClick={() => setOpen(open === index ? null : index)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  {category}
                </span>
                <span className="mt-1 block font-bold">{question}</span>
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${open === index ? "rotate-180" : ""}`}
              />
            </button>
            {open === index && (
              <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600">
                {answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function TestimonialsPage({ onNavigate }) {
  const [filter, setFilter] = useState("All");
  const list =
    filter === "All"
      ? testimonials
      : testimonials.filter((item) => item[1] === filter);
  return (
    <PageShell
      title="Customer Testimonials"
      subtitle="Real words from people who invited Argent Your into their routines."
      onNavigate={onNavigate}
    >
      <div className="mb-7 flex flex-wrap gap-2">
        {["All", "Home Cleaning", "AC Repair", "Salon & Spa"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-xs font-bold ${filter === item ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map(([name, service, review]) => (
          <article
            key={name}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">“{review}”</p>
            <p className="mt-5 font-bold">{name}</p>
            <p className="text-xs text-slate-500">{service}</p>
          </article>
        ))}
      </div>
      <button
        onClick={() => onNavigate("/contact")}
        className="mt-8 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
      >
        Share Your Experience
      </button>
    </PageShell>
  );
}

function CareersPage({ onNavigate }) {
  return (
    <PageShell
      title="Build the future with Argent Your"
      subtitle="Join a team designing a more human service marketplace."
      onNavigate={onNavigate}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          [
            "Why work with us",
            "Do meaningful work that improves everyday life.",
          ],
          [
            "Our culture",
            "Curious, respectful, practical, and generous with feedback.",
          ],
          [
            "Growth & learning",
            "Build your craft through mentorship and real ownership.",
          ],
          [
            "Employee benefits",
            "Flexible work, learning support, and thoughtful time off.",
          ],
        ].map(([title, text]) => (
          <section key={title} className="rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </section>
        ))}
      </div>
      <h2 className="display-font mt-14 text-3xl">Open positions</h2>
      <div className="mt-6 grid gap-4">
        {jobs.map(([title, department, location, type, description]) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {department} · {location} · {type}
                </p>
              </div>
              <button
                onClick={() => onNavigate("/contact")}
                className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"
              >
                Apply Now
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {description}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Requirements: thoughtful communication, relevant experience, and a
              care for quality.
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function ProfessionalsPage({ path, onNavigate }) {
  const isForm = path.endsWith("/register");
  return (
    <PageShell
      title={
        isForm
          ? "Register as a Professional"
          : path.endsWith("/login")
            ? "Professional Login"
            : "Grow your business with Argent Your"
      }
      subtitle={
        isForm
          ? "Bring your skills to customers looking for trusted care."
          : "More customers, flexible scheduling, and support that helps your business grow."
      }
      onNavigate={onNavigate}
    >
      {isForm ? (
        <FormCard type="professional" />
      ) : path.endsWith("/login") ? (
        <FormCard />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "More customers",
            "Flexible scheduling",
            "Digital bookings",
            "Training & support",
            "Professional profile",
            "Reliable payments",
          ].map((item) => (
            <section key={item} className="rounded-2xl bg-white p-6">
              <BriefcaseBusiness className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-4 font-bold">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Built to help independent professionals spend more time doing
                great work.
              </p>
            </section>
          ))}
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate("/professionals/register")}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Register as a Professional
        </button>
        <button
          onClick={() => onNavigate("/professionals/login")}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold"
        >
          Professional Login
        </button>
      </div>
    </PageShell>
  );
}

function PageShell({ title, subtitle, children, onNavigate, onAuthOpen }) {
  const [search, setSearch] = useState("");
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
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = onAuthOpen || (() => setAuthOpen(true));
  return (
    <div className="min-h-screen bg-[#f6f7f3] text-slate-950">
      <ArgentNavbar
        onLogoClick={() => onNavigate("/")}
        onAuthOpen={openAuth}
        onProfileClick={() => onNavigate("/profile")}
        onCartClick={() => onNavigate("/services")}
        cartCount={0}
        location={location}
        onLocationChange={setLocation}
        services={allServicesCatalog}
        onSelectService={(item) => onNavigate(`/services/${item.slug}`)}
        currentRoute={window.location.pathname}
        onNavigate={onNavigate}
      />
      <main className="mx-auto max-w-6xl px-5 pb-28 sm:pb-32 md:pb-20 pt-36 sm:pt-40 md:pt-28 lg:pt-32 lg:px-8">
        <button
          onClick={() => onNavigate("/")}
          className="mb-7 flex items-center gap-2 text-sm font-bold text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
        <div className="rounded-[28px] bg-[#e2eee5] p-8 sm:p-14">
          <p className="eyebrow">Argent Your / Information</p>
          <h1 className="display-font mt-4 max-w-4xl text-5xl leading-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {subtitle}
          </p>
        </div>
        <div className="mt-10">{children}</div>
      </main>
      <Footer onNavigate={onNavigate} />
      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onNavigate={onNavigate} />
      )}
    </div>
  );
}

export default function InfoPage({ path = "/about", onHome }) {
  const [currentPath, setCurrentPath] = useState(path);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  useEffect(() => {
    const sync = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const navigate = (target) => {
    if (target === "/") {
      onHome?.();
      return;
    }
    window.history.pushState({}, "", target);
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const isServices =
    currentPath === "/services" || currentPath === "/services/";
  if (isServices) return <ServicesPage onNavigate={navigate} />;
  if (
    currentPath.startsWith("/services/") &&
    serviceGroups.some(([name]) => slug(name) === currentPath.split("/").pop())
  )
    return (
      <ServiceCategoryPage
        name={currentPath.split("/").pop()}
        onNavigate={navigate}
      />
    );
  if (currentPath === "/faqs") return <FAQPage onNavigate={navigate} />;
  if (currentPath === "/testimonials" || currentPath === "/reviews")
    return <TestimonialsPage onNavigate={navigate} />;
  if (currentPath === "/careers") return <CareersPage onNavigate={navigate} />;
  if (currentPath.startsWith("/professionals"))
    return <ProfessionalsPage path={currentPath} onNavigate={navigate} />;
  if (
    [
      "/contact",
      "/support",
      "/booking-help",
      "/payment-help",
      "/report-issue",
    ].includes(currentPath)
  )
    return (
      <PageShell
        title={
          currentPath === "/contact"
            ? "Get in touch with Argent Your"
            : "How can we help you?"
        }
        subtitle="Our team is here to make the next step clear."
        onNavigate={navigate}
      >
        <FormCard />
      </PageShell>
    );
  if (currentPath === "/categories")
    return <ServicesPage onNavigate={navigate} />;
  if (
    currentPath.startsWith("/services/") &&
    !serviceGroups.some(([name]) => slug(name) === currentPath.split("/").pop())
  )
    return (
      <PageShell
        title={currentPath.split("/").pop().replace(/-/g, " ")}
        subtitle="A thoughtful service delivered by a trusted Argent Your professional."
        onNavigate={navigate}
      >
        <div className="grid gap-5 md:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 md:col-span-2">
            <h2 className="text-xl font-bold">Service details</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Clear scope, upfront pricing, flexible scheduling, and
              professional support are included with every Argent Your booking.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Book this service
            </button>
          </section>
          <section className="rounded-2xl bg-white p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <h2 className="mt-4 font-bold">Trusted care</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Verified professionals and support when you need it.
            </p>
          </section>
        </div>
      </PageShell>
    );
  const entry =
    content[currentPath] ||
    genericContent(currentPath.split("/").pop().replace(/-/g, " "));
  return (
    <PageShell title={entry[1]} subtitle={entry[2]} onNavigate={navigate}>
      <div className="grid gap-5 md:grid-cols-2">
        {entry[3].map(([heading, text]) => (
          <section
            key={heading}
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-xl font-bold">{heading}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
        <h2 className="font-bold">Ready for the next step?</h2>
        <p className="mt-2 text-sm text-white/60">
          Explore the Argent Your marketplace or speak with our team.
        </p>
        <button
          onClick={() => navigate("/services")}
          className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
        >
          Explore Our Services <ArrowRight className="ml-1 inline h-4 w-4" />
        </button>
      </div>
    </PageShell>
  );
}
