# Vendor Bidding & Auction Simulator
### Game Design Document (GDD) — v1.0

---

## 0. Game Vision

**"Win the deal. Don't lose the shirt."**

A 10-player, round-based multiplayer simulation where each player runs a vendor company competing for contracts against real buyer requirements and rival bidders. Every round forces the same core tension procurement and sales professionals live with every day: **the lowest bid wins more often, but the profitable bid pays the rent.** Players build detailed commercial quotes (not single numbers), survive dynamic market shocks, manage reputation across rounds, and get scored on a blended metric of contracts won, margin banked, and risk avoided.

It plays like a hybrid of a strategy board game (Power Grid–style economics), a bluffing game (Diplomacy-style information asymmetry), and a business simulator (a lightweight SimCity for B2B sales). Sessions run 45–90 minutes for a 5-round game night, with enough depth (11 cost variables, 3 auction formats, 8 industries, 12 event types) to remain interesting after dozens of plays, and enough abstraction (all formulas are closed-form, no hidden dice beyond declared randomness) that it can double as a genuine teaching tool for pricing, negotiation, and procurement strategy in a classroom or corporate training setting.

**Design pillars:**
1. **Two axes, one seat** — every decision trades off Win Probability vs. Profit Margin. There is no dominant strategy.
2. **Legible math, illegible opponents** — the formulas are fully knowable; what your rivals will do with them is not.
3. **Losing well is a skill** — walking away from a bad deal, or winning a deal you then lose money on, are both explicit, trackable outcomes.
4. **Every round teaches something real** — the mechanics map onto actual procurement concepts (TCO, risk contingency, information asymmetry, RFQ evaluation) closely enough to transfer.

---

## 1. Core Game Concept

### 1.1 Players & Roles

| Role | Count | Description |
|---|---|---|
| **Vendor (Player)** | 3–10 | Controls a company bidding on contracts. Sets prices, allocates capacity, manages reputation. |
| **Buyer (AI or Game Master)** | 1 per contract | Issues RFQs, sets evaluation weights, awards contracts. Can be fully automated (AI Buyer Engine) or human-run for classroom play. |
| **AI Competitors** | 0–4 (fills empty seats) | Bot vendors with configurable personality (Aggressive, Conservative, Opportunist, Copycat) so games under 10 humans stay full-tension. |

### 1.2 Win Conditions

The game is **not** won by winning the most contracts. Final ranking is by **Total Score** (§1.4) after N rounds (default: 6 rounds = one "fiscal year," 1 contract auctioned per round, occasionally 2 parallel contracts in later rounds to force capacity-allocation decisions).

Secondary/optional win conditions (selectable at game setup):
- **Profit Race** — highest cumulative banked profit wins, contracts-won is a tiebreaker only.
- **Market Domination** — most contracts won by round 6, profit is a tiebreaker (rewards aggressive underbidding — deliberately a "trap" mode for teaching why revenue share ≠ business health).
- **Survival** — any vendor whose cash balance goes negative (from bad contracts + fixed costs) is eliminated; last vendor standing wins.

### 1.3 Game Loop (per round)

```
1. RFQ RELEASE      Buyer publishes contract requirements (public info)
2. INTEL PHASE      Players may spend "Intel Points" to buy partial info on rivals
3. QUOTE BUILDING   Players privately construct full commercial quotes
4. AUCTION EVENT    One of English / Dutch / Japanese format resolves bids
5. EVALUATION       Buyer scoring engine ranks quotes on multi-criteria weights
6. AWARD            Contract awarded; winner locks in price, loser(s) get no revenue
7. EVENT RESOLUTION Dynamic event card(s) drawn, applied to active contracts
8. DELIVERY & P&L   Winner "delivers" — actual costs vs. quoted costs settle, profit banked
9. REPUTATION UPDATE Win/deliver-well = reputation up; underdeliver/over-quote = reputation down
10. NEXT ROUND
```

### 1.4 Scoring System

**Total Score** = weighted composite, visible on the live leaderboard:

```
Total Score = (Realized Profit × 1.0)
            + (Contracts Won × 50)
            + (Reputation Index × 20)
            + (Risk-Adjusted Bonus)
            − (Penalty Events × Severity)
```

Where:
- **Realized Profit** — actual banked profit after delivery, in game currency (see §3).
- **Contracts Won** — flat per-contract bonus, deliberately small relative to profit so "winning everything" isn't automatically optimal.
- **Reputation Index (0–100)** — decays/grows based on delivery quality, on-time %, and honesty in negotiation (see §9.3).
- **Risk-Adjusted Bonus** — reward for winning at healthy margin under uncertainty (see §12 formulas).
- **Penalty Events** — missed deadlines, quality failures, contract default.

### 1.5 Rounds & Session Structure

| Session length | Rounds | Contracts | Typical use case |
|---|---|---|---|
| Quick (30 min) | 3 | 3 | Icebreaker / demo |
| Standard (60–90 min) | 6 | 6–8 (parallel contracts from round 4) | Game night / classroom |
| Campaign (multi-session) | 12 | 15+ | Corporate training cohort, persistent economy |

