import { RFQ, IndustryScenarioId } from '../types/game';

export interface ScenarioDefinition {
  id: IndustryScenarioId;
  name: string;
  category: string;
  description: string;
  distinctMechanic: string;
  dominantRisk: string;
  typicalPriceWeight: number;
  sampleRfqs: Omit<RFQ, 'roundNumber'>[];
}

export const SCENARIOS: Record<IndustryScenarioId, ScenarioDefinition> = {
  manufacturing: {
    id: 'manufacturing',
    name: 'Industrial Manufacturing',
    category: 'Heavy Industry',
    description: 'Materials & logistics heavy contracts with binding assembly line capacity constraints.',
    distinctMechanic: 'Strict production line bottlenecks; materials cost swings.',
    dominantRisk: 'Supply-chain disruption & raw materials inflation.',
    typicalPriceWeight: 0.35,
    sampleRfqs: [
      {
        id: 'rfq-mfg-1',
        scenarioId: 'manufacturing',
        scenarioName: 'Industrial Manufacturing',
        title: 'Tier-1 Automotive Chassis Sub-Assembly',
        description: 'High-volume production run of 1,200 reinforced steel chassis components for an EV manufacturer.',
        budgetCeiling: 480000,
        auctionFormat: 'english',
        baseLaborHours: 2200,
        laborRate: 45,
        baseMaterialsQty: 1200,
        unitMaterialCost: 110,
        baseLogisticsUnits: 180,
        logisticsUnitCost: 160,
        paymentDelayDays: 30,
        requiredDeliveryDays: 30,
        requiredCompliance: ['ISO-9001', 'TS-16949'],
        weights: {
          price: 0.35,
          quality: 0.20,
          timeline: 0.15,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.30, 0.40],
          quality: [0.15, 0.25],
          timeline: [0.10, 0.20],
          reputation: [0.10, 0.20],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  construction: {
    id: 'construction',
    name: 'Civil Construction & Infrastructure',
    category: 'Civil Works',
    description: 'Materials and labor-heavy site projects susceptible to weather delays and change orders.',
    distinctMechanic: 'Site inspection event can trigger unbudgeted specification changes.',
    dominantRisk: 'Weather delays & materials price spikes.',
    typicalPriceWeight: 0.30,
    sampleRfqs: [
      {
        id: 'rfq-con-1',
        scenarioId: 'construction',
        scenarioName: 'Civil Construction & Infrastructure',
        title: 'Metro Rail Substation Structural Build',
        description: 'Reinforced concrete foundation and electrical substation superstructure build.',
        budgetCeiling: 650000,
        auctionFormat: 'dutch',
        baseLaborHours: 3500,
        laborRate: 52,
        baseMaterialsQty: 1800,
        unitMaterialCost: 140,
        baseLogisticsUnits: 120,
        logisticsUnitCost: 210,
        paymentDelayDays: 45,
        requiredDeliveryDays: 60,
        requiredCompliance: ['OSHA-30', 'Civil-Safety-Cert'],
        weights: {
          price: 0.30,
          quality: 0.25,
          timeline: 0.15,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.25, 0.35],
          quality: [0.20, 0.30],
          timeline: [0.10, 0.20],
          reputation: [0.10, 0.20],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  it_software: {
    id: 'it_software',
    name: 'Enterprise IT & Software Services',
    category: 'Technology',
    description: 'Pure labor and engineering velocity with near-zero direct materials.',
    distinctMechanic: 'Sprint velocity delivery timeline; strict cybersecurity gates.',
    dominantRisk: 'Scope creep & technical debt penalties.',
    typicalPriceWeight: 0.25,
    sampleRfqs: [
      {
        id: 'rfq-it-1',
        scenarioId: 'it_software',
        scenarioName: 'Enterprise IT & Software Services',
        title: 'Core Banking API Modernization & Cloud Migration',
        description: 'Microservices refactor and cloud deployment with 99.99% uptime SLA.',
        budgetCeiling: 380000,
        auctionFormat: 'japanese',
        baseLaborHours: 2400,
        laborRate: 85,
        baseMaterialsQty: 10,
        unitMaterialCost: 100,
        baseLogisticsUnits: 0,
        logisticsUnitCost: 0,
        paymentDelayDays: 30,
        requiredDeliveryDays: 45,
        requiredCompliance: ['SOC2-Type2', 'ISO-27001'],
        weights: {
          price: 0.25,
          quality: 0.25,
          timeline: 0.20,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.20, 0.30],
          quality: [0.20, 0.30],
          timeline: [0.15, 0.25],
          reputation: [0.10, 0.20],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  logistics: {
    id: 'logistics',
    name: 'Freight Logistics & Cold Chain',
    category: 'Transportation',
    description: 'Fleet-driven transport with high fuel sensitivity and strict delivery windows.',
    distinctMechanic: 'Delivery timeline is the dominant score driver.',
    dominantRisk: 'Fuel price spikes & route disruptions.',
    typicalPriceWeight: 0.40,
    sampleRfqs: [
      {
        id: 'rfq-log-1',
        scenarioId: 'logistics',
        scenarioName: 'Freight Logistics & Cold Chain',
        title: 'Nationwide Temperature-Controlled Vaccine Distribution',
        description: 'Multi-hub cold storage logistics and rapid fulfillment fleet operations.',
        budgetCeiling: 320000,
        auctionFormat: 'dutch',
        baseLaborHours: 1100,
        laborRate: 40,
        baseMaterialsQty: 250,
        unitMaterialCost: 80,
        baseLogisticsUnits: 450,
        logisticsUnitCost: 280,
        paymentDelayDays: 15,
        requiredDeliveryDays: 14,
        requiredCompliance: ['GDP-ColdChain', 'DOT-Safety'],
        weights: {
          price: 0.35,
          quality: 0.15,
          timeline: 0.25,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.0,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.30, 0.40],
          quality: [0.10, 0.20],
          timeline: [0.20, 0.30],
          reputation: [0.10, 0.20],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  consulting: {
    id: 'consulting',
    name: 'Strategic Management Consulting',
    category: 'Professional Services',
    description: 'High margin ceiling engagements where reputation and expertise dominate pricing.',
    distinctMechanic: 'Reputation weight is the highest of all scenarios (up to 25%).',
    dominantRisk: 'Client stakeholder churn & deliverable acceptance delays.',
    typicalPriceWeight: 0.20,
    sampleRfqs: [
      {
        id: 'rfq-con-1',
        scenarioId: 'consulting',
        scenarioName: 'Strategic Management Consulting',
        title: 'Global Supply Chain Network Optimization Strategy',
        description: 'Comprehensive footprint assessment and strategic sourcing restructuring roadmap.',
        budgetCeiling: 290000,
        auctionFormat: 'japanese',
        baseLaborHours: 1200,
        laborRate: 120,
        baseMaterialsQty: 0,
        unitMaterialCost: 0,
        baseLogisticsUnits: 20,
        logisticsUnitCost: 200,
        paymentDelayDays: 30,
        requiredDeliveryDays: 30,
        requiredCompliance: ['Partner-Level-Lead'],
        weights: {
          price: 0.20,
          quality: 0.25,
          timeline: 0.15,
          reputation: 0.25,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.15, 0.25],
          quality: [0.20, 0.30],
          timeline: [0.10, 0.20],
          reputation: [0.20, 0.30],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Biomedical Devices',
    category: 'Life Sciences',
    description: 'Heavily regulated medical hardware contracts with zero defect tolerance.',
    distinctMechanic: 'Regulatory non-compliance leads to automatic disqualification.',
    dominantRisk: 'FDA/MDR audit failures and sterilization recall costs.',
    typicalPriceWeight: 0.20,
    sampleRfqs: [
      {
        id: 'rfq-hc-1',
        scenarioId: 'healthcare',
        scenarioName: 'Healthcare & Biomedical Devices',
        title: 'Sterile Surgical Instrumentation Kits',
        description: 'Precision surgical tool manufacture and Class-III cleanroom packaging.',
        budgetCeiling: 520000,
        auctionFormat: 'english',
        baseLaborHours: 1900,
        laborRate: 65,
        baseMaterialsQty: 900,
        unitMaterialCost: 190,
        baseLogisticsUnits: 80,
        logisticsUnitCost: 350,
        paymentDelayDays: 60,
        requiredDeliveryDays: 28,
        requiredCompliance: ['ISO-13485', 'FDA-Cleanroom'],
        weights: {
          price: 0.20,
          quality: 0.30,
          timeline: 0.15,
          reputation: 0.15,
          risk: 0.15,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.15, 0.25],
          quality: [0.25, 0.35],
          timeline: [0.10, 0.20],
          reputation: [0.10, 0.20],
          risk: [0.10, 0.20]
        }
      }
    ]
  },
  energy: {
    id: 'energy',
    name: 'Renewable Energy & Utilities',
    category: 'Energy',
    description: 'Capital-intensive infrastructure with high financing exposure and ESG weighting.',
    distinctMechanic: 'High sustainability weighting and extended payment milestones.',
    dominantRisk: 'Commodity price shocks and interest rate spikes.',
    typicalPriceWeight: 0.25,
    sampleRfqs: [
      {
        id: 'rfq-en-1',
        scenarioId: 'energy',
        scenarioName: 'Renewable Energy & Utilities',
        title: '50MW Commercial Solar PV Grid Tie-in',
        description: 'Solar inverter array installation and high-voltage grid interconnection.',
        budgetCeiling: 720000,
        auctionFormat: 'english',
        baseLaborHours: 3200,
        laborRate: 58,
        baseMaterialsQty: 2200,
        unitMaterialCost: 150,
        baseLogisticsUnits: 250,
        logisticsUnitCost: 240,
        paymentDelayDays: 90,
        requiredDeliveryDays: 90,
        requiredCompliance: ['IEEE-1547', 'Grid-Safety-Gold'],
        weights: {
          price: 0.25,
          quality: 0.20,
          timeline: 0.15,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.10
        },
        weightRanges: {
          price: [0.20, 0.30],
          quality: [0.15, 0.25],
          timeline: [0.10, 0.20],
          reputation: [0.10, 0.20],
          risk: [0.05, 0.15]
        }
      }
    ]
  },
  government: {
    id: 'government',
    name: 'Government Public Tender',
    category: 'Public Sector',
    description: 'Bureaucratic public procurement with strict formal gates and audit transparency.',
    distinctMechanic: 'Compliance is a strict pass/fail gate before price is evaluated.',
    dominantRisk: 'Mid-cycle budget revisions and audit scrutiny.',
    typicalPriceWeight: 0.35,
    sampleRfqs: [
      {
        id: 'rfq-gov-1',
        scenarioId: 'government',
        scenarioName: 'Government Public Tender',
        title: 'Municipal Water Treatment Automation Overhaul',
        description: 'SCADA monitoring telemetry, automated valve actuators, and sensor array install.',
        budgetCeiling: 580000,
        auctionFormat: 'english',
        baseLaborHours: 2800,
        laborRate: 60,
        baseMaterialsQty: 1400,
        unitMaterialCost: 130,
        baseLogisticsUnits: 160,
        logisticsUnitCost: 180,
        paymentDelayDays: 60,
        requiredDeliveryDays: 45,
        requiredCompliance: ['Gov-Security-Clearance', 'EPA-Water-Spec'],
        weights: {
          price: 0.35,
          quality: 0.20,
          timeline: 0.15,
          reputation: 0.15,
          risk: 0.10,
          paymentTerms: 0.05,
          sla: 0.0,
          sustainability: 0.0
        },
        weightRanges: {
          price: [0.30, 0.40],
          quality: [0.15, 0.25],
          timeline: [0.10, 0.20],
          reputation: [0.10, 0.20],
          compliance: [0.10, 0.20]
        }
      }
    ]
  }
};
