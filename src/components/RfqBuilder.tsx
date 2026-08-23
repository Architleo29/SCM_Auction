import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Award, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Gavel, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Percent,
  Check
} from 'lucide-react';
import { RFQ, IndustryScenarioId, AuctionFormat, SLATier } from '../types/game';
import { SCENARIOS } from '../data/scenarios';
import { sounds } from '../utils/soundEffects';
import { formatINR } from '../utils/formatters';

interface RfqBuilderProps {
  initialScenarioId: IndustryScenarioId;
  selectedAuctionFormat: AuctionFormat;
  roundNumber: number;
  onPublishRfq: (rfq: RFQ) => void;
  onBackToMainScreen?: () => void;
}

type WeightKey = 'price' | 'quality' | 'timeline' | 'riskReputation';

interface WeightsState {
  price: number;
  quality: number;
  timeline: number;
  riskReputation: number;
}

const MIN_WEIGHT = 5;
const MAX_WEIGHT = 75;

const PRESET_WEIGHTS: Record<string, { label: string; weights: WeightsState }> = {
  balanced: {
    label: '⚖️ Balanced Standard',
    weights: { price: 35, quality: 30, timeline: 20, riskReputation: 15 }
  },
  price_heavy: {
    label: '💰 Lowest Price Focus',
    weights: { price: 60, quality: 15, timeline: 15, riskReputation: 10 }
  },
  quality_heavy: {
    label: '⭐ Quality First (5★)',
    weights: { price: 25, quality: 45, timeline: 15, riskReputation: 15 }
  },
  speed_heavy: {
    label: '⚡ Urgent Fast-Track (T5)',
    weights: { price: 25, quality: 15, timeline: 45, riskReputation: 15 }
  }
};

const ALL_COMPLIANCE_OPTIONS = [
  'ISO-9001',
  'AS9100',
  'OSHA-18001',
  'IATF-16949',
  'ISO-14001',
  'Cleanroom Class-10k'
];

function adjustWeights(
  current: WeightsState,
  changedKey: WeightKey,
  rawNewValue: number
): WeightsState {
  const newValue = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, rawNewValue));
  const otherKeys = (Object.keys(current) as WeightKey[]).filter(k => k !== changedKey);
  
  const currentOtherSum = otherKeys.reduce((sum, k) => sum + current[k], 0);
  const targetOtherSum = 100 - newValue;

  if (targetOtherSum <= 0) return current;

  const newWeights: WeightsState = { ...current, [changedKey]: newValue };

  let runningSum = 0;
  otherKeys.forEach((key, idx) => {
    if (idx === otherKeys.length - 1) {
      newWeights[key] = Math.max(MIN_WEIGHT, targetOtherSum - runningSum);
    } else {
      const proportion = currentOtherSum > 0 ? current[key] / currentOtherSum : 1 / otherKeys.length;
      const allocated = Math.max(MIN_WEIGHT, Math.round(targetOtherSum * proportion));
      newWeights[key] = allocated;
      runningSum += allocated;
    }
  });

  // Final check to guarantee exact 100
  const actualTotal = (Object.keys(newWeights) as WeightKey[]).reduce((s, k) => s + newWeights[k], 0);
  const diff = 100 - actualTotal;
  if (diff !== 0) {
    const adjustKey = otherKeys[0];
    newWeights[adjustKey] = Math.max(MIN_WEIGHT, newWeights[adjustKey] + diff);
  }

  return newWeights;
}

