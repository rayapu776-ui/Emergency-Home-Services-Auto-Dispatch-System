# 🧠 Argent Your / Emergency Auto-Dispatch System — System Memory & PRD Context

**File:** memory.prd  
**Project:** Argent Your (Emergency Home Services Auto-Dispatch System)  
**Schema Version:** 2.0.0  
**Last Updated:** September 2026  

---

## 1. System Identity & Core Mission

- **Brand Name:** Argent Your
- **Repository Type:** Monorepo (Frontend: `/client`, Backend: `/server`)
- **Dual Operational Model:**
  1. **Consumer Marketplace:** On-demand and scheduled home services (Cleaning, Salon & Spa, AC & Appliances, Electrical, Plumbing, Painting).
  2. **Emergency Auto-Dispatch:** Sub-minute proximity-based algorithmic technician dispatch for urgent domestic emergencies (gas leaks, pipe bursts, electrical failures) with live GPS vehicle tracking on OpenStreetMap (Leaflet).

---

## 2. Invariants & Architectural Non-Negotiables

### 🔒 Invariant 1: Zero Fake / Demo Data Guarantee
- **Never** inject synthetic mock orders, cart items, notifications, or fake reviews upon browser refresh.
- Empty states must initialize cleanly as empty arrays (`[]`).
- All state changes (bookings, cart additions, ratings, addresses, notifications) must be persisted in SQLite (`server/dispatch.db`) and scoped to the logged-in user ID (`user.id`) through `client/src/services/userStore.js`.
- Refreshing the browser preserves user state without inventing or resetting data.

### 🔒 Invariant 2: Desktop Navbar Strict Specifications
- **Container Sizing:** `max-w-[1440px]`, `h-[66px]`, floating with top padding `pt-3 sm:pt-3.5`, glassmorphism (`bg-white/90 border border-white/80 shadow-[0_8px_30px_rgba(27,45,39,0.06)] backdrop-blur-xl rounded-2xl`).
- **Logged-Out State:** Must contain **ONLY**:
  1. Logo (`h-9 w-9`) + Company Name (`Argent Your`)
  2. Large service search bar (`h-10 sm:h-11`, `max-w-2xl lg:max-w-3xl xl:max-w-4xl`)
  3. “Sign in / Log in” button
  *(Strictly NO location, NO cart, NO notification, NO profile icon, NO extra icons, NO second navbar).*
- **Logged-In State:** Symmetrically retains:
  - Logo + Company Name
  - Search Bar
  - Location Selector (`[ 📍 Location ▾ ]`)
  - Cart Button (`[ 🛒 ]` with count badge)
  - Notification Button (`[ 🔔 ]` with unread indicator & dropdown)
  - Profile Button (`[ 👤 ]` navigating to `/profile`)
  *(All right-side items are horizontally aligned and vertically centered with height `h-10`).*

### 🔒 Invariant 3: Mobile-Only Navigation Behaviors
- **Top Header:** Visible on Home page; **automatically suppressed / hidden** on all internal sub-pages (`/bookings`, `/profile`, `/checkout`, `/services/*`, `/offers`) so content starts cleanly from the top.
- **Fixed Bottom Navigation:** 5 columns (Home, Bookings, Services, Offers, Profile) fixed at bottom (`md:hidden`).
- **Active-Tab Tap-To-Reload:** If the user is already on a page and taps that active bottom nav tab again, the page reloads (`window.location.reload()`). Tapping the company logo on mobile navigates to `/` and refreshes. This behavior is strictly mobile-only.

### 🔒 Invariant 4: Real Communication & Feedback Loops
- **Direct Connect:** Technician cards have working `tel:[phone]` links for calls, and `sms:[phone]?body=...` links with pre-filled context.
- **Rating Flow:** Completed bookings allow a 1 to 5 star rating + feedback review, which recalculates the technician's average rating in SQLite and prevents duplicate reviews.

---

## 3. Technology Stack & Key File Locations

| Layer | Technology | Primary Source File(s) |
| :--- | :--- | :--- |
| **Frontend Root** | React 18, Vite | `client/src/App.jsx`, `client/src/main.jsx` |
| **Main Page / Router** | React Router / Tab Routing | `client/src/pages/LoginPage.jsx` |
| **Desktop & Mobile Navbar** | React, Tailwind, Lucide | `client/src/components/common/ArgentNavbar.jsx` |
| **Customer Profile & Bookings** | React, userStore | `client/src/pages/ProfilePage.jsx` |
| **Checkout & Payments** | React, userStore | `client/src/pages/PaymentPage.jsx` |
| **Hero Promo Carousel** | React, Touch/Swipe | `client/src/components/common/HeroPromoCarousel.jsx` |
| **Notification Dropdown** | React, userStore | `client/src/components/common/NotificationDropdown.jsx` |
| **Client State Persistence** | LocalStorage + API Sync | `client/src/services/userStore.js` |
| **Backend Entry** | Node.js, Express, Socket.io | `server/src/index.js` (Port 5000) |
| **Database Persistence** | SQLite3 | `server/src/db/database.js` (`server/dispatch.db`) |
| **Dispatch & Booking Routes** | Express Router | `server/src/routes/requestRoutes.js` |
| **User Data Routes** | Express Router (Cart, Notifs) | `server/src/routes/userDataRoutes.js` |
| **Authentication Routes** | Express Router (JWT, OTP) | `server/src/routes/authRoutes.js` |

---

## 4. Active Database Entities & Schema Notes

- **`users`:** `id`, `email`, `phone`, `password_hash`, `name`, `role` (`customer` | `technician` | `admin`), `address`, `avatar`.
- **`technicians`:** `id`, `name`, `phone`, `category`, `rating`, `review_count`, `photo`, `experience`, `is_online`, `is_busy`, `latitude`, `longitude`.
- **`requests`:** `id`, `customer_id`, `technician_id`, `category`, `service_name`, `service_slug`, `service_image`, `priority`, `status`, `address`, `latitude`, `longitude`, `scheduled_date`, `scheduled_time`, `price`, `total_paid`, `payment_method`, `rating`, `feedback`, `notes`.
- **`user_cart`:** `id`, `user_id`, `service_slug`, `service_name`, `service_image`, `price`, `quantity`, `target_audience`.
- **`user_notifications`:** `id`, `user_id`, `title`, `description`, `type`, `unread`, `time`.

---

## 5. Decision Log & Change History

1. **Mobile Header Suppression:** Top navbar is hidden on mobile internal views to provide full vertical space for booking cards and profile details.
2. **Back Arrow Removal:** Cleaned header layouts across all internal pages; browser back functionality preserved.
3. **Active Page Tap-To-Reload:** Added on mobile bottom navigation to allow instant data refresh for live bookings without manual pull-to-refresh.
4. **Persistent User Data Architecture:** Implemented `userStore.js` and SQLite schema migration (`ALTER TABLE` and tables `user_cart`, `user_notifications`) ensuring browser refreshes do not corrupt or invent data.
5. **Desktop Navbar Polish:** Implemented `max-w-[1440px]`, `h-[66px]` floating glass navbar; logged-out state simplified to strictly Logo + Large Search + Sign In button; logged-in state features horizontally aligned, vertically centered action icons.

