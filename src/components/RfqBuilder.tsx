import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  ArrowLeft,
  Gavel,
  Scale,
  Star,
  Layers
} from 'lucide-react';
import { RFQ, IndustryScenarioId, AuctionFormat } from '../types/game';
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

const PRESETS = [
  { id: 'balanced', label: '⚖️ Balanced', desc: '50% Price • 50% Quality', price: 50 },
  { id: 'price_first', label: '💰 Price First', desc: '70% Price • 30% Quality', price: 70 },
  { id: 'quality_first', label: '⭐ Quality First', desc: '30% Price • 70% Quality', price: 30 },
  { id: 'premium', label: '💎 Premium Blend', desc: '40% Price • 60% Quality', price: 40 }
];

export const RfqBuilder: React.FC<RfqBuilderProps> = ({
  initialScenarioId,
  selectedAuctionFormat,
  roundNumber,
  onPublishRfq,
  onBackToMainScreen
}) => {
  const [scenarioId] = useState<IndustryScenarioId>(initialScenarioId);
  const [auctionFormat, setAuctionFormat] = useState<AuctionFormat>(selectedAuctionFormat);
  
  // Contract specs
  const [title, setTitle] = useState('Industrial Supply & Automation Contract');
  const [description, setDescription] = useState('Procurement contract under competitive auction and QCBS multi-criteria evaluation.');
  const [budgetCeiling, setBudgetCeiling] = useState(500000);
  const [priceWeight, setPriceWeight] = useState(60);
  const qualityWeight = 100 - priceWeight;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background direct drivers
  const [baseLaborHours, setBaseLaborHours] = useState(2200);
  const [laborRate, setLaborRate] = useState(50);
  const [baseMaterialsQty, setBaseMaterialsQty] = useState(1200);
  const [unitMaterialCost, setUnitMaterialCost] = useState(120);
  const [baseLogisticsUnits, setBaseLogisticsUnits] = useState(150);
  const [logisticsUnitCost, setLogisticsUnitCost] = useState(180);

  const handleAutoSelect = (randomize: boolean = false) => {
    sounds.bid();
    const scenario = SCENARIOS[scenarioId] || SCENARIOS['manufacturing'];
    const sample = scenario.sampleRfqs[0];

    const scale = randomize ? (0.85 + Math.random() * 0.40) : 1.0;
    const newBudget = Math.round((sample.budgetCeiling * scale) / 10000) * 10000;

    setTitle(sample.title);
    setDescription(sample.description);
    setBudgetCeiling(newBudget);

    setBaseLaborHours(Math.round(sample.baseLaborHours * scale));
    setLaborRate(sample.laborRate);
    setBaseMaterialsQty(Math.round(sample.baseMaterialsQty * scale));
    setUnitMaterialCost(sample.unitMaterialCost);
    setBaseLogisticsUnits(Math.round(sample.baseLogisticsUnits * scale));
    setLogisticsUnitCost(sample.logisticsUnitCost);

    if (randomize) {
      setToastMessage(`✨ Auto-generated tender values (Starting Price: ${formatINR(newBudget)})!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    handleAutoSelect(false);
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.award();

    const normPrice = priceWeight / 100;
    const normQuality = qualityWeight / 100;

    const rfq: RFQ = {
      id: `rfq_${Date.now()}`,
      roundNumber,
      scenarioId,
      scenarioName: 'Procurement Contract',
      title: title || 'Commercial Supply Contract',
      description: description || 'Procurement contract under competitive auction and QCBS evaluation criteria.',
      budgetCeiling,
      auctionFormat,
      baseLaborHours,
      laborRate,
      baseMaterialsQty,
      unitMaterialCost,
      baseLogisticsUnits,
      logisticsUnitCost,
      requiredDeliveryDays: 30,
      paymentDelayDays: 30,
      requiredCompliance: ['ISO-9001'],
      weights: {
        price: normPrice,
        quality: normQuality,
        timeline: 0,
        reputation: 0,
        risk: 0,
        paymentTerms: 0,
        sla: 0,
        sustainability: 0
      }
    };

    onPublishRfq(rfq);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      
      {/* 1. Header Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Procurement Host Architect • Round {roundNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Setup Auction & Scoring Criteria</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the starting price ceiling and balance the buyer's evaluation scoring weights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onBackToMainScreen && (
            <button
              type="button"
              onClick={onBackToMainScreen}
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAutoSelect(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Auto-Fill
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-indigo-950/90 border border-indigo-500/40 rounded-2xl text-xs font-mono text-indigo-200 text-center animate-fade-in shadow-lg">
          {toastMessage}
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        
        {/* 2. Auction Format Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-indigo-400">
            <Gavel className="w-4 h-4" />
            1. Select Live Auction Format
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'english', label: '🔨 Reverse English', desc: 'Price ticks down with open counter-bids from vendors' },
              { id: 'english', label: '⏳ Reverse English', desc: 'Price ticks upwards every 2s until the first bidder buzzes in' },
              { id: 'english', label: '🇯🇵 Reverse English', desc: 'Price steps down in discrete rounds; exiters cannot re-enter' }
            ].map(fmt => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setAuctionFormat(fmt.id as AuctionFormat)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  auctionFormat === fmt.id
                    ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block text-slate-100 mb-1">{fmt.label}</span>
                  <span className="text-xs text-slate-400 leading-relaxed block">{fmt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Contract Title & Starting Price Ceiling */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4" />
            2. Commercial Scope & Auction Starting Price
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Contract Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Turnkey Industrial Machinery Delivery"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Starting Price Slider & Presets */}
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-mono text-slate-300 font-semibold block">
                    Auction Starting Price (Max Limit)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Any vendor quote above this starting price is automatically rejected.
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    {formatINR(budgetCeiling)}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={100000}
                max={4000000}
                step={10000}
                value={budgetCeiling}
                onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs font-mono text-slate-500">Quick Presets:</span>
                {[250000, 500000, 1000000, 2000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBudgetCeiling(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${
                      budgetCeiling === val
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ₹{(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)} Lakhs
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Buyer Evaluation Weights (QCBS Formula) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          
          <div className="border-b border-slate-800 pb-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400">
              <Scale className="w-4 h-4" />
              3. Buyer Evaluation Weights (Price vs. Quality • Total 100%)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set how your procurement evaluation committee scores competing vendor proposals.
            </p>
          </div>

          {/* Quick Strategy Presets */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 font-semibold block">
              Quick Weight Presets:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {PRESETS.map(preset => {
                const isActive = priceWeight === preset.price;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPriceWeight(preset.price)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/20 ring-1 ring-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-slate-100">{preset.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
              <div 
                style={{ width: `${priceWeight}%` }} 
                className="bg-emerald-500 transition-all duration-150 flex items-center justify-center text-xs font-mono font-bold text-slate-950"
              >
                {priceWeight}% Price
              </div>
              <div 
                style={{ width: `${qualityWeight}%` }} 
                className="bg-indigo-500 transition-all duration-150 flex items-center justify-center text-xs font-mono font-bold text-white"
              >
                {qualityWeight}% Quality
              </div>
            </div>
          </div>

          {/* Interactive Dual Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            {/* Price Weight Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  💰 Price Weight
                </span>
                <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800 text-sm">
                  {priceWeight}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={5}
                value={priceWeight}
                onChange={(e) => setPriceWeight(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] text-slate-500 font-mono block">
                Higher weight rewards lower bid prices
              </span>
            </div>

            {/* Quality Weight Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  ⭐ Quality Weight
                </span>
                <span className="font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-xl border border-indigo-800 text-sm">
                  {qualityWeight}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={5}
                value={qualityWeight}
                onChange={(e) => setPriceWeight(100 - Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[11px] text-slate-500 font-mono block">
                Higher weight rewards 4–5★ premium quality
              </span>
            </div>

          </div>
        </div>

        {/* 5. Publish Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-2xl shadow-indigo-600/40 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <Gavel className="w-5 h-5" />
            <span>Publish Tender to Vendor Floor</span>
          </button>
        </div>

      </form>
    </div>
  );
};