### 1.6 Multiplayer Mechanics

- **Simultaneous private quoting** with a synchronized countdown timer (default 3 minutes) — all players submit blind, server reveals per auction-format rules.
- **Real-time lobby** (WebSocket-based) supports 3–10 human players; empty seats auto-fill with AI Competitors.
- **Asynchronous mode**: for classroom/corporate use, rounds can be untimed and resolved once all quotes are in, enabling play across days.
- **Spectator mode** for eliminated players (Survival mode) or observers (training use case).

---

## 2. Auction Modes

All three formats can be assigned per-contract by the Buyer/GM — a single game session typically uses all three across its rounds so players experience each strategic regime.

| Auction Type | Mechanic | Info Revealed | Time Pressure | Strategic Skill Rewarded |
|---|---|---|---|---|
| **English (Ascending)** | Open, real-time. Price *rises* from a floor; vendors are quoting **discount/value-add**, not price alone (see 2.1) — actually structured as reverse-English since buyers want low price, see below. | Full — every active bid visible | High, continuous | Nerve, bluffing on cost floor, reading rivals' hesitation |
| **Dutch (Descending)** | Buyer announces a **high** starting price that ticks down on a timer. First vendor to "buzz in" and accept wins instantly. | Low — no visibility into rivals' thresholds | Extreme, single decision-point | Knowing your own walk-away price cold; no do-overs |
| **Japanese (Ascending, Simultaneous-Exit)** | Buyer calls out price levels; **all** vendors hold a button while still "in"; releasing = exiting permanently and irrevocably. Last one holding wins, pays the last confirmed level, or second-to-last depending on ruleset (configurable). | Medium — you see *who* is still in, not their true floor | Medium, paced by caller | Endurance, reading rival exits, avoiding the "winner's curse" |

### 2.1 English (Reverse) Auction — Detailed

Since buyers want the **lowest** price (unlike a traditional English auction of an asset), this is a *reverse* English auction:
- Buyer sets a **ceiling price** (public, from the RFQ budget).
- Vendors submit **decreasing** bids in real time; each new bid must beat the current best by a minimum decrement (e.g. 0.5% of contract value).
- Auction closes after a countdown resets each time a new best bid lands (classic "soft close," 30 seconds, prevents sniping).
- **Strategy**: vendors with strong cost structure (low variable costs) can afford to chase price down; vendors relying on quality/reputation differentiation may deliberately exit early rather than race to their cost floor, since price is *usually* weighted 40-60% of the buyer's score, not 100% (see §5).

### 2.2 Dutch (Reverse) Auction — Detailed

- Buyer starts the price at a high **anchor** (e.g. 130% of budget) and it ticks down every 5 seconds by a fixed decrement.
- Any vendor may hit "ACCEPT" at any moment; the **first** to accept wins at that exact price. No negotiation, no second chances.
- Because there's no visibility into what others will accept, vendors face a pure **optimal-stopping problem**: accept too early → leave margin on the table; wait too long → a rival snipes the deal.
- **Strategy**: this format rewards vendors who've pre-computed their walk-away price and commit to a *personal* decision rule (e.g., "I accept the instant price crosses my target margin threshold") rather than reacting emotionally.

### 2.3 Japanese Auction — Detailed

- Buyer (or auto-caller) announces price levels descending in fixed steps (e.g., every 3 seconds, price drops 2%).
- All vendors start "in" (holding a button/toggle). Exiting is public and **irrevocable** — you cannot re-enter.
- When only one vendor remains, they win at the **last price where two or more vendors were still in** (classic Japanese/English-clock auction rule — this removes the "winner's curse" spike English auctions can produce, since you never overpay relative to the second-best competitor).
- **Strategy**: rewards patience and reading the room — watching who exits early telegraphs their true cost floor. Configurable variant: winner pays their *own* last price instead of the second-place price, for a harsher/more classic feel.

---

## 3. Vendor Economics (Player Company Profile)

Each player is dealt (or builds via a company-creation screen) a **Company Profile** at game start. Profiles are asymmetric by design — no two players should have identical economics, which is itself a core teaching point (cost structure determines viable strategy).

| Variable | Description | Example Range | Public / Private |
|---|---|---|---|
| **Fixed Costs (FC)** | Per-round overhead regardless of contracts won (rent, salaried staff, admin) | 8,000–25,000 | Private |
| **Variable Cost Rate (VC%)** | % of contract value spent on direct delivery cost baseline | 45–70% | Private |
| **Labor Cost Index** | Multiplier on labor-heavy contract line items | 0.8–1.3 | Private |
| **Materials Cost Index** | Multiplier on materials-heavy line items, sensitive to inflation events | 0.8–1.3 | Private |
| **Logistics Cost Index** | Multiplier on delivery/shipping-heavy line items | 0.7–1.4 | Private |
| **Overhead Rate** | % applied on top of direct costs for indirect allocation | 8–18% | Private |
| **Tax Rate** | Applied to realized profit at delivery | 15–30% (region-dependent) | Public (regional) |
| **Financing Cost Rate** | Cost of capital if project requires upfront spend before payment milestone | 4–12% APR | Private |
| **Risk Contingency Need** | Recommended buffer % given the vendor's own risk profile | 3–15% | Private (calculated, shown as advisory) |
| **Capacity (units/round)** | Max simultaneous project "load" — bidding beyond capacity triggers penalties | 1–3 contracts/round | Public |
| **Reputation Score (0–100)** | Starts at 50–70, moves with delivery history | dynamic | Public |
| **Quality Level (1–5)** | Fixed trait, affects buyer scoring and defect probability | 1–5 | Public |
| **Delivery Capability (days)** | Base fulfillment time; can be compressed at cost (rush fees) | scenario-dependent | Public |
| **Target Profit Margin** | Player-set internal goal, not shown to rivals | player-chosen | Private |

