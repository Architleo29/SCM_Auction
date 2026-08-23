# Forward English Auction — Multi-Buyer Purse Mode

**Location in Codebase:** `src/engine/forwardAuction.ts` (new)
**Version:** 1.1 (corrected)
**Status:** New game mode — distinct objective function from the existing reverse-auction vendor game (see §0)

## Changelog from v1.0

| Change | Reason |
|---|---|
| §1 and §3.1 rewritten: auction mechanic corrected from an auto-ticking clock to a true active-bid English auction | v1.0 described buyers passively holding "in" while price rose on its own each tick, with a last-one-standing win rule — that's actually the Japanese Clock mechanic (`aiBots.ts` §4) mirrored upward, not English. A real English auction has no autonomous price movement: bidders actively raise the price themselves, and the winner pays their own final bid, not a second-place exit price. |

---

## 0. What This Mode Is

Every other mode in this simulator (`aiBots.ts`, `costCalculator.ts`, `buyerScoring.ts`) puts the player in the **vendor's** seat: racing price *down*, constrained by a cost floor (FLC), scored on margin for a single contract per round.

This mode flips the seat. The player is a **buyer** with a fixed **purse**, bidding price *up* in a standard ascending English auction, across **multiple sequential items**, trying to build the best overall haul before the money runs out. Structurally this is an IPL/fantasy-draft-style player auction — proven, watchable, and strategically deep specifically because of the shared budget constraint across many rounds.

This is intentionally simple by design (see §5 for what was deliberately left out): no synergy/complementarity between items, no portfolio-fit calculation. The strategic depth comes entirely from **exposure management** (spend now vs. save for a better item later) and, in Common Value mode, **the winner's curse** (§2).

---

## 1. Core Setup

| Concept | Definition |
|---|---|
| **Buyers** | N players (human or AI), each assigned a fixed **Purse** at game start (e.g. $1,000,000) |
| **Items** | A catalog of M items put up for auction one at a time, in sequence (ordering: §4) |
| **Base Market Value** | A public number shown on every item's card — the shared reference point all buyers see, regardless of mode |
| **Remaining Purse** | Tracked live per buyer; decreases only when a buyer actually wins an item (not on every bid placed) |
| **Bid Increment** | Fixed step size the price rises by each tick (can scale with `Base_Market_Value`, e.g. 2% of it, same pattern as the reverse-auction bid decrements) |

Each item's auction runs as a true ascending English auction — the price does **not** move on its own. It opens at a starting price (e.g. $0, or a small reserve % of `Base_Market_Value`), and buyers **actively choose** to place a bid at their own discretion:

```
Forward English Auction Flow:
  1. Auction opens at Starting_Price for this item
  2. Any buyer may, at any time, place a bid: proposedBid >= currentHighestBid + Bid_Increment
  3. Each valid bid becomes the new currentHighestBid and resets a soft-close timer (e.g. 15s)
  4. If no new bid arrives before the timer expires, the auction closes
  5. WINNER = whoever placed currentHighestBid; PRICE = that bid amount (the winner pays their own final bid)
```

This is the direct ascending mirror of the existing Reverse English logic in `aiBots.ts` §2 (active bid placement, soft-close-on-new-bid, timer reset) — just flipped so buyers raise the price instead of vendors lowering it. It is **not** the same mechanic as the Japanese Clock algorithm (`aiBots.ts` §4), which auto-ticks the price and reduces bidders to a passive hold/exit choice — an earlier draft of this document mistakenly described that mechanic instead. A buyer-side clock format is a legitimate, separate mode ("Forward Japanese") but is out of scope for this doc and would need its own spec if wanted.

---

## 2. Two Valuation Modes

This is a **per-game setting**, not two separate codepaths — both modes share the exact same bid-decision function shape (§3) and purse mechanics (§1); only the source of the number being compared against changes.

### Mode A — Private Value

Each buyer has their own, genuinely different, valuation of each item. There is no single "correct" value — a buyer can never be "wrong" about their own preference, only overspend relative to it.

```
Item_Value(buyer, item) = Base_Market_Value(item) × Private_Interest_Roll(buyer, item)
```

- `Private_Interest_Roll` — a random multiplier (e.g. 0.7–1.4), drawn once per buyer-per-item at game start.
- Shown to that buyer only, for that item only. Never revealed to rivals, never shown as an aggregate.
- **Scoring baseline:** the buyer's own valuation (see §3.3) — since no "true" value exists to compare against.

### Mode B — Common Value

Every item has one real, shared value — but no buyer can see it directly. Each buyer only sees a noisy private estimate.

```
True_Value(item) = Base_Market_Value(item)                          // identical for every buyer, hidden from all
Buyer_Estimate(buyer, item) = True_Value(item) × Noise_Roll(buyer, item)
```

- `Noise_Roll` — a random multiplier (e.g. 0.8–1.2), independently drawn per buyer-per-item, centered on 1.0 so estimates are unbiased on average across the whole buyer pool.
- **Winner's curse warning (by design, not a bug):** because the winner of any given item is, on average, whichever buyer happened to draw the most optimistic `Noise_Roll`, buyers who bid straight up to their own estimate will systematically overpay across a full session. This is the intended lesson of Common Value mode — the more bidders competing for an item, the more a rational buyer should discount their own estimate before bidding (see the `Shading_Factor` in §3.2).
- **Scoring baseline:** `True_Value`, not the buyer's own estimate (§3.3) — since the whole point is that estimates can be wrong.

### Side-by-Side Reference

