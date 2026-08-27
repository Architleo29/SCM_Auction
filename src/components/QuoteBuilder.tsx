import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Clock, 
  Send, 
  Star, 
  Layers, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import { RFQ, PlayerState, Quote } from '../types/game';
import { calculateCostBreakdown } from '../engine/costCalculator';
import { formatINR } from '../utils/formatters';

interface QuoteBuilderProps {
  rfq: RFQ;
  player: PlayerState;
  onSubmitQuote: (quote: Quote) => void;
  timeRemainingSeconds: number;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  rfq,
  player,
  onSubmitQuote,
  timeRemainingSeconds
}) => {
  const profile = player.profile;

  // 1. Quality USP Focus (1 to 5 Stars)
  const [qualityTier, setQualityTier] = useState<number>(3); // Standard 3★
  const [priceTier, setPriceTier] = useState<number>(3); // Tier 3

  // Dynamic effective profile updated when quality tier changes
  const effectiveProfile = useMemo(() => {
    return {
      ...profile,
      qualityLevel: qualityTier
    };
  }, [profile, qualityTier]);

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Baseline cost breakdown at initial 3★
  const initialFlc = useMemo(() => {
    return calculateCostBreakdown({ ...profile, qualityLevel: 3 }, rfq).fullyLoadedCost;
  }, [profile, rfq]);

  // Initial Price (e.g. 90% of ceiling or 1.12x FLC)
  const initialCalculatedPrice = Math.min(Math.round(rfq.budgetCeiling * 0.90), Math.round(initialFlc * 1.12));
  const [price, setPrice] = useState<number>(initialCalculatedPrice);
  const [priceInput, setPriceInput] = useState<string>(initialCalculatedPrice.toString());

  // Recompute cost breakdown live whenever qualityTier or price changes
  const breakdown = useMemo(() => {
    return calculateCostBreakdown(effectiveProfile, rfq, price);
  }, [effectiveProfile, rfq, price]);

  // When quality tier changes: ONLY change qualityTier (do not overwrite selling price!)
  // This causes Variable Costs to rise/fall immediately, changing the Gross Margin and Net Profit!
  const handleQualityTierChange = (newQ: number) => {
    setQualityTier(newQ);
  };

  // Helper for price tier calculation
  const calculatedPriceForTier = (tier: number, flc: number, ceiling: number) => {
    if (tier === 1) return Math.min(Math.round(ceiling * 0.98), Math.round(flc * 1.30));
    if (tier === 2) return Math.min(Math.round(ceiling * 0.94), Math.round(flc * 1.20));
    if (tier === 3) return Math.min(Math.round(ceiling * 0.90), Math.round(flc * 1.12));
    if (tier === 4) return Math.min(Math.round(ceiling * 0.85), Math.round(flc * 1.06));
    return Math.min(Math.round(flc * 1.02), Math.round(ceiling * 0.72));
  };

  // When price tier changes
  const handlePriceTierChange = (newTier: number) => {
    setPriceTier(newTier);
    const calculated = calculatedPriceForTier(newTier, breakdown.fullyLoadedCost, rfq.budgetCeiling);
    setPrice(calculated);
    setPriceInput(calculated.toString());
  };

  // Direct custom price input - allows typing ANY number without clamping during typing
  const handleDirectPriceChange = (textVal: string) => {
    setPriceInput(textVal);
    const cleaned = textVal.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      return;
    }
    const p = Number(cleaned);
    if (!isNaN(p) && p > 0) {
      setPrice(p);
      const flc = breakdown.fullyLoadedCost;
      const marginPct = flc > 0 ? (p - flc) / p : 0.15;
      
      if (marginPct >= 0.25) setPriceTier(1);
      else if (marginPct >= 0.16) setPriceTier(2);
      else if (marginPct >= 0.10) setPriceTier(3);
      else if (marginPct >= 0.04) setPriceTier(4);
      else setPriceTier(5);
    }
  };

  const handlePriceBlur = () => {
    if (priceInput.trim() === '' || Number(priceInput) <= 0) {
      setPriceInput(price.toString());
    } else {
      setPriceInput(price.toString());
    }
  };

  // Local countdown timer (90s)
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(timeRemainingSeconds || 90);

  useEffect(() => {
    if (timeRemainingSeconds !== undefined) {
      setLocalTimeRemaining(timeRemainingSeconds);
    }
  }, [timeRemainingSeconds]);

  useEffect(() => {
    if (hasSubmitted) return;
    const timer = setInterval(() => {
      setLocalTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasSubmitted]);

  // Live P&L Income Statement Calculations
  const grossQuotedRevenue = price;
  const variableDirectCosts = breakdown.directCostSubtotal; // Direct Labor + Materials + Logistics
  const grossContributionMargin = grossQuotedRevenue - variableDirectCosts;
  const grossContributionMarginPct = grossQuotedRevenue > 0 ? (grossContributionMargin / grossQuotedRevenue) * 100 : 0;
  
  const fixedOverhead = breakdown.fixedCostAbsorption + breakdown.overheadAllocation + breakdown.financingCost;
  const fullyLoadedCost = breakdown.fullyLoadedCost;
  
  const projectedOperatingProfit = grossQuotedRevenue - fullyLoadedCost;
  const projectedOperatingMarginPct = grossQuotedRevenue > 0 ? (projectedOperatingProfit / grossQuotedRevenue) * 100 : 0;
  
  const taxRate = profile.taxRate || 0.20;
  const projectedTax = projectedOperatingProfit > 0 ? Math.round(projectedOperatingProfit * taxRate) : 0;
  const projectedNetProfit = projectedOperatingProfit - projectedTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuote: Quote = {
      playerId: player.id,
      playerName: player.name,
      price,
      priceTier,
      qualityTier,
      timelineTier: 3,
      riskReputationScore: 100,
      paymentTerms: 'net_30',
      deliveryDays: rfq.requiredDeliveryDays || 30,
      warrantyMonths: 12,
      slaTier: 'standard',
      sustainability: 'standard',
      complianceChecked: ['ISO-9001'],
      riskDisclosureContingency: 0.05,
      submittedAt: Date.now(),
      isLossLeader: breakdown.isLossLeader
    };

    setHasSubmitted(true);
    onSubmitQuote(finalQuote);
  };

  return (
    <div className="max-w-6xl mx-auto p-3.5 sm:p-6 space-y-5 animate-fade-in">
      
      {/* Header & Synchronized Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Step 3 • Strategic USP & Quoting
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your Quality Level (1–5★) and Bid Price. Your variable costs and net profit margin update live below.
          </p>
        </div>

        {/* Synchronized Countdown Timer */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 shrink-0 font-mono ${
          localTimeRemaining <= 15
            ? 'bg-rose-950/60 text-rose-300 border-rose-800 animate-pulse'
            : 'bg-slate-950 text-slate-200 border-slate-800'
        }`}>
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[0.625rem] text-slate-500 uppercase">Quoting Deadline</p>
            <p className="text-xl font-bold">{localTimeRemaining}s Remaining</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: 1-5 Scale USP Selectors (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Buyer QCBS Evaluation Target Guide */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-indigo-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Buyer Evaluation Weights
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Price: {(rfq.weights.price * 100).toFixed(0)}%
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  Quality: {(rfq.weights.quality * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Your Quality Points ({qualityTier}★ / 5★):</span>
                <strong className="text-amber-400">
                  {qualityTier * 20} pts ({((qualityTier / 5) * (rfq.weights.quality || 0.40) * 100).toFixed(1)} weighted pts)
                </strong>
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">
                {qualityTier === 5 
                  ? '🌟 5★ Flagship awards maximum 100 technical points! You have a massive head start and do not need the lowest price to win.' 
                  : qualityTier === 4 
                  ? '✨ 4★ Premium gives 80 technical points. Strong technical foundation with moderate variable cost.' 
                  : qualityTier === 3 
                  ? '⚖️ 3★ Standard is baseline. Balance your price against quality to stay competitive.' 
                  : '⚡ Lower quality reduces direct costs but yields low technical points. You must bid near the price floor to win!'}
              </p>
            </div>
          </div>

          {/* USP 1: Quality Tier (1 to 5 Scale) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                1. Select Quality Level (Scale 1 to 5★)
              </span>
              <span className="text-amber-400 font-bold font-mono text-sm">{qualityTier}★ / 5★</span>
            </div>

            <p className="text-xs text-slate-400">
              ⚡ <strong>Economic Tradeoff:</strong> Higher quality increases variable costs (+30% at 5★), reducing margin but awarding 100% technical score.
            </p>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { lvl: 1, name: 'Economy', cost: '-20% Cost' },
                { lvl: 2, name: 'Value', cost: '-10% Cost' },
                { lvl: 3, name: 'Standard', cost: 'Base Cost' },
                { lvl: 4, name: 'Premium', cost: '+15% Cost' },
                { lvl: 5, name: 'Flagship', cost: '+30% Cost' }
              ].map(q => (
                <button
                  key={q.lvl}
                  type="button"
                  onClick={() => handleQualityTierChange(q.lvl)}
                  className={`py-2.5 rounded-2xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    qualityTier === q.lvl
                      ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-md shadow-amber-600/20 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{q.lvl}★</span>
                  <span className="text-[10px] text-slate-400 font-normal">{q.name}</span>
                  <span className={`text-[9px] font-mono mt-0.5 ${
                    q.lvl > 3 ? 'text-rose-400' : q.lvl < 3 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>{q.cost}</span>
                </button>
              ))}
            </div>
          </div>

          {/* USP 2: Price Aggressiveness Tier (1 to 5 Scale) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                2. Select Bid Price Position
              </span>
              <span className="text-xs font-mono text-slate-400">
                Starting Limit: <strong className="text-slate-200">{formatINR(rfq.budgetCeiling)}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              ⚡ <strong>Economic Tradeoff:</strong> Lower prices undercut rivals to score higher on Price, but leave smaller profit margin.
            </p>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { lvl: 1, name: 'High Margin', margin: '~25%' },
                { lvl: 2, name: 'Target', margin: '~18%' },
                { lvl: 3, name: 'Balanced', margin: '~12%' },
                { lvl: 4, name: 'Aggressive', margin: '~6%' },
                { lvl: 5, name: 'Price Blitz', margin: '~2%' }
              ].map(p => (
                <button
                  key={p.lvl}
                  type="button"
                  onClick={() => handlePriceTierChange(p.lvl)}
                  className={`py-2.5 rounded-2xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    priceTier === p.lvl
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-600/20 ring-1 ring-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs">Tier {p.lvl}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{p.margin}</span>
                </button>
              ))}
            </div>

            {/* Direct Selling Price Box */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <label className="text-xs font-mono text-slate-300 shrink-0">Your Selling Bid Price:</label>
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={(e) => handleDirectPriceChange(e.target.value)}
                  onBlur={handlePriceBlur}
                  placeholder="Enter custom bid price"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2 text-base font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Direct Costs Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Cost Summary for {qualityTier}★
              </span>
              <span>Fully Loaded Cost: <strong className="text-slate-200">{formatINR(fullyLoadedCost)}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>• Variable Costs ({qualityTier}★): <strong className="text-indigo-300">{formatINR(variableDirectCosts)}</strong></div>
              <div>• Fixed Overhead: <strong className="text-amber-300">{formatINR(fixedOverhead)}</strong></div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Income Statement (P&L) (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Live Real-Time Income Statement (P&L)
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                projectedOperatingMarginPct >= 10 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : projectedOperatingMarginPct > 0 
                  ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                Net Margin: {projectedOperatingMarginPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5 font-mono text-xs">
              
              {/* Revenue */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-300 font-bold">1. Quoted Selling Price (Revenue)</span>
                <span className="text-base font-bold text-emerald-400">{formatINR(grossQuotedRevenue)}</span>
              </div>

              {/* Variable Costs */}
              <div className="flex justify-between items-center text-slate-400">
                <span className="pl-3">• Less: Variable Costs ({qualityTier}★ Materials & Labor)</span>
                <span className="text-rose-400 font-semibold">- {formatINR(variableDirectCosts)}</span>
              </div>

              {/* Gross Margin */}
              <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200">
                <span className="font-semibold">= Gross Contribution Margin</span>
                <span className="font-bold text-emerald-300">{formatINR(grossContributionMargin)} ({grossContributionMarginPct.toFixed(1)}%)</span>
              </div>

              {/* Fixed Costs */}
              <div className="flex justify-between items-center text-slate-400">
                <span className="pl-3">• Less: Fixed Overhead & Rent</span>
                <span className="text-rose-400 font-semibold">- {formatINR(fixedOverhead)}</span>
              </div>

              {/* Operating Profit */}
              <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200">
                <span className="font-semibold">= Operating Profit (EBIT)</span>
                <span className={`font-bold ${projectedOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(projectedOperatingProfit)}
                </span>
              </div>

              {/* Taxes */}
              {projectedOperatingProfit > 0 && (
                <div className="flex justify-between items-center text-slate-400">
                  <span className="pl-3">• Less: Taxes ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="text-slate-500">- {formatINR(projectedTax)}</span>
                </div>
              )}

              {/* Realized Net Profit */}
              <div className={`flex justify-between items-center p-3.5 rounded-xl border mt-2 ${
                projectedNetProfit >= 0 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div>
                  <span className="font-bold uppercase text-xs block">Realized Net Profit</span>
                  <span className="text-[10px] opacity-75 font-normal">Added directly to your Banked Cash Balance</span>
                </div>
                <span className="text-xl font-bold font-mono">
                  {formatINR(projectedNetProfit)}
                </span>
              </div>

            </div>

            {/* Submit Quote Button */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={hasSubmitted}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {hasSubmitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Quote Submitted • Launching Live Arena...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Lock Strategy & Enter Live Auction Floor</span>
                  </>
                )}
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
