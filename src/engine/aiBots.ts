import { AIPersonality, CompanyProfile, RFQ, Quote, PlayerState } from '../types/game';
import { calculateCostBreakdown } from './costCalculator';
import { formatINR } from '../utils/formatters';

/**
 * Generates an initial commercial quote for an AI Bot
 * AI starts with an initial competitive quote leaving room for dynamic bidding wars!
 */
export function generateAiQuote(
  bot: PlayerState,
  rfq: RFQ,
  allPlayers: Record<string, PlayerState>
): Quote {
  const personality = bot.aiPersonality || 'conservative';
  const profile = bot.profile;
  const breakdown = calculateCostBreakdown(profile, rfq);
  const flc = breakdown.fullyLoadedCost;

  let marginMultiplier = 1.22;
  let riskContingencyRate = profile.riskContingencyNeed;
  let slaTier: 'basic' | 'standard' | 'premium' = 'standard';
  let paymentTerms: 'upfront_20' | 'milestone' | 'net_30' | 'net_60' = 'net_30';
  let deliveryDays = rfq.requiredDeliveryDays;
  let warrantyMonths: 0 | 6 | 12 | 24 = 12;

  switch (personality) {
    case 'aggressive':
      // Vulcan: Starts at ~18-22% margin and aggressively undercuts down to 4-6%
      marginMultiplier = 1.18 + (Math.random() * 0.04);
      riskContingencyRate = 0.04;
      slaTier = 'basic';
      paymentTerms = 'net_60';
      deliveryDays = Math.max(10, rfq.requiredDeliveryDays - 1);
      warrantyMonths = 6;
      break;

    case 'conservative':
      // Apex: Starts with 25-30% margin and defends a 12-15% floor with premium quality
      marginMultiplier = 1.25 + (Math.random() * 0.05);
      riskContingencyRate = 0.10;
      slaTier = 'premium';
      paymentTerms = 'net_30';
      deliveryDays = Math.max(8, rfq.requiredDeliveryDays - 4);
      warrantyMonths = 24;
      break;

    case 'opportunist':
      // Matrix: Starts at ~20-25% margin and calculates optimal undercuts down to 6-9%
      marginMultiplier = 1.20 + (Math.random() * 0.05);
      riskContingencyRate = 0.06;
      slaTier = 'standard';
      paymentTerms = 'net_30';
      deliveryDays = Math.max(9, rfq.requiredDeliveryDays - 2);
      warrantyMonths = 12;
      break;

    case 'copycat':
      // Echo: Adaptive follower starting at ~21-26% margin down to 7-10%
      marginMultiplier = 1.21 + (Math.random() * 0.05);
      slaTier = 'standard';
      riskContingencyRate = 0.07;
      deliveryDays = rfq.requiredDeliveryDays;
      warrantyMonths = 12;
      break;
  }

  // Cap initial quote by budget ceiling
  const rawPrice = Math.round(flc * marginMultiplier);
  const finalPrice = Math.min(Math.round(rfq.budgetCeiling * 0.98), rawPrice);

  return {
    playerId: bot.id,
    playerName: bot.name,
    price: finalPrice,
    paymentTerms,
    deliveryDays,
    warrantyMonths,
    slaTier,
    sustainability: 'standard',
    complianceChecked: [...rfq.requiredCompliance],
    riskDisclosureContingency: riskContingencyRate,
    submittedAt: Date.now(),
    isLossLeader: finalPrice < (0.70 * flc)
  };
}

/**
 * Calculates whether an AI bot should place a counter-bid in a Reverse English Auction
 */