| | Mode A: Private Value | Mode B: Common Value |
|---|---|---|
| Ground truth | None — no single correct value | One true value exists, hidden from all buyers |
| What a buyer sees | Their own true valuation | A noisy guess at the shared true value |
| Overpaying means | Paid more than it's worth *to them* | Estimate was too optimistic |
| Score computed against | Buyer's own valuation | `True_Value` (revealed only at settlement) |

---

## 3. AI Bid Decision Logic

### 3.1 Shared shape

```
shouldAiBidInForwardAuction(buyer, item, currentHighestBid):
  proposedBid = currentHighestBid + Bid_Increment

  if proposedBid > Remaining_Purse(buyer):
      return false   // can't afford it, regardless of value

  targetPrice = getBidCeiling(buyer, item)   // §3.2 — mode-dependent

  if proposedBid > targetPrice:
      return false   // not worth it (or, in Mode B, not worth the discounted estimate)

  return true   // places proposedBid, becomes new currentHighestBid, resets the soft-close timer
```

Note: `currentHighestBid` starts at the item's `Starting_Price` (§1) and only changes when a buyer actually bids — unlike the reverse-auction and clock-auction modes elsewhere in this codebase, nothing here advances automatically on a tick.

### 3.2 `getBidCeiling()` — the only mode-dependent piece

```
Mode A (Private Value):
  getBidCeiling(buyer, item) = Item_Value(buyer, item)

Mode B (Common Value):
  getBidCeiling(buyer, item) = Buyer_Estimate(buyer, item) × Shading_Factor(activeBidderCount)

  Shading_Factor(n) = clamp(1.15 − 0.05 × n, 0.6, 1.0)
    // fewer active bidders → closer to 1.0 (trust your own estimate)
    // more active bidders → shrinks toward 0.6 (heavier discount — winner's-curse defense)
```

`activeBidderCount` is simply how many buyers are still willing to bid on this specific item at the current price tick — publicly observable, exactly like the "who's still in" signal in the existing Japanese Clock algorithm (`aiBots.ts` §4).

### 3.3 Portfolio Score (end-of-game)

```
Mode A:
  Portfolio_Score(buyer) = Σ Item_Value(buyer, item_won) − Σ Price_Paid(item_won)

Mode B:
  Portfolio_Score(buyer) = Σ True_Value(item_won) − Σ Price_Paid(item_won)
```

Positive score = bought below value on net across the session; negative = overpaid on net. No overpay penalty term, no synergy bonus, no discipline bonus — deliberately the entire formula, per the simplification requested (see §5).

---

## 4. Item Ordering & Pacing

- **Default: fixed random order**, revealed one item at a time (not the full catalog up front) — keeps buyers from fully pre-planning their whole purse before the auction starts, which is closer to how a real sequential auction plays.
- **Optional variant:** buyer-influenced ordering (e.g. host arranges the catalog, or highest-remaining-purse buyer picks the next item up) — not required for MVP, flagged here only so it's a known extension point.
- **Late-auction dynamics are intentional, not a bug to smooth out:** buyers with leftover purse near the final items have nothing left to save for, which naturally produces a price spike on the last few items as everyone spends down. This mirrors real auction behavior (IPL's last few lots often go for surprising prices) and is a deliberate emergent feature.

### Minimum Reserve Rule (mitigates the "dead buyer" problem)

Without a safeguard, a buyer can blow their entire purse on an early item and then simply spectate for the rest of the session — which is bad for a live multiplayer game night.

```
Reserve_Requirement(roundsRemaining) =
    if roundsRemaining <= 3: 0%           // no restriction on the final stretch — let the spend-down happen
    else: 10% of Starting_Purse            // must keep at least this much in reserve until the last 3 items
```

A buyer cannot place a bid that would drop `Remaining_Purse` below the active `Reserve_Requirement`. This keeps every buyer meaningfully active for most of the session while still allowing the natural end-game spending spike described above.

---

## 5. What Was Deliberately Left Out (and why)

| Cut feature | Why it was cut | When to reconsider |
|---|---|---|
| **Buyer Fit Multiplier / portfolio-need weighting** | Made valuation conditional on a buyer's evolving portfolio — adds real complexity for a first version, requested to be simplified out entirely | If Private Value mode feels too flat after playtesting |
| **Item Synergy / complementarity** ("only valuable if you also won X") | Roughly doubles design surface (needs a defined item taxonomy + combo rules); not needed for the core loop to work | Natural v2 addition — e.g. "own 2+ items from the same category → +10% value on both" |
| **Aggression_Factor / bot personality on top of valuation** | Not required for a working bid decision — a bot bidding straight to its own ceiling is already a complete, sensible strategy | Optional polish layer once the base mode is validated — e.g. Vulcan-style bots bid to `ceiling × 1.1`, Apex-style stop at `ceiling × 0.9` |
| **Overpay penalty / budget-discipline bonus in scoring** | The value-minus-price formula already captures the full outcome; extra terms were redundant | Reconsider only if playtesting shows the raw score doesn't feel punishing enough for reckless early spending |

---

## 6. Open Decisions Before Implementation

1. **Data model** — are "items" a new abstract catalog, or repurposed vendor/contract data from the existing game? Affects whether this reuses RFQ entities or needs its own.
2. **Bid Increment sizing** — flat value vs. % of `Base_Market_Value` per item (recommended: % of value, so cheap and expensive items feel proportionally similar to bid on).
3. **Starting Purse sizing relative to the total catalog's Base Market Value** — too generous and nobody feels the constraint; too tight and the Minimum Reserve Rule bites too early. Needs a playtested ratio (a reasonable first guess: total purse pool ≈ 60–70% of the catalog's combined Base Market Value, so the group collectively cannot buy everything at "fair" price and real competition is forced).
