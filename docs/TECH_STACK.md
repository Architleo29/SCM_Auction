# 🛠️ Tech Stack & Architecture Guide: SCM Vendor Bidding & Auction Simulator

Welcome! This document provides a complete, easy-to-understand breakdown of all the technologies, frameworks, libraries, and architectural decisions used in the **SCM Vendor Bidding & Auction Simulator** project.

---

## 🎯 1. Project Overview

The **SCM Vendor Bidding & Auction Simulator** is an interactive, multi-round business strategy game and educational simulation. Players manage vendor companies competing for corporate procurement contracts through two core auction formats (**Reverse English** and **Forward English** auctions).

The game simulates real-world supply chain dynamics:
- **11-variable industrial cost estimation** (raw materials, labor, tooling, logistics, ESG compliance, risk contingencies).
- **Multi-Criteria Buyer Evaluation (QCBS)** balancing price, technical quality, timeline, and risk.
- **Dynamic market shocks** (supply disruptions, port strikes, material inflation).
- **AI Competitor Bots** with distinct bidding personalities.
- **Real-Time Multiplayer** allowing multiple players to bid against each other live.

---

## 🧱 2. Core Frontend Stack

```
   ┌──────────────────────────────────────────────────────────┐
   │                    User Interface (UI)                   │
   │           React 18 + Tailwind CSS + Lucide Icons         │
   └─────────────────────────────┬────────────────────────────┘
                                 │
   ┌─────────────────────────────▼────────────────────────────┐
   │                    Application Logic                     │
   │               TypeScript 5.7 + React Hooks               │
   └─────────────────────────────┬────────────────────────────┘
                                 │
   ┌─────────────────────────────▼────────────────────────────┐
   │                 Simulation & Math Engines                │
   │  Cost Calc • QCBS Scoring • AI Bots • PnL & Settlement   │
   └─────────────────────────────┬────────────────────────────┘
                                 │
   ┌─────────────────────────────▼────────────────────────────┐
   │             4-Tier Real-Time Sync Architecture           │
   │   PeerJS (WebRTC) • Supabase • SSE Middleware • Local    │
   └──────────────────────────────────────────────────────────┘
```

### ⚛️ React 18
* **What it is:** The world's most popular open-source JavaScript library for building dynamic user interfaces using reusable components.
* **Why we used it:**
  * **Component-Based Modularity:** Complex screens (Lobby, Quote Builder, Auction Arena, P&L Breakdown, Leaderboard) are broken into isolated, testable pieces.
  * **Fast State Reactivity:** When auction prices tick down every 3 seconds or players submit bids in real time, React's Virtual DOM efficiently re-renders only the changed numbers without lagging the screen.
  * **Ecosystem & Community:** Massive ecosystem of ready-to-use tools, hooks, and extensions.

---

### 🟦 TypeScript 5.7
* **What it is:** A strongly-typed superset of JavaScript that adds static types, interfaces, and compile-time error checking.
* **Why we used it:**
  * **Zero Math & Financial Bugs:** The simulation deals with heavy economic formulas, currency conversions (INR), pricing tiers, and penalty multipliers. TypeScript guarantees that numbers are never accidentally treated as strings or `undefined`.
  * **Strict Data Contracts:** Complex data structures like `RFQ`, `Quote`, `PlayerState`, `DynamicEventCard`, and `BuyerEvaluationResult` are strictly defined. If an event or prop is missing, the code fails at build time, not during a live multiplayer game.
  * **Developer Experience:** Provides instant autocomplete, intelligent refactoring, and clear documentation directly in the code editor.

---

### ⚡ Vite 6
* **What it is:** A modern, next-generation frontend build tool and development server powered by native ES modules and Rollup/esbuild.
* **Why we used it:**
  * **Instant Server Startup & Fast HMR:** Vite starts development servers in milliseconds and applies UI changes instantly (Hot Module Replacement) without reloading the page or losing current game state.
  * **Optimized Production Bundling:** Minifies JavaScript and CSS, performs tree-shaking (removing unused code), and splits code into efficient chunks for lightning-fast initial page loads.

---

## 🎨 3. Styling, Design System & UI/UX

### 🌊 Tailwind CSS v3.4 + PostCSS + Autoprefixer
* **What it is:** A utility-first CSS framework that lets you style elements directly inside HTML/JSX using composable classes (e.g., `flex`, `bg-slate-900`, `text-emerald-400`, `rounded-xl`).
* **Why we used it:**
  * **Speed & Consistency:** No need to write separate `.css` files or invent arbitrary class names. Spacing, typography, and color scales remain 100% consistent across all 19+ screens and modals.
  * **Zero CSS Bloat:** Tailwind scans files and purges all unused CSS in production, keeping the final stylesheet tiny (~15–20 KB).
  * **Responsive Design:** Easy utility prefixes (`sm:`, `md:`, `lg:`, `xl:`) ensure the game looks great on smartphones, tablets, laptops, and large external monitors.

