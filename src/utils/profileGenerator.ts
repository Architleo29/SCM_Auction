import { CompanyProfile } from '../types/game';

const VENDOR_NAMES = [
  'Apex Industrial Solutions',
  'Titan Dynamics Corp',
  'Horizon Heavy Logistics',
  'Vulcan Precision Engineering',
  'Nexus Advanced Systems',
  'Strata Infrastructure Partners',
  'Aether BioMed Solutions',
  'Vanguard Energy Technologies'
];

/**
 * Generates an asymmetric, balanced company profile with all 14 variables (§3)
 */
export function generateCompanyProfile(customName?: string, index: number = 0): CompanyProfile {
  const name = customName || VENDOR_NAMES[index % VENDOR_NAMES.length];

  // Standardized baseline cost parameters across all vendors for fair competition (§3)
  const fixedCosts = 12000; // ₹12,000 standard annual facility fixed costs
  const variableCostRate = 0.55; // 55% standard variable direct cost ratio
  const laborCostIndex = 1.00; // Standard labor cost baseline (1.00x)
  const materialsCostIndex = 1.00; // Standard raw materials cost baseline (1.00x)
  const logisticsCostIndex = 1.00; // Standard freight & warehousing baseline (1.00x)
  const overheadRate = 0.10; // 10% standard factory overhead allocation
  const taxRate = 0.20; // 20% standard corporate tax rate
  const financingCostRate = 0.06; // 6% APR working capital carrying rate
  const riskContingencyNeed = 0.05; // 5% baseline risk contingency reserve
  const capacity = 2; // 2 standard operating capacity slots (Absorption = ₹6,000/slot)
  const reputationScore = 75; // Standard baseline starting reputation (75/100)
  const qualityLevel = 3; // Neutral 3★ baseline
  const deliveryCapabilityDays = 30; // 30-day standard delivery SLA
  const targetProfitMargin = 0.18; // 18% standard target margin baseline

  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    fixedCosts,
    variableCostRate,
    laborCostIndex,
    materialsCostIndex,
    logisticsCostIndex,
    overheadRate,
    taxRate,
    financingCostRate,
    riskContingencyNeed,
    capacity,
    reputationScore,
    qualityLevel,
    speedLevel: 3,
    costEfficiency: 3,
    deliveryCapabilityDays,
    targetProfitMargin
  };
}
