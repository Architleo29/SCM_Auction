import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  DollarSign, 
  Clock, 
  FileText, 
  ArrowLeft,
  Gavel
} from 'lucide-react';
import { RFQ, IndustryScenarioId, AuctionFormat, SLATier } from '../types/game';
import { SCENARIOS } from '../data/scenarios';
import { formatINR } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';

interface RfqBuilderProps {
  initialScenarioId: IndustryScenarioId;
  selectedAuctionFormat: AuctionFormat;
  roundNumber: number;
  onPublishRfq: (rfq: RFQ) => void;
  onBackToMainScreen?: () => void;
}

interface WeightsState {
  price: number;
  quality: number;
  timeline: number;
  riskReputation: number;
}

type WeightKey = keyof WeightsState;

const MIN_WEIGHT = 10;
const MAX_WEIGHT = 60;

const PRESET_WEIGHTS: Record<string, { label: string; weights: WeightsState }> = {
  balanced: {
    label: '⚖️ Standard QCBS',
    weights: { price: 35, quality: 30, timeline: 20, riskReputation: 15 }
  },
  costDominant: {
    label: '💰 Price First',
    weights: { price: 55, quality: 20, timeline: 15, riskReputation: 10 }
  },
  qualityDominant: {
    label: '⭐ Quality & Trust',
    weights: { price: 20, quality: 45, timeline: 15, riskReputation: 20 }
  },
  speedDominant: {
    label: '⚡ Fast Track Delivery',
    weights: { price: 25, quality: 25, timeline: 40, riskReputation: 10 }
  }
};

