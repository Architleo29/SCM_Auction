import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  Award, 
  Zap, 
  AlertCircle, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ForwardItem, 
  ForwardBuyerState, 
  ForwardAuctionState, 
  ForwardValuationMode,
  getReserveRequirement,
  getBuyerBidCeiling,
  getShadingFactor
} from '../engine/forwardAuction';
import { formatINR } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';

interface ForwardAuctionArenaProps {
  item: ForwardItem;
  buyer: ForwardBuyerState;
  allBuyers: Record<string, ForwardBuyerState>;
  auctionState: ForwardAuctionState;
  totalLots: number;
  currentLotNumber: number;
  onPlaceBid: (amount: number) => void;
  onSkipLot?: () => void;
}

export const ForwardAuctionArena: React.FC<ForwardAuctionArenaProps> = ({
  item,
  buyer,
  allBuyers,
  auctionState,
  totalLots,
  currentLotNumber,
  onPlaceBid,
  onSkipLot
}) => {
  const valuationMode = auctionState.valuationMode;
  const valuationData = (buyer && buyer.valuations) ? (buyer.valuations[item.id] || {}) : {};
  const myValuation = valuationMode === 'private' ? valuationData.privateValue || item.baseMarketValue : valuationData.estimate || item.baseMarketValue;
  
  const activeBiddersCount = Object.keys(allBuyers || {}).length || 2;
  const shadingFactor = getShadingFactor(activeBiddersCount);
  const myCeiling = buyer ? getBuyerBidCeiling(buyer, item, valuationMode, activeBiddersCount) : item.baseMarketValue;
  
  const roundsRemaining = totalLots - currentLotNumber;
  const startingPurse = buyer?.startingPurse || 1000000;
  const remainingPurse = buyer?.remainingPurse ?? 1000000;
  const itemsWon = buyer?.itemsWon || [];
  const reserveReq = getReserveRequirement(startingPurse, roundsRemaining);
  const spendablePurse = Math.max(0, remainingPurse - reserveReq);

  const step1 = item.bidIncrement;
  const step2 = item.bidIncrement * 2;
  const step3 = item.bidIncrement * 5;

  const minNextBid = auctionState.currentHighestBid > 0 
    ? auctionState.currentHighestBid + step1 
    : item.startingPrice;

  const [customBid, setCustomBid] = useState<string>(minNextBid.toString());

  useEffect(() => {
    setCustomBid(minNextBid.toString());
  }, [auctionState.currentHighestBid, minNextBid]);

  const isLeading = auctionState.currentLeaderId === buyer?.id;
  const canAffordMin = minNextBid <= spendablePurse;

  const handleCustomSubmit = () => {
    const num = Number(customBid.replace(/[^0-9]/g, ''));
    if (num < minNextBid) {
      alert(`Minimum valid bid is ${formatINR(minNextBid)}`);
      return;
    }
    if (num > spendablePurse) {
      alert(`You only have ${formatINR(spendablePurse)} available to bid (keeping ${formatINR(reserveReq)} reserve).`);
      return;
    }
    sounds.bid();
    onPlaceBid(num);
  };

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Lot {currentLotNumber} of {totalLots} • Forward English Auction
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                {valuationMode === 'private' ? '🎯 Private Value Mode' : '🎲 Common Value Mode'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">{item.name}</h2>
          </div>
        </div>

        {/* Live Timer Banner */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-slate-200 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className={auctionState.timeRemaining < 10 ? 'text-rose-400' : 'text-amber-300'}>
              00:{auctionState.timeRemaining < 10 ? `0${auctionState.timeRemaining}` : auctionState.timeRemaining}s
            </span>
          </div>

          {onSkipLot && (
            <button
              onClick={onSkipLot}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition"
            >
              Skip Lot ⏭️
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Asset Card & Buyer Purse Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column: Asset Details & Valuation Card */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Asset Spotlight Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-indigo-300 font-semibold">
                  Category: {item.category}
                </span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">Public Base Value</span>
                <strong className="text-base font-bold font-mono text-slate-200 mt-0.5 block">
                  {formatINR(item.baseMarketValue)}
                </strong>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30">
                <span className="text-[11px] font-mono text-indigo-300 block">
                  {valuationMode === 'private' ? '🎯 Your Private Valuation' : '🎲 Your Value Estimate'}
                </span>
                <strong className="text-base font-bold font-mono text-indigo-400 mt-0.5 block">
                  {formatINR(myValuation)}
                </strong>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30">
                <span className="text-[11px] font-mono text-emerald-400 block">
                  {valuationMode === 'private' ? 'Recommended Ceiling' : 'Shaded Ceiling (Anti-Curse)'}
                </span>
                <strong className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  {formatINR(myCeiling)}
                </strong>
              </div>
            </div>

            {/* Common Value Winner's Curse Warning */}
            {valuationMode === 'common' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Winner's Curse Alert:</strong> In Common Value mode, all buyers have noisy estimates. Bidding up to your raw estimate risks overpaying. Your ceiling has been discounted by <strong>{Math.round((1 - shadingFactor) * 100)}%</strong> for safety.
                </span>
              </div>
            )}

            {/* Current Price Floor Banner */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Current Highest Bid (Winning Lot Price)
              </span>
              <div className="text-4xl sm:text-5xl font-bold font-mono text-emerald-400 tracking-tight">
                {auctionState.currentHighestBid > 0 ? formatINR(auctionState.currentHighestBid) : formatINR(item.startingPrice) + ' (Opening)'}
              </div>
              {auctionState.currentLeaderName && (
                <div className="text-xs font-mono text-slate-300 pt-1">
                  Current Leader: <strong className="text-indigo-400">{auctionState.currentLeaderName}</strong>
                  {isLeading && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                      👑 YOU ARE WINNING
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Bidding Panel */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>⚡ Place an Ascending Counter-Bid (+8s anti-sniping)</span>
                <span className="text-slate-400 font-mono">Min Step: +{formatINR(step1)}</span>
              </div>

              {/* Step Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    sounds.bid();
                    onPlaceBid(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step1 : item.startingPrice);
                  }}
                  disabled={!canAffordMin || (auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step1 : item.startingPrice) > spendablePurse}
                  className="py-3 px-2 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs font-bold transition hover:bg-slate-800 disabled:opacity-40 cursor-pointer active:scale-95 text-center"
                >
                  <span className="text-indigo-400">+{formatINR(step1)}</span>
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                    ({formatINR(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step1 : item.startingPrice)})
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.bid();
                    onPlaceBid(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step2 : item.startingPrice + step2);
                  }}
                  disabled={(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step2 : item.startingPrice + step2) > spendablePurse}
                  className="py-3 px-2 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs font-bold transition hover:bg-slate-800 disabled:opacity-40 cursor-pointer active:scale-95 text-center"
                >
                  <span className="text-indigo-400">+{formatINR(step2)}</span>
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                    ({formatINR(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step2 : item.startingPrice + step2)})
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.bid();
                    onPlaceBid(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step3 : item.startingPrice + step3);
                  }}
                  disabled={(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step3 : item.startingPrice + step3) > spendablePurse}
                  className="py-3 px-2 rounded-2xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-100 font-mono text-xs font-bold transition hover:bg-slate-800 disabled:opacity-40 cursor-pointer active:scale-95 text-center"
                >
                  <span className="text-indigo-400">+{formatINR(step3)}</span>
                  <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                    ({formatINR(auctionState.currentHighestBid > 0 ? auctionState.currentHighestBid + step3 : item.startingPrice + step3)})
                  </span>
                </button>
              </div>

              {/* Custom Bid Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    placeholder="Enter custom ascending bid"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customBid || Number(customBid.replace(/[^0-9]/g, '')) < minNextBid || Number(customBid.replace(/[^0-9]/g, '')) > spendablePurse}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 cursor-pointer active:scale-95"
                >
                  Raise Bid
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Buyer Purse & Live Bid Feed */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Buyer Purse Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Your Buyer Purse Balance</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Starting Purse:</span>
                <span className="font-mono font-bold text-slate-300">{formatINR(startingPurse)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Remaining Purse:</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(remainingPurse)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Reserve Lock (10%):</span>
                <span className="font-mono text-amber-400 font-semibold">{formatINR(reserveReq)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-bold">Max Spendable Now:</span>
                <span className="font-mono font-bold text-indigo-300">{formatINR(spendablePurse)}</span>
              </div>
            </div>

            {/* Items Won So Far */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Assets Won in Portfolio ({itemsWon.length})
              </span>
              {itemsWon.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No lots won yet. Bid strategically!</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {itemsWon.map((won, idx) => (
                    <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] flex justify-between items-center">
                      <span className="truncate max-w-[140px] text-slate-300">{won.item.name}</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatINR(won.pricePaid)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Feed of Bids */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Bidding Feed</span>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">{auctionState.bids.length} bids</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {auctionState.bids.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2 text-center">No bids placed yet. Be the first!</p>
              ) : (
                auctionState.bids.slice(0, 10).map((b, idx) => (
                  <div key={idx} className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <span className={b.isAi ? 'text-slate-400' : 'text-indigo-300 font-semibold'}>{b.playerName}</span>
                    <span className="text-emerald-400 font-bold">{formatINR(b.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
