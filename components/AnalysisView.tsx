import React, { useState } from 'react';
import { MarketReport } from '../types';

interface AnalysisViewProps {
  report: MarketReport;
}

type TabType = 'GEOPOLITICS' | 'INTEL' | 'TRENDS' | 'SOURCES';

const SentimentBar: React.FC<{ label: string; value: number; type: 'diverging' | 'simple' }> = ({ label, value, type }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-900">{value > 0 && type === 'diverging' ? '+' : ''}{value}</span>
      </div>
      
      {type === 'diverging' ? (
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden flex items-center">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10"></div>
          <div 
            className={`h-full absolute transition-all duration-1000 ${value >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-red-500 right-1/2'}`}
            style={{ 
              width: `${Math.abs(value) / 2}%`,
              left: value >= 0 ? '50%' : 'auto',
              right: value < 0 ? '50%' : 'auto'
            }}
          ></div>
        </div>
      ) : (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ report }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('GEOPOLITICS');

  const filteredNews = report.newsFeed.filter(news => 
    news.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breakdown = report.sentimentBreakdown || {
    newsSentiment: 0,
    socialSentiment: 0,
    politicalImpact: 0,
    volatility: 0
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 mb-6 overflow-x-auto">
        {(['GEOPOLITICS', 'INTEL', 'TRENDS', 'SOURCES'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-semibold uppercase font-mono tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'GEOPOLITICS' && 'Geopolitical Risk'}
            {tab === 'INTEL' && 'Market Intelligence'}
            {tab === 'TRENDS' && 'Strategic Trends'}
            {tab === 'SOURCES' && 'Data Sources'}
          </button>
        ))}
      </div>

      {/* Geopolitical Intelligence Content */}
      {activeTab === 'GEOPOLITICS' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Geopolitical Risk Radar &amp; Systemic Dossier
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">GLOBAL MONITORING ACTIVE</span>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4">
            {report.politicalRisks && report.politicalRisks.map((risk, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-slate-500 uppercase">{risk.region}</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{risk.event}</h4>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0 ${
                    risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {risk.riskLevel} ALERT
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {risk.situationAnalysis}
                </p>
                <div className="text-xs text-slate-500 pt-1 font-mono">
                  Economic Impact: <span className="text-slate-800">{risk.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Intel Content */}
      {activeTab === 'INTEL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Social Order Flow Stream</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {report.socialSentimentSummary}
            </p>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs flex flex-col h-[520px] min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
               <h3 className="text-base font-bold text-slate-900">Global Financial Wire</h3>
               <input 
                 type="text" 
                 placeholder="Search Intel..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-60"
               />
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-grow pr-1">
               {filteredNews.map((news, i) => (
                 <a 
                   href={news.url} 
                   target="_blank" 
                   rel="noreferrer" 
                   key={i} 
                   className="block p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                 >
                   <div className="flex justify-between items-start">
                     <h4 className="text-slate-900 font-semibold text-xs sm:text-sm hover:text-blue-600">{news.headline}</h4>
                     <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{news.publishedAt}</span>
                   </div>
                   <div className="text-[10px] text-slate-500 font-mono uppercase mt-1">{news.source}</div>
                 </a>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Content */}
      {activeTab === 'TRENDS' && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Sentiment Driver Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <SentimentBar label="News Sentiment Bias" value={breakdown.newsSentiment} type="diverging" />
            <SentimentBar label="Social Media Velocity" value={breakdown.socialSentiment} type="diverging" />
            <SentimentBar label="Geopolitical Impact Factor" value={breakdown.politicalImpact} type="diverging" />
            <SentimentBar label="Market Volatility Index" value={breakdown.volatility} type="simple" />
          </div>
        </div>
      )}

      {/* Sources Content */}
      {activeTab === 'SOURCES' && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">
            Grounding Data Sources ({report.sources.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg hover:text-blue-600 hover:border-slate-300 transition-colors"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};