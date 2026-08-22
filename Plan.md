# Project Implementation Plan: Multiplayer Vendor Bidding & Auction Simulator

**Version:** 1.0  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Architecture:** Serverless Realtime Multiplayer (React + TypeScript + Tailwind CSS + Supabase Realtime Channels / Postgres)  
**AI System:** Pure Algorithmic & Game-Theory Heuristics (0% GenAI / No LLMs)

---

## 1. System Architecture Overview

The system is designed as a **serverless, low-latency, real-time multiplayer application** where:
1. **Clients**: Connect via a 6-character room code on laptops, tablets, or smartphones.
2. **State Synchronization**: Managed in real time using **Supabase Realtime Broadcast & Presence Channels** (Free Tier).
3. **Host-Authoritative Coordination**: The room Host's client coordinates synchronized round timers, event draws, and triggers the decision loops for any **AI Bot Competitors** in the room.
4. **Zero-Backend Dependency**: All calculations (FLC, buyer evaluation, bot bidding, P&L settlement) run as pure, deterministic TypeScript modules on client devices.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SUPABASE REALTIME CHANNELS                        │
│  - Channel: room:{roomId}                                              │
│    • Presence: Active connected players & ready status                 │
│    • Broadcast: State changes (phase transitions, timers, RFQ data)     │
│    • Broadcast: Live auction ticks, bids, buzzer claims, exits         │
│    • Broadcast: Dynamic events, P&L settlements, leaderboard           │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ (Real-time WebSockets Broadcast)
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
┌───────┴────────┐           ┌───────┴────────┐           ┌───────┴────────┐
│  HOST CLIENT   │           │ HUMAN PLAYER 2 │           │ HUMAN PLAYER N │
│ (Runs AI Bots  │           │ (Phone/Laptop) │           │ (Phone/Laptop) │
│  & Host Timer) │           └────────────────┘           └────────────────┘
└────────────────┘
```

---

## 2. Core Game Loop & State Machine

Every round ("Fiscal Quarter") progresses through a strict, synchronized 9-step lifecycle:

```
1. RFQ RELEASE      Buyer publishes contract requirements and evaluation weight ranges
2. INTEL PHASE      Players spend Intel Points on rival cost leaks or exact buyer weights
3. QUOTE BUILDING   Players privately construct commercial quotes (FLC & margin calculated live)
4. AUCTION EVENT    Real-time English, Dutch, or Japanese auction resolves bids
5. EVALUATION       Buyer scoring engine normalizes and ranks multi-criteria weighted quotes
6. AWARD            Contract awarded to highest composite score passing compliance gates
7. EVENT CARD       Dynamic shock card drawn from deck and applied to the winning contract / market
8. DELIVERY & P&L   Winner delivers contract; actual costs vs quoted costs settle into P&L
9. RECAP & REPUTATION Winner/loser reputation updates, live leaderboard rendered -> Next round
```

---

## 3. Mathematical & Economic Engine Specifications

### 3.1 Company Profile Generation (14 Variables per Player)
When a player joins or a session starts, an asymmetric company profile is assigned:

| Variable | Description | Realistic Range | Scope |
|---|---|---|---|
| `fixedCosts` ($FC$) | Overhead cost per round | \$8,000 – \$25,000 | Private |
| `variableCostRate` ($VC$) | Direct baseline cost rate | 45% – 70% | Private |
| `laborCostIndex` ($LCI$) | Labor rate multiplier | 0.80 – 1.30 | Private |
| `materialsCostIndex` ($MCI$) | Materials rate multiplier | 0.80 – 1.30 | Private |
| `logisticsCostIndex` ($LgCI$) | Shipping/delivery multiplier | 0.70 – 1.40 | Private |
| `overheadRate` ($OH$) | Indirect overhead allocation | 8% – 18% | Private |
| `taxRate` ($TR$) | Realized profit taxation | 15% – 30% | Regional |
| `financingCostRate` ($FCR$) | Cost of capital / APR | 4% – 12% | Private |
| `riskContingencyNeed` ($RCN$) | Recommended risk buffer | 3% – 15% | Private |
| `capacity` | Max contract load per round | 1 – 3 units | Public |
| `reputationScore` | Starting reputation | 50 – 70 (0–100 scale) | Public |
| `qualityLevel` | Fixed vendor capability trait | 1 – 5 stars | Public |
| `deliveryCapability` | Base delivery speed | Scenario days | Public |
| `targetProfitMargin` | Player's chosen goal | 5% – 35% | Private |

---

### 3.2 Cost Build-Up & Quoting Formulas

```typescript
// 1. Direct Costs
Direct_Labor = RFQ.baseLaborHours * Labor_Rate * laborCostIndex
Direct_Materials = RFQ.baseMaterialsQty * Unit_Material_Cost * materialsCostIndex
Direct_Logistics = RFQ.baseLogisticsUnits * Logistics_Unit_Cost * logisticsCostIndex
Direct_Cost_Subtotal = Direct_Labor + Direct_Materials + Direct_Logistics

