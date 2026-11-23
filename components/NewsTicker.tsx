import React from 'react';
import { NewsItem } from '../types';

interface NewsTickerProps {
  news: NewsItem[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  if (!news || news.length === 0) return null;

  const tickerItems = [...news, ...news];

  return (
    <div className="bg-slate-50 border-b border-slate-200 h-9 flex items-center overflow-hidden relative z-30 select-none">
      <div className="bg-white text-slate-900 px-4 h-full flex items-center text-[11px] font-bold uppercase tracking-wider z-10 border-r border-slate-200 shadow-xs">
        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
        Global Wire
      </div>
      <div className="flex whitespace-nowrap animate-ticker hover:pause-animation items-center">
        {tickerItems.map((item, i) => (
          <a 
            key={`${item.url}-${i}`} 
            href={item.url} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center mx-6 text-xs text-slate-600 hover:text-blue-600 transition-colors group font-sans"
          >
            <span className="text-slate-300 mr-2 font-mono">/</span>
            <span className="font-mono mr-2 text-[10px] text-slate-400 uppercase font-semibold">{item.source}</span>
            <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{item.headline}</span>
          </a>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 120s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};