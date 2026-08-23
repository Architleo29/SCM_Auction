// Comprehensive Game Types for SCM Vendor Bidding & Auction Simulator

export type IndustryScenarioId = 
  | 'manufacturing'
  | 'construction'
  | 'it_software'
  | 'logistics'
  | 'consulting'
  | 'healthcare'
  | 'energy'
  | 'government';

export type AuctionFormat = 'english';

export type AIPersonality = 'aggressive' | 'conservative' | 'opportunist' | 'copycat';

export type GameDifficulty = 'beginner' | 'standard' | 'expert';

export type GamePhase = 
  | 'LOBBY'
  | 'RFQ_BUILDER'
  | 'RFQ'
  | 'INTEL'
  | 'QUOTING'
  | 'AUCTION'
  | 'EVALUATION'
  | 'EVENT'
  | 'PNL'
  | 'LEADERBOARD'
  | 'GAMEOVER';

export type PaymentTerms = 'upfront_20' | 'milestone' | 'net_30' | 'net_60';
export type SLATier = 'basic' | 'standard' | 'premium';
export type SustainabilityLevel = 'standard' | 'certified_green';
export type WarrantyPeriod = 0 | 6 | 12 | 24; // months

// 14 Variables of Company Profile (§3)
export interface CompanyProfile {
  id: string;
  name: string;
  fixedCosts: number;           // $ per round overhead
  variableCostRate: number;     // 0.45 - 0.70
  laborCostIndex: number;       // 0.80 - 1.30
  materialsCostIndex: number;   // 0.80 - 1.30
  logisticsCostIndex: number;   // 0.70 - 1.40
  overheadRate: number;         // 0.08 - 0.18
  taxRate: number;              // 0.15 - 0.30
  financingCostRate: number;    // 0.04 - 0.12 (APR)
  riskContingencyNeed: number;  // 0.03 - 0.15 (advisory buffer)
  capacity: number;             // 1 - 3 contracts per round
  reputationScore: number;      // 0 - 100
  qualityLevel: number;         // 1 - 5 stars
  speedLevel: number;           // 1 - 5 stars (faster delivery)
  costEfficiency: number;       // 1 - 5 stars (lower manufacturing cost)
  deliveryCapabilityDays: number;// Base turnaround in days
  targetProfitMargin: number;   // 0.05 - 0.35 player-set goal
}

// RFQ & Contract Specifications (§4 & §5)
export interface RFQ {
  id: string;
  roundNumber: number;
  scenarioId: IndustryScenarioId;
  scenarioName: string;
  title: string;
  description: string;
  budgetCeiling: number;
  auctionFormat: AuctionFormat;
  
  // Baseline Cost Units
  baseLaborHours: number;
  laborRate: number;
  baseMaterialsQty: number;
  unitMaterialCost: number;
  baseLogisticsUnits: number;
  logisticsUnitCost: number;
  paymentDelayDays: number;
  requiredDeliveryDays: number;
  requiredCompliance: string[]; // List of mandatory certs (e.g. ISO-9001)

  // Buyer Evaluation Weights (ranges shown to player, exact used for scoring)
  weights: {
    price: number;
    quality: number;
    timeline: number;
    reputation: number;
    risk: number;
    paymentTerms: number;
    sla: number;
    sustainability: number;
  };
  weightRanges?: {
    [key: string]: [number, number]; // e.g. price: [0.30, 0.40]
  };
}

// Player Commercial Quote (§4)
export interface Quote {
  playerId: string;
  playerName: string;
  price: number;
  priceTier?: number;              // 1 - 5 Scale (Independent)
  qualityTier?: number;            // 1 - 5 Scale (Independent)
  timelineTier?: number;           // 1 - 5 Scale (Independent)
  riskReputationScore?: number;    // 0 - 100 Score (Dependent on Price, Quality, Timeline)
  paymentTerms: PaymentTerms;
  deliveryDays: number;
  warrantyMonths: WarrantyPeriod;
  slaTier: SLATier;
  sustainability: SustainabilityLevel;
  complianceChecked: string[];
  riskDisclosureContingency: number; // Disclosed risk buffer %
  submittedAt: number;
  isLossLeader: boolean;
}

