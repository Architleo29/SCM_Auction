import React, { useState } from 'react';
import { 
  Search, 
  Unlock, 
  Eye, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Coins
} from 'lucide-react';
import { PlayerState, RFQ } from '../types/game';
import { calculateCostBreakdown } from '../engine/costCalculator';

import { formatINR } from '../utils/formatters';

interface IntelMarketProps {
  player: PlayerState;
  allPlayers: Record<string, PlayerState>;
  rfq: RFQ;
  onSpendIntelPoint: (actionType: 'reveal_weights' | 'reveal_rival', targetPlayerId?: string) => void;
  onBack: () => void;
}

export const IntelMarket: React.FC<IntelMarketProps> = ({
  player,
  allPlayers,
  rfq,
  onSpendIntelPoint,
  onBack
}) => {
  const [unlockedWeights, setUnlockedWeights] = useState(false);
  const [unlockedRivals, setUnlockedRivals] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleUnlockWeights = () => {
    if (player.intelPoints < 1) {
      setMessage('Insufficient Intel Points! Earn more by delivering contracts reliably.');
      return;
    }
    setUnlockedWeights(true);
    onSpendIntelPoint('reveal_weights');
    setMessage('Unlocked exact Buyer evaluation weights!');
  };

  const handleUnlockRival = (rivalId: string) => {
    if (player.intelPoints < 1) {
      setMessage('Insufficient Intel Points!');
      return;
    }
    setUnlockedRivals(prev => [...prev, rivalId]);
    onSpendIntelPoint('reveal_rival', rivalId);
    setMessage(`Unlocked cost intel on ${allPlayers[rivalId]?.name}!`);
  };

  const rivals = Object.values(allPlayers).filter(p => p.id !== player.id);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Information Asymmetry (§8)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Market Intelligence Office</h2>
          <p className="text-xs text-slate-400 mt-1">
            Spend Intel Points to eliminate uncertainty about buyer weights or rival vendor cost structures.
          </p>
        </div>

        <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 flex items-center gap-3 shrink-0">
          <Coins className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-[0.625rem] text-slate-500 uppercase font-mono">Intel Point Balance</p>
            <p className="text-2xl font-mono font-bold text-cyan-300">{player.intelPoints}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-cyan-950/50 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          {message}
        </div>
      )}

      {/* Available Intelligence Dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Buyer Weights Intel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Exact Buyer Weight Analysis
              </h3>
              <span className="text-[0.625rem] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                Cost: 1 Point
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Reveals the buyer's internal scoring percentages without the +/- 10% range uncertainty.
            </p>

            {unlockedWeights && (
              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Price Weight:</span>
                  <strong className="text-emerald-400">{(rfq.weights.price * 100).toFixed(0)}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Quality Weight:</span>
                  <strong className="text-indigo-400">{(rfq.weights.quality * 100).toFixed(0)}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Timeline Weight:</span>
                  <strong className="text-amber-400">{(rfq.weights.timeline * 100).toFixed(0)}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Reputation Weight:</span>
                  <strong className="text-cyan-400">{(rfq.weights.reputation * 100).toFixed(0)}%</strong>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleUnlockWeights}
            disabled={unlockedWeights || player.intelPoints < 1}
            className={`w-full py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              unlockedWeights
                ? 'bg-slate-800 text-slate-500 cursor-default'
                : player.intelPoints >= 1
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg shadow-cyan-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            {unlockedWeights ? 'Intel Already Decrypted' : 'Decrypt Buyer Weights (1 Pt)'}
          </button>
        </div>

        {/* Rival Cost Infiltration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                Competitor Cost Leaks
              </h3>
              <span className="text-[0.625rem] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                Cost: 1 Point / Rival
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Intercept rival suppliers' baseline cost structure and estimated Fully Loaded Cost.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rivals.map((rival) => {
                const isUnlocked = unlockedRivals.includes(rival.id);
                const rivalFlc = calculateCostBreakdown(rival.profile, rfq).fullyLoadedCost;

                return (
                  <div key={rival.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{rival.name}</span>
                      {isUnlocked ? (
                        <p className="text-xs font-mono text-amber-400 mt-0.5">
                          Estimated FLC: {formatINR(rivalFlc)} (Labor: {rival.profile.laborCostIndex}x, Mat: {rival.profile.materialsCostIndex}x)
                        </p>
                      ) : (
                        <p className="text-[0.625rem] font-mono text-slate-500">Economics Hidden</p>
                      )}
                    </div>

                    {!isUnlocked && (
                      <button
                        onClick={() => handleUnlockRival(rival.id)}
                        disabled={player.intelPoints < 1}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono disabled:opacity-40"
                      >
                        Infiltrate (1 Pt)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Return Action */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to RFQ & Quote Builder
        </button>
      </div>

    </div>
  );
};
