# AI Bot Bidding Strategies & Auction Algorithms

**Location in Codebase:** `src/engine/aiBots.ts`
**Version:** 1.1 (corrected)

## Changelog from v1.0

| Change | Reason |
|---|---|
| All currency switched from `₹` to `$` | Every other doc (GDD, Design.md, cost/QCBS docs) uses `$` — the `₹` in the English-auction example was an isolated inconsistency |
| English-auction decrement changed from a flat `$15,000` constant to each bot's own randomized range | The flat figure was identical to `BidPrepCost` from the cost doc — almost certainly a copy-paste slip. Design.md's bot table already defines per-personality ranges (e.g. Vulcan $2,000–$6,000); this doc now references those directly instead of duplicating a different number |
| Floor margin ranges confirmed as canonical | Design.md v3.0 previously listed single-point floor margins (e.g. Vulcan 2.0%) that don't even fall inside these ranges. This doc's ranges are now the single source of truth — Design.md should be updated to reference these rather than restate its own numbers |

---

The simulator features four distinct AI personalities that utilize dynamic logic during live reverse auctions. They are not hardcoded to specific prices; instead, they calculate their own Fully Loaded Cost (FLC) and bid based on margin targets.

## 1. The Four AI Archetypes

*(This table is canonical for bot economics. Design.md's bot table should link here rather than restate values.)*

| Bot | Personality | Goal | Initial Quote Margin | Floor Margin | Bid Decrement Range | Quality/Terms |
|---|---|---|---|---|---|---|
| **Vulcan** | Aggressive | Win on volume and cost leadership | 14–18% | 4–7% | $2,000–$6,000 per tick | Basic SLA, 6-month warranty |
| **Apex** | Conservative | Defend high margins, win on quality | 20–25% | 10–14% | $500–$2,000 per tick | Premium SLA, 24-month warranty, 12% risk buffer |
| **Matrix** | Opportunist | Tactical undercuts of the current leader | 16–20% | 5–9% | $1,000–$3,000 per tick | Standard SLA |
| **Echo** | Copycat | Adaptive follower — mirrors the lowest human bidder | 17–21% | 6–10% | Matches whichever human it's copying, ±10% | Standard SLA, mirrors target's warranty |

## 2. Reverse English Auction Algorithm

In an English auction, the price starts high and bidders actively drive it down.

- **Logic:** Every 1–2 seconds, the game engine loops through active AI bots.
- **Decision:** `shouldAiBidInEnglishAuction()`
  - The bot calculates its minimum acceptable price (`FLC * Walkaway Margin`, using its own Floor Margin from §1).
  - It proposes a decrement, randomly sampled from **its own** Bid Decrement Range in §1 (e.g. Vulcan draws a random value between $2,000–$6,000; Apex, being conservative, draws from a much smaller $500–$2,000 range — this is what makes Vulcan's activity log look aggressive and Apex's look cautious even though both run the same function).
  - If the proposed bid is $\ge$ its minimum acceptable price, it places the bid, resetting the auction timer.
  - If the price drops below its floor, the bot logs a "Walked away" rationale and ceases bidding.

## 3. Reverse Dutch Auction Algorithm

In a Procurement Reverse Dutch auction, the price starts **very low** (unprofitable for sellers) and automatically ticks **up** every 2 seconds. The first bidder to "buzz in" and accept the price wins the contract.

- **Starting Price:** `65%` of the Budget Ceiling.
- **Tick Mechanism:** Price ascends by `3.5%` every 2 seconds.
- **Logic:** `shouldAiAcceptInDutchAuction()`
- **Decision:** Each bot has a target margin they are waiting to achieve, drawn from its Initial Quote Margin band in §1 (Vulcan: 14–18%; Apex: 20–25%; etc.).
  - The bot waits as the price rises. The moment the current tick price $\ge$ `FLC * Target Margin`, the bot buzzes in and ends the auction immediately.
  - This creates tension: human players must wait for the price to rise for better margins, but risk an AI bot buzzing in first.

## 4. Japanese Clock Auction Algorithm

In a Japanese auction, the price starts high and ticks down continuously in discrete steps. Bidders must explicitly choose to "hold" or "exit." Once you exit, you cannot return. The last remaining bidder wins at the price the second-to-last bidder exited.

- **Starting Price:** `125%` of the Budget Ceiling (ensuring it begins higher than all bots' floors so nobody instantly drops out).
- **Tick Mechanism:** Price descends by `2.5%` every 2 seconds.
- **Logic:** `shouldAiHoldInJapaneseAuction()`
- **Decision:** As the price drops every 2 seconds, the bot evaluates the current price against its Floor Margin from §1 (used here as the "exit margin floor").
  - If `Current Price >= (FLC * Floor Margin)`, the bot holds.
  - If it drops below, the bot permanently exits the arena.
  - The auction concludes when only 1 player remains; that player wins at the price recorded at the moment the second-to-last bidder exited.
