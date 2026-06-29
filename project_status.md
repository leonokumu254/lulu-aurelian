# Project Status: Lulu Aurelian Estate

> **Last Updated:** June 25, 2026  
> **Architecture:** React 19 (Vite 8) frontend + Node.js/Express backend + MySQL database  
> **Overall Status:** Core integration complete — ready for production hardening

---

## 1. What Has Been Done (Completed)

### Frontend — Public Website
- **Scaffolding & Architecture:** React SPA built with Vite, hash-based routing (`#/`, `#/booking`, `#/portal`).
- **Asset Generation:** Custom premium visuals for Skyview Penthouse, Cocoa Retreat, and lobby backgrounds.
- **Routing System:** Deep-linkable routes syncing check-in/out dates and suite selection between Home and Booking views.
- **Interactive Components (17 components, all modular CSS):**
  - `Header` — Responsive sticky nav with mobile hamburger menu.
  - `Hero` — Cross-fading background carousel with availability search bar.
  - `About` — Estate information section.
  - `Listings` — Suite cards grid (Skyview, Cocoa) with "Book Now" triggers.
  - `WhyChooseUs` — Feature highlights grid.
  - `Newsletter` — Email subscription form → **connected to `POST /api/newsletters/subscribe`**.
  - `Footer` — Contact info, navigation links, and social SVGs.
  - `WhatsAppIcon` — Pulsing floating chat bubble.
  - `BookingForm` — Multi-step form: suite selector, Airbnb-style calendar, guest counter, phone with country code picker, personal info.
  - `BookingSummary` — Live pricing calculator → **connected to `POST /api/bookings/request`** (saves to MySQL).
  - `CustomCalendarModal` — Airbnb-style double-month date range picker.
  - `SuccessModal` — Post-booking confirmation dialog showing server-returned booking ID.
  - `SuiteGalleryModal` — Full-screen photo gallery with categories and lightbox.
  - `GuestAuthModal` — Allow clients to login, register, or proceed as guest. Integrated with `POST /api/auth/register` and `/api/auth/login`. Auto-fills booking form details.
  - `Reviews` — Connected to `GET /api/reviews` to dynamically fetch and display published guest reviews with average rating calculations.
  - `OffersSection` — Automated infinite horizontal marquee showcasing active promotional packages (`OffersData.js`). Hardware-accelerated and strictly contained to prevent iOS Safari horizontal overflow bugs.
  - `OffersPage` — Dedicated subpage displaying all available packages in a responsive CSS grid (`#/offers`).

### Frontend — Staff Portal
- `StaffLogin` — Login form → **connected to `POST /api/auth/login`** (JWT stored in localStorage).
- `PortalDashboard` — Container with JWT session auto-check on mount via `GET /api/auth/me`. Handles mode switching (Agent Desk / Manager Hub) and logout (clears JWT).
- `AgentPortal` — Booking triage dashboard → **connected to `GET /api/bookings`**, approve via `PUT /api/bookings/:id/approve`, decline via `PUT /api/bookings/:id/decline`. Auto-refreshes every 30s. Live 24h TTL countdown from real `approved_at` timestamps. WhatsApp dispatch modal with editable templates.
- `ManagerPortal` — Admin panel with 3 tabs:
  - *Pricing Engine* — Suite rate editor with multiplier sliders (client-side only).
  - *Content Studio* — Blog posts and community posts editor (client-side only).
  - *Team & Reviews* — Team list fetched from `GET /api/users`. Reviews fetched from `GET /api/reviews`. Approve via `PUT /api/reviews/:id/moderate`, delete via `DELETE /api/reviews/:id`. Manager name rendered dynamically from `GET /api/auth/me`.

### Backend — Express API Server
- **Configuration:** `server/.env` with discrete DB variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), JWT_SECRET, and PORT.
- **Database Layer:** `server/config/db.js` — Repository pattern with MySQL (via `mysql2` connection pool) and in-memory fallback. Exposes `db.users`, `db.bookings`, `db.reviews`, `db.newsletters`.
- **Authentication:** JWT-based login + session verification. `authMiddleware` validates Bearer tokens. `requireRole()` enforces RBAC (MANAGER / AGENT).
- **API Routes:**
  - `POST /api/auth/login` — Credential validation, JWT issuance.
  - `POST /api/auth/register` — Guest account creation.
  - `GET /api/auth/me` — Current user profile (protected).
  - `POST /api/bookings/request` — Public guest booking submission.
  - `GET /api/bookings` — Staff booking list (protected).
  - `PUT /api/bookings/:id/approve` — Approve + start 24h payment window (protected).
  - `PUT /api/bookings/:id/decline` — Decline booking (protected).
  - `GET /api/bookings/status` — Guest status check via secure_token (public).
  - `POST /api/bookings/webhook/mpesa` — M-Pesa payment callback (stub).
  - `GET /api/reviews` — Published reviews (public).
  - `POST /api/reviews/submit` — Guest review submission.
  - `PUT /api/reviews/:id/moderate` — Publish/retract review (protected, MANAGER/AGENT).
  - `DELETE /api/reviews/:id` — Delete review (protected, MANAGER only).
  - `POST /api/newsletters/subscribe` — Newsletter opt-in (public).
  - `POST /api/newsletters/unsubscribe` — Newsletter opt-out (public).
  - `GET /api/users` — Staff list (protected).
