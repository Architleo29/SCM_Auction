import React from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Star, 
  Truck, 
  Clock, 
  FileSpreadsheet, 
  Lightbulb, 
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { CompanyProfile } from '../types/game';
import { formatINR } from '../utils/formatters';
import { CompanySetupModal } from './CompanySetupModal';
import { Sliders } from 'lucide-react';

interface CompanyDossierProps {
  profile: CompanyProfile;
  playerName: string;
  roundNumber: number;
  totalRounds: number;
  onProceed: () => void;
  onUpdateProfile?: (stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }) => void;
}

export const CompanyDossier: React.FC<CompanyDossierProps> = ({
  profile,
  playerName,
  roundNumber,
  totalRounds,
  onProceed,
  onUpdateProfile
}) => {
  const [isSetupModalOpen, setIsSetupModalOpen] = React.useState(false);
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  Round {roundNumber} of {totalRounds} • Your Company Profile
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{playerName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <p className="text-[0.625rem] text-slate-500 uppercase font-mono">Baseline Quality</p>
              <div className="flex text-amber-400 text-base">
                {'★'.repeat(profile.qualityLevel)}
                <span className="text-slate-700">{'★'.repeat(5 - profile.qualityLevel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Round 1 Onboarding Briefing Banner */}
      {roundNumber === 1 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/40 shadow-lg space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
            <span>💡 Round 1 Procurement Pro-Tip: How Your Company Economics Work</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to the Tender Arena! Below are your firm's <strong>Confidential Economic Multipliers</strong>. 
            Your <strong>Labor Index</strong> and <strong>Material Multipliers</strong> determine your baseline cost for building products. 
            Higher <strong>Quality & Reputation</strong> gives you higher technical evaluation points (QCBS), meaning you can often win contracts even if a competitor bids a slightly lower price!
          </p>
        </div>
      )}

      {/* 14 Economics Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Fixed & Capacity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase font-mono">
            <DollarSign className="w-4 h-4" />
            Factory Rent & Production Capacity
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Fixed Overhead (Rent & Leases):</span>
              <span className="font-mono font-bold text-slate-200">{formatINR(profile.fixedCosts)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Contract Load Capacity:</span>
              <span className="font-mono font-bold text-slate-200">{profile.capacity} Project(s)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Overhead Allocation Rate:</span>
              <span className="font-mono font-bold text-slate-200">{(profile.overheadRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Production Cost Multipliers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase font-mono">
            <BarChart3 className="w-4 h-4" />
            Direct Cost Multipliers
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Worker Wage Rate Index:</span>
              <span className={`font-mono font-bold ${profile.laborCostIndex <= 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {profile.laborCostIndex.toFixed(2)}x {profile.laborCostIndex < 1.0 ? '(Favorable)' : ''}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Raw Materials Cost Index:</span>
              <span className={`font-mono font-bold ${profile.materialsCostIndex <= 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {profile.materialsCostIndex.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Freight & Shipping Cost Index:</span>
              <span className={`font-mono font-bold ${profile.logisticsCostIndex <= 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {profile.logisticsCostIndex.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Delivery Targets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase font-mono">
            <TrendingUp className="w-4 h-4" />
            Financial & Risk Parameters
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Target Profit Margin:</span>
              <span className="font-mono font-bold text-emerald-400">{(profile.targetProfitMargin * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Financing Cost (APR):</span>
              <span className="font-mono font-bold text-slate-200">{(profile.financingCostRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Risk Contingency Need:</span>
              <span className="font-mono font-bold text-amber-400">{(profile.riskContingencyNeed * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Strategic Advisory Box */}
      <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-2xl p-5 shadow-lg flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-indigo-200">💡 Pro-Tip for This Round</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {profile.qualityLevel >= 4 
              ? 'Your company possesses superior technical quality (4+ stars). You can win contracts even with slightly higher prices when the Buyer’s Quality weight is high (≥ 20%). Avoid racing aggressive bots to the bottom on price alone.'
              : profile.laborCostIndex < 1.0 
              ? 'Your labor efficiency index is superior to industry benchmarks. You have an economic edge in labor-heavy contracts (Consulting & IT). Exploit your lower Fully Loaded Cost (FLC).'
              : 'Your cost structure is balanced. Maintain disciplined risk buffers (≥ 8%) to withstand dynamic supply-chain and inflation shocks post-award.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onProceed}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>View Tender Specifications & Order Details</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
