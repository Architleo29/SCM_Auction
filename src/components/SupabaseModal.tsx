import React, { useState, useEffect } from 'react';
import { Database, X, CheckCircle, AlertCircle, Key, Link as LinkIcon, Sparkles, Smartphone, Globe } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, resetSupabaseClient } from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedSupabaseConfig();
      setUrl(saved.url);
      setAnonKey(saved.anonKey);
      if (saved.url && saved.anonKey && saved.url !== 'https://your-project-id.supabase.co') {
        setStatusMessage({ text: 'Connected & ready for real-time mobile & cross-device multiplayer!', type: 'success' });
      } else {
        setStatusMessage({ text: 'Currently in local browser mode. Connect your Supabase project to play across phones, tablets, and laptops on different Wi-Fi networks.', type: 'info' });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage({ text: 'Please enter both the Supabase Project URL and Anon Public Key.', type: 'error' });
      return;
    }

    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();
    setStatusMessage({ text: 'Saved! Connecting to Supabase Realtime...', type: 'success' });
    onConfigSaved();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    clearSupabaseConfig();
    resetSupabaseClient();
    setUrl('');
    setAnonKey('');
    setStatusMessage({ text: 'Reset to local single-browser broadcast mode.', type: 'info' });
    onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in modal-backdrop">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Mobile & Cross-Device Multiplayer Setup
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Live room synchronization across phones, tablets & laptops
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl mb-4 text-xs font-mono flex items-start gap-2.5 shadow-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-sans">{statusMessage.text}</div>
          </div>
        )}

        {/* Cross-Device Feature Callout */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Play on iOS & Android browsers</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Multi-device real-time bids</span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white font-mono transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white font-mono transition"
            />
          </div>

          {/* Tutorial Helper Well */}
          <div className="bg-slate-100 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-slate-100">💡 Free 1-Minute Supabase Setup:</p>
            <p>1. Open your project on <strong className="text-indigo-600 dark:text-indigo-400 font-mono">supabase.com</strong></p>
            <p>2. Go to <strong>Project Settings (Gear Icon) → API</strong></p>
            <p>3. Copy the <strong>Project URL</strong> and <strong>anon public</strong> key and paste above!</p>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline font-mono text-center sm:text-left cursor-pointer"
            >
              Reset to Local Broadcast Mode
            </button>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Save & Connect
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