- **Services:**
  - `cronService.js` — Hourly expired-booking scanner + daily lifecycle messaging hooks (check-in follow-ups, checkout review requests, holiday marketing campaigns).
  - `emailService.js` — Email templates for booking confirmations, fulfillment credentials, comfort check-ins, review requests, newsletter welcome, holiday marketing (**stub — console.log only**).
  - `whatsappService.js` — WhatsApp messaging for booking alerts and lifecycle pings (**stub — console.log only**).
- **Middleware:** Global error handler + 404 wildcard handler.
- **Database Schema:** `schema.sql` with 4 tables: `users`, `bookings`, `reviews`, `newsletters`.
- **Seeder:** `seed.js` inserts default Manager (`chrisine@gmail.com` / `manager`) and Agent (`caroline@gmail.com` / `agent`) accounts with correct `MANAGER`/`AGENT` roles.

### Dev Environment
- **Vite Proxy:** `vite.config.js` proxies `/api` requests to `localhost:5000`.
- **Build:** Project builds with zero compiler/bundler errors.

---

## 2. Active Tasks (In Progress)

*None. All integration tasks are completed.*

---

## 3. What Needs To Be Done (Pending Tasks)

### Priority 1 — Production Hardening 🔴
| # | Task | Files Affected |
|---|------|---------------|
| 1 | **Replace JWT_SECRET** with a cryptographically strong secret (min 256-bit). Current value is weak. | `server/.env` |
| 2 | **Lock down CORS** — Change `origin: '*'` to only allow the production frontend domain. | `server/index.js` |
| 3 | **Set `NODE_ENV=production`** in the production environment. | `server/.env` |
| 4 | ~~**Add rate limiting** (`express-rate-limit`) on public endpoints to prevent abuse.~~ *(Completed)* | `server/index.js` |
| 5 | **HTTPS** — Configure via reverse proxy (Nginx/Caddy) or hosting provider. | Infrastructure |
| 6 | **Process manager** — Use PM2 or systemd to keep the backend running with auto-restart. | Infrastructure |
| 7 | **Build frontend for production** — `npm run build` and serve `dist/` via web server. | Terminal |

### Priority 2 — Real Service Integration 🟡
| # | Task | Files Affected |
|---|------|---------------|
| 8 | **Real Email Service** — Replace `console.log` stubs in `emailService.js` with Nodemailer + SMTP (Gmail, SendGrid, or Resend). Add `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` to `.env`. | `server/services/emailService.js`, `server/.env` |
| 9 | **Real WhatsApp Service** — Replace `console.log` stubs with WhatsApp Business API (Meta) or Twilio. Add API credentials to `.env`. | `server/services/whatsappService.js`, `server/.env` |
| 10 | **M-Pesa Daraja Integration** — Replace the mock webhook with real STK Push for Kenyan mobile payments. | `server/controllers/bookingController.js`, `server/.env` |
| 11 | **Replace `localhost:5173` URLs** in email/cron templates with the production domain. | `server/services/emailService.js`, `server/services/cronService.js` |

