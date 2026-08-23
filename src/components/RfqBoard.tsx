import React from 'react';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  Award, 
  ArrowRight, 
  Search,
  Sparkles,
  Layers,
  Gavel
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
  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
                🏛️ Tender Opportunity • Round {rfq.roundNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 capitalize">
                {rfq.auctionFormat} Auction
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {rfq.description}
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 shrink-0 text-left sm:text-right">
            <p className="text-[0.625rem] text-slate-500 uppercase font-mono">Auction Starting Price (Max Limit)</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">
              {formatINR(rfq.budgetCeiling)}
            </p>
          </div>
        </div>

        {/* Quick Highlights: Starting Price, Turnaround, Auction Type */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[0.625rem] text-slate-500 uppercase block">Starting Price</span>
              <strong className="text-slate-100">{formatINR(rfq.budgetCeiling)}</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[0.625rem] text-slate-500 uppercase block">Required Delivery</span>
              <strong className="text-slate-100">{rfq.requiredDeliveryDays} Days</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <Gavel className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[0.625rem] text-slate-500 uppercase block">Live Auction Format</span>
              <strong className="text-indigo-300 capitalize">{rfq.auctionFormat} Format</strong>
            </div>
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
              <strong className="text-emerald-400 block mb-1">1. Auction Starting Price</strong>
              Your price must be under {formatINR(rfq.budgetCeiling)}. Any quote above this starting price is disqualified automatically.
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

      {/* Buyer Evaluation Weights Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase font-mono">
            <Award className="w-4 h-4" />
            ⚖️ How the Buyer Scores Your Proposal (QCBS Formula)
          </div>
          <span className="text-[0.625rem] sm:text-xs text-slate-400 font-mono">
            Sum of all 4 pillars = 100%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">💰 Price Weight</span>
            <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{(rfq.weights.price * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Price Level</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">⭐ Quality Weight</span>
            <p className="text-xl font-mono font-bold text-indigo-400 mt-0.5">{(rfq.weights.quality * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Stars</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">⏱️ Timeline Weight</span>
            <p className="text-xl font-mono font-bold text-amber-400 mt-0.5">{(rfq.weights.timeline * 100).toFixed(0)}%</p>
            <span className="text-[0.625rem] text-slate-500 font-mono">Scale: 1 – 5 Speed</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 font-mono uppercase">🛡️ Risk & Reputation</span>
            <p className="text-xl font-mono font-bold text-purple-400 mt-0.5">
              {(((rfq.weights.reputation || 0.1) + (rfq.weights.risk || 0.05)) * 100).toFixed(0)}%
            </p>
            <span className="text-[0.625rem] text-purple-300 font-mono">Vendor Track Record</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-safe">
        <button
          onClick={onOpenIntelMarket}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer min-h-12 active:scale-95"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          Competitor Intel Market ({player.intelPoints} Points Available)
        </button>

        <button
          onClick={onProceedToQuote}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-12"
        >
          <span>Open Strategy & Quoting Screen</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
