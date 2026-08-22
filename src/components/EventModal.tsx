import React, { useEffect } from 'react';
import { Zap, AlertTriangle, ShieldCheck, ArrowRight, TrendingDown, DollarSign } from 'lucide-react';
import { DynamicEventCard, PlayerState } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface EventModalProps {
  event: DynamicEventCard;
  winnerPlayer: PlayerState | null;
  onProceedToPnL: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  winnerPlayer,
  onProceedToPnL
}) => {
  useEffect(() => {
    sounds.shock();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-3.5 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-amber-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden space-y-4 sm:space-y-5 elevation-2 text-slate-900 dark:text-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/50 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[0.625rem] uppercase font-mono tracking-widest text-amber-700 dark:text-amber-400 font-bold block">
              Dynamic Market Shock (§7)
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {event.description}
        </p>

        {/* Financial & Delivery Impact Box */}
        <div className="bg-amber-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-amber-300 dark:border-amber-900/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-xs font-mono font-bold uppercase text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Direct Contract Impact
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-mono font-semibold">
            {event.message}
          </p>
        </div>

        {/* Winner Risk Contingency Defense */}
        {winnerPlayer && winnerPlayer.submittedQuote && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3.5 sm:p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 flex items-start gap-2.5 sm:gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">{winnerPlayer.name}'s Risk Defense:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                Quoted a <strong>{(winnerPlayer.submittedQuote.riskDisclosureContingency * 100).toFixed(1)}%</strong> contingency buffer to absorb unexpected cost shocks during execution.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 pb-safe">
          <button
            onClick={onProceedToPnL}
            className="w-full py-4 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
          >
            <span>Settle Contract P&L & Calculate Variance</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
