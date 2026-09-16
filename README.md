# 🌿 KabadCollect — Hyperlocal Recycling Marketplace

> **"Swiggy for Kabad"** — Doorstep scrap pickup & circular economy marketplace platform.

---

## 🚀 Quick Start (Website)

To launch the web application locally:

```bash
# From root directory:
npm run dev

# Or directly from the web package:
cd kabadconnect-web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 What's Implemented in Website Platform

1. **Top Bar & Hyperlocal Locality Selector**:
   - Location switch for Delhi NCR, Indirapuram, Noida, Gurugram, South Delhi, Mumbai, Bengaluru.
2. **Infinite Live Scrap Market Rate Marquee Ticker**:
   - Live daily benchmark rates with green/red trend indicators (Copper, Iron, Newspaper, PET bottles, Inverter battery, AC scrap).
3. **Hero Section with Pincode Availability Checker**:
   - Instant feedback on active verified kabadwalas in user's locality + next pickup availability in 45-60 minutes.
4. **Live Scrap Rate Card Catalog**:
   - Filter by categories (Paper, Plastics, Metals, E-Waste & Appliances, Vehicles & Batteries).
   - Real-time search by scrap item name or Hindi term (Akhbaar, Loha, Peetal, etc.).
   - Direct "Add to Pickup" action.
5. **Interactive Scrap Value & Ecological Savings Calculator**:
   - Weight sliders for Paper, Plastics, Metals, and E-Waste.
   - Calculates **Estimated Payout (₹)** + **Trees Saved 🌳** + **Water Conserved 💧 (L)** + **CO₂ Emissions Diverted 💨 (kg)**.
   - "Book Pickup for this Scrap" pre-loads the booking wizard.
6. **4-Step Doorstep Pickup Booking Engine (`BookingWizardModal`)**:
   - Step 1: Select scrap categories & weight brackets (<20kg, 20-50kg, 50-100kg, 100kg+).
   - Step 2: Doorstep address, landmark, pincode, floor & elevator toggle.
   - Step 3: Date & slot selection (Today Express in 2 hrs, Tomorrow morning/afternoon, Weekend).
   - Step 4: Instant booking confirmation (`KC-XXXX`), nearest partner match, and celebratory confetti.
7. **Live Order Tracker & Lifecycle Simulator (`LiveOrderTrackerModal`)**:
   - Real-time stepper: Placed ➔ Assigned ➔ En Route ➔ Digital Weighing ➔ Completed.
   - Interactive simulation controls to test advancing through all stages.
   - Itemized digital weighing scale receipt breakdown.
   - Official Green Environmental Contribution Certificate generator.
8. **Verified Hyperlocal Kabadwala Directory**:
   - Filter by 4.9+ star ratings and certified digital scales.
   - Partner profile cards, vehicle types, coverage areas, and direct pickup requests.
9. **Upcycled & Recycled Goods Store Showcase**:
   - Circular economy handcrafted items made from scrap (Eco Kraft journals, upcycled tyre ottomans, metal geometric lamps, ocean plastic backpacks).
   - Interactive Cart Drawer with quantity controls, free shipping threshold indicator, and checkout simulation.
10. **Kabadwala Partner Onboarding Portal**:
    - Monthly income estimator slider (₹35,000 - ₹65,000/month).
    - Quick onboarding registration form.
