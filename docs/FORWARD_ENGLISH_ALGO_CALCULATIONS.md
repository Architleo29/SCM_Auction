# Forward English Auction: Complete Algorithmic & Mathematical Calculation Process

**Document Version:** 2.0  
**Target Engine:** `src/engine/forwardAuction.ts`  
**Game Mode:** Forward English Auction (Multi-Buyer Asset Draft & Capital Allocation)

---

## Table of Contents
1. [Executive Summary & Multi-Buyer Framework](#1-executive-summary--multi-buyer-framework)
2. [Capital Management & Purse Constraints](#2-capital-management--purse-constraints)
3. [The 10% Dynamic Reserve Requirement Formula](#3-the-10-dynamic-reserve-requirement-formula)
4. [Valuation Models & Generation Formulas](#4-valuation-models--generation-formulas)
   - [Mode A: Private Value Model](#41-mode-a-private-value-model)
   - [Mode B: Common Value Model & Winner's Curse](#42-mode-b-common-value-model--winners-curse)
5. [Anti-Winner's Curse Shading Factor](#5-anti-winners-curse-shading-factor)
6. [Buyer Bid Ceiling & Bidding Decision Engine](#6-buyer-bid-ceiling--bidding-decision-engine)
7. [Ascending Floor Mechanics & Anti-Sniping Timer](#7-ascending-floor-mechanics--anti-sniping-timer)
8. [End-of-Draft Portfolio Net Surplus Scoring](#8-end-of-draft-portfolio-net-surplus-scoring)
9. [Comprehensive Worked Numerical Draft Example](#9-comprehensive-worked-numerical-draft-example)
10. [Code Reference Map](#10-code-reference-map)

---

## 1. Executive Summary & Multi-Buyer Framework

In the **Forward English Asset Draft**, the market direction is reversed from standard procurement:

```
[Host: Auctioneer Console] 
       ↓ (Sequential Lots 1 to N)
[2 to 8 Connected Human Buyers] ➔ [₹10,00,000 Starting Purse Each]
       ↓ (Valuation Generation)
[Private Synergies (Mode A)] OR [Noisy Estimates (Mode B)]
       ↓ (Bid Increment Ladder)
[Live Ascending Bidding Arena] ➔ [Price Rises Upward With +8s Anti-Sniping]
       ↓ (Lot Hammer Falls)
[Winning Price Deducted From Purse] ➔ [Asset Vaulted in Portfolio]
       ↓ (Final Lot Closes)
[Portfolio Net Surplus Championship] ➔ [Gold / Silver / Bronze Podium]
```

### Role Architecture:
- **Host (Auctioneer):** Orchestrates the lot pacing, monitors live buyer capital, and resolves disputes/skips without bidding.
- **Guest Players (Buyers):** 2 to 8 competing buyers actively bidding upward to acquire supply chain assets at maximum net operational surplus.

---

## 2. Capital Management & Purse Constraints

Each competing buyer starts the draft with an equal liquid purse:

$$\text{StartingPurse} = \text{₹}10,00,000$$

### 2.1 Purse Settlement Rule
- Bidding on an item does **not** consume purse funds until the auction hammer falls.
- While holding the highest active bid, the buyer's funds are committed.
- When an asset lot resolves, the winning bid amount $P_{\text{win}}$ is deducted from the winner's remaining purse:

$$\text{RemainingPurse}_{\text{after lot}} = \text{RemainingPurse}_{\text{before lot}} - P_{\text{win}}$$

---

## 3. The 10% Dynamic Reserve Requirement Formula

To prevent aggressive players from exhausting their entire ₹10 Lakh purse on early lots and becoming inactive for the rest of the game night, the engine enforces a dynamic **10% Capital Reserve Lock**:

$$\text{ReserveRequirement}(\text{roundsRemaining}) = \begin{cases} 
0, & \text{if } \text{roundsRemaining} \le 3 \\ 
\text{Round}\left(0.10 \times \text{StartingPurse} \times \frac{\text{roundsRemaining}}{\text{totalLots}}\right), & \text{if } \text{roundsRemaining} > 3 
\end{cases}$$

### Maximum Spendable Bid Ceiling:
$$\text{MaxSpendableBid} = \max\big(0, \text{RemainingPurse} - \text{ReserveRequirement}(\text{roundsRemaining})\big)$$

> **Strategic Purpose:** In the final 3 lots, the reserve requirement drops to ₹0, allowing players to fully spend down their remaining purse in an aggressive endgame sprint.

---

## 4. Valuation Models & Generation Formulas

Before bidding begins on any lot $j$, valuations are assigned per buyer $i$ based on the selected Valuation Mode:

### 4.1 Mode A: Private Value Model
Each buyer has proprietary network synergies that make the asset uniquely valuable to their specific enterprise:

$$V_{i,j}^{\text{private}} = \text{Round}\big(\text{BaseMarketValue}_j \times \text{PrivateMultiplier}_{i,j}\big)$$

Where:
$$\text{PrivateMultiplier}_{i,j} \sim \text{Uniform}(0.70, 1.40)$$

- **Visibility:** $V_{i,j}^{\text{private}}$ is strictly private to buyer $i$.
- **Scoring Baseline:** Surplus is evaluated directly against $V_{i,j}^{\text{private}}$:
  $$\text{Surplus}_{i,j} = V_{i,j}^{\text{private}} - P_{\text{win},j}$$

---

### 4.2 Mode B: Common Value Model & Winner's Curse
The asset possesses an identical true market value for all buyers, but each buyer receives a noisy, imperfect appraisal:

$$\text{TrueValue}_j = \text{BaseMarketValue}_j \quad (\text{Identical for all buyers, revealed at game end})$$

$$\text{BuyerEstimate}_{i,j} = \text{Round}\big(\text{TrueValue}_j \times \text{NoiseMultiplier}_{i,j}\big)$$

Where:
$$\text{NoiseMultiplier}_{i,j} \sim \text{Uniform}(0.80, 1.20)$$

> **The Winner's Curse Phenomenon:** Because the winner is typically the buyer who drew the most optimistic positive noise roll (e.g. $+18\%$), bidding up to raw estimates causes buyers to systematically overpay and lose money upon contract delivery.

---

## 5. Anti-Winner's Curse Shading Factor

In **Mode B (Common Value)**, rational buyers must discount (shade) their estimate to protect against the winner's curse. The discount scales with the number of active bidders $n$:

$$\text{ShadingFactor}(n) = \text{Clamp}\big(1.15 - (0.05 \times n),\, 0.60,\, 1.00\big)$$

| Active Bidders ($n$) | Shading Factor | Discount Applied | Mathematical Formula |
|:---:|:---:|:---:|:---|
| 2 Bidders | $1.00$ | $0\%$ | Trust estimate ($1.15 - 0.10 = 1.05 \rightarrow 1.00$) |
| 3 Bidders | $1.00$ | $0\%$ | Baseline ($1.15 - 0.15 = 1.00$) |
| 4 Bidders | $0.95$ | $-5\%$ | $1.15 - 0.20 = 0.95$ |
| 5 Bidders | $0.90$ | $-10\%$ | $1.15 - 0.25 = 0.90$ |
| 6 Bidders | $0.85$ | $-15\%$ | $1.15 - 0.30 = 0.85$ |
| 7 Bidders | $0.80$ | $-20\%$ | $1.15 - 0.35 = 0.80$ |
| 8 Bidders | $0.75$ | $-25\%$ | $1.15 - 0.40 = 0.75$ |

---

## 6. Buyer Bid Ceiling & Bidding Decision Engine

### 6.1 Maximum Rational Bid Ceiling
$$\text{BidCeiling}_{i,j} = \begin{cases} 
V_{i,j}^{\text{private}}, & \text{in Mode A (Private Value)} \\ 
\text{Round}\big(\text{BuyerEstimate}_{i,j} \times \text{ShadingFactor}(n)\big), & \text{in Mode B (Common Value)} 
\end{cases}$$

### 6.2 Bid Validation Function
A buyer can place a bid of amount $B$ if and only if:
1. $B \ge \text{CurrentHighestBid} + \text{BidIncrement}_j$
2. $B \le \text{MaxSpendableBid}_i$
3. $B \le \text{BidCeiling}_{i,j}$ *(for automated AI decision checking)*

---

## 7. Ascending Floor Mechanics & Anti-Sniping Timer

1. **Starting Bid:**
   $$\text{StartingPrice}_j = \text{Round}\big(0.10 \text{ to } 0.15 \times \text{BaseMarketValue}_j\big)$$

2. **Bid Increments:**
   $$\text{BidIncrement}_j = \max(10\,000, \text{Round}(0.02 \times \text{BaseMarketValue}_j))$$

3. **Soft-Close Anti-Sniping Protection:**
   - Base lot duration: **30 seconds**.
   - If a new bid is received with under **8 seconds** remaining on the clock:
     $$\text{TimeRemaining} = \max(\text{TimeRemaining}, 8\,\text{seconds})$$
   - Prevents last-millisecond bot sniping and ensures human buyers have time to evaluate counter-bids.

---

## 8. End-of-Draft Portfolio Net Surplus Scoring

At the completion of all sequential lots (e.g. 6 or 12 lots), the winner is crowned by **Net Portfolio Surplus**:

### 8.1 Net Surplus Equation
$$\text{NetSurplus}_i = \sum_{k \in \text{ItemsWon}_i} \text{AssetBenchmarkValue}(k) - \sum_{k \in \text{ItemsWon}_i} P_{\text{paid}}(k)$$

Where:
$$\text{AssetBenchmarkValue}(k) = \begin{cases} 
V_{i,k}^{\text{private}}, & \text{in Mode A} \\ 
\text{TrueValue}_k, & \text{in Mode B} 
\end{cases}$$

### 8.2 Standing & Tie-Breaking
1. **Primary Metric:** Highest Net Portfolio Surplus ($\text{NetSurplus}_i$).
2. **First Tie-Breaker:** Higher Remaining Purse ($\text{RemainingPurse}_i$).
3. **Second Tie-Breaker:** Greater number of acquired lots ($|\text{ItemsWon}_i|$).

---

## 9. Comprehensive Worked Numerical Draft Example

*(6-Lot Draft with 4 Competing Human Buyers in Mode B: Common Value)*

### Initial Setup:
- **Starting Purse per Buyer:** ₹10,00,000
- **Active Bidders ($n$):** 4 ($\text{ShadingFactor} = 0.95$)

---

### Lot 1: 5-Axis Haas CNC Milling Station
- **Base Market Value (True Value):** ₹4,50,000
- **Starting Price:** ₹50,000 | **Bid Increment:** ₹10,000
- **Buyer A Estimate:** ₹4,80,000 ($+6.6\%$ noise roll)
- **Buyer A Bid Ceiling:** ₹4,80,000 $\times 0.95 =$ **₹4,56,000**
- **Reserve Lock (5 rounds remaining):** 
  $$\text{Reserve} = 0.10 \times 10,00,000 \times \frac{5}{6} = \text{₹}83,333$$
- **Buyer A Max Spendable:** ₹10,00,000 $-$ ₹83,333 $=$ ₹9,16,667
- **Auction Result:** Buyer A wins Lot 1 at **₹3,80,000**.
- **Buyer A Remaining Purse:** ₹10,00,000 $-$ ₹3,80,000 $=$ **₹6,20,000**.
- **Buyer A Captured Surplus on Lot 1:** 
  $$\text{Surplus} = 4,50,000 - 3,80,000 = +\text{₹}70,000$$

---

### Lot 4: Grade-A Lithium Iron Phosphate Stockpile
- **Base Market Value (True Value):** ₹7,50,000
- **Buyer B Estimate (Unshaded / Over-optimistic):** ₹8,40,000 ($+12\%$ noise)
- **Auction Result:** Buyer B fails to shade and wins at **₹7,80,000**.
- **Buyer B Captured Surplus (Winner's Curse):**
  $$\text{Surplus} = 7,50,000 - 7,80,000 = -\text{₹}30,000 \quad (\text{Net Loss!})$$

---

### Final Championship Leaderboard:
```
Rank  Buyer             Lots Won  Total Value  Total Paid  Remaining Purse  Net Surplus
🥇 1. Apex Dynamics         2      ₹10,50,000   ₹8,20,000     ₹1,80,000      +₹2,30,000
🥈 2. Vortex Supply         1       ₹6,80,000   ₹5,10,000     ₹4,90,000      +₹1,70,000
🥉 3. Titan Logistics       2       ₹8,30,000   ₹7,40,000     ₹2,60,000        +₹90,000
   4. Zenith Global         1       ₹7,50,000   ₹7,80,000     ₹2,20,000        -₹30,000
```

---

## 10. Code Reference Map

| Component | File Path | Key Functions / Constants |
|---|---|---|
| **Catalog & Valuation Engine** | `src/engine/forwardAuction.ts` | `FORWARD_CATALOG_PRESETS`, `generateBuyerValuations()` |
| **Purse & Reserve Calculator** | `src/engine/forwardAuction.ts` | `getReserveRequirement()`, `getBuyerBidCeiling()` |
| **Winner's Curse Shading** | `src/engine/forwardAuction.ts` | `getShadingFactor()` |
| **Live Ascending Arena** | `src/components/ForwardAuctionArena.tsx` | Bidding ladder, custom bid validation, anti-sniping |
| **Championship Settlement** | `src/components/ForwardLeaderboard.tsx` | Portfolio net surplus calculation, podium ranking |
