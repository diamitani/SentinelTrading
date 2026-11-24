import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Getting your dashboard ready…' }) => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fafaf9]" role="status" aria-live="polite">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-mono text-lg font-bold text-white">S</span>
    <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full w-1/3 animate-[sentinel-loading_1.1s_ease-in-out_infinite] rounded-full bg-blue-600" />
    </div>
    <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    <style>{`@keyframes sentinel-loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
  </div>
);
