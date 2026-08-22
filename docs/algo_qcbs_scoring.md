# Quality & Cost-Based Selection (QCBS) Algorithm

**Location in Codebase:** `src/engine/buyerScoring.ts` and `src/components/RfqBuilder.tsx`  
**Version:** 1.2 (updated with 100% Proportional Auto-Balancing Weights)

## Changelog from v1.1

| Change | Reason |
|---|---|
| **Strict 100% Evaluation Weights Auto-Balancing** | In `RfqBuilder.tsx`, the 5 active criteria weights (`price`, `quality`, `timeline`, `reputation`, `risk`) are strictly maintained at exact `100%` (1.0) sum via proportional auto-balancing when any slider is moved. |
| **All Currencies Standardized to INR (₹)** | Aligned with the entire game system UI and mathematical formatting. |

---

The QCBS algorithm is the core mechanism the AI Buyer uses to evaluate and rank vendor quotes. It simulates real-world public and enterprise procurement standards by weighing price against multiple qualitative factors.

## 1. Compliance Gate Check

Before any scoring occurs, the quote must pass a strict binary gate check.

- **Mechanism:** The engine checks if the quote's `complianceChecked` array contains all certificates listed in `rfq.requiredCompliance`.
- **Result:** If any are missing, the quote is immediately disqualified and assigned a `totalWeightedScore` of 0.

## 2. Parameter Normalization & Scoring

Each component is scored on a normalized scale from `0.0` to `1.0`.

### A. Price Score (Inverse Ratio)
- **Formula:** `minPrice / quote.price`
- **Logic:** The lowest submitted price receives a perfect score of 1.0.

### B. Quality & SLA Score
- **Base Quality:** `(player.qualityLevel / 5.0)` *(derived from player's allocated strategy points)*
- **SLA Bonus:** Premium SLA adds `+0.15`, Standard adds `+0.05`.
- **Logic:** Capped at a maximum of `1.0`.

### C. Timeline Score
- **On-time baseline:** delivering exactly on the RFQ's required days scores `0.85`.
- **Formula:**
  - If faster than required: `0.85 + (RequiredDays - QuotedDays) * 0.03` (Capped at 1.0)
  - If on time: `0.85`
  - If slower than required: `0.85 - (QuotedDays - RequiredDays) * 0.06` (Floored at 0.0)

### D. Risk Adequacy Score
- **Result:** If the vendor quotes a buffer $\ge$ their underlying need, they score `1.0`. If they under-quote to artificially lower their price, they score `0.65`.

### E. Reputation Score
- **Formula:** `player.reputationScore / 100.0` (0.0 to 1.0).

---

## 3. Total Weighted Score Calculation

The normalized scores are multiplied by the specific RFQ's weightings (which sum to 1.0):

```javascript
Total Score =
  (PriceWeight * PriceScore) +
  (QualityWeight * QualityScore) +
  (TimelineWeight * TimelineScore) +
  (ReputationWeight * ReputationScore) +
  (RiskWeight * RiskAdequacyScore) +
  (PaymentTermsWeight * PaymentTermsScore)
```

The vendor with the highest `Total Score` who passed the compliance gate wins the contract.
