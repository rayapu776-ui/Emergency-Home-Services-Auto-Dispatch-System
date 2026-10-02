import jwt from "jsonwebtoken";
import { query } from "../db/database.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "emergency-dispatch-super-secret-key-2026";

export async function verifySocketToken(token) {
  if (!token) return null;
  try {
    const claims = jwt.verify(token, JWT_SECRET);
    const account = await query.get(
      "SELECT id, role, account_status, admin_role, session_version FROM users WHERE id = ?",
      [claims.id],
    );
    if (
      !account ||
      account.role !== claims.role ||
      account.account_status !== "Active" ||
      (claims.role === "admin" &&
        Number(claims.sessionVersion || 0) !== account.session_version)
    ) {
      return null;
    }
    return { ...claims, adminRole: account.admin_role };
  } catch {
    return null;
  }
}

export function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...options });
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const account = await query.get(
      "SELECT id, role, account_status, admin_role, session_version FROM users WHERE id = ?",
      [user.id],
    );
    if (!account || account.role !== user.role) {
      return res
        .status(401)
        .json({ error: "Account session is no longer valid." });
    }
    if (account.account_status !== "Active") {
      return res.status(403).json({ error: "This account is suspended." });
    }
    if (
      account.role === "admin" &&
      Number(user.sessionVersion || 0) !== account.session_version
    ) {
      return res.status(401).json({ error: "Admin session has been revoked." });
    }
    req.user = { ...user, adminRole: account.admin_role };
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    console.error("Token account validation failed:", err);
    return res
      .status(500)
      .json({ error: "Unable to validate account session." });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized. Required role: ${allowedRoles.join(" or ")}`,
      });
    }
    next();
  };
}

export async function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Super Admin access required." });
  }
  try {
    const admin = await query.get(
      "SELECT admin_role, account_status FROM users WHERE id = ? AND role = 'admin'",
      [req.user.id],
    );
    if (!admin || admin.account_status !== "Active") {
      return res.status(403).json({ error: "Admin account is inactive." });
    }
    if (admin.admin_role !== "super_admin") {
      return res
        .status(403)
        .json({ error: "Only a Super Admin can access this portal." });
    }
    req.user.adminRole = admin.admin_role;
    next();
  } catch (err) {
    console.error("Super Admin authorization error:", err);
    res.status(500).json({ error: "Could not verify Super Admin access." });
  }
}

const ADMIN_PERMISSIONS = {
  super_admin: ["*"],
  operations_admin: [
    "dashboard.read",
    "customers.read",
    "customers.manage",
    "professionals.read",
    "professionals.manage",
    "verification.manage",
    "bookings.read",
    "bookings.manage",
    "dispatch.manage",
    "earnings.read",
    "reviews.read",
    "reviews.manage",
    "notifications.read",
    "notifications.send",
    "activity.read",
    "analytics.read",
  ],
  support_admin: [
    "dashboard.read",
    "customers.read",
    "bookings.read",
    "notifications.read",
    "activity.read",
  ],
  finance_admin: ["dashboard.read", "earnings.read", "activity.read"],
  content_admin: ["dashboard.read", "activity.read"],
};

export function requireAdminPermission(permission) {
  return async (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required." });
    }

    try {
      const admin = await query.get(
        "SELECT role, admin_role, account_status FROM users WHERE id = ?",
        [req.user.id],
      );
      if (
        !admin ||
        admin.role !== "admin" ||
        admin.account_status !== "Active"
      ) {
        return res
          .status(403)
          .json({ error: "Administrator account is inactive." });
      }

      const adminRole = admin.admin_role || "operations_admin";
      const permissions = ADMIN_PERMISSIONS[adminRole] || [];
      if (!permissions.includes("*") && !permissions.includes(permission)) {
        return res.status(403).json({
          error: "Your administrator role cannot perform this action.",
        });
      }

      req.user.adminRole = adminRole;
      next();
    } catch (err) {
      console.error("Admin permission check failed:", err);
      res
        .status(500)
        .json({ error: "Could not verify administrator permissions." });
    }
  };
}
