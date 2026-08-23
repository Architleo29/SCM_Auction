// Forward English Auction — Multi-Buyer Purse Mode Engine
// Implements algorithms specified in algo_forward_auction.md

export type ForwardValuationMode = 'private' | 'common';

export interface ForwardItem {
  id: string;
  name: string;
  category: string;
  description: string;
  baseMarketValue: number;
  startingPrice: number;
  bidIncrement: number;
  trueValue?: number; // In Common Value mode: identical for all, hidden until settlement
}

export interface ForwardBuyerState {
  id: string;
  name: string;
  isAi: boolean;
  startingPurse: number;
  remainingPurse: number;
  itemsWon: Array<{
    item: ForwardItem;
    pricePaid: number;
    valuation: number; // What it was worth to this buyer (or True Value in common mode)
  }>;
  totalSurplus: number;
  // Valuation maps item.id -> valuation / estimate
  valuations: Record<string, {
    privateValue?: number; // Mode A
    estimate?: number;     // Mode B
    noiseRoll?: number;    // Mode B
  }>;
}

export interface ForwardAuctionState {
  currentItemIndex: number;
  currentItem: ForwardItem;
  currentHighestBid: number;
  currentLeaderId: string | null;
  currentLeaderName: string | null;
  timeRemaining: number;
  valuationMode: ForwardValuationMode;
  bids: Array<{
    timestamp: number;
    playerId: string;
    playerName: string;
    amount: number;
    isAi: boolean;
  }>;
  status: 'BIDDING' | 'RESOLVED' | 'COMPLETED';
}

// Standard Catalog of Industrial & Supply Chain Assets
export const FORWARD_CATALOG_PRESETS: ForwardItem[] = [
  {
    id: 'lot_01_haas_cnc',
    name: '5-Axis Haas CNC Milling Station',
    category: 'Industrial Machinery',
    description: 'High-precision automated CNC machining unit with robotic tool changer.',
    baseMarketValue: 450000,
    startingPrice: 50000,
    bidIncrement: 10000
  },
  {
    id: 'lot_02_ev_fleet',
    name: 'Electric Fleet Delivery Vans (x3 Units)',
    category: 'Logistics Assets',
    description: 'Commercial grade 3.5T electric cargo vans with fast-charging infrastructure.',
    baseMarketValue: 600000,
    startingPrice: 75000,
    bidIncrement: 15000
  },
  {
    id: 'lot_03_automated_racking',
    name: 'High-Density Automated Pallet Racking',
    category: 'Warehousing IP',
    description: 'Automated storage and retrieval system (ASRS) for 1,200 pallet bays.',
    baseMarketValue: 380000,
    startingPrice: 40000,
    bidIncrement: 10000
  },
  {
    id: 'lot_04_lithium_reserve',
    name: 'Grade-A Lithium Iron Phosphate Stockpile (15 Tons)',
    category: 'Raw Materials',
    description: 'Certified battery-grade raw materials stockpile with verified purity assays.',
    baseMarketValue: 750000,
    startingPrice: 100000,
    bidIncrement: 20000
  },
  {
    id: 'lot_05_wms_source_license',
    name: 'Enterprise WMS Proprietary Software License',
    category: 'Software IP',
    description: 'Perpetual enterprise license for AI-optimized warehouse execution software.',
    baseMarketValue: 520000,
    startingPrice: 60000,
    bidIncrement: 15000
  },
  {
    id: 'lot_06_solar_microgrid',
    name: '150kW Rooftop Solar & BESS Microgrid',
    category: 'Energy Infrastructure',
    description: 'Turnkey industrial solar array with 300kWh energy storage cabinet.',
    baseMarketValue: 680000,
    startingPrice: 80000,
    bidIncrement: 15000
  },
  {
    id: 'lot_07_cold_chain_hub',
    name: '-20°C Deep-Freeze Pharma Cold Storage Facility',
    category: 'Cold Chain IP',
    description: 'Precision temperature-controlled pharmaceutical cold storage depot.',
    baseMarketValue: 580000,
    startingPrice: 70000,
    bidIncrement: 15000
  },
  {
    id: 'lot_08_robotic_welding_cell',
    name: 'Dual 6-Axis Robotic Welding Automation Cell',
    category: 'Industrial Machinery',
    description: 'High-speed robotic laser welding station for structural chassis.',
    baseMarketValue: 420000,
    startingPrice: 45000,
    bidIncrement: 10000
  },
  {
    id: 'lot_09_container_straddle_carrier',
    name: 'Diesel-Electric Port Straddle Carrier',
    category: 'Logistics Assets',
    description: 'Heavy-lift intermodal container transfer vehicle with telescopic spreader.',
    baseMarketValue: 820000,
    startingPrice: 110000,
    bidIncrement: 20000
  },
  {
    id: 'lot_10_hydrogen_fuel_depot',
    name: '500kg/Day Green Hydrogen Fueling Dispensary',
    category: 'Energy Infrastructure',
    description: 'Modular high-pressure hydrogen dispensing station for zero-emission fleets.',
    baseMarketValue: 640000,
    startingPrice: 80000,
    bidIncrement: 15000
  },
  {
    id: 'lot_11_rfid_crossdock_sorter',
    name: 'High-Speed Shoe Sorter & Cross-Dock Conveyor',
    category: 'Warehousing IP',
    description: 'Automated 12,000 unit/hour parcel sortation matrix with RFID tunnels.',
    baseMarketValue: 490000,
    startingPrice: 55000,
    bidIncrement: 10000
  },
  {
    id: 'lot_12_aerospace_autoclave',
    name: '3.5-Meter Carbon Composite Curing Autoclave',
    category: 'Raw Materials & IP',
    description: 'Precision thermal autoclave for high-performance carbon-fiber structures.',
    baseMarketValue: 790000,
    startingPrice: 95000,
    bidIncrement: 20000
  }
];

