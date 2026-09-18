# Comprehensive iCal Calendar Sync Guide: Linking Lulu Aurelian Estate with Airbnb & Booking.com

This guide provides an end-to-end technical and operational reference for connecting **Lulu Aurelian Estate** with online travel agencies (OTAs)—specifically **Airbnb.com** and **Booking.com**—using **two-way iCalendar (iCal / RFC 5545) synchronization**.

---

## 1. How iCal Calendar Sync Works

The **iCalendar standard (`.ics`)** is the universal protocol for sharing calendar events and reservation dates across hospitality platforms.

When two platforms are linked via iCal:
1. **Outbound Sync (Export)**: Lulu Aurelian provides a live URL endpoint for each suite (`/api/ical/export/:unitId`). When Airbnb or Booking.com checks this URL, it sees all dates that are currently **PAID**, **CONFIRMED**, or **BLOCKED** on your direct website, and blocks those dates on the OTA so no one can book them there.
2. **Inbound Sync (Import)**: Airbnb and Booking.com each provide an export `.ics` link for your listing. Lulu Aurelian periodically downloads this feed and creates calendar blocks on your website so direct website visitors cannot book dates already reserved on Airbnb or Booking.com.

```
┌───────────────────────────────┐
│     Lulu Aurelian Website     │
│   (Direct Guests, M-Pesa)     │
└──────────────┬────────────────┘
               │
      [1] Outbound iCal (.ics)
   "Export Link from Lulu Aurelian"
               │
               ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│          Airbnb.com           │        │          Booking.com          │
│   (Pulls feed every ~2 hrs)   │        │   (Pulls feed every ~2 hrs)   │
└──────────────┬────────────────┘        └──────────────┬────────────────┘
               │                                        │
      [2] Inbound iCal (.ics)                  [2] Inbound iCal (.ics)
  "Airbnb Export -> Lulu Aurelian"        "Booking.com Export -> Lulu Aurelian"
               │                                        │
               └───────────────────┬────────────────────┘
                                   │
                                   ▼
               ┌───────────────────────────────────────┐
               │    Lulu Aurelian Manager Portal       │
               │   (Auto-Blocks & Crosses Out Dates)   │
               └───────────────────────────────────────┘
```

---

## 2. Lulu Aurelian Suite Export URLs

Your server serves dedicated, live iCal feeds for each suite:

| Suite Name | Unit ID | Live iCal Feed Export URL |
|------------|---------|---------------------------|
| **Skyview Executive Suite** | `skyview` | `https://www.luluaurelian.co.ke/api/ical/export/skyview` |
| **Cocoa Luxury Suite** | `cocoa` | `https://www.luluaurelian.co.ke/api/ical/export/cocoa` |
| **Neema Royal Suite** | `neema` | `https://www.luluaurelian.co.ke/api/ical/export/neema` |

*(When testing locally on localhost, the URL is `http://localhost:5000/api/ical/export/skyview`)*

---

## 3. Step-by-Step Guide for Airbnb.com

### Part A: Export Lulu Aurelian Calendar into Airbnb (Block direct bookings on Airbnb)

