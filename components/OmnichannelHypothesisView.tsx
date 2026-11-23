import React, { useState } from 'react';
import { OmnichannelStreamNode, SecondOrderCommodityChain } from '../types';

interface OmnichannelHypothesisViewProps {
  nodes?: OmnichannelStreamNode[];
  chains?: SecondOrderCommodityChain[];
  onDeployHypothesis: (thesisPrompt: string) => Promise<void>;
  isDeploying: boolean;
}

export const OmnichannelHypothesisView: React.FC<OmnichannelHypothesisViewProps> = ({
  nodes,
  chains,
  onDeployHypothesis,
  isDeploying,
}) => {
  const [customEventPrompt, setCustomEventPrompt] = useState<string>('');
  const [selectedChainIndex, setSelectedChainIndex] = useState<number | null>(null);

  const defaultNodes: OmnichannelStreamNode[] = nodes || [
    {
      id: 'feed_x_firehose',
      channel: 'X / Twitter',
      activeSignalsCount: 248900,
      velocityScore: 94,
      sampleSignal: 'Elon Musk automotive M&A rumors surging +620% in verified tech circles.',
      sentimentBias: 'BULLISH',
      lastPing: 'Live Stream 12ms',
    },
    {
      id: 'feed_reddit_wsb',
      channel: 'Reddit WallStreetBets',
      activeSignalsCount: 84200,
      velocityScore: 88,
      sampleSignal: 'Call option skew on Alcoa (AA) & Century Aluminum (CENX) post Pepsi packaging volume spike.',
      sentimentBias: 'BULLISH',
      lastPing: 'Live Stream 24ms',
    },
    {
      id: 'feed_google_trends',
      channel: 'Google Trends',
      activeSignalsCount: 1420000,
      velocityScore: 96,
      sampleSignal: 'Breakout query velocity on "aluminum can supply shortage" and "Rivian acquisition".',
      sentimentBias: 'DISLOCATION',
      lastPing: 'Real-time API',
    },
    {
      id: 'feed_quora_tech',
      channel: 'Quora & Tech Forums',
      activeSignalsCount: 31200,
      velocityScore: 72,
      sampleSignal: 'Engineering analyses debating feasibility of EV platform consolidation and battery pack IP sharing.',
      sentimentBias: 'BULLISH',
      lastPing: 'Live Wire',
    },
    {
      id: 'feed_meta_groups',
      channel: 'Facebook / Meta Groups',
      activeSignalsCount: 45000,
      velocityScore: 68,
      sampleSignal: 'Institutional logistics and beverage canning supply chain distributor reports.',
      sentimentBias: 'BULLISH',
      lastPing: 'Stream Sync',
    },
    {
      id: 'feed_sec_edgar',
      channel: 'SEC EDGAR Filings',
      activeSignalsCount: 1240,
      velocityScore: 91,
      sampleSignal: 'Form 13F and 4 filings confirming hedge fund basis swaps in industrial materials.',
      sentimentBias: 'DISLOCATION',
      lastPing: 'Real-time Push',
    },
  ];

  const defaultChains: SecondOrderCommodityChain[] = chains || [
    {
      primaryEvent: 'Pepsi Global Initiative: Aggressive Canned Beverage Sales Surge',
      derivedHypothesis: 'Surging canned beverage volume creates supply strain in packaging grade sheet coil.',
      impactedCommodity: 'CME Aluminum Futures (ALI=F) & Can Manufacturers (BALL, CCK)',
      recommendedContract: 'CME Aluminum Dec $2,650 Calls / Long Ball Corp (BALL) 1.8x Scale',
      expectedSpreadExpansion: '+3.4% Basis Dislocation',
      confidence: 94,
    },
    {
      primaryEvent: 'Elon Musk / X Speculation: Strategic Automotive Acquisition Directive',
      derivedHypothesis: 'Market speculation shifts capital to discounted EV platforms with manufacturing scale.',
      impactedCommodity: 'Rivian (RIVN), Lucid (LCID) Call Skew & Lithium Carbonate Basis',
      recommendedContract: 'RIVN Oct $12.50 Calls & Synthetic Short S&P Auto Index Pair',
      expectedSpreadExpansion: '+4.2% Cross-Exchange Spread',
      confidence: 91,
    },
    {
      primaryEvent: 'Hyperscale Datacenter Expansion: Next-Gen GPU Power Grid Contracts',
      derivedHypothesis: 'Massive transmission lines drive raw industrial copper & nuclear fuel demand spike.',
      impactedCommodity: 'Copper COMEX (HG=F) & Cameco Uranium (CCJ)',
      recommendedContract: 'CME Copper Month-1 Long Basis / CCJ Conversion Box',
      expectedSpreadExpansion: '+2.8% Spread Divergence',
      confidence: 88,
    },
  ];

  const handleExecuteChain = async (chain: SecondOrderCommodityChain, idx: number) => {
    setSelectedChainIndex(idx);
    const thesis = `${chain.primaryEvent}. Second-order impact: ${chain.derivedHypothesis}. Target commodities & equities: ${chain.impactedCommodity}. Execute ${chain.recommendedContract}.`;
    await onDeployHypothesis(thesis);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEventPrompt.trim()) return;
    await onDeployHypothesis(customEventPrompt);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Omnichannel Ingest & Second-Order Commodity Engine
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl font-normal">
            Ingests live unstructured intelligence across <span className="font-semibold text-slate-900">X (Twitter), Reddit, Google Trends, Quora, Meta Groups, SEC EDGAR, and Bloomberg</span>. Traces multi-market ripple effects—such as automotive OEM targets on M&A rumors, or aluminum commodity calls from beverage packaging surges.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>7 LIVE CHANNELS SYNCED</span>
        </div>
      </div>

      {/* 7 Stream Feed Cards */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Omnichannel Live Data Nodes
          </h3>
          <span className="text-xs text-slate-500 font-mono">2,300,000+ SIGNALS INDEXED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultNodes.map((node) => (
            <div key={node.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {node.channel}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {node.sentimentBias}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed my-2 line-clamp-2">
                  "{node.sampleSignal}"
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2.5 mt-2 flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>Velocity: <strong className="text-slate-900">{node.velocityScore}/100</strong></span>
                <span>{node.lastPing}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second-Order Commodity & Ripple Hypotheses */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Second-Order Market & Commodity Dislocation Chains
            </h3>
            <p className="text-xs text-slate-500">
              Select any pre-computed ripple hypothesis to price out multi-leg commodity calls, puts, and cross-venue arbitrage tickets.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {defaultChains.map((chain, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border bg-white flex flex-col justify-between shadow-xs transition-all ${
                selectedChainIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-blue-600 font-bold uppercase tracking-wider">
                  Ripple Scenario 0{idx + 1}
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono font-semibold">Primary Event / Wire</div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                    {chain.primaryEvent}
                  </h4>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-mono text-[10px] block">Derived Market Ripple</span>
                    <span className="text-slate-700 leading-relaxed font-medium block mt-0.5">
                      {chain.derivedHypothesis}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-mono text-[10px] block">Impacted Commodity / Equities</span>
                    <span className="text-slate-900 font-bold font-mono block mt-0.5">
                      {chain.impactedCommodity}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-mono text-[10px] block">Recommended Structure</span>
                    <span className="text-blue-700 font-semibold font-mono block mt-0.5">
                      {chain.recommendedContract}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-emerald-700 font-bold">{chain.expectedSpreadExpansion}</span>
                  <span className="text-slate-500">Confidence: {chain.confidence}%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => handleExecuteChain(chain, idx)}
                  disabled={isDeploying}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isDeploying && selectedChainIndex === idx ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Pricing Out Commodity Swaps...
                    </>
                  ) : (
                    'Deploy Ripple Hypothesis'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freeform Hypothesis Engine Input */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Custom Hypothesis & Ripple Generator
        </h3>
        <p className="text-xs text-slate-600 mb-4 font-normal">
          Type any event (e.g. <em>"Elon is going to buy a car company"</em> or <em>"Pepsi launches massive canned beverage campaign"</em>). The quant agent will trace second-order commodities (aluminum, lithium, copper) and price out actionable call/put arbitrage tickets.
        </p>

        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Elon is buying an automaker / Pepsi canned beverage initiative surge..."
              value={customEventPrompt}
              onChange={(e) => setCustomEventPrompt(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isDeploying || !customEventPrompt.trim()}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeploying ? 'Synthesizing...' : 'Trace Commodity Ripples'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