// 2. Indirect & Risk Allocations
Overhead_Allocation = Direct_Cost_Subtotal * overheadRate
Financing_Cost = (Direct_Cost_Subtotal * financingCostRate) * (RFQ.paymentDelayDays / 365)
Risk_Contingency = Direct_Cost_Subtotal * quotedRiskContingencyRate

// 3. Fully Loaded Cost (FLC)
Total_Delivery_Cost = Direct_Cost_Subtotal + Overhead_Allocation + Financing_Cost + Risk_Contingency
Fixed_Cost_Absorption = fixedCosts / capacity
Fully_Loaded_Cost (FLC) = Total_Delivery_Cost + Fixed_Cost_Absorption

// 4. Quoted Price & Margins
Quoted_Margin_Pct = (Quoted_Price - FLC) / Quoted_Price
Loss_Leader_Flag = Quoted_Price < (0.70 * FLC)
```

---

### 3.3 Buyer Multi-Criteria Evaluation Engine

Every RFQ specifies dynamic evaluation weights. Scores are normalized across all submitted bids:

```typescript
// Price score (Inverse normalization: lowest price = 1.0, highest price = 0.0)
Normalized_Price_Score = 1 - (Price_i - Min_Price) / (Max_Price - Min_Price || 1)

// Multi-criteria composite
Weighted_Score = 
    (Weight_Price * Normalized_Price_Score) +
    (Weight_Quality * (Vendor_Quality / 5.0)) +
    (Weight_Timeline * Timeline_Score) +
    (Weight_Reputation * (Reputation / 100.0)) +
    (Weight_Risk * Risk_Adequacy_Score) +
    (Weight_PaymentTerms * Payment_Preference_Score) +
    (Weight_SLA * SLA_Score) +
    (Weight_ESG * Sustainability_Score)

// Winner: Highest Weighted_Score among vendors passing mandatory Compliance Gates
```

---

### 3.4 P&L Settlement, Risk-Adjusted Profit & Scoring

Post-award delivery settlement applies Dynamic Events (§7) to calculate realized profit:

```typescript
Actual_Delivery_Cost = FLC_adjusted_by_events
Realized_Profit = Quoted_Price - Actual_Delivery_Cost - Tax
Realized_Margin_Pct = (Quoted_Price - Actual_Delivery_Cost) / Quoted_Price

// Volatility penalty for inaccurate risk estimation
Volatility_Penalty = Math.min(0.40, Math.abs(Realized_Margin_Pct - Quoted_Margin_Pct) * 0.5)
Risk_Adjusted_Profit (RAP) = Realized_Profit * (1 - Volatility_Penalty)

// Total Game Score Formula
Total_Score = (Realized_Profit * 1.0)
            + (Contracts_Won * 50)
            + (Reputation_Index * 20)
            + (RAP * 0.30)
            - Penalties
