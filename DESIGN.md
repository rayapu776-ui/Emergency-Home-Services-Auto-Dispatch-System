# 🎨 Design System & UI/UX Guidelines

**Brand Name:** Argent Your  
**Document Version:** 2.0.0  
**Status:** Canonical Design Guide  
**Theme:** Modern Glassmorphism & High-Trust Doorstep Care

---

## 1. Brand Identity & Design Philosophy

**Argent Your** harmonizes two distinct emotional needs in home services:

1. **Calm, High-End Reliability:** For scheduled household care (salon, spa, deep cleaning, smart home upgrades).
2. **Urgent, Transparent Clarity:** For emergency breakdowns (burst pipes, sparking breaker boxes, gas leaks).

### Core Design Principles:

- **Zero Ambiguity:** Emergency statuses must be immediately identifiable through color, icon, and text without confusing technical jargon.
- **Floating Glassmorphism:** Semi-transparent backdrops (`backdrop-blur-xl`, `bg-white/90`, subtle 1px border `border-white/80`) that float smoothly above page content to deliver a modern, premium aesthetic.
- **Proportional Elegance:** Navbars and cards must never feel bulky, oversized, or cramped; desktop elements utilize generous horizontal space, while mobile elements prioritize thumb-zone ergonomics.

---

## 2. Color Palette & Token System

```
Primary Surfaces:
  ├── Canvas Background:   #F6F7F3 (Warm Cream / Pearl)
  ├── Card Surfaces:       #FFFFFF (Pure White)
  ├── Glass Overlay:       rgba(255, 255, 255, 0.90) / backdrop-blur-xl
  └── Dark Backdrop:       #0F172A (Slate 900) / #020617 (Slate 950)

Brand Emeralds (Trust & Action):
  ├── Emerald 950:         #022C22 (Deep Forest Accent)
  ├── Emerald 900:         #064E3B (Primary Brand Green)
  ├── Emerald 800:         #065F46 (Interactive Hover State)
  ├── Emerald 600:         #059669 (Active Pills & Indicators)
  └── Emerald 500/100:     #10B981 / #D1FAE5 (Badges & Subtle Fills)

Status & Emergency Semantics:
  ├── Critical / Danger:   #E11D48 (Rose 600) / #FFF1F2 (Rose 50)
  ├── Warning / Attention: #D97706 (Amber 600) / #FEF3C7 (Amber 100)
  ├── Active / In Progress:#2563EB (Blue 600) / #EFF6FF (Blue 50)
  └── Completed / Success: #059669 (Emerald 600) / #ECFDF5 (Emerald 50)
```

---

## 3. Typography Hierarchy

The typographic system pairs an authoritative, modern sans-serif body with refined display styling.

| Role                 | Font Family / Style           | Size        | Weight          | Tracking & Transform                   | Usage                                   |
| :------------------- | :---------------------------- | :---------- | :-------------- | :------------------------------------- | :-------------------------------------- |
| **Eyebrow**          | Inter / System Sans           | 10px – 11px | 800 (Extrabold) | Uppercase, `tracking-[0.16em]`         | Section tags (e.g. `OUR SERVICES`)      |
| **Display Hero**     | Inter / Display Serif Accents | 42px – 60px | 900 (Black)     | `tracking-[-0.04em]`, `leading-[1.04]` | Homepage Hero headline                  |
| **Section Title**    | Inter / System Sans           | 24px – 32px | 800 (Extrabold) | `tracking-tight`                       | Module headers, Catalog category titles |
| **Card Heading**     | Inter / System Sans           | 14px – 16px | 700 (Bold)      | Normal                                 | Service cards, Technician names         |
| **Body & Labels**    | Inter / System Sans           | 12px – 14px | 500 (Medium)    | Normal                                 | Descriptions, address lines, subtexts   |
| **Telemetry / Code** | Fira Code / Mono              | 10px – 12px | 700 (Bold)      | Monospace                              | Timers, Incident IDs, Coupon codes      |

---

## 4. Layout & Responsive Structure

### 4.1 Desktop Layout (`md` breakpoint and above)