### 3.1 Cost Build-Up Formula (per quote)

```
Direct Labor Cost      = Base_Labor_Hours × Labor_Rate × Labor_Cost_Index
Direct Materials Cost   = Base_Materials_Qty × Unit_Material_Cost × Materials_Cost_Index
Direct Logistics Cost   = Base_Logistics_Units × Logistics_Unit_Cost × Logistics_Cost_Index
─────────────────────────────────────────────────────────────
Direct Cost Subtotal    = Direct Labor + Direct Materials + Direct Logistics

Overhead Allocation     = Direct Cost Subtotal × Overhead_Rate
Financing Cost          = (Direct Cost Subtotal × Financing_Cost_Rate) × (Payment_Delay_Days / 365)
Risk Contingency        = Direct Cost Subtotal × Risk_Contingency_Need

─────────────────────────────────────────────────────────────
Total Delivery Cost (TDC) = Direct Cost Subtotal + Overhead Allocation
                            + Financing Cost + Risk Contingency

Fixed Cost Absorption   = Fixed_Costs / Vendor_Capacity   [allocated per active contract slot]

Fully Loaded Cost (FLC) = TDC + Fixed Cost Absorption
```

### 3.2 Bid Price & Margin Formula

```
Target Bid Price = FLC × (1 + Target_Profit_Margin)

Quoted Margin %  = (Quoted_Price − FLC) / Quoted_Price

Actual Profit    = Quoted_Price − Actual_Delivery_Cost − Tax
                    (Actual_Delivery_Cost may diverge from FLC due to Dynamic Events, §7)

Tax               = max(0, (Quoted_Price − Actual_Delivery_Cost)) × Tax_Rate
```

---

## 4. Quotation & Bidding System

Players do **not** submit a single number. Each quote is a structured commercial document built across a form UI, with every field feeding the buyer's evaluation engine (§5) and the vendor's own margin calculation (§3).

**Quote fields:**

| Field | Type | Notes |
|---|---|---|
| Total Price | Number | Auto-calculated floor from FLC, but freely overridable up/down |
| Payment Terms | Selectable (Net-30 / Net-60 / Milestone / Upfront-20%) | Affects buyer's cash-flow scoring and vendor's financing cost |
| Delivery Timeline | Number (days) | Faster = rush-fee cost increase, but scores higher on buyer's timeline weight |
| Warranty Period | Selectable (0 / 6 / 12 / 24 months) | Increases risk contingency need, increases buyer score |
| Technical Compliance Statement | Checklist against RFQ spec | Non-compliance = auto-penalty or disqualification |
| Service Level Agreement (SLA) | Selectable tier (Basic/Standard/Premium) | Cost vs. score trade-off |
| Sustainability Declaration | Selectable (Standard / Certified Green, +cost) | Scores on ESG-weighted contracts |
| Risk Disclosure | Optional free-text/checklist | Honesty here affects reputation; hidden risks that later surface as events tank reputation harder |

**Quote Validity Rule:** Total Price must be ≥ 0.7 × FLC (a soft floor representing "no realistic vendor bids below cost at scale") — bids below this trigger a **Loss-Leader Flag**, visible to the buyer (unless the vendor spends an Intel Point to obscure it), representing real-world buyer suspicion of unsustainably low bids ("if it's too good to be true...").

---

## 5. Buyer Evaluation Criteria

Every RFQ specifies **evaluation weights**, randomized within realistic bands per industry (see §6), and made **public** at RFQ release so vendors can tailor quotes — this is the primary lever for making "lowest price doesn't always win" true and legible.

| Criterion | Typical Weight Range | Scored From |
|---|---|---|
| Price | 25–45% | Inverse-normalized against all bids in the pool |
| Quality Level | 10–20% | Vendor's fixed Quality trait + quote's SLA tier |
| Delivery Timeline | 10–20% | Quoted days vs. RFQ's required/desired timeline |
| Technical Compliance | 5–15% (pass/fail gate below a threshold) | Checklist match rate |
| Vendor Reputation | 10–15% | Live Reputation Score |
| Risk Profile | 5–10% | Contingency adequacy + risk disclosure honesty |
| Payment Terms | 5–10% | Buyer's cash-flow preference (varies by scenario) |
| Warranty / Service Level | 5–10% | Selected tier |
| Sustainability | 0–10% (higher in Energy/Government scenarios) | Declaration + certification |

### 5.1 Buyer Scoring Formula