```

---

## 4. Auction Formats & State Machines

### 4.1 Reverse English Auction (Open Descending)
* **Mechanic**: Live countdown (default 45s). Bids start at RFQ Budget ceiling and decrease in real-time.
* **Soft-Close Rule**: Any bid in the final 15s resets the clock by +15s (anti-sniping).
* **Sync**: Each lower bid is written to Firebase; all clients render the descending ticker and bidder avatar.

### 4.2 Reverse Dutch Auction (Clock Descending)
* **Mechanic**: Price starts high (130% of budget) and automatically ticks down by 2.5% every 4 seconds.
* **Instant Win**: The **first** vendor to press "ACCEPT" wins instantly at the current tick price.
* **Concurrency Lock**: Firebase transaction / atomic write ensures only the first timestamped buzz wins.

### 4.3 Japanese Clock Auction (Descending Exit)
* **Mechanic**: Price descends in discrete rounds (e.g. −3% every 4 seconds).
* **Hold to Stay In**: All players start "IN". Releasing the button logs an **irrevocable exit**.
* **Payout**: The last remaining vendor wins and pays the price of the **second-to-last exit** (eliminating the winner's curse).

---

## 5. Algorithmic AI Competitor System (Zero GenAI / 100% Math)

When player seats are empty or in demo mode, the Host executes 4 distinct heuristic bot algorithms:

| Personality | Quote Strategy | Live Auction Behavior |
|---|---|---|
| 🔴 **Aggressive** | Sets Target Margin = 5% (`FLC * 1.05`), minimum contingency (3%) | Bids aggressively down to its cost floor |
| 🔵 **Conservative** | Sets Target Margin = 25% (`FLC * 1.25`), high contingency (15%) | Exits early to avoid negative EV |
| 🟡 **Opportunist** | Analyzes rival cost estimates; targets \$1,000 under 2nd-place rival | Waits and snipes optimal Dutch margins |
| 🟣 **Copycat** | Evaluates the Round N-1 leader | Copies leader's margin multiplier & SLA tier |

---

## 6. Eight Industry Scenarios & Twelve Dynamic Events

### 6.1 Eight Industry Scenarios
1. **Manufacturing**: Materials & Logistics heavy; binding capacity constraints; 35% price weight.
2. **Construction**: Weather delays; materials inflation sensitivity; mid-project change order events.
3. **IT / Software**: Pure labor focus; sprint velocity sub-mechanic; cybersecurity compliance gates.
4. **Logistics & Freight**: Fuel shocks; route variance; timeline is the dominant score driver (40%).
5. **Strategy Consulting**: High margin ceiling; reputation weight up to 25%.
6. **Healthcare & MedTech**: High regulatory compliance cost; strict pass/fail compliance gate.
7. **Energy & Infrastructure**: Capital intensive; financing cost heavy; 2-round multi-delivery contracts.
8. **Government Procurement**: Formal RFP; audit risks; lowest transparency into buyer weight ranges.

### 6.2 Twelve Dynamic Event Cards
1. `Supply-Chain Disruption`: Materials Cost Index +15% to +40%.
2. `Inflation Spike`: All cost indices +5% to +10% market-wide.
3. `Competitor Intel Leak`: One rival's cost profile revealed publicly.
4. `Client Budget Cut`: Contract value renegotiated −15% (margin hit vs. walkaway reputation hit).
5. `Specification Change`: Unbudgeted rework added mid-delivery.
6. `Deadline Pressure`: Rush-fee opportunity or liquidated damages penalty.
7. `Contractual Penalty`: Triggered if quality or timeline fails spec.
8. `Hidden Cost Discovery`: Tests whether quoted risk contingency was adequate.
9. `Capacity Shock`: Equipment breakdown temporarily reduces capacity by 1.
10. `Macro Demand Boom`: Buyer budgets increase +20% for future rounds.
11. `Reputation Windfall`: Referral bonus grants +10 Reputation and free Intel Points.
12. `Financing Rate Spike`: Cost of capital jumps for vendors using milestone/delayed terms.

---

## 7. Frontend User Interface Suite (12 Screens)

1. **Lobby & Setup**: Create room / Join with 6-letter code / Player list / Add AI Bots / Scenario select.
2. **Company Dossier**: Private cost breakdown card with interactive tooltips and beginner guide.
3. **RFQ Notice Board**: Active contract specs, baseline units, budget ceiling, and buyer weight ranges.
4. **Intel Market**: Spend Intel Points to reveal rival cost indices or hidden buyer weight numbers.
5. **Interactive Quote Builder**:
   * Slider & inputs for Price, Payment Terms, Delivery Days, Warranty, SLA Tier, ESG.
   * Real-time live calculation cards: Direct Costs, Overhead, Contingency, FLC, Quoted Margin %, Loss-Leader Warning.
6. **Live Auction Arena**:
   * English: Real-time descending bids + reset countdown ticker + bidder avatars.
   * Dutch: Clock descending animation + prominent "BUZZ IN / ACCEPT" action button.
   * Japanese: "HOLD TO STAY IN" interactive press button + live exit feed.
7. **Buyer Evaluation & Award Podium**: Animated scoring breakdown across all criteria and winner announcement.
8. **Event Reveal Card**: 3D card flip animation revealing dynamic shock + financial impact delta.
9. **Post-Auction P&L Breakdown**: Comprehensive profit variance analysis (Quoted vs Realized Margin, Tax, RAP).
10. **Fiscal Year Leaderboard & Round Recap**: Realized profit ranking, reputation shifts, and contracts won.
11. **Persistent Company Dashboard**: Historical win rate, discipline index, and unlocked achievements.
12. **Facilitator / Trainer View**: Summary tables showing participant bidding discipline and pricing variance for classroom debriefs.

---

## 8. Implementation Milestones

* [ ] **Milestone 1**: Project Scaffolding (React + Vite + TypeScript + Tailwind CSS + Lucide Icons + Firebase SDK).
* [ ] **Milestone 2**: Core Simulation & Mathematics Engine (TypeScript modules for FLC, Buyer Scoring, P&L, and 4 AI Bots).
* [ ] **Milestone 3**: Multiplayer Lobby & Firebase Realtime State Machine Sync.
* [ ] **Milestone 4**: Interactive Quote Builder & Live Auction Engines (English, Dutch, Japanese).
* [ ] **Milestone 5**: Evaluation, Dynamic Events Deck & Post-Auction P&L Screens.
* [ ] **Milestone 6**: 8 Scenarios, Leaderboards, Sound/Haptic FX, and Facilitator Export.