// Valuation Generator per algo_forward_auction.md §2
export function generateBuyerValuations(
  catalog: ForwardItem[],
  buyerId: string,
  mode: ForwardValuationMode
): Record<string, { privateValue?: number; estimate?: number; noiseRoll?: number }> {
  const valuations: Record<string, { privateValue?: number; estimate?: number; noiseRoll?: number }> = {};

  catalog.forEach(item => {
    if (mode === 'private') {
      // Mode A — Private Value: Item_Value = Base_Market_Value * Private_Interest_Roll (0.70 to 1.40)
      const roll = 0.70 + Math.random() * 0.70; // 0.70 - 1.40
      const privateValue = Math.round(item.baseMarketValue * roll);
      valuations[item.id] = { privateValue };
    } else {
      // Mode B — Common Value: True_Value = Base_Market_Value, Buyer_Estimate = True_Value * Noise_Roll (0.80 to 1.20)
      const noiseRoll = 0.80 + Math.random() * 0.40; // 0.80 - 1.20 (mean 1.0)
      const estimate = Math.round(item.baseMarketValue * noiseRoll);
      valuations[item.id] = { estimate, noiseRoll };
    }
  });

  return valuations;
}

// Minimum Reserve Requirement per algo_forward_auction.md §4
export function getReserveRequirement(startingPurse: number, roundsRemaining: number): number {
  if (roundsRemaining <= 3) {
    return 0; // Final 3 lots: spend-down allowed
  }
  return Math.round(startingPurse * 0.10); // Hold at least 10% reserve
}

// Shading Factor for Winner's Curse Defense per algo_forward_auction.md §3.2
export function getShadingFactor(activeBidderCount: number): number {
  // Shading_Factor(n) = clamp(1.15 - 0.05 * n, 0.60, 1.00)
  const raw = 1.15 - 0.05 * activeBidderCount;
  return Math.max(0.60, Math.min(1.00, raw));
}

// Target Bid Ceiling per algo_forward_auction.md §3.2
export function getBuyerBidCeiling(
  buyer: ForwardBuyerState,
  item: ForwardItem,
  mode: ForwardValuationMode,
  activeBidderCount: number = 3
): number {
  const valuationData = buyer.valuations[item.id];
  if (!valuationData) return item.baseMarketValue;

  if (mode === 'private') {
    return valuationData.privateValue || item.baseMarketValue;
  } else {
    const estimate = valuationData.estimate || item.baseMarketValue;
    const shading = getShadingFactor(activeBidderCount);
    return Math.round(estimate * shading);
  }
}

// AI Bid Decision per algo_forward_auction.md §3.1
export function shouldAiBidInForwardAuction(
  buyer: ForwardBuyerState,
  item: ForwardItem,
  currentHighestBid: number,
  roundsRemaining: number,
  mode: ForwardValuationMode,
  activeBidderCount: number = 3
): { shouldBid: boolean; nextBidAmount: number; rationale: string } {
  const proposedBid = currentHighestBid > 0 
    ? currentHighestBid + item.bidIncrement 
    : item.startingPrice;

  // 1. Purse Affordability Check
  const reserveReq = getReserveRequirement(buyer.startingPurse, roundsRemaining);
  const maxSpendable = buyer.remainingPurse - reserveReq;

  if (proposedBid > maxSpendable) {
    return {
      shouldBid: false,
      nextBidAmount: proposedBid,
      rationale: 'Proposed bid ₹' + proposedBid.toLocaleString() + ' exceeds spendable purse (₹' + maxSpendable.toLocaleString() + ' after reserve).'
    };
  }

  // 2. Value Ceiling Check
  const bidCeiling = getBuyerBidCeiling(buyer, item, mode, activeBidderCount);

  if (proposedBid > bidCeiling) {
    return {
      shouldBid: false,
      nextBidAmount: proposedBid,
      rationale: 'Proposed bid ₹' + proposedBid.toLocaleString() + ' exceeds valuation ceiling of ₹' + bidCeiling.toLocaleString() + '.'
    };
  }

  // 3. Bid Acceptance
  return {
    shouldBid: true,
    nextBidAmount: proposedBid,
    rationale: 'Bid ₹' + proposedBid.toLocaleString() + ' is within ceiling (₹' + bidCeiling.toLocaleString() + ').'
  };
}

// Portfolio Settlement & Scoring per algo_forward_auction.md §3.3
export function calculateForwardPortfolioScore(
  buyer: ForwardBuyerState,
  mode: ForwardValuationMode
): { totalValueCaptured: number; totalPricePaid: number; netSurplus: number } {
  let totalValueCaptured = 0;
  let totalPricePaid = 0;

  buyer.itemsWon.forEach(record => {
    totalPricePaid += record.pricePaid;
    if (mode === 'private') {
      totalValueCaptured += record.valuation;
    } else {
      totalValueCaptured += record.item.baseMarketValue;
    }
  });

  const netSurplus = totalValueCaptured - totalPricePaid;
  return {
    totalValueCaptured,
    totalPricePaid,
    netSurplus
  };
}
