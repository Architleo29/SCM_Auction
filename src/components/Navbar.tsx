import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Briefcase, 
  BookOpen, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  Award,
  Sparkles,
  Home
} from 'lucide-react';
import { GamePhase, PlayerState } from '../types/game';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/soundEffects';
import { calculatePlayerXp, getPlayerLevelInfo } from '../utils/gamification';

interface NavbarProps {
  roomCode: string | null;
  currentPhase: GamePhase;
  currentRound: number;
  totalRounds: number;
  player?: PlayerState | null;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onOpenDashboardModal: () => void;
  onOpenManualModal: () => void;
  onReturnToMainScreen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  currentPhase,
  currentRound,
  totalRounds,
  player,
  isSupabaseConnected,
  onOpenSupabaseModal,
  onOpenDashboardModal,
  onOpenManualModal,
  onReturnToMainScreen
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isAudioMuted, setIsAudioMuted] = useState(sounds.isMuted());

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsAudioMuted(nextMuted);
  };

  // Calculate Level & XP
  const totalXp = player 
    ? calculatePlayerXp(player.bankedProfit, player.contractsWon, player.disciplineWalkaways, player.reputation)
    : 0;
  const levelInfo = getPlayerLevelInfo(totalXp);

  // Step sequence mapping for visual gamification
  const steps = [
    { label: 'RFQ', active: currentPhase === 'RFQ_BUILDER' || currentPhase === 'RFQ' || currentPhase === 'DOSSIER' },
    { label: 'QUOTE', active: currentPhase === 'QUOTING' || currentPhase === 'INTEL' },
    { label: 'AUCTION', active: currentPhase === 'AUCTION' },
    { label: 'RESULTS', active: currentPhase === 'EVALUATION' || currentPhase === 'EVENT' || currentPhase === 'PNL' || currentPhase === 'LEADERBOARD' }
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand Logo & Name (Clickable to go back to Main Screen) */}
        <div 
          onClick={onReturnToMainScreen}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none"
          title="Return to Main Screen"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                SCM AUCTION
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800/60 font-mono">
                SIM
              </span>
            </div>
            <p className="text-[0.625rem] text-slate-500 dark:text-slate-400 font-mono hidden lg:block">
              Win deals. Don't lose the shirt.
            </p>
          </div>
        </div>

        {/* Gamified Level & XP Pill (§1.3 & §2.1) */}
        {player && !player.name.includes('Director') && !player.name.includes('Spectator') && (
          <div 
            onClick={onOpenDashboardModal}
            className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group card-hover-lift"
            title="Click to view Career Dashboard & Achievements"
          >
            <span className="text-base">{levelInfo.badge}</span>
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-[0.625rem] font-bold font-mono">
                <span className={theme === 'dark' ? levelInfo.darkColor : levelInfo.lightColor}>
                  Lvl {levelInfo.level}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono">{totalXp.toLocaleString()} XP</span>
                {player.contractsWon > 0 && (
                  <span className="flex items-center text-amber-400 text-[0.625rem] font-bold" title={`${player.contractsWon} Contracts Delivered`}>
                    🔥 {player.contractsWon}
                  </span>
                )}
              </div>
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className={`bg-gradient-to-r ${theme === 'dark' ? levelInfo.tierGradientDark : levelInfo.tierGradientLight} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${levelInfo.progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gamified Step Breadcrumb Tracker */}
        {roomCode && currentPhase !== 'LOBBY' && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 mr-1 font-bold">R{currentRound}/{totalRounds}</span>
            {steps.map((step, idx) => (
              <React.Fragment key={step.label}>
                <span className={`px-2 py-0.5 rounded-full font-bold transition ${
                  step.active 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40' 
                    : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && <span className="text-slate-700">›</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Main Menu Button (Visible when inside a game/round) */}
          {currentPhase !== 'LOBBY' && onReturnToMainScreen && (
            <button
              onClick={onReturnToMainScreen}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shadow-sm cursor-pointer"
              title="Return to Main Screen / Lobby"
            >
              <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Main Menu</span>
            </button>
          )}

          {/* Game Manual Button */}
          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition shadow-sm cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
            <span className="hidden sm:inline">Manual</span>
          </button>



          {/* Sound FX Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

