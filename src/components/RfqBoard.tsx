import React from 'react';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Award, 
  Layers, 
  ArrowRight, 
  Gavel, 
  Lock, 
  Search,
  Sparkles
} from 'lucide-react';
import { RFQ, PlayerState } from '../types/game';
import { formatINR } from '../utils/formatters';

interface RfqBoardProps {
  rfq: RFQ;
  player: PlayerState;
  onOpenIntelMarket: () => void;
  onProceedToQuote: () => void;
}

export const RfqBoard: React.FC<RfqBoardProps> = ({
  rfq,
  player,
  onOpenIntelMarket,
  onProceedToQuote
}) => {
  const getFormatBadge = () => {
    switch (rfq.auctionFormat) {
      case 'english':
        return { label: 'Reverse English Auction', color: 'bg-indigo-950 text-indigo-300 border-indigo-700/60' };
      case 'dutch':
        return { label: 'Reverse Dutch Auction (Descending Clock)', color: 'bg-amber-950 text-amber-300 border-amber-700/60' };
      case 'japanese':
        return { label: 'Japanese Clock Auction (Hold-to-Stay)', color: 'bg-purple-950 text-purple-300 border-purple-700/60' };
    }
  };

  const formatBadge = getFormatBadge();

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* RFQ Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono uppercase tracking-wider border ${formatBadge.color}`}>
                <Gavel className="w-3 h-3 inline mr-1" />
                {formatBadge.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Round {rfq.roundNumber} • {rfq.scenarioName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {rfq.description}
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 shrink-0 text-left sm:text-right">
            <p className="text-[0.625rem] text-slate-500 uppercase font-mono">Maximum Budget Limit</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">
              {formatINR(rfq.budgetCeiling)}
            </p>
          </div>
        </div>
      </div>

      {/* Round 1 Strategy Coach Banner */}
      {rfq.roundNumber === 1 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 shadow-lg space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>💡 Round 1 RFQ Hint: Decoding the Buyer's Scoring Formula (QCBS)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-emerald-400 block mb-1">1. Budget Ceiling</strong>
              Your price must be under {formatINR(rfq.budgetCeiling)}. Any quote above this ceiling is disqualified automatically.
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-indigo-400 block mb-1">2. Multi-Criteria Weights</strong>
              Price is only {Math.round(rfq.weights.price * 100)}% of the score! Quality ({Math.round(rfq.weights.quality * 100)}%) and Timeline ({Math.round(rfq.weights.timeline * 100)}%) matter just as much.
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-1">3. Avoid The Winner's Curse</strong>
              Don't bid below your cost floor. Winning an unprofitable deal drains your cash and hurts your leaderboard rank!
            </div>
          </div>
        </div>
      )}

      {/* Scope & Baseline Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Baseline Units */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase font-mono">
            <Layers className="w-4 h-4" />
            📦 Order Requirements & Quantities
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Base Labor Hours:</span>
              <span className="font-mono font-bold text-slate-200">{rfq.baseLaborHours.toLocaleString()} hrs (@ {formatINR(rfq.laborRate)}/hr)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Base Materials Units:</span>
              <span className="font-mono font-bold text-slate-200">{rfq.baseMaterialsQty.toLocaleString()} units (@ {formatINR(rfq.unitMaterialCost)}/u)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Logistics Freight Runs:</span>
              <span className="font-mono font-bold text-slate-200">{rfq.baseLogisticsUnits} runs (@ {formatINR(rfq.logisticsUnitCost)}/run)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Required Turnaround:</span>
              <span className="font-mono font-bold text-amber-400">{rfq.requiredDeliveryDays} Days</span>
            </div>
          </div>
        </div>

        {/* Compliance Gates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase font-mono">
            <ShieldCheck className="w-4 h-4" />
            🔒 Required Certificates (Must-Have)
          </div>
          <p className="text-xs text-slate-400">
            You must check these certificates during quoting, or your bid will be rejected:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {rfq.requiredCompliance.map((cert) => (
              <span key={cert} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                {cert}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-mono pt-2">
            Payment Terms Expected: Net-{rfq.paymentDelayDays} days
          </p>
        </div>

      </div>

      {/* Buyer Evaluation Weights Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase font-mono">
            <Award className="w-4 h-4" />
            ⚖️ How the Buyer Scores Your Bid
          </div>
          <span className="text-[0.625rem] sm:text-xs text-slate-400 font-mono">
            Independent 1–5 parameters • Dependent Risk & Reputation index
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">💰 Price Weight</span>
            <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">{(rfq.weights.price * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Level</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">⭐ Quality Weight</span>
            <p className="text-base font-mono font-bold text-indigo-400 mt-0.5">{(rfq.weights.quality * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Stars</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">⏱️ Timeline Weight</span>
            <p className="text-base font-mono font-bold text-amber-400 mt-0.5">{(rfq.weights.timeline * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Speed</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">🛡️ Risk & Reputation</span>
            <p className="text-base font-mono font-bold text-purple-400 mt-0.5">
              {(((rfq.weights.reputation || 0.1) + (rfq.weights.risk || 0.05)) * 100).toFixed(0)}%
            </p>
            <span className="text-[0.625rem] text-purple-300 font-mono">Dependent Index</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-safe">
        <button
          onClick={onOpenIntelMarket}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer min-h-12"
        >
          <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Intel Market ({player.intelPoints} Points Available)
        </button>

        <button
          onClick={onProceedToQuote}
          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-12"
        >
          Go to Quoting & Live P&L Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
