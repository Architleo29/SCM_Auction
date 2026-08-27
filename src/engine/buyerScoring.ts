import { RFQ, Quote, PlayerState, BuyerEvaluationResult, VendorCriterionScore } from '../types/game';

/**
 * Multi-Criteria Buyer Evaluation Engine (QCBS: Price & Quality)
 */
export function evaluateQuotes(
  rfq: RFQ,
  quotes: Quote[],
  players: Record<string, PlayerState>
): BuyerEvaluationResult {
  const scoresByPlayer: Record<string, VendorCriterionScore> = {};

  if (quotes.length === 0 && Object.keys(players).length === 0) {
    return {
      winnerId: '',
      winnerName: 'No Bids Submitted',
      winningPrice: 0,
      scoresByPlayer: {},
      rankedPlayerIds: []
    };
  }

  // Ensure all active players have an entry
  const effectiveQuotes = [...quotes];
  Object.values(players).forEach(p => {
    if (!p.isHost && !effectiveQuotes.some(q => q.playerId === p.id)) {
      effectiveQuotes.push({
        playerId: p.id,
        playerName: p.name,
        price: p.submittedQuote?.price || rfq.budgetCeiling * 0.90,
        priceTier: 3,
        qualityTier: p.profile?.qualityLevel || 3,
        timelineTier: 3,
        riskReputationScore: 100,
        paymentTerms: 'net_30',
        deliveryDays: 30,
        warrantyMonths: 12,
        slaTier: 'standard',
        sustainability: 'standard',
        complianceChecked: ['ISO-9001'],
        riskDisclosureContingency: 0.05,
        submittedAt: Date.now(),
        isLossLeader: false
      });
    }
  });

  // 1. Find Min price in quote pool for normalization
  const validPrices = effectiveQuotes.map(q => q.price).filter(p => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : rfq.budgetCeiling;

  // 2. Evaluate each quote
  for (const quote of effectiveQuotes) {
    const player = players[quote.playerId];
    if (!player) continue;

    const passedGates = true;

    // Normalized Price Score (QCBS Inverse Ratio)
    const priceScore = quote.price > 0 
      ? Math.min(1.0, Math.max(0.0, minPrice / quote.price))
      : 0.0;

    // Quality Score (1-5 stars scale: 1★ = 0.20, 5★ = 1.0)
    const qualityLevel = quote.qualityTier || player.profile.qualityLevel || 3;
    const qualityScore = Math.min(1.0, Math.max(0.0, qualityLevel / 5.0));

    // Calculate Total Weighted Score (Price + Quality)
    const priceWeight = rfq.weights.price || 0.60;
    const qualityWeight = rfq.weights.quality || 0.40;
    const totalWeightedScore = (priceWeight * priceScore) + (qualityWeight * qualityScore);

    scoresByPlayer[quote.playerId] = {
      priceScore: Number((priceScore * 100).toFixed(1)),
      qualityScore: Number((qualityScore * 100).toFixed(1)),
      timelineScore: 100,
      reputationScore: 100,
      riskScore: 100,
      riskReputationScore: 100,
      complianceScore: 100,
      paymentTermsScore: 100,
      slaScore: 100,
      sustainabilityScore: 100,
      totalWeightedScore: Number((totalWeightedScore * 100).toFixed(1)),
      passedGates
    };
  }

  // 3. Rank Players strictly by Total Weighted QCBS Score (Option 1: True QCBS)
  const rankedPlayerIds = Object.keys(scoresByPlayer).sort((a, b) => {
    return scoresByPlayer[b].totalWeightedScore - scoresByPlayer[a].totalWeightedScore;
  });

  const winnerId = rankedPlayerIds[0] || '';
  const winningQuote = effectiveQuotes.find(q => q.playerId === winnerId);
  const winningPrice = winningQuote?.price || rfq.budgetCeiling * 0.90;

  return {
    winnerId,
    winnerName: winningQuote?.playerName || players[winnerId]?.name || 'Winning Vendor',
    winningPrice,
    scoresByPlayer,
    rankedPlayerIds
  };
}
