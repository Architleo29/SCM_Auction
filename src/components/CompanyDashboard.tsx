import React, { useState, useEffect } from 'react';
import { X, Award, ShieldCheck, Flame, Sparkles, Crown, Zap, Target } from 'lucide-react';
import { PlayerState } from '../types/game';
import { calculatePlayerXp, getPlayerLevelInfo, TIER_CONFIGS } from '../utils/gamification';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';
import { formatINR } from '../utils/formatters';

interface CompanyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerState | null;
  onPrestigeReset?: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  isOpen,
  onClose,
  player,
  onPrestigeReset
}) => {
  const { theme } = useTheme();
  const [prestigeCount, setPrestigeCount] = useState<number>(() => {
    const saved = localStorage.getItem('scm_prestige_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !player) return null;

  const totalXp = calculatePlayerXp(
    player.bankedProfit,
    player.contractsWon,
    player.disciplineWalkaways,
    player.reputation
  );
  const levelInfo = getPlayerLevelInfo(totalXp);
  const canPrestige = levelInfo.level >= 5;

  const handlePrestige = () => {
    if (!canPrestige) return;
    const next = prestigeCount + 1;
    setPrestigeCount(next);
    localStorage.setItem('scm_prestige_count', next.toString());
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });
    if (onPrestigeReset) onPrestigeReset();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in modal-backdrop"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto elevation-2">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dashboard"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Tier Badge & Prestige Crown */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 text-2xl shadow-lg">
            {levelInfo.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[0.625rem] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full border ${theme === 'dark' ? levelInfo.badgeBgDark : levelInfo.badgeBgLight}`}>
                Tier {levelInfo.level}: {levelInfo.title}
              </span>
              {prestigeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500 flex items-center gap-1 shadow-sm">
                  <Crown className="w-3 h-3 text-amber-300" />
                  Prestige {prestigeCount}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{player.name}</h2>
          </div>
        </div>

        {/* XP Progress Bar (§2.1) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">Executive XP Progress</span>
            <span className="text-slate-200 font-bold">
              {totalXp.toLocaleString()} / {levelInfo.nextLevelXp.toLocaleString()} XP ({levelInfo.progressPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`bg-gradient-to-r ${theme === 'dark' ? levelInfo.tierGradientDark : levelInfo.tierGradientLight} h-full rounded-full transition-all duration-500`}
              style={{ width: `${levelInfo.progressPct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-mono block">
            Next Tier: {levelInfo.level < 5 ? TIER_CONFIGS[levelInfo.level].title : 'Max Rank Achieved'}
          </span>
        </div>

        {/* Key Career Metrics & Streaks (§2.4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 uppercase font-bold">Banked Profit</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {formatINR(player.bankedProfit)}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 uppercase font-bold">Delivery Streak</span>
            <p className="text-base font-bold text-amber-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              {player.contractsWon} Wins
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 uppercase font-bold">Reputation</span>
            <p className="text-base font-bold text-indigo-300 mt-0.5">
              {player.reputation} / 100
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[0.625rem] text-slate-500 uppercase font-bold">Discipline Index</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">
              {player.disciplineWalkaways || 0} Exits
            </p>
          </div>
        </div>

        {/* Seasonal Prestige Option (§2.5) */}
        {canPrestige && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/60 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs font-mono">
                <Crown className="w-4 h-4 text-amber-300" />
                Seasonal Prestige Available (§2.5)
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Reset career XP to unlock a permanent prestige crown badge and restart the competitive ladder!
              </p>
            </div>
            <button
              onClick={handlePrestige}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Prestige Reset
            </button>
          </div>
        )}

        {/* Unlocked Achievements List (§11.4) */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs uppercase font-mono text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Career Achievements & Badges
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="text-lg">🎯</span>
              <div>
                <strong className="text-slate-200">Razor's Edge</strong>
                <p className="text-xs text-slate-400">Win a contract with realized margin under 3%.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="text-lg">🛡️</span>
              <div>
                <strong className="text-slate-200">Discipline Master</strong>
                <p className="text-xs text-slate-400">Walk away from high-risk or negative Expected Value bids.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="text-lg">⚡</span>
              <div>
                <strong className="text-slate-200">Shock Absorber</strong>
                <p className="text-xs text-slate-400">Survive a 25%+ supply-chain disruption profitably.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <span className="text-lg">👑</span>
              <div>
                <strong className="text-slate-200">Clean Sweep</strong>
                <p className="text-xs text-slate-400">5 consecutive contracts with zero defect penalties.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
