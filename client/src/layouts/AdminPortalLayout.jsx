import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BadgeIndianRupee,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import adminStore from "../services/adminStore";

const navigation = [
  { label: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { label: "Customers", path: "customers", icon: Users },
  { label: "Professionals", path: "professionals", icon: BriefcaseBusiness },
  { label: "Verification", path: "verification", icon: FileCheck2 },
  { label: "Services", path: "services", icon: Package },
  { label: "Categories", path: "categories", icon: Tags },
  { label: "Bookings", path: "bookings", icon: ClipboardList },
  { label: "Live dispatch", path: "dispatch", icon: Activity },
  { label: "Payments", path: "payments", icon: BadgeIndianRupee },
  { label: "Earnings", path: "earnings", icon: Wallet },
  { label: "Offers", path: "offers", icon: Tags },
  { label: "Reviews", path: "reviews", icon: ShieldCheck },
  { label: "Notifications", path: "notifications", icon: Activity },
  { label: "Support", path: "support", icon: ClipboardList },
  { label: "Content", path: "content", icon: Package },
  { label: "Analytics", path: "analytics", icon: ChartNoAxesCombined },
  { label: "Activity log", path: "activity", icon: Activity },
  { label: "Settings", path: "settings", icon: Settings },
];

export default function AdminPortalLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = adminStore.getUser();
  const roleNavigation =
    {
      super_admin: navigation,
      operations_admin: navigation.filter(({ path }) =>
        [
          "dashboard",
          "customers",
          "professionals",
          "verification",
          "bookings",
          "dispatch",
          "earnings",
          "reviews",
          "notifications",
          "analytics",
          "activity",
        ].includes(path),
      ),
      support_admin: navigation.filter(({ path }) =>
        [
          "dashboard",
          "customers",
          "bookings",
          "notifications",
          "support",
          "activity",
        ].includes(path),
      ),
      finance_admin: navigation.filter(({ path }) =>
        ["dashboard", "payments", "earnings", "activity"].includes(path),
      ),
      content_admin: navigation.filter(({ path }) =>
        [
          "dashboard",
          "services",
          "categories",
          "offers",
          "content",
          "activity",
        ].includes(path),
      ),
    }[user?.adminRole] || navigation.filter(({ path }) => path === "dashboard");

  const logout = () => {
    adminStore.logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-slate-900 lg:flex">
      <button
        type="button"
        aria-label="Open admin navigation"
        onClick={() => setMenuOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
      >
        <Menu size={20} />
      </button>
      {menuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/argent-logo.png"
              alt="Argent Your"
              className="h-9 w-9 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-bold">Argent Your</p>
              <p className="text-[11px] text-slate-500">Admin portal</p>
            </div>
          </div>
          <button
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="p-1 text-slate-500 lg:hidden"
          >
            <X size={18} />
          </button>
          <PanelLeftClose
            className="hidden text-slate-400 lg:block"
            size={18}
          />
        </div>
        <nav
          className="flex-1 overflow-y-auto p-3"
          aria-label="Admin navigation"
        >
          {roleNavigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-sm font-semibold">
            {user?.name || "Administrator"}
          </p>
          <p className="mb-3 truncate text-xs text-slate-500">
            {user?.adminRole?.replaceAll("_", " ") || "Admin"}
          </p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