### Priority 3 — Feature Gaps 🟢
| # | Task | Files Affected |
|---|------|---------------|
| 12 | ~~**Persist Pricing Engine**~~ *(Completed - Now uses MySQL via /api/bookings/unit-settings)* | `server/controllers/`, `schema.sql`, `ManagerPortal.jsx` |
| 13 | ~~**Persist CMS Content**~~ *(Completed - Backend DB persistence added to schema.sql and db.js)* | `server/controllers/`, `schema.sql`, `ManagerPortal.jsx` |
| 14 | **Calendar iCal Sync** — Connect suite calendars with Airbnb/iCal feeds to block unavailable dates dynamically. | `BookingForm.jsx`, new backend service |
| 15 | **Guest Review Page** — Build a standalone public review submission page linked from checkout emails. | New component, `App.jsx` routing |
| 16 | **User Registration/Invitation Flow** — Allow managers to create new staff accounts from the portal. | `server/routes/usersRoutes.js`, `ManagerPortal.jsx` |
| 17 | **Avatar Upload** — Add file upload for staff avatars + `avatar` column in `users` table. | `schema.sql`, `server/controllers/`, `ManagerPortal.jsx` |
| 18 | **Suite Inventory Expansion** — Design pages for upcoming Glasshouse and Cliffside suites. | New components |
| 19 | **Unit Tests** — Implement Vitest tests for pricing calculator logic and API endpoints. | New test files |
| 20 | ~~**Offer Integration**~~ *(Completed - Auto-calculates highest savings from OffersData in BookingSummary)* | `BookingSummary.jsx`, backend pricing engine |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 FRONTEND (Vite)                  │
│              http://localhost:5174                │
│                                                   │
│  Public:  Home → Booking → Success               │
│  Staff:   Login → PortalDashboard                │
│              ├── AgentPortal (booking triage)     │
│              └── ManagerPortal (admin panel)      │
│                                                   │
│  API calls via /api/* proxy ──────────────────┐  │
└───────────────────────────────────────────────┼──┘
                                                │
┌───────────────────────────────────────────────┼──┐
│                BACKEND (Express)              │  │
│              http://localhost:5000             ▼  │
│                                                   │
│  Routes: /api/auth, /api/bookings,               │
│          /api/reviews, /api/newsletters,          │
│          /api/users                               │
│                                                   │
│  Services: CronService, EmailService (stub),     │
│            WhatsAppService (stub)                 │
│                                                   │
│  Auth: JWT + RBAC (MANAGER / AGENT)              │
│                                                   │
│  DB Layer ────────────────────────────────────┐  │
└───────────────────────────────────────────────┼──┘
                                                │
┌───────────────────────────────────────────────┼──┐
│                  MySQL (WAMP)                 ▼  │
│                                                   │
│  Tables: users, bookings, reviews, newsletters   │
│  Fallback: In-memory store (dev only)            │
└───────────────────────────────────────────────────┘
```

---

## 5. Staff Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Manager | `chrisine@gmail.com` | `manager` |
| Agent | `caroline@gmail.com` | `agent` |

---

## 6. Strategic Expansion Plan: PWA & Redis Implementation

### Progressive Web App (PWA) Integration
**Impact on the Website:**
* **App-like Experience:** Users can install the website directly onto their mobile home screens without visiting an App Store. 
* **Offline Capabilities:** Service workers will cache the core application shell (HTML, CSS, JS), allowing the app to load instantly even on poor networks.
* **Asset Caching:** Heavy assets like the high-res suite images and typography will be served from the local browser cache on repeat visits, drastically improving load times.

**Implementation Steps:**
1. **Install Plugin:** Add `vite-plugin-pwa` to the frontend.
2. **Configure Manifest:** Create a `manifest.json` defining the app name (Lulu Aurelian), theme colors, and high-res app icons for Android and iOS.
3. **Service Worker:** Configure the service worker in `vite.config.js` to use `GenerateSW` with specific caching strategies (e.g., `CacheFirst` for images/fonts, `NetworkFirst` for HTML).
4. **Install Prompt:** Add a UI prompt (e.g., a banner) inviting mobile users to "Install App".

### Redis In-Memory Caching (Backend)
**Impact on the Website:**
* **Lightning-Fast APIs:** Frequently requested data (like public reviews, offers, and suite availability) will bypass the MySQL database entirely and be served from RAM, cutting response times from ~100ms to <5ms.
* **Database Offloading:** Prevents the MySQL database from bottlenecking during high-traffic surges (e.g., after a marketing email blast).

**Implementation Steps:**
1. **Infrastructure:** Install and run a Redis server (locally via Docker or via a managed service like Upstash/AWS ElastiCache).
2. **Node Integration:** Install `redis` or `ioredis` npm packages in the Express backend.
3. **Cache Middleware:** Create a `cacheMiddleware.js` that intercepts GET requests (like `GET /api/reviews`). If data exists in Redis, serve it immediately. If not, fetch from MySQL, save to Redis with a Time-To-Live (TTL), and return it.
4. **Invalidation Strategy:** Update existing write endpoints (e.g., `PUT /api/reviews/:id/moderate`) to flush or update the corresponding Redis keys so users never see stale data.
