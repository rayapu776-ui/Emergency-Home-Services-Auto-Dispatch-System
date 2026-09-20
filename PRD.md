# 📄 Product Requirements Document (PRD)

**Project Name:** Argent Your / Emergency Home Services Auto-Dispatch System  
**Document Version:** 2.0.0  
**Status:** Approved & Implemented  
**Date:** September 2026

---

## 1. Executive Summary & Vision

The **Emergency Home Services Auto-Dispatch System** (branded as **Argent Your**) is a full-stack, enterprise-grade emergency doorstep services marketplace and automated dispatch platform. It bridges the gap between traditional slow, manual phone coordination and modern on-demand logistics by uniting two core operational domains:

1. **Argent Your Consumer Marketplace:** A high-end, consumer-facing doorstep service platform for routine and scheduled home services (Plumbing, Electrical, HVAC, Home Cleaning, Appliance Repair, Painting, Salon & Spa).
2. **Autonomous Emergency Auto-Dispatch Engine:** A sub-minute algorithmic match and dispatch pipeline that pairs critical emergency requests (gas leaks, pipe bursts, electrical failures, urgent AC breakdowns) with nearby certified technicians using real-time GPS telemetry, Haversine routing, skill matching, and cascading reassignment.

The mission is to reduce average emergency service arrival times from the industry benchmark of **34+ minutes** down to **< 12.3 minutes** (a **64% reduction**), while providing complete live map transparency and zero fake demo data.

---

## 2. Problem Statement & Market Opportunity

| Traditional Emergency Dispatch Workflow                                                                                    | Argent Your Auto-Dispatch Platform                                                                                                          |
| :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Manual Phone Routing:** Dispatchers call technicians one by one, losing critical minutes during severe leaks or hazards. | **Instant Algorithmic Match:** Haversine distance, availability, and skill filters match the closest certified professional in < 2 seconds. |
| **Blind Waiting:** Customers receive vague "between 1 PM and 5 PM" arrival estimates with no vehicle tracking.             | **Live Real-Time Telemetry:** Continuous Leaflet GPS map tracking with dynamic ETA countdown and route polyline updates.                    |
| **Lost Incidents:** If a technician declines or doesn't answer, requests sit forgotten in a queue.                         | **Cascading Queue:** Automated 45-second acceptance timer that cascades to the next best candidate upon expiration or refusal.              |
| **Fragmented Records:** Paper receipts, disparate SMS threads, and untracked service history.                              | **Unified Digital Record:** Centralized Admin Control Room, automated GST invoices, persistent SQLite audit trails, and technician ratings. |

---

## 3. Target User Personas

### 3.1 Customer (Homeowner / Tenant)

- **Profile:** Needs immediate assistance for critical failures (e.g. flooded bathroom, sparking circuit breaker) or scheduled luxury home care.
- **Key Needs:** Instant booking confirmation, transparent upfront pricing, real-time map visibility of arriving technicians, verified credentials, direct call/SMS contact, and flexible payment.

### 3.2 Technician Pro (Field Specialist)

- **Profile:** Certified independent contractor or fleet technician specializing in Plumbing, Electrical, HVAC, Appliances, or Home Care.
- **Key Needs:** Simple mobile dashboard, audible emergency dispatch alerts with clear timers, turn-by-turn routing, job status progression buttons, earnings summary, and verified customer contact.

### 3.3 Operations Supervisor / Admin

- **Profile:** Operations manager overseeing citywide emergency response, fleet utilization, and customer satisfaction.
- **Key Needs:** Fullscreen citywide control room map, real-time response time metrics, manual override controls to force reassignments, workforce capacity monitoring, and auditable history.

---

## 4. Key Functional Requirements (FR)

### FR-1: Authentication, OTP & Role-Based Access Control

- **Dual Login Modes:** Supports credential login via Email or Phone number.
- **Verification Flow:** Dynamic 6-digit OTP delivery (with masked recipient, countdown cooldown timer, and resend support).
- **Role-Based Routing:** Secure JWT-based access partitioning for `customer`, `technician`, and `admin` roles.
- **1-Click Evaluation Switcher:** Demo quick-switch buttons for developer/evaluator convenience to test any role instantly.

### FR-2: Argent Your Consumer Marketplace & Catalog

