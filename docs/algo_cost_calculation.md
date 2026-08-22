# Cost Calculation & P&L Settlement Algorithm

**Locations in Codebase:** `src/engine/costCalculator.ts` and `src/engine/pnlEngine.ts`  
**Version:** 1.2 (updated with 10-Point Strategy Multipliers & Direct P&L Settlement)

## Changelog from v1.1

| Change | Reason |
|---|---|
| **Company Strategy Multipliers Added** | Integrated the 10-point player strategy allocations (`costEfficiency`, `qualityLevel`, `speedLevel`) directly into direct labor, material, and logistics cost waterfalls. |
| **Direct P&L Settlement (No Random Event Shock)** | Settle contracts immediately at the final auction price, deducting Bid Preparation Cost and tax to calculate Realized Profit directly. |
| **All Currencies Standardized to INR (₹)** | Aligned with the entire game system UI and mathematical formatting. |

---

This algorithm handles the financial simulation of the game, translating base RFQ units and company strategy allocations into Fully Loaded Costs (FLC) and ultimately settling the Profit and Loss (P&L).

## 1. Company Strategy Profile Multipliers (§3.0)

Every human player and AI bot allocates **10 Strategy Points** across three pillars:

- **Cost Efficiency Multiplier:**  
  `EffMultiplier = 1 - ((CostEfficiency - 3) * 0.10)`  
  *5-star efficiency reduces direct costs by 20%; 1-star increases costs by 20%.*

- **Quality Level Multiplier:**  
  `QualityCostMultiplier = 1 + ((QualityLevel - 3) * 0.08)`  
  *5-star quality adds +16% to labor and material costs; 1-star reduces costs by 16%.*

- **Delivery Speed Multiplier:**  
  `SpeedCostMultiplier = 1 + ((SpeedLevel - 3) * 0.05)`  
  *5-star speed adds +10% to logistics costs; 1-star reduces logistics costs by 10%.*

---

## 2. Fully Loaded Cost (FLC) Waterfall

The cost breakdown follows a strict accounting waterfall:

1. **Direct Costs:**
   - `DirectLabor = RFQ Base Hours * RFQ Labor Rate * Labor Index * EffMultiplier * QualityCostMultiplier`
   - `DirectMaterials = RFQ Base Qty * Unit Material Cost * Materials Index * EffMultiplier * QualityCostMultiplier`
   - `DirectLogistics = RFQ Logistics Units * Logistics Unit Cost * Logistics Index * EffMultiplier * SpeedCostMultiplier`
   - `Direct Cost Subtotal = DirectLabor + DirectMaterials + DirectLogistics`

2. **Overhead Allocation:** `Direct Subtotal * Vendor Overhead Rate`
3. **Financing Cost:** `(Direct Subtotal * Vendor Financing Rate) * (RFQ Payment Delay Days / 365)`
4. **Risk Contingency:** `Direct Subtotal * Quoted Risk %`
5. **Fixed Cost Absorption:** `Vendor Fixed Costs / Vendor Capacity`

**Fully Loaded Cost (FLC)** = Sum of Direct Subtotal + Overhead + Financing + Risk Contingency + Fixed Absorption.

**Loss-Leader Flag:** If Quoted Price < 70% of FLC, the bid is flagged as a loss-leader.

---

## 3. P&L Settlement Engine

When an auction concludes, the engine calculates actual financials directly.

### Bid Preparation Cost Deduction
- **Submitted Quote:** Flat `₹15,000` (`BidPrepCost`), charged upon quote submission.

### Direct Settlement (For the Winning Vendor)
1. **Actual Delivery Cost:** Baseline FLC (as quoted).
2. **Operating Profit:** `Final Auction Price - Actual Delivery Cost`
3. **Tax:** `20% of Operating Profit` (only if $> 0$)
4. **Realized Profit:** `Operating Profit - Tax - BidPrepCost`
5. **Persistent Reputation Update:**
   - Contract Win: `+5` base reputation.
   - Profitable Execution: `+10` reputation boost.
   - Severe Loss / Underpricing: `-20` reputation penalty.