export const RfqBuilder: React.FC<RfqBuilderProps> = ({
  initialScenarioId,
  selectedAuctionFormat,
  roundNumber,
  onPublishRfq,
  onBackToMainScreen
}) => {
  const [scenarioId, setScenarioId] = useState<IndustryScenarioId>(initialScenarioId);
  const [auctionFormat, setAuctionFormat] = useState<AuctionFormat>(selectedAuctionFormat);
  
  // Contract specs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetCeiling, setBudgetCeiling] = useState(500000);
  const [baseLaborHours, setBaseLaborHours] = useState(2200);
  const [laborRate, setLaborRate] = useState(50);
  const [baseMaterialsQty, setBaseMaterialsQty] = useState(1200);
  const [unitMaterialCost, setUnitMaterialCost] = useState(120);
  const [baseLogisticsUnits, setBaseLogisticsUnits] = useState(150);
  const [logisticsUnitCost, setLogisticsUnitCost] = useState(180);
  const [requiredDeliveryDays, setRequiredDeliveryDays] = useState(30);
  const [paymentDelayDays, setPaymentDelayDays] = useState(30);
  const [requiredCompliance, setRequiredCompliance] = useState<string[]>(['ISO-9001']);
  const [preferredSla, setPreferredSla] = useState<SLATier>('standard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Weights (Percentages strictly auto-balanced to 100%)
  const [weights, setWeights] = useState<WeightsState>({
    price: 35,
    quality: 30,
    timeline: 20,
    riskReputation: 15
  });

  // Live estimated baseline calculations
  const directLabor = baseLaborHours * laborRate;
  const directMaterials = baseMaterialsQty * unitMaterialCost;
  const directLogistics = baseLogisticsUnits * logisticsUnitCost;
  const directSubtotal = directLabor + directMaterials + directLogistics;
  const estOverhead = Math.round(directSubtotal * 0.15);
  const estBaselineFlc = directSubtotal + estOverhead;
  const impliedMarginPct = budgetCeiling > 0 
    ? Math.round(((budgetCeiling - estBaselineFlc) / budgetCeiling) * 100) 
    : 0;

  // Auto-Fill / Preset Loader with dynamic variation
  const handleAutoSelect = (targetScenario?: IndustryScenarioId, randomize: boolean = false) => {
    sounds.bid();
    const sId = targetScenario || scenarioId;
    const scenario = SCENARIOS[sId];
    const sample = scenario.sampleRfqs[0];

    // Multipliers for randomized variation
    const scale = randomize ? (0.85 + Math.random() * 0.40) : 1.0;
    const newBudget = Math.round((sample.budgetCeiling * scale) / 10000) * 10000;
    const newLaborHours = Math.round(sample.baseLaborHours * scale);
    const newLaborRate = sample.laborRate;
    const newMaterialsQty = Math.round(sample.baseMaterialsQty * scale);
    const newMaterialCost = sample.unitMaterialCost;
    const newLogisticsUnits = Math.round(sample.baseLogisticsUnits * scale);
    const newLogisticsUnitCost = sample.logisticsUnitCost;
    const newDeliveryDays = randomize 
      ? Math.max(15, Math.round(sample.requiredDeliveryDays + (Math.floor(Math.random() * 5) - 2) * 5)) 
      : sample.requiredDeliveryDays;

    setTitle(sample.title);
    setDescription(sample.description);
    setBudgetCeiling(newBudget);
    setBaseLaborHours(newLaborHours);
    setLaborRate(newLaborRate);
    setBaseMaterialsQty(newMaterialsQty);
    setUnitMaterialCost(newMaterialCost);
    setBaseLogisticsUnits(newLogisticsUnits);
    setLogisticsUnitCost(newLogisticsUnitCost);
    setRequiredDeliveryDays(newDeliveryDays);
    setPaymentDelayDays(sample.paymentDelayDays);
    setRequiredCompliance([...sample.requiredCompliance]);

    const sw = sample.weights;
    const total4 = (sw.price || 0.35) + (sw.quality || 0.30) + (sw.timeline || 0.20) + (sw.reputation || 0.10) + (sw.risk || 0.05);
    const p = Math.round(((sw.price || 0.35) / total4) * 100);
    const q = Math.round(((sw.quality || 0.30) / total4) * 100);
    const t = Math.round(((sw.timeline || 0.20) / total4) * 100);
    const rr = 100 - (p + q + t);

    setWeights({
      price: p,
      quality: q,
      timeline: t,
      riskReputation: rr
    });

    if (randomize) {
      setToastMessage(`✨ Auto-Generated realistic specs for ${scenario.name} (Budget: ${formatINR(newBudget)}, ${newDeliveryDays} Days)!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  useEffect(() => {
    handleAutoSelect(scenarioId, false);
  }, [scenarioId]);

  const handleWeightChange = (key: WeightKey, value: number) => {
    setWeights(prev => adjustWeights(prev, key, value));
  };

  const handleToggleCompliance = (cert: string) => {
    setRequiredCompliance(prev => 
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const totalWeight = weights.price + weights.quality + weights.timeline + weights.riskReputation;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.award();

    const normPrice = weights.price / 100;
    const normQuality = weights.quality / 100;
    const normTimeline = weights.timeline / 100;
    const normRiskRep = weights.riskReputation / 100;
    const normReputation = normRiskRep * 0.60;
    const normRisk = normRiskRep * 0.40;

    const rfq: RFQ = {
      id: `rfq_${Date.now()}`,
      roundNumber,
      scenarioId,
      scenarioName: SCENARIOS[scenarioId].name,
      title: title || `${SCENARIOS[scenarioId].name} Procurement Contract`,
      description: description || SCENARIOS[scenarioId].description,
      budgetCeiling,
      auctionFormat,
      baseLaborHours,
      laborRate,
      baseMaterialsQty,
      unitMaterialCost,
      baseLogisticsUnits,
      logisticsUnitCost,
      paymentDelayDays,
      requiredDeliveryDays,
      requiredCompliance,
      weights: {
        price: Number(normPrice.toFixed(2)),
        quality: Number(normQuality.toFixed(2)),
        timeline: Number(normTimeline.toFixed(2)),
        reputation: Number(normReputation.toFixed(2)),
        risk: Number(normRisk.toFixed(2)),
        paymentTerms: 0.05,
        sla: preferredSla === 'premium' ? 0.15 : 0.05,
        sustainability: SCENARIOS[scenarioId].sampleRfqs[0].weights.sustainability || 0
      },
      weightRanges: {
        price: [Number(Math.max(0.1, normPrice - 0.05).toFixed(2)), Number(Math.min(0.8, normPrice + 0.05).toFixed(2))],
        quality: [Number(Math.max(0.05, normQuality - 0.05).toFixed(2)), Number(Math.min(0.5, normQuality + 0.05).toFixed(2))],
        timeline: [Number(Math.max(0.05, normTimeline - 0.05).toFixed(2)), Number(Math.min(0.5, normTimeline + 0.05).toFixed(2))],
        reputation: [Number(Math.max(0.05, normRiskRep - 0.05).toFixed(2)), Number(Math.min(0.5, normRiskRep + 0.05).toFixed(2))]
      }
    };

    onPublishRfq(rfq);
  };

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-6 animate-fade-in">
      
      {/* Header with Quick Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Procurement Host Control • Round {roundNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Architect Contract & Tender Parameters</h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize commercial terms, budget ceiling in INR (₹), direct drivers, and auto-balanced evaluation weights (100%).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onBackToMainScreen && (
            <button
              type="button"
              onClick={onBackToMainScreen}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAutoSelect(scenarioId, true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95"
            title="Generates and auto-fills realistic industry specifications"
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ Auto-Select Realistic Specs</span>
          </button>
        </div>
      </div>

      {/* Dynamic Toast Feedback Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        
        {/* Scenario & Auction Format Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Industry Scenario
            </label>
            <select
              value={scenarioId}
              onChange={(e) => {
                const newScenario = e.target.value as IndustryScenarioId;
                setScenarioId(newScenario);
                handleAutoSelect(newScenario, false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {Object.values(SCENARIOS).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 font-mono flex justify-between">
              <span>Dominant Risk:</span>
              <span className="text-amber-400 capitalize font-bold">{SCENARIOS[scenarioId].dominantRisk}</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-300 font-mono flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              Dynamic Auction Format
            </label>
            <select
              value={auctionFormat}
              onChange={(e) => setAuctionFormat(e.target.value as AuctionFormat)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 capitalize cursor-pointer"
            >
              <option value="english">Reverse English (Descending Counter-Bidding)</option>
              <option value="dutch">Reverse Dutch (Ascending Clock Ticker)</option>
              <option value="japanese">Reverse Japanese (Descending Hold-to-Stay)</option>
            </select>
            <p className="text-xs text-slate-400 font-mono">
              {auctionFormat === 'english' && 'Real-time open counter-bidding with anti-sniping clock.'}
              {auctionFormat === 'dutch' && 'Clock ascends upward from 65% until first vendor buzzes.'}
              {auctionFormat === 'japanese' && 'Price descends in rounds; vendors hold button to remain.'}
            </p>
          </div>

        </div>

        {/* Commercial Terms & Dynamic Budget Slider */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-indigo-400">
              <FileText className="w-4 h-4" />
              Commercial Scope & Auction Starting Price
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] text-slate-400 uppercase font-mono">Quick Starting Price:</span>
              {[250000, 500000, 1000000, 2000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetCeiling(val)}
                  className={`px-2 py-0.5 rounded text-[0.625rem] font-mono transition cursor-pointer ${
                    budgetCeiling === val 
                      ? 'bg-emerald-600 text-white font-bold' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ₹{(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Contract Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Industrial Automation System Delivery"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">Auction Starting Price (Max Budget)</label>
                <span className="text-base font-mono font-bold text-emerald-400">{formatINR(budgetCeiling)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={4000000}
                step={10000}
                value={budgetCeiling}
                onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Cost Drivers (Editable by Host) */}
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-2">
              Direct Cost Waterfall Variables
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Labor Hours</label>
                <input
                  type="number"
                  value={baseLaborHours}
                  onChange={(e) => setBaseLaborHours(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Labor Rate (₹/hr)</label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(e) => setLaborRate(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Materials Qty</label>
                <input
                  type="number"
                  value={baseMaterialsQty}
                  onChange={(e) => setBaseMaterialsQty(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Material Unit (₹)</label>
                <input
                  type="number"
                  value={unitMaterialCost}
                  onChange={(e) => setUnitMaterialCost(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Logistics Units</label>
                <input
                  type="number"
                  value={baseLogisticsUnits}
                  onChange={(e) => setBaseLogisticsUnits(Math.max(5, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Delivery Days</label>
                <input
                  type="number"
                  value={requiredDeliveryDays}
                  onChange={(e) => setRequiredDeliveryDays(Math.max(5, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm font-mono font-bold text-amber-400 focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* Live Baseline Cost Preview */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Estimated Industry Delivery Baseline:</span>
              <strong className="text-slate-100">{formatINR(estBaselineFlc)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Implied Ceiling Margin:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                impliedMarginPct >= 15 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {impliedMarginPct}%
              </span>
            </div>
          </div>

          {/* Compliance Checkboxes & SLA Tier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2">Mandatory Compliance Checklists</label>
              <div className="flex flex-wrap gap-2">
                {ALL_COMPLIANCE_OPTIONS.map(cert => {
                  const isChecked = requiredCompliance.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleToggleCompliance(cert)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' 
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                      <span>{cert}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2">Preferred SLA Tier Requirement</label>
              <div className="grid grid-cols-3 gap-2">
                {(['basic', 'standard', 'premium'] as SLATier[]).map(sla => (
                  <button
                    key={sla}
                    type="button"
                    onClick={() => setPreferredSla(sla)}
                    className={`py-2 rounded-xl text-xs font-mono capitalize transition cursor-pointer ${
                      preferredSla === sla 
                        ? 'bg-indigo-600 text-white font-bold shadow-md' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sla}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Buyer Multi-Criteria Evaluation Weights Sliders (Guaranteed 100%) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-cyan-400">
                <Sliders className="w-4 h-4" />
                Buyer Evaluation Weights (Sum: <span className="text-emerald-400 font-bold">{totalWeight}%</span>)
              </div>
              <p className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">
                In quotation: Price, Quality & Timeline are independent (1–5 scale). Risk & Reputation is merged and dependent on the previous 3 parameters.
              </p>
            </div>
            
            {/* Quick Strategy Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              {Object.entries(PRESET_WEIGHTS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWeights({ ...preset.weights })}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[0.625rem] font-mono text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Stacked Multi-Segment Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
              <div style={{ width: `${weights.price}%` }} className="bg-emerald-500 transition-all duration-150" title={`Price: ${weights.price}%`} />
              <div style={{ width: `${weights.quality}%` }} className="bg-indigo-500 transition-all duration-150" title={`Quality: ${weights.quality}%`} />
              <div style={{ width: `${weights.timeline}%` }} className="bg-amber-500 transition-all duration-150" title={`Timeline: ${weights.timeline}%`} />
              <div style={{ width: `${weights.riskReputation}%` }} className="bg-purple-500 transition-all duration-150" title={`Risk & Reputation: ${weights.riskReputation}%`} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[0.625rem] font-mono text-slate-400 pt-0.5">
              <span className="text-emerald-400 font-bold">💰 Price (1-5) {weights.price}%</span>
              <span className="text-indigo-400 font-bold">⭐ Quality (1-5★) {weights.quality}%</span>
              <span className="text-amber-400 font-bold">⏱️ Timeline (1-5T) {weights.timeline}%</span>
              <span className="text-purple-400 font-bold">🛡️ Risk & Rep (Merged) {weights.riskReputation}%</span>
            </div>
          </div>

          {/* Sliders Grid (4 Clean Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            
            {/* Pillar 1: Price Weight */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold">💰 1. Price Weight</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">{weights.price}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.price}
                onChange={(e) => handleWeightChange('price', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[0.625rem] text-slate-500 font-mono block">Independent (Scale 1–5 Level)</span>
            </div>

            {/* Pillar 2: Quality Weight */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold">⭐ 2. Quality Weight</span>
                <span className="font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">{weights.quality}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.quality}
                onChange={(e) => handleWeightChange('quality', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[0.625rem] text-slate-500 font-mono block">Independent (Scale 1–5 Stars)</span>
            </div>

            {/* Pillar 3: Timeline Weight */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold">⏱️ 3. Timeline Weight</span>
                <span className="font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">{weights.timeline}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.timeline}
                onChange={(e) => handleWeightChange('timeline', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[0.625rem] text-slate-500 font-mono block">Independent (Scale 1–5 Speed)</span>
            </div>

            {/* Pillar 4: Risk & Reputation (Merged) Weight */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold">🛡️ 4. Risk & Reputation</span>
                <span className="font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">{weights.riskReputation}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.riskReputation}
                onChange={(e) => handleWeightChange('riskReputation', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-[0.625rem] text-purple-300 font-mono block">Merged & Dependent on 1, 2, 3</span>
            </div>

          </div>
        </div>

        {/* Action Button: Publish & Begin Bidding */}
        <div className="flex justify-end pt-2 pb-safe">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[3.25rem]"
          >
            🚀 Publish RFQ Tender to All Vendors
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>

    </div>
  );
};