function adjustWeights(
  currentWeights: WeightsState,
  changedKey: WeightKey,
  rawNewValue: number
): WeightsState {
  const clampedNewValue = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, rawNewValue));
  const otherKeys = (Object.keys(currentWeights) as WeightKey[]).filter(k => k !== changedKey);
  const remainingTotal = 100 - clampedNewValue;
  const currentOtherSum = otherKeys.reduce((sum, k) => sum + currentWeights[k], 0);

  const newWeights: WeightsState = { ...currentWeights, [changedKey]: clampedNewValue };

  if (currentOtherSum === 0) {
    const split = Math.floor(remainingTotal / otherKeys.length);
    otherKeys.forEach((k, idx) => {
      newWeights[k] = idx === 0 ? remainingTotal - split * (otherKeys.length - 1) : split;
    });
    return newWeights;
  }

  let distributedSum = 0;
  otherKeys.forEach((k, index) => {
    if (index === otherKeys.length - 1) {
      newWeights[k] = remainingTotal - distributedSum;
    } else {
      const share = Math.round((currentWeights[k] / currentOtherSum) * remainingTotal);
      const safeShare = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, share));
      newWeights[k] = safeShare;
      distributedSum += safeShare;
    }
  });

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
  const [requiredDeliveryDays, setRequiredDeliveryDays] = useState(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background direct drivers (auto-populated from scenario)
  const [baseLaborHours, setBaseLaborHours] = useState(2200);
  const [laborRate, setLaborRate] = useState(50);
  const [baseMaterialsQty, setBaseMaterialsQty] = useState(1200);
  const [unitMaterialCost, setUnitMaterialCost] = useState(120);
  const [baseLogisticsUnits, setBaseLogisticsUnits] = useState(150);
  const [logisticsUnitCost, setLogisticsUnitCost] = useState(180);
  const [paymentDelayDays, setPaymentDelayDays] = useState(30);
  const [requiredCompliance, setRequiredCompliance] = useState<string[]>(['ISO-9001']);
  const [preferredSla, setPreferredSla] = useState<SLATier>('standard');

  // Weights (Percentages strictly auto-balanced to 100%)
  const [weights, setWeights] = useState<WeightsState>({
    price: 35,
    quality: 30,
    timeline: 20,
    riskReputation: 15
  });

  // Auto-Fill / Preset Loader with dynamic variation
  const handleAutoSelect = (targetScenario?: IndustryScenarioId, randomize: boolean = false) => {
    sounds.bid();
    const sId = targetScenario || scenarioId;
    const scenario = SCENARIOS[sId];
    const sample = scenario.sampleRfqs[0];

    const scale = randomize ? (0.85 + Math.random() * 0.40) : 1.0;
    const newBudget = Math.round((sample.budgetCeiling * scale) / 10000) * 10000;
    const newDeliveryDays = randomize 
      ? Math.max(15, Math.round(sample.requiredDeliveryDays + (Math.floor(Math.random() * 5) - 2) * 5)) 
      : sample.requiredDeliveryDays;

    setTitle(sample.title);
    setDescription(sample.description);
    setBudgetCeiling(newBudget);
    setRequiredDeliveryDays(newDeliveryDays);

    setBaseLaborHours(Math.round(sample.baseLaborHours * scale));
    setLaborRate(sample.laborRate);
    setBaseMaterialsQty(Math.round(sample.baseMaterialsQty * scale));
    setUnitMaterialCost(sample.unitMaterialCost);
    setBaseLogisticsUnits(Math.round(sample.baseLogisticsUnits * scale));
    setLogisticsUnitCost(sample.logisticsUnitCost);
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
      setToastMessage(`✨ Auto-Generated tender for ${scenario.name} (Starting Price: ${formatINR(newBudget)}, ${newDeliveryDays} Days)!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  useEffect(() => {
    handleAutoSelect(scenarioId, false);
  }, [scenarioId]);

  const handleWeightChange = (key: WeightKey, value: number) => {
    setWeights(prev => adjustWeights(prev, key, value));
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
      requiredDeliveryDays,
      paymentDelayDays,
      requiredCompliance,
      preferredSla,
      weights: {
        price: normPrice,
        quality: normQuality,
        timeline: normTimeline,
        reputation: normReputation,
        risk: normRisk,
        paymentTerms: 0.05,
        sla: 0.05,
        sustainability: 0.05
      }
    };

    onPublishRfq(rfq);
  };

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Procurement Host Control • Round {roundNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Architect Tender & Evaluation Criteria</h2>
          <p className="text-xs text-slate-400 mt-1">
            Set the starting price ceiling and customize the buyer's 4 scoring weights (QCBS formula).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onBackToMainScreen && (
            <button
              type="button"
              onClick={onBackToMainScreen}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAutoSelect(undefined, true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Auto-Generate
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl text-xs font-mono text-indigo-300 animate-fade-in text-center shadow-lg">
          {toastMessage}
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        
        {/* Industry Scenario & Auction Format Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">
            1. Industry Sector & Live Auction Mechanics
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(SCENARIOS).map(sc => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setScenarioId(sc.id);
                  handleAutoSelect(sc.id, false);
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  scenarioId === sc.id
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-lg block mb-1">{sc.icon}</span>
                  <p className="text-xs font-bold text-slate-100">{sc.name}</p>
                </div>
                <span className="text-[0.625rem] font-mono text-slate-400 mt-2 block">{sc.region}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Auction Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'english', label: '🔨 Reverse English', desc: 'Price drops with counter-bids' },
                { id: 'dutch', label: '⏳ Reverse Dutch', desc: 'Price rises until 1st buzz' },
                { id: 'japanese', label: '🇯🇵 Reverse Japanese', desc: 'Price drops clock rounds' }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setAuctionFormat(fmt.id as AuctionFormat)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono transition cursor-pointer ${
                    auctionFormat === fmt.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block">{fmt.label}</span>
                  <span className="text-[0.625rem] text-slate-500 block mt-0.5">{fmt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Commercial Scope & Auction Starting Price */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-400">
              <DollarSign className="w-4 h-4" />
              2. Commercial Terms & Starting Price
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] text-slate-400 uppercase font-mono">Quick Preset:</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-mono text-slate-300 mb-1">Contract Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Industrial Automation Delivery"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="md:col-span-1">
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
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>

            <div className="md:col-span-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">Required Turnaround</label>
                <span className="text-base font-mono font-bold text-amber-400">{requiredDeliveryDays} Days</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={requiredDeliveryDays}
                onChange={(e) => setRequiredDeliveryDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Buyer Multi-Criteria Evaluation Weights Sliders (Guaranteed 100%) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-cyan-400">
                <Sliders className="w-4 h-4" />
                3. Buyer Evaluation Weights (QCBS Formula • Sum: <span className="text-emerald-400 font-bold">{totalWeight}%</span>)
              </div>
              <p className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">
                Set how your procurement committee scores competing vendor proposals.
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
              <span className="text-emerald-400 font-bold">💰 Price {weights.price}%</span>
              <span className="text-indigo-400 font-bold">⭐ Quality {weights.quality}%</span>
              <span className="text-amber-400 font-bold">⏱️ Timeline {weights.timeline}%</span>
              <span className="text-purple-400 font-bold">🛡️ Risk & Reputation {weights.riskReputation}%</span>
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
              <span className="text-[0.625rem] text-slate-500 font-mono block">Scale 1 – 5 Price Level</span>
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
              <span className="text-[0.625rem] text-slate-500 font-mono block">Scale 1 – 5 Stars</span>
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
              <span className="text-[0.625rem] text-slate-500 font-mono block">Scale 1 – 5 Speed</span>
            </div>

            {/* Pillar 4: Risk & Reputation Weight */}
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
              <span className="text-[0.625rem] text-slate-500 font-mono block">Vendor Track Record</span>
            </div>

          </div>
        </div>

        {/* Publish Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-2xl shadow-indigo-600/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Gavel className="w-5 h-5" />
            Publish Tender to Vendor Floor
          </button>
        </div>

      </form>
    </div>
  );
};