```
Normalized_Price_Score(i) = 1 − (Price_i − Min_Price) / (Max_Price − Min_Price)

Criterion_Score(i,c) = vendor's raw performance on criterion c, normalized 0–1
                       across all bidders in the pool

Weighted_Total(i) = Σ [ Weight_c × Criterion_Score(i,c) ]   for all c

Winner = argmax(Weighted_Total)  subject to passing all pass/fail gates
         (e.g. minimum Technical Compliance threshold)
```

---

## 6. Industry Scenarios

Each scenario reskins the cost model, risk deck, and buyer weight bands — same engine, different economics, so replayability comes from genuinely different optimal strategies per industry.

| Scenario | Cost Structure Emphasis | Dominant Risk | Typical Buyer Price Weight | Distinct Mechanic |
|---|---|---|---|---|
| **Construction** | Materials + Labor heavy (60%+ direct) | Weather delays, materials inflation | 30% | Site inspection event can force spec change mid-project |
| **IT / Software** | Labor-dominant, near-zero materials | Scope creep, technical debt | 25% | "Sprint velocity" delivery-timeline sub-mechanic; compliance = security certs |
| **Manufacturing** | Materials + Logistics heavy | Supply-chain disruption, defect rate | 35% | Capacity constraint most binding here — real production-line limits |
| **Logistics** | Logistics + Fuel/Financing heavy | Fuel price shocks, route disruption | 40% | Route-based cost variance; delivery timeline is the dominant score driver |
| **Consulting** | Pure labor, high margin ceiling | Reputation-driven repeat business | 20% | Reputation weight highest of all scenarios (up to 25%) |
| **Healthcare** | Compliance-cost heavy, high overhead | Regulatory non-compliance = disqualification | 20% | Hard compliance gate — fail it, auto-eliminated regardless of price |
| **Energy** | Capital-intensive, financing-cost heavy | Commodity price shocks, long delivery windows | 25% | Sustainability weight highest (up to 15%); multi-round delivery (2-round contracts) |
| **Government Procurement** | Bureaucratic overhead, strict compliance | Budget cuts mid-cycle, audit risk | 35%, but heavily gated | Formal RFP process — technical compliance is pass/fail before price is even considered; lowest transparency into buyer's true weights (deliberately, mirrors real public tenders) |

---

## 7. Dynamic Events

Drawn from an "Event Deck" after each award — some apply to the winning contract only, some hit the whole market. Designed to test whether a vendor's quoted risk contingency (§3.1) was realistic.

| Event | Trigger Timing | Effect | Which Scenarios Hit Hardest |
|---|---|---|---|
| **Supply-Chain Disruption** | Post-award | Materials Cost Index +15–40% for delivery | Manufacturing, Construction |
| **Inflation Spike** | Any round | All Cost Indices +5–10% market-wide for remaining rounds | All, esp. Logistics/Energy |
| **Competitor Intelligence Leak** | Pre-quote | One rival's cost structure partially revealed to all | Any (meta-event) |
| **Client Budget Cut** | Post-award | Contract value renegotiated down 10–20%; vendor may refuse (reputation hit) or accept (margin hit) | Government, Healthcare |
| **Specification Change** | Mid-delivery | Rework cost added; if uncontracted for change orders, absorbed by vendor | Construction, IT |
| **Deadline Pressure** | Mid-delivery | Buyer requests compression; rush-fee opportunity or penalty if declined | Logistics, IT |
| **Contractual Penalty Trigger** | Delivery | Late/non-compliant delivery triggers pre-agreed penalty clause | All |
| **Hidden Cost Discovery** | Post-award | A cost the vendor didn't contingency for surfaces (tests Risk Contingency adequacy) | Construction, Energy |
| **Capacity Constraint Shock** | Pre-quote | Vendor's Capacity temporarily reduced (illness, equipment failure) | Manufacturing, Logistics |
| **Economic Shock (Macro)** | Any round | Market-wide demand shift — buyer budgets rise or fall for remaining rounds | All (rare, high-impact) |
| **Reputation Windfall** | Post-delivery | Excellent delivery triggers referral — bonus Intel Points or a bye on next RFQ's compliance gate | All |
| **Currency/Financing Shock** | Any round | Financing Cost Rate spikes for vendors relying on Milestone/Upfront terms | Energy, Government |

---

## 8. Information Asymmetry

The strategic core of the game is *what you know vs. what you can only estimate*.

| Information | Visibility | Strategic Implication |
|---|---|---|
| RFQ requirements & evaluation weight **ranges** | Public | Everyone quotes against the same target, but weight ranges (not exact values) preserve some evaluation uncertainty |
| Buyer's exact internal weights | Hidden (only ranges shown) | Forces vendors to hedge across criteria rather than min-max one axis |
| Vendor's own cost structure | Private (own only) | Full self-knowledge is the baseline — the game never hides your own math |
| Rival vendors' cost structures | Private, purchasable via Intel Points | Creates a market for information; spend resources to reduce uncertainty about rivals |
| Rival's submitted bid (during auction) | Format-dependent (§2) — full in English, none in Dutch, partial ("still in/out") in Japanese | This is the single biggest strategic lever differentiating the three auction formats |
| Dynamic Event deck contents | Public (deck composition known), draw order hidden | Players can risk-plan probabilistically even without knowing the exact next event — mirrors real actuarial thinking |
| Own Reputation Score | Public to self and all others | No hidden reputation — public accountability is a deliberate design choice, unlike hidden costs |
| Rival's Reputation history detail (win/loss/delivery record) | Public | Enables "reading" a rival's pattern (e.g., always underbids then fails delivery) |

