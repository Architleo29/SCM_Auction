import { PlayerState, RFQ, Quote, DynamicEventCard, PnLResult } from '../types/game';
import { calculateCostBreakdown } from './costCalculator';

export const SUNK_BID_PREP_COST = 15000; // ₹15,000 cost incurred by all participating vendors

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
  const quote = player.submittedQuote || winningQuote;
  const bidPrepCost = SUNK_BID_PREP_COST;

  // If player did not win: Incur ₹15,000 Bid Preparation Fee
  if (!isWinner || !winningQuote) {
    const quotedP = quote ? quote.price : 0;
    return {
      playerId: player.id,
      contractWon: false,
      quotedPrice: quotedP,
      bidPrepCost,
      baselineCost: 0,
      eventCostDelta: 0,
      actualDeliveryCost: 0,
      operatingProfit: 0,
      tax: 0,
      realizedProfit: -bidPrepCost, // Incurred -₹15,000
      quotedMarginPct: quotedP > 0 ? Number(((quotedP - calculateCostBreakdown(profile, rfq).fullyLoadedCost) / quotedP * 100).toFixed(1)) : 0,
      realizedMarginPct: 0,
      marginVariancePts: 0,
      volatilityPenalty: 0,
      riskAdjustedProfit: -bidPrepCost,
      reputationDelta: 0,
      newReputation: 100,
      reputationReason: quote ? 'Outbid in auction (-₹15k Participation Fee)' : 'Idle Round'
    };
  }

  // WINNER SETTLEMENT
  const contractAwardPrice = winningQuote.price > 0 ? winningQuote.price : rfq.budgetCeiling * 0.85;

  // 1. Calculate Baseline Delivery Cost for Winner
  const baselineBreakdown = calculateCostBreakdown(
    profile, 
    rfq, 
    contractAwardPrice, 
    winningQuote.riskDisclosureContingency || 0.05
  );
  const baselineCost = baselineBreakdown.fullyLoadedCost;

  // 2. Apply Dynamic Event Impacts (if any)
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

  // 3. Calculate Actual Delivery Cost, Taxes, and Net Realized Profit
  const actualDeliveryCost = Math.round(baselineCost + eventCostDelta);
  const operatingProfit = contractAwardPrice - actualDeliveryCost;
  const tax = operatingProfit > 0 ? Math.round(operatingProfit * (profile.taxRate || 0.20)) : 0;
  const realizedProfit = operatingProfit - tax - bidPrepCost; // Deduct ₹15,000 participation fee

  // 4. Margins & Variance
  const quotedMarginPct = baselineBreakdown.quotedMarginPct;
  const realizedMarginPct = contractAwardPrice > 0 ? Number(((operatingProfit / contractAwardPrice) * 100).toFixed(1)) : 0;
  const marginVariancePts = Number((realizedMarginPct - quotedMarginPct).toFixed(1));

  // 5. Risk-Adjusted Profit
  const marginDiffDecimal = Math.abs(marginVariancePts) / 100;
  const volatilityPenalty = Number(Math.min(0.40, marginDiffDecimal * 0.5).toFixed(2));
  const riskAdjustedProfit = Math.round(realizedProfit * (1 - volatilityPenalty));

  return {
    playerId: player.id,
    contractWon: true,
    quotedPrice: contractAwardPrice,
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
  reputation: number = 100,
  totalRiskAdjustedProfit: number = 0,
  penalties: number = 0
): number {
  const profitScore = bankedProfit * 1.0;
  const contractScore = contractsWon * 1000;
  const riskAdjustedBonus = totalRiskAdjustedProfit * 0.20;

  return Math.round(profitScore + contractScore + riskAdjustedBonus - penalties);
}
