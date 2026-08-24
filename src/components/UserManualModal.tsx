import React, { useState } from 'react';
import { 
  BookOpen,
  ShoppingBag, 
  X, 
  Gavel, 
  TrendingDown, 
  TrendingUp,
  Percent, 
  Award, 
  Zap, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  DollarSign,
  FileSpreadsheet,
  Users,
  Trophy,
  Crown,
  Target
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'quickstart' | 'auctions' | 'forward' | 'strategy' | 'scoring';
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'quickstart' 
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'auctions' | 'forward' | 'strategy' | 'scoring'>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Game Manual & Strategy Guide
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[0.625rem] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  v2.0 Clean SCM
                </span>
              </div>
              <p className="text-xs text-slate-400">Master QCBS quoting, reverse auctions, P&L financials, and the ₹15k participation model</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quickstart'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯</span> 1. Game Flow (4 Steps)
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'auctions'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔨</span> 2. Reverse English (Procurement)
          </button>

          <button
            onClick={() => setActiveTab('forward')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'forward'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📦</span> 3. Forward English (Asset Draft)
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'strategy'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💡</span> 4. Quality vs Price Economics
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏆</span> 5. Executive Leaderboard
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: 4-STEP GAME FLOW */}
          {activeTab === 'quickstart' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm mb-0.5">Your Core Objective</h3>
                  <p className="text-xs text-slate-300">
                    You represent a competing Supplier Firm. Across fiscal quarters, evaluate tender terms, configure your Quality USP & Price position, out-maneuver rival vendors in live reverse auctions, and maximize your banked net profit in INR (₹).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Step 1 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      1
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Tender Opportunity & Starting Price</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect the buyer's <strong>Starting Price Limit</strong> and <strong>QCBS Evaluation Weights</strong> (Price % vs. Quality %). Any quote above the starting price ceiling is automatically disqualified.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      2
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Strategic USP & Live P&L Quoting</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose your <strong>Quality Level (1★ to 5★)</strong> and <strong>Bid Price Position (1 to 5)</strong>. Watch your variable costs and net profit margin update live in the real-time GAAP Income Statement!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      3
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Dual Live Auction Formats</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    • <strong>Reverse English (Procurement):</strong> Suppliers submit lower bids to undercut competitors and win buyer contracts.<br />
                    • <strong>Forward English (Asset Draft):</strong> 2–8 Buyers spend their ₹10L purse bidding upward across multi-lot supply chain assets.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      4
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">QCBS Award & P&L Settlement</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The winning bidder delivers the contract and records <strong>Realized Net Profit</strong> (Revenue - Costs - Taxes - ₹15k fee). Outbid vendors incur only the <strong>₹15,000 Participation Fee</strong>.
                  </p>
                </div>

              </div>

              {/* DEDICATED SPOTLIGHT: STARTING PRICE CEILING IN REVERSE AUCTIONS */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/40 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>🏛️ Why is the Starting Price Ceiling Essential in Reverse Auctions?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In a traditional selling auction, prices start at zero and bid <strong>UPWARDS</strong>. In a <strong>Procurement Reverse Auction</strong>, the buyer starts at a maximum budget ceiling and suppliers compete <strong>DOWNWARDS</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block">1. The Opening Anchor</strong>
                    <span className="text-slate-400">
                      Defines the top ceiling from which all live auction clock ticks and vendor counter-bids descend.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-300 block">2. Buyer Reserve Protection</strong>
                    <span className="text-slate-400">
                      Protects the procurement authority from price gouging; quotes above the starting ceiling are disqualified.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-300 block">3. Drives Auction Dynamics</strong>
                    <span className="text-slate-400">
                      In Reverse English, all bids must undercut this ceiling. The auction starts at the ceiling and vendors compete downwards.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVERSE ENGLISH AUCTION MECHANICS */}
          {activeTab === 'auctions' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Main Reverse English Explainer */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-orange-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <Gavel className="w-5 h-5 text-orange-400" />
                    <span>🔨 The Reverse English Auction Floor</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-orange-950 text-orange-300 border border-orange-800 px-2.5 py-0.5 rounded-full font-bold">
                    Official SCM Format
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In a <strong>Reverse English Auction</strong> (also known as a downward-bidding procurement auction), the buyer acts as the auctioneer seeking the lowest qualified cost. Vendors compete in real time by submitting progressively lower counter-bids to claim the lowest price on the floor.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 font-mono">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block">🏆 Winning Position</strong>
                    <span className="text-slate-400">
                      The supplier with the lowest qualifying bid at the end of the countdown clock wins the procurement tender award!
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-400 block">⏱️ Dynamic Clock (45s)</strong>
                    <span className="text-slate-400">
                      Rounds run on an active countdown clock with real-time AI and multiplayer counter-bidding activity.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Core Pillars of Reverse English Bidding */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Pillar 1: Quick Decrements & Custom Bidding */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <TrendingDown className="w-4 h-4" />
                    <span>1. Counter-Bidding Tools</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use quick step buttons (<strong>-₹10K</strong>, <strong>-₹25K</strong>, <strong>-₹50K</strong>) or type any custom amount into the input box to instantly undercut the leader.
                  </p>
                  <p className="text-[11px] text-indigo-300 font-mono">
                    ✓ Live profit preview updates as you type!
                  </p>
                </div>

                {/* Pillar 2: Anti-Sniping Protection */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>2. +8s Anti-Sniping Protection</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Any bid placed when the countdown is under 15 seconds automatically extends the clock by <strong>+8 seconds</strong>.
                  </p>
                  <p className="text-[11px] text-amber-300 font-mono">
                    ✓ Prevents 0-second bot sniping.
                  </p>
                </div>

                {/* Pillar 3: Margin Guard */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Real-Time Margin Guard</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monitor your <strong>Fully Loaded Cost (FLC)</strong> breakeven line. Bids that cause negative profit turn <strong>red</strong> to prevent the Winner's Curse.
                  </p>
                  <p className="text-[11px] text-rose-300 font-mono">
                    ✓ Protects you from unprofitable contracts.
                  </p>
                </div>

              </div>

              {/* Tactical Strategy Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>💡 Pro Strategy: The QCBS Sweet Spot</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You don't always have to be the cheapest vendor to win overall tournament points! If you chose <strong>5★ Flagship Quality</strong> in Step 2, you earn a 100% technical score. In tenders with high Quality Weight (e.g. 50%), you can afford to hold a higher, more profitable price floor while rival 1★ low-ballers squeeze their own margins dry!
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: FORWARD ENGLISH ASSET DRAFT (BUYER PURSE MODE) */}
          {activeTab === 'forward' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Main Banner */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                    <span>📦 Forward English Multi-Buyer Asset Draft</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                    Asset Draft Protocol
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In a <strong>Forward English Asset Draft</strong>, the room <strong>Host acts as the Auctioneer</strong> overseeing 6 high-value supply chain assets (e.g. Cold Storage Warehouses, Automated Port Terminals, Fleet Depots). <strong>2 to 8 joined guest players compete as Buyers</strong>, each equipped with a <strong>₹10,00,000 Starting Purse</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 font-mono">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-purple-300 block">👑 Auctioneer (Host)</strong>
                    <span className="text-slate-400">
                      Monitors all live buyer purses and controls lot progression without bidding.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block">💰 ₹10L Starting Purse</strong>
                    <span className="text-slate-400">
                      Spendable capital allocated across 6 sequential lots. Winning prices are deducted upon award.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-400 block">📈 Ascending Bidding</strong>
                    <span className="text-slate-400">
                      Bidders raise the price upwards with +8s anti-sniping protection until the hammer falls!
                    </span>
                  </div>
                </div>
              </div>

              {/* Valuation Models: Private vs Common Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Mode A: Private Valuation */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>🎯 Mode A: Private Value Synergies</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Each buyer receives a unique, private operational valuation for the lot based on their firm's existing network synergies.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>• <strong>Ceiling Rule:</strong> Bid up to your private valuation.</div>
                    <div>• <strong>Surplus:</strong> (Private Value − Winning Price).</div>
                    <div>• <strong>Risk:</strong> Low — no estimation error.</div>
                  </div>
                </div>

                {/* Mode B: Common Value & Winner's Curse */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>🎲 Mode B: Common Value & Winner's Curse</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The true market value of the asset is identical for all buyers, but every buyer receives an imperfect, noisy estimate.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>• <strong>Winner's Curse:</strong> Aggressive bidders who bid their raw estimate overpay and lose surplus!</div>
                    <div>• <strong>Anti-Curse Shading:</strong> Ceiling is discounted by ~15% to 35% based on bidder count ($N$).</div>
                  </div>
                </div>

              </div>

              {/* Purse Capital & Reserve Rules */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Purse Management & 10% Reserve Constraint</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To prevent reckless buyers from spending their entire ₹10,00,000 on early lots, the simulator enforces a <strong>10% Reserve Lock</strong> for remaining lots:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-center text-emerald-300 font-bold">
                  Max Spendable Bid = Remaining Purse − (10% × Starting Purse × Remaining Rounds Ratio)
                </div>
                <p className="text-[11px] text-slate-400">
                  While holding the top bid on a live lot, your active bid is committed. When the lot closes, the winning bid is deducted and the asset is stored in your permanent portfolio haul!
                </p>
              </div>

              {/* Championship Leaderboard Formula */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Portfolio Championship Scoring</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  At the end of all 6 lots, the championship winner is ranked by <strong>Net Portfolio Surplus</strong>:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-center text-purple-300 font-bold">
                  Net Surplus = Total Value of Acquired Assets Captured − Total Price Paid
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: QUALITY VS PRICE STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Quality Tiers Cost Curve */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4" />
                  <span>Quality Level Multiplier & Cost Impact (Scale 1–5★)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Your chosen Quality Level directly scales your variable production costs (Materials & Labor) and determines your QCBS technical score:
                </p>
                <div className="grid grid-cols-5 gap-2 text-center font-mono text-xs pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block">1★ Economy</span>
                    <span className="text-emerald-400 text-[11px] font-semibold">-20% Cost</span>
                    <span className="text-slate-500 text-[10px] block">High Margin</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block">2★ Value</span>
                    <span className="text-emerald-400 text-[11px] font-semibold">-10% Cost</span>
                    <span className="text-slate-500 text-[10px] block">Good Margin</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block">3★ Standard</span>
                    <span className="text-slate-300 text-[11px] font-semibold">Baseline</span>
                    <span className="text-slate-500 text-[10px] block">Balanced</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block">4★ Premium</span>
                    <span className="text-rose-400 text-[11px] font-semibold">+15% Cost</span>
                    <span className="text-slate-500 text-[10px] block">High Quality</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block">5★ Flagship</span>
                    <span className="text-rose-400 text-[11px] font-semibold">+30% Cost</span>
                    <span className="text-slate-500 text-[10px] block">100% Quality</span>
                  </div>
                </div>
              </div>

              {/* QCBS Scoring & Participation Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                    <Percent className="w-4 h-4" />
                    <span>QCBS Buyer Scoring Formula</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Total Score = (Price Wt × Price Score) + (Quality Wt × Quality Score)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    When the buyer sets high Quality Weight (e.g. 50%), a higher-priced 5★ quote can easily defeat a low-ball 1★ economy bid!
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>₹15,000 Tender Participation Fee</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submitting a tender response incurs a fixed <strong>₹15,000 Bid Preparation Fee</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    If you are outbid, you lose ₹15,000. If you win, the ₹15,000 is deducted from your gross operating profit during GAAP settlement.
                  </p>
                </div>
              </div>

              {/* 5 Pricing Tiers Section */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>5 Strategic Pricing Tiers (Step 2 Quoting)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    FLC-Indexed Pricing
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  During RFQ Quoting, select a quick price tier based on your risk tolerance and competitive target:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="text-emerald-400 font-bold block text-xs">Tier 1: High Margin</span>
                    <span className="text-slate-300 text-[11px]">~25% Margin</span>
                    <span className="text-[10px] text-slate-500 block">1.30x FLC</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="text-emerald-400 font-bold block text-xs">Tier 2: Target</span>
                    <span className="text-slate-300 text-[11px]">~18% Margin</span>
                    <span className="text-[10px] text-slate-500 block">1.20x FLC</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="text-emerald-400 font-bold block text-xs">Tier 3: Balanced</span>
                    <span className="text-slate-300 text-[11px]">~12% Margin</span>
                    <span className="text-[10px] text-slate-500 block">1.12x FLC</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="text-amber-400 font-bold block text-xs">Tier 4: Aggressive</span>
                    <span className="text-slate-300 text-[11px]">~6% Margin</span>
                    <span className="text-[10px] text-slate-500 block">1.06x FLC</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 text-center">
                    <span className="text-rose-400 font-bold block text-xs">Tier 5: Price Blitz</span>
                    <span className="text-slate-300 text-[11px]">~2% Margin</span>
                    <span className="text-[10px] text-slate-500 block">1.02x FLC</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: SCORING & LEADERBOARD */}
          {activeTab === 'scoring' && (
            <div className="space-y-4 animate-fade-in">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Executive Leaderboard Championship Formula</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                    Official Standings
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Your tournament ranking on the Executive Leaderboard across all fiscal rounds is computed as:
                </p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center font-mono text-indigo-300 font-bold text-xs sm:text-sm">
                  Total Score = (Cumulative Banked Profit ₹ × 1.0) + (Contracts Won × 1,000)
                </div>
                <p className="text-[11px] text-slate-400">
                  *Note: The room <strong>Host acts as the Tournament Authority / Auctioneer</strong> and is excluded from the competitor ranking table.*
                </p>
              </div>

              {/* Achievement Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Sniper Execution</h5>
                    <p className="text-[0.625rem] text-slate-400">Won a Reverse English auction within 2 seconds of margin target</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Margin Discipline</h5>
                    <p className="text-[0.625rem] text-slate-400">Maintained 15%+ realized net margin across consecutive rounds</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">High Roller</h5>
                    <p className="text-[0.625rem] text-slate-400">Banked over ₹10,00,000 in cumulative net cash profit</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Procurement Titan</h5>
                    <p className="text-[0.625rem] text-slate-400">Won multiple high-stake reverse tenders in a single tournament</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">SCM Procurement Simulator • v2.0 Clean Guide</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>Got It, Let's Play!</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