**Intel Points** are earned each round (flat rate + bonus for reputation) and spent to: partially reveal a rival's cost index, see one hidden RFQ evaluation weight precisely, or obscure your own Loss-Leader Flag (§4). This creates a genuine economy around information itself.

---

## 9. Negotiation, Bluffing, Reputation, AI, Alliances

### 9.1 Negotiation Layer (optional advanced module)

After buyer evaluation but before final award, the **top 2 bidders** (by Weighted_Total, §5.1) enter a **best-and-final round**: a single sealed resubmission with one variable adjustable (price, timeline, or warranty — buyer's choice which lever is open). This mirrors real-world BAFO (Best And Final Offer) procurement rounds and adds a second layer of bluffing on top of the initial auction.

### 9.2 Bluffing & Market Positioning

- **Loss-Leader Flag** (§4) and **Risk Disclosure honesty** are the two main bluffing surfaces — a vendor can under-disclose risk to look stronger, but Dynamic Events (§7) probabilistically expose under-contingencied bids, and getting "caught" tanks reputation harder than an honest loss.
- **Japanese auction exits** are public signals — a savvy player can bluff by staying "in" past their real comfort zone to induce a rival to exit early (classic auction theory chicken game), risking overpaying if the bluff fails.

### 9.3 Reputation System

```
Reputation Δ per contract =
    + 8   (delivered on-time, on-spec, within contingency)
    + 3   (won contract, regardless of delivery quality — participation signal)
    − 5   (delivered late or over-cost beyond contingency)
    − 12  (contract default / walked away post-award)
    − 15  (caught misrepresenting Risk Disclosure via a triggered Hidden Cost event)
    + 5   (delivered under-budget/early without cutting compliance)

Reputation clamped to [0, 100]; decays 1 pt/round toward 50 if a vendor sits idle
(mild pressure against pure risk-avoidance turtling)
```

Reputation feeds directly into buyer scoring (§5) at 10–15% weight, and into eligibility gates for some Government/Healthcare RFQs (minimum Reputation 40 to even bid).

### 9.4 AI Competitors

Four selectable AI personalities, each a distinct heuristic bidding function (not full game-theoretic solvers — deliberately readable/learnable by human players over a session):

| Personality | Bidding Heuristic |
|---|---|
| **Aggressive** | Bids toward FLC × 1.05 (thin margin), prioritizes Contracts Won |
| **Conservative** | Bids toward FLC × 1.25, prioritizes Realized Profit and high Risk Contingency |
| **Opportunist** | Adjusts margin target based on live Intel on rivals — bids just under the estimated 2nd-lowest rival |
| **Copycat** | Mirrors the human player with the highest current Reputation from the prior round |

### 9.5 Alliances (Advanced/Optional Module)

For scenarios explicitly modeling **consortium bidding** (Government, Energy — large contracts exceeding any single vendor's Capacity): 2+ players may form a declared **Joint Venture** for a single RFQ, pooling Capacity and splitting both cost and profit by a pre-agreed ratio (locked in before quoting, enforced by the system, publicly visible to the buyer as a JV bid — which can itself score reputation/risk differently, e.g. lower risk score due to shared capacity, but split profit).

---

## 10. Post-Auction Profit/Loss Analysis

After every delivery phase, each vendor receives a **P&L Breakdown screen**:

```
Quoted Price                        $XXX,XXX
– Actual Delivery Cost              $XXX,XXX   (FLC ± Dynamic Event deltas)
– Tax                               $XX,XXX
= Realized Profit                   $XX,XXX

Quoted Margin (at bid time)         XX%
Realized Margin (actual)            XX%
Variance                            ± X pts     ← the core "did your risk pricing hold up" metric

Win Probability Estimate (pre-auction, shown retroactively)   XX%
Actual Outcome                       Won / Lost
Expected Value at bid time           $XX,XXX     (see §12 formula)
Risk-Adjusted Profit                 $XX,XXX
```

This screen is the primary **teaching moment** of the game — it's where players see whether their contingency assumptions, margin targets, and auction-format tactics actually paid off, independent of whether they won.

---

## 11. Progression, Dashboards, Leaderboards, Analytics, Replayability

### 11.1 Progression System

- **Company Level** (1–10) — persistent across games for a given player profile, unlocked by cumulative career profit across sessions, not single-game wins (rewards consistent sound decision-making over one lucky game).
- **Unlockable Company Traits** — at higher levels, unlock optional starting-profile perks (e.g., "Lean Ops" −10% Overhead Rate, "Trusted Partner" +10 starting Reputation) — cosmetic-adjacent, not pay-to-win, since they're earned via skill not currency.

### 11.2 Dashboards (live, in-game)

- **Market Dashboard**: all active RFQs, current auction status, public reputation leaderboard.
- **Company Dashboard**: own cost structure, capacity utilization, P&L history chart, Intel Point balance.
- **Round Recap**: what happened, who won, event resolution log.

### 11.3 Leaderboards

- Session leaderboard (Total Score, §1.4).
- Global/persistent leaderboard by Career Profit, Win Rate, and **Discipline Index** (a specific fun stat: % of contracts *walked away from* when EV was negative — rewards good judgement, not just winning).

### 11.4 Achievements (examples)

| Achievement | Condition |
|---|---|
| "Razor's Edge" | Win a contract with realized margin under 3% |
| "Walked Away" | Decline to bid on 3 RFQs in one session where the EV was calculably negative |
| "Clean Sweep" | Deliver 5 consecutive contracts with zero negative Reputation events |
| "Called the Bluff" | Correctly hold in a Japanese auction past 2 rival exits and still win under your target margin |
| "Consortium Builder" | Win a JV-bid contract (Alliance module) |

### 11.5 Analytics (for corporate training / classroom use case)

Facilitator dashboard exporting: per-player margin discipline over time, price-vs-weighted-score correlation, reputation trajectory, and a session replay log — designed so a procurement trainer can debrief a cohort with real data.

### 11.6 Difficulty Levels

| Difficulty | Adjustment |
|---|---|
| Beginner | Buyer weights fully revealed (no ranges), Event deck softened (fewer negative-EV events), formulas shown live in the quote builder |
| Standard | As described throughout this document |
| Expert | Weight ranges widened, Intel Points more expensive, AI Competitors upgraded to Opportunist/Copycat only, BAFO negotiation layer (§9.1) mandatory |

### 11.7 Replayability Levers

Randomized company profiles per session, 8 industry scenarios × 3 auction formats × 12 event types × 4 difficulty levels = thousands of practically distinct sessions; persistent Company Level progression gives a reason to return beyond novelty.

---

## 12. Formulas — Consolidated Reference

```
1. Fully Loaded Cost (FLC)
   FLC = Direct_Cost_Subtotal + Overhead + Financing_Cost + Risk_Contingency
         + (Fixed_Costs / Capacity)

2. Target Bid Price
   Bid = FLC × (1 + Target_Margin)

3. Quoted Margin
   Margin% = (Bid − FLC) / Bid

4. Win Probability Estimate (pre-auction, model-side, shown to player as a coached estimate)
   P(win) = f(Bid_relative_to_market_percentile, Reputation, Compliance_pass, format-specific factor)
   — simplified logistic form:
   P(win) = 1 / (1 + e^[ k × (Your_Weighted_Score − Estimated_Median_Rival_Score) × −1 ])
   where k is a tuned sensitivity constant (default k=6)

5. Expected Value (EV) at bid time
   EV = P(win) × Projected_Profit − (1 − P(win)) × Sunk_Bid_Prep_Cost
   (Sunk_Bid_Prep_Cost is a small flat cost representing time/resources spent quoting)

6. Risk-Adjusted Profit (post-delivery)
   RAP = Realized_Profit × (1 − Volatility_Penalty)
   Volatility_Penalty = |Realized_Margin − Quoted_Margin| × 0.5   (capped at 0.4)

7. Total Score (per §1.4)
   Score = (Realized_Profit × 1.0) + (Contracts_Won × 50)
           + (Reputation_Index × 20) + Risk_Adjusted_Bonus − Penalties

   Risk_Adjusted_Bonus = RAP × 0.3   (rewards profit that held up under uncertainty,
                                       not just profit that happened to land)
```

---

## 13. Example Game Simulations

### Example 1 — "The Race to the Bottom" (English Auction, Manufacturing)

Three players bid on a $500,000 automotive-parts manufacturing contract. Buyer weights: Price 40%, Quality 15%, Delivery 15%, Reputation 15%, Compliance 15% (gate).

- **Player A (Aggressive cost structure, low Overhead)**: FLC = $380,000. Chases price down to $410,000 (8% margin) in the English auction's closing seconds.
- **Player B (Conservative, high Quality trait)**: FLC = $420,000. Refuses to chase below $460,000 (9.5% margin), banking on Quality/Reputation weight to offset a higher price.
- **Player C (Mid-tier)**: FLC = $400,000, bids $435,000, gets squeezed out mid-auction, exits.

**Outcome**: Player A's price score (normalized) is highest, but Player B's Quality+Reputation combined edge (15%+15%=30% of total weight) narrows the gap. Weighted_Total: A = 0.81, B = 0.79 — A wins by a hair. **Then** a Supply-Chain Disruption event hits post-award: A's Materials Cost Index +25%, blowing their contingency (they'd budgeted for a standard 5% contingency, insufficient for a 25% shock). A's Realized Margin drops to −2%. **Lesson**: A won the auction but lost the deal; B's conservative bid, though it lost, would have survived the same shock intact — this is exactly the outcome the Post-Auction P&L screen is built to surface.

### Example 2 — "The Optimal Stopper" (Dutch Auction, Logistics)

A $200,000 regional freight contract, Dutch auction starting at $260,000, ticking down $4,000 every 5 seconds.

- **Player D** pre-commits (per §2.2 strategy) to accept the instant price crosses $215,000 (their FLC=$190,000 → 13% margin, their stated minimum acceptable).
- **Player E**, less disciplined, watches the price fall past their own $210,000 threshold hoping for a better margin, hesitates, and the price hits $206,000 before they finally hit accept — but Player D already took it two ticks earlier at $214,000.

**Outcome**: D wins at $214,000 (12.7% margin, close to plan). E's hesitation cost them the contract entirely — a stark demonstration of the Dutch format's core lesson: **in a descending-price auction, indecision is strictly dominated by a pre-committed rule.**

### Example 3 — "The Bluff That Worked" (Japanese Auction, Consulting)

A $150,000 strategy-consulting engagement. Japanese auction calling price levels down from $180,000 in $3,000 steps. Four players start "in."

- Players F and G exit early ($171,000 and $165,000 respectively) — their cost structures (high Labor Cost Index) can't sustain lower.
- Player H (FLC=$120,000, comfortable down to $135,000) and Player I (FLC=$140,000, uncomfortable below $155,000) are the last two.
- Player I, reading that H hasn't flinched yet, assumes H's floor is even lower than it is and exits at $156,000 rather than risk going lower and still losing.
- **H actually would have folded at $138,000** — I's read was wrong, but the bluff (H's poker face, not any hidden information) worked anyway.

