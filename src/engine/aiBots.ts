import { AIPersonality, CompanyProfile, RFQ, Quote, PlayerState } from '../types/game';
import { calculateCostBreakdown } from './costCalculator';
import { formatINR } from '../utils/formatters';

/**
 * Generates an initial commercial quote for an AI Bot (§9.4)
 * AI starts with an initial high quote allowing room for dynamic counter-bidding during the live auction!
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

  let marginMultiplier = 1.25;
  let riskContingencyRate = profile.riskContingencyNeed;
  let slaTier: 'basic' | 'standard' | 'premium' = 'standard';
  let paymentTerms: 'upfront_20' | 'milestone' | 'net_30' | 'net_60' = 'net_30';
  let deliveryDays = rfq.requiredDeliveryDays;
  let warrantyMonths: 0 | 6 | 12 | 24 = 12;

  switch (personality) {
    case 'aggressive':
      // Vulcan: Starts moderately high (~14-18% margin) and aggressively cuts bids during live auction down to 3-6%
      marginMultiplier = 1.15 + (Math.random() * 0.03);
      riskContingencyRate = 0.04;
      slaTier = 'basic';
      paymentTerms = 'net_60';
      deliveryDays = Math.max(10, rfq.requiredDeliveryDays - 1);
      warrantyMonths = 6;
      break;

    case 'conservative':
      // Apex: Starts with 20-25% margin and defends 10-14% floor with 5/5 quality & premium SLA
      marginMultiplier = 1.22 + (Math.random() * 0.04);
      riskContingencyRate = 0.12;
      slaTier = 'premium';
      paymentTerms = 'net_30';
      deliveryDays = Math.max(8, rfq.requiredDeliveryDays - 4);
      warrantyMonths = 24;
      break;

    case 'opportunist': {
      // Matrix: Starts at ~16-20% margin and calculates optimal undercuts down to 5-8%
      marginMultiplier = 1.18 + (Math.random() * 0.03);
      riskContingencyRate = 0.07;
      slaTier = 'standard';
      paymentTerms = 'net_30';
      deliveryDays = Math.max(9, rfq.requiredDeliveryDays - 2);
      warrantyMonths = 12;
      break;
    }

    case 'copycat': {
      // Echo: Adaptive follower starting at ~17-21% margin down to 6-9%
      marginMultiplier = 1.19 + (Math.random() * 0.03);
      slaTier = 'standard';
      riskContingencyRate = 0.08;
      deliveryDays = rfq.requiredDeliveryDays;
      warrantyMonths = 12;
      break;
    }
  }

  // Calculate Final Initial Quote Price (capped by budget ceiling)
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

  let walkawayMargin = 1.10;
  let decrement = 1000;

  if (personality === 'aggressive') {
    // Vulcan: 4% to 7% floor margin, $2000-$6000 decrement
    walkawayMargin = 1.04 + (Math.random() * 0.03);
    decrement = 2000 + Math.random() * 4000;
  } else if (personality === 'conservative') {
    // Apex: 10% to 14% floor margin, $500-$2000 decrement
    walkawayMargin = 1.10 + (Math.random() * 0.04);
    decrement = 500 + Math.random() * 1500;
  } else if (personality === 'opportunist') {
    // Matrix: 5% to 9% floor margin, $1000-$3000 decrement
    walkawayMargin = 1.05 + (Math.random() * 0.04);
    decrement = 1000 + Math.random() * 2000;
  } else if (personality === 'copycat') {
    // Echo: 6% to 10% floor margin, approximates human decrement
    walkawayMargin = 1.06 + (Math.random() * 0.04);
    decrement = 1000 + Math.random() * 2000;
  }

  const minAcceptablePrice = Math.round(flc * walkawayMargin);
  decrement = Math.max(500, Math.round(decrement));
  const proposedBid = currentPrice - decrement;

  if (proposedBid >= minAcceptablePrice) {
    return {
      shouldBid: true,
      nextBidAmount: proposedBid,
      rationale: `${personality.toUpperCase()}: Undercut to ${formatINR(proposedBid)} (Margin: ${Math.round(((proposedBid - flc) / proposedBid) * 100)}%)`
    };
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
    // Vulcan targets 14-18% profit margin buzz
    targetMargin = 1.14 + (Math.random() * 0.04);
  } else if (personality === 'conservative') {
    // Apex targets 20-25% profit margin buzz
    targetMargin = 1.20 + (Math.random() * 0.05);
  } else if (personality === 'opportunist') {
    // Matrix targets 16-20% profit margin buzz
    targetMargin = 1.16 + (Math.random() * 0.04);
  } else if (personality === 'copycat') {
    // Echo targets 17-21% profit margin buzz
    targetMargin = 1.17 + (Math.random() * 0.04);
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
