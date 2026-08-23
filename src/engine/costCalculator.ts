import { CompanyProfile, RFQ, Quote, CostBreakdown } from '../types/game';

/**
 * Computes the Fully Loaded Cost (FLC) and complete cost waterfall for a vendor (§3.1)
 */
export function calculateCostBreakdown(
  profile: CompanyProfile,
  rfq: RFQ,
  quotedPrice?: number,
  quotedRiskContingencyRate?: number
): CostBreakdown {
  // 1. Direct Costs & Profile Multipliers
  const effMultiplier = 1 - ((profile.costEfficiency || 3) - 3) * 0.10;
  
  // Quality Level (1 to 5 Stars):
  // 1★ Economy = -20% cost, 2★ Value = -10% cost, 3★ Standard = baseline, 4★ Premium = +15% cost, 5★ Flagship = +30% cost
  const qLvl = profile.qualityLevel || 3;
  let qualityCostMultiplier = 1.0;
  if (qLvl === 1) qualityCostMultiplier = 0.80;
  else if (qLvl === 2) qualityCostMultiplier = 0.90;
  else if (qLvl === 3) qualityCostMultiplier = 1.00;
  else if (qLvl === 4) qualityCostMultiplier = 1.15;
  else if (qLvl === 5) qualityCostMultiplier = 1.30;
  
  const speedCostMultiplier = 1 + ((profile.speedLevel || 3) - 3) * 0.05;

  const directLaborCost = rfq.baseLaborHours * rfq.laborRate * profile.laborCostIndex * effMultiplier * qualityCostMultiplier;
  const directMaterialsCost = rfq.baseMaterialsQty * rfq.unitMaterialCost * profile.materialsCostIndex * effMultiplier * qualityCostMultiplier;
  const directLogisticsCost = rfq.baseLogisticsUnits * rfq.logisticsUnitCost * profile.logisticsCostIndex * effMultiplier * speedCostMultiplier;
  const directCostSubtotal = directLaborCost + directMaterialsCost + directLogisticsCost;

  // 2. Overhead Allocation
  const overheadAllocation = directCostSubtotal * profile.overheadRate;

  // 3. Financing Cost (Cost of Capital given payment delay)
  const financingCost = (directCostSubtotal * profile.financingCostRate) * (rfq.paymentDelayDays / 365);

  // 4. Risk Contingency (Player chosen or default profile need)
  const contingencyRate = quotedRiskContingencyRate !== undefined ? quotedRiskContingencyRate : profile.riskContingencyNeed;
  const riskContingencyAmount = directCostSubtotal * contingencyRate;

  // 5. Total Delivery Cost (TDC)
  const totalDeliveryCost = directCostSubtotal + overheadAllocation + financingCost + riskContingencyAmount;

  // 6. Fixed Cost Absorption (Allocated per capacity slot)
  const fixedCostAbsorption = profile.fixedCosts / Math.max(1, profile.capacity);

  // 7. Fully Loaded Cost (FLC)
  const fullyLoadedCost = Math.round(totalDeliveryCost + fixedCostAbsorption);

  // 8. Target Bid Price
  const targetBidPrice = Math.round(fullyLoadedCost * (1 + profile.targetProfitMargin));

  // 9. Quoted Margin Calculation
  const finalPrice = quotedPrice !== undefined ? quotedPrice : targetBidPrice;
  const quotedMarginPct = finalPrice > 0 ? (finalPrice - fullyLoadedCost) / finalPrice : 0;
  
  // Loss-Leader Flag (§4): Price < 70% of FLC
  const isLossLeader = finalPrice < (0.70 * fullyLoadedCost);

  return {
    directLaborCost: Math.round(directLaborCost),
    directMaterialsCost: Math.round(directMaterialsCost),
    directLogisticsCost: Math.round(directLogisticsCost),
    directCostSubtotal: Math.round(directCostSubtotal),
    overheadAllocation: Math.round(overheadAllocation),
    financingCost: Math.round(financingCost),
    riskContingencyAmount: Math.round(riskContingencyAmount),
    totalDeliveryCost: Math.round(totalDeliveryCost),
    fixedCostAbsorption: Math.round(fixedCostAbsorption),
    fullyLoadedCost,
    targetBidPrice,
    quotedMarginPct: Number((quotedMarginPct * 100).toFixed(1)),
    isLossLeader
  };
}

/**
 * Estimates win probability using a logistic formula (§12)
 */
export function estimateWinProbability(
  myWeightedScore: number,
  estimatedMedianRivalScore: number = 0.65,
  kSensitivity: number = 6
): number {
  const exponent = -kSensitivity * (myWeightedScore - estimatedMedianRivalScore);
  const winProb = 1 / (1 + Math.exp(exponent));
  return Math.min(0.99, Math.max(0.01, Number(winProb.toFixed(2))));
}

export const SUNK_BID_PREP_COST = 15000;

/**
 * Expected Value (EV) calculation at bid time (§12)
 */
export function calculateExpectedValue(
  winProbability: number,
  projectedProfit: number,
  sunkBidPrepCost: number = SUNK_BID_PREP_COST
): number {
  return Math.round((winProbability * projectedProfit) - ((1 - winProbability) * sunkBidPrepCost));
}
