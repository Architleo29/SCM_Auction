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

  // Randomized within realistic bounded ranges (§3)
  const fixedCosts = Math.round(8000 + Math.random() * 12000); // 8,000 - 20,000
  const variableCostRate = Number((0.50 + Math.random() * 0.15).toFixed(2)); // 0.50 - 0.65
  const laborCostIndex = Number((0.85 + Math.random() * 0.35).toFixed(2)); // 0.85 - 1.20
  const materialsCostIndex = Number((0.85 + Math.random() * 0.35).toFixed(2)); // 0.85 - 1.20
  const logisticsCostIndex = Number((0.80 + Math.random() * 0.40).toFixed(2)); // 0.80 - 1.20
  const overheadRate = Number((0.10 + Math.random() * 0.06).toFixed(2)); // 10% - 16%
  const taxRate = 0.20; // 20% standard
  const financingCostRate = Number((0.05 + Math.random() * 0.05).toFixed(2)); // 5% - 10% APR
  const riskContingencyNeed = Number((0.05 + Math.random() * 0.07).toFixed(2)); // 5% - 12%
  const capacity = Math.floor(1 + Math.random() * 2); // 1 - 2 capacity slots
  const reputationScore = 75; // Standard baseline starting reputation (75/100) for all vendors
  const qualityLevel = 3; // Neutral baseline
  const deliveryCapabilityDays = Math.round(20 + Math.random() * 15);
  const targetProfitMargin = Number((0.15 + Math.random() * 0.10).toFixed(2)); // 15% - 25%

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
