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
  onCreateRoom: (scenarioId: IndustryScenarioId, totalRounds: number, difficulty: GameDifficulty, hostName: string, maxPlayers: number, auctionFormat?: AuctionFormat) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onAddAiBot: (personality: AIPersonality) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
  onOpenRfqBuilder?: () => void;
  onOpenManualModal?: () => void;
  onUpdatePlayerProfile?: (stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }) => void;
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
  onToggleReady,
  isSupabaseConnected = false,
  onOpenSupabaseModal
}) => {
  const [hostName, setHostName] = useState('Apex Procurement Directorate (Buyer)');
  const [joinName, setJoinName] = useState('Titan Global Dynamics');
  const [joinCode, setJoinCode] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<IndustryScenarioId>('manufacturing');
  const [selectedRounds, setSelectedRounds] = useState<number>(3);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('standard');
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<number>(4);
  const [chosenAuctionFormat, setChosenAuctionFormat] = useState<AuctionFormat>('english');
  const [copied, setCopied] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const playerList = Object.values(players);
  const isHost = roomConfig ? roomConfig.hostId === myPlayerId : false;
  const hostPlayer = playerList.find(p => p.isHost) || null;
  const vendorList = playerList.filter(p => !p.isHost);
  const me = players[myPlayerId] || null;

  const maxPlayers = roomConfig?.maxPlayers || 4;
  const isLobbyFull = vendorList.length >= maxPlayers;
  const readyVendorsCount = vendorList.filter(v => v.ready || v.isAi).length;

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
    const scenario = SCENARIOS[roomConfig.scenarioId];

    return (
      <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-6 animate-fade-in">
        
        {/* Room Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono">
                  {scenario.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {roomConfig.totalRounds} Fiscal Rounds • {maxPlayers} Max Vendors • {roomConfig.difficulty.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{scenario.name}</h2>
              
              {/* Buyer Authority Info */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-400">Buyer / Tender Authority:</span>
                <strong className="text-xs font-mono text-indigo-300">
                  {hostPlayer ? hostPlayer.name : 'Procurement Host'}
                </strong>
                <span className="text-[0.625rem] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {isHost ? 'YOU (BUYER)' : 'BUYER'}
                </span>
              </div>
            </div>

            {/* Room Code Box */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 shrink-0 shadow-lg">
              <div>
                <p className="text-[0.625rem] text-slate-500 font-mono uppercase tracking-wider font-bold">Room Code</p>
                <p className="text-2xl font-mono font-bold text-indigo-400 tracking-wider">
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

        {/* Players Grid & AI Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Connected Vendors List (Excludes Host, because Host is the Buyer!) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    Connected Vendor Competitors ({vendorList.length}/{maxPlayers})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    {readyVendorsCount}/{vendorList.length} Ready
                  </span>
                  <span className={`text-[0.6875rem] font-mono px-2.5 py-0.5 rounded-full ${isLobbyFull ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                    {isLobbyFull ? 'Room Full' : `${maxPlayers - vendorList.length} open`}
                  </span>
                </div>
              </div>

              {vendorList.length === 0 ? (
                <div className="p-8 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm">No Vendor Competitors Connected Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Share the room code <strong className="text-indigo-400 font-mono">{roomConfig.code}</strong> with players on mobile or other devices, or click <strong>Auto-Fill AI</strong> to populate competitors.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {vendorList.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        player.id === myPlayerId
                          ? 'bg-indigo-950/30 border-indigo-700/60 shadow-md shadow-indigo-950/50'
                          : player.isAi
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm ${
                          player.isAi
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {player.isAi ? <Bot className="w-4 h-4" /> : player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{player.name}</span>
                            {player.id === myPlayerId && (
                              <span className="text-[0.625rem] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                YOU (VENDOR)
                              </span>
                            )}
                            {player.ready ? (
                              <span className="text-[0.625rem] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" /> READY
                              </span>
                            ) : (
                              <span className="text-[0.625rem] bg-amber-950/60 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">
                                ⏳ Setting Up
                              </span>
                            )}
                            {player.isAi && (
                              <span className="text-[0.625rem] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono capitalize">
                                AI: {player.aiPersonality}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-semibold border border-slate-800 text-[0.6875rem]">
                              ⭐ Quality: {player.profile?.qualityLevel || 3}/5
                            </span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-indigo-300 font-semibold border border-slate-800 text-[0.6875rem]">
                              ⚡ Speed: {player.profile?.speedLevel || 3}/5
                            </span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300 font-semibold border border-slate-800 text-[0.6875rem]">
                              📉 Eff: {player.profile?.costEfficiency || 4}/5
                            </span>
                            <span className="text-[0.6875rem] text-slate-500">
                              (Rep: {player.reputation})
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {player.id === myPlayerId && !isHost && onUpdatePlayerProfile && (
                          <button
                            type="button"
                            onClick={() => setIsSetupModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Strategy (10 Pts)</span>
                          </button>
                        )}

                        {isHost && (
                          <button
                            onClick={() => onRemovePlayer(player.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition cursor-pointer"
                            title="Kick Vendor"
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
                  {vendorList.length >= 2 
                    ? `Ready to launch! (${readyVendorsCount}/${vendorList.length} vendors ready)` 
                    : `Add at least ${2 - vendorList.length} more vendor(s) (invite players or auto-fill AI) to start.`}
                </p>
                <div className="flex items-center gap-2.5">
                  {onOpenRfqBuilder && (
                    <button
                      type="button"
                      onClick={onOpenRfqBuilder}
                      disabled={vendorList.length < 2}
                      className={`px-4 py-3 rounded-2xl font-mono text-xs font-bold border flex items-center justify-center gap-2 transition cursor-pointer ${
                        vendorList.length >= 2
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
                    onClick={onStartGame}
                    disabled={vendorList.length < 2}
                    className={`px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                      vendorList.length >= 2
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Quick Start (Default RFQ)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Dedicated Vendor Ready & Strategy Action Panel */
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${me?.ready ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-slate-400">My Readiness:</span>
                        {me?.ready ? (
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR TENDER
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                            <Clock className="w-3.5 h-3.5" /> NOT READY (CONFIGURE STRATEGY)
                          </span>
                        )}
                      </div>
                      <p className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">
                        {me?.ready 
                          ? 'Your firm is ready! The Buyer can launch the procurement round at any moment.'
                          : 'Configure your 10 strategy points and click "I Am Ready" to signal the Buyer.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
                    {onUpdatePlayerProfile && (
                      <button
                        type="button"
                        onClick={() => setIsSetupModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-indigo-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Strategy (10 Pts)</span>
                      </button>
                    )}

                    {onToggleReady && (
                      <button
                        type="button"
                        onClick={() => onToggleReady(!me?.ready)}
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                          me?.ready
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/80 text-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{me?.ready ? 'Ready (Click to Edit)' : 'I Am Ready!'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Competitor Roster Panel (Host Only) */}
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
        </div>

        {/* Company Setup Modal (Only for guest vendors) */}
        {me && !isHost && onUpdatePlayerProfile && (
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
          Compete in high-stakes reverse auctions against rival vendors and procurement scoring engines. Build quotes, price risk, survive market shocks, and bank profits in INR (₹).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Host a New Room as Buyer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                <Play className="w-4 h-4 text-indigo-400 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Host as Procurement Authority (Buyer)</h3>
                <p className="text-[0.625rem] text-slate-400 font-mono">You will issue the RFQ and evaluate vendor bids</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer / Procurement Authority Name</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Scenario</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as IndustryScenarioId)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.values(SCENARIOS).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {SCENARIOS[selectedScenario].dominantRisk}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fiscal Rounds</label>
                  <select
                    value={selectedRounds}
                    onChange={(e) => setSelectedRounds(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={3}>3 Rounds (Quick)</option>
                    <option value={6}>6 Rounds (Standard)</option>
                    <option value={12}>12 Rounds (Campaign)</option>
                  </select>
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

              {/* Starting Auction Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Starting Auction Format</span>
                  <span className="text-xs font-mono text-indigo-400 capitalize">{chosenAuctionFormat}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChosenAuctionFormat('english')}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      chosenAuctionFormat === 'english'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔨</span> English
                  </button>
                  <button
                    type="button"
                    onClick={() => setChosenAuctionFormat('dutch')}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      chosenAuctionFormat === 'dutch'
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>⏳</span> Dutch
                  </button>
                  <button
                    type="button"
                    onClick={() => setChosenAuctionFormat('japanese')}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      chosenAuctionFormat === 'japanese'
                        ? 'bg-violet-500/20 border-violet-400 text-violet-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🇯🇵</span> Japanese
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onCreateRoom(selectedScenario, selectedRounds, selectedDifficulty, hostName, selectedMaxPlayers, chosenAuctionFormat)}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Create {selectedMaxPlayers}-Vendor Room & Generate Code
          </button>
        </div>

        {/* Join an Existing Room as a Competing Vendor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Join as Competing Vendor</h3>
                <p className="text-[0.625rem] text-slate-400 font-mono">You will quote and bid on contracts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Vendor Company Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Acme Global Logistics"
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
            Join Room as Vendor
          </button>
        </div>

      </div>

    </div>
  );
};
