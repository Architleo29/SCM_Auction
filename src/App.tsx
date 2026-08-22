import React, { useState, useEffect, useRef } from 'react';
import { 
  GamePhase, 
  RoomConfig, 
  PlayerState, 
  RFQ, 
  Quote, 
  AuctionState, 
  DynamicEventCard, 
  BuyerEvaluationResult, 
  PnLResult, 
  IndustryScenarioId, 
  GameDifficulty, 
  AIPersonality,
  AuctionFormat
} from './types/game';
import { SCENARIOS } from './data/scenarios';
import { drawRandomEvent } from './data/dynamicEvents';
import { generateCompanyProfile } from './utils/profileGenerator';
import { evaluateQuotes } from './engine/buyerScoring';
import { settleContractPnL, calculateTotalScore } from './engine/pnlEngine';
import { generateAiQuote, shouldAiBidInEnglishAuction, shouldAiAcceptInDutchAuction, shouldAiHoldInJapaneseAuction } from './engine/aiBots';
import { roomSync, MultiplayerEvent } from './services/realtimeChannel';
import { getSavedSupabaseConfig } from './services/supabase';
import { sounds } from './utils/soundEffects';
import { formatINR } from './utils/formatters';
import { Clock, Building2, CheckCircle2, Users, Play, Sparkles, TrendingUp, Sliders, ShieldCheck } from 'lucide-react';

// UI Components
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SupabaseModal } from './components/SupabaseModal';
import { Lobby } from './components/Lobby';
import { CompanyDossier } from './components/CompanyDossier';
import { RfqBoard } from './components/RfqBoard';
import { IntelMarket } from './components/IntelMarket';
import { QuoteBuilder } from './components/QuoteBuilder';
import { AuctionArena } from './components/AuctionArena';
import { EvaluationModal } from './components/EvaluationModal';
import { EventModal } from './components/EventModal';
import { PnLBreakdown } from './components/PnLBreakdown';
import { Leaderboard } from './components/Leaderboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { RfqBuilder } from './components/RfqBuilder';
import { UserManualModal } from './components/UserManualModal';