export function shouldAiBidInEnglishAuction(
  bot: PlayerState,
  currentPrice: number,
  rfq: RFQ
): { shouldBid: boolean; nextBidAmount: number; rationale: string } {
  const personality = bot.aiPersonality || 'conservative';
  const flc = calculateCostBreakdown(bot.profile, rfq).fullyLoadedCost;

  let walkawayMargin = 1.08;
  let decrement = Math.max(2000, Math.round(rfq.budgetCeiling * 0.015));

  if (personality === 'aggressive') {
    // Vulcan: 4% to 7% floor margin, aggressive steps
    walkawayMargin = 1.04 + (Math.random() * 0.03);
    decrement = Math.max(3000, Math.round(rfq.budgetCeiling * 0.025));
  } else if (personality === 'conservative') {
    // Apex: 10% to 14% floor margin, small steps
    walkawayMargin = 1.10 + (Math.random() * 0.04);
    decrement = Math.max(1500, Math.round(rfq.budgetCeiling * 0.01));
  } else if (personality === 'opportunist') {
    // Matrix: 5% to 9% floor margin, balanced steps
    walkawayMargin = 1.05 + (Math.random() * 0.04);
    decrement = Math.max(2500, Math.round(rfq.budgetCeiling * 0.02));
  } else if (personality === 'copycat') {
    // Echo: 6% to 10% floor margin
    walkawayMargin = 1.06 + (Math.random() * 0.04);
    decrement = Math.max(2000, Math.round(rfq.budgetCeiling * 0.018));
  }

  const minAcceptablePrice = Math.round(flc * walkawayMargin);

  // If current price is higher than bot's minimum acceptable floor, the bot can bid!
  if (currentPrice > minAcceptablePrice) {
    const proposedBid = Math.max(minAcceptablePrice, currentPrice - decrement);
    if (proposedBid < currentPrice) {
      return {
        shouldBid: true,
        nextBidAmount: proposedBid,
        rationale: `${personality.toUpperCase()}: Undercut to ${formatINR(proposedBid)} (Margin: ${Math.round(((proposedBid - flc) / proposedBid) * 100)}%)`
      };
    }
  }

  return {
    shouldBid: false,
    nextBidAmount: 0,
    rationale: `${personality.toUpperCase()}: Walked away (Floor reached at ${formatINR(minAcceptablePrice)})`
  };
}

/**
 * Calculates whether an AI bot should buzz in during a Reverse Dutch Auction
 */
export function shouldAiAcceptInDutchAuction(
  bot: PlayerState,
  currentTickPrice: number,
  rfq: RFQ
): boolean {
  const personality = bot.aiPersonality || 'conservative';
  const flc = calculateCostBreakdown(bot.profile, rfq).fullyLoadedCost;

  let targetMargin = 1.16;

  if (personality === 'aggressive') {
    // Vulcan targets 12-16% profit margin buzz
    targetMargin = 1.12 + (Math.random() * 0.04);
  } else if (personality === 'conservative') {
    // Apex targets 18-24% profit margin buzz
    targetMargin = 1.18 + (Math.random() * 0.05);
  } else if (personality === 'opportunist') {
    // Matrix targets 15-20% profit margin buzz
    targetMargin = 1.15 + (Math.random() * 0.04);
  } else if (personality === 'copycat') {
    // Echo targets 16-21% profit margin buzz
    targetMargin = 1.16 + (Math.random() * 0.04);
  }

  const targetAcceptPrice = Math.round(flc * targetMargin);
  return currentTickPrice >= targetAcceptPrice;
}

/**
 * Calculates whether an AI bot should hold in during a Japanese Auction
 */
export function shouldAiHoldInJapaneseAuction(
  bot: PlayerState,
  currentPrice: number,
  rfq: RFQ
): boolean {
  const personality = bot.aiPersonality || 'conservative';
  const flc = calculateCostBreakdown(bot.profile, rfq).fullyLoadedCost;

  let exitMargin = 1.10;

  if (personality === 'aggressive') {
    // Vulcan: 4-7% floor
    exitMargin = 1.04 + (Math.random() * 0.03);
  } else if (personality === 'conservative') {
    // Apex: 10-14% floor
    exitMargin = 1.10 + (Math.random() * 0.04);
  } else if (personality === 'opportunist') {
    // Matrix: 5-9% floor
    exitMargin = 1.05 + (Math.random() * 0.04);
  } else if (personality === 'copycat') {
    // Echo: 6-10% floor
    exitMargin = 1.06 + (Math.random() * 0.04);
  }

  const exitFloor = Math.round(flc * exitMargin);
  return currentPrice >= exitFloor;
}
