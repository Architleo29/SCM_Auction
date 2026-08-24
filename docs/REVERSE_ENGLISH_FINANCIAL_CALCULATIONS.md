# Reverse English Procurement: Complete Financial & Mathematical Calculation Process

**Document Version:** 2.3 (Audited & KaTeX Verified)  
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
8. [Comprehensive End-to-End Worked Numerical Example](#8-comprehensive-end-to-end-worked-numerical-example)
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

In Reverse English, all vendors operate on standardized baseline cost structures. The two active strategic controls you manage are:

### 2.1 Quality Tier Multiplier ($\text{QualityCostMultiplier}$)
During Step 2 (RFQ Builder), the supplier selects their **Quality Level (1★ to 5★)**. Higher quality raises variable production costs (Materials & Labor) but awards a higher technical score in Quality & Cost Based Selection (QCBS) buyer evaluations:

$$
\text{QualityCostMultiplier} = \begin{cases} 
0.80 & \text{for 1-Star (Economy: } -20\% \text{ variable cost)} \\ 
0.90 & \text{for 2-Star (Value: } -10\% \text{ variable cost)} \\ 
1.00 & \text{for 3-Star (Standard Baseline)} \\ 
1.15 & \text{for 4-Star (Premium: } +15\% \text{ variable cost)} \\ 
1.30 & \text{for 5-Star (Flagship: } +30\% \text{ variable cost)} 
\end{cases}
$$

---

## 3. Fully Loaded Cost (FLC) Accounting Waterfall

The Fully Loaded Cost (FLC) represents the total direct, indirect, capital, and fixed costs required to deliver the contract:

### 3.1 Standardized Profile Parameters
- **Labor Cost Index**: $1.00\times$
- **Materials Cost Index**: $1.00\times$
- **Logistics Cost Index**: $1.00\times$
- **Overhead Rate**: $10\%$
- **Financing Rate**: $6\%$ APR
- **Risk Contingency Rate**: $5\%$
- **Facility Fixed Costs**: ₹12,000 across 2 capacity slots (Absorption = ₹6,000/slot)

### 3.2 Direct Costs
$$
\text{DirectLabor} = \text{BaseLaborHours} \times \text{LaborRate} \times 1.00 \times \text{QualityCostMultiplier}
$$
$$
\text{DirectMaterials} = \text{BaseMaterialsQty} \times \text{UnitMaterialCost} \times 1.00 \times \text{QualityCostMultiplier}
$$
$$
\text{DirectLogistics} = \text{BaseLogisticsUnits} \times \text{LogisticsUnitCost} \times 1.00
$$
$$
\text{DirectCostSubtotal} = \text{DirectLabor} + \text{DirectMaterials} + \text{DirectLogistics}
$$

### 3.3 Indirect & Carrying Costs
1. **Overhead Allocation ($10\%$):**
   $$
   \text{OverheadAllocation} = \text{DirectCostSubtotal} \times 0.10
   $$
2. **Financing Cost (Working Capital over payment term):**
   $$
   \text{FinancingCost} = (\text{DirectCostSubtotal} \times 0.06) \times \left(\frac{\text{PaymentDelayDays}}{365}\right)
   $$
3. **Risk Contingency Reserve ($5\%$):**
   $$
   \text{RiskContingencyAmount} = \text{DirectCostSubtotal} \times 0.05
   $$
4. **Total Delivery Cost (TDC):**
   $$
   \text{TDC} = \text{DirectCostSubtotal} + \text{OverheadAllocation} + \text{FinancingCost} + \text{RiskContingencyAmount}
   $$
5. **Fixed Cost Absorption:**
   $$
   \text{FixedCostAbsorption} = \frac{12000}{2} = 6000
   $$

### 3.4 Fully Loaded Cost (FLC)
$$
\text{FLC} = \operatorname{Round}(\text{TDC} + \text{FixedCostAbsorption})
$$

---

## 4. RFQ Quoting & Pricing Strategies (5 Pricing Tiers)

In Step 2 (RFQ Builder), vendors choose their initial quotation strategy ($P_{\text{quote}}$). The platform offers **5 Standard Pricing Tiers** plus custom direct pricing:

### 4.1 Quoted Profit Margin Formula
$$
\text{QuotedMarginPct} = \left(\frac{P_{\text{quote}} - \text{FLC}}{P_{\text{quote}}}\right) \times 100
$$

### 4.2 The 5 Standard Pricing Tiers
Vendors can click any of the 5 quick-tier buttons to automatically compute their bid price relative to their Fully Loaded Cost ($\text{FLC}$) and the buyer's Budget Ceiling ($\text{Ceiling}$):

| Tier | Strategy Name | Target Margin | Mathematical Pricing Formula | Strategic Intent |
|:---:|:---|:---:|:---|:---|
| **Tier 1** | **High Margin** | $\approx +25\%$ | $P_1 = \min(0.98 \times \text{Ceiling},\, 1.30 \times \text{FLC})$ | Maximizes profit per contract; relies on 4★/5★ Quality score to win. |
| **Tier 2** | **Target Standard** | $\approx +18\%$ | $P_2 = \min(0.94 \times \text{Ceiling},\, 1.20 \times \text{FLC})$ | Recommended balanced tender strategy for sustainable operations. |
| **Tier 3** | **Balanced** | $\approx +12\%$ | $P_3 = \min(0.90 \times \text{Ceiling},\, 1.12 \times \text{FLC})$ | Competitive pricing against standard industry rivals. |
| **Tier 4** | **Aggressive** | $\approx +6\%$ | $P_4 = \min(0.85 \times \text{Ceiling},\, 1.06 \times \text{FLC})$ | Aggressive undercutting to capture volume; low margin buffer. |
| **Tier 5** | **Price Blitz** | $\approx +2\%$ | $P_5 = \max(1.02 \times \text{FLC},\, 0.72 \times \text{Ceiling})$ | Ultra-low price floor; aims for maximum 100% Price evaluation score. |

### 4.3 Custom Price Input & Dynamic Tier Detection
If a vendor manually types a custom selling price $P_{\text{custom}}$, the system dynamically detects and highlights the corresponding tier based on the resulting margin:
- $\text{Margin} \ge 25\% \implies \text{Tier 1 (High Margin)}$
- $16\% \le \text{Margin} < 25\% \implies \text{Tier 2 (Target)}$
- $10\% \le \text{Margin} < 16\% \implies \text{Tier 3 (Balanced)}$
- $4\% \le \text{Margin} < 10\% \implies \text{Tier 4 (Aggressive)}$
- $\text{Margin} < 4\% \implies \text{Tier 5 (Price Blitz)}$

### 4.4 Loss-Leader Safeguard
$$
\text{IsLossLeader} \iff P_{\text{quote}} < (0.70 \times \text{FLC})
$$
> **Warning:** Submitting a bid below $70\%$ of your Fully Loaded Cost triggers a Loss-Leader warning flag, indicating severe operating deficit risk.

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
\text{ProjectedTax}(P) = \max(0, \text{OperatingProfit}(P) \times 0.20)
$$
$$
\text{ProjectedNetProfit}(P) = \text{OperatingProfit}(P) - \text{ProjectedTax}(P) - 15000
$$

---

## 6. Post-Auction Delivery Settlement & GAAP P&L

When the auction timer expires, the contract is awarded at the final price $P_{\text{award}}$.

### 6.1 Non-Winning Vendors
Suppliers who are outbid incur only the sunk participation fee:
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

## 8. Comprehensive End-to-End Worked Numerical Example

*(Scenario: Industrial Machinery Manufacturing Tender)*

### Step 1: Fully Loaded Cost (FLC)
- Direct Labor: ₹1,10,000
- Direct Materials: ₹1,40,000
- Direct Logistics: ₹20,000
- **Direct Cost Subtotal:** ₹2,70,000
- Overhead Allocation ($10\%$): ₹27,000
- Financing Cost ($6\%$ over 45 days): ₹1,997
- Risk Contingency ($5\%$): ₹13,500
- Fixed Cost Absorption: ₹6,000
- **Fully Loaded Cost (FLC):** **₹3,18,497**

---

### Step 2: Initial RFQ Submission
- **Initial Quoted Price ($P_{\text{quote}}$):** **₹4,93,426**
- **Quoted Margin (at Bid Time):**
  $$
  \text{QuotedMarginPct} = \frac{493426 - 318497}{493426} \times 100 = 35.4\%
  $$

---

### Step 3: Live Reverse Auction Counter-Bidding
- Counter-bidding brings the winning price down to:
- **Final Award Price ($P_{\text{award}}$):** **₹4,34,620**

---

### Step 4: Post-Auction GAAP Settlement
```
  Contract Revenue (Awarded Price):     ₹4,34,620
(-) Cost of Goods Sold (FLC):          -₹3,18,497
-------------------------------------------------
(=) Gross Operating Profit:             ₹1,16,123
(-) Corporate Tax (20%):                -₹23,225
(-) Sunk Bid Preparation Cost:          -₹15,000
-------------------------------------------------
(=) NET REALIZED PROFIT:                  ₹77,898
```

---

### Step 5: Margin & Score Reconciliation
- **Quoted Margin:** $35.4\%$
- **Realized Margin:** 
  $$
  \text{RealizedMarginPct} = \frac{116123}{434620} \times 100 = 26.7\%
  $$
- **Margin Variance:** $26.7 - 35.4 = -8.7\text{ pts}$
- **Net Realized Banked Profit:** **₹77,898**
- **Risk-Adjusted Profit (RAP):** **₹77,898**
- **Reputation:** $100/100$

---

## 9. Code Reference Map

| Component | File Path | Key Functions |
|---|---|---|
| **Cost Engine & FLC** | [`costCalculator.ts`](file:///d:/SCM%20Auction/src/engine/costCalculator.ts) | `calculateCostBreakdown()`, `calculateExpectedValue()` |
| **Settlement & P&L** | [`pnlEngine.ts`](file:///d:/SCM%20Auction/src/engine/pnlEngine.ts) | `settleContractPnL()`, `calculateTotalScore()` |
| **Quote Builder UI** | [`QuoteBuilder.tsx`](file:///d:/SCM%20Auction/src/components/QuoteBuilder.tsx) | Quality selection, price tiering, live GAAP preview |
| **Live Arena** | [`AuctionArena.tsx`](file:///d:/SCM%20Auction/src/components/AuctionArena.tsx) | Real-time margin ticker, downward step bidding |
| **P&L Breakdown UI** | [`PnLBreakdown.tsx`](file:///d:/SCM%20Auction/src/components/PnLBreakdown.tsx) | GAAP waterfall display, margin variance reconciliation |