---

### 🌓 Custom Dual-Theme Architecture (Dark & Light)
* **What it is:** A hand-crafted theme system with persistent theme toggling:
  * **Dark Mode ("Tactical Command Navy"):** Deep space slate backdrop (`#090D16`), high-contrast cyan/emerald highlights, optimized for high-focus trading environments and OLED screens.
  * **Light Mode ("Executive High-Contrast Slate"):** Crisp paper-white surface (`#FFFFFF`), slate grays, and deep royal indigo, ideal for well-lit classrooms and corporate boardrooms.
* **Why we used it:**
  * Built using a custom React `ThemeProvider` context and CSS class switching (`.dark` on `document.documentElement`).
  * Persists user choice in browser `localStorage` across page reloads.

---

### 🔣 Lucide React Icons
* **What it is:** A clean, consistent, and customizable open-source icon library for React.
* **Why we used it:**
  * Provides crisp, modern icons for supply chain concepts (e.g., `Gavel`, `TrendingUp`, `ShieldCheck`, `AlertTriangle`, `Users`, `Factory`, `Coins`).
  * Tree-shakeable: Only the specific icons used are included in the final bundle.

---

### 🧩 `clsx` & `tailwind-merge`
* **What it is:** Helper utilities for dynamically composing and resolving CSS class names.
* **Why we used it:**
  * Allows conditional styling (e.g., turning a button green when in profit or red when at risk of the winner's curse) without accidental Tailwind class conflicts (e.g., `p-4` vs `p-2`).

---

## 🌐 4. Real-Time Multiplayer Architecture (4-Tier Resilient System)

One of the biggest technical achievements of this project is that it supports **live real-time multiplayer without requiring an expensive or complex custom backend server to be constantly running.**

It achieves this through a **4-tier networking fallback matrix**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Tier 1: WebRTC Direct P2P                         │
 │        PeerJS + Public STUN Servers (Google & Twilio)                  │
 │        • Sub-millisecond latency • Free • Direct browser-to-browser    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ (Fallback if P2P blocked by firewall)
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                      Tier 2: Supabase Realtime                         │
 │        WebSockets (Broadcast & Presence Channels)                      │
 │        • Cloud-based room relay • Optional user Supabase keys          │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ (Fallback for local dev & LAN)
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                  Tier 3: Local Dev Server Sync (SSE)                   │
 │        Vite Plugin Middleware (`/api/sync/events`)                     │
 │        • Server-Sent Events • Works across devices on same Wi-Fi       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ (Fallback for single-device multi-tab)
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                  Tier 4: Browser BroadcastChannel API                  │
 │        Cross-Tab IPC + LocalStorage Storage Events                     │
 │        • Instant testing in multiple browser tabs simultaneously       │
 └────────────────────────────────────────────────────────────────────────┘
```

### 1. PeerJS (`peerjs`) — WebRTC Peer-to-Peer
* **Role:** Primary multiplayer transport.
* **How it works:** The Host player acts as the room server. Other players connect directly to the Host's browser using WebRTC DataChannels and public STUN servers (`stun.l.google.com`).
* **Why:** Delivers ultra-low latency bidding interactions with **zero server costs**.

### 2. Supabase Realtime (`@supabase/supabase-js`) — Cloud Broadcast
* **Role:** Cloud multiplayer transport.
* **How it works:** Uses Supabase's managed WebSocket Broadcast and Presence channels (`channel('room:CODE')`).
* **Why:** If school or corporate firewalls block WebRTC P2P connections, players can plug in a free Supabase URL/Key to play seamlessly over global cloud WebSockets.

### 3. Vite Local SSE Plugin (`vite.config.ts`) — Local Network Dev Sync
* **Role:** Local development and classroom LAN testing.
* **How it works:** A custom Vite middleware intercepts `/api/sync/events` and streams game events over HTTP Server-Sent Events (SSE).
* **Why:** Allows effortless testing across laptops and phones connected to the same Wi-Fi during local development without setting up external accounts.

### 4. `BroadcastChannel` & `localStorage` Events — Zero-Latency Cross-Tab IPC
* **Role:** Instant local multi-player testing.
* **How it works:** Modern browser native `BroadcastChannel` and `StorageEvent` listeners pass events between multiple open tabs instantly.
* **Why:** Allows developers and game masters to open 4 tabs on one monitor and test a 4-player game without any network traffic.

---

## 🧠 5. Simulation & Economic Calculation Engines

All game mechanics and financial math run in **pure, deterministic, client-side TypeScript modules** with zero external dependencies:

| Engine File | Purpose & Real-World Concept |
|---|---|
| [`costCalculator.ts`](file:///d:/SCM%20Auction/src/engine/costCalculator.ts) | **11-Variable Cost Estimation:** Computes Floor Level Cost (FLC), Direct Material, Direct Labor, Tooling Amortization, Logistics, SLA multipliers, and Risk Contingency buffers. |
| [`buyerScoring.ts`](file:///d:/SCM%20Auction/src/engine/buyerScoring.ts) | **Multi-Criteria QCBS (Quality & Cost Based Selection):** Evaluates vendor quotes using weighted multi-attribute utility theory (Price 40–60%, Quality 20–30%, Timeline 10–20%, Compliance pass/fail gates). |
| [`aiBots.ts`](file:///d:/SCM%20Auction/src/engine/aiBots.ts) | **Autonomous Competitor Bots:** Simulates 4 AI bidding strategies (*Aggressive* price cutters, *Conservative* margin protectors, *Opportunist* snipers, *Copycat* market followers). |
| [`pnlEngine.ts`](file:///d:/SCM%20Auction/src/engine/pnlEngine.ts) | **Financial P&L & Settlement:** Calculates contract delivery costs, dynamic shock penalties, liquidated damages for late delivery, vendor reputation index adjustments, and career XP. |
| [`forwardAuction.ts`](file:///d:/SCM%20Auction/src/engine/forwardAuction.ts) | **Forward English Multi-Item Auction:** Simulates multi-lot surplus asset sales, private vs. common item valuations, and purse budget constraints. |

---

## 🎉 6. Gamification, Audio & Visual Feedback

### 🎊 `canvas-confetti`
* **What it is:** A lightweight, high-performance HTML5 canvas confetti particle animation library.
* **Why we used it:** Fires celebratory confetti bursts when a vendor wins a contract, reaches a high profit margin, or climbs a career rank (e.g., reaching *Chief Commercial Tycoon*).

### 🔊 Procedural Web Audio API Sound Engine (`src/utils/soundEffects.ts`)
* **What it is:** Custom sound synthesizer built using the browser's native `AudioContext` and oscillator nodes.
* **Why we used it:**
  * **Zero Asset Overhead:** No need to download heavy `.mp3` or `.wav` sound files.
  * Generates clean audio cues (countdown ticks, auction start chimes, winning fanfares, warning alerts, and bid placement clicks) on-the-fly with zero latency.

---

## 🚀 7. Build, Deployment & Infrastructure

* **Vercel (`vercel.json`):** Configured with single-page application (SPA) client-side rewrite rules (`/(.*) -> /index.html`) and aggressive immutable caching headers for static assets (`/assets/*`).
* **Node.js & npm:** Used for dependency resolution and script automation.
* **Git:** Version control with structured planning and design specifications.

---

## 📊 Summary: Tech Stack at a Glance

| Category | Technology | Primary Role | Why We Chose It |
|---|---|---|---|
| **Framework** | **React 18** | UI & State Engine | Modular components, fast virtual DOM diffing for rapid auctions. |
| **Language** | **TypeScript 5.7** | Type Safety & Logic | Prevents runtime math errors and guarantees strict multiplayer contracts. |
| **Build Tool** | **Vite 6** | Bundler & Dev Server | Millisecond hot reloads and optimized production bundle. |
| **Styling** | **Tailwind CSS 3.4** | Design & Layout | Rapid, consistent utility classes with zero runtime CSS overhead. |
| **Icons** | **Lucide React** | Visual Symbols | Modern, lightweight, customizable SVG icon set. |
| **P2P Multiplayer** | **PeerJS (WebRTC)** | Live Game Sync | Direct browser-to-browser P2P networking with 0 server costs. |
| **Cloud Sync** | **Supabase Realtime** | Cloud WebSockets | Managed WebSocket fallback for firewalled networks. |
| **Local Sync** | **Server-Sent Events** | Local Wi-Fi Testing | Built-in Vite middleware for classroom and LAN play. |
| **Audio** | **Web Audio API** | Procedural Sound FX | Instant synthesizer sounds with zero external audio file downloads. |
| **FX & Polish** | **Canvas Confetti** | Win Celebrations | Smooth 60fps canvas particle animations for reward moments. |
| **Hosting** | **Vercel / Static CDN** | Global Deployment | Ultra-fast Edge CDN distribution with zero server maintenance. |

---

*This document was generated to explain the technical foundations of the SCM Auction Simulator in clear, accessible language.*
