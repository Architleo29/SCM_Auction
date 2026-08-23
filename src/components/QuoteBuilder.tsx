import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Percent, 
  AlertTriangle, 
  Lock, 
  Send, 
  CheckCircle2, 
  BarChart2,
  Sparkles,
  Zap,
  Star,
  Activity,
  Layers,
  Building2,
  FileSpreadsheet,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { RFQ, PlayerState, Quote, PaymentTerms, SLATier, SustainabilityLevel, WarrantyPeriod } from '../types/game';
import { calculateCostBreakdown, estimateWinProbability, calculateExpectedValue } from '../engine/costCalculator';
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

  // 1. Vendor Strategy Controls (1 to 5 Scale)
  const [qualityTier, setQualityTier] = useState<number>(profile.qualityLevel || 3); // 1 to 5 Stars
  const [timelineTier, setTimelineTier] = useState<number>(profile.speedLevel || 3); // 1 = Slow, 3 = Target, 5 = Rush
  const [costEfficiencyTier, setCostEfficiencyTier] = useState<number>(profile.costEfficiency || 3); // 1 = High Cost, 5 = Lean
  const [priceTier, setPriceTier] = useState<number>(3); // 1 = Defensive, 3 = Target, 5 = Aggressive

  // Turnaround days from timelineTier (1 = +10d, 2 = +5d, 3 = base, 4 = -5d, 5 = -10d)
  const deliveryDays = useMemo(() => {
    const deltaDays = (3 - timelineTier) * 5;
    return Math.max(5, rfq.requiredDeliveryDays + deltaDays);
  }, [timelineTier, rfq.requiredDeliveryDays]);

  // Dynamic effective profile updated by user's strategy selections
  const effectiveProfile = useMemo(() => {
    return {
      ...profile,
      qualityLevel: qualityTier,
      speedLevel: timelineTier,
      costEfficiency: costEfficiencyTier
    };
  }, [profile, qualityTier, timelineTier, costEfficiencyTier]);

  // Additional commercial parameters
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [warrantyMonths, setWarrantyMonths] = useState<WarrantyPeriod>(12);
  const [slaTier, setSlaTier] = useState<SLATier>('standard');
  const [sustainability, setSustainability] = useState<SustainabilityLevel>('standard');
  const [complianceChecked, setComplianceChecked] = useState<string[]>([...rfq.requiredCompliance]);
  const [riskContingencyRate, setRiskContingencyRate] = useState<number>(profile.riskContingencyNeed);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Initial baseline calculation
  const initialBaseline = useMemo(() => calculateCostBreakdown(effectiveProfile, rfq), [effectiveProfile, rfq]);
  const [price, setPrice] = useState<number>(initialBaseline.targetBidPrice);

  // Live Recalculation of Cost Breakdown & Fixed/Variable Costs
  const breakdown = useMemo(() => {
    return calculateCostBreakdown(effectiveProfile, rfq, price, riskContingencyRate);
  }, [effectiveProfile, rfq, price, riskContingencyRate]);

  // Sync Price when priceTier changes
  const handlePriceTierChange = (newTier: number) => {
    setPriceTier(newTier);
    const flc = breakdown.fullyLoadedCost;
    const ceiling = rfq.budgetCeiling;
    
    let targetP = flc * 1.15;
    if (newTier === 1) targetP = Math.min(ceiling * 0.98, flc * 1.35);
    else if (newTier === 2) targetP = Math.min(ceiling * 0.94, flc * 1.22);
    else if (newTier === 3) targetP = Math.min(ceiling * 0.90, flc * 1.15);
    else if (newTier === 4) targetP = Math.min(ceiling * 0.85, flc * 1.08);
    else if (newTier === 5) targetP = Math.max(flc * 1.03, ceiling * 0.72);
    
    setPrice(Math.round(targetP));
  };

  // Sync priceTier when user changes price directly
  const handleDirectPriceChange = (val: number) => {
    const p = Math.max(1000, val);
    setPrice(p);
    const flc = breakdown.fullyLoadedCost;
    const marginPct = flc > 0 ? (p - flc) / p : 0.15;
    
    if (marginPct >= 0.28) setPriceTier(1);
    else if (marginPct >= 0.18) setPriceTier(2);
    else if (marginPct >= 0.12) setPriceTier(3);
    else if (marginPct >= 0.06) setPriceTier(4);
    else setPriceTier(5);
  };

  // 2. Merged Dependent Parameter: Risk & Reputation Index
  const riskReputationAnalysis = useMemo(() => {
    const baseRep = player.reputation || profile.reputationScore || 75;
    const flc = breakdown.fullyLoadedCost;
    const marginPct = price > 0 ? (price - flc) / price : 0;
    
    let marginHealth = 70;
    if (marginPct >= 0.20) marginHealth = 100;
    else if (marginPct >= 0.12) marginHealth = 90;
    else if (marginPct >= 0.05) marginHealth = 75;
    else if (marginPct >= 0.0) marginHealth = 55;
    else marginHealth = 20;

    const demandLoad = (qualityTier * 0.5) + (timelineTier * 0.5);
    const priceCompensation = (6 - priceTier);
    const stressGap = demandLoad - priceCompensation;
    
    let stressPenalty = 0;
    if (stressGap > 2.0) stressPenalty = 25;
    else if (stressGap > 1.0) stressPenalty = 15;
    else if (stressGap > 0) stressPenalty = 5;
    else stressPenalty = -5;

    const contingencyBonus = (riskContingencyRate >= profile.riskContingencyNeed ? 8 : 0);
    const rawScore = (baseRep * 0.40) + (marginHealth * 0.45) - stressPenalty + contingencyBonus;
    const finalScore = Math.min(100, Math.max(10, Math.round(rawScore)));
    const scaleOf5 = Number((finalScore / 20).toFixed(1));

    let statusText = '';
    let statusColor = 'emerald';
    let statusLabel = 'Prime Vendor Trust';

    if (breakdown.isLossLeader || marginPct < 0) {
      statusText = '🚨 Severe Default Risk: Quoting below cost floor destroys financial stability and buyer confidence.';
      statusColor = 'rose';
      statusLabel = 'High Execution Risk';
    } else if (stressGap > 1.5) {
      statusText = '⚠️ Feasibility Strain: Promising maximum quality and rush speed at razor-thin margins creates high delivery risk.';
      statusColor = 'amber';
      statusLabel = 'Tight Margin Strain';
    } else if (finalScore >= 80) {
      statusText = '✅ Prime Supplier Standing: Healthy margins comfortably finance your quality and turnaround commitments.';
      statusColor = 'emerald';
      statusLabel = 'Low Risk • Prime Trust';
    } else {
      statusText = 'ℹ️ Standard Standing: Normal execution feasibility with adequate delivery buffers.';
      statusColor = 'indigo';
      statusLabel = 'Balanced Standing';
    }

    return {
      score: finalScore,
      scaleOf5,
      statusText,
      statusColor,
      statusLabel
    };
  }, [player.reputation, profile.reputationScore, breakdown.fullyLoadedCost, price, qualityTier, timelineTier, priceTier, riskContingencyRate, breakdown.isLossLeader, profile.riskContingencyNeed]);

  // Local countdown timer
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(timeRemainingSeconds || 45);

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

  // Live P&L Calculations based on Quoted Selling Price
  const grossQuotedRevenue = price;
  const variableDirectCosts = breakdown.directCostSubtotal; // Direct Labor + Materials + Logistics
  const grossContributionMargin = grossQuotedRevenue - variableDirectCosts;
  const grossContributionMarginPct = grossQuotedRevenue > 0 ? (grossContributionMargin / grossQuotedRevenue) * 100 : 0;
  
  const overheadAndFinancing = breakdown.overheadAllocation + breakdown.financingCost + breakdown.riskContingencyAmount;
  const fixedCostsAbsorption = breakdown.fixedCostAbsorption;
  const fullyLoadedCost = breakdown.fullyLoadedCost;
  
  const projectedOperatingProfit = grossQuotedRevenue - fullyLoadedCost;
  const projectedOperatingMarginPct = grossQuotedRevenue > 0 ? (projectedOperatingProfit / grossQuotedRevenue) * 100 : 0;
  
  const taxRate = profile.taxRate || 0.25;
  const projectedTax = projectedOperatingProfit > 0 ? Math.round(projectedOperatingProfit * taxRate) : 0;
  const projectedNetProfit = projectedOperatingProfit - projectedTax;

  // Chance of Winning & EV Estimate
  const winProb = useMemo(() => {
    const estMinPrice = rfq.budgetCeiling * 0.8; 
    const priceScore = price > 0 ? Math.min(1.0, Math.max(0.0, estMinPrice / price)) : 0.0;
    const slaBonus = slaTier === 'premium' ? 0.10 : slaTier === 'standard' ? 0.03 : 0.0;
    const qualityScore = Math.min(1.0, Math.max(0.0, (qualityTier / 5.0) + slaBonus));
    const timelineScore = deliveryDays <= rfq.requiredDeliveryDays
      ? Math.min(1.0, 0.80 + (rfq.requiredDeliveryDays - deliveryDays) * 0.04)
      : Math.max(0.0, 0.80 - (deliveryDays - rfq.requiredDeliveryDays) * 0.06);

    const mergedRiskRep = riskReputationAnalysis.score / 100.0;
    const riskRepWeight = (rfq.weights.reputation || 0.10) + (rfq.weights.risk || 0.05);

    const paymentMap = { net_60: 1.0, net_30: 0.85, milestone: 0.6, upfront_20: 0.3 };
    const paymentTermsScore = paymentMap[paymentTerms] || 0.6;

    const slaMap = { premium: 1.0, standard: 0.75, basic: 0.4 };
    const slaScore = slaMap[slaTier] || 0.6;

    const sustainabilityScore = sustainability === 'certified_green' ? 1.0 : 0.5;

    const estWeightedScore = (
      (rfq.weights.price * priceScore) +
      (rfq.weights.quality * qualityScore) +
      (rfq.weights.timeline * timelineScore) +
      (riskRepWeight * mergedRiskRep) +
      (rfq.weights.paymentTerms * paymentTermsScore) +
      (rfq.weights.sla * slaScore) +
      (rfq.weights.sustainability * sustainabilityScore)
    );

    return estimateWinProbability(estWeightedScore, 0.65);
  }, [price, qualityTier, deliveryDays, riskReputationAnalysis.score, paymentTerms, slaTier, sustainability, rfq]);

  const expectedValue = calculateExpectedValue(winProb, projectedOperatingProfit);

  const handleToggleCompliance = (cert: string) => {
    setComplianceChecked(prev => 
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuote: Quote = {
      playerId: player.id,
      playerName: player.name,
      price,
      priceTier,
      qualityTier,
      timelineTier,
      riskReputationScore: riskReputationAnalysis.score,
      paymentTerms,
      deliveryDays,
      warrantyMonths,
      slaTier,
      sustainability,
      complianceChecked,
      riskDisclosureContingency: riskContingencyRate,
      submittedAt: Date.now(),
      isLossLeader: breakdown.isLossLeader
    };

    setHasSubmitted(true);
    onSubmitQuote(finalQuote);
  };

  return (
    <div className="max-w-7xl mx-auto p-3.5 sm:p-6 space-y-5 animate-fade-in">
      
      {/* Header & Synchronized Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Step 3 • Set Your Strategy & Bid Price
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set your quality and delivery speed, check what it costs to make the order, type your selling price, and see your live profit forecast.
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
        
        {/* Left Column: Strategy Sliders & Cost Structure (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SECTION 1: VENDOR OPERATIONAL STRATEGY ADJUSTMENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                1. Set Your Quality & Delivery Speed (1 – 5 Scale)
              </span>
              <span className="text-[0.6875rem] font-mono text-slate-400">
                Pick your strategy levels
              </span>
            </div>

            {/* Quality Strategy Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" /> Product Quality Level
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{qualityTier}★ / 5★</span>
                  <span className="text-[0.625rem] text-slate-500 font-mono">
                    ({qualityTier === 1 ? 'Economy' : qualityTier === 2 ? 'Commercial' : qualityTier === 3 ? 'Industrial' : qualityTier === 4 ? 'ISO Cert' : 'Aerospace'})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQualityTier(q)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                      qualityTier === q
                        ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-md shadow-amber-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{q}★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Speed Strategy Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" /> Delivery Turnaround Speed
                </span>
                <span className="text-cyan-400 font-bold">{deliveryDays} Days (Level {timelineTier}/5)</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimelineTier(t)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                      timelineTier === t
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>T{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Efficiency Strategy */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" /> Factory Production Efficiency
                </span>
                <span className="text-emerald-400 font-bold">Level {costEfficiencyTier}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCostEfficiencyTier(e)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                      costEfficiencyTier === e
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Eff {e}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Merged Risk & Reputation Index Card */}
            <div className={`p-4 rounded-2xl border shadow-md space-y-2.5 transition-all ${
              riskReputationAnalysis.statusColor === 'emerald'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : riskReputationAnalysis.statusColor === 'amber'
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-100 font-mono">🛡️ Delivery Feasibility & Trust Score</span>
                  <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-slate-800">
                    Calculated from your Price, Quality & Speed
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-indigo-300">★ {riskReputationAnalysis.scaleOf5} / 5.0</span>
                </div>
              </div>
              <p className="text-[0.6875rem] text-slate-300 font-mono leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {riskReputationAnalysis.statusText}
              </p>
            </div>

          </div>

          {/* SECTION 2: FIXED & VARIABLE COST BREAKDOWN */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                2. Your Costs to Build & Deliver (What it Costs You)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                FLC: {formatINR(breakdown.fullyLoadedCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
              
              {/* Variable Costs Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-indigo-300 font-bold uppercase text-[0.6875rem]">📦 Direct Production Costs (Workers & Materials)</span>
                  <span className="text-indigo-400 font-bold">{formatINR(breakdown.directCostSubtotal)}</span>
                </div>
                <div className="space-y-1.5 text-[0.6875rem] text-slate-400">
                  <div className="flex justify-between">
                    <span>• Direct Labor ({rfq.baseLaborHours}h @ {formatINR(rfq.laborRate)}/h):</span>
                    <span className="text-slate-200">{formatINR(breakdown.directLaborCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Direct Materials ({rfq.baseMaterialsQty}u @ {formatINR(rfq.unitMaterialCost)}/u):</span>
                    <span className="text-slate-200">{formatINR(breakdown.directMaterialsCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Logistics Freight ({rfq.baseLogisticsUnits} runs):</span>
                    <span className="text-slate-200">{formatINR(breakdown.directLogisticsCost)}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Costs & Overhead Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-amber-300 font-bold uppercase text-[0.6875rem]">🏛️ Factory Rent & Overhead Costs</span>
                  <span className="text-amber-400 font-bold">{formatINR(breakdown.fixedCostAbsorption + breakdown.overheadAllocation + breakdown.financingCost)}</span>
                </div>
                <div className="space-y-1.5 text-[0.6875rem] text-slate-400">
                  <div className="flex justify-between">
                    <span>• Fixed Cost Absorption (Capacity Slot):</span>
                    <span className="text-slate-200">{formatINR(breakdown.fixedCostAbsorption)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Operating Overhead ({(profile.overheadRate * 100).toFixed(0)}%):</span>
                    <span className="text-slate-200">{formatINR(breakdown.overheadAllocation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Financing Cost ({rfq.paymentDelayDays}d delay):</span>
                    <span className="text-slate-200">{formatINR(breakdown.financingCost)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: COMMERCIAL PRICE SELECTION & INPUT */}
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                3. Type Your Selling Price (Your Bid)
              </span>
              <span className="text-xs font-mono text-slate-400">
                Budget Ceiling: <strong className="text-slate-200">{formatINR(rfq.budgetCeiling)}</strong>
              </span>
            </div>

            {/* 1-5 Price Scale Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handlePriceTierChange(lvl)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    priceTier === lvl
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Level {lvl}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {lvl === 1 ? 'Defensive' : lvl === 2 ? 'Conservative' : lvl === 3 ? 'Target' : lvl === 4 ? 'Competitive' : 'Floor'}
                  </span>
                </button>
              ))}
            </div>

            {/* Direct Number Input */}
            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-mono text-slate-400 uppercase">
                Type your price in ₹ (Price higher than your cost to make a profit)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xl">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => handleDirectPriceChange(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3 text-2xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter custom quotation price"
                />
              </div>
            </div>

            {breakdown.isLossLeader && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-start gap-2 animate-bounce-subtle">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Loss-Leader Flag Triggered!</strong> Price is below 70% of Fully Loaded Cost ({formatINR(breakdown.fullyLoadedCost * 0.7)}).
                </div>
              </div>
            )}

            {/* Submit Quote Button */}
            <button
              type="submit"
              disabled={hasSubmitted || complianceChecked.length < rfq.requiredCompliance.length}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                hasSubmitted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : complianceChecked.length < rfq.requiredCompliance.length
                  ? 'bg-rose-950 border border-rose-800 text-rose-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
              }`}
            >
              {hasSubmitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Quote Locked & Submitted</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit My Final Bid ({formatINR(price)})</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: LIVE VENDOR P&L STATEMENT (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Real-time Generated Income Statement */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 sticky top-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase font-mono">
                    Live Profit & Loss (P&L) Forecast
                  </h3>
                  <p className="text-[0.625rem] text-slate-400 font-mono">
                    How much money you will make if you win
                  </p>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                projectedOperatingProfit >= 0
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                {projectedOperatingMarginPct.toFixed(1)}% Margin
              </span>
            </div>

            {/* Income Statement Table */}
            <div className="space-y-2 text-xs font-mono">
              
              {/* Quoted Revenue */}
              <div className="flex justify-between py-2 border-b border-slate-800 font-semibold">
                <span className="text-slate-200">(+) Your Selling Price (Revenue):</span>
                <span className="text-emerald-400 font-bold text-sm">{formatINR(grossQuotedRevenue)}</span>
              </div>

              {/* Less Variable Costs */}
              <div className="space-y-1 py-1.5 border-b border-slate-800/60 text-slate-400 text-[0.6875rem]">
                <div className="flex justify-between">
                  <span>(-) Direct Labor Cost:</span>
                  <span className="text-slate-300">{formatINR(breakdown.directLaborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Direct Materials Cost:</span>
                  <span className="text-slate-300">{formatINR(breakdown.directMaterialsCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Freight Logistics Cost:</span>
                  <span className="text-slate-300">{formatINR(breakdown.directLogisticsCost)}</span>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-slate-200 text-xs">
                  <span>(=) Total Production Costs:</span>
                  <span className="text-rose-400">-{formatINR(variableDirectCosts)}</span>
                </div>
              </div>

              {/* Gross Contribution Margin */}
              <div className="flex justify-between py-1.5 bg-slate-950 px-3 rounded-xl border border-slate-800">
                <span className="text-indigo-300 font-bold">Gross Profit (Before Overhead):</span>
                <span className={`font-bold ${grossContributionMargin >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                  {formatINR(grossContributionMargin)} ({grossContributionMarginPct.toFixed(1)}%)
                </span>
              </div>

              {/* Less Fixed & Overhead */}
              <div className="space-y-1 py-1.5 border-b border-slate-800/60 text-slate-400 text-[0.6875rem]">
                <div className="flex justify-between">
                  <span>(-) Operating Overhead & Financing:</span>
                  <span className="text-slate-300">-{formatINR(overheadAndFinancing)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Factory Rent & Fixed Overhead:</span>
                  <span className="text-slate-300">-{formatINR(fixedCostsAbsorption)}</span>
                </div>
              </div>

              {/* Total Fully Loaded Cost */}
              <div className="flex justify-between py-1.5 bg-slate-950 px-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">Total Cost to Build (Breakeven Floor):</span>
                <span className="text-slate-200 font-bold">{formatINR(fullyLoadedCost)}</span>
              </div>

              {/* Projected Operating Profit (EBIT) */}
              <div className={`flex justify-between py-2.5 px-3.5 rounded-2xl border text-sm font-bold ${
                projectedOperatingProfit >= 0
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-700/80 text-rose-300'
              }`}>
                <span>Profit Before Tax:</span>
                <span className="font-mono text-base">
                  {projectedOperatingProfit >= 0 ? '+' : ''}{formatINR(projectedOperatingProfit)}
                </span>
              </div>

              {/* Estimated Corporate Tax */}
              <div className="flex justify-between py-1 text-slate-400 text-[0.6875rem]">
                <span>(-) Corporate Tax Allocation ({(taxRate * 100).toFixed(0)}%):</span>
                <span className="text-slate-300">-{formatINR(projectedTax)}</span>
              </div>

              {/* Projected Realized Net Profit */}
              <div className="flex justify-between py-2 bg-slate-950 px-3.5 rounded-2xl border border-slate-800 text-xs font-bold">
                <span className="text-slate-300">Final Net Profit (Cash in Bank):</span>
                <span className={`font-mono ${projectedNetProfit >= 0 ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}`}>
                  {projectedNetProfit >= 0 ? '+' : ''}{formatINR(projectedNetProfit)}
                </span>
              </div>

            </div>

            {/* QCBS Win Probability & Expected Value Summary */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[0.5625rem] text-slate-500 font-mono uppercase block">Win Probability</span>
                <span className="text-xl font-mono font-bold text-cyan-400">
                  {(winProb * 100).toFixed(0)}%
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[0.5625rem] text-slate-500 font-mono uppercase block">Expected Value (EV)</span>
                <span className={`text-xl font-mono font-bold ${expectedValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(expectedValue)}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
