import { PlayerState, RFQ, Quote, DynamicEventCard, PnLResult } from '../types/game';
import { calculateCostBreakdown, SUNK_BID_PREP_COST } from './costCalculator';

/**
 * Computes Post-Auction Delivery Settlement and P&L Breakdown (§10 & §12)
 */
export function settleContractPnL(
  player: PlayerState,
  rfq: RFQ,
  winningQuote: Quote | null,
  isWinner: boolean,
  activeEvent: DynamicEventCard | null
): PnLResult {
  const profile = player.profile;
  const quote = player.submittedQuote;
  const bidPrepCost = quote ? SUNK_BID_PREP_COST : 0;

  // If player did not win, they banked 0 revenue and spent 0 delivery cost (idle round)
  if (!isWinner || !winningQuote || !quote) {
    // Idle round reputation decay: 1 pt toward 50 (§9.3)
    const decayDelta = player.reputation > 50 ? -1 : player.reputation < 50 ? 1 : 0;
    const newReputation = Math.max(0, Math.min(100, player.reputation + decayDelta));

    return {
      playerId: player.id,
      contractWon: false,
      quotedPrice: quote ? quote.price : 0,
      bidPrepCost,
      baselineCost: 0,
      eventCostDelta: 0,
      actualDeliveryCost: 0,
      operatingProfit: 0,
      tax: 0,
      realizedProfit: -bidPrepCost,
      quotedMarginPct: quote ? Number(((quote.price - calculateCostBreakdown(profile, rfq).fullyLoadedCost) / quote.price * 100).toFixed(1)) : 0,
      realizedMarginPct: 0,
      marginVariancePts: 0,
      volatilityPenalty: 0,
      riskAdjustedProfit: -bidPrepCost,
      reputationDelta: decayDelta,
      newReputation,
      reputationReason: quote ? 'Lost auction (Bid Prep Cost deducted)' : 'Idle Round (Participation Decay)'
    };
  }

  // 1. Calculate Baseline Delivery Cost (FLC at quote time)
  const baselineBreakdown = calculateCostBreakdown(profile, rfq, winningQuote.price, winningQuote.riskDisclosureContingency);
  const baselineCost = baselineBreakdown.fullyLoadedCost;

  // 2. Apply Dynamic Event Impacts
  let eventCostDelta = 0;
  let penaltyReason = '';
  if (activeEvent) {
    if (activeEvent.materialsMultiplier) {
      const addedMaterialsCost = baselineBreakdown.directMaterialsCost * activeEvent.materialsMultiplier;
      // Check if quoted risk buffer absorbs part of the shock
      const shockExcess = Math.max(0, addedMaterialsCost - baselineBreakdown.riskContingencyAmount);
      eventCostDelta += shockExcess;
    }
    if (activeEvent.logisticsMultiplier) {
      eventCostDelta += baselineBreakdown.directLogisticsCost * activeEvent.logisticsMultiplier;
    }
    if (activeEvent.laborMultiplier) {
      eventCostDelta += baselineBreakdown.directLaborCost * activeEvent.laborMultiplier;
    }
    if (activeEvent.penaltyCost) {
      eventCostDelta += activeEvent.penaltyCost;
      penaltyReason = 'Penalty Triggered';
    }
  }

  // 3. Calculate Actual Delivery Cost & Tax
  const actualDeliveryCost = Math.round(baselineCost + eventCostDelta);
  const operatingProfit = winningQuote.price - actualDeliveryCost;
  const tax = operatingProfit > 0 ? Math.round(operatingProfit * profile.taxRate) : 0;
  const realizedProfit = operatingProfit - tax - bidPrepCost;

  // 4. Margins & Variance
  const quotedMarginPct = baselineBreakdown.quotedMarginPct;
  const realizedMarginPct = winningQuote.price > 0 ? Number(((operatingProfit / winningQuote.price) * 100).toFixed(1)) : 0;
  const marginVariancePts = Number((realizedMarginPct - quotedMarginPct).toFixed(1));

  // 5. Volatility Penalty & Risk-Adjusted Profit (RAP) (§12)
  const marginDiffDecimal = Math.abs(marginVariancePts) / 100;
  const volatilityPenalty = Number(Math.min(0.40, marginDiffDecimal * 0.5).toFixed(2));
  const riskAdjustedProfit = Math.round(realizedProfit * (1 - volatilityPenalty));

  // 6. Reputation Shift (§9.3)
  let repDelta = 3; // +3 for winning contract participation
  let repReason = 'Won contract (+3)';

  if (realizedProfit > 0 && eventCostDelta === 0) {
    repDelta += 8; // On-time, on-spec
    repReason += ', Delivered on-spec (+8)';
  } else if (eventCostDelta > baselineBreakdown.riskContingencyAmount) {
    repDelta -= 5; // Cost overrun beyond contingency
    repReason += ', Cost overrun (-5)';
  } else if (realizedProfit < 0) {
    repDelta -= 12; // Contract default / loss
    repReason += ', Loss-making default (-12)';
  }

  const newReputation = Math.max(0, Math.min(100, player.reputation + repDelta));

  return {
    playerId: player.id,
    contractWon: true,
    quotedPrice: winningQuote.price,
    bidPrepCost,
    baselineCost,
    eventCostDelta,
    actualDeliveryCost,
    operatingProfit,
    tax,
    realizedProfit,
    quotedMarginPct,
    realizedMarginPct,
    marginVariancePts,
    volatilityPenalty,
    riskAdjustedProfit,
    reputationDelta: repDelta,
    newReputation,
    reputationReason: repReason
  };
}

/**
 * Calculates overall game score composite (§1.4 & §12)
 */
export function calculateTotalScore(
  bankedProfit: number,
  contractsWon: number,
  reputation: number,
  totalRiskAdjustedProfit: number,
  penalties: number = 0
): number {
  const profitScore = bankedProfit * 1.0;
  const contractScore = contractsWon * 50;
  const reputationScore = reputation * 20;
  const riskAdjustedBonus = totalRiskAdjustedProfit * 0.30;

  return Math.round(profitScore + contractScore + reputationScore + riskAdjustedBonus - penalties);
}