**Outcome**: H wins at $156,000 (the last two-vendor price, per Japanese-auction rules) — a **30% margin**, far better than H's own walkaway point. **Lesson**: in the Japanese format, the winner is paid based on the *second-place* exit point, not their own floor — meaning reading rivals accurately (or bluffing convincingly) directly creates margin, independent of your own cost structure.

---

## 14. Feature Priority: MVP / V2 / Advanced

| Feature | MVP | V2 | Advanced |
|---|---|---|---|
| English auction format | ✅ | | |
| Dutch auction format | ✅ | | |
| Japanese auction format | | ✅ | |
| Core cost/FLC/margin engine (§3) | ✅ | | |
| Buyer evaluation scoring (§5) | ✅ (fixed weights) | Weight *ranges* + partial reveal | Fully hidden weights, only inferable via Intel |
| 1 industry scenario (e.g. Manufacturing) | ✅ | +3 scenarios | Full 8-scenario set |
| Dynamic Events | 3 basic events | Full 12-event deck | Chained/compound events, market-wide macro shocks |
| Reputation system | ✅ (simplified) | Full formula (§9.3) | Reputation-gated RFQ eligibility |
| Intel Points / information market | | ✅ | Full asymmetric info trading between players |
| AI Competitors | 1 personality (Aggressive) | All 4 personalities | Adaptive/learning AI (adjusts to observed human patterns across a session) |
| Negotiation/BAFO layer | | | ✅ |
| Alliances / JV bidding | | | ✅ |
| Leaderboards & basic dashboard | ✅ | | |
| Achievements | | ✅ | |
| Persistent Company Level progression | | ✅ | |
| Facilitator/classroom analytics export | | | ✅ |
| Multi-round/multi-session campaign mode | | | ✅ |
| Real-time WebSocket multiplayer | ✅ | | |
| Async/turn-based play mode | | ✅ | |

