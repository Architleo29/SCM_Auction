import React, { useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  Flame,
  Sparkles,
  Users
} from 'lucide-react';
import { PlayerState, RoomConfig } from '../types/game';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { formatINR, isBuyerSpectator } from '../utils/formatters';

interface LeaderboardProps {
  players: Record<string, PlayerState>;
  myPlayerId: string;
  roomConfig: RoomConfig;
  isGameOver?: boolean;
  onNextRound: () => void;
  onPlayAgain: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  myPlayerId,
  roomConfig,
  isGameOver: isGameOverProp,
  onNextRound,
  onPlayAgain
}) => {
  const isGameOver = isGameOverProp !== undefined ? isGameOverProp : (roomConfig.currentRound >= roomConfig.totalRounds);
  
  // Strictly include competing vendors only (Exclude Buyer / Procurement Director)
  const sortedPlayers = Object.values(players)
    .filter(p => !isBuyerSpectator(p))
    .sort((a, b) => (b.score || b.bankedProfit) - (a.score || a.bankedProfit));

  const isHost = roomConfig.hostId === myPlayerId;
  const isMeTop1 = sortedPlayers[0]?.id === myPlayerId;

  useEffect(() => {
    sounds.award();
    if (isGameOver || isMeTop1) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isGameOver, isMeTop1]);

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs sm:text-xs font-mono font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Fiscal Championship Podium
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
          Final Fiscal Championship
        </h2>
      </div>

      {/* Leaderboard Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        
        {/* MOBILE CARD VIEW (Visible on mobile screens) */}
        <div className="block md:hidden space-y-2.5">
          {sortedPlayers.map((player, idx) => {
            const isMe = player.id === myPlayerId;
            const isTop1 = idx === 0;

            return (
              <div 
                key={player.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isTop1
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : isMe
                    ? 'bg-indigo-950/40 border-indigo-700/60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-semibold font-mono shrink-0 ${
                      isTop1 
                        ? 'bg-amber-500 text-slate-950' 
                        : idx === 1 
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isTop1 ? '👑' : `#${idx + 1}`}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                        <span className="truncate">{player.name}</span>
                        {isMe && (
                          <span className="text-[0.625rem] bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded font-mono font-bold shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      {player.isAi && <span className="text-[0.625rem] text-slate-500 font-mono">AI: {player.aiPersonality}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[0.625rem] uppercase font-mono text-slate-500 block">Score</span>
                    <span className="text-base font-bold font-mono text-indigo-400">{player.score.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 block">Profit</span>
                    <span className={`font-bold ${player.bankedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(player.bankedProfit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 block">Wins</span>
                    <span className="text-slate-200 font-bold flex items-center gap-1">
                      {player.contractsWon}
                      {player.contractsWon > 0 && <Flame className="w-3 h-3 text-amber-400" />}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-slate-500 block">Reputation</span>
                    <span className="text-indigo-300 font-bold">{player.reputation}/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE VIEW (Visible on md and larger) */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs font-mono min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Rank & Vendor</th>
                <th className="py-3 px-3 text-right">Banked Profit</th>
                <th className="py-3 px-3 text-center">Contracts Won</th>
                <th className="py-3 px-3 text-center">Reputation</th>
                <th className="py-3 px-4 text-right">COMPOSITE SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedPlayers.map((player, idx) => {
                const isMe = player.id === myPlayerId;
                const isTop1 = idx === 0;

                return (
                  <tr key={player.id} className={isMe ? 'bg-indigo-950/40 font-bold' : ''}>
                    <td className="py-3.5 px-3 flex items-center gap-2.5 font-sans">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold font-mono ${
                        isTop1 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                          : idx === 1 
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-100">{player.name}</span>
                      {isMe && (
                        <span className="text-[0.625rem] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          YOU
                        </span>
                      )}
                      {player.isAi && (
                        <span className="text-[0.625rem] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          AI
                        </span>
                      )}
                    </td>

                    <td className={`py-3.5 px-3 text-right font-semibold text-sm ${player.bankedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(player.bankedProfit)}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-300">
                      {player.contractsWon}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-300">
                      {player.reputation} / 100
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-base text-indigo-300">
                      {player.score.toLocaleString()} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex justify-end pt-2 pb-safe">
        {isGameOver ? (
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Fiscal Session
          </button>
        ) : isHost ? (
          <button
            onClick={onNextRound}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
          >
            Advance to Round {roomConfig.currentRound + 1}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full sm:w-auto text-xs text-slate-400 font-mono p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
            ⏳ Waiting for host to advance to the next round...
          </div>
        )}
      </div>

    </div>
  );
};