```
+-----------------------------------------------------------------------------------+
|  [Logo + Argent Your]   [============= Large Search Bar =============]   [Actions] |  <- Floating Glass Navbar
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  LEFT COLUMN: Hero Copy & Actions                RIGHT COLUMN: Promo Card         |
|  - Eyebrow: "TRUSTED CARE, BEAUTIFULLY DELIVERED"  - Large rounded promotion card |
|  - Title: "Home services at your doorstep."         (HeroPromoCarousel)           |
|  - Description text                                - Auto-slides with timer       |
|  - [Explore Services] button                       - Glassmorphism overlay        |
|  - Feature badges (Same-day support, Vetted)       - [Book Now / Copy Code]       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  OUR SERVICES (Clean Grid of Categorized Service Cards)                           |
+-----------------------------------------------------------------------------------+
```

#### Desktop Navbar Specifications:

- **Maximum Width:** `max-w-[1440px]` spanning the screen comfortably with `px-5 lg:px-8` inner padding.
- **Navbar Height:** Exactly `h-[66px]`, elevated slightly with `pt-3 sm:pt-3.5` top margin to float above content.
- **Logged-Out State:** Strictly contains:
  1. Company Logo (`h-9 w-9`) + Company Name (`text-base sm:text-lg font-bold`).
  2. Large Service Search Bar (`h-10 sm:h-11`, `max-w-2xl lg:max-w-3xl xl:max-w-4xl`).
  3. **“Sign in / Log in”** Button (`bg-slate-950 text-white rounded-xl hover:bg-emerald-800`).
     _(No location, no cart, no notification, no profile icon)._
- **Logged-In State:** Symmetrically centers the search bar with 4 horizontally aligned and vertically centered `h-10` items on the right:
  1. Location Selector (`[ 📍 Delhi NCR ▾ ]`)
  2. Cart Button (`[ 🛒 ]` with count badge)
  3. Notification Button (`[ 🔔 ]` with unread dot & dropdown)
  4. Profile Button (`[ 👤 ]`)

---

### 4.2 Mobile Layout (under `md` breakpoint)

- **Header Auto-Suppression:**
  - The large top search & branding header is displayed **only on the Home page**.
  - On any internal navigation page (`/bookings`, `/profile`, `/checkout`, `/services/*`, `/offers`), the top header is completely hidden on mobile so content begins immediately at the top without clutter.
- **Fixed Bottom Navigation Bar:**
  - 5 equal grid columns: **Home**, **Bookings**, **Services**, **Offers**, **Profile**.
  - Fixed at `bottom-0` with `pb-[env(safe-area-inset-bottom)]`.
  - **Tap-Active-to-Reload Feature:** Tapping the currently active tab triggers an immediate page refresh (`window.location.reload()`). Tapping the company logo on mobile navigates to `/` and refreshes.

---

## 5. Key Component Designs

### 5.1 Hero Promotional Carousel (`HeroPromoCarousel.jsx`)

- **Container:** Rounded corners (`rounded-3xl lg:rounded-[2rem]`), balanced height (`h-[400px] sm:h-[440px] lg:h-[470px]`).
- **Card Overlay:** Glassmorphism overlay card at the bottom (`bg-slate-950/75 backdrop-blur-xl border border-white/25`) displaying offer title, discount badge, coupon code button with 1-click clipboard copy, and "Book Now" CTA.
- **Controls:** Hover pause, touch swipe gestures (left/right $\ge 45\text{px}$ threshold), slide counter (`1 / 6`), and chevron controls.

### 5.2 Live Tracking Map (`LeafletMap.jsx`)

- **Beacons:** High-contrast pulsing circular radar for customer emergency point; custom car/van icon with directional bearing for technician.
- **Route Polyline:** Bold emerald path (`#059669`, weight 5px, opacity 0.85) dynamically connecting vehicle to destination.
- **Dynamic Floating Pill:** Live ETA countdown overlay (`"Arriving in 8 mins"`).

### 5.3 Rating & Review Modal

- Interactive 5-star selector with hover enlargement (`hover:scale-125`).
- Dynamic feedback rating label (`5 = Excellent! ⭐⭐⭐⭐⭐`, `1 = Terrible ⭐`).
- Multi-line optional text review input and disabled-state submit prevention.

### 5.4 Notification Dropdown (`NotificationDropdown.jsx`)

- Floating card anchored to bell icon (`right-0 top-14 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl`).
- Real notification items (Booking Confirmed, Provider Assigned, Booking Rescheduled, Service Completed, Booking Cancelled).
- Empty state: Clean slate illustration with text `"No notifications yet"`.
- Action: `"Mark all read"` button triggering backend synchronization.