**Recommended MVP scope**: 3–6 players, 1 scenario, 2 auction formats (English + Dutch — the two simplest to build and to teach), 4-round game, core scoring, basic reputation, 1 AI personality to fill seats. This alone is a complete, playable, teachable product; everything else layers on top without architectural rework.

---

## 15. Recommended Architecture

### 15.1 UI Screens

1. **Lobby / Session Setup** — player count, scenario select, difficulty, round count
2. **Company Profile Reveal** — your economics, private, with a "quick tutorial" overlay for beginners
3. **RFQ Board** — active contract(s), public buyer requirements & weight ranges
4. **Intel Market** — spend Intel Points on rival info (V2+)
5. **Quote Builder** — the core interaction screen; live FLC/margin calculator as fields are filled
6. **Live Auction Screen** — format-specific (ascending ticker for English, descending ticker + big ACCEPT button for Dutch, hold-to-stay-in button + exit log for Japanese)
7. **Award & Reveal Screen** — full quote comparison across all bidders, post-award
8. **Event Resolution Screen** — dynamic event reveal + impact breakdown
9. **P&L Breakdown Screen** (§10)
10. **Round Recap / Leaderboard**
11. **Company Dashboard** (persistent, accessible any time)
12. **Facilitator/Analytics Dashboard** (separate role-gated view)

### 15.2 Multiplayer Flow

```
Host creates session → Players join lobby (WebSocket room)
   → Host configures scenario/rounds/difficulty
   → Game Server assigns Company Profiles (randomized/balanced)
   → ROUND LOOP:
       RFQ broadcast → Intel phase (timed) → Quote submission (timed, private channel per player)
       → Auction resolution (server-authoritative, format-specific state machine)
       → Evaluation (server computes, broadcasts results)
       → Event draw (server RNG, seeded+logged for replay/audit)
       → Delivery settlement (server computes P&L)
       → Broadcast round recap → next round or game end
   → Final scoring, leaderboard, persistent stats write-back
```

