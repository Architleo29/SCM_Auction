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

  if (quotes.length === 0) {
    return {
      winnerId: '',
      winnerName: 'No Bids Submitted',
      winningPrice: 0,
      scoresByPlayer: {},
      rankedPlayerIds: []
    };
  }

  // 1. Find Min price in quote pool for normalization
  const validPrices = quotes.map(q => q.price).filter(p => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : rfq.budgetCeiling;

  // 2. Evaluate each quote
  for (const quote of quotes) {
    const player = players[quote.playerId];
    if (!player) continue;

    const passedGates = true;

    // Normalized Price Score (QCBS Inverse Ratio: lowest price gets 1.0; higher gets minPrice / price)
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

  // 3. Rank Players by Weighted Score
  const rankedPlayerIds = Object.keys(scoresByPlayer).sort((a, b) => {
    return scoresByPlayer[b].totalWeightedScore - scoresByPlayer[a].totalWeightedScore;
  });

  const winnerId = rankedPlayerIds[0] || '';
  const winningQuote = quotes.find(q => q.playerId === winnerId);

  return {
    winnerId,
    winnerName: winningQuote?.playerName || players[winnerId]?.name || 'Unknown',
    winningPrice: winningQuote?.price || 0,
    scoresByPlayer,
    rankedPlayerIds
  };
}
