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
  ArrowLeft
} from 'lucide-react';
import { RFQ, IndustryScenarioId, AuctionFormat } from '../types/game';
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

type WeightKey = 'price' | 'quality' | 'timeline' | 'reputation' | 'risk';

interface WeightsState {
  price: number;
  quality: number;
  timeline: number;
  reputation: number;
  risk: number;
}

const MIN_WEIGHT = 5;
const MAX_WEIGHT = 70;

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

  // Weights (Percentages strictly auto-balanced to 100%)
  const [weights, setWeights] = useState<WeightsState>({
    price: 35,
    quality: 25,
    timeline: 15,
    reputation: 15,
    risk: 10
  });

  // Auto-Fill / Auto-Select Preset Function
  const handleAutoSelect = (targetScenario?: IndustryScenarioId) => {
    sounds.bid();
    const sId = targetScenario || scenarioId;
    const scenario = SCENARIOS[sId];
    const sample = scenario.sampleRfqs[0];

    setTitle(sample.title);
    setDescription(sample.description);
    setBudgetCeiling(sample.budgetCeiling);
    setBaseLaborHours(sample.baseLaborHours);
    setLaborRate(sample.laborRate);
    setBaseMaterialsQty(sample.baseMaterialsQty);
    setUnitMaterialCost(sample.unitMaterialCost);
    setBaseLogisticsUnits(sample.baseLogisticsUnits);
    setLogisticsUnitCost(sample.logisticsUnitCost);
    setRequiredDeliveryDays(sample.requiredDeliveryDays);
    setPaymentDelayDays(sample.paymentDelayDays);
    setRequiredCompliance([...sample.requiredCompliance]);

    const sw = sample.weights;
    const total5 = (sw.price || 0.35) + (sw.quality || 0.20) + (sw.timeline || 0.15) + (sw.reputation || 0.15) + (sw.risk || 0.10);
    const p = Math.round(((sw.price || 0.35) / total5) * 100);
    const q = Math.round(((sw.quality || 0.20) / total5) * 100);
    const t = Math.round(((sw.timeline || 0.15) / total5) * 100);
    const r = Math.round(((sw.reputation || 0.15) / total5) * 100);
    const k = 100 - (p + q + t + r);

    setWeights({
      price: p,
      quality: q,
      timeline: t,
      reputation: r,
      risk: k
    });
  };

  // Load defaults on mount or scenario change
  useEffect(() => {
    handleAutoSelect(scenarioId);
  }, [scenarioId]);

  const handleWeightChange = (key: WeightKey, value: number) => {
    setWeights(prev => adjustWeights(prev, key, value));
  };

  const totalWeight = weights.price + weights.quality + weights.timeline + weights.reputation + weights.risk;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.award();

    // Weights sum to 100%, divide by 100 for 0.0 - 1.0 normalization
    const normPrice = weights.price / 100;
    const normQuality = weights.quality / 100;
    const normTimeline = weights.timeline / 100;
    const normReputation = weights.reputation / 100;
    const normRisk = weights.risk / 100;

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
        sla: 0,
        sustainability: SCENARIOS[scenarioId].sampleRfqs[0].weights.sustainability || 0
      },
      weightRanges: {
        price: [Number(Math.max(0.1, normPrice - 0.05).toFixed(2)), Number(Math.min(0.8, normPrice + 0.05).toFixed(2))],
        quality: [Number(Math.max(0.05, normQuality - 0.05).toFixed(2)), Number(Math.min(0.5, normQuality + 0.05).toFixed(2))],
        timeline: [Number(Math.max(0.05, normTimeline - 0.05).toFixed(2)), Number(Math.min(0.5, normTimeline + 0.05).toFixed(2))],
        reputation: [Number(Math.max(0.05, normReputation - 0.05).toFixed(2)), Number(Math.min(0.5, normReputation + 0.05).toFixed(2))],
        risk: [Number(Math.max(0.05, normRisk - 0.05).toFixed(2)), Number(Math.min(0.5, normRisk + 0.05).toFixed(2))]
      }
    };

    onPublishRfq(rfq);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      
      {/* Header with Quick Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Procurement Host Control • Round {roundNumber}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Build Your Tender Requirements</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the commercial scope, budget ceiling in INR, and evaluation weights for the upcoming auction.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Back to Main Screen Button */}
          {onBackToMainScreen && (
            <button
              type="button"
              onClick={onBackToMainScreen}
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Abort and return to Main Screen"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* 1-Click Auto-Fill Preset Button */}
          <button
            type="button"
            onClick={() => handleAutoSelect()}
            className="px-5 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50"
            title="Automatically fills realistic industry baseline numbers for this scenario"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>1-Click Auto-Select Defaults</span>
          </button>
        </div>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        
        {/* Scenario & Auction Format Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Industry Scenario
            </label>
            <select
              value={scenarioId}
              onChange={(e) => {
                const newScenario = e.target.value as IndustryScenarioId;
                setScenarioId(newScenario);
                handleAutoSelect(newScenario);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {Object.values(SCENARIOS).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 font-mono">
              Dominant Risk: <span className="text-amber-400 capitalize">{SCENARIOS[scenarioId].dominantRisk}</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-300 font-mono flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              Auction Format (§1.4)
            </label>
            <select
              value={auctionFormat}
              onChange={(e) => setAuctionFormat(e.target.value as AuctionFormat)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="english">Reverse English (Descending Counter-Bidding)</option>
              <option value="dutch">Reverse Dutch (Ascending Clock - First to Buzz)</option>
              <option value="japanese">Reverse Japanese (Descending Hold-to-Stay)</option>
            </select>
            <p className="text-xs text-slate-400 font-mono">
              {auctionFormat === 'english' && 'Real-time open counter-bidding against AI bots.'}
              {auctionFormat === 'dutch' && 'Clock ticks upward until the first vendor buzzes in.'}
              {auctionFormat === 'japanese' && 'Price drops continuously; players hold to stay in.'}
            </p>
          </div>

        </div>

        {/* Commercial Terms & Direct Specs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-indigo-400 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4" />
            Contract Commercial Terms & Scope
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Contract Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Turnkey Data Center Cooling Module"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Buyer Budget Ceiling (₹ INR)
              </label>
              <input
                type="number"
                step={5000}
                value={budgetCeiling}
                onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Scope Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed commercial description of the deliverables..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Cost Waterfall Driver Variables (§3.1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Base Labor Hours</label>
              <input
                type="number"
                value={baseLaborHours}
                onChange={(e) => setBaseLaborHours(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Labor Rate (₹/hr)</label>
              <input
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Materials Qty</label>
              <input
                type="number"
                value={baseMaterialsQty}
                onChange={(e) => setBaseMaterialsQty(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Material Cost (₹/unit)</label>
              <input
                type="number"
                value={unitMaterialCost}
                onChange={(e) => setUnitMaterialCost(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Logistics Units</label>
              <input
                type="number"
                value={baseLogisticsUnits}
                onChange={(e) => setBaseLogisticsUnits(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-slate-100 focus:outline-none mt-1"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="block text-[0.625rem] font-mono text-slate-400 uppercase">Delivery Days</label>
              <input
                type="number"
                value={requiredDeliveryDays}
                onChange={(e) => setRequiredDeliveryDays(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-mono font-bold text-amber-400 focus:outline-none mt-1"
              />
            </div>
          </div>

        </div>

        {/* Buyer Multi-Criteria Evaluation Weights Sliders (Guaranteed 100%) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-cyan-400">
              <Sliders className="w-4 h-4" />
              Buyer Evaluation Weights (Sum: <span className="text-emerald-400 font-bold">{totalWeight}%</span>)
            </div>
            <span className="text-xs text-emerald-400/90 font-mono bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
              ✅ 100% Balanced Automatically
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
            
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">💰 Price</span>
                <span className="font-bold text-emerald-400">{weights.price}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.price}
                onChange={(e) => handleWeightChange('price', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">⭐ Quality</span>
                <span className="font-bold text-indigo-400">{weights.quality}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.quality}
                onChange={(e) => handleWeightChange('quality', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">⏱️ Timeline</span>
                <span className="font-bold text-amber-400">{weights.timeline}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.timeline}
                onChange={(e) => handleWeightChange('timeline', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">🛡️ Reputation</span>
                <span className="font-bold text-cyan-400">{weights.reputation}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.reputation}
                onChange={(e) => handleWeightChange('reputation', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">🛡️ Risk</span>
                <span className="font-bold text-rose-400">{weights.risk}%</span>
              </div>
              <input
                type="range"
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                value={weights.risk}
                onChange={(e) => handleWeightChange('risk', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

          </div>
        </div>

        {/* Action Button: Publish & Begin Bidding */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            🚀 Publish RFQ & Start Bidding Phase
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>

    </div>
  );
};