### 15.3 Backend Logic

- **Authoritative game server** (all cost/scoring/RNG computation server-side — never trust client for anything that affects score, to prevent cheating in a competitive multiplayer game).
- **Auction State Machine**, one implementation per format (English/Dutch/Japanese), each a discrete FSM: `OPEN → BIDDING → SOFT_CLOSE/TICK → RESOLVED`.
- **Buyer Scoring Engine**, a pure function of `(quotes[], weights) → ranked results`, unit-testable in isolation from the rest of the game loop.
- **Event Engine**: weighted random draw from a per-scenario deck, with a seeded RNG so game state is fully replayable/auditable (important for the classroom/training use case, and for anti-cheat verification).

### 15.4 Database Entities (core schema)

```
Player            (id, display_name, career_level, career_profit, discipline_index)
Session           (id, host_id, scenario, difficulty, round_count, status, rng_seed)
SessionPlayer     (session_id, player_id, company_profile_id, current_score, current_reputation)
CompanyProfile    (id, fixed_costs, variable_cost_rate, labor_index, materials_index,
                    logistics_index, overhead_rate, tax_rate, financing_rate,
                    risk_contingency_need, capacity, quality_level, delivery_capability)
RFQ               (id, session_id, round_number, scenario, requirements_json,
                    weight_ranges_json, auction_format, budget_ceiling)
Quote             (id, rfq_id, session_player_id, price, payment_terms, delivery_days,
                    warranty_months, sla_tier, sustainability_flag, compliance_json,
                    risk_disclosure_json, submitted_at)
AuctionEvent       (id, rfq_id, format, tick_log_json, winner_session_player_id,
                    final_price, resolved_at)
DynamicEvent       (id, session_id, round_number, event_type, affected_rfq_id, effect_json)
DeliveryResult     (id, rfq_id, actual_cost, realized_profit, realized_margin, tax_paid)
ReputationLog      (id, session_player_id, round_number, delta, reason)
Achievement        (id, player_id, achievement_code, unlocked_at)
```

### 15.5 Technology Architecture

| Layer | Recommendation | Rationale |
|---|---|---|
| Real-time transport | WebSocket (e.g. Socket.IO or native WS) | Needed for live auction ticking and simultaneous quote countdowns |
| Game server | Node.js/TypeScript (or Go for higher concurrency needs) | Server-authoritative state machines map cleanly to typed FSMs |
| Frontend | React + a state-sync library (e.g. Zustand/Redux) subscribed to WS events | Live-updating dashboards, quote builder, auction tickers |
| Database | PostgreSQL (relational — the schema above is heavily relational/transactional) | Strong consistency needed for scoring integrity |
| Cache/session state | Redis | Ephemeral round state, auction tick timers, pub/sub for room broadcast |
| RNG/audit | Seeded PRNG per session, logged seed + draw sequence | Enables full replay and anti-cheat verification |
| Analytics export | Server-side aggregation job → CSV/dashboard (e.g. a lightweight internal BI view) | Facilitator/classroom use case (§11.5) |
| Hosting | Any container-based platform (session-per-room horizontal scaling) | Sessions are naturally shardable — no cross-session state needed |

---

## 16. Completeness Check

| Requirement from brief | Covered in |
|---|---|
| Core concept, roles, win conditions, scoring, game loop, rounds, multiplayer | §1 |
| English auction | §2, §2.1 |
| Dutch auction | §2, §2.2 |
| Japanese auction | §2, §2.3 |
| Vendor economics (all 14 listed variables) | §3, table in §3 covers all: fixed/variable costs, labor, materials, logistics, overhead, taxes, financing, risk contingency, capacity, reputation, quality, delivery capability, target margin |
| Detailed quotation system (not single-number bids) | §4 |
| Buyer evaluation beyond price (quality, delivery, compliance, reputation, risk, payment terms, warranty, SLA, sustainability) | §5 |
| 8 industry scenarios (construction, IT, manufacturing, logistics, consulting, healthcare, energy, government) | §6 |
| Dynamic events (all 10 named + 2 extra) | §7 |
| Information asymmetry design & tradeoffs | §8 |
| Negotiation, bluffing, positioning, reputation, AI competitors, alliances, post-auction P&L | §9, §10 |
| Progression, dashboards, leaderboards, achievements, analytics, replayability, difficulty levels | §11 |
| Formulas: quotation cost, bid price, profit, EV, risk-adjusted profit, overall score | §12 |
| 3+ detailed example simulations | §13 (3 examples, one per auction format) |
| MVP / V2 / Advanced feature split | §14 |
| UI screens, multiplayer flow, backend logic, DB entities, tech architecture | §15 |
| Concrete assumptions stated (not vague) | Throughout — all ranges, formulas, and defaults are explicit numbers, not placeholders |

**Result: all requested elements are present.** Nothing in the original brief was dropped or left as a vague placeholder.

---

*End of document.*
