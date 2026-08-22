import { DynamicEventCard } from '../types/game';

export const DYNAMIC_EVENTS_DECK: DynamicEventCard[] = [
  {
    id: 'event-supply-chain',
    title: 'Supply-Chain Disruption',
    type: 'materials_shock',
    description: 'A global shipping bottleneck and semiconductor shortage halts raw material deliveries.',
    materialsMultiplier: 0.25, // +25% materials cost
    message: 'Raw material procurement costs surged +25% on active delivery lines.'
  },
  {
    id: 'event-inflation-spike',
    title: 'Macro Inflation Spike',
    type: 'market_inflation',
    description: 'Central bank reports unexpected CPI surge, raising domestic labor and transport rates.',
    laborMultiplier: 0.08,
    materialsMultiplier: 0.08,
    logisticsMultiplier: 0.08,
    message: 'All baseline operating cost indices increased +8% market-wide.'
  },
  {
    id: 'event-intel-leak',
    title: 'Competitor Intelligence Leak',
    type: 'meta_intel',
    description: 'An industry trade journal publishes confidential supplier benchmarking data.',
    reputationBonus: 2,
    message: 'Market intelligence data leaked! Rival vendor cost benchmarks partially revealed.'
  },
  {
    id: 'event-client-budget-cut',
    title: 'Client Budget Cutback',
    type: 'buyer_renegotiation',
    description: 'Buyer board mandates an immediate 15% procurement cost reduction.',
    budgetModifier: -0.15,
    message: 'Buyer enforces a 15% contract price reduction or forfeiture.'
  },
  {
    id: 'event-spec-change',
    title: 'Mid-Project Specification Change',
    type: 'rework',
    description: 'Client engineering team updates technical tolerances, requiring unbudgeted rework.',
    materialsMultiplier: 0.15,
    laborMultiplier: 0.10,
    message: 'Engineering change order requires ₹15,000+ in unbudgeted rework.'
  },
  {
    id: 'event-deadline-pressure',
    title: 'Expedited Delivery Crunch',
    type: 'timeline_rush',
    description: 'Client accelerates launch schedule; offers bonus rush fee or liquidated damages.',
    logisticsMultiplier: 0.20,
    message: 'Expedited freight required to meet compressed delivery deadline (+20% logistics).'
  },
  {
    id: 'event-contract-penalty',
    title: 'Contractual SLA Penalty Triggered',
    type: 'penalty',
    description: 'Sub-tier supplier defect triggers an agreed liquidated damages clause.',
    penaltyCost: 18000,
    message: 'Pre-agreed SLA defect penalty deducted (₹18,000 direct penalty).'
  },
  {
    id: 'event-hidden-cost',
    title: 'Hidden Environmental Compliance Discovery',
    type: 'unbudgeted_risk',
    description: 'Local regulatory audit uncovers hazardous waste mitigation fees.',
    penaltyCost: 12500,
    message: 'Unbudgeted environmental mitigation costs surfaced (₹12,500).'
  },
  {
    id: 'event-capacity-shock',
    title: 'Factory Equipment Breakdown',
    type: 'capacity_shock',
    description: 'Primary CNC tooling line suffers hydraulic failure, straining plant capacity.',
    penaltyCost: 9000,
    message: 'Emergency repair and overtime labor added (₹9,000 overhead).'
  },
  {
    id: 'event-macro-demand',
    title: 'Industry Demand Boom',
    type: 'market_boom',
    description: 'Surge in regional capital expenditure drives buyer budgets up for upcoming quarters.',
    budgetModifier: 0.20,
    message: 'Market demand surged! Future RFQ budget ceilings increased +20%.'
  },
  {
    id: 'event-reputation-windfall',
    title: 'Exemplary Delivery Referral',
    type: 'reputation_bonus',
    description: 'Buyer highlights vendor in industry procurement keynote for flawless execution.',
    reputationBonus: 10,
    message: 'Client referral keynote boosts vendor reputation +10 and awards bonus Intel Points!'
  },
  {
    id: 'event-financing-spike',
    title: 'Cost of Capital Rate Spike',
    type: 'interest_rate',
    description: 'Commercial lending rates climb, increasing upfront milestone financing costs.',
    financingRateMultiplier: 1.5,
    message: 'Financing interest rates increased +50% on milestone/delayed payment terms.'
  }
];

export function drawRandomEvent(): DynamicEventCard {
  const index = Math.floor(Math.random() * DYNAMIC_EVENTS_DECK.length);
  return DYNAMIC_EVENTS_DECK[index];
}
