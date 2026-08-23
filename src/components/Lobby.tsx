import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Play, 
  Copy, 
  Check, 
  Bot, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Gavel,
  BookOpen,
  Briefcase,
  Sliders,
  Share2,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { RoomConfig, PlayerState, IndustryScenarioId, GameDifficulty, AIPersonality, AuctionFormat } from '../types/game';
import { SCENARIOS } from '../data/scenarios';
import { CompanySetupModal } from './CompanySetupModal';

interface LobbyProps {
  roomConfig: RoomConfig | null;
  players: Record<string, PlayerState>;
  myPlayerId: string;
  onCreateRoom: (
    scenarioId: IndustryScenarioId, 
    totalRounds: number, 
    difficulty: GameDifficulty, 
    hostName: string, 
    maxPlayers: number, 
    auctionFormat?: AuctionFormat,
    forwardValuationMode?: 'private' | 'common'
  ) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onAddAiBot: (personality: AIPersonality) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
  onOpenRfqBuilder?: () => void;
  onOpenManualModal?: () => void;
  onUpdatePlayerProfile?: (stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }) => void;
  onQuickPlayVsBots?: (format?: AuctionFormat) => void;
  onStartForwardGame?: (valuationMode: 'private' | 'common') => void;
  onToggleReady?: (isReady: boolean) => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseModal?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  roomConfig,
  players,
  myPlayerId,
  onCreateRoom,
  onJoinRoom,
  onAddAiBot,
  onRemovePlayer,
  onStartGame,
  onOpenRfqBuilder,
  onOpenManualModal,
  onUpdatePlayerProfile,
  onQuickPlayVsBots,
  onStartForwardGame,
  onToggleReady,
  isSupabaseConnected,
  onOpenSupabaseModal
}) => {
  const [hostName, setHostName] = useState('Apex Procurement Directorate (Buyer)');
  const [joinName, setJoinName] = useState('Titan Global Dynamics');
  const [joinCode, setJoinCode] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<IndustryScenarioId>('manufacturing');
  const [selectedRounds, setSelectedRounds] = useState<number>(3);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('standard');
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<number>(4);
  const [chosenAuctionFormat, setChosenAuctionFormat] = useState<'english' | 'forward'>('english');
  const [selectedForwardValuationMode, setSelectedForwardValuationMode] = useState<'private' | 'common'>('private');
  const [copied, setCopied] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const playerList = Object.values(players);
  const isHost = roomConfig ? roomConfig.hostId === myPlayerId : false;
  const hostPlayer = playerList.find(p => p.isHost) || null;
  const isForwardFormat = roomConfig ? roomConfig.auctionFormatSequence[0] === 'forward' : false;
  const vendorList = playerList.filter(p => !p.isHost);
  const me = players[myPlayerId] || null;

  const maxPlayers = roomConfig?.maxPlayers || 4;
  const isLobbyFull = (isForwardFormat ? playerList.length : vendorList.length) >= maxPlayers;
  const readyCount = isForwardFormat 
    ? playerList.filter(p => p.ready || p.isHost).length 
    : vendorList.filter(v => v.ready || v.isAi).length;

  const handleAutoFillAi = () => {
    const needed = maxPlayers - vendorList.length;
    const botOrder: AIPersonality[] = ['aggressive', 'conservative', 'opportunist', 'copycat'];
    for (let i = 0; i < needed; i++) {
      onAddAiBot(botOrder[i % botOrder.length]);
    }
  };

  const handleCopyCode = () => {
    if (roomConfig) {
      navigator.clipboard.writeText(roomConfig.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If already inside a room lobby
  if (roomConfig) {
    const scenario = SCENARIOS[roomConfig.scenarioId] || SCENARIOS.manufacturing;
    const isForwardFormat = roomConfig.auctionFormatSequence[0] === 'forward';
    const playerList = Object.values(players);
    const hostPlayer = playerList.find(p => p.isHost);
    // In both formats, Host is the Organizer/Authority/Auctioneer; Guests are the participating competitors (Vendors or Buyers)
    const guestParticipants = playerList.filter(p => !p.isHost);
    const readyCount = guestParticipants.filter(p => p.ready).length;
    const maxPlayers = roomConfig.maxPlayers || 4;
    const isLobbyFull = guestParticipants.length >= maxPlayers;
    const me = players[myPlayerId];

    return (
      <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-6 animate-fade-in">
        
        {/* Room Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isForwardFormat ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                      📦 Forward English Auction
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {roomConfig.totalRounds} Asset Lots • {maxPlayers} Max Buyers • ₹10,00,000 Purse • {(roomConfig.forwardValuationMode || 'private') === 'private' ? 'Private Valuation' : 'Common Valuation'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono">
                      {scenario.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {roomConfig.totalRounds} Fiscal Rounds • {maxPlayers} Max Vendors • {roomConfig.difficulty.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-orange-950 text-orange-300 border border-orange-800 font-mono">
                      🔨 Reverse English Auction
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                {isForwardFormat ? 'Industrial & Logistics Asset Draft' : scenario.name}
              </h2>
              
              {/* Host / Auctioneer Info */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                <Building2 className={`w-4 h-4 ${isForwardFormat ? 'text-purple-400' : 'text-indigo-400'}`} />
                <span className="text-xs text-slate-400">
                  {isForwardFormat ? 'Auctioneer / Room Host:' : 'Buyer / Tender Authority:'}
                </span>
                <strong className={`text-xs font-mono ${isForwardFormat ? 'text-purple-300' : 'text-indigo-300'}`}>
                  {hostPlayer ? hostPlayer.name : (isForwardFormat ? 'Apex Auctioneer' : 'Procurement Host')}
                </strong>
                <span className={`text-[0.625rem] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isForwardFormat 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-800/60' 
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {isHost ? (isForwardFormat ? 'YOU (AUCTIONEER)' : 'YOU (BUYER)') : (isForwardFormat ? 'AUCTIONEER' : 'BUYER')}
                </span>
              </div>
            </div>

            {/* Room Code Box */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 shrink-0 shadow-lg">
              <div>
                <p className="text-[0.625rem] text-slate-500 font-mono uppercase tracking-wider font-bold">Room Code</p>
                <p className={`text-2xl font-mono font-bold tracking-wider ${isForwardFormat ? 'text-purple-400' : 'text-indigo-400'}`}>
                  {roomConfig.code}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Players Grid & Mode Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Connected Participants List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className={`w-5 h-5 ${isForwardFormat ? 'text-purple-400' : 'text-indigo-400'}`} />
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    {isForwardFormat 
                      ? `Connected Buyers (${guestParticipants.length}/${maxPlayers})`
                      : `Connected Vendor Competitors (${guestParticipants.length}/${maxPlayers})`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    {readyCount}/{guestParticipants.length} Ready
                  </span>
                  <span className={`text-[0.6875rem] font-mono px-2.5 py-0.5 rounded-full ${isLobbyFull ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                    {isLobbyFull ? 'Room Full' : `${maxPlayers - guestParticipants.length} open`}
                  </span>
                </div>
              </div>

              {/* Roster display */}
              {guestParticipants.length === 0 ? (
                <div className="p-8 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
                    isForwardFormat 
                      ? 'bg-purple-600/10 border-purple-500/20 text-purple-400' 
                      : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm">
                    {isForwardFormat ? 'No Guest Buyers Connected Yet' : 'No Vendor Competitors Connected Yet'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Share the room code <strong className={`font-mono ${isForwardFormat ? 'text-purple-400' : 'text-indigo-400'}`}>{roomConfig.code}</strong> with players on other devices to join as {isForwardFormat ? 'Asset Buyers' : 'Vendors'}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {guestParticipants.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        player.id === myPlayerId
                          ? isForwardFormat 
                            ? 'bg-purple-950/30 border-purple-700/60 shadow-md shadow-purple-950/50' 
                            : 'bg-indigo-950/30 border-indigo-700/60 shadow-md shadow-indigo-950/50'
                          : player.isAi
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm ${
                          isForwardFormat
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                            : player.isAi
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {player.isAi ? <Bot className="w-4 h-4" /> : player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{player.name}</span>
                            {player.id === myPlayerId && (
                              <span className={`text-[0.625rem] px-1.5 py-0.5 rounded font-mono font-bold ${
                                isForwardFormat 
                                  ? 'bg-purple-500/20 text-purple-300' 
                                  : 'bg-indigo-500/20 text-indigo-300'
                              }`}>
                                {isForwardFormat ? 'YOU (BUYER)' : 'YOU (VENDOR)'}
                              </span>
                            )}
                            {player.ready ? (
                              <span className="text-[0.625rem] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" /> READY
                              </span>
                            ) : (
                              <span className="text-[0.625rem] bg-amber-950/60 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">
                                ⏳ In Lobby
                              </span>
                            )}
                            {player.isAi && (
                              <span className="text-[0.625rem] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono capitalize">
                                AI: {player.aiPersonality}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="bg-slate-900 px-2.5 py-0.5 rounded-full text-indigo-300 font-semibold border border-slate-800 text-[0.6875rem]">
                              {isForwardFormat ? '🏢 Asset Investment Firm • ₹10,00,000 Purse' : '🏢 Supplier Firm'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isHost && player.id !== myPlayerId && (
                          <button
                            onClick={() => onRemovePlayer(player.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition cursor-pointer"
                            title="Kick Player"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar (Host vs Guest) */}
            {isHost ? (
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-400 font-mono">
                  {isForwardFormat ? (
                    guestParticipants.length >= 2
                      ? `Ready to launch asset draft! (${readyCount}/${guestParticipants.length} buyers connected & ready)`
                      : `Waiting for at least ${2 - guestParticipants.length} more buyer(s) to join via room code ${roomConfig.code}.`
                  ) : (
                    guestParticipants.length >= 2 
                      ? `Ready to launch! (${readyCount}/${guestParticipants.length} vendors ready)` 
                      : `Add at least ${2 - guestParticipants.length} more vendor(s) (invite players or auto-fill AI) to start.`
                  )}
                </p>
                <div className="flex items-center gap-2.5">
                  {!isForwardFormat && onOpenRfqBuilder && (
                    <button
                      type="button"
                      onClick={onOpenRfqBuilder}
                      disabled={guestParticipants.length < 2}
                      className={`px-4 py-3 rounded-2xl font-mono text-xs font-bold border flex items-center justify-center gap-2 transition cursor-pointer ${
                        guestParticipants.length >= 2
                          ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300 hover:text-white shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <span>Customize RFQ Tender</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={guestParticipants.length < 2}
                    onClick={() => {
                      if (!isForwardFormat && guestParticipants.length < 2) {
                        handleAutoFillAi();
                      }
                      setTimeout(() => {
                        onStartGame();
                      }, 100);
                    }}
                    className={`px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-xl text-white flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isForwardFormat
                        ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isForwardFormat ? 'Start Live Forward English Auction 🚀' : 'Start Live Auction Tender 🚀'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Dedicated Player Ready Action Panel */
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${me?.ready ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-slate-400">My Readiness:</span>
                        {me?.ready ? (
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR AUCTION
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                            <Clock className="w-3.5 h-3.5" /> NOT READY (CLICK TO READY UP)
                          </span>
                        )}
                      </div>
                      <p className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">
                        {me?.ready 
                          ? (isForwardFormat ? 'You are ready! When the Host starts, you will bid on 6 asset lots with your ₹10,00,000 purse.' : 'Your firm is ready! Once the Buyer publishes the RFQ tender, you will adjust strategy & submit your quote.')
                          : 'Click "I Am Ready" to signal the Host that you are prepared to begin.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
                    {onToggleReady && (
                      <button
                        type="button"
                        onClick={() => onToggleReady(!me?.ready)}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                          me?.ready
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/80 text-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{me?.ready ? 'Ready (Click to un-ready)' : '✅ I Am Ready!'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Panel: Forward Rules vs Reverse AI Bots */}
          {isForwardFormat ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Asset Draft Rules & Catalog</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <p className="font-bold text-purple-300 flex items-center gap-1.5">
                      <span>💰</span> ₹10,00,000 Starting Purse
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Every buyer manages a 10 Lakh INR budget across 6 sequential lots.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <span>⚡</span> Ascending English Bidding
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bid prices UP. +8s soft-close extension prevents last-second sniping.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>🏆</span> Surplus Championship Goal
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Winner is the buyer with highest Total Net Surplus (Value Captured − Price Paid).
                    </p>
                  </div>
                </div>
              </div>

              {/* Valuation Mode Badge */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Valuation System</span>
                <p className="text-xs font-mono font-bold text-purple-300">
                  {(roomConfig.forwardValuationMode || 'private') === 'private' 
                    ? '🎯 Mode A: Private Value (Unique Personal Valuations)' 
                    : '🎲 Mode B: Common Value (Winner\'s Curse Risk)'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Add AI Competitor Vendors</h3>
                  </div>
                  {isHost && !isLobbyFull && (
                    <button
                      onClick={handleAutoFillAi}
                      className="text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 rounded-xl font-mono transition flex items-center gap-1 cursor-pointer"
                      title="Auto-fill empty slots with randomized AI bots"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-Fill
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Add deterministic AI competitor bots to bid against human vendors (§9.4):
                </p>

                {isHost ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onAddAiBot('aggressive')}
                      disabled={isLobbyFull}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      <p className="font-semibold text-xs text-amber-300 group-hover:text-amber-200">
                        ⚡ Aggressive
                      </p>
                      <p className="text-[0.625rem] text-slate-500 mt-0.5">Under-cuts down to 2% margin</p>
                    </button>

                    <button
                      onClick={() => onAddAiBot('conservative')}
                      disabled={isLobbyFull}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      <p className="font-semibold text-xs text-emerald-300 group-hover:text-emerald-200">
                        🛡️ Conservative
                      </p>
                      <p className="text-[0.625rem] text-slate-500 mt-0.5">Protects 15%+ profit margins</p>
                    </button>

                    <button
                      onClick={() => onAddAiBot('opportunist')}
                      disabled={isLobbyFull}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      <p className="font-semibold text-xs text-cyan-300 group-hover:text-cyan-200">
                        🎯 Opportunist
                      </p>
                      <p className="text-[0.625rem] text-slate-500 mt-0.5">Snipes tactical ₹10k decrements</p>
                    </button>

                    <button
                      onClick={() => onAddAiBot('copycat')}
                      disabled={isLobbyFull}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      <p className="font-semibold text-xs text-purple-300 group-hover:text-purple-200">
                        🪞 Copycat
                      </p>
                      <p className="text-[0.625rem] text-slate-500 mt-0.5">Mirrors winning strategy</p>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center">
                    Only the buyer host can configure AI competitors.
                  </div>
                )}
              </div>

              {/* Scenario Rule Summary Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-bold uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  Scenario Dominant Risk
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dominant Risk:</span>
                    <span className="text-amber-400 capitalize">{scenario.dominantRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">QCBS Quality Wt:</span>
                    <span>{((scenario.sampleRfqs[0]?.weights.quality || 0.20) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">QCBS Price Wt:</span>
                    <span>{((scenario.sampleRfqs[0]?.weights.price || scenario.typicalPriceWeight || 0.35) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Setup Modal (Only for guest vendors in Reverse English) */}
        {!isForwardFormat && me && !isHost && onUpdatePlayerProfile && (
          <CompanySetupModal
            isOpen={isSetupModalOpen}
            onClose={() => setIsSetupModalOpen(false)}
            profile={me.profile}
            onSave={onUpdatePlayerProfile}
          />
        )}
      </div>
    );
  }

  // Not in a room: Show Host or Join Panels
  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-8 animate-fade-in">
      
      {/* Hero Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
          Procurement & Bidding Simulator
        </h2>
        <p className="text-sm text-slate-400">
          Compete in high-stakes reverse auctions and forward asset drafts. Build quotes, price risk, survive market shocks, and bank profits in INR (₹).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Host a New Room (Reverse English Procurement vs Forward English Asset Draft) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                chosenAuctionFormat === 'forward'
                  ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                  : 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-400'
              }`}>
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">
                  {chosenAuctionFormat === 'forward' 
                    ? 'Host Forward English Asset Draft' 
                    : 'Host Reverse English Procurement'}
                </h3>
                <p className="text-[0.625rem] text-slate-400 font-mono">
                  {chosenAuctionFormat === 'forward'
                    ? 'Create a room for 2–8 human buyers with ₹10L purse'
                    : 'Issue RFQ tender & evaluate vendor quotes'}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Auction Format Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Select Game / Auction Format</span>
                  <span className={`text-xs font-mono font-bold ${chosenAuctionFormat === 'english' ? 'text-orange-400' : 'text-purple-400'}`}>
                    {chosenAuctionFormat === 'english' ? '🔨 Reverse English Tender' : '📦 Forward English Asset Draft'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChosenAuctionFormat('english');
                      if (hostName.includes('Capital') || hostName.includes('Ventures')) {
                        setHostName('Apex Procurement Directorate (Buyer)');
                      }
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      chosenAuctionFormat === 'english'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md ring-1 ring-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">🔨</span>
                    <span>Reverse English</span>
                    <span className="text-[10px] text-slate-400 font-normal">Procurement Tender</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChosenAuctionFormat('forward');
                      if (hostName.includes('Procurement Directorate')) {
                        setHostName('Apex Capital (Host)');
                      }
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      chosenAuctionFormat === 'forward'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md ring-1 ring-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">📦</span>
                    <span>Forward English</span>
                    <span className="text-[10px] text-slate-400 font-normal">Multi-Buyer Asset Draft</span>
                  </button>
                </div>
              </div>

              {/* Host Player Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {chosenAuctionFormat === 'forward' ? 'Auctioneer / Host Name' : 'Buyer / Procurement Authority Name'}
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder={chosenAuctionFormat === 'forward' ? 'e.g. Apex Auctioneer (Host)' : 'e.g. Apex Procurement Authority'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {chosenAuctionFormat === 'forward' ? (
                /* Forward English Options */
                <div className="space-y-3.5 pt-1">
                  {/* Valuation Mode Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Valuation Model</span>
                      <span className="text-xs font-mono text-purple-300 font-bold">
                        {selectedForwardValuationMode === 'private' ? '🎯 Private Value' : '🎲 Common Value'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedForwardValuationMode('private')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          selectedForwardValuationMode === 'private'
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <p className="font-bold text-xs">🎯 Mode A: Private</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Unique personalized valuations</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedForwardValuationMode('common')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          selectedForwardValuationMode === 'common'
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <p className="font-bold text-xs">🎲 Mode B: Common</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Winner's Curse defense</p>
                      </button>
                    </div>
                  </div>

                  {/* Target Number of Buyers Selector (2 to 8) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Number of Competing Buyers</span>
                      <span className="text-xs font-mono text-purple-400 font-bold">{selectedMaxPlayers} Buyers</span>
                    </label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[2, 3, 4, 5, 6, 7, 8].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSelectedMaxPlayers(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                            selectedMaxPlayers === count
                              ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {count}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Asset Lots (Rounds) Selector (2 to 12) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Number of Asset Lots (Rounds)</span>
                      <span className="text-xs font-mono text-purple-400 font-bold">{selectedRounds} Lots</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {[2, 3, 4, 5, 6, 8, 10, 12].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSelectedRounds(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                            selectedRounds === count
                              ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {count}L
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-purple-300 flex items-center gap-1.5">
                      <span>📦</span> {selectedRounds}-Lot Asset Draft • ₹10,00,000 Purse
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All connected players will enter the room as <strong>Buyers</strong> with a ₹10 Lakh starting purse. No AI bots required — human buyers compete directly across {selectedRounds} sequential lots.
                    </p>
                  </div>
                </div>
              ) : (
                /* Reverse English Options */
                <div className="space-y-3.5">
                  {/* Industry Scenario Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
                    <select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value as IndustryScenarioId)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize font-medium"
                    >
                      {Object.values(SCENARIOS).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fiscal Rounds Selector (1 to 12) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Number of Fiscal Rounds</span>
                      <span className="text-xs font-mono text-indigo-400 font-bold">{selectedRounds} Rounds</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 8, 12].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSelectedRounds(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                            selectedRounds === count
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {count}R
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as GameDifficulty)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="standard">Standard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Target Number of Competing Vendors Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Number of Competing Vendors</span>
                      <span className="text-xs font-mono text-indigo-400 font-bold">{selectedMaxPlayers} Vendors</span>
                    </label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[2, 3, 4, 5, 6, 7, 8].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSelectedMaxPlayers(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                            selectedMaxPlayers === count
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {count}P
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (chosenAuctionFormat === 'forward') {
                onCreateRoom(
                  'manufacturing', 
                  selectedRounds, 
                  'standard', 
                  hostName.trim() || 'Apex Capital (Host)', 
                  selectedMaxPlayers, 
                  'forward',
                  selectedForwardValuationMode
                );
              } else {
                onCreateRoom(
                  selectedScenario, 
                  selectedRounds, 
                  selectedDifficulty, 
                  hostName.trim() || 'Apex Procurement Directorate', 
                  selectedMaxPlayers, 
                  'english'
                );
              }
            }}
            className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-xl transition flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95 ${
              chosenAuctionFormat === 'forward'
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {chosenAuctionFormat === 'forward'
                ? `Create ${selectedMaxPlayers}-Buyer Forward Room & Generate Code`
                : `Create ${selectedMaxPlayers}-Vendor Procurement Room & Generate Code`}
            </span>
          </button>
        </div>

        {/* Join an Existing Room as a Participant */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Join an Existing Room</h3>
                <p className="text-[0.625rem] text-slate-400 font-mono">Join as a Competing Vendor or Asset Buyer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Company / Buyer Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Acme Global or Titan Capital"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AUCT-48"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider uppercase text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onJoinRoom(joinCode, joinName)}
            disabled={!joinCode.trim() || !joinName.trim()}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95 disabled:cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            Join Room with Code
          </button>
        </div>

      </div>

      <div className="text-center pt-2">
        <span className="text-[11px] font-mono text-slate-500">
          🚀 SCM Procurement & Asset Auction Simulator
        </span>
      </div>

    </div>
  );
};

