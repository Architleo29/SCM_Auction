import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  DollarSign, 
  FileText, 
  ArrowLeft,
  Gavel,
  Award,
  Scale
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

const PRESET_WEIGHTS = [
  { label: '⚖️ Balanced', sub: '50% Price / 50% Quality', price: 50, quality: 50 },
  { label: '💰 Price First', sub: '70% Price / 30% Quality', price: 70, quality: 30 },
  { label: '⭐ Quality First', sub: '30% Price / 70% Quality', price: 30, quality: 70 },
  { label: '💎 Premium Blend', sub: '40% Price / 60% Quality', price: 40, quality: 60 }
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      setToastMessage(`✨ Auto-Generated Tender (Starting Price: ${formatINR(newBudget)})!`);
      setTimeout(() => setToastMessage(null), 3500);
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
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-6 animate-fade-in">
      
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
            Set the auction starting price and balance the Buyer's Price vs Quality scoring weights.
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
            onClick={() => handleAutoSelect(true)}
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
        
        {/* 1. Live Auction Format Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <label className="block text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            1. Live Auction Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'english', label: '🔨 Reverse English', desc: 'Price drops with open counter-bids' },
              { id: 'dutch', label: '⏳ Reverse Dutch', desc: 'Price rises every 2s until first buzz' },
              { id: 'japanese', label: '🇯🇵 Reverse Japanese', desc: 'Price steps down in clock rounds' }
            ].map(fmt => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setAuctionFormat(fmt.id as AuctionFormat)}
                className={`p-3.5 rounded-2xl border text-left text-xs font-mono transition cursor-pointer ${
                  auctionFormat === fmt.id
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-bold text-sm block text-slate-100">{fmt.label}</span>
                <span className="text-xs text-slate-400 block mt-1">{fmt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Commercial Terms & Starting Price */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-400">
              <DollarSign className="w-4 h-4" />
              2. Commercial Scope & Starting Price
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] text-slate-400 uppercase font-mono">Quick Preset:</span>
              {[250000, 500000, 1000000, 2000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetCeiling(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    budgetCeiling === val 
                      ? 'bg-emerald-600 text-white font-bold shadow-sm' 
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
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Contract Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Industrial Automation Equipment Delivery"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
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
          </div>
        </div>

        {/* 3. Buyer Evaluation Weights (Price vs Quality) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          
          {/* Header & Description */}
          <div className="border-b border-slate-800 pb-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-cyan-400">
              <Scale className="w-4 h-4" />
              3. Buyer Evaluation Weights (Price vs. Quality • Total 100%)
            </div>
            <p className="text-xs text-slate-400">
              Balance how your procurement evaluation committee scores competing proposals.
            </p>
          </div>

          {/* Quick Strategy Presets Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
              Quick Weight Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_WEIGHTS.map((preset, idx) => {
                const isActive = priceWeight === preset.price;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPriceWeight(preset.price)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-slate-100">{preset.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">{preset.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Stacked Dual-Segment Ratio Bar */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
              <div 
                style={{ width: `${priceWeight}%` }} 
                className="bg-emerald-500 transition-all duration-200 flex items-center justify-center text-xs font-mono font-bold text-slate-950"
              >
                {priceWeight}% Price
              </div>
              <div 
                style={{ width: `${qualityWeight}%` }} 
                className="bg-indigo-500 transition-all duration-200 flex items-center justify-center text-xs font-mono font-bold text-white"
              >
                {qualityWeight}% Quality
              </div>
            </div>
          </div>

          {/* Sliders Grid (2 Clean Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Pillar 1: Price Weight */}
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
                Higher weight rewards cheaper supplier bids
              </span>
            </div>

            {/* Pillar 2: Quality Weight */}
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
                Higher weight rewards 4-5★ premium standards
              </span>
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
