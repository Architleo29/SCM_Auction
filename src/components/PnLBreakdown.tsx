import React, { useEffect } from 'react';
import { 
  FileSpreadsheet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  AlertCircle, 
  Percent, 
  Layers, 
  Users, 
  Sparkles,
  Calculator
} from 'lucide-react';
import { PnLResult, PlayerState, RFQ } from '../types/game';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { formatINR, isBuyerSpectator } from '../utils/formatters';

interface PnLBreakdownProps {
  pnl: PnLResult;
  player: PlayerState;
  allPlayers?: Record<string, PlayerState>;
  rfq: RFQ;
  onProceedToLeaderboard: () => void;
}

export const PnLBreakdown: React.FC<PnLBreakdownProps> = ({
  pnl,
  player,
  allPlayers,
  rfq,
  onProceedToLeaderboard
}) => {
  const playerList = (allPlayers ? Object.values(allPlayers) : [player])
    .filter(p => !isBuyerSpectator(p));

  useEffect(() => {
    if (pnl.realizedProfit > 0) {
      sounds.award();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [pnl.realizedProfit]);

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] sm:text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
              Quarter Financial Settlement • Post-Auction P&L
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{player.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {pnl.contractWon 
              ? 'Contract delivered. Financials reconciled against actual operating costs.' 
              : 'Idle Quarter. Fixed overhead and idle reputation adjustment recorded.'}
          </p>
        </div>

        <div className={`px-4 sm:px-5 py-3 rounded-2xl border text-center sm:text-right ${
          pnl.realizedProfit > 0 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
            : pnl.realizedProfit < 0
            ? 'bg-rose-950/60 border-rose-800 text-rose-400'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <p className="text-[0.625rem] uppercase font-mono text-slate-500 font-bold">Realized Banked Profit</p>
          <p className="text-2xl font-mono font-bold">
            {formatINR(pnl.realizedProfit)}
          </p>
        </div>
      </div>

      {/* ALL VENDORS / AI BOTS COMPARISON */}
      {allPlayers && Object.keys(allPlayers).length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold uppercase font-mono text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Users className="w-4 h-4" />
            All Vendors Round P&L Comparison
          </h3>

          {/* MOBILE CARDS VIEW (Visible on mobile screens) */}
          <div className="block md:hidden space-y-2.5">
            {playerList.map(p => {
              const pPnl = p.lastPnL;
              const isWon = pPnl?.contractWon;

              return (
                <div 
                  key={p.id} 
                  className={`p-3.5 rounded-2xl border transition ${
                    isWon 
                      ? 'bg-indigo-950/30 border-indigo-700/60 shadow-sm' 
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                        {isWon ? '👑' : '•'}
                        <span className="truncate">{p.name}</span>
                      </div>
                      {p.isAi && <span className="text-[0.625rem] text-slate-500 font-mono">({p.aiPersonality})</span>}
                    </div>
                    <div>
                      {isWon ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[0.625rem] font-bold">
                          DELIVERED
                        </span>
                      ) : p.submittedQuote ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/60 text-[0.625rem] font-mono">
                          OUTBID (₹0)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[0.625rem] font-mono">
                          WALKAWAY
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Quoted</span>
                      <span className="text-slate-200">{p.submittedQuote ? formatINR(p.submittedQuote.price) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Margin</span>
                      <span className={pPnl && isWon ? (pPnl.realizedMarginPct >= pPnl.quotedMarginPct ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold') : 'text-slate-400'}>
                        {pPnl && isWon ? `${pPnl.realizedMarginPct}%` : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase text-slate-500 block">Net Profit</span>
                      <span className={`font-bold ${
                        (pPnl?.realizedProfit || 0) > 0 ? 'text-emerald-400' : (pPnl?.realizedProfit || 0) < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {pPnl ? formatINR(pPnl.realizedProfit) : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (Visible on md and larger) */}
          <div className="hidden md:block overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Quoted Price</th>
                  <th className="py-2.5 px-2 text-right">Actual Cost</th>
                  <th className="py-2.5 px-2 text-right">Quoted / Realized %</th>
                  <th className="py-2.5 px-2 text-right">RAP</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {playerList.map(p => {
                  const pPnl = p.lastPnL;
                  const isWon = pPnl?.contractWon;

                  return (
                    <tr key={p.id} className={isWon ? 'bg-indigo-950/30' : ''}>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                        {isWon ? '👑' : '•'} {p.name}
                        {p.isAi && <span className="ml-1 text-[0.625rem] text-slate-500">({p.aiPersonality})</span>}
                      </td>
                      <td className="py-3 px-2">
                        {isWon ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[0.625rem] font-bold">
                            DELIVERED
                          </span>
                        ) : p.submittedQuote ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/60 text-[0.625rem] font-mono">
                            OUTBID (-₹15k)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[0.625rem] font-mono">
                            WALKAWAY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300">
                        {p.submittedQuote ? formatINR(p.submittedQuote.price) : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400">
                        {pPnl && isWon ? formatINR(pPnl.actualDeliveryCost) : '₹0'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {pPnl && isWon ? (
                          <span>
                            {pPnl.quotedMarginPct}% ➔ <strong className={pPnl.realizedMarginPct >= pPnl.quotedMarginPct ? 'text-emerald-400' : 'text-amber-400'}>{pPnl.realizedMarginPct}%</strong>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-cyan-300">
                        {pPnl ? formatINR(pPnl.riskAdjustedProfit) : '₹0'}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold text-sm ${
                        (pPnl?.realizedProfit || 0) > 0 ? 'text-emerald-400' : (pPnl?.realizedProfit || 0) < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {pPnl ? formatINR(pPnl.realizedProfit) : '₹0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* P&L Financial Waterfall for Winner */}
      {pnl.contractWon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Income Statement Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase font-mono text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <FileSpreadsheet className="w-4 h-4" />
              Delivery Income Statement (GAAP)
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-200">
                <span>Contract Revenue (Awarded Price):</span>
                <strong className="text-emerald-400 font-bold">{formatINR(pnl.quotedPrice)}</strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>(–) Cost of Goods Sold (FLC):</span>
                <span className="text-rose-300 font-semibold">{formatINR(pnl.actualDeliveryCost)}</span>
              </div>

              {pnl.eventCostDelta > 0 && (
                <div className="flex justify-between text-rose-400 pl-3 text-[0.6875rem]">
                  <span>↳ Event Cost Impact:</span>
                  <span>+{formatINR(pnl.eventCostDelta)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800 font-bold">
                <span>(=) Gross Operating Profit:</span>
                <span className={pnl.operatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatINR(pnl.operatingProfit)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>(–) Corporate Tax (20%):</span>
                <span>{pnl.tax > 0 ? `-${formatINR(pnl.tax)}` : '₹0'}</span>
              </div>

              {pnl.bidPrepCost > 0 && (
                <div className="flex justify-between text-amber-400/90">
                  <span>(–) Sunk Bid Preparation Cost:</span>
                  <span>-{formatINR(pnl.bidPrepCost)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-700 flex justify-between text-sm font-bold">
                <span className="text-slate-100">(=) NET REALIZED PROFIT:</span>
                <span className={`font-mono text-base ${pnl.realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(pnl.realizedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Margin Discipline & Risk Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase font-mono text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Percent className="w-4 h-4" />
                Margin Variance & Risk-Adjusted Profit Analysis
              </h3>

              <div className="space-y-3 pt-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Quoted Margin (at Bid Time):</span>
                  <strong className="text-slate-100">{pnl.quotedMarginPct}%</strong>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Realized Actual Margin:</span>
                  <strong className={pnl.realizedMarginPct >= pnl.quotedMarginPct ? 'text-emerald-400' : 'text-amber-400'}>
                    {pnl.realizedMarginPct}%
                  </strong>
                </div>

                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                  <span>Margin Variance:</span>
                  <span className={pnl.marginVariancePts >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {pnl.marginVariancePts >= 0 ? `+${pnl.marginVariancePts}` : pnl.marginVariancePts} pts
                  </span>
                </div>

                <div className="flex justify-between text-cyan-300">
                  <span>Risk-Adjusted Profit (RAP):</span>
                  <strong>{formatINR(pnl.riskAdjustedProfit)}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
              <span className="text-indigo-300 font-semibold">Reputation Impact: </span>
              {pnl.reputationReason} (New: <strong className="text-slate-100">{pnl.newReputation}/100</strong>)
            </div>
          </div>

        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-2 pb-safe">
        <button
          onClick={onProceedToLeaderboard}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
        >
          View Fiscal Year Leaderboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
