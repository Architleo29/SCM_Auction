import { RFQ, Quote, PlayerState, BuyerEvaluationResult, VendorCriterionScore } from '../types/game';

/**
 * Multi-Criteria Buyer Evaluation Engine (§5 & §5.1)
 * Standard International Procurement Formula (QCBS - Quality & Cost Based Selection)
 */
export function evaluateQuotes(
  rfq: RFQ,
  quotes: Quote[],
  players: Record<string, PlayerState>
): BuyerEvaluationResult {
  const scoresByPlayer: Record<string, VendorCriterionScore> = {};

  if (quotes.length === 0) {
    return {
      winnerId: '',
      winnerName: 'No Bids Submitted',
      winningPrice: 0,
      scoresByPlayer: {},
      rankedPlayerIds: []
    };
  }

  // 1. Find Min & Max price in quote pool for normalization
  const validPrices = quotes.map(q => q.price).filter(p => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : rfq.budgetCeiling;

  // 2. Evaluate each quote
  for (const quote of quotes) {
    const player = players[quote.playerId];
    if (!player) continue;

    // Gate Check: Mandatory Compliance Checklists
    const missingCompliance = rfq.requiredCompliance.filter(
      cert => !quote.complianceChecked.includes(cert)
    );
    const passedGates = missingCompliance.length === 0;
    const disqualificationReason = !passedGates 
      ? `Failed mandatory compliance: Missing ${missingCompliance.join(', ')}`
      : undefined;

    // Normalized Price Score (QCBS Inverse Ratio: lowest price gets 1.0; 10% higher gets 0.91)
    const priceScore = quote.price > 0 
      ? Math.min(1.0, Math.max(0.0, minPrice / quote.price))
      : 0.0;

    // Quality Score (Base quality 1-5 stars + SLA bonus)
    const slaBonus = quote.slaTier === 'premium' ? 0.15 : quote.slaTier === 'standard' ? 0.05 : 0.0;
    const rawQuality = (player.profile.qualityLevel / 5.0) + slaBonus;
    const qualityScore = Math.min(1.0, Math.max(0.0, rawQuality));

    // Timeline Score (Faster turnaround = higher score)
    const timelineScore = quote.deliveryDays <= rfq.requiredDeliveryDays
      ? Math.min(1.0, 0.85 + (rfq.requiredDeliveryDays - quote.deliveryDays) * 0.03)
      : Math.max(0.0, 0.85 - (quote.deliveryDays - rfq.requiredDeliveryDays) * 0.06);

    // Reputation Score (0 to 1)
    const reputationScore = Math.min(1.0, Math.max(0.0, player.reputation / 100.0));

    // Compliance Score
    const complianceScore = rfq.requiredCompliance.length > 0
      ? (quote.complianceChecked.length / rfq.requiredCompliance.length)
      : 1.0;

    // Risk Adequacy Score (Adequate contingency buffer for stability)
    const riskScore = quote.riskDisclosureContingency >= player.profile.riskContingencyNeed ? 1.0 : 0.65;

    // Payment Terms Score (Buyers prefer delayed payment: Net-60 > Net-30 > Milestone > Upfront)
    const paymentMap = { net_60: 1.0, net_30: 0.85, milestone: 0.6, upfront_20: 0.3 };
    const paymentTermsScore = paymentMap[quote.paymentTerms] || 0.6;

    // SLA Score
    const slaMap = { premium: 1.0, standard: 0.75, basic: 0.4 };
    const slaScore = slaMap[quote.slaTier] || 0.6;

    // Sustainability Score
    const sustainabilityScore = quote.sustainability === 'certified_green' ? 1.0 : 0.5;

    // Calculate Total Weighted Score
    const totalWeightedScore = passedGates ? (
      (rfq.weights.price * priceScore) +
      (rfq.weights.quality * qualityScore) +
      (rfq.weights.timeline * timelineScore) +
      (rfq.weights.reputation * reputationScore) +
      (rfq.weights.risk * riskScore) +
      (rfq.weights.paymentTerms * paymentTermsScore) +
      (rfq.weights.sla * slaScore) +
      (rfq.weights.sustainability * sustainabilityScore)
    ) : 0.0;

    scoresByPlayer[quote.playerId] = {
      priceScore: Number((priceScore * 100).toFixed(1)),
      qualityScore: Number((qualityScore * 100).toFixed(1)),
      timelineScore: Number((timelineScore * 100).toFixed(1)),
      reputationScore: Number((reputationScore * 100).toFixed(1)),
      complianceScore: Number((complianceScore * 100).toFixed(1)),
      riskScore: Number((riskScore * 100).toFixed(1)),
      paymentTermsScore: Number((paymentTermsScore * 100).toFixed(1)),
      slaScore: Number((slaScore * 100).toFixed(1)),
      sustainabilityScore: Number((sustainabilityScore * 100).toFixed(1)),
      totalWeightedScore: Number((totalWeightedScore * 100).toFixed(1)),
      passedGates,
      disqualificationReason
    };
  }

  // 3. Rank Players by Weighted Score
  const rankedPlayerIds = Object.keys(scoresByPlayer).sort((a, b) => {
    return scoresByPlayer[b].totalWeightedScore - scoresByPlayer[a].totalWeightedScore;
  });

  const winnerId = rankedPlayerIds.length > 0 && scoresByPlayer[rankedPlayerIds[0]].passedGates
    ? rankedPlayerIds[0]
    : '';

  const winningQuote = quotes.find(q => q.playerId === winnerId);
  const winnerPlayer = winnerId ? players[winnerId] : null;

  return {
    winnerId,
    winnerName: winnerPlayer ? winnerPlayer.name : 'None (All Disqualified)',
    winningPrice: winningQuote ? winningQuote.price : 0,
    scoresByPlayer,
    rankedPlayerIds
  };
}
