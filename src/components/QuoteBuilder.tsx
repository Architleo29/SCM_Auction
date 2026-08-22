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
  BarChart2
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
  const initialBaseline = useMemo(() => calculateCostBreakdown(profile, rfq), [profile, rfq]);

  // Form State
  const [price, setPrice] = useState<number>(initialBaseline.targetBidPrice);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [deliveryDays, setDeliveryDays] = useState<number>(rfq.requiredDeliveryDays);
  const [warrantyMonths, setWarrantyMonths] = useState<WarrantyPeriod>(12);
  const [slaTier, setSlaTier] = useState<SLATier>('standard');
  const [sustainability, setSustainability] = useState<SustainabilityLevel>('standard');
  const [complianceChecked, setComplianceChecked] = useState<string[]>([...rfq.requiredCompliance]);
  const [riskContingencyRate, setRiskContingencyRate] = useState<number>(profile.riskContingencyNeed);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Local smooth ticking countdown timer (Guarantees countdown on mobile and guests)
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

  // Live Recalculation with user overrides
  const breakdown = useMemo(() => {
    return calculateCostBreakdown(profile, rfq, price, riskContingencyRate);
  }, [profile, rfq, price, riskContingencyRate]);

  // Win Probability & EV Estimate
  const winProb = useMemo(() => {
    const estMinPrice = rfq.budgetCeiling * 0.8; 
    const priceScore = price > 0 ? Math.min(1.0, Math.max(0.0, estMinPrice / price)) : 0.0;

    const slaBonus = slaTier === 'premium' ? 0.15 : slaTier === 'standard' ? 0.05 : 0.0;
    const qualityScore = Math.min(1.0, Math.max(0.0, (profile.qualityLevel / 5.0) + slaBonus));

    const timelineScore = deliveryDays <= rfq.requiredDeliveryDays
      ? Math.min(1.0, 0.85 + (rfq.requiredDeliveryDays - deliveryDays) * 0.03)
      : Math.max(0.0, 0.85 - (deliveryDays - rfq.requiredDeliveryDays) * 0.06);

    const reputationScore = Math.min(1.0, Math.max(0.0, profile.reputationScore / 100.0));
    const riskScore = riskContingencyRate >= profile.riskContingencyNeed ? 1.0 : 0.65;

    const paymentMap = { net_60: 1.0, net_30: 0.85, milestone: 0.6, upfront_20: 0.3 };
    const paymentTermsScore = paymentMap[paymentTerms] || 0.6;

    const slaMap = { premium: 1.0, standard: 0.75, basic: 0.4 };
    const slaScore = slaMap[slaTier] || 0.6;

    const sustainabilityScore = sustainability === 'certified_green' ? 1.0 : 0.5;

    const estWeightedScore = (
      (rfq.weights.price * priceScore) +
      (rfq.weights.quality * qualityScore) +
      (rfq.weights.timeline * timelineScore) +
      (rfq.weights.reputation * reputationScore) +
      (rfq.weights.risk * riskScore) +
      (rfq.weights.paymentTerms * paymentTermsScore) +
      (rfq.weights.sla * slaScore) +
      (rfq.weights.sustainability * sustainabilityScore)
    );

    return estimateWinProbability(estWeightedScore, 0.65);
  }, [price, profile, slaTier, deliveryDays, paymentTerms, sustainability, riskContingencyRate, rfq]);

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
              RFQ Phase 3 (§4) • Blind Quoting
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct your full commercial quote in INR. All figures feed the Buyer’s evaluation engine and your P&L settlement.
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
        
        {/* Left Form: Quote Configuration Inputs */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 sm:space-y-5">
          
          {/* Price Input & Slider */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Commercial Quoted Price
              </label>
              <span className="text-xs font-mono text-slate-400">
                Budget Ceiling: <strong className="text-slate-200">{formatINR(rfq.budgetCeiling)}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>

              <button
                type="button"
                onClick={() => setPrice(breakdown.targetBidPrice)}
                className="px-3.5 py-2.5 text-xs font-mono rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 cursor-pointer min-h-[44px]"
                title="Reset to calculated target bid"
              >
                Reset Target ({formatINR(breakdown.targetBidPrice)})
              </button>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={Math.round(breakdown.fullyLoadedCost * 0.65)}
              max={Math.round(rfq.budgetCeiling * 1.05)}
              step={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            {breakdown.isLossLeader && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-start gap-2 animate-bounce-subtle">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Loss-Leader Bid Flag Triggered!</strong> Price is below 70% of FLC ({formatINR(breakdown.fullyLoadedCost * 0.7)}). Buyer scoring engine will flag bid for suspicion.
                </div>
              </div>
            )}
          </div>

          {/* Payment Terms & Delivery Timeline */}
          
          {/* Advanced Details Toggle */}
          <details className="group border border-slate-700/50 rounded-3xl bg-slate-800/30 overflow-hidden mt-6 mb-2">
            <summary className="p-4 cursor-pointer text-sm font-semibold text-slate-300 hover:text-white flex items-center justify-between outline-none">
              Advanced Quotation Options (Optional)
              <span className="text-[10px] bg-slate-700 px-2 py-1 rounded-full text-slate-300 group-open:hidden">Click to expand</span>
            </summary>
            <div className="p-4 pt-2 border-t border-slate-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[44px]"
              >
                <option value="net_30">Net-30 (Standard Terms)</option>
                <option value="net_60">Net-60 (Buyer Favored +Score)</option>
                <option value="milestone">Milestone Billing (50/50)</option>
                <option value="upfront_20">20% Upfront Advance</option>
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Delivery Turnaround</span>
                <span className="font-bold text-amber-400">{deliveryDays} Days</span>
              </div>
              <input
                type="range"
                min={Math.max(7, rfq.requiredDeliveryDays - 15)}
                max={rfq.requiredDeliveryDays + 15}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[0.625rem] text-slate-500 font-mono block">
                Required: {rfq.requiredDeliveryDays} Days (Faster scores higher)
              </span>
            </div>

          </div>

          {/* SLA, Warranty & Risk Contingency */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1.5">SLA Tier</label>
                <select
                  value={slaTier}
                  onChange={(e) => setSlaTier(e.target.value as SLATier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  <option value="basic">Basic SLA (No Warranty)</option>
                  <option value="standard">Standard SLA (1-year Response)</option>
                  <option value="premium">Premium SLA (24/7 Dedicated +5% Quality)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1.5">Warranty Period</label>
                <select
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value) as WarrantyPeriod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  <option value={0}>0 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months (+Buyer Score)</option>
                </select>
              </div>
            </div>

            {/* Risk Contingency Buffer */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-300">Quoted Risk Contingency Buffer</span>
                <span className="font-bold text-indigo-300">{(riskContingencyRate * 100).toFixed(1)}% ({formatINR(breakdown.riskContingencyAmount)})</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.20}
                step={0.01}
                value={riskContingencyRate}
                onChange={(e) => setRiskContingencyRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[0.625rem] text-slate-500 font-mono">
                Advisory baseline: {(profile.riskContingencyNeed * 100).toFixed(0)}%. Buffers against dynamic supply-chain shocks.
              </span>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono block">Technical Compliance Declarations</label>
            <div className="space-y-1.5">
              {rfq.requiredCompliance.map((cert) => (
                <label key={cert} className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer p-2.5 rounded-xl hover:bg-slate-950 transition">
                  <input
                    type="checkbox"
                    checked={complianceChecked.includes(cert)}
                    onChange={() => handleToggleCompliance(cert)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950"
                  />
                  <span>Declare mandatory compliance with <strong className="font-mono text-indigo-400">{cert}</strong></span>
                </label>
              ))}
            </div>
          </div>

              </div>
            </details>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={hasSubmitted}
              className={`w-full py-4 px-4 rounded-2xl font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition min-h-[3.125rem] active:scale-95 ${
                hasSubmitted
                  ? 'bg-slate-800 text-slate-400 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 cursor-pointer'
              }`}
            >
              {hasSubmitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Sealed Quote Submitted (Waiting for other bidders...)</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 shrink-0" />
                  <span>Lock In & Submit Sealed Quote ({formatINR(price)})</span>
                </>
              )}
            </button>
            {!hasSubmitted && (
              <p className="text-center text-xs text-amber-400/80 font-mono">
                Submitting a quote incurs a non-refundable Bid Preparation Cost of {formatINR(15000)}.
              </p>
            )}
          </div>
        </form>

        {/* Right Sidebar: Live Cost Waterfall & Margin Calculator */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* FLC Waterfall Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase font-mono border-b border-slate-800 pb-3">
              <Calculator className="w-4 h-4" />
              Live Cost Build-Up Waterfall (§3.1)
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Direct Labor:</span>
                <span>{formatINR(breakdown.directLaborCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Direct Materials:</span>
                <span>{formatINR(breakdown.directMaterialsCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Direct Logistics:</span>
                <span>{formatINR(breakdown.directLogisticsCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80 font-bold">
                <span>Direct Subtotal:</span>
                <span>{formatINR(breakdown.directCostSubtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>Overhead ({(profile.overheadRate * 100).toFixed(0)}%):</span>
                <span>+{formatINR(breakdown.overheadAllocation)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Financing Cost:</span>
                <span>+{formatINR(breakdown.financingCost)}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Risk Contingency:</span>
                <span>+{formatINR(breakdown.riskContingencyAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fixed Absorption:</span>
                <span>+{formatINR(breakdown.fixedCostAbsorption)}</span>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between text-sm font-semibold text-slate-100">
                <span className="text-indigo-300">FULLY LOADED COST (FLC):</span>
                <span className="text-indigo-400 font-mono">{formatINR(breakdown.fullyLoadedCost)}</span>
              </div>
            </div>
          </div>

          {/* Margin & Profit Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>QUOTED MARGIN</span>
              <span className={`text-base font-bold font-mono ${
                breakdown.quotedMarginPct > 15 
                  ? 'text-emerald-400' 
                  : breakdown.quotedMarginPct > 5 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
              }`}>
                {breakdown.quotedMarginPct}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  breakdown.quotedMarginPct > 15 ? 'bg-emerald-500' : breakdown.quotedMarginPct > 5 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, breakdown.quotedMarginPct * 3))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[0.625rem] text-slate-500 uppercase">Projected Profit</span>
                <p className={`font-semibold text-sm mt-0.5 ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(projectedProfit)}
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[0.625rem] text-slate-500 uppercase">Expected Value (EV)</span>
                <p className={`font-semibold text-sm mt-0.5 ${expectedValue >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                  {formatINR(expectedValue)}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-0.5">
              <p className="flex justify-between">
                <span>Estimated Win Probability:</span>
                <strong className="text-slate-200">{(winProb * 100).toFixed(0)}%</strong>
              </p>
              <p className="text-[0.625rem] text-slate-500">
                Higher margin reduces win probability; low bids risk negative EV if shock occurs.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
