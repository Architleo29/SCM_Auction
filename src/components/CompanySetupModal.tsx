import React, { useState, useEffect } from 'react';
import { Briefcase, X, Check, ShieldCheck, Zap, TrendingDown, Star, Sparkles } from 'lucide-react';
import { CompanyProfile } from '../types/game';

interface CompanySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (stats: { qualityLevel: number; speedLevel: number; costEfficiency: number }) => void;
}

export const CompanySetupModal: React.FC<CompanySetupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [qualityLevel, setQualityLevel] = useState(profile.qualityLevel || 3);
  const [speedLevel, setSpeedLevel] = useState(profile.speedLevel || 3);
  const [costEfficiency, setCostEfficiency] = useState(profile.costEfficiency || 4);

  useEffect(() => {
    if (isOpen) {
      setQualityLevel(profile.qualityLevel || 3);
      setSpeedLevel(profile.speedLevel || 3);
      setCostEfficiency(profile.costEfficiency || 4);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const totalPointsUsed = qualityLevel + speedLevel + costEfficiency;
  const pointsRemaining = 10 - totalPointsUsed;
  const isValid = pointsRemaining === 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ qualityLevel, speedLevel, costEfficiency });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
              <Briefcase className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Company Strategic Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Allocate exactly 10 strategy points to configure your firm's core advantages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close setup"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Points Counter Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between font-mono transition ${
          isValid
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : pointsRemaining < 0
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            : 'bg-indigo-950/40 border-indigo-800/80 text-indigo-300'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <div>
              <span className="text-xs uppercase tracking-wider block font-bold">Points Allocation</span>
              <span className="text-[0.625rem] opacity-80">Strict 10 Points Budget</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono">{pointsRemaining}</span>
            <span className="text-xs opacity-75 ml-1">remaining</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-4 relative z-10">
          {/* Quality Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Production Quality
              </span>
              <span className="text-amber-400 font-bold">{qualityLevel} / 5 Stars</span>
            </div>
            <p className="text-[0.625rem] text-slate-400 leading-tight">
              Higher quality wins QCBS RFQs easily, but increases baseline production costs by up to +16%.
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={qualityLevel}
              onChange={(e) => setQualityLevel(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
          </div>

          {/* Speed Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                Delivery Turnaround Speed
              </span>
              <span className="text-indigo-400 font-bold">{speedLevel} / 5</span>
            </div>
            <p className="text-[0.625rem] text-slate-400 leading-tight">
              Faster speeds boost timeline evaluation score and enable rapid contract fulfillment.
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={speedLevel}
              onChange={(e) => setSpeedLevel(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
          </div>

          {/* Cost Efficiency Slider */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Cost Efficiency
              </span>
              <span className="text-emerald-400 font-bold">{costEfficiency} / 5</span>
            </div>
            <p className="text-[0.625rem] text-slate-400 leading-tight">
              Drastically reduces your Fully Loaded Cost (FLC) by up to -20%, unlocking high profit margins on low bids.
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={costEfficiency}
              onChange={(e) => setCostEfficiency(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold text-sm transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl flex items-center gap-2 transition cursor-pointer ${
              isValid
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Save & Apply Strategy
          </button>
        </div>
      </div>
    </div>
  );
};
