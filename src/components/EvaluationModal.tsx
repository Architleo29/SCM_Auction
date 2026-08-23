import React, { useEffect } from 'react';
import { Award, Trophy, CheckCircle, XCircle, ArrowRight, ShieldCheck, DollarSign, Star, Zap } from 'lucide-react';
import { BuyerEvaluationResult, PlayerState, RFQ } from '../types/game';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

import { formatINR } from '../utils/formatters';

interface EvaluationModalProps {
  evaluation: BuyerEvaluationResult;
  players: Record<string, PlayerState>;
  rfq: RFQ;
  myPlayerId: string;
  onProceedToEvent: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  evaluation,
  players,
  rfq,
  myPlayerId,
  onProceedToEvent
}) => {
  const isWinner = evaluation.winnerId === myPlayerId;

  useEffect(() => {
    sounds.award();
    if (isWinner) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isWinner]);

  const rankedFilteredPlayers = evaluation.rankedPlayerIds
    .filter(pId => players[pId] && !players[pId]?.isHost && (players[pId]?.isAi || (players[pId]?.submittedQuote && !players[pId]?.name.includes('Director') && !players[pId]?.name.includes('Spectator'))));

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Winner Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-center relative overflow-hidden space-y-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <span className="text-[0.625rem] sm:text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold block">
          Procurement Award Decision • QCBS Results
        </span>

        <h2 className="text-xl sm:text-3xl font-bold text-slate-100 leading-tight">
          Contract Awarded to: <br className="sm:hidden" />
          <span className="text-emerald-400">{evaluation.winnerName}</span>
        </h2>

        <p className="text-xs sm:text-sm font-mono text-slate-300">
          Awarded Contract Price: <strong className="text-emerald-400">{formatINR(evaluation.winningPrice)}</strong>
        </p>

        {isWinner && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-xs sm:text-xs font-semibold font-mono text-center">
              🎉 CONGRATULATIONS! YOU WON THE TENDER!
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 text-xs font-semibold font-mono shadow-md">
              ⭐ +500 XP EARNED
            </div>
          </div>
        )}
      </div>

      {/* Transparent Evaluation Scores */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Buyer Evaluation Scoring Breakdown
          </h3>
          <span className="text-[0.625rem] sm:text-xs text-slate-400 font-mono">Weighted Multi-Criteria</span>
        </div>

        {/* MOBILE CARD VIEW (Visible on mobile screens) */}
        <div className="block md:hidden space-y-2.5">
          {rankedFilteredPlayers.map((playerId, idx) => {
            const score = evaluation.scoresByPlayer[playerId];
            const p = players[playerId];
            if (!score || !p) return null;
            const isTopWinner = playerId === evaluation.winnerId;

            return (
              <div 
                key={playerId} 
                className={`p-3.5 rounded-2xl border transition ${
                  isTopWinner 
                    ? 'bg-emerald-950/30 border-emerald-600/60 shadow-sm' 
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isTopWinner 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isTopWinner ? '👑' : `#${idx + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-100 truncate">{p.name}</p>
                      {p.isAi && <span className="text-[0.625rem] text-slate-500 font-mono">AI: {p.aiPersonality}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[0.625rem] uppercase font-mono text-slate-500 block">Total Score</span>
                    <span className="text-sm font-semibold font-mono text-indigo-400">{score.totalWeightedScore} pts</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Price ({(rfq.weights.price * 100).toFixed(0)}%)</span>
                    <span className="text-emerald-400 font-bold">{score.priceScore} pts</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Quality ({(rfq.weights.quality * 100).toFixed(0)}%)</span>
                    <span className="text-indigo-400 font-bold">{score.qualityScore} pts</span>
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
                <th className="py-2.5 px-3">Price Score ({(rfq.weights.price * 100).toFixed(0)}%)</th>
                <th className="py-2.5 px-3">Quality Score ({(rfq.weights.quality * 100).toFixed(0)}%)</th>
                <th className="py-2.5 px-3 text-right">TOTAL QCBS SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedFilteredPlayers.map((playerId, idx) => {
                const score = evaluation.scoresByPlayer[playerId];
                const player = players[playerId];
                if (!score || !player) return null;

                const isTopWinner = playerId === evaluation.winnerId;

                return (
                  <tr key={playerId} className={isTopWinner ? 'bg-emerald-950/30' : ''}>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200 flex items-center gap-2">
                      {isTopWinner ? (
                        <span className="text-amber-400 font-bold">👑</span>
                      ) : (
                        <span className="text-slate-500">#{idx + 1}</span>
                      )}
                      <span>{player.name}</span>
                      {player.isAi && <span className="text-[0.625rem] text-slate-500">({player.aiPersonality})</span>}
                      {player.id === myPlayerId && (
                        <span className="text-[0.625rem] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          YOU
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {score.priceScore} pts
                    </td>

                    <td className="py-3 px-3 text-indigo-400 font-bold">
                      {score.qualityScore} pts
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-indigo-400 text-sm">
                      {score.totalWeightedScore} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onProceedToEvent}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
        >
          <span>Continue to P&L Settlement & Financial Breakdown</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
