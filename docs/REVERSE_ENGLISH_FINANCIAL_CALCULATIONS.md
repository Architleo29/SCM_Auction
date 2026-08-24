# Reverse English Procurement: Complete Financial & Mathematical Calculation Process

**Document Version:** 2.2 (KaTeX Verified)  
**Target Engine:** `src/engine/costCalculator.ts` and `src/engine/pnlEngine.ts`  
**Game Mode:** Reverse English Auction (Procurement Tender & B2B Quoting)

---

## Table of Contents
1. [Executive Summary & Financial Architecture](#1-executive-summary--financial-architecture)
2. [Player Decision Variables (Quality & Price)](#2-player-decision-variables-quality--price)
3. [Fully Loaded Cost (FLC) Accounting Waterfall](#3-fully-loaded-cost-flc-accounting-waterfall)
4. [RFQ Quoting & Margin Strategies](#4-rfq-quoting--margin-strategies)
5. [Live Reverse Auction Floor Calculations](#5-live-reverse-auction-floor-calculations)
6. [Post-Auction Delivery Settlement & GAAP P&L](#6-post-auction-delivery-settlement--gaap-pl)
7. [Risk-Adjusted Profit (RAP) & Volatility Penalty](#7-risk-adjusted-profit-rap--volatility-penalty)
8. [Comprehensive Worked Numerical Example](#8-comprehensive-worked-numerical-example)
9. [Code Reference Map](#9-code-reference-map)

---

## 1. Executive Summary & Financial Architecture

In a **Reverse English Procurement Auction**, suppliers compete to win enterprise procurement contracts from the buyer by placing downward counter-bids. The financial lifecycle proceeds through 5 distinct accounting stages:

```
[Quality Selection (1★ to 5★)] 
       ↓ (Cost Scaling Multiplier)
[RFQ Baseline Costing] ➔ [Fully Loaded Cost (FLC)] 
       ↓ (Initial Profit Margin Tier)
[RFQ Builder Quoting] ➔ [Quoted Price & Quoted Margin %]
       ↓ (Live Downward Counter-bids)
[Live Reverse Auction Arena] ➔ [Final Contract Award Price]
       ↓ (Settlement Waterfall)
[GAAP Income Statement] ➔ [Operating Profit] ➔ [Tax (20%)] ➔ [₹15k Sunk Fee] ➔ [Net Realized Profit]
       ↓ (Variance & Volatility)
[Risk-Adjusted Profit (RAP)] ➔ [Composite Championship Score]
```

---

## 2. Player Decision Variables (Quality & Price)

In Reverse English, the player operates two primary strategic controls:

### 2.1 Quality Tier Multiplier ($\text{QualityCostMultiplier}$)
During Step 2 (RFQ Builder), the supplier selects their **Quality Level (1★ to 5★)**. Higher quality raises variable production costs but grants a higher technical score in Quality & Cost Based Selection (QCBS) buyer evaluations:

$$
\text{QualityCostMultiplier} = \begin{cases} 
0.80 & \text{for 1-Star (Economy: } -20\% \text{ variable cost)} \\ 
0.90 & \text{for 2-Star (Value: } -10\% \text{ variable cost)} \\ 
1.00 & \text{for 3-Star (Standard Baseline)} \\ 
1.15 & \text{for 4-Star (Premium: } +15\% \text{ variable cost)} \\ 
1.30 & \text{for 5-Star (Flagship: } +30\% \text{ variable cost)} 
\end{cases}
$$

> **Note on Profile Multipliers:** In the actual game loop, baseline multipliers ($\text{EffMultiplier} = 1.0$ and $\text{SpeedMultiplier} = 1.0$) are fixed at neutral 3★. The dynamic variables controlled by the player in each round are the **Quality Level** and **Selling Price**.

---

## 3. Fully Loaded Cost (FLC) Accounting Waterfall

The Fully Loaded Cost (FLC) represents the total direct, indirect, capital, and fixed costs required to deliver the contract:

### 3.1 Direct Manufacturing & Delivery Costs
$$
\text{DirectLabor} = \text{BaseLaborHours} \times \text{LaborRate} \times \text{LaborCostIndex} \times \text{QualityCostMultiplier}
$$

$$
\text{DirectMaterials} = \text{BaseMaterialsQty} \times \text{UnitMaterialCost} \times \text{MaterialsCostIndex} \times \text{QualityCostMultiplier}
$$

$$
\text{DirectLogistics} = \text{BaseLogisticsUnits} \times \text{LogisticsUnitCost} \times \text{LogisticsCostIndex}
$$

$$
\text{DirectCostSubtotal} = \text{DirectLabor} + \text{DirectMaterials} + \text{DirectLogistics}
$$

### 3.2 Indirect & Carrying Costs
1. **Overhead Allocation:**
   $$
   \text{OverheadAllocation} = \text{DirectCostSubtotal} \times \text{OverheadRate}
   $$

2. **Financing Carrying Cost (Cost of Capital given buyer payment terms):**
   $$
   \text{FinancingCost} = (\text{DirectCostSubtotal} \times \text{FinancingCostRate}) \times \left(\frac{\text{PaymentDelayDays}}{365}\right)
   $$

3. **Risk Contingency Reserve:**
   $$
   \text{RiskContingencyAmount} = \text{DirectCostSubtotal} \times \text{RiskContingencyRate}
   $$

### 3.3 Total Delivery Cost (TDC)
$$
\text{TDC} = \text{DirectCostSubtotal} + \text{OverheadAllocation} + \text{FinancingCost} + \text{RiskContingencyAmount}
$$

### 3.4 Fixed Cost Absorption
Allocated per capacity slot:
$$
\text{FixedCostAbsorption} = \frac{\text{VendorFixedCosts}}{\max(1, \text{VendorCapacity})}
$$

### 3.5 Fully Loaded Cost (FLC)
$$
\text{FLC} = \operatorname{Round}(\text{TDC} + \text{FixedCostAbsorption})
$$

---

## 4. RFQ Quoting & Margin Strategies

In Step 2 (RFQ Builder), vendors choose their initial selling price ($P_{\text{quote}}$):

$$
\text{QuotedMarginPct} = \left(\frac{P_{\text{quote}} - \text{FLC}}{P_{\text{quote}}}\right) \times 100
$$

### Standard Pricing Tiers:
| Tier | Strategy | Target Margin ($\%$) | Bid Price Formula |
|:---:|:---|:---:|:---|
| 1 | High Margin | $\approx +25\%$ | $\min(0.98 \times \text{Ceiling},\, 1.30 \times \text{FLC})$ |
| 2 | Target Standard | $\approx +18\%$ | $\min(0.94 \times \text{Ceiling},\, 1.20 \times \text{FLC})$ |
| 3 | Balanced | $\approx +12\%$ | $\min(0.90 \times \text{Ceiling},\, 1.12 \times \text{FLC})$ |
| 4 | Aggressive | $\approx +6\%$ | $\min(0.85 \times \text{Ceiling},\, 1.06 \times \text{FLC})$ |
| 5 | Price Blitz | $\approx +2\%$ | $\max(1.02 \times \text{FLC},\, 0.72 \times \text{Ceiling})$ |

---

## 5. Live Reverse Auction Floor Calculations

During live bidding in the arena, vendors place counter-bids that undercut rivals downwards:

### 5.1 Step Increments
$$
\text{Step}_1 = \max(1000, \operatorname{Round}(\text{BudgetCeiling} \times 0.01))
$$
$$
\text{Step}_2 = \max(2500, \operatorname{Round}(\text{BudgetCeiling} \times 0.025))
$$
$$
\text{Step}_3 = \max(5000, \operatorname{Round}(\text{BudgetCeiling} \times 0.05))
$$

### 5.2 Real-Time Live Margin Display
At any live floor price $P$:
$$
\text{OperatingProfit}(P) = P - \text{FLC}
$$
$$
\text{LiveMarginPct}(P) = \left(\frac{P - \text{FLC}}{P}\right) \times 100
$$
$$
\text{ProjectedTax}(P) = \max(0, \text{OperatingProfit}(P) \times \text{TaxRate})
$$
$$
\text{ProjectedNetProfit}(P) = \text{OperatingProfit}(P) - \text{ProjectedTax}(P) - 15000
$$

---

## 6. Post-Auction Delivery Settlement & GAAP P&L

When the auction timer expires, the contract is awarded at the final price $P_{\text{award}}$.

### 6.1 Non-Winning Vendors
Suppliers who are outbid incur only the sunk participation fee of ₹15,000:
$$
\text{ContractWon} = \text{false}
$$
$$
\text{RealizedProfit} = -\text{SunkBidPrepCost} = -15000
$$
$$
\text{RiskAdjustedProfit} = -15000
$$

### 6.2 Winning Vendor (Delivery Income Statement)
$$
\text{ContractRevenue} = P_{\text{award}}
$$
$$
\text{ActualDeliveryCost} = \text{FLC} + \text{EventCostDelta}
$$
$$
\text{GrossOperatingProfit} = \text{ContractRevenue} - \text{ActualDeliveryCost}
$$
$$
\text{CorporateTax} = \begin{cases} \operatorname{Round}(\text{GrossOperatingProfit} \times 0.20), & \text{if } \text{GrossOperatingProfit} > 0 \\ 0, & \text{otherwise} \end{cases}
$$
$$
\text{NetRealizedProfit} = \text{GrossOperatingProfit} - \text{CorporateTax} - 15000
$$

### 6.3 Quoted vs Realized Margin Reconciliation
- **Quoted Margin (at Bid Time):**
  $$
  \text{QuotedMarginPct} = \left(\frac{P_{\text{quote}} - \text{FLC}}{P_{\text{quote}}}\right) \times 100
  $$

- **Realized Actual Margin:**
  $$
  \text{RealizedMarginPct} = \left(\frac{\text{GrossOperatingProfit}}{P_{\text{award}}}\right) \times 100
  $$

- **Margin Variance:**
  $$
  \text{MarginVariancePts} = \text{RealizedMarginPct} - \text{QuotedMarginPct}
  $$

---

## 7. Risk-Adjusted Profit (RAP) & Volatility Penalty

To penalize extreme price discounting and margin volatility:

### 7.1 Volatility Penalty Formula
$$
\text{MarginDiffDecimal} = \frac{|\text{MarginVariancePts}|}{100}
$$
$$
\text{VolatilityPenalty} = \min(0.40, \text{MarginDiffDecimal} \times 0.5)
$$

### 7.2 Risk-Adjusted Profit (RAP)
$$
\text{RAP} = \operatorname{Round}(\text{NetRealizedProfit} \times (1 - \text{VolatilityPenalty}))
$$

### 7.3 Total Championship Score
$$
\text{TotalScore} = \text{BankedProfit} + (\text{ContractsWon} \times 1000) + (\text{TotalRAP} \times 0.20) - \text{Penalties}
$$

---

## 8. Comprehensive Worked Numerical Example

*(Scenario: Industrial Machinery Manufacturing Tender)*

### Input Constants:
- **RFQ Ceiling:** ₹5,00,000
- **Corporate Tax Rate:** $20\%$
- **Sunk Participation Fee:** ₹15,000
- **Chosen Quality Level:** 3★ Standard ($\text{QualityCostMultiplier} = 1.0$)

---

### Step 1: Fully Loaded Cost (FLC)
- Direct Labor: ₹1,10,000
- Direct Materials: ₹1,40,000
- Direct Logistics: ₹20,000
- **Direct Cost Subtotal:** ₹2,70,000
- Overhead Allocation ($10\%$): ₹27,000
- Financing Cost ($4\%$ over 45 days): ₹1,331
- Risk Contingency ($5\%$): ₹13,500
- Fixed Cost Absorption: ₹8,415
- **Fully Loaded Cost (FLC):** **₹3,20,246**

---

### Step 2: Initial RFQ Submission
- Vendor submits initial Quote at Tier 2:
- **Initial Quoted Price ($P_{\text{quote}}$):** **₹4,93,426**
- **Quoted Margin (at Bid Time):**
  $$
  \text{QuotedMarginPct} = \frac{493426 - 320246}{493426} \times 100 = 35.1\%
  $$

---

### Step 3: Live Reverse Auction Floor
- Counter-bidding brings the winning price down to:
- **Final Award Price ($P_{\text{award}}$):** **₹4,34,620**

---

### Step 4: Post-Auction GAAP Settlement
```
  Contract Revenue (Awarded Price):     ₹4,34,620
(-) Cost of Goods Sold (FLC):          -₹3,20,246
-------------------------------------------------
(=) Gross Operating Profit:             ₹1,14,374
(-) Corporate Tax (20%):                -₹22,875
(-) Sunk Bid Preparation Cost:          -₹15,000
-------------------------------------------------
(=) NET REALIZED PROFIT:                  ₹76,499
```

---

### Step 5: Margin & Score Reconciliation
- **Quoted Margin:** $35.1\%$
- **Realized Margin:** 
  $$
  \text{RealizedMarginPct} = \frac{114374}{434620} \times 100 = 26.3\%
  $$
- **Margin Variance:** $26.3 - 35.1 = -8.8\text{ pts}$
- **Net Realized Banked Profit:** **₹76,499**
- **Risk-Adjusted Profit (RAP):** **₹76,499**
- **Reputation:** $100/100$

---

## 9. Code Reference Map

| Component | File Path | Key Functions |
|---|---|---|
| **Cost Engine & FLC** | `src/engine/costCalculator.ts` | `calculateCostBreakdown()`, `calculateExpectedValue()` |
| **Settlement & P&L** | `src/engine/pnlEngine.ts` | `settleContractPnL()`, `calculateTotalScore()` |
| **Quote Builder UI** | `src/components/QuoteBuilder.tsx` | Quality selection, price tiering, live GAAP preview |
| **Live Arena** | `src/components/AuctionArena.tsx` | Real-time margin ticker, downward step bidding |
| **P&L Breakdown UI** | `src/components/PnLBreakdown.tsx` | GAAP waterfall display, margin variance reconciliation |