// Detailed Cost Breakdown Waterfall (§3.1)
export interface CostBreakdown {
  directLaborCost: number;
  directMaterialsCost: number;
  directLogisticsCost: number;
  directCostSubtotal: number;
  overheadAllocation: number;
  financingCost: number;
  riskContingencyAmount: number;
  totalDeliveryCost: number;
  fixedCostAbsorption: number;
  fullyLoadedCost: number; // FLC
  targetBidPrice: number;
  quotedMarginPct: number;
  isLossLeader: boolean;
}

// Live Auction State (§2)
export interface AuctionBidLog {
  timestamp: number;
  playerId: string;
  playerName: string;
  amount: number;
  isAi: boolean;
}

export interface AuctionExitLog {
  timestamp: number;
  playerId: string;
  playerName: string;
  exitPrice: number;
}

export interface AuctionState {
  format: AuctionFormat;
  status: 'IDLE' | 'BIDDING' | 'SOFT_CLOSE' | 'RESOLVED';
  currentPrice: number;
  budgetCeiling: number;
  timeRemaining: number;
  currentLeaderId: string | null;
  currentLeaderName: string | null;
  bids: AuctionBidLog[];
  activePlayerIds: string[]; // for Japanese auction
  exits: AuctionExitLog[];   // for Japanese auction
  winnerId: string | null;
  finalPrice: number;
  dutchTickCount: number;
}

// Dynamic Events (§7)
export interface DynamicEventCard {
  id: string;
  title: string;
  scenarioTarget?: IndustryScenarioId | 'all';
  type: string;
  description: string;
  materialsMultiplier?: number;  // e.g. +0.25
  laborMultiplier?: number;
  logisticsMultiplier?: number;
  budgetModifier?: number;        // e.g. -0.15
  reputationBonus?: number;
  financingRateMultiplier?: number;
  penaltyCost?: number;
  message: string;
}

// Buyer Evaluation Breakdown (§5)
export interface VendorCriterionScore {
  priceScore: number;
  qualityScore: number;
  timelineScore: number;
  reputationScore: number;
  complianceScore: number;
  riskScore: number;
  riskReputationScore?: number; // Merged composite score (0 - 100)
  paymentTermsScore: number;
  slaScore: number;
  sustainabilityScore: number;
  totalWeightedScore: number;
  passedGates: boolean;
  disqualificationReason?: string;
}

export interface BuyerEvaluationResult {
  winnerId: string;
  winnerName: string;
  winningPrice: number;
  scoresByPlayer: Record<string, VendorCriterionScore>;
  rankedPlayerIds: string[];
}

// Post-Auction P&L Result (§10 & §12)
export interface PnLResult {
  playerId: string;
  contractWon: boolean;
  quotedPrice: number;
  bidPrepCost: number;
  baselineCost: number;
  eventCostDelta: number;
  actualDeliveryCost: number;
  operatingProfit: number;
  tax: number;
  realizedProfit: number;
  quotedMarginPct: number;
  realizedMarginPct: number;
  marginVariancePts: number;
  volatilityPenalty: number;
  riskAdjustedProfit: number;
  reputationDelta: number;
  newReputation: number;
  reputationReason: string;
}

// Player State in Room
export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  isAi: boolean;
  aiPersonality?: AIPersonality;
  profile: CompanyProfile;
  score: number;
  bankedProfit: number;
  contractsWon: number;
  reputation: number;
  intelPoints: number;
  disciplineWalkaways: number;
  ready: boolean;
  submittedQuote: Quote | null;
  lastPnL?: PnLResult;
  history: PnLResult[];
}

// Room Configuration
export interface RoomConfig {
  code: string;
  hostId: string;
  scenarioId: IndustryScenarioId;
  totalRounds: number;
  currentRound: number;
  difficulty: GameDifficulty;
  auctionFormatSequence: AuctionFormat[];
  maxPlayers: number;
  createdAt: number;
}
