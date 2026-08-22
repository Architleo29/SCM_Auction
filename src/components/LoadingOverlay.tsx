import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-300 animate-pulse">{message}</p>
      </div>
    </div>
  );
}
