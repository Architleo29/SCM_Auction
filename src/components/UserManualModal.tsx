import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Gavel, 
  TrendingDown, 
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
  FileSpreadsheet
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'auctions' | 'strategy' | 'scoring'>('quickstart');

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
            <span>🔨</span> 2. Reverse Auction Formats
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'strategy'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💡</span> 3. Quality vs Price Economics
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏆</span> 4. Executive Leaderboard
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
                    <h4 className="font-bold text-slate-100 text-sm">Live Reverse Auction Floor</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Battle human and AI rivals across <strong>Reverse English</strong> (price undercutting), <strong>Reverse Dutch</strong> (first to buzz), or <strong>Reverse Japanese</strong> (hold-to-stay clock).
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
                    <strong className="text-amber-300 block">3. Drives Auction Formats</strong>
                    <span className="text-slate-400">
                      Used by Reverse Dutch (starts low and climbs to ceiling) and Japanese (drops from ceiling) clocks.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUCTION FORMATS */}
          {activeTab === 'auctions' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Reverse English */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-orange-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <Gavel className="w-4 h-4" />
                    <span>🔨 1. Reverse English Auction (Live Counter-Bid War)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-orange-950 text-orange-300 border border-orange-800 px-2 py-0.5 rounded font-bold">
                    Descending Bids
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Suppliers submit decreasing counter-bids in real time. The lowest qualifying bid takes the lead!
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-orange-300 font-bold">⚡ How to Play:</p>
                  <p>• Click <strong>-₹10K</strong>, <strong>-₹25K</strong>, or enter a custom lower bid to capture the lead.</p>
                  <p>• <strong>Anti-Sniping:</strong> Any bid placed in the final 15s adds +15s to the timer.</p>
                  <p>• <strong>Margin Guard:</strong> Watch your real-time margin indicator so you don't bid below your cost floor!</p>
                </div>
              </div>

              {/* Reverse Dutch */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-teal-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>⏳ 2. Reverse Dutch Auction (Ascending Price Clock)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-bold">
                    First to Buzz
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  The contract price starts low (unprofitably cheap) and ticks <strong>UPWARDS</strong> by +3.5% every 2 seconds.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-teal-300 font-bold">⚡ How to Play:</p>
                  <p>• The <strong>first supplier</strong> to click <strong className="text-teal-300">"Buzz In & Accept"</strong> instantly wins the tender at the current ticking price!</p>
                  <p>• <strong>Strategic Tension:</strong> Buzz too early $ightarrow$ slim profit. Wait too long $ightarrow$ an aggressive rival buzzes first!</p>
                </div>
              </div>

              {/* Japanese Clock */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-violet-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>🇯🇵 3. Reverse Japanese Clock Auction (Hold-to-Stay)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded font-bold">
                    2nd-Price Payout
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  The price clock automatically steps <strong>DOWNWARDS</strong> in rounds.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-violet-300 font-bold">⚡ How to Play:</p>
                  <p>• Hold the button to stay active as the price drops.</p>
                  <p>• Release to permanently exit once the price drops below your breakeven threshold.</p>
                  <p>• <strong>2nd-Price Incentive:</strong> The last standing vendor wins at the <strong>2nd-place exit price</strong> (higher payout)!</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: QUALITY VS PRICE STRATEGY */}
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

            </div>
          )}

          {/* TAB 4: SCORING & LEADERBOARD */}
          {activeTab === 'scoring' && (
            <div className="space-y-4 animate-fade-in">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Executive Leaderboard Championship Formula</span>
                </div>
                <p className="text-xs text-slate-300">
                  Your tournament ranking on the Executive Leaderboard across all fiscal rounds is computed as:
                </p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center font-mono text-indigo-300 font-bold text-xs sm:text-sm">
                  Total Score = (Cumulative Banked Profit ₹ × 1.0) + (Contracts Won × 1,000)
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Sniper Execution</h5>
                    <p className="text-[0.625rem] text-slate-400">Won a Reverse Dutch auction within 2 seconds of margin target</p>
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
