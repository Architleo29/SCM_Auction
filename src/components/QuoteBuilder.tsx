import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Percent, 
  AlertTriangle, 
  Lock, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  BarChart2,
  Sparkles,
  Zap,
  Star,
  Activity
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

  // 1. Three Independent Parameters (Scale of 1 to 5)
  const [priceTier, setPriceTier] = useState<number>(3); // 1 = High/Defensive, 3 = Target, 5 = Aggressive/Low
  const [qualityTier, setQualityTier] = useState<number>(profile.qualityLevel || 3); // 1 to 5 Stars
  const [timelineTier, setTimelineTier] = useState<number>(profile.speedLevel || 3); // 1 = Slow, 3 = Target, 5 = Rush

  // Price in INR (₹)
  const initialBaseline = useMemo(() => calculateCostBreakdown(profile, rfq), [profile, rfq]);
  const [price, setPrice] = useState<number>(initialBaseline.targetBidPrice);

  // Additional commercial parameters
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [warrantyMonths, setWarrantyMonths] = useState<WarrantyPeriod>(12);
  const [slaTier, setSlaTier] = useState<SLATier>('standard');
  const [sustainability, setSustainability] = useState<SustainabilityLevel>('standard');
  const [complianceChecked, setComplianceChecked] = useState<string[]>([...rfq.requiredCompliance]);
  const [riskContingencyRate, setRiskContingencyRate] = useState<number>(profile.riskContingencyNeed);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Delivery days calculated from timelineTier (1 = +10d, 2 = +5d, 3 = base, 4 = -5d, 5 = -10d)
  const deliveryDays = useMemo(() => {
    const deltaDays = (3 - timelineTier) * 5;
    return Math.max(5, rfq.requiredDeliveryDays + deltaDays);
  }, [timelineTier, rfq.requiredDeliveryDays]);

  // Dynamic effective profile updated by qualityTier & timelineTier
  const effectiveProfile = useMemo(() => {
    return {
      ...profile,
      qualityLevel: qualityTier,
      speedLevel: timelineTier
    };
  }, [profile, qualityTier, timelineTier]);

  // Live Recalculation of Fully Loaded Cost (FLC) with user overrides
  const breakdown = useMemo(() => {
    return calculateCostBreakdown(effectiveProfile, rfq, price, riskContingencyRate);
  }, [effectiveProfile, rfq, price, riskContingencyRate]);

  // Sync Price when priceTier changes
  const handlePriceTierChange = (newTier: number) => {
    setPriceTier(newTier);
    const flc = breakdown.fullyLoadedCost;
    const ceiling = rfq.budgetCeiling;
    
    // Map tier to price:
    // Tier 1: Ceiling / Defensive (~30-35% margin)
    // Tier 2: Conservative (~22% margin)
    // Tier 3: Balanced (~15% margin)
    // Tier 4: Competitive (~8% margin)
    // Tier 5: Rock-Bottom (~3% margin / Near FLC)
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
    const baseRep = player.reputation || profile.reputationScore || 70;
    const flc = breakdown.fullyLoadedCost;
    const marginPct = price > 0 ? (price - flc) / price : 0;
    
    // Margin Health Factor (0 - 100)
    let marginHealth = 70;
    if (marginPct >= 0.20) marginHealth = 100;
    else if (marginPct >= 0.12) marginHealth = 90;
    else if (marginPct >= 0.05) marginHealth = 75;
    else if (marginPct >= 0.0) marginHealth = 55;
    else marginHealth = 20; // Loss leader

    // Iron Triangle Feasibility Stress:
    // Demanding high quality (4-5) & rush turnaround (4-5) at rock-bottom price (tier 4-5) spikes execution risk
    const demandLoad = (qualityTier * 0.5) + (timelineTier * 0.5); // 1.0 to 5.0
    const priceCompensation = (6 - priceTier); // 1 (cheapest) to 5 (most revenue)
    const stressGap = demandLoad - priceCompensation; // -4 to +4
    
    let stressPenalty = 0;
    if (stressGap > 2.0) stressPenalty = 25;
    else if (stressGap > 1.0) stressPenalty = 15;
    else if (stressGap > 0) stressPenalty = 5;
    else stressPenalty = -5; // Buffer bonus

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
      statusText = '✅ Prime Supplier Standing: Healthy margins comfortably finance your quality and turnaround schedule.';
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

  // Local smooth ticking countdown timer
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

  // Win Probability & EV Estimate
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

  const projectedProfit = price - breakdown.fullyLoadedCost;
  const expectedValue = calculateExpectedValue(winProb, projectedProfit);

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
    <div className="max-w-6xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header & Synchronized Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              RFQ Phase 3 • Multi-Parameter Commercial Quoting
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set your 3 core independent parameters (Price, Quality, Timeline) on a scale of 1 to 5. Your Risk & Reputation index updates dynamically.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: 3 Independent Controls + 1 Merged Dependent Card */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 sm:space-y-5">
          
          {/* PARAMETER 1: COMMERCIAL PRICE (Scale 1 to 5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <label className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Commercial Price Level (1 – 5)
                </label>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Level {priceTier} / 5
              </span>
            </div>

            {/* 1-5 Scale Buttons */}
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
                  <span>L{lvl}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {lvl === 1 ? 'Defensive' : lvl === 2 ? 'Conservative' : lvl === 3 ? 'Target' : lvl === 4 ? 'Competitive' : 'Floor'}
                  </span>
                </button>
              ))}
            </div>

            {/* Price Input & Ceiling Indicator */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => handleDirectPriceChange(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-right shrink-0">
                <p className="text-[0.625rem] text-slate-500 uppercase">Budget Ceiling</p>
                <p className="font-bold text-slate-200">{formatINR(rfq.budgetCeiling)}</p>
              </div>
            </div>

            {breakdown.isLossLeader && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-start gap-2 animate-bounce-subtle">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Loss-Leader Warning!</strong> Quoting below 70% of FLC ({formatINR(breakdown.fullyLoadedCost * 0.7)}) triggers severe buyer risk penalties.
                </div>
              </div>
            )}
          </div>

          {/* PARAMETER 2: TECHNICAL QUALITY (Scale 1 to 5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <label className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  Technical Quality Tier (1 – 5 Stars)
                </label>
              </div>
              <div className="flex text-amber-400 text-sm">
                {'★'.repeat(qualityTier)}
                <span className="text-slate-700">{'★'.repeat(5 - qualityTier)}</span>
              </div>
            </div>

            {/* 1-5 Quality Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQualityTier(q)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    qualityTier === q
                      ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-md shadow-amber-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{q}★</span>
                  <span className="text-[8px] font-normal opacity-80 truncate max-w-full px-1">
                    {q === 1 ? 'Economy' : q === 2 ? 'Commercial' : q === 3 ? 'Industrial' : q === 4 ? 'ISO Cert' : 'Aerospace'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[0.6875rem] text-slate-400 font-mono">
              Higher quality increases your QCBS Technical Score, with realistic production adjustment in your baseline FLC.
            </p>
          </div>

          {/* PARAMETER 3: DELIVERY TIMELINE (Scale 1 to 5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <label className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Delivery Timeline Speed (1 – 5 Level)
                </label>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {deliveryDays} Days Turnaround
              </span>
            </div>

            {/* 1-5 Timeline Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimelineTier(t)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    timelineTier === t
                      ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>T{t}</span>
                  <span className="text-[8px] font-normal opacity-80 truncate max-w-full px-1">
                    {t === 1 ? 'Extended' : t === 2 ? 'Relaxed' : t === 3 ? 'Required' : t === 4 ? 'Expedited' : 'Rush'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[0.6875rem] text-slate-400 font-mono">
              Required by RFQ: <strong>{rfq.requiredDeliveryDays} Days</strong>. Faster turnaround satisfies tight procurement schedules.
            </p>
          </div>

          {/* MERGED DEPENDENT PARAMETER: RISK & REPUTATION INDEX */}
          <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl space-y-3 transition-all ${
            riskReputationAnalysis.statusColor === 'emerald'
              ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-emerald-500/40'
              : riskReputationAnalysis.statusColor === 'amber'
              ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-amber-500/40'
              : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border-rose-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>🛡️ Risk & Reputation Index</span>
                    <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-normal">
                      Dependent Metric
                    </span>
                  </h3>
                  <p className="text-[0.6875rem] text-slate-400 font-mono">
                    Auto-calculated from Price (L{priceTier}), Quality ({qualityTier}★) & Timeline (T{timelineTier})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-mono font-bold text-indigo-300">
                  ★ {riskReputationAnalysis.scaleOf5} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                </p>
                <span className={`text-[0.625rem] font-mono font-bold px-2 py-0.5 rounded ${
                  riskReputationAnalysis.statusColor === 'emerald'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : riskReputationAnalysis.statusColor === 'amber'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {riskReputationAnalysis.statusLabel}
                </span>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className={`h-full transition-all duration-300 ${
                    riskReputationAnalysis.statusColor === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                      : riskReputationAnalysis.statusColor === 'amber'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-rose-500 to-red-600'
                  }`}
                  style={{ width: `${riskReputationAnalysis.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[0.625rem] font-mono text-slate-500">
                <span>1.0 (High Risk)</span>
                <span>3.0 (Standard)</span>
                <span>5.0 (Prime Trust)</span>
              </div>
            </div>

            {/* Diagnostic Message */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-2xl border border-slate-800/60 font-mono">
              {riskReputationAnalysis.statusText}
            </p>
          </div>

          {/* Advanced Details Collapsible (Payment Terms, Warranty, SLA) */}
          <details className="group border border-slate-800 rounded-3xl bg-slate-900/60 overflow-hidden">
            <summary className="p-4 cursor-pointer text-xs font-semibold font-mono text-slate-300 hover:text-white flex items-center justify-between outline-none">
              <span>⚙️ Optional Commercial Terms (Payment, SLA, Warranty)</span>
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-full text-slate-400 group-open:hidden">Expand</span>
            </summary>
            <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="net_30">Net-30 (Standard)</option>
                    <option value="net_60">Net-60 (+Buyer Score)</option>
                    <option value="milestone">Milestone Billing (50/50)</option>
                    <option value="upfront_20">20% Advance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">SLA Tier</label>
                  <select
                    value={slaTier}
                    onChange={(e) => setSlaTier(e.target.value as SLATier)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="basic">Basic SLA</option>
                    <option value="standard">Standard SLA</option>
                    <option value="premium">Premium 24/7 SLA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">Warranty Period</label>
                  <select
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value) as WarrantyPeriod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={0}>0 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months (+Score)</option>
                  </select>
                </div>

              </div>

              {/* Compliance Checklist */}
              {rfq.requiredCompliance.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1.5">Mandatory Compliance Check</label>
                  <div className="flex flex-wrap gap-2">
                    {rfq.requiredCompliance.map(cert => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleToggleCompliance(cert)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          complianceChecked.includes(cert)
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-800 text-rose-400'
                        }`}
                      >
                        {complianceChecked.includes(cert) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{cert}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* Submit Button */}
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
                <span>Submit Commercial Quote ({formatINR(price)})</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Economics Waterfall & Win Probability */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          
          {/* Financial Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Quote Economics Waterfall
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                breakdown.quotedMarginPct >= 10
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                  : 'bg-amber-950 text-amber-400 border border-amber-800/80'
              }`}>
                {breakdown.quotedMarginPct}% Margin
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Direct Manufacturing Cost:</span>
                <span className="text-slate-200 font-bold">{formatINR(breakdown.directCostSubtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Overhead & Financing:</span>
                <span className="text-slate-300">{formatINR(breakdown.overheadAllocation + breakdown.financingCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Fixed Cost Absorption:</span>
                <span className="text-slate-300">{formatINR(breakdown.fixedCostAbsorption)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-slate-950 px-3 rounded-xl border border-slate-800">
                <span className="text-indigo-300 font-bold">Fully Loaded Cost (FLC):</span>
                <span className="text-emerald-400 font-bold text-sm">{formatINR(breakdown.fullyLoadedCost)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-slate-950 px-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Quoted Selling Price:</span>
                <span className="text-indigo-400 font-bold text-sm">{formatINR(price)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-slate-950 px-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">Projected Net Profit:</span>
                <span className={`font-bold text-sm ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(projectedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Win Probability & Expected Value Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                Predictive Bid Intelligence
              </span>
              <span className="text-xs font-mono text-slate-400">QCBS Forecast</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[0.625rem] text-slate-500 font-mono uppercase block mb-0.5">Est. Win Probability</span>
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  {(winProb * 100).toFixed(0)}%
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[0.625rem] text-slate-500 font-mono uppercase block mb-0.5">Expected Value (EV)</span>
                <span className={`text-2xl font-mono font-bold ${expectedValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(expectedValue)}
                </span>
              </div>
            </div>

            <p className="text-[0.6875rem] text-slate-400 font-mono leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800">
              💡 <strong>QCBS Intelligence:</strong> Evaluates your Price ({priceTier}/5), Quality ({qualityTier}/5), Timeline ({timelineTier}/5), and Merged Risk/Reputation index ({riskReputationAnalysis.scaleOf5}/5) against standard competition.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