1. Log in to your **[Airbnb Host Dashboard](https://www.airbnb.com/hosting)**.
2. Navigate to **Listings** and select your listing (e.g., Skyview Penthouse).
3. Go to **Pricing and availability** in the left sidebar menu.
4. Scroll down to the **Calendar sync** section.
5. Click **Import calendar**.
6. In the pop-up modal:
   - **Calendar address (URL)**: Paste your Lulu Aurelian suite URL:
     ```
     https://www.luluaurelian.co.ke/api/ical/export/skyview
     ```
   - **Name your calendar**: Enter `Lulu Aurelian Direct - Skyview`.
7. Click **Import calendar**.
8. Airbnb will now automatically fetch this URL every 2–3 hours. Whenever a direct guest pays on your site, those dates will automatically show as unavailable on Airbnb.

---

### Part B: Import Airbnb Calendar into Lulu Aurelian (Block Airbnb bookings on direct site)

1. In your **Airbnb Listing** under **Pricing and availability** ➔ **Calendar sync**.
2. Click **Export calendar**.
3. Airbnb will display a unique link looking like:
   ```
   https://www.airbnb.com/calendar/ical/12345678.ics?s=abcdef1234567890
   ```
4. Copy this Airbnb link.
5. Log in to your **Lulu Aurelian Manager Portal** (`/manager` or Portal Dashboard).
6. Go to the **Calendar & iCal** tab and select the corresponding suite (e.g. Skyview).
7. Under **Sync External Calendar**, paste the Airbnb URL into the input field and click **Sync Now**.
8. All reservations existing on Airbnb will immediately be imported and **crossed out** on your direct booking calendar.

---

## 4. Step-by-Step Guide for Booking.com

### Part A: Export Lulu Aurelian Calendar into Booking.com

1. Log in to the **[Booking.com Extranet](https://admin.booking.com)**.
2. Click on the **Rates & Availability** tab (or **Calendar & Pricing**).
3. Select **Sync calendars**.
4. Click **Add calendar connection**.
5. Paste your Lulu Aurelian suite URL:
   ```
   https://www.luluaurelian.co.ke/api/ical/export/skyview
   ```
6. Give the connection a name: `Lulu Aurelian Direct - Skyview`.
7. Click **Next step**. Booking.com verifies the URL and links it to the matching room.

---

### Part B: Import Booking.com Calendar into Lulu Aurelian

1. In the same **Sync calendars** screen on Booking.com:
2. Copy the Booking.com iCal export link. It will look like:
   ```
   https://ical.booking.com/v1/export?t=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
3. Open the **Lulu Aurelian Manager Portal** ➔ **Calendar & iCal** tab.
4. Select the suite, paste the Booking.com URL into the sync input, and click **Sync Now**.
5. Dates booked on Booking.com are locked and crossed out on your website.

---

## 5. Critical Technical Rules & Sync Realities

### 1. Polling Latency vs Real-Time Webhooks
- **Airbnb and Booking.com poll external iCal URLs every 2 to 3 hours**. They do **not** support instant Webhook push notifications via basic iCal.
- **Immediate manual refresh**: If you just received a high-value direct booking and want to immediately block Airbnb without waiting 2 hours:
  - Go to Airbnb ➔ Calendar sync ➔ click **Refresh** next to the imported calendar. Airbnb will fetch the updated `.ics` file instantly.
- **Double-Booking Buffer**: Our direct booking engine holds dates in `PENDING` status for 60 minutes while the guest completes payment, preventing two direct guests from conflicting.

### 2. Check-In / Check-Out Overlap Rules (`DTEND` Exclusivity)
- According to **RFC 5545 (iCalendar specification)**, the `DTEND` property for whole-day events is **exclusive**.
- Example: If a guest stays from **July 4 to July 9**:
  - `DTSTART;VALUE=DATE:20260704`
  - `DTEND;VALUE=DATE:20260709`
  - This means nights of July 4, 5, 6, 7, and 8 are blocked.
  - July 9 is checkout day—meaning a new incoming guest **can** check in on July 9!
  - Both our backend availability engine and Airbnb/Booking.com adhere strictly to this rule.

### 3. Guest Privacy Compliance (GDPR & Kenya Data Protection Act 2019)
- Because iCal URLs are publicly reachable endpoints, **never expose guest personal identities, phone numbers, or emails** in the public iCal feed.
- Our export feed formats events securely:
  ```
  BEGIN:VEVENT
  UID:331b2890-88af-45e0-94cb-9c17754b2bb0@luluaurelian.co.ke
  DTSTAMP:20260918T000000Z
  DTSTART;VALUE=DATE:20260625
  DTEND;VALUE=DATE:20260627
  SUMMARY:Reserved - Lulu Aurelian Estate
  STATUS:CONFIRMED
  X-MICROSOFT-CDO-BUSYSTATUS:BUSY
  END:VEVENT
  ```

---

## 6. How Calendars are Crossed Out Once Payment is Done

1. **Payment Verification**:
   - As soon as a guest completes M-Pesa STK Push (PayHero / Till), Stanbic, or Card payment, the callback webhook triggers:
     - `db.payments.updateStatus(ref, 'COMPLETED')`
     - `db.bookings.updateStatus(booking_id, 'PAID')`
2. **Immediate Availability Feed Update**:
   - The endpoint `/api/bookings/blocked-dates/:unitId` immediately marks these dates with `status: 'PAID'` and `isPaid: true`.
3. **Visual UI Crossing Out**:
   - **Guest Booking Modal (`CustomCalendarModal`)**:
     - The dates are assigned the `.day-cell.booked` class.
     - Dual diagonal cross lines (an X) render boldly across the date cell in terracotta/brand red.
     - Clicking on the date is completely disabled (`pointer-events: none` for selection).
     - Hovering over the date displays a "Reserved / Paid" tooltip.
   - **Manager Calendar (`UnitCalendarCard`)**:
     - The cell is rendered with `.blocked-crossed` and `<span className="red-cross-line" />`.
     - Displays the guest name, payment confirmation, and dates in the reservation holds list.