export const App: React.FC = () => {
  // Session State
  const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null);
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [myPlayerId] = useState<string>(() => {
    try {
      let id = sessionStorage.getItem('scm_player_id');
      if (!id) {
        id = `player_${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('scm_player_id', id);
      }
      return id;
    } catch (e) {
      return `player_${Math.random().toString(36).substring(2, 7)}`;
    }
  });
  
  // Game Round State
  const [currentRfq, setCurrentRfq] = useState<RFQ | null>(null);
  const [submittedQuotes, setSubmittedQuotes] = useState<Quote[]>([]);
  const [activeAuction, setActiveAuction] = useState<AuctionState>({
    format: 'english',
    status: 'IDLE',
    currentPrice: 0,
    budgetCeiling: 0,
    timeRemaining: 30,
    currentLeaderId: null,
    currentLeaderName: null,
    bids: [],
    activePlayerIds: [],
    exits: [],
    winnerId: null,
    finalPrice: 0,
    dutchTickCount: 0
  });

  const [evaluationResult, setEvaluationResult] = useState<BuyerEvaluationResult | null>(null);
  const [activeEvent, setActiveEvent] = useState<DynamicEventCard | null>(null);
  const [quotingTimerSeconds, setQuotingTimerSeconds] = useState<number>(45);

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // References to prevent stale closure in interval loops
  const playersRef = useRef<Record<string, PlayerState>>(players);
  const quotesRef = useRef<Quote[]>(submittedQuotes);
  const rfqRef = useRef<RFQ | null>(currentRfq);
  const activeAuctionRef = useRef<AuctionState>(activeAuction);
  const roomConfigRef = useRef<RoomConfig | null>(roomConfig);
  const phaseRef = useRef<GamePhase>(phase);
  const isHostRef = useRef<boolean>(false);
  const auctionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const quotingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const me = players[myPlayerId] || null;
  const isHost = roomConfig ? roomConfig.hostId === myPlayerId : false;

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    quotesRef.current = submittedQuotes;
  }, [submittedQuotes]);

  useEffect(() => {
    rfqRef.current = currentRfq;
  }, [currentRfq]);

  useEffect(() => {
    activeAuctionRef.current = activeAuction;
  }, [activeAuction]);

  useEffect(() => {
    roomConfigRef.current = roomConfig;
  }, [roomConfig]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Check Supabase connection status on mount
  useEffect(() => {
    const cfg = getSavedSupabaseConfig();
    setIsSupabaseLive(!!(cfg.url && cfg.anonKey && cfg.url !== 'https://your-project-id.supabase.co'));
  }, []);

  // Subscribe to room synchronization messages
  useEffect(() => {
    if (!roomConfig) return;

    const handleMultiplayerEvent = (event: MultiplayerEvent) => {
      switch (event.type) {
        case 'ROOM_STATE_SYNC':
          if (event.payload.roomConfig) setRoomConfig(event.payload.roomConfig);
          if (event.payload.phase) setPhase(event.payload.phase);
          if (event.payload.players) {
            setPlayers(prev => {
              const incoming = event.payload.players;
              const localMe = prev[myPlayerId];
              // If local player exists and incoming sync doesn't have it yet, keep localMe
              if (localMe && !incoming[myPlayerId]) {
                return {
                  ...incoming,
                  [myPlayerId]: localMe
                };
              }
              return incoming;
            });
          }
          if (event.payload.currentRfq) setCurrentRfq(event.payload.currentRfq);
          if (event.payload.activeAuction) setActiveAuction(event.payload.activeAuction);
          if (event.payload.evaluationResult) setEvaluationResult(event.payload.evaluationResult);
          if (event.payload.activeEvent) setActiveEvent(event.payload.activeEvent);
          break;

        case 'PLAYER_JOINED': {
          const joinedId = event.payload.id;
          if (!joinedId) break;

          const joinedProfile = event.payload.profile || generateCompanyProfile(event.payload.name, Math.floor(Math.random() * 8));
          joinedProfile.name = event.payload.name;

          const newPlayer: PlayerState = {
            id: joinedId,
            name: event.payload.name,
            isHost: event.payload.isHost,
            isAi: false,
            profile: joinedProfile,
            score: 0,
            bankedProfit: 0,
            contractsWon: 0,
            reputation: joinedProfile.reputationScore || 50,
            intelPoints: 2,
            disciplineWalkaways: 0,
            ready: false,
            submittedQuote: null,
            history: []
          };

          setPlayers(prev => {
            const updated = { ...prev, [joinedId]: newPlayer };
            if (isHostRef.current) {
              setTimeout(() => {
                broadcastSync({
                  roomConfig: roomConfigRef.current,
                  phase: phaseRef.current,
                  players: updated,
                  currentRfq: rfqRef.current
                });
              }, 60);
            }
            return updated;
          });
          break;
        }

        case 'PLAYER_PROFILE_UPDATED': {
          const targetId = event.payload.playerId;
          setPlayers(prev => {
            const existing = prev[targetId];
            if (!existing) {
              if (event.payload.profile) {
                const newPlayer: PlayerState = {
                  id: targetId,
                  name: event.payload.profile.name || 'Vendor Company',
                  isHost: false,
                  isAi: false,
                  profile: event.payload.profile,
                  score: 0,
                  bankedProfit: 0,
                  contractsWon: 0,
                  reputation: event.payload.profile.reputationScore || 50,
                  intelPoints: 2,
                  disciplineWalkaways: 0,
                  ready: true,
                  submittedQuote: null,
                  history: []
                };
                const nextP = { ...prev, [targetId]: newPlayer };
                if (isHostRef.current) {
                  setTimeout(() => {
                    broadcastSync({ players: nextP });
                  }, 50);
                }
                return nextP;
              }
              return prev;
            }

            const updatedPlayer = {
              ...existing,
              ready: true,
              profile: {
                ...existing.profile,
                ...event.payload.stats,
                ...(event.payload.profile || {})
              }
            };

            const nextP = { ...prev, [targetId]: updatedPlayer };
            if (isHostRef.current) {
              setTimeout(() => {
                broadcastSync({ players: nextP });
              }, 50);
            }
            return nextP;
          });
          break;
        }

        case 'QUOTE_SUBMITTED':
          setSubmittedQuotes(prev => [...prev.filter(q => q.playerId !== event.payload.playerId), event.payload.quote]);
          setPlayers(prev => {
            const p = prev[event.payload.playerId];
            if (!p) return prev;
            const updated = {
              ...prev,
              [event.payload.playerId]: {
                ...p,
                submittedQuote: event.payload.quote
              }
            };

            // If I am Host, check if all human vendors have submitted
            if (isHostRef.current) {
              const humanVendors = Object.values(updated).filter(pl => !pl.isHost && !pl.isAi);
              const allSubmitted = humanVendors.length > 0 && humanVendors.every(pl => pl.submittedQuote !== null);
              if (allSubmitted) {
                setTimeout(() => {
                  handleQuotingTimeout();
                }, 1200);
              }
            }

            return updated;
          });
          break;

        case 'AUCTION_BID':
          setActiveAuction(prev => ({
            ...prev,
            currentPrice: event.payload.amount,
            currentLeaderId: event.payload.playerId,
            currentLeaderName: event.payload.playerName,
            timeRemaining: prev.timeRemaining < 15 ? prev.timeRemaining + 15 : prev.timeRemaining,
            bids: [
              {
                timestamp: Date.now(),
                playerId: event.payload.playerId,
                playerName: event.payload.playerName,
                amount: event.payload.amount,
                isAi: event.payload.isAi
              },
              ...prev.bids
            ]
          }));
          break;

        case 'AUCTION_BUZZ':
          handleAuctionResolved(event.payload.playerId, event.payload.price);
          break;
      }
    };

    roomSync.subscribe(roomConfig.code, handleMultiplayerEvent);

    return () => {
      roomSync.unsubscribe();
    };
  }, [roomConfig?.code]);

  // Host State Broadcast Helper
  const broadcastSync = (updates: any) => {
    roomSync.broadcast({
      type: 'ROOM_STATE_SYNC',
      payload: updates
    });
  };

  // 1. Create Custom Room
  const handleCreateRoom = (
    scenarioId: IndustryScenarioId, 
    totalRounds: number, 
    difficulty: GameDifficulty,
    hostName: string,
    maxPlayers: number = 4,
    auctionFormat: AuctionFormat = 'english'
  ) => {
    const code = `AUCT-${Math.floor(10 + Math.random() * 90)}`;
    const myProfile = generateCompanyProfile(hostName, 0);

    const config: RoomConfig = {
      code,
      hostId: myPlayerId,
      scenarioId,
      totalRounds,
      currentRound: 1,
      difficulty,
      auctionFormatSequence: [auctionFormat, 'dutch', 'japanese', 'english', 'dutch', 'japanese'],
      maxPlayers,
      createdAt: Date.now()
    };

    const initialPlayer: PlayerState = {
      id: myPlayerId,
      name: hostName,
      isHost: true,
      isAi: false,
      profile: myProfile,
      score: 0,
      bankedProfit: 0,
      contractsWon: 0,
      reputation: myProfile.reputationScore,
      intelPoints: 2,
      disciplineWalkaways: 0,
      ready: false,
      submittedQuote: null,
      history: []
    };

    setRoomConfig(config);
    setPlayers({ [myPlayerId]: initialPlayer });
    setPhase('LOBBY');

    // Immediately broadcast initial room state so joiners find the room populated
    setTimeout(() => {
      roomSync.broadcast({
        type: 'ROOM_STATE_SYNC',
        payload: {
          roomConfig: config,
          phase: 'LOBBY',
          players: { [myPlayerId]: initialPlayer }
        }
      }, code);
    }, 100);
  };

  // 2. Join Existing Room
  const handleJoinRoom = async (roomCodeInput: string, playerName: string) => {
    const code = roomCodeInput.toUpperCase().trim();
    if (!code) return;

    const trimmedPlayerName = playerName.trim() || 'Vendor Company';
    const myProfile = generateCompanyProfile(trimmedPlayerName, Math.floor(Math.random() * 8));
    myProfile.name = trimmedPlayerName;

    const newPlayer: PlayerState = {
      id: myPlayerId,
      name: trimmedPlayerName,
      isHost: false,
      isAi: false,
      profile: myProfile,
      score: 0,
      bankedProfit: 0,
      contractsWon: 0,
      reputation: myProfile.reputationScore,
      intelPoints: 2,
      disciplineWalkaways: 0,
      ready: false,
      submittedQuote: null,
      history: []
    };

    // Store in state immediately
    setPlayers(prev => ({
      ...prev,
      [myPlayerId]: newPlayer
    }));

    // 1. Fetch current server snapshot for this room
    try {
      const res = await fetch(`/api/sync/state?room=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data && data.state && data.state.roomConfig) {
        setRoomConfig(data.state.roomConfig);
        setPhase(data.state.phase || 'LOBBY');
        if (data.state.currentRfq) setCurrentRfq(data.state.currentRfq);
        if (data.state.activeAuction) setActiveAuction(data.state.activeAuction);
        
        const existingPlayers = data.state.players || {};
        setPlayers({ ...existingPlayers, [myPlayerId]: newPlayer });
      } else {
        const fallbackConfig: RoomConfig = {
          code,
          hostId: '',
          scenarioId: 'manufacturing',
          totalRounds: 3,
          currentRound: 1,
          difficulty: 'standard',
          auctionFormatSequence: ['english', 'dutch', 'japanese'],
          maxPlayers: 4,
          createdAt: Date.now()
        };
        setRoomConfig(fallbackConfig);
        setPhase('LOBBY');
      }
    } catch (e) {
      const fallbackConfig: RoomConfig = {
        code,
        hostId: '',
        scenarioId: 'manufacturing',
        totalRounds: 3,
        currentRound: 1,
        difficulty: 'standard',
        auctionFormatSequence: ['english', 'dutch', 'japanese'],
        maxPlayers: 4,
        createdAt: Date.now()
      };
      setRoomConfig(fallbackConfig);
      setPhase('LOBBY');
    }

    // 2. Broadcast join announcement with explicit room code
    setTimeout(() => {
      roomSync.broadcast({
        type: 'PLAYER_JOINED',
        payload: { id: myPlayerId, name: trimmedPlayerName, isHost: false, profile: myProfile }
      }, code);
    }, 150);
  };

  // 3. Add AI Bot Manually
  const handleAddAiBot = (personality: AIPersonality) => {
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const botNames = {
      aggressive: 'Vulcan Heavy Ind. (Aggressive)',
      conservative: 'Apex SafeBuild (Conservative)',
      opportunist: 'Matrix Dynamic Bids (Opportunist)',
      copycat: 'Echo Mirror Systems (Copycat)'
    };

    const profile = generateCompanyProfile(botNames[personality], Object.keys(players).length);
    const botState: PlayerState = {
      id: botId,
      name: botNames[personality],
      isHost: false,
      isAi: true,
      aiPersonality: personality,
      profile,
      score: 0,
      bankedProfit: 0,
      contractsWon: 0,
      reputation: profile.reputationScore,
      intelPoints: 2,
      disciplineWalkaways: 0,
      ready: true,
      submittedQuote: null,
      history: []
    };

    const updated = { ...players, [botId]: botState };
    setPlayers(updated);
    broadcastSync({ players: updated });
  };

  // 3b. 1-Click AI-Only Battle Royale (Opens RFQ Builder first)
  const handleStartAiOnlySimulation = (format: AuctionFormat = 'english') => {
    const code = `AI-SIM-${Math.floor(10 + Math.random() * 90)}`;
    const config: RoomConfig = {
      code,
      hostId: myPlayerId,
      scenarioId: 'manufacturing',
      totalRounds: 3,
      currentRound: 1,
      difficulty: 'standard',
      auctionFormatSequence: [format, 'dutch', 'japanese'],
      maxPlayers: 4,
      createdAt: Date.now()
    };

    // User is the Game Director Spectator
    const spectatorPlayer: PlayerState = {
      id: myPlayerId,
      name: 'Game Director (Spectator)',
      isHost: true,
      isAi: false,
      profile: generateCompanyProfile('Game Director', 0),
      score: 0,
      bankedProfit: 0,
      contractsWon: 0,
      reputation: 100,
      intelPoints: 5,
      disciplineWalkaways: 0,
      ready: true,
      submittedQuote: null,
      history: []
    };

    const botPersonalities: AIPersonality[] = ['aggressive', 'conservative', 'opportunist', 'copycat'];
    const botNames = {
      aggressive: 'Vulcan Heavy Ind. (Aggressive AI)',
      conservative: 'Apex SafeBuild (Conservative AI)',
      opportunist: 'Matrix Dynamic Bids (Opportunist AI)',
      copycat: 'Echo Mirror Systems (Copycat AI)'
    };

    const initialPlayers: Record<string, PlayerState> = {
      [myPlayerId]: spectatorPlayer
    };

    botPersonalities.forEach((personality, idx) => {
      const bId = `bot_${idx}_${Date.now()}`;
      initialPlayers[bId] = {
        id: bId,
        name: botNames[personality],
        isHost: false,
        isAi: true,
        aiPersonality: personality,
        profile: generateCompanyProfile(botNames[personality], idx + 1),
        score: 0,
        bankedProfit: 0,
        contractsWon: 0,
        reputation: 65,
        intelPoints: 2,
        disciplineWalkaways: 0,
        ready: true,
        submittedQuote: null,
        history: []
      };
    });

    setRoomConfig(config);
    setPlayers(initialPlayers);
    setPhase('RFQ_BUILDER');
  };

  // 3c. 1-Click Quick Play (You vs 3 Bots - Opens RFQ Builder first)
  const handleQuickPlayVsBots = (format: AuctionFormat = 'english') => {
    const code = `SOLO-${Math.floor(10 + Math.random() * 90)}`;
    const myProfile = generateCompanyProfile('Apex Procurement (You)', 0);

    const config: RoomConfig = {
      code,
      hostId: myPlayerId,
      scenarioId: 'manufacturing',
      totalRounds: 3,
      currentRound: 1,
      difficulty: 'standard',
      auctionFormatSequence: [format, 'dutch', 'japanese'],
      maxPlayers: 4,
      createdAt: Date.now()
    };

    const initialPlayers: Record<string, PlayerState> = {
      [myPlayerId]: {
        id: myPlayerId,
        name: 'Apex Procurement (You)',
        isHost: true,
        isAi: false,
        profile: myProfile,
        score: 0,
        bankedProfit: 0,
        contractsWon: 0,
        reputation: myProfile.reputationScore,
        intelPoints: 2,
        disciplineWalkaways: 0,
        ready: false,
        submittedQuote: null,
        history: []
      }
    };

    // Add 3 AI Bots
    const bots: { p: AIPersonality; name: string }[] = [
      { p: 'aggressive', name: 'Vulcan Heavy Ind. (Aggressive)' },
      { p: 'conservative', name: 'SafeBuild Dynamics (Conservative)' },
      { p: 'opportunist', name: 'Matrix Bidding Corp (Opportunist)' }
    ];

    bots.forEach((b, idx) => {
      const bId = `bot_${idx}_${Date.now()}`;
      initialPlayers[bId] = {
        id: bId,
        name: b.name,
        isHost: false,
        isAi: true,
        aiPersonality: b.p,
        profile: generateCompanyProfile(b.name, idx + 1),
        score: 0,
        bankedProfit: 0,
        contractsWon: 0,
        reputation: 60,
        intelPoints: 2,
        disciplineWalkaways: 0,
        ready: true,
        submittedQuote: null,
        history: []
      };
    });

    setRoomConfig(config);
    setPlayers(initialPlayers);
    setPhase('RFQ_BUILDER');
  };

  // 3d. Publish Custom RFQ & Begin Quoting / Bidding
  const handlePublishCustomRfq = (rfq: RFQ) => {
    setCurrentRfq(rfq);

    const isSpectating = me?.name.includes('Director') || me?.name.includes('Spectator');

    if (isSpectating) {
      // AI-Only Mode: Auto-generate quotes for all 4 AI bots and enter Live Auction
      const currentPlayers = { ...playersRef.current };
      const quotes: Quote[] = [];

      Object.values(currentPlayers).forEach(p => {
        if (p.isAi) {
          const q = generateAiQuote(p, rfq, currentPlayers);
          quotes.push(q);
          currentPlayers[p.id].submittedQuote = q;
        } else {
          currentPlayers[p.id].submittedQuote = null;
        }
      });

      setPlayers(currentPlayers);
      setSubmittedQuotes(quotes);

      // Launch into Live Auction Arena
      const initPrice = rfq.auctionFormat === 'dutch'
        ? Math.round(rfq.budgetCeiling * 1.25)
        : Math.round(rfq.budgetCeiling * 0.98);

      const initialAuction: AuctionState = {
        format: rfq.auctionFormat,
        status: 'BIDDING',
        currentPrice: initPrice,
        budgetCeiling: rfq.budgetCeiling,
        timeRemaining: rfq.auctionFormat === 'dutch' ? 30 : 25,
        currentLeaderId: quotes[0]?.playerId || null,
        currentLeaderName: quotes[0]?.playerName || null,
        bids: [
          {
            timestamp: Date.now(),
            playerId: quotes[0]?.playerId || 'bot_0',
            playerName: quotes[0]?.playerName || 'Opening Bid',
            amount: initPrice,
            isAi: true
          }
        ],
        activePlayerIds: Object.keys(currentPlayers).filter(id => id !== myPlayerId),
        exits: [],
        winnerId: null,
        finalPrice: initPrice,
        dutchTickCount: 0
      };

      setActiveAuction(initialAuction);
      setPhase('AUCTION');
      startAuctionLoop(initialAuction);
    } else {
      // Solo / Multiplayer: Player moves to Quoting
      setSubmittedQuotes([]);
      setPhase('DOSSIER');
      broadcastSync({
        phase: 'DOSSIER',
        currentRfq: rfq,
        roomConfig: roomConfigRef.current
      });
    }
  };

  // 4. Remove Player / Bot
  const handleRemovePlayer = (playerId: string) => {
    const updated = { ...players };
    delete updated[playerId];
    setPlayers(updated);
    broadcastSync({ players: updated });
  };

  // 5. Start Game / Round Initialization
  const handleStartGame = () => {
    if (!roomConfig) return;
    const scenario = SCENARIOS[roomConfig.scenarioId];
    const format = roomConfig.auctionFormatSequence[(roomConfig.currentRound - 1) % roomConfig.auctionFormatSequence.length];

    const rfq: RFQ = {
      ...scenario.sampleRfqs[0],
      id: `rfq_${Date.now()}`,
      roundNumber: roomConfig.currentRound,
      auctionFormat: format
    };

    setCurrentRfq(rfq);
    setSubmittedQuotes([]);
    setPhase('DOSSIER');

    broadcastSync({
      phase: 'DOSSIER',
      currentRfq: rfq,
      roomConfig
    });
  };

  // 6. Move from Dossier -> RFQ -> Quoting
  const handleProceedToRfq = () => setPhase('RFQ');
  const handleProceedToQuote = () => {
    setPhase('QUOTING');
    setQuotingTimerSeconds(45);

    if (quotingTimerRef.current) clearInterval(quotingTimerRef.current);
    quotingTimerRef.current = setInterval(() => {
      setQuotingTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(quotingTimerRef.current!);
          handleQuotingTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Quoting Submission Handler
  const handleSubmitQuote = (quote: Quote) => {
    const updatedQuotes = [...submittedQuotes.filter(q => q.playerId !== quote.playerId), quote];
    setSubmittedQuotes(updatedQuotes);

    const updatedPlayers = {
      ...players,
      [quote.playerId]: {
        ...players[quote.playerId],
        submittedQuote: quote
      }
    };
    setPlayers(updatedPlayers);

    roomSync.broadcast({
      type: 'QUOTE_SUBMITTED',
      payload: { playerId: quote.playerId, quote }
    });

    if (isHost) {
      const humanVendors = Object.values(updatedPlayers).filter(pl => !pl.isHost && !pl.isAi);
      const allSubmitted = humanVendors.length > 0 && humanVendors.every(pl => pl.submittedQuote !== null);
      if (allSubmitted) {
        setTimeout(() => {
          handleQuotingTimeout();
        }, 1200);
      }
    }
  };

  // When Quoting Completes -> Trigger AI Bot Quotes & Launch Live Auction
  const handleQuotingTimeout = () => {
    if (quotingTimerRef.current) clearInterval(quotingTimerRef.current);
    const rfq = rfqRef.current;
    if (!rfq) return;

    // 1. Generate Quotes for any AI Bots
    const finalQuotePool = [...quotesRef.current];
    const updatedPlayers = { ...playersRef.current };

    Object.values(updatedPlayers).forEach(p => {
      if (p.isAi && !p.submittedQuote) {
        const botQuote = generateAiQuote(p, rfq, updatedPlayers);
        finalQuotePool.push(botQuote);
        updatedPlayers[p.id] = { ...p, submittedQuote: botQuote };
      }
    });

    setPlayers(updatedPlayers);
    setSubmittedQuotes(finalQuotePool);

    // 2. Initialize Live Auction State Machine (Excluding the Buyer Host!)
    const activeVendorIds = Object.keys(updatedPlayers).filter(id => !updatedPlayers[id].isHost);
    const sortedInitialQuotes = [...finalQuotePool].sort((a, b) => a.price - b.price);
    const lowestInitialQuote = sortedInitialQuotes[0];

    const initPrice = rfq.auctionFormat === 'dutch' 
      ? Math.round(rfq.budgetCeiling * 0.65) // Starts low and ticks UP
      : rfq.auctionFormat === 'japanese'
      ? Math.round(rfq.budgetCeiling * 1.25) // Starts high and ticks DOWN
      : (lowestInitialQuote ? lowestInitialQuote.price : Math.round(rfq.budgetCeiling * 0.98));

    const initialAuction: AuctionState = {
      format: rfq.auctionFormat,
      status: 'BIDDING',
      currentPrice: initPrice,
      budgetCeiling: rfq.budgetCeiling,
      timeRemaining: rfq.auctionFormat === 'dutch' ? 30 : 35,
      currentLeaderId: lowestInitialQuote?.playerId || null,
      currentLeaderName: lowestInitialQuote?.playerName || null,
      bids: sortedInitialQuotes.map(q => ({
        timestamp: q.submittedAt,
        playerId: q.playerId,
        playerName: q.playerName,
        amount: q.price,
        isAi: updatedPlayers[q.playerId]?.isAi || false
      })),
      activePlayerIds: activeVendorIds,
      exits: [],
      winnerId: null,
      finalPrice: initPrice,
      dutchTickCount: 0
    };

    setActiveAuction(initialAuction);
    setPhase('AUCTION');

    broadcastSync({
      phase: 'AUCTION',
      activeAuction: initialAuction,
      players: updatedPlayers
    });

    startAuctionLoop(initialAuction);
  };

  // 7. Live Auction Loop (English / Dutch / Japanese)
  const startAuctionLoop = (initialState: AuctionState) => {
    if (auctionTimerRef.current) clearInterval(auctionTimerRef.current);

    auctionTimerRef.current = setInterval(() => {
      const activeRfq = rfqRef.current;
      const currentActivePlayers = playersRef.current;
      const state = { ...activeAuctionRef.current };

      if (!activeRfq) return;

      if (state.timeRemaining <= 1) {
        clearInterval(auctionTimerRef.current!);
        const winningId = state.currentLeaderId || state.activePlayerIds[0] || Object.keys(currentActivePlayers)[0];
        handleAuctionResolved(winningId, state.currentPrice);
        return;
      }

      state.timeRemaining -= 1;
      sounds.tick();

      // 1. REVERSE DUTCH AUCTION (Price rises every 2 seconds, AI evaluates buzz)
      if (state.format === 'dutch' && state.timeRemaining % 2 === 0) {
        state.currentPrice = Math.min(
          Math.round(activeRfq.budgetCeiling * 1.50),
          Math.round(state.currentPrice * 1.035)
        );

        for (const p of Object.values(currentActivePlayers)) {
          if (p.isAi && shouldAiAcceptInDutchAuction(p, state.currentPrice, activeRfq)) {
            clearInterval(auctionTimerRef.current!);
            handleAuctionResolved(p.id, state.currentPrice);
            return;
          }
        }
      }

      // 2. JAPANESE CLOCK AUCTION (Drops price every 2 seconds, bots exit below floor)
      if (state.format === 'japanese' && state.timeRemaining % 2 === 0) {
        state.currentPrice = Math.max(
          Math.round(activeRfq.budgetCeiling * 0.55),
          Math.round(state.currentPrice * 0.975)
        );

        // Check each active AI bot to see if they hold or exit
        const remainingActive: string[] = [];
        for (const pId of state.activePlayerIds) {
          const p = currentActivePlayers[pId];
          if (p && p.isAi) {
            const shouldHold = shouldAiHoldInJapaneseAuction(p, state.currentPrice, activeRfq);
            if (shouldHold) {
              remainingActive.push(pId);
            } else {
              // Bot Exits permanently
              state.exits = [
                { timestamp: Date.now(), playerId: p.id, playerName: p.name, exitPrice: state.currentPrice },
                ...state.exits
              ];
              state.bids = [
                { timestamp: Date.now(), playerId: p.id, playerName: `🔴 ${p.name} Exited`, amount: state.currentPrice, isAi: true },
                ...state.bids
              ];
            }
          } else if (p) {
            remainingActive.push(pId);
          }
        }

        state.activePlayerIds = remainingActive;

        // If only 1 player remains in Japanese auction, they win!
        if (remainingActive.length === 1) {
          clearInterval(auctionTimerRef.current!);
          const winnerId = remainingActive[0];
          const secondPrice = state.exits[0]?.exitPrice || state.currentPrice;
          handleAuctionResolved(winnerId, secondPrice);
          return;
        }
      }

      // 3. REVERSE ENGLISH AUCTION (Active dynamic counter-bidding every 1-2s)
      if (state.format === 'english') {
        const eligibleAiBots = Object.values(currentActivePlayers).filter(
          p => p.isAi && p.id !== state.currentLeaderId
        );

        if (eligibleAiBots.length > 0) {
          // Shuffle to randomize bidding order
          const candidate = eligibleAiBots[Math.floor(Math.random() * eligibleAiBots.length)];
          const aiBid = shouldAiBidInEnglishAuction(candidate, state.currentPrice, activeRfq);

          if (aiBid.shouldBid && aiBid.nextBidAmount < state.currentPrice) {
            state.currentPrice = aiBid.nextBidAmount;
            state.currentLeaderId = candidate.id;
            state.currentLeaderName = candidate.name;
            state.timeRemaining = state.timeRemaining < 15 ? state.timeRemaining + 8 : state.timeRemaining;
            state.bids = [
              {
                timestamp: Date.now(),
                playerId: candidate.id,
                playerName: candidate.name,
                amount: aiBid.nextBidAmount,
                isAi: true
              },
              ...state.bids
            ];
            if (currentActivePlayers[candidate.id]?.submittedQuote) {
              currentActivePlayers[candidate.id].submittedQuote = {
                ...currentActivePlayers[candidate.id].submittedQuote!,
                price: aiBid.nextBidAmount
              };
            }
            sounds.bid();
          }
        }
      }

      setActiveAuction(state);
    }, 1000);
  };

  // 8. Auction Resolution -> Buyer Evaluation
  const handleAuctionResolved = (winnerId: string, finalPrice: number) => {
    if (auctionTimerRef.current) clearInterval(auctionTimerRef.current);
    const activeRfq = rfqRef.current;
    if (!activeRfq) return;

    const currentQuotes = quotesRef.current;
    const currentActivePlayers = playersRef.current;

    const evaluatedQuotes = currentQuotes.map(q => {
      if (q.playerId === winnerId) {
        return { ...q, price: finalPrice };
      }
      const playerCurrentQuote = currentActivePlayers[q.playerId]?.submittedQuote;
      if (playerCurrentQuote) {
        return { ...q, price: playerCurrentQuote.price };
      }
      return q;
    });

    const evalResult = evaluateQuotes(activeRfq, evaluatedQuotes, currentActivePlayers);
    setEvaluationResult(evalResult);
    setSubmittedQuotes(evaluatedQuotes);
    quotesRef.current = evaluatedQuotes;
    setPhase('EVALUATION');

    broadcastSync({
      phase: 'EVALUATION',
      evaluationResult: evalResult
    });
  };

  // User Actions during Auction
  const handlePlaceEnglishBid = (amount: number) => {
    if (!me) return;
    const bidEvent = {
      type: 'AUCTION_BID' as const,
      payload: {
        playerId: me.id,
        playerName: me.name,
        amount,
        isAi: false
      }
    };
    roomSync.broadcast(bidEvent);
    setActiveAuction(prev => ({
      ...prev,
      currentPrice: amount,
      currentLeaderId: me.id,
      currentLeaderName: me.name,
      timeRemaining: prev.timeRemaining < 15 ? prev.timeRemaining + 15 : prev.timeRemaining,
      bids: [{ timestamp: Date.now(), playerId: me.id, playerName: me.name, amount, isAi: false }, ...prev.bids]
    }));
  };

  const handleBuzzDutch = () => {
    if (!me) return;
    roomSync.broadcast({
      type: 'AUCTION_BUZZ',
      payload: { playerId: me.id, playerName: me.name, price: activeAuction.currentPrice }
    });
    handleAuctionResolved(me.id, activeAuction.currentPrice);
  };

  const handleExitJapanese = () => {
    if (!me) return;
    setActiveAuction(prev => ({
      ...prev,
      activePlayerIds: prev.activePlayerIds.filter(id => id !== me.id),
      exits: [{ timestamp: Date.now(), playerId: me.id, playerName: me.name, exitPrice: prev.currentPrice }, ...prev.exits]
    }));
  };

  // 9. Draw Dynamic Event Card
  const handleProceedToEvent = () => {
    setActiveEvent(null);
    // directly call PnL calculation inline to ensure state sync
    const activeRfq = rfqRef.current;
    if (!activeRfq || !evaluationResult) return;
    
    const winningPrice = evaluationResult.winningPrice;
    const currentQuotes = submittedQuotes;
    const rawQuote = currentQuotes.find(q => q.playerId === evaluationResult.winnerId) || null;
    const winningQuote = (rawQuote && winningPrice > 0) ? { ...rawQuote, price: winningPrice } : rawQuote;

    const updatedPlayers = { ...playersRef.current };
    Object.values(updatedPlayers).forEach(p => {
      const isWinner = p.id === evaluationResult.winnerId;
      const pnl = settleContractPnL(p, activeRfq, winningQuote, isWinner, null);
      const newBankedProfit = p.bankedProfit + pnl.realizedProfit;
      const newContractsWon = p.contractsWon + (isWinner ? 1 : 0);
      const newScore = calculateTotalScore(newBankedProfit, newContractsWon, pnl.newReputation, pnl.riskAdjustedProfit);
      updatedPlayers[p.id] = {
        ...p,
        bankedProfit: newBankedProfit,
        contractsWon: newContractsWon,
        reputation: pnl.newReputation,
        score: newScore,
        lastPnL: pnl,
        history: [...p.history, pnl]
      };
    });
    setPlayers(updatedPlayers);
    setPhase('PNL');
    broadcastSync({ phase: 'PNL', players: updatedPlayers });
  };

  // 10. Settle Contract P&L
  const handleProceedToPnL = () => {
    const activeRfq = rfqRef.current;
    if (!activeRfq || !evaluationResult) return;

    const winningQuote = submittedQuotes.find(q => q.playerId === evaluationResult.winnerId) || null;
    const updatedPlayers = { ...playersRef.current };

    Object.values(updatedPlayers).forEach(p => {
      const isWinner = p.id === evaluationResult.winnerId;
      const pnl = settleContractPnL(p, activeRfq, winningQuote, isWinner, activeEvent);
      
      const newBankedProfit = p.bankedProfit + pnl.realizedProfit;
      const newContractsWon = p.contractsWon + (isWinner ? 1 : 0);
      const newScore = calculateTotalScore(newBankedProfit, newContractsWon, pnl.newReputation, pnl.riskAdjustedProfit);

      updatedPlayers[p.id] = {
        ...p,
        bankedProfit: newBankedProfit,
        contractsWon: newContractsWon,
        reputation: pnl.newReputation,
        score: newScore,
        lastPnL: pnl,
        history: [...p.history, pnl]
      };
    });

    setPlayers(updatedPlayers);
    setPhase('PNL');

    broadcastSync({
      phase: 'PNL',
      players: updatedPlayers
    });
  };

  // 11. Advance Round / Game Over
  const handleProceedToLeaderboard = () => {
    setPhase('LEADERBOARD');
  };

  const handleNextRound = () => {
    if (!roomConfig) return;
    const nextRound = roomConfig.currentRound + 1;
    const isGameOver = nextRound > roomConfig.totalRounds;

    if (isGameOver) {
      setPhase('GAMEOVER');
      broadcastSync({ phase: 'GAMEOVER' });
    } else {
      const updatedConfig = { ...roomConfig, currentRound: nextRound };
      setRoomConfig(updatedConfig);

      // Reset all per-round player states cleanly
      const cleanPlayers: Record<string, PlayerState> = {};
      Object.entries(players).forEach(([id, p]) => {
        cleanPlayers[id] = {
          ...p,
          ready: p.isAi,
          submittedQuote: null,
          lastPnL: undefined
        };
      });

      quotesRef.current = [];
      playersRef.current = cleanPlayers;
      setPlayers(cleanPlayers);
      setSubmittedQuotes([]);
      setActiveAuction({
        format: 'english',
        status: 'IDLE',
        currentPrice: 0,
        budgetCeiling: 0,
        timeRemaining: 30,
        currentLeaderId: null,
        currentLeaderName: null,
        bids: [],
        activePlayerIds: [],
        exits: [],
        winnerId: null,
        finalPrice: 0,
        dutchTickCount: 0
      });
      setActiveEvent(null);
      setEvaluationResult(null);

      // Open RFQ Builder for Round N!
      setPhase('RFQ_BUILDER');

      broadcastSync({
        phase: 'RFQ_BUILDER',
        roomConfig: updatedConfig,
        players: cleanPlayers
      });
    }
  };

  const handleReturnToMainScreen = () => {
    if (phase !== 'LOBBY') {
      const confirmLeave = window.confirm('Return to main screen? Your current game progress will be reset.');
      if (!confirmLeave) return;
    }
    
    // Clear any timers/intervals if running
    if (auctionTimerRef.current) {
      clearInterval(auctionTimerRef.current);
    }
    if (quotingTimerRef.current) {
      clearInterval(quotingTimerRef.current);
    }
    
    setPhase('LOBBY');
    setRoomConfig(null);
    setPlayers({});
    setCurrentRfq(null);
    setEvaluationResult(null);
    setActiveEvent(null);
  };

  // Selected player for PnL breakdown view
  const winnerPlayer = evaluationResult?.winnerId ? players[evaluationResult.winnerId] : null;
  const handleUpdateMyProfile = (stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }) => {
    setPlayers(prev => {
      const me = prev[myPlayerId];
      if (!me) return prev;
      const updatedProfile = {
        ...me.profile,
        qualityLevel: stats.qualityLevel,
        speedLevel: stats.speedLevel,
        costEfficiency: stats.costEfficiency
      };
      const updatedMe = {
        ...me,
        ready: true,
        profile: updatedProfile
      };
      const nextPlayers = { ...prev, [myPlayerId]: updatedMe };

      // Broadcast specific profile update event across the room
      roomSync.broadcast({
        type: 'PLAYER_PROFILE_UPDATED',
        payload: {
          playerId: myPlayerId,
          stats,
          profile: updatedProfile
        }
      });

      return nextPlayers;
    });
  };

  const isSpectating = me?.name.includes('Director') || me?.name.includes('Spectator');
  const pnlDisplayPlayer = (!isSpectating && me?.lastPnL) ? me : (winnerPlayer || Object.values(players).find(p => p.isAi && p.lastPnL) || Object.values(players)[0]);

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-150">
      
      {/* Top Navbar */}
      <Navbar
        roomCode={roomConfig?.code || null}
        currentPhase={phase}
        currentRound={roomConfig?.currentRound || 1}
        totalRounds={roomConfig?.totalRounds || 6}
        player={me}
        isSupabaseConnected={isSupabaseLive}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenDashboardModal={() => setIsDashboardModalOpen(true)}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onReturnToMainScreen={handleReturnToMainScreen}
      />

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col justify-center py-6 px-3">
        {phase === 'LOBBY' && (
          <Lobby
            roomConfig={roomConfig}
            players={players}
            myPlayerId={myPlayerId}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onAddAiBot={handleAddAiBot}
            onRemovePlayer={handleRemovePlayer}
            onStartGame={handleStartGame}
            onOpenRfqBuilder={() => setPhase('RFQ_BUILDER')}
            onQuickPlayVsBots={handleQuickPlayVsBots}
            onStartAiOnlyMode={handleStartAiOnlySimulation}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            onUpdatePlayerProfile={handleUpdateMyProfile}
          />
        )}

        {phase === 'RFQ_BUILDER' && (
          <RfqBuilder
            key={`rfq_builder_round_${roomConfig?.currentRound || 1}`}
            initialScenarioId={roomConfig?.scenarioId || 'manufacturing'}
            selectedAuctionFormat={roomConfig?.auctionFormatSequence[((roomConfig.currentRound || 1) - 1) % roomConfig.auctionFormatSequence.length] || 'english'}
            roundNumber={roomConfig?.currentRound || 1}
            onPublishRfq={handlePublishCustomRfq}
            onBackToMainScreen={handleReturnToMainScreen}
          />
        )}

        {phase === 'DOSSIER' && isHost && currentRfq && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    🏛️ Procurement Authority Dashboard • Round {roomConfig?.currentRound} of {roomConfig?.totalRounds}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-100 mt-1">{currentRfq.title}</h2>
                </div>
                <span className="px-3 py-1.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-xl text-xs font-mono font-bold self-start sm:self-auto">
                  Tender Published
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 uppercase block text-[0.625rem]">Budget Ceiling</span>
                  <strong className="text-emerald-400 text-sm">{formatINR(currentRfq.budgetCeiling)}</strong>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 uppercase block text-[0.625rem]">Turnaround Days</span>
                  <strong className="text-amber-400 text-sm">{currentRfq.requiredDeliveryDays} Days</strong>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 uppercase block text-[0.625rem]">Auction Format</span>
                  <strong className="text-indigo-400 text-sm capitalize">{currentRfq.auctionFormat}</strong>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 uppercase block text-[0.625rem]">Competing Vendors</span>
                  <strong className="text-slate-100 text-sm">{Object.values(players).filter(p => !p.isHost).length} Firms</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-slate-200 uppercase font-mono block">Commercial Tender Scope:</span>
                <p className="leading-relaxed">{currentRfq.description}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleProceedToQuote}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  📢 Open Vendor Quoting Window
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'DOSSIER' && !isHost && me && (
          <CompanyDossier
            profile={me.profile}
            playerName={me.name}
            roundNumber={roomConfig?.currentRound || 1}
            totalRounds={roomConfig?.totalRounds || 6}
            onProceed={handleProceedToRfq}
            onUpdateProfile={handleUpdateMyProfile}
          />
        )}

        {phase === 'RFQ' && isHost && currentRfq && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    🏛️ Procurement Authority Review • Round {roomConfig?.currentRound}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-100 mt-1">{currentRfq.title}</h2>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-slate-200 uppercase font-mono block">Tender Details:</span>
                <p>{currentRfq.description}</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToQuote}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  📢 Open Vendor Quoting Window
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'RFQ' && !isHost && currentRfq && me && (
          <RfqBoard
            rfq={currentRfq}
            player={me}
            onOpenIntelMarket={() => setPhase('INTEL')}
            onProceedToQuote={handleProceedToQuote}
          />
        )}

        {phase === 'INTEL' && !isHost && currentRfq && me && (
          <IntelMarket
            player={me}
            allPlayers={players}
            rfq={currentRfq}
            onSpendIntelPoint={(type) => {
              setPlayers(prev => ({
                ...prev,
                [myPlayerId]: {
                  ...prev[myPlayerId],
                  intelPoints: Math.max(0, prev[myPlayerId].intelPoints - 1)
                }
              }));
            }}
            onBack={() => setPhase('RFQ')}
          />
        )}

        {phase === 'QUOTING' && isHost && currentRfq && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    🏛️ Procurement Authority Live Monitor • Round {roomConfig?.currentRound}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-100 mt-1">Awaiting Vendor Commercial Quotes</h2>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono text-slate-400">Quoting Window:</span>
                  <span className="text-xl font-mono font-bold text-amber-400">{quotingTimerSeconds}s</span>
                </div>
              </div>

              {/* Competing Vendors Status Grid */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                  Competing Supplier Status ({Object.values(players).filter(p => !p.isHost).length} Vendors)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(players).filter(p => !p.isHost).map(v => (
                    <div key={v.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${v.isAi ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-indigo-600 text-white'}`}>
                          {v.isAi ? '🤖' : v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-100">{v.name}</p>
                          <p className="text-[0.625rem] text-slate-500 font-mono">Rep: {v.reputation} • Q: {'⭐'.repeat(v.profile.qualityLevel)}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[0.625rem] font-mono font-bold ${v.submittedQuote ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-amber-400 border border-slate-800 animate-pulse'}`}>
                        {v.submittedQuote ? '✅ Submitted' : '⏳ Drafting...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuotingTimeout}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  ⚡ Close Quoting & Launch Live Auction Arena
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'QUOTING' && !isHost && currentRfq && me && (
          <QuoteBuilder
            rfq={currentRfq}
            player={me}
            onSubmitQuote={handleSubmitQuote}
            timeRemainingSeconds={quotingTimerSeconds}
          />
        )}

        {phase === 'AUCTION' && currentRfq && (
          <AuctionArena
            rfq={currentRfq}
            player={me || Object.values(players)[0]}
            allPlayers={players}
            auctionState={activeAuction}
            onPlaceEnglishBid={handlePlaceEnglishBid}
            onBuzzDutchAccept={handleBuzzDutch}
            onExitJapaneseAuction={handleExitJapanese}
            onSkipToEnd={() => handleAuctionResolved(activeAuction.currentLeaderId || Object.keys(players)[0], activeAuction.currentPrice)}
          />
        )}

        {phase === 'EVALUATION' && evaluationResult && currentRfq && (
          <EvaluationModal
            evaluation={evaluationResult}
            players={players}
            rfq={currentRfq}
            myPlayerId={myPlayerId}
            onProceedToEvent={handleProceedToEvent}
          />
        )}

        {phase === 'EVENT' && activeEvent && (
          <EventModal
            event={activeEvent}
            winnerPlayer={evaluationResult?.winnerId ? players[evaluationResult.winnerId] : null}
            onProceedToPnL={handleProceedToPnL}
          />
        )}

        {phase === 'PNL' && currentRfq && pnlDisplayPlayer && pnlDisplayPlayer.lastPnL && (
          <PnLBreakdown
            pnl={pnlDisplayPlayer.lastPnL}
            player={pnlDisplayPlayer}
            allPlayers={players}
            rfq={currentRfq}
            onProceedToLeaderboard={handleProceedToLeaderboard}
          />
        )}

        {(phase === 'LEADERBOARD' || phase === 'GAMEOVER') && roomConfig && (
          <Leaderboard
            players={players}
            roomConfig={roomConfig}
            myPlayerId={myPlayerId}
            isGameOver={phase === 'GAMEOVER'}
            onNextRound={handleNextRound}
            onPlayAgain={() => {
              setPhase('LOBBY');
              setRoomConfig(null);
            }}
          />
        )}
      </main>

      {/* Supabase Settings Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          const cfg = getSavedSupabaseConfig();
          setIsSupabaseLive(!!(cfg.url && cfg.anonKey && cfg.url !== 'https://your-project-id.supabase.co'));
        }}
      />

      {/* Persistent Career Stats Modal */}
      <CompanyDashboard
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        player={me}
      />

      {/* Interactive Game Manual Modal */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

    </div>
    </ErrorBoundary>
  );
};

export default App;
