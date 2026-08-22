import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Gavel, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  ShieldCheck, 
  DollarSign, 
  Percent, 
  Award, 
  Zap, 
  Bot, 
  AlertTriangle,
  Sparkles,
  Layers,
  Sliders,
  Briefcase
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'auctions' | 'economics' | 'strategy' | 'bots' | 'achievements'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in modal-backdrop">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden elevation-2">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-400 shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Procurement Strategy Game Manual
                <span className="px-2.5 py-0.5 rounded-full text-[0.625rem] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 font-bold">
                  v3.5
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Master commercial quotation, 10-point company strategy, and live reverse auctions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🎯 1. Game Flow
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'strategy'
                ? 'border-cyan-600 text-cyan-700 dark:border-cyan-500 dark:text-cyan-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            ⚙️ 2. Company Setup (10 Pts)
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'auctions'
                ? 'border-amber-600 text-amber-700 dark:border-amber-500 dark:text-amber-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🔨 3. Auction Formats
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'economics'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📊 4. Cost & Margin Math
          </button>

          <button
            onClick={() => setActiveTab('bots')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'bots'
                ? 'border-purple-600 text-purple-700 dark:border-purple-500 dark:text-purple-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🤖 5. AI Bot Strategies
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-3 text-xs font-semibold font-mono transition border-b-2 shrink-0 ${
              activeTab === 'achievements'
                ? 'border-rose-600 text-rose-700 dark:border-rose-500 dark:text-rose-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🏆 6. Badges & Scoring
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Your Objective</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    You are the Chief Commercial Officer of an industrial vendor. Over 3 to 12 rounds, configure your strategic company advantages (10 Points budget), build competitive commercial quotes in INR (₹), out-maneuver rival vendors in live reverse auctions, and maximize your <strong>Banked Realized Profit & Reputation</strong>!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Company & RFQ Setup</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Configure your 10-point strategy (Quality, Speed, Cost Efficiency). Review tender budget ceiling, cost waterfall, and auto-balanced evaluation weights (100%).
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold font-mono text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Streamlined Quoting</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Review your live Fully Loaded Cost (FLC), set your target bid price directly with the price slider, or fine-tune optional advanced options (SLA, Warranty, Risk).
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Live Auction Arena</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Place tactical counter-bids in English auctions, buzz first on ascending Dutch tickers, or hold your nerve in Japanese clock rounds.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-600/20 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold font-mono text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Direct P&L Settlement</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Instant contract settlement at the final auction price. Reconcile operating profit, pay tax, bank your net profits, and grow your market reputation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-700 dark:text-cyan-400 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Strict 10-Point Company Strategy Allocation
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Every vendor allocates a strict budget of <strong>10 Strategy Points</strong> across three fundamental pillars. You can adjust this inside the room lobby or in your confidential dossier:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">
                      ⭐ Production Quality (1–5)
                    </span>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">
                      Boosts Quality Score in QCBS scoring. Higher quality adds a realistic production premium (+16% at 5-stars).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1">
                      ⚡ Delivery Speed (1–5)
                    </span>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">
                      Boosts Timeline Score in QCBS scoring and unlocks faster turnaround guarantees.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                      📉 Cost Efficiency (1–5)
                    </span>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">
                      Drastically slashes your Fully Loaded Cost (FLC) by up to -20%, unlocking high profit margins on low bids.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-slate-500 font-bold uppercase block text-[0.625rem]">Strategic Asymmetry Example</span>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>Quality Leader:</strong> 5 Quality, 3 Speed, 2 Cost Efficiency ➔ Wins QCBS quality tenders easily, but has higher base costs.
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>Low-Cost Disruptor:</strong> 2 Quality, 3 Speed, 5 Cost Efficiency ➔ Slashes FLC by 20%, dominating price-sensitive Dutch auctions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AUCTIONS */}
          {activeTab === 'auctions' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold text-sm">
                  <Gavel className="w-4 h-4" />
                  🔨 1. Reverse English Auction (Open Descending)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Vendors place decreasing counter-bids in real-time. The lowest bid leads.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-700 dark:text-slate-400 font-mono space-y-1 border border-slate-200 dark:border-slate-800">
                  <p>• <strong>Anti-Sniping Rule:</strong> Any bid placed under 15 seconds extends the clock by +10s.</p>
                  <p>• <strong>Strategy:</strong> Don't bid below your cost floor (FLC); let rivals overbid or walk away!</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-sm">
                  <Zap className="w-4 h-4" />
                  ⏳ 2. Reverse Dutch Auction (Ascending Procurement Clock)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  The price clock starts low (65% of budget) and ascends upwards by +3.5% every 2 seconds.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-700 dark:text-slate-400 font-mono space-y-1 border border-slate-200 dark:border-slate-800">
                  <p>• <strong>First to Buzz:</strong> The FIRST vendor to click "Buzz In & Accept" wins the deal immediately at that price!</p>
                  <p>• <strong>Trade-off:</strong> Buzz too early = low profit. Wait too long = rival steals the contract at a higher price!</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-semibold text-sm">
                  <TrendingDown className="w-4 h-4" />
                  🇯🇵 3. Japanese Clock Auction (Hold-to-Stay)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  The price descends in discrete rounds from 125% of budget ceiling. All participants hold a button to stay active.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-700 dark:text-slate-400 font-mono space-y-1 border border-slate-200 dark:border-slate-800">
                  <p>• <strong>Irreversible Exit:</strong> Releasing the button exits the auction permanently.</p>
                  <p>• <strong>2nd-Price Payout:</strong> The last remaining vendor wins and is paid the <strong>2nd-place exit price</strong>!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ECONOMICS */}
          {activeTab === 'economics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Fully Loaded Cost (FLC) & Multipliers
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Your true baseline cost to deliver the project in INR (₹) is calculated as:
                </p>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-300 space-y-1.5 border border-slate-200 dark:border-slate-800">
                  <p><strong>Direct Labor</strong> = Base Hours × Labor Rate × Labor Index × Cost Eff Multiplier × Quality Multiplier</p>
                  <p><strong>Direct Materials</strong> = Base Qty × Unit Cost × Materials Index × Cost Eff Multiplier × Quality Multiplier</p>
                  <p><strong>Direct Logistics</strong> = Base Units × Unit Cost × Logistics Index × Cost Eff Multiplier × Speed Multiplier</p>
                  <p><strong>FLC</strong> = Direct Subtotal + Overhead + Financing Cost + Risk Contingency + Fixed Absorption</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-50 dark:bg-slate-950 p-4 rounded-2xl border border-rose-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    The Winner's Curse (§12)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400">
                    If you bid below 70% of your FLC or undercut too aggressively, you trigger the loss-leader flag and risk locking in negative operating margins!
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-700 dark:text-cyan-400 text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Disciplined Walkaway
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400">
                    Walking away from an underpriced deal absorbs standard overhead but preserves your capital and prevents disastrous fiscal quarters!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BOTS */}
          {activeTab === 'bots' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="bg-rose-50 dark:bg-slate-950 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                  <Bot className="w-4 h-4" />
                  🔴 Vulcan Heavy Ind. (Aggressive AI)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  • <strong>Strategy:</strong> Undercuts relentlessly down to 2% profit margin. High cost efficiency focus.
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">
                  ⚠️ Trait: Vulnerable to low-margin traps if bidding too aggressively.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-slate-950 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                  <Bot className="w-4 h-4" />
                  🔵 Apex SafeBuild (Conservative AI)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  • <strong>Strategy:</strong> Defends 15%+ profit margins, carries high quality (4-5 stars).
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  🛡️ Strength: Consistently high QCBS quality scores.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-slate-950 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <Bot className="w-4 h-4" />
                  🟡 Matrix Dynamic Bids (Opportunist AI)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  • <strong>Strategy:</strong> Estimates rival cost structures and undercuts by optimal tactical decrements (₹10,000–₹25,000).
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  🎯 Strength: High contract win-rate with optimized margins.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-slate-950 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold text-xs">
                  <Bot className="w-4 h-4" />
                  🟣 Echo Mirror Systems (Copycat AI)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  • <strong>Strategy:</strong> Mirrors the highest-scoring vendor from previous rounds.
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                  🔄 Trait: Adapts and copies whatever strategy is winning the leaderboard.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Sniper Award</h5>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">Won a Dutch auction within 2 seconds of margin target</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Iron Fortress</h5>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">Protected a 20%+ margin across consecutive rounds</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">High Roller</h5>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">Banked over ₹10,00,000 in net realized profits</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Disciplined Master</h5>
                    <p className="text-[0.625rem] text-slate-600 dark:text-slate-400">Walked away from a loss-making race to the bottom</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Formula for Game Score (§12):</p>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  Total Score = (Banked Profit × 1.0) + (Contracts Won × 10,000) + (Reputation × 250) + RAP
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">SCM Procurement Simulator • Reference §1-13</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            Got It, Let's Play! 🚀
          </button>
        </div>

      </div>
    </div>
  );
};
