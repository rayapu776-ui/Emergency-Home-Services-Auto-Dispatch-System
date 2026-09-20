# 📜 Engineering Standards & Project Rules

**Project Name:** Argent Your / Emergency Home Services Auto-Dispatch System  
**Document Version:** 2.0.0  
**Enforcement:** Mandatory for all contributors, AI agents, and developers  
**Last Updated:** September 2026

---

## 1. Golden Rules of the Codebase

### Rule 1: Zero Fake Data on Refresh

- **Never** inject hardcoded mock bookings, dummy cart items, or synthetic notifications on page reload.
- Initial state must always be clean (`[]` or `null`).
- User actions (bookings, cart additions, ratings, addresses, notifications) must persist across browser refreshes and be scoped to the authenticated user ID (`user.id`).
- When a user logs out or switches accounts, one user's state must never bleed into another user's session.

### Rule 2: Strict Desktop vs. Mobile Layout Separation

- **Mobile Bottom Navigation:** Must remain strictly mobile (`md:hidden`). Never display bottom navigation tabs on desktop screens.
- **Mobile Active Tab Reload:** On mobile, tapping the active bottom navigation tab or the header logo must reload the page (`window.location.reload()`). This behavior is strictly mobile-only and must never be applied to desktop clicks.
- **Desktop Navbar Sizing:** Keep the desktop navbar floating, horizontal, proportional, and slim (`h-[66px]`, `max-w-[1440px]`). Never allow the desktop navbar to become oversized, stacked, or duplicated.
- **Logged-Out Desktop State:** When unauthenticated, the desktop navbar must show **ONLY**:
  1. Logo + Company Name
  2. Large Search Bar
  3. "Sign in / Log in" button
     _(No location, no cart, no notification, no profile icon)._

### Rule 3: Targeted Modifications Only (No Unsolicited Redesigns)

- When resolving bugs or fulfilling targeted feature requests, **never** redesign working UI components, change brand colors, alter typography, or break existing navigation routes.
- Preserve existing Tailwind styling tokens, glassmorphism blur effects (`backdrop-blur-xl`), and color scales (`#f6f7f3`, emeralds, slates).

---

## 2. Frontend Development Standards (React + Vite)

### 2.1 File Organization & Architecture

- Keep UI components in `client/src/components/common/` if shared globally, or in `client/src/pages/` if route-specific.
- Centralize user-scoped state synchronization in `client/src/services/userStore.js`.
- Always verify production builds before marking tasks complete:
  ```bash
  cd client && npm run build
  ```

### 2.2 React Component Best Practices

- **Custom Hooks & Clean Cleanup:** Any `setInterval` (e.g. promotional carousel, countdown timer) or `addEventListener` must have an explicit cleanup callback in `useEffect`.
- **Keyboard & Touch Ergonomics:** All interactive buttons must have `cursor-pointer`, active states (`active:scale-95`), and accessible `aria-label` or `title` tags.
- **Touch Targets:** Interactive mobile elements must meet the minimum $44 \times 44\text{px}$ touch target size.

---

## 3. Backend & API Standards (Node.js + Express + SQLite)

### 3.1 REST API Conventions

- Base routing prefix: `/api/` (e.g. `/api/requests`, `/api/user/cart`, `/api/user/notifications`, `/api/technicians`).
- Always return consistent JSON envelopes:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional status message"
  }
  ```
- Use appropriate HTTP status codes:
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Successful creation of booking, cart item, or notification.
  - `400 Bad Request`: Validation failure or missing parameters.
  - `401 Unauthorized`: Missing or invalid JWT bearer token.
  - `404 Not Found`: Resource or technician not found.
  - `500 Internal Error`: Unhandled server exception with logged trace.

### 3.2 Database & Data Loss Prevention

- **Parameterized SQL:** Always use parameterized placeholders (`?`) in SQLite queries to prevent SQL injection.
  ```javascript
  // CORRECT:
  db.run("UPDATE requests SET status = ? WHERE id = ?", [status, id]);
  // FORBIDDEN:
  db.run(`UPDATE requests SET status = '${status}' WHERE id = '${id}'`);
  ```
- **Non-Destructive Migrations:** Never execute `DROP TABLE` or destructive `ALTER TABLE` operations on live databases without explicit user consent. Always check column existence with `PRAGMA table_info` before adding new schema columns.

---

## 4. WebSocket & Telemetry Rules (Socket.io)

1. **Room Segmentation:** Broadcast events only to relevant rooms (`user_{id}`, `tech_{id}`, `role_admin`, `job_{id}`). Never broadcast private customer locations or notes to global channels.
2. **Idempotent Handlers:** Telemetry event listeners on the client must be registered once and cleaned up on unmount to prevent memory leaks and duplicate listeners.
3. **Payload Sanitization:** Telemetry location packets must include validated coordinates, bearing, timestamp, and speed:
   ```json
   {
     "requestId": "AY-9402",
     "technicianId": "tech-01",
     "lat": 28.5355,
     "lng": 77.391,
     "bearing": 182,
     "speedKmh": 32.4,
     "timestamp": 1789666700000
   }
   ```

---

## 5. Verification & Pre-Commit Checklist

Before declaring any change complete:

1. [ ] **Build Validation:** Run `npm run build` in `/client` and confirm exit code 0.
2. [ ] **Console Inspection:** Verify no React key errors, unhandled promise rejections, or duplicate state renders.
3. [ ] **Persistence Verification:** Refresh browser on the target view and confirm that state does not reset or spawn demo mock items.
4. [ ] **Device Responsiveness:** Check viewport behavior on mobile ($\le 480\text{px}$), tablet ($\approx 768\text{px}$), and desktop ($\ge 1280\text{px}$).
5. [ ] **Documentation Update:** Update `walkthrough.md` and relevant technical docs if schema, routes, or design parameters were modified.
