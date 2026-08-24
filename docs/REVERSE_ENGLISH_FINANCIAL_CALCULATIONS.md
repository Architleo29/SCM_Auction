# Reverse English Procurement: Complete Financial & Mathematical Calculation Process

**Document Version:** 2.0  
**Target Engine:** `src/engine/costCalculator.ts` and `src/engine/pnlEngine.ts`  
**Game Mode:** Reverse English Auction (Procurement Tender & B2B Quoting)

---

## Table of Contents
1. [Executive Summary & Financial Lifecycle](#1-executive-summary--financial-lifecycle)
2. [Stage 1: Company Strategy Multipliers](#2-stage-1-company-strategy-multipliers)
3. [Stage 2: Fully Loaded Cost (FLC) Accounting Waterfall](#3-stage-2-fully-loaded-cost-flc-accounting-waterfall)
4. [Stage 3: RFQ Quoting & Margin Strategies](#4-stage-3-rfq-quoting--margin-strategies)
5. [Stage 4: Live Reverse Auction Floor Calculations](#5-stage-4-live-reverse-auction-floor-calculations)
6. [Stage 5: Post-Auction Delivery Settlement & GAAP P&L](#6-stage-5-post-auction-delivery-settlement--gaap-pl)
7. [Stage 6: Risk-Adjusted Profit (RAP) & Tournament Scoring](#7-stage-6-risk-adjusted-profit-rap--tournament-scoring)
8. [Comprehensive End-to-End Worked Numerical Example](#8-comprehensive-end-to-end-worked-numerical-example)
9. [Code Reference Map](#9-code-reference-map)

---

## 1. Executive Summary & Financial Lifecycle

In a **Reverse English Procurement Auction**, suppliers compete to win enterprise procurement contracts from the buyer by placing downward counter-bids. The financial lifecycle proceeds through 5 distinct accounting stages:

```
[Company Strategy Profile] 
       ↓ (Multipliers)
[RFQ Baseline Costing] ➔ [Fully Loaded Cost (FLC)] 
       ↓ (Initial Margin)
[RFQ Builder Quoting] ➔ [Quoted Price & Quoted Margin %]
       ↓ (Live Counter-bids)
[Live Reverse Auction Arena] ➔ [Final Contract Award Price]
       ↓ (Settlement Waterfall)
[GAAP Income Statement] ➔ [Operating Profit] ➔ [Tax] ➔ [₹15k Sunk Fee] ➔ [Net Realized Profit]
       ↓ (Variance & Volatility)
[Risk-Adjusted Profit (RAP)] ➔ [Composite Championship Score]
```

---

## 2. Stage 1: Company Strategy Multipliers

Each participating supplier configures **3 Strategic Capabilities** (rated 1 to 5 Stars):

### 2.1 Cost Efficiency Multiplier
Controls lean operational practices, scrap reduction, and automation efficiency:
$$\text{EffMultiplier} = 1 - \big((\text{CostEfficiency} - 3) \times 0.10\big)$$

| Level | Efficiency Stars | Multiplier | Direct Cost Impact |
|:---:|:---|:---:|:---|
| 1★ | Low Efficiency | $1.20$ | $+20\%$ Direct Cost |
| 2★ | Developing | $1.10$ | $+10\%$ Direct Cost |
| 3★ | Standard (Baseline) | $1.00$ | Baseline |
| 4★ | Advanced | $0.90$ | $-10\%$ Direct Cost |
| 5★ | World-Class Lean | $0.80$ | $-20\%$ Direct Cost |

### 2.2 Quality Tier Cost Multiplier
Determines component grade, testing rigor, and raw material purity:
$$\text{QualityCostMultiplier} = \begin{cases} 
0.80 & \text{for } 1\star \text{ (Economy)} \\ 
0.90 & \text{for } 2\star \text{ (Value)} \\ 
1.00 & \text{for } 3\star \text{ (Standard Baseline)} \\ 
1.15 & \text{for } 4\star \text{ (Premium)} \\ 
1.30 & \text{for } 5\star \text{ (Flagship)} 
\end{cases}$$

> **Strategic Tradeoff:** Higher quality adds up to $+30\%$ to Labor & Materials costs, but awards a $100\%$ Technical Score in QCBS buyer evaluations.

### 2.3 Delivery Speed Multiplier
Reflects expedited logistics, air-freight options, and buffer transport:
$$\text{SpeedCostMultiplier} = 1 + \big((\text{SpeedLevel} - 3) \times 0.05\big)$$

| Level | Speed Stars | Multiplier | Logistics Cost Impact |
|:---:|:---|:---:|:---|
| 1★ | Slow / Sea Freight | $0.90$ | $-10\%$ Logistics Cost |
| 3★ | Standard Ground | $1.00$ | Baseline |
| 5★ | Express / Air Priority | $1.10$ | $+10\%$ Logistics Cost |

---

## 3. Stage 2: Fully Loaded Cost (FLC) Accounting Waterfall

The Fully Loaded Cost (FLC) represents the total direct, indirect, capital, and fixed costs required to fulfill the RFQ:

### 3.1 Direct Costs
$$\text{DirectLabor} = \text{BaseLaborHours} \times \text{LaborRate} \times \text{LaborCostIndex} \times \text{EffMultiplier} \times \text{QualityCostMultiplier}$$

$$\text{DirectMaterials} = \text{BaseMaterialsQty} \times \text{UnitMaterialCost} \times \text{MaterialsCostIndex} \times \text{EffMultiplier} \times \text{QualityCostMultiplier}$$

$$\text{DirectLogistics} = \text{BaseLogisticsUnits} \times \text{LogisticsUnitCost} \times \text{LogisticsCostIndex} \times \text{EffMultiplier} \times \text{SpeedCostMultiplier}$$

$$\text{DirectCostSubtotal} = \text{DirectLabor} + \text{DirectMaterials} + \text{DirectLogistics}$$

### 3.2 Indirect & Carrying Costs
1. **Overhead Allocation:**
   $$\text{OverheadAllocation} = \text{DirectCostSubtotal} \times \text{OverheadRate}$$

2. **Financing Carrying Cost (Working Capital given buyer payment delay):**
   $$\text{FinancingCost} = (\text{DirectCostSubtotal} \times \text{FinancingCostRate}) \times \left(\frac{\text{RFQ PaymentDelayDays}}{365}\right)$$

3. **Risk Contingency Reserve:**
   $$\text{RiskContingencyAmount} = \text{DirectCostSubtotal} \times \text{RiskContingencyRate}$$

### 3.3 Total Delivery Cost (TDC)
$$\text{TDC} = \text{DirectCostSubtotal} + \text{OverheadAllocation} + \text{FinancingCost} + \text{RiskContingencyAmount}$$

### 3.4 Fixed Cost Absorption
Allocated based on available factory capacity slots:
$$\text{FixedCostAbsorption} = \frac{\text{VendorFixedCosts}}{\max(1, \text{VendorCapacity})}$$

### 3.5 Fully Loaded Cost (FLC)
$$\text{FLC} = \text{Round}(\text{TDC} + \text{FixedCostAbsorption})$$

---

## 4. Stage 3: RFQ Quoting & Margin Strategies

During the RFQ submission phase (Step 2), vendors select their target profit margin position:

$$\text{TargetBidPrice} = \text{Round}\big(\text{FLC} \times (1 + \text{TargetProfitMargin})\big)$$

$$\text{QuotedMarginPct} = \frac{\text{QuotedPrice} - \text{FLC}}{\text{QuotedPrice}} \times 100$$

### Standard Pricing Tiers:
| Tier | Strategy | Target Margin ($\%$) | Bid Price Multiplier |
|:---:|:---|:---:|:---|
| 1 | High Margin | $\approx +25\%$ | $1.33 \times \text{FLC}$ |
| 2 | Target Standard | $\approx +18\%$ | $1.22 \times \text{FLC}$ |
| 3 | Balanced | $\approx +12\%$ | $1.14 \times \text{FLC}$ |
| 4 | Aggressive | $\approx +6\%$ | $1.06 \times \text{FLC}$ |
| 5 | Price Blitz | $\approx +2\%$ | $1.02 \times \text{FLC}$ |

### Loss-Leader Safeguard:
$$\text{IsLossLeader} \iff \text{QuotedPrice} < (0.70 \times \text{FLC})$$

---

## 5. Stage 4: Live Reverse Auction Floor Calculations

On the live auction floor, suppliers counter-bid downwards. Bids must decrease by at least the minimum step increment:

### 5.1 Dynamic Step Increments
$$\text{Step}_1 = \max(1\,000, \text{Round}(\text{BudgetCeiling} \times 0.01))$$
$$\text{Step}_2 = \max(2\,500, \text{Round}(\text{BudgetCeiling} \times 0.025))$$
$$\text{Step}_3 = \max(5\,000, \text{Round}(\text{BudgetCeiling} \times 0.05))$$

### 5.2 Real-Time Margin Tracking
At any live price point $P$:
$$\text{OperatingProfit}(P) = P - \text{FLC}$$
$$\text{LiveMarginPct}(P) = \left(\frac{P - \text{FLC}}{P}\right) \times 100$$
$$\text{ProjectedTax}(P) = \max\big(0, \text{OperatingProfit}(P) \times \text{TaxRate}\big)$$
$$\text{ProjectedNetRealizedProfit}(P) = \text{OperatingProfit}(P) - \text{ProjectedTax}(P) - \text{₹}15\,000$$

---

## 6. Stage 5: Post-Auction Delivery Settlement & GAAP P&L

When the auction closes, the final contract award price $P_{\text{award}}$ is locked.

### 6.1 Settlement for Non-Winning Vendors
Vendors who are outbid incur the mandatory bid preparation cost:
$$\text{ContractWon} = \text{false}$$
$$\text{RealizedProfit} = -\text{SunkBidPrepCost} = -\text{₹}15\,000$$
$$\text{RiskAdjustedProfit} = -\text{₹}15\,000$$
$$\text{RealizedMarginPct} = 0\%$$

### 6.2 Settlement for the Winning Vendor
$$\text{ContractRevenue} = P_{\text{award}}$$
$$\text{ActualDeliveryCost} = \text{FLC} + \text{EventCostDelta}$$
$$\text{GrossOperatingProfit} = \text{ContractRevenue} - \text{ActualDeliveryCost}$$
$$\text{CorporateTax} = \begin{cases} \text{Round}(\text{GrossOperatingProfit} \times \text{TaxRate}), & \text{if GrossOperatingProfit} > 0 \\ 0, & \text{otherwise} \end{cases}$$
$$\text{NetRealizedProfit} = \text{GrossOperatingProfit} - \text{CorporateTax} - \text{SunkBidPrepCost}~(\text{₹}15\,000)$$

### 6.3 Margin Variance Reconciliation
$$\text{QuotedMarginPct} = \left(\frac{P_{\text{quote}} - \text{FLC}}{P_{\text{quote}}}\right) \times 100$$
$$\text{RealizedMarginPct} = \left(\frac{\text{GrossOperatingProfit}}{P_{\text{award}}}\right) \times 100$$
$$\text{MarginVariancePts} = \text{RealizedMarginPct} - \text{QuotedMarginPct}$$

---

## 7. Stage 6: Risk-Adjusted Profit (RAP) & Tournament Scoring

To discourage wild undercutting and penalize margin volatility:

### 7.1 Volatility Penalty
$$\text{MarginDiffDecimal} = \frac{|\text{MarginVariancePts}|}{100}$$
$$\text{VolatilityPenalty} = \min\big(0.40, \text{MarginDiffDecimal} \times 0.5\big)$$

### 7.2 Risk-Adjusted Profit (RAP)
$$\text{RAP} = \text{Round}\big(\text{NetRealizedProfit} \times (1 - \text{VolatilityPenalty})\big)$$

### 7.3 Composite Championship Scoring
$$\text{TotalScore} = \text{BankedProfit} + (\text{ContractsWon} \times 1\,000) + (\text{TotalRAP} \times 0.20) - \text{Penalties}$$

---

## 8. Comprehensive End-to-End Worked Numerical Example

*(Based on standard Industrial Manufacturing Scenario)*

### Input Parameters:
- **RFQ Ceiling Budget:** ₹5,00,000
- **Corporate Tax Rate:** $20\%$
- **Sunk Bid Preparation Fee:** ₹15,000
- **Vendor Strategy Profile:** 3★ Quality, 3★ Speed, 3★ Cost Efficiency

### Step 1: Baseline FLC Calculation
- Direct Labor: ₹1,10,000
- Direct Materials: ₹1,40,000
- Direct Logistics: ₹20,000
- **Direct Cost Subtotal:** ₹2,70,000
- Overhead ($10\%$): ₹27,000
- Financing ($4\%$ on 45 days): ₹1,331
- Risk Contingency ($5\%$): ₹13,500
- Fixed Cost Absorption: ₹8,415
- **Fully Loaded Cost (FLC):** **₹3,20,246**

---

### Step 2: RFQ Initial Quote Submission
- Chosen Tier: Tier 2 (Target $\approx 26.3\%$ margin)
- **Initial Quoted Price ($P_{\text{quote}}$):** **₹4,93,426**
- **Quoted Margin:** 
  $$\text{QuotedMarginPct} = \frac{4,93,426 - 3,20,246}{4,93,426} = 35.1\%$$

---

### Step 3: Live Reverse Auction Counter-Bidding
- Initial Floor Price: ₹4,93,426
- Competitors bid down aggressively across 3 rounds.
- Player places final winning counter-bid.
- **Auction Closes / Award Price ($P_{\text{award}}$):** **₹4,34,620**

---

### Step 4: Post-Auction GAAP Income Statement Settlement
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

### Step 5: Margin Variance & Risk Analysis
- **Quoted Margin (at Bid Time):** $35.1\%$
- **Realized Actual Margin:** 
  $$\text{RealizedMarginPct} = \frac{1,14,374}{4,34,620} \times 100 = 26.3\%$$
- **Net Realized Banked Profit:** **₹76,499**
- **Risk-Adjusted Profit (RAP):** **₹76,499**
- **Reputation:** $100/100$ (Awarded $+5$ win boost)

---

## 9. Code Reference Map

| Component | File Path | Key Functions |
|---|---|---|
| **FLC & Cost Waterfall** | `src/engine/costCalculator.ts` | `calculateCostBreakdown()`, `calculateExpectedValue()` |
| **P&L & GAAP Settlement** | `src/engine/pnlEngine.ts` | `settleContractPnL()`, `calculateTotalScore()` |
| **Quote Builder UI** | `src/components/QuoteBuilder.tsx` | Margin tier calculations, live GAAP preview |
| **Live Auction Engine** | `src/components/AuctionArena.tsx` | Real-time margin ticker, counter-bid steps |
| **Settlement Display** | `src/components/PnLBreakdown.tsx` | Financial waterfall presentation |
