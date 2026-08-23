import { PlayerState, RFQ, Quote, DynamicEventCard, PnLResult } from '../types/game';
import { calculateCostBreakdown, SUNK_BID_PREP_COST } from './costCalculator';

/**
 * Computes Post-Auction Delivery Settlement and P&L Breakdown
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

  // If player did not win
  if (!isWinner || !winningQuote || !quote) {
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
      reputationDelta: 0,
      newReputation: 100,
      reputationReason: quote ? 'Lost auction' : 'Idle Round'
    };
  }

  // 1. Calculate Baseline Delivery Cost
  const baselineBreakdown = calculateCostBreakdown(profile, rfq, winningQuote.price, winningQuote.riskDisclosureContingency);
  const baselineCost = baselineBreakdown.fullyLoadedCost;

  // 2. Apply Dynamic Event Impacts
  let eventCostDelta = 0;
  if (activeEvent) {
    if (activeEvent.materialsMultiplier) {
      const addedMaterialsCost = baselineBreakdown.directMaterialsCost * activeEvent.materialsMultiplier;
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

  // 5. Volatility Penalty & Risk-Adjusted Profit
  const marginDiffDecimal = Math.abs(marginVariancePts) / 100;
  const volatilityPenalty = Number(Math.min(0.40, marginDiffDecimal * 0.5).toFixed(2));
  const riskAdjustedProfit = Math.round(realizedProfit * (1 - volatilityPenalty));

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
    reputationDelta: 0,
    newReputation: 100,
    reputationReason: 'Won contract'
  };
}

/**
 * Calculates overall game score composite (Banked Profit + Contracts Won)
 */
export function calculateTotalScore(
  bankedProfit: number,
  contractsWon: number,
  reputation: number = 0,
  totalRiskAdjustedProfit: number = 0,
  penalties: number = 0
): number {
  const profitScore = bankedProfit * 1.0;
  const contractScore = contractsWon * 100;
  const riskAdjustedBonus = totalRiskAdjustedProfit * 0.20;

  return Math.round(profitScore + contractScore + riskAdjustedBonus - penalties);
}
