import { 
  DollarSign, 
  Award, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Gavel,
  Eye,
  Zap,
  ShieldCheck
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
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
                🏛️ Tender Opportunity • Round {rfq.roundNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                {'🔨 Reverse English'} Auction
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

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[0.625rem] text-slate-500 uppercase block">Starting Price</span>
              <strong className="text-slate-100">{formatINR(rfq.budgetCeiling)}</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Gavel className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[0.625rem] text-slate-500 uppercase block">Live Auction Format</span>
              <strong className="text-indigo-300">{rfq.auctionFormat === 'forward' ? 'Forward English' : 'Reverse English'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Round 1 Strategy Coach Banner */}
      {rfq.roundNumber === 1 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 shadow-lg space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>💡 Round 1 RFQ Hint: Decoding the Buyer's Scoring Formula</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <strong className="text-emerald-400 block mb-1">1. Auction Starting Price</strong>
              Your price must be under {formatINR(rfq.budgetCeiling)}. Any quote above this starting price is disqualified automatically.
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <strong className="text-indigo-400 block mb-1">2. Price vs. Quality Tradeoff</strong>
              Price is {Math.round(rfq.weights.price * 100)}% and Quality is {Math.round(rfq.weights.quality * 100)}% of the score. A high-quality proposal (5★) can defeat a cheaper bid!
            </div>
          </div>
        </div>
      )}

      {/* Buyer Evaluation Weights Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase font-mono">
            <Award className="w-4 h-4" />
            ⚖️ How the Buyer Scores Your Proposal (Price vs Quality)
          </div>
          <span className="text-[0.625rem] sm:text-xs text-slate-400 font-mono">
            Sum of weights = 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase">💰 Price Weight</span>
            <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{(rfq.weights.price * 100).toFixed(0)}%</p>
            <span className="text-xs text-slate-500 font-mono">Score increases as your bid gets cheaper</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase">⭐ Quality Weight</span>
            <p className="text-2xl font-mono font-bold text-indigo-400 mt-1">{(rfq.weights.quality * 100).toFixed(0)}%</p>
            <span className="text-xs text-slate-500 font-mono">Score increases with higher Quality Tiers (1 to 5★)</span>
          </div>
        </div>
      </div>

      {/* PROMINENT GLOWING INTEL MARKET CARD (Attracts Vendor Attention) */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/60 space-y-4 relative overflow-hidden ring-1 ring-cyan-400/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
                  🕵️ Competitor Intel Office
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-700 text-[10px] font-mono font-bold animate-pulse">
                  {player.intelPoints} Points Available
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Infiltrate competitor cost structures (FLC) & decrypt exact buyer scoring weights before quoting!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenIntelMarket}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 border border-cyan-400/40"
          >
            <Search className="w-4 h-4" />
            <span>Open Intel Office ({player.intelPoints} Pts)</span>
          </button>
        </div>
      </div>

      {/* Primary Action Button to Proceed to Quoting */}
      <div className="pt-2 pb-safe">
        <button
          onClick={onProceedToQuote}
          className="w-full py-4 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[52px]"
        >
          <span>Proceed to Strategy & Quoting (90s Timer)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
