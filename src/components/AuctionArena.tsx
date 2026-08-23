import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Clock, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ArrowDown, 
  ShieldAlert, 
  Zap, 
  Hand,
  FastForward,
  Eye,
  Bot
} from 'lucide-react';
import { RFQ, PlayerState, AuctionState, AuctionFormat } from '../types/game';
import { calculateCostBreakdown } from '../engine/costCalculator';
import { sounds } from '../utils/soundEffects';
import { formatINR } from '../utils/formatters';

interface AuctionArenaProps {
  rfq: RFQ;
  player: PlayerState;
  allPlayers: Record<string, PlayerState>;
  auctionState: AuctionState;
  onPlaceEnglishBid: (newPrice: number) => void;
  onBuzzDutchAccept: () => void;
  onExitJapaneseAuction: () => void;
  onSkipToEnd?: () => void;
}

export const AuctionArena: React.FC<AuctionArenaProps> = ({
  rfq,
  player,
  allPlayers,
  auctionState,
  onPlaceEnglishBid,
  onBuzzDutchAccept,
  onExitJapaneseAuction,
  onSkipToEnd
}) => {
  const profile = player.profile;
  const costBreakdown = calculateCostBreakdown(profile, rfq);
  const flc = costBreakdown.fullyLoadedCost;
  const isSpectator = player.isHost || player.name.includes('Spectator') || player.name.includes('Director');

  const step1 = Math.max(1000, Math.round(rfq.budgetCeiling * 0.01));
  const step2 = Math.max(2500, Math.round(rfq.budgetCeiling * 0.025));
  const step3 = Math.max(5000, Math.round(rfq.budgetCeiling * 0.05));

  // Custom bid input for English mode (Allows freely typing any price)
  const [customBidInput, setCustomBidInput] = useState<string>((auctionState.currentPrice - step1).toString());
  const [isHoldingJapanese, setIsHoldingJapanese] = useState<boolean>(true);

  // Local smooth ticking auction countdown clock (Guarantees ticking on guest devices)
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(auctionState.timeRemaining);

  useEffect(() => {
    setLocalTimeRemaining(auctionState.timeRemaining);
  }, [auctionState.timeRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync custom bid whenever currentPrice decreases
  useEffect(() => {
    setCustomBidInput(Math.max(1000, auctionState.currentPrice - step1).toString());
  }, [auctionState.currentPrice, step1]);

  const currentMarginAtPrice = auctionState.currentPrice > 0 
    ? Number((((auctionState.currentPrice - flc) / auctionState.currentPrice) * 100).toFixed(1))
    : 0;

  const handlePlaceBid = (amount: number) => {
    if (amount <= 0) {
      alert('Please enter a valid positive bid amount.');
      return;
    }
    if (amount >= auctionState.currentPrice) {
      alert(`Your counter-bid must be lower than the current leading price (${formatINR(auctionState.currentPrice)})`);
      return;
    }
    sounds.bid();
    onPlaceEnglishBid(amount);
  };

  const handleBuzz = () => {
    sounds.buzz();
    onBuzzDutchAccept();
  };

  const handleReleaseJapanese = () => {
    if (isHoldingJapanese) {
      setIsHoldingJapanese(false);
      onExitJapaneseAuction();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Buyer Oversight Banner */}
      {isSpectator && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-700/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-200 font-mono uppercase tracking-wider">🏛️ Procurement Directorate Live Tender Floor</p>
              <p className="text-xs text-slate-300">
                Overseeing competing vendor bids in real time. Winning price will be evaluated under QCBS rules upon completion.
              </p>
            </div>
          </div>

          {onSkipToEnd && (
            <button
              onClick={onSkipToEnd}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              Fast-Forward Auction
            </button>
          )}
        </div>
      )}

      {/* Header & Arena Mode Indicator (§1.4: Format Accent Header Tint) */}
      <div className={`bg-slate-900 border rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        rfq.auctionFormat === 'english'
          ? 'border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-slate-900 to-slate-900'
          : rfq.auctionFormat === 'dutch'
          ? 'border-teal-500/30 bg-gradient-to-r from-teal-950/20 via-slate-900 to-slate-900'
          : 'border-violet-500/30 bg-gradient-to-r from-violet-950/20 via-slate-900 to-slate-900'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono uppercase tracking-wider border ${
              rfq.auctionFormat === 'english'
                ? 'bg-orange-950/60 text-orange-300 border-orange-800/60'
                : rfq.auctionFormat === 'dutch'
                ? 'bg-teal-950/60 text-teal-300 border-teal-800/60'
                : 'bg-violet-950/60 text-violet-300 border-violet-800/60'
            }`}>
              <Gavel className="w-3.5 h-3.5 inline mr-1" />
              {rfq.auctionFormat === 'english' && '🔨 Reverse English (Price Drops)'}
              {rfq.auctionFormat === 'dutch' && '⏳ Reverse Dutch (Price Rises)'}
              {rfq.auctionFormat === 'japanese' && '🇯🇵 Reverse Japanese Clock (Price Drops)'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Round {rfq.roundNumber}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{rfq.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {rfq.auctionFormat === 'english' && 'Vendors compete by undercutting bids downward. Lowest qualifying bidder takes the lead!'}
            {rfq.auctionFormat === 'dutch' && 'The Buyer starts with a low offer. The contract price ticks UPWARDS every 2 seconds. The first vendor to click "Buzz & Accept" claims the contract on the spot!'}
            {rfq.auctionFormat === 'japanese' && 'The price clock steps DOWNWARDS every 2 seconds. Vendors stay active until the price drops too low, then release to exit safely.'}
          </p>
        </div>

        {/* Real-time Clock / Soft-close Timer */}
        <div className={`px-4 sm:px-5 py-3 rounded-2xl border flex items-center justify-between sm:justify-start gap-4 shrink-0 font-mono transition-colors duration-200 ${
          localTimeRemaining <= 5
            ? 'bg-rose-950/70 text-rose-300 border-rose-500'
            : localTimeRemaining <= 10
            ? 'bg-amber-950/50 text-amber-300 border-amber-500 animate-pulse'
            : 'bg-slate-950 text-slate-200 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 ${localTimeRemaining <= 5 ? 'text-rose-400' : localTimeRemaining <= 10 ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <p className="text-[0.625rem] text-slate-500 uppercase">
                {rfq.auctionFormat === 'english' ? 'Time Remaining' : 'Auction Clock'}
              </p>
              <p className="text-2xl font-bold">{localTimeRemaining}s</p>
            </div>
          </div>
          <span className="text-[0.625rem] sm:hidden font-bold uppercase text-slate-500">Live</span>
        </div>
      </div>

      {/* Main Auction Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Arena: Format-Specific Action Floor */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Round 1 Live Auction Hint Banner */}
          {rfq.roundNumber === 1 && !isSpectator && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/70 via-slate-900 to-indigo-950/70 border border-orange-500/40 shadow-lg space-y-1.5 animate-fade-in text-xs">
              <div className="flex items-center gap-2 text-orange-300 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>💡 Round 1 Tip: How to Win This Auction</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {rfq.auctionFormat === 'english' && (
                  <>In Reverse English, vendors place lower bids to take 1st place. Watch your <strong>Profit Margin</strong> below! If your margin falls below 5%, <strong>stop bidding</strong> so you do not lose money.</>
                )}
                {rfq.auctionFormat === 'dutch' && (
                  <>In Reverse Dutch, the price rises every 2 seconds. The first person to click <strong>Buzz In</strong> wins immediately! Wait until the profit is good, but don't wait too long or a rival will grab it.</>
                )}
                {rfq.auctionFormat === 'japanese' && (
                  <>In Japanese Clock, the price drops automatically. Keep holding the button to stay in. When the price reaches your cost floor, release the button to leave safely.</>
                )}
              </p>
            </div>
          )}

          {/* Main Price Display Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-center relative overflow-hidden space-y-3">
            <span className="text-xs sm:text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 block">
              {rfq.auctionFormat === 'dutch' ? 'Current Rising Contract Price' : 'Current Lowest Bid (Winning Price)'}
            </span>

            <div className="text-3xl sm:text-5xl font-bold font-mono text-emerald-400 tracking-tight animate-pulse">
              {formatINR(auctionState.currentPrice)}
            </div>

            {auctionState.currentLeaderName && (
              <p className="text-xs font-mono text-slate-300">
                Leading Bidder: <strong className="text-indigo-400">{auctionState.currentLeaderName}</strong>
                {auctionState.currentLeaderId === player.id && !isSpectator && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[0.625rem] font-bold">
                    YOU ARE WINNING
                  </span>
                )}
              </p>
            )}

            {/* Economics only shown for human playing vendor */}
            {!isSpectator && (
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono mt-1">
                <span className="text-slate-400">Your Cost (FLC): <strong className="text-slate-200">{formatINR(flc)}</strong></span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400">
                  Your Margin: <strong className={currentMarginAtPrice >= 10 ? 'text-emerald-400' : 'text-amber-400'}>{currentMarginAtPrice}%</strong>
                </span>
              </div>
            )}

            {/* MOBILE COMPACT LIVE BID TICKER (Visible on Mobile) */}
            <div className="block lg:hidden pt-2 border-t border-slate-800/80 text-left">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Recent Bids
                </span>
                <span>{auctionState.bids.length} placed</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto touch-scroll">
                {auctionState.bids.slice(0, 4).map((b, idx) => (
                  <div 
                    key={idx} 
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      b.playerId === player.id && !isSpectator
                        ? 'bg-indigo-950/60 border-indigo-700 text-indigo-200' 
                        : 'bg-slate-950 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span className="truncate font-semibold">{b.playerName}</span>
                    <span className="font-bold text-emerald-400 shrink-0 ml-2">{formatINR(b.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MODE 1: REVERSE ENGLISH CONTROLS */}
          {rfq.auctionFormat === 'english' && !isSpectator && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-semibold uppercase font-mono text-indigo-400 flex items-center gap-1.5">
                <ArrowDown className="w-4 h-4" />
                Place Lower Competitive Bid
              </h3>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => handlePlaceBid(auctionState.currentPrice - step1)}
                  disabled={auctionState.currentPrice - step1 < flc * 0.7}
                  className="py-2.5 sm:py-3 px-1 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs sm:text-xs font-semibold transition hover:bg-slate-800 active:scale-95 disabled:opacity-40"
                >
                  -{formatINR(step1)}
                  <span className="block text-[9px] sm:text-[0.625rem] text-slate-400 font-normal truncate">
                    ({formatINR(auctionState.currentPrice - step1)})
                  </span>
                </button>

                <button
                  onClick={() => handlePlaceBid(auctionState.currentPrice - step2)}
                  disabled={auctionState.currentPrice - step2 < flc * 0.7}
                  className="py-2.5 sm:py-3 px-1 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs sm:text-xs font-semibold transition hover:bg-slate-800 active:scale-95 disabled:opacity-40"
                >
                  -{formatINR(step2)}
                  <span className="block text-[9px] sm:text-[0.625rem] text-slate-400 font-normal truncate">
                    ({formatINR(auctionState.currentPrice - step2)})
                  </span>
                </button>

                <button
                  onClick={() => handlePlaceBid(auctionState.currentPrice - step3)}
                  disabled={auctionState.currentPrice - step3 < flc * 0.7}
                  className="py-2.5 sm:py-3 px-1 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs sm:text-xs font-semibold transition hover:bg-slate-800 active:scale-95 disabled:opacity-40"
                >
                  -{formatINR(step3)}
                  <span className="block text-[9px] sm:text-[0.625rem] text-slate-400 font-normal truncate">
                    ({formatINR(auctionState.currentPrice - step3)})
                  </span>
                </button>
              </div>

              {/* Custom Bid Input (Stacks on mobile) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customBidInput}
                    onChange={(e) => setCustomBidInput(e.target.value)}
                    placeholder="Enter any counter-bid"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                  />
                </div>
                <button
                  onClick={() => {
                    const parsed = Number(customBidInput.replace(/[^0-9]/g, ''));
                    handlePlaceBid(parsed);
                  }}
                  disabled={!customBidInput || Number(customBidInput.replace(/[^0-9]/g, '')) >= auctionState.currentPrice}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 min-h-[44px] flex items-center justify-center cursor-pointer active:scale-95"
                >
                  Submit Counter-Bid
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: REVERSE DUTCH CONTROLS */}
          {rfq.auctionFormat === 'dutch' && !isSpectator && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl text-center space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">Optimal Stopping Point</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Price is ascending every 2 seconds. First vendor to hit Accept wins immediately!
                </p>
              </div>

              <button
                onClick={handleBuzz}
                className="w-full py-4 sm:py-6 px-4 rounded-3xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-semibold text-sm sm:text-xl tracking-wider uppercase shadow-2xl shadow-emerald-500/20 transition transform active:scale-95 flex items-center justify-center gap-2 sm:gap-3 cursor-pointer min-h-[56px]"
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current animate-bounce-subtle shrink-0" />
                <span>Buzz & Accept: {formatINR(auctionState.currentPrice)}</span>
              </button>
            </div>
          )}

          {/* MODE 3: JAPANESE AUCTION CONTROLS */}
          {rfq.auctionFormat === 'japanese' && !isSpectator && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl text-center space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">Japanese Clock Auction</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Stay active in the descending price clock. Release to exit permanently.
                </p>
              </div>

              {isHoldingJapanese ? (
                <button
                  onClick={handleReleaseJapanese}
                  className="w-full py-4 sm:py-5 px-4 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-base shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer min-h-[3.125rem] active:scale-95"
                >
                  <Hand className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Release & Exit at {formatINR(auctionState.currentPrice)}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/60 text-rose-300 text-xs font-mono">
                  ❌ You have exited the Japanese auction. Watching remaining rivals resolve...
                </div>
              )}
            </div>
          )}

          {/* Spectator View Helper */}
          {isSpectator && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-300 font-medium">
                🤖 AI Competitors are actively analyzing walk-away prices and calculating risk thresholds.
              </p>
              <p className="text-xs text-slate-500 font-mono">
                The auction automatically resolves when the clock runs down or an AI hits their target margin.
              </p>
            </div>
          )}

        </div>

        {/* Right Arena: Live Activity Log (Desktop view) */}
        <div className="hidden lg:flex lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-slate-300 border-b border-slate-800 pb-3 mb-3">
              <Users className="w-4 h-4 text-cyan-400" />
              Live Auction Feed
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 touch-scroll">
              {auctionState.bids.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono text-center py-6">
                  Waiting for initial bids to land...
                </p>
              ) : (
                auctionState.bids.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      b.playerId === player.id && !isSpectator
                        ? 'bg-indigo-950/40 border-indigo-800/80 text-indigo-200' 
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{b.playerName}</span>
                      {b.isAi && <span className="ml-1 text-[0.625rem] text-slate-500">(AI)</span>}
                      <p className="text-[0.625rem] text-slate-500 mt-0.5">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-400">{formatINR(b.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <p className="text-slate-300 font-bold">💡 Anti-Sniping Rule:</p>
            <p>Any bid placed under 15 seconds automatically extends the clock by +8 seconds.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
