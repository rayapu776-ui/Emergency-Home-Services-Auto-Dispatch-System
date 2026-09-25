import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/common/Navbar";
import TechnicianOfferModal from "./components/common/TechnicianOfferModal";
import Footer from "./components/common/Footer";

// Customer & Admin Pages
import LoginPage from "./pages/LoginPage";
import CustomerRequestPage from "./pages/CustomerRequestPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminWorkforcePage from "./pages/AdminWorkforcePage";
import ServiceHistoryPage from "./pages/ServiceHistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import InfoPage from "./pages/InfoPage";

// Technician Portal Pages & Layout
import ProfessionalLayout from "./layouts/ProfessionalLayout";
import TechnicianLoginPage from "./pages/TechnicianLoginPage";
import TechnicianDashboardPage from "./pages/TechnicianDashboardPage";
import TechnicianJobsPage from "./pages/TechnicianJobsPage";
import TechnicianEarningsPage from "./pages/TechnicianEarningsPage";
import TechnicianNotificationsPage from "./pages/TechnicianNotificationsPage";
import TechnicianProfilePage from "./pages/TechnicianProfilePage";
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

// Protected route wrapper for professional portal
function TechnicianProtectedRoute() {
  const isLogged = technicianStore.isLoggedIn();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isLogged) {
    return <Navigate to="/technician/login" state={{ from: location }} replace />;
  }

  return (
    <ProfessionalLayout
      onLogout={() => {
        technicianStore.logout();
        navigate("/technician/login", { replace: true });
      }}
    />
  );
}

// Dedicated login page for professionals
function TechnicianLoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  if (technicianStore.isLoggedIn()) {
    return <Navigate to="/technician/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || "/technician/dashboard";

  return (
    <TechnicianLoginPage
      onLoginSuccess={() => {
        navigate(from, { replace: true });
      }}
      onBackToHome={() => {
        navigate("/");
      }}
    />
  );
}

// Customer and Admin application views
function CustomerAndAdminApp() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState("argent-home");
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");

  useEffect(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/services" ||
      location.pathname === "/checkout" ||
      location.pathname === "/bookings" ||
      location.pathname === "/profile"
    ) {
      setActivePage("argent-home");
    }
  }, [location.pathname]);

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

  // Argent Your customer website
  if (activePage === "argent-home" || !isAuthenticated) {
    return (
      <LoginPage
        onNavigateAdmin={() => setActivePage("admin-dashboard")}
        onNavigateTechnician={(path) => {
          navigate(path || "/technician/dashboard");
        }}
      />
    );
  }

  // Info pages
  if (
    infoRoutePrefixes.some(
      (prefix) =>
        location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
    )
  ) {
    return (
      <InfoPage
        path={location.pathname}
        onHome={() => navigate("/")}
        onNavigate={(path) => {
          if (path.startsWith("/technician")) {
            navigate(path);
            return;
          }
          navigate(path);
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
    navigate("/technician/dashboard");
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
        <BrowserRouter>
          <Routes>
            {/* 1. Dedicated Professional Portal Login */}
            <Route path="/technician/login" element={<TechnicianLoginRoute />} />

            {/* 2. Professional Portal Layout & Nested Routes */}
            <Route path="/technician" element={<TechnicianProtectedRoute />}>
              <Route index element={<Navigate to="/technician/dashboard" replace />} />
              <Route path="dashboard" element={<TechnicianDashboardPage />} />
              <Route path="jobs" element={<TechnicianJobsPage />} />
              <Route path="earnings" element={<TechnicianEarningsPage />} />
              <Route path="notifications" element={<TechnicianNotificationsPage />} />
              <Route path="profile" element={<TechnicianProfilePage />} />
              <Route path="*" element={<Navigate to="/technician/dashboard" replace />} />
            </Route>

            {/* 3. Customer & Admin Portal Routes */}
            <Route path="*" element={<CustomerAndAdminApp />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
