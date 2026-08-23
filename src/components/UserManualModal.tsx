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
  ShieldCheck
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
                  How to Play & Win
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[0.625rem] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  Quick Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">Master quoting, 3 auction formats, and banking profits in INR (₹)</p>
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
            <span>🔨</span> 2. Auction Formats
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'strategy'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💡</span> 3. Winning Strategy
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3.5 px-3 text-xs font-bold font-mono transition border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏆</span> 4. Score & Leaderboard
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
                    You represent a competing Supplier Firm. Over multiple tender rounds, configure your company advantages, price contracts above your cost floor, out-maneuver rival vendors in live auctions, and bank the highest net profits!
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
                    <h4 className="font-bold text-slate-100 text-sm">Company Strategy (10 Points)</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Distribute your 10 points between <strong>Quality</strong> (higher technical score), <strong>Speed</strong> (faster turnaround), and <strong>Cost Efficiency</strong> (lowers your baseline production cost).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      2
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Tender Review & Budget Ceiling</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect the buyer's <strong>Budget Ceiling</strong> and <strong>QCBS scoring weights</strong> (e.g. Price, Quality, Timeline, Risk & Reputation). Any quote above the ceiling is disqualified!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      3
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Strategy & Blind Quoting</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Adjust your <strong>Quality (1-5★)</strong>, <strong>Speed (T1-T5)</strong>, and <strong>Price Level (1-5)</strong>. Review your fixed & variable costs, and watch your live P&L statement update in real time.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-xs">
                      4
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">Live Auction & P&L Settlement</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Battle rivals on the live floor! Once the auction concludes, review contract evaluation scores and bank your realized net profits into your balance sheet.
                  </p>
                </div>

              </div>

              {/* DEDICATED SPOTLIGHT: WHY BUDGET CEILING IS NECESSARY IN REVERSE AUCTIONS */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/40 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>🏛️ Why is a Budget Ceiling Essential in Reverse Auctions?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In a traditional auction (selling), prices start low and bid <strong>UPWARDS</strong> from a reserve floor. But in a <strong>Reverse Auction (procurement)</strong>, prices start high and compete <strong>DOWNWARDS</strong>. Here is why the ceiling is critical:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block">1. The Opening Anchor</strong>
                    <span className="text-slate-400">
                      Without a ceiling, where would a reverse auction begin? The ceiling defines the maximum starting price from which bids and clock ticks decrease.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-300 block">2. Buyer Reserve Protection</strong>
                    <span className="text-slate-400">
                      Protects the buyer from price gouging or supplier collusion. Bids exceeding the approved budget are automatically disqualified as non-viable.
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-300 block">3. Drives Auction Formats</strong>
                    <span className="text-slate-400">
                      In <strong>Dutch</strong> and <strong>Japanese</strong> reverse auctions, the automated price clock requires the ceiling to calculate initial ticking increments.
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
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <Gavel className="w-4 h-4" />
                    <span>🔨 1. Reverse English Auction (Live Price War)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-orange-950 text-orange-300 border border-orange-800 px-2 py-0.5 rounded font-bold">
                    Descending Bids
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Vendors submit decreasing counter-bids in real time. The lowest quoted price holds the lead.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-orange-300 font-bold">⚡ How to Play:</p>
                  <p>• Click <strong>-₹10K</strong>, <strong>-₹25K</strong>, or enter a custom lower bid to take the lead.</p>
                  <p>• <strong>Anti-Sniping:</strong> Any bid placed with less than 15s left adds +10s to the clock.</p>
                  <p>• <strong>Pro-Tip:</strong> Watch your profit margin indicator! If margin drops below 5%, stop and let competitors overbid.</p>
                </div>
              </div>

              {/* Reverse Dutch */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>⏳ 2. Reverse Dutch Auction (Ascending Speed Clock)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-bold">
                    First to Buzz
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  The contract price starts low (below market cost) and ticks <strong>UP</strong> by +3.5% every 2 seconds.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-teal-300 font-bold">⚡ How to Play:</p>
                  <p>• The <strong>first vendor</strong> to click <strong className="text-teal-400">"Buzz In & Accept"</strong> wins the contract on the spot at that price!</p>
                  <p>• <strong>The Dilemma:</strong> Buzz too early = low profit. Wait too long = a rival buzzes before you and takes the deal!</p>
                </div>
              </div>

              {/* Japanese Clock */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>🇯🇵 3. Japanese Clock Auction (Hold to Stay)</span>
                  </div>
                  <span className="text-[0.625rem] font-mono uppercase bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded font-bold">
                    2nd-Price Payout
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  The price clock automatically steps <strong>DOWN</strong> at fixed intervals.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl text-xs space-y-1 font-mono border border-slate-800/80 text-slate-300">
                  <p className="text-violet-300 font-bold">⚡ How to Play:</p>
                  <p>• Press and hold the button to remain in the auction as the price drops.</p>
                  <p>• Release the button to permanently exit once the price falls below your cost floor.</p>
                  <p>• <strong>Bonus Rule:</strong> The last vendor left wins and receives the <strong>2nd-place exit price</strong> (higher payout)!</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STRATEGY & PROFIT */}
          {activeTab === 'strategy' && (
            <div className="space-y-4 animate-fade-in">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>1. Avoid Winner's Curse</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    In procurement auctions, the lowest bidder often bids too low and loses money. Never bid below your <strong>Breakeven Cost (FLC)</strong>!
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>2. QCBS Scoring Power</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Buyers score both Quality and Delivery Speed. High-quality vendors can win contracts even when quoting a slightly higher price.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Percent className="w-4 h-4" />
                    <span>3. Target 15-20% Margins</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Consistent 15-20% margins build a fortress balance sheet. Disciplined pricing always beats reckless low-ball bidding.
                  </p>
                </div>
              </div>

              {/* MBA Procurement Framework Guide */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-indigo-300 text-xs uppercase font-mono tracking-wider">
                  🎓 Core MBA Concepts Applied in This Simulator
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-400 block">📊 1. Cost Accounting</strong>
                    <span className="text-slate-400">Total Cost = Variable Direct Costs (Labor + Materials + Logistics) + Fixed Factory Rent.</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-indigo-400 block">⚖️ 2. Multi-Criteria QCBS</strong>
                    <span className="text-slate-400">Total Bid Score = Price (1-5) + Quality (1-5★) + Speed (T1-T5) + Vendor Trust Score.</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block">🔨 3. Game Theory & Auctions</strong>
                    <span className="text-slate-400">English (price war), Dutch (first to buzz), and Japanese (hold-to-stay) reverse mechanisms.</span>
                  </div>
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
                  <span>Leaderboard Championship Formula</span>
                </div>
                <p className="text-xs text-slate-300">
                  Your final tournament score at the end of all rounds is calculated as:
                </p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center font-mono text-indigo-300 font-bold text-xs sm:text-sm">
                  Total Score = (Banked Profit ₹ × 1.0) + (Contracts Won × 10,000) + (Reputation × 250)
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Sniper Award</h5>
                    <p className="text-[0.625rem] text-slate-400">Won a Dutch auction within 2 seconds of margin target</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Iron Fortress</h5>
                    <p className="text-[0.625rem] text-slate-400">Protected a 20%+ margin across consecutive rounds</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">High Roller</h5>
                    <p className="text-[0.625rem] text-slate-400">Banked over ₹10,00,000 in cumulative net profits</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">Disciplined Master</h5>
                    <p className="text-[0.625rem] text-slate-400">Walked away from an unprofitable price race to the bottom</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">SCM Procurement Simulator • Quick Reference</span>
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
