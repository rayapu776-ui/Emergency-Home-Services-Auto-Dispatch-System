import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/common/Navbar";
import TechnicianOfferModal from "./components/common/TechnicianOfferModal";

import LoginPage from "./pages/LoginPage";
import CustomerRequestPage from "./pages/CustomerRequestPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import TechnicianDashboardPage from "./pages/TechnicianDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminWorkforcePage from "./pages/AdminWorkforcePage";
import ServiceHistoryPage from "./pages/ServiceHistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import InfoPage from "./pages/InfoPage";
import Footer from "./components/common/Footer";

import TechnicianLoginPage from "./pages/TechnicianLoginPage";
import technicianStore from "./services/technicianStore";

const infoRoutePrefixes = [
  "/about",
  "/our-story",
  "/careers",
  "/contact",
  "/testimonials",
  "/investor-relations",
  "/terms",
  "/privacy",
  "/anti-discrimination",
  "/reviews",
  "/categories",
  "/cancellation-refund",
  "/safety",
  "/professionals/",
  "/professionals",
  "/faqs",
  "/report-issue",
  "/cookies",
  "/refund-policy",
  "/accessibility",
  "/responsible-service",
  "/social/",
  "/app/",
];

const professionalPortalPaths = new Set([
  "/technician/dashboard",
  "/technician/jobs",
  "/technician/earnings",
  "/technician/notifications",
  "/technician/profile",
]);

const isProfessionalPortalPath = (path) =>
  professionalPortalPaths.has(path) || path === "/technician";

function MainApp() {
  const { user, isAuthenticated, loading } = useAuth();

  const getInitialPage = () => {
    // Keep an authenticated professional inside the portal, while preserving the
    // exact section the browser is currently showing.
    if (technicianStore.isLoggedIn()) {
      if (!isProfessionalPortalPath(window.location.pathname)) {
        window.history.replaceState({}, "", "/technician/dashboard");
      }
      return "technician-dashboard";
    }

    const path = window.location.pathname;
    if (
      path === "/technician/dashboard" ||
      path === "/technician/login" ||
      path === "/technician"
    ) {
      return "technician-login";
    }
    return "argent-home";
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");

  useEffect(() => {
    const handlePopState = () => {
      // Browser history stays within the authenticated professional portal.
      if (technicianStore.isLoggedIn()) {
        if (!isProfessionalPortalPath(window.location.pathname)) {
          window.history.replaceState(null, "", "/technician/dashboard");
        }
        setActivePage("technician-dashboard");
        return;
      }

      const path = window.location.pathname;
      if (
        path === "/technician/dashboard" ||
        path === "/technician/login" ||
        path === "/technician"
      ) {
        setActivePage("technician-login");
      } else if (
        path === "/" ||
        path === "/services" ||
        path === "/checkout" ||
        path === "/bookings" ||
        path === "/profile"
      ) {
        setActivePage("argent-home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1613] flex flex-col items-center justify-center space-y-4">
        <img
          src="/argent-logo.png"
          alt="Argent Your"
          className="h-16 w-16 rounded-2xl object-contain shadow-xl animate-pulse"
        />
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm font-semibold tracking-wider uppercase">
          Initializing Argent Your...
        </p>
      </div>
    );
  }

  // 1. Dedicated Technician Portal Pages
  if (activePage === "technician-login") {
    return (
      <TechnicianLoginPage
        onLoginSuccess={() => {
          window.history.pushState({}, "", "/technician/dashboard");
          setActivePage("technician-dashboard");
        }}
        onBackToHome={() => {
          window.history.pushState({}, "", "/");
          setActivePage("argent-home");
        }}
      />
    );
  }

  if (activePage === "technician-dashboard") {
    return (
      <TechnicianDashboardPage
        onLogout={() => {
          technicianStore.logout();
          window.history.pushState({}, "", "/technician/login");
          setActivePage("technician-login");
        }}
        onBackToHome={() => {
          window.history.pushState({}, "", "/");
          setActivePage("argent-home");
        }}
      />
    );
  }

  // 2. Argent Your customer website (Home, Services, Bookings, Profile, Checkout)
  if (activePage === "argent-home" || !isAuthenticated) {
    return (
      <LoginPage
        onNavigateAdmin={() => setActivePage("admin-dashboard")}
        onNavigateTechnician={(path) => {
          const isDash =
            path === "/technician/dashboard" || technicianStore.isLoggedIn();
          const target = isDash ? "technician-dashboard" : "technician-login";
          window.history.pushState(
            {},
            "",
            isDash ? "/technician/dashboard" : "/technician/login",
          );
          setActivePage(target);
        }}
      />
    );
  }

  if (
    infoRoutePrefixes.some(
      (prefix) =>
        window.location.pathname === prefix ||
        window.location.pathname.startsWith(`${prefix}/`),
    )
  ) {
    return (
      <InfoPage
        path={window.location.pathname}
        onHome={() => window.location.assign("/")}
        onNavigate={(path) => {
          if (path.startsWith("/technician")) {
            const isDash =
              path === "/technician/dashboard" || technicianStore.isLoggedIn();
            const target = isDash ? "technician-dashboard" : "technician-login";
            window.history.pushState(
              {},
              "",
              isDash ? "/technician/dashboard" : "/technician/login",
            );
            setActivePage(target);
            return;
          }
          window.location.assign(path);
        }}
      />
    );
  }

  const handleRequestCreated = (requestId) => {
    setActiveTrackingId(requestId);
    setActivePage("live-tracking");
  };

  const handleJobAccepted = (requestId) => {
    setActiveTrackingId(requestId);
    setActivePage("technician-dashboard");
  };

  const handleInspectRequest = (requestId) => {
    setActiveTrackingId(requestId);
    setActivePage("live-tracking");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />

      {/* Technician Global Dispatch Alert Modal */}
      <TechnicianOfferModal onJobAccepted={handleJobAccepted} />

      <main className="flex-1 pb-12">
        {activePage === "customer-request" && (
          <CustomerRequestPage onRequestCreated={handleRequestCreated} />
        )}

        {activePage === "live-tracking" && (
          <LiveTrackingPage
            requestId={activeTrackingId}
            onNavigateRequest={() => setActivePage("customer-request")}
          />
        )}

        {activePage === "technician-dashboard" && (
          <TechnicianDashboardPage
            activeRequestId={activeTrackingId}
            onNavigateHistory={() => setActivePage("history")}
          />
        )}

        {activePage === "admin-dashboard" && (
          <AdminDashboardPage onInspectRequest={handleInspectRequest} />
        )}

        {activePage === "admin-workforce" && <AdminWorkforcePage />}

        {activePage === "history" && (
          <ServiceHistoryPage onInspectRequest={handleInspectRequest} />
        )}

        {activePage === "analytics" && <AnalyticsPage />}

        {activePage === "profile" && <ProfilePage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
