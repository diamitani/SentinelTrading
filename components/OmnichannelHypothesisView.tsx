import React, { useState, useEffect, useMemo } from 'react';
import {
  OmnichannelStreamNode,
  SecondOrderCommodityChain,
  LiveFeedsResponse,
} from '../types';
import { ResearchFocus } from '../services/answerEngine';
import { fetchLiveFeeds } from '../services/geminiService';
import {
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Landmark,
  BarChart3,
  FileText,
  Globe2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Send,
} from 'lucide-react';

interface OmnichannelHypothesisViewProps {
  nodes?: OmnichannelStreamNode[];
  chains?: SecondOrderCommodityChain[];
  onAsk?: (query: string, focus: ResearchFocus) => void;
  onDeployHypothesis: (hypothesisPrompt: string) => Promise<void>;
  isDeploying: boolean;
}

const CATEGORIES = [
  'All',
  'Equities & Trading',
  'VC, PE & Deal Rooms',
  'Fed, Gov Bonds & Macro',
  'Real Estate & REITs',
  'Cybersecurity & Risk',
  'AI & Tech Markets',
  'Portfolios & Quant',
  'Prediction & Digital Assets',
];

function focusForCategory(cat: string): ResearchFocus {
  if (cat.includes('Fed') || cat.includes('Macro')) return 'macro';
  if (cat.includes('Prediction') || cat.includes('Digital')) return 'crypto';
  if (cat.includes('Equities') || cat.includes('Portfolios')) return 'equities';
  if (cat.includes('VC')) return 'filings';
  return 'all';
}

function formatStoryTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return 'Recent';
  const mins = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const OmnichannelHypothesisView: React.FC<OmnichannelHypothesisViewProps> = ({
  chains = [],
  onAsk,
  onDeployHypothesis,
  isDeploying,
}) => {
  const [liveData, setLiveData] = useState<LiveFeedsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll100, setShowAll100] = useState<boolean>(false);
  const [catalogCategory, setCatalogCategory] = useState<string>('All');

  const [customHypothesis, setCustomHypothesis] = useState<string>('');

  const loadFeeds = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveFeeds(undefined, undefined, forceRefresh);
      setLiveData(data);
    } catch (e: any) {
      setError(e?.message || 'Could not reach live financial feeds right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadFeeds(false);
  }, []);

  const filteredStories = useMemo(() => {
    const stories = liveData?.stories || [];
    const q = searchQuery.trim().toLowerCase();
    return stories.filter((s) => {
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
      if (q) {
        const hay = `${s.title} ${s.summary} ${s.source} ${s.category} ${(s.tickers || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [liveData, selectedCategory, searchQuery]);

  const filteredCatalog = useMemo(() => {
    const cat = liveData?.catalog || [];
    const q = searchQuery.trim().toLowerCase();
    return cat.filter((src) => {
      if (catalogCategory !== 'All' && src.category !== catalogCategory) return false;
      if (q) {
        const hay = `${src.name} ${src.category} ${src.domain} ${src.protocol}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [liveData, catalogCategory, searchQuery]);

  const handleDeploySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHypothesis.trim()) return;
    await onDeployHypothesis(customHypothesis.trim());
    setCustomHypothesis('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Live Open-Source Finance Wire
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              {liveData
                ? `${liveData.totalStories} live stories · ${liveData.activeSourcesSucceeded} active feeds · ${liveData.totalCatalogSources} tracked platforms`
                : 'Connecting to live financial feeds…'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Live Financial News, Leads &amp; Top 100 Sources
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            Real-time stories, filings, US Treasury bond rates, and Polymarket odds pulled live from PitchBook, Seeking Alpha, Dealroom, WSJ, Federal Reserve, HousingWire, CISA, MIT Tech Review, SEC EDGAR, and 90+ more open feeds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAll100((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            {showAll100 ? 'Hide' : 'Browse'} All 100 Sources
            {showAll100 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => void loadFeeds(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh Live Feeds'}
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live leads: PitchBook, Fed rates, Treasury bonds, real estate, cybersecurity, AI, NVDA…"
              className="w-full rounded-lg border border-stone-200 bg-stone-50/70 pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          {liveData?.fetchedAt && (
            <div className="text-xs font-mono text-stone-500 shrink-0">
              Updated {new Date(liveData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? liveData?.totalStories || 0
                : liveData?.categoryCounts?.[cat] || 0;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  active
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
                {liveData && (
                  <span className={`ml-1.5 font-mono text-[10px] ${active ? 'text-stone-300' : 'text-stone-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Top 100 Open-Source Financial Platforms Directory */}
      {showAll100 && liveData?.catalog && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Top 100 Curated Financial Research Platforms &amp; Open APIs
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Direct links to RSS wires, open government APIs, VC/PE deal trackers, real estate journals, cybersecurity advisories, and quantitative research feeds.
              </p>
            </div>
            <select
              value={catalogCategory}
              onChange={(e) => setCatalogCategory(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredCatalog.map((src) => (
              <div
                key={src.id}
                className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-colors flex flex-col justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono text-stone-400">#{src.rank}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700">
                      {src.protocol}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-900 truncate mt-1">{src.name}</div>
                  <div className="text-[11px] text-stone-500 truncate">{src.category}</div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60">
                  <span className="text-[10px] font-mono text-stone-500 truncate">{src.domain}</span>
                  <a
                    href={src.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadFeeds(true)}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content: Live Stories (Left 8) + Live Market Sidebars (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Live Stories & Leads */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-600 font-mono">
              Live Stories &amp; Research Leads ({filteredStories.length})
            </h2>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Show all sectors
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="bg-white border border-stone-200 rounded-xl p-5 space-y-2.5">
                  <div className="h-3 w-40 bg-stone-100 rounded" />
                  <div className="h-5 w-4/5 bg-stone-200 rounded" />
                  <div className="h-3.5 w-full bg-stone-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-stone-700">
                No live stories matched &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStories.slice(0, 40).map((story) => (
                <article
                  key={story.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 hover:border-stone-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {story.category}
                      </span>
                      <span className="text-xs font-semibold text-stone-800">{story.source}</span>
                      <span className="text-[11px] font-mono text-stone-400">{story.domain}</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-500">
                      {formatStoryTime(story.publishedAt)}
                    </span>
                  </div>

                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base font-bold text-stone-900 hover:text-blue-700 transition-colors leading-snug"
                  >
                    {story.title}
                  </a>

                  {story.summary && (
                    <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed line-clamp-2">
                      {story.summary}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {story.tickers?.slice(0, 4).map((tk) => (
                        <span
                          key={tk}
                          className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700"
                        >
                          ${tk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                      >
                        Read source
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {onAsk && (
                        <button
                          type="button"
                          onClick={() =>
                            onAsk(
                              `Analyze this live headline from ${story.source}: "${story.title}". What stocks, bonds, sectors, or risks does it affect?`,
                              focusForCategory(story.category)
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Ask Sentinel
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Live US Treasury Bonds, Live Polymarket Odds, Live SEC Filings */}
        <div className="lg:col-span-4 space-y-5">
          {/* Official US Treasury Rates */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900">US Treasury Bond Rates</h3>
              </div>
              <span className="text-[10px] font-mono uppercase text-stone-500">Fiscal Data API</span>
            </div>

            {liveData?.treasuryRates?.length ? (
              <div className="space-y-2">
                {liveData.treasuryRates.slice(0, 6).map((rate) => (
                  <div
                    key={rate.securityDesc}
                    className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0 text-xs"
                  >
                    <span className="text-stone-700 font-medium truncate pr-2">
                      {rate.securityDesc}
                    </span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums shrink-0">
                      {rate.avgInterestRateAmt.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500">Loading official Treasury bond yields…</p>
            )}

            {onAsk && (
              <button
                type="button"
                onClick={() =>
                  onAsk(
                    'How do current US Treasury bond yields and Federal Reserve rate expectations affect stocks, REITs, and bond ETFs like TLT and SHY?',
                    'macro'
                  )
                }
                className="w-full py-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 transition-colors"
              >
                Ask Sentinel about Treasury bonds &amp; Fed rates →
              </button>
            )}
          </div>

          {/* Live Polymarket Prediction Odds */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900">Live Prediction Markets</h3>
              </div>
              <span className="text-[10px] font-mono uppercase text-stone-500">Polymarket API</span>
            </div>

            {liveData?.polymarkets?.length ? (
              <div className="space-y-3">
                {liveData.polymarkets.slice(0, 5).map((pm) => {
                  const pct = Math.round(pm.yesPrice * 100);
                  return (
                    <div
                      key={pm.id}
                      className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5"
                    >
                      <a
                        href={pm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-stone-900 hover:text-blue-700 line-clamp-2 leading-snug block"
                      >
                        {pm.question}
                      </a>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-emerald-700">YES {pct}%</span>
                        <span className="text-stone-500">
                          24h Vol: ${Math.round(pm.volume24hr).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-500">Loading active Polymarket contracts…</p>
            )}
          </div>

          {/* Live SEC EDGAR 8-K Filings */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-bold text-stone-900">Latest SEC EDGAR 8-K Filings</h3>
              </div>
              <span className="text-[10px] font-mono uppercase text-stone-500">SEC.gov Live</span>
            </div>

            {liveData?.secFilings?.length ? (
              <div className="space-y-2.5">
                {liveData.secFilings.slice(0, 6).map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded-lg border border-stone-200/70 hover:bg-stone-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-stone-900 line-clamp-1">
                      {f.title}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 mt-0.5 flex items-center justify-between">
                      <span>Form 8-K · SEC EDGAR</span>
                      <span>{formatStoryTime(f.publishedAt)}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500">Fetching recent SEC 8-K corporate filings…</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Turn Any Live Trend into a Custom Research Plan */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            Turn a Live Headline into Your Research Plan
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Spot a trend in bonds, real estate, cybersecurity, AI, or commodities? Enter it below and Sentinel will refresh your Market Ideas and 11 research guides around it.
          </p>
        </div>

        <form onSubmit={handleDeploySubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customHypothesis}
            onChange={(e) => setCustomHypothesis(e.target.value)}
            placeholder="e.g., Rising data-center cybersecurity budgets -> CrowdStrike (CRWD), Palo Alto (PANW), CIBR ETF"
            className="flex-1 rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isDeploying || !customHypothesis.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {isDeploying ? 'Updating plan…' : 'Research this idea'}
          </button>
        </form>

        {chains.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {chains.slice(0, 3).map((chain, idx) => (
              <div
                key={`${chain.impactedCommodity}-${idx}`}
                className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/70 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="text-xs font-bold text-stone-900">{chain.primaryEvent}</div>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{chain.derivedHypothesis}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/70">
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 truncate pr-2">
                    {chain.recommendedContract}
                  </span>
                  <button
                    type="button"
                    disabled={isDeploying}
                    onClick={() => void onDeployHypothesis(`${chain.primaryEvent}: ${chain.derivedHypothesis}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    Use idea
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
