import React, { useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  ForwardBuyerState, 
  ForwardValuationMode,
  calculateForwardPortfolioScore 
} from '../engine/forwardAuction';
import { formatINR } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface ForwardLeaderboardProps {
  buyers: Record<string, ForwardBuyerState>;
  valuationMode: ForwardValuationMode;
  myBuyerId: string;
  onPlayAgain: () => void;
}

export const ForwardLeaderboard: React.FC<ForwardLeaderboardProps> = ({
  buyers,
  valuationMode,
  myBuyerId,
  onPlayAgain
}) => {
  const rankedBuyers = Object.values(buyers).map(buyer => {
    const scoreBreakdown = calculateForwardPortfolioScore(buyer, valuationMode);
    return {
      ...buyer,
      ...scoreBreakdown
    };
  }).sort((a, b) => b.netSurplus - a.netSurplus);

  const isWinner = rankedBuyers[0]?.id === myBuyerId;

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-5 sm:space-y-6 animate-fade-in">
      
      {/* Trophy & Championship Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-3 relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold block">
            Forward English Auction • Portfolio Championship
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            {isWinner ? '🎉 Congratulations, You Won the Portfolio Championship!' : `🏆 ${rankedBuyers[0]?.name || 'Top Buyer'} Wins!`}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {valuationMode === 'private'
              ? 'Ranked by Total Private Value Surplus (Value Captured − Price Paid).'
              : 'Ranked by True Common Market Surplus (True Value − Price Paid). Winner\'s curse avoided!'}
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Final Buyer Standings</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {valuationMode === 'private' ? '🎯 Private Value Mode' : '🎲 Common Value Mode'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 px-2 font-semibold">Rank</th>
                <th className="pb-3 px-2 font-semibold">Buyer Name</th>
                <th className="pb-3 px-2 font-semibold text-center">Lots Won</th>
                <th className="pb-3 px-2 font-semibold text-right">Value Captured</th>
                <th className="pb-3 px-2 font-semibold text-right">Total Paid</th>
                <th className="pb-3 px-2 font-semibold text-right">Remaining Purse</th>
                <th className="pb-3 px-2 font-semibold text-right">Net Surplus (Score)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedBuyers.map((b, idx) => {
                const isMe = b.id === myBuyerId;
                return (
                  <tr key={b.id} className={isMe ? 'bg-indigo-950/30' : ''}>
                    <td className="py-3.5 px-2 font-bold text-slate-300">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={isMe ? 'text-indigo-300 font-bold' : 'text-slate-200'}>
                        {b.name} {isMe && '(You)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-300 font-semibold">
                      {b.itemsWon.length} lots
                    </td>
                    <td className="py-3.5 px-2 text-right text-indigo-300 font-semibold">
                      {formatINR(b.totalValueCaptured)}
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-400">
                      {formatINR(b.totalPricePaid)}
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-300">
                      {formatINR(b.remainingPurse)}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`font-bold ${b.netSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatINR(b.netSurplus)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Haul Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Your Acquired Asset Portfolio</span>
        </h3>

        {buyers[myBuyerId]?.itemsWon.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">You did not acquire any lots during this auction.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {buyers[myBuyerId]?.itemsWon.map((won, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-start">
                  <strong className="text-slate-100">{won.item.name}</strong>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">{won.item.category}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Price Paid: <strong className="text-rose-400">{formatINR(won.pricePaid)}</strong></span>
                  <span>Value: <strong className="text-emerald-400">{formatINR(valuationMode === 'private' ? won.valuation : won.item.baseMarketValue)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Another Session</span>
        </button>
      </div>

    </div>
  );
};