- **Catalog Hierarchy:** Comprehensive catalog encompassing Home Cleaning, Salon & Spa (Women/Men), AC & Appliance Repair, Electrical, Plumbing, Carpentry, Painting, and Smart Home setups.
- **Smart Search & Synset Engine:** Debounced keyword search supporting synonym mapping (e.g. searching "cooling" surfaces "AC Foam Jet Repair").
- **Promotional Engine:** Banner carousel with valid-until countdowns, discount pill indicators, and one-click coupon copying (`ARGENT20`, `GLOW20`).

### FR-3: Cart, Checkout & Doorstep Scheduling

- **Action-Based Cart:** Add-to-cart functionality with real persistent storage (survives refreshes, logout/login, scoped to user ID).
- **Doorstep Scheduling:** Selection of preferred appointment date and time slots.
- **Service Address Management:** Multiple saved addresses with integrated OpenStreetMap reverse-geocoding via device GPS.
- **Multi-Method Payment:** Credit/Debit Cards, UPI IDs, Net Banking, and Cash on Delivery with transparent safety fee and tax breakdowns.

### FR-4: Real-Time Auto-Dispatch Engine

- **Proximity Calculation:** Algorithmic calculation of great-circle distance $d$ via Haversine formula:
  $$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
  $$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c$$
- **Candidate Scoring:** Filters for online, non-busy technicians matching service category and sorts by travel ETA.
- **Cascading Acceptance Timer:** Dispatched technician receives a high-priority modal with a 45-second countdown. Failure to accept automatically triggers cascading reassignment to the next closest candidate.
- **Admin Override:** Supervisors can manually force reassign any emergency request to any technician at any point.

### FR-5: Real-Time Live Tracking & Telemetry Hub

- **Interactive OpenStreetMap (Leaflet):** Live rendered map showing customer marker, technician vehicle icon, and connecting polyline route.
- **Dynamic ETA Countdown:** Recalculated live as technician coordinates stream across Socket.io WebSockets.
- **Lifecycle Stepper:** Six distinct stages:
  $$\text{Requested} \longrightarrow \text{Dispatched} \longrightarrow \text{Accepted} \longrightarrow \text{En Route} \longrightarrow \text{In Progress} \longrightarrow \text{Completed}$$
- **Direct Connect:** Quick action `tel:` link and pre-filled `sms:` message to assigned technicians.

### FR-6: Ratings, Reviews & Feedback Loop

- **Service Rating:** Post-service modal allowing 1 to 5 star rating with written feedback.
- **Fleet Scoring:** Backend recalculates technician average rating in real-time upon review submission and prevents duplicate submissions.

### FR-7: Admin Control Room & Workforce Management

- **Citywide Telemetry Map:** Live view of all online/offline/busy fleet units.
- **KPI Metrics:** Active emergencies, average response time, dispatch accuracy %, and fleet utilization rate.
- **Fleet Management:** Remote shift toggle, skill certification tags, performance history, and audit trail inspection.

---

## 5. Non-Functional Requirements (NFR)

- **NFR-1 (Latency):** WebSocket telemetry propagation under 150ms; dispatch algorithm execution under 500ms.
- **NFR-2 (Data Persistence):** 100% real persistent storage in SQLite (`dispatch.db`) and user-scoped `localStorage`. Zero mock item generation or random state mutation on browser reload.
- **NFR-3 (Mobile & Desktop Responsiveness):**
  - Desktop: Sleek floating glassmorphism navbar (66px, 1440px max-width, balanced spacing).
  - Mobile: Clean native-like bottom navigation with active-tab tap-to-reload and automatic header suppression on internal sub-pages.
- **NFR-4 (Security):** Passwords hashed via bcrypt; all API endpoints protected by JWT bearer authentication; parameterized SQL queries to prevent SQL injection.
- **NFR-5 (Availability & Graceful Degradation):** Automatic fallback to simulated GPS routing if browser geolocation or remote geocoding APIs fail.

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

1. **Mean Time to Dispatch (MTTD):** Target $< 5\text{ seconds}$ from customer checkout to technician alert.
2. **Mean Time to Arrival (MTTA):** Target $< 12.5\text{ minutes}$ across urban service radii.
3. **Dispatch Acceptance Rate:** Target $> 92\%$ first-pass acceptance without cascading expiration.
4. **Customer Satisfaction Score (CSAT):** Target $\ge 4.8 / 5.0$ average rating.
5. **Zero Data Loss Incident:** 0% phantom bookings or lost active jobs during page reloads.
