// ============================================================================
// Live Open-Source Financial Intelligence, Top-100 RSS Directory & Free APIs
// Zero mock data: fetches real RSS/Atom XML feeds, Yahoo Finance live quotes,
// US Treasury Fiscal Data API, Polymarket Gamma API, SEC EDGAR 8-K Atom,
// Coinbase Spot API, and Hacker News Algolia API concurrently with TTL caching.
// ============================================================================

export type FeedCategory =
  | 'Equities & Trading'
  | 'VC, PE & Deal Rooms'
  | 'Fed, Gov Bonds & Macro'
  | 'Real Estate & REITs'
  | 'Cybersecurity & Risk'
  | 'AI & Tech Markets'
  | 'Portfolios & Quant'
  | 'Prediction & Digital Assets';

export interface FinancialSourceDef {
  id: string;
  rank: number;
  name: string;
  category: FeedCategory;
  type: 'RSS' | 'ATOM' | 'PUBLIC_API' | 'NEWS_WIRE';
  url: string;
  homeUrl: string;
  activePoll?: boolean;
}

export interface LiveNewsStory {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: FeedCategory;
  url: string;
  publishedAt: string;
  publishedIso: string;
  domain: string;
  leadType: 'News' | 'Deal / Filing' | 'Fed / Macro' | 'Security Advisory' | 'Research Paper' | 'Prediction Market';
}

export interface LiveQuote {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  currency: string;
  category: string;
  marketState?: string;
}

export interface LiveTreasuryRate {
  securityDesc: string;
  avgInterestRateAmt: number;
  recordDate: string;
}

export interface LivePolymarketContract {
  id: string;
  question: string;
  slug: string;
  url: string;
  yesPrice: number;
  noPrice: number;
  volume24hr: number;
  liquidity: number;
  endDate?: string;
}

export interface LiveMarketSnapshot {
  fetchedAt: string;
  stories: LiveNewsStory[];
  quotes: Record<string, LiveQuote>;
  sectorEtfs: Array<{ sector: string; symbol: string; performance: number; price: number }>;
  treasuryRates: LiveTreasuryRate[];
  polymarkets: LivePolymarketContract[];
  secFilings: LiveNewsStory[];
  activeSourcesSucceeded: number;
  totalCatalogSources: number;
  categoryCounts: Record<string, number>;
}

const USER_AGENT = 'SentinelTradingResearch/2.0 (open-research@sentineltrading.app)';

// ============================================================================
// TOP 100 CURATED FINANCIAL, DEAL-ROOM, REAL ESTATE, CYBER, AI, BONDS & FED SOURCES
// ============================================================================
export const TOP_100_FINANCIAL_SOURCES: FinancialSourceDef[] = [
  // --- 1. Equities & Trading (20) ---
  { id: 'seeking-alpha', rank: 1, name: 'Seeking Alpha Market Currents', category: 'Equities & Trading', type: 'RSS', url: 'https://seekingalpha.com/market_currents.xml', homeUrl: 'https://seekingalpha.com', activePoll: true },
  { id: 'wsj-markets', rank: 2, name: 'Wall Street Journal Markets', category: 'Equities & Trading', type: 'RSS', url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', homeUrl: 'https://wsj.com', activePoll: true },
  { id: 'marketwatch', rank: 3, name: 'MarketWatch Top Stories', category: 'Equities & Trading', type: 'RSS', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', homeUrl: 'https://marketwatch.com', activePoll: true },
  { id: 'cnbc-finance', rank: 4, name: 'CNBC Finance & Markets', category: 'Equities & Trading', type: 'RSS', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', homeUrl: 'https://cnbc.com', activePoll: true },
  { id: 'ft-markets', rank: 5, name: 'Financial Times Markets', category: 'Equities & Trading', type: 'RSS', url: 'https://www.ft.com/markets?format=rss', homeUrl: 'https://ft.com', activePoll: true },
  { id: 'yahoo-quotes', rank: 6, name: 'Yahoo Finance Live Market API', category: 'Equities & Trading', type: 'PUBLIC_API', url: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC', homeUrl: 'https://finance.yahoo.com', activePoll: true },
  { id: 'cnbc-investing', rank: 7, name: 'CNBC Investing', category: 'Equities & Trading', type: 'RSS', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', homeUrl: 'https://cnbc.com/investing', activePoll: true },
  { id: 'reuters-markets', rank: 8, name: 'Reuters Markets Wire', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:reuters.com+markets+OR+stocks+OR+earnings&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://reuters.com/markets', activePoll: true },
  { id: 'bloomberg-markets', rank: 9, name: 'Bloomberg Markets Wire', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+markets+OR+trading&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://bloomberg.com/markets', activePoll: true },
  { id: 'barrons', rank: 10, name: 'Barron’s Investing', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:barrons.com+stocks+OR+bonds&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://barrons.com' },
  { id: 'nasdaq', rank: 11, name: 'Nasdaq Market News', category: 'Equities & Trading', type: 'RSS', url: 'https://www.nasdaq.com/feed/rssoutbound?category=Markets', homeUrl: 'https://nasdaq.com' },
  { id: 'investing-com', rank: 12, name: 'Investing.com News', category: 'Equities & Trading', type: 'RSS', url: 'https://www.investing.com/rss/news.rss', homeUrl: 'https://investing.com' },
  { id: 'benzinga', rank: 13, name: 'Benzinga Market Movers', category: 'Equities & Trading', type: 'RSS', url: 'https://www.benzinga.com/feed', homeUrl: 'https://benzinga.com' },
  { id: 'motley-fool', rank: 14, name: 'The Motley Fool', category: 'Equities & Trading', type: 'RSS', url: 'https://www.fool.com/feeds/index.aspx', homeUrl: 'https://fool.com' },
  { id: 'zacks', rank: 15, name: 'Zacks Investment Research', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:zacks.com+earnings&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://zacks.com' },
  { id: 'morningstar', rank: 16, name: 'Morningstar Research', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:morningstar.com+investing&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://morningstar.com' },
  { id: 'forbes-money', rank: 17, name: 'Forbes Investing & Markets', category: 'Equities & Trading', type: 'RSS', url: 'https://www.forbes.com/investing/feed/', homeUrl: 'https://forbes.com/money' },
  { id: 'economist-finance', rank: 18, name: 'The Economist Finance', category: 'Equities & Trading', type: 'RSS', url: 'https://www.economist.com/finance-and-economics/rss.xml', homeUrl: 'https://economist.com' },
  { id: 'business-insider', rank: 19, name: 'Business Insider Markets', category: 'Equities & Trading', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:businessinsider.com+markets&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://markets.businessinsider.com' },
  { id: 'kiplinger', rank: 20, name: 'Kiplinger Personal Finance', category: 'Equities & Trading', type: 'RSS', url: 'https://www.kiplinger.com/feeds/all', homeUrl: 'https://kiplinger.com' },

  // --- 2. VC, PE & Deal Rooms (14) ---
  { id: 'pitchbook', rank: 21, name: 'PitchBook News & Analysis', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=PitchBook+OR+site:pitchbook.com&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://pitchbook.com/news', activePoll: true },
  { id: 'dealroom', rank: 22, name: 'Dealroom & Venture Deal Flow', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=Dealroom+OR+%22Series+A%22+OR+%22Series+B%22+funding+round&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://dealroom.co', activePoll: true },
  { id: 'techcrunch', rank: 23, name: 'TechCrunch Venture & Startups', category: 'VC, PE & Deal Rooms', type: 'RSS', url: 'https://techcrunch.com/feed/', homeUrl: 'https://techcrunch.com', activePoll: true },
  { id: 'crunchbase-news', rank: 24, name: 'Crunchbase News', category: 'VC, PE & Deal Rooms', type: 'RSS', url: 'https://news.crunchbase.com/feed/', homeUrl: 'https://news.crunchbase.com', activePoll: true },
  { id: 'sec-edgar-8k', rank: 25, name: 'SEC EDGAR Live 8-K Filings (M&A & Material Events)', category: 'VC, PE & Deal Rooms', type: 'ATOM', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&count=20&output=atom', homeUrl: 'https://www.sec.gov/edgar', activePoll: true },
  { id: 'pe-hub', rank: 26, name: 'PE Hub Private Equity Deals', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:pehub.com+OR+%22private+equity+deal%22&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://pehub.com' },
  { id: 'axios-prorata', rank: 27, name: 'Axios Pro Rata Deals', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:axios.com+venture+capital+OR+acquisition&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://axios.com' },
  { id: 'sifted', rank: 28, name: 'Sifted European Startups', category: 'VC, PE & Deal Rooms', type: 'RSS', url: 'https://sifted.eu/feed', homeUrl: 'https://sifted.eu' },
  { id: 'finextra', rank: 29, name: 'Finextra FinTech Wire', category: 'VC, PE & Deal Rooms', type: 'RSS', url: 'https://www.finextra.com/rss/headlines.aspx', homeUrl: 'https://finextra.com' },
  { id: 'fortune-termsheet', rank: 30, name: 'Fortune Term Sheet', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:fortune.com+%22Term+Sheet%22+OR+venture+funding&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://fortune.com' },
  { id: 'strictlyvc', rank: 31, name: 'StrictlyVC', category: 'VC, PE & Deal Rooms', type: 'RSS', url: 'https://www.strictlyvc.com/feed/', homeUrl: 'https://strictlyvc.com' },
  { id: 'carta-insights', rank: 32, name: 'Carta Private Markets Data', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:carta.com+valuations+OR+startups&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://carta.com' },
  { id: 'cb-insights', rank: 33, name: 'CB Insights Research', category: 'VC, PE & Deal Rooms', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=%22CB+Insights%22+fintech+OR+AI+funding&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://cbinsights.com' },
  { id: 'sec-s1', rank: 34, name: 'SEC EDGAR IPO S-1 Filings', category: 'VC, PE & Deal Rooms', type: 'ATOM', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=S-1&count=10&output=atom', homeUrl: 'https://www.sec.gov/edgar' },

  // --- 3. Fed, Government Bonds & Macro (16) ---
  { id: 'fed-press', rank: 35, name: 'Federal Reserve Press Releases', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.federalreserve.gov/feeds/press_all.xml', homeUrl: 'https://www.federalreserve.gov', activePoll: true },
  { id: 'nyfed-liberty', rank: 36, name: 'NY Fed Liberty Street Economics', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://libertystreeteconomics.newyorkfed.org/feed/', homeUrl: 'https://libertystreeteconomics.newyorkfed.org', activePoll: true },
  { id: 'stlouisfed-fred', rank: 37, name: 'St. Louis Fed FRED Economic Blog', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://fredblog.stlouisfed.org/feed/', homeUrl: 'https://fredblog.stlouisfed.org', activePoll: true },
  { id: 'us-treasury-api', rank: 38, name: 'US Treasury Fiscal Data API (Official Bond Rates)', category: 'Fed, Gov Bonds & Macro', type: 'PUBLIC_API', url: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=10', homeUrl: 'https://fiscaldata.treasury.gov', activePoll: true },
  { id: 'fed-speeches', rank: 39, name: 'Federal Reserve Speeches', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.federalreserve.gov/feeds/speeches.xml', homeUrl: 'https://www.federalreserve.gov/newsevents/speeches.htm' },
  { id: 'treasury-bonds-wire', rank: 40, name: 'US Treasury Bonds & Yields Wire', category: 'Fed, Gov Bonds & Macro', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=%22Treasury+yield%22+OR+%22government+bonds%22+OR+%22Federal+Reserve%22&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://home.treasury.gov', activePoll: true },
  { id: 'bls-releases', rank: 41, name: 'Bureau of Labor Statistics (CPI & Jobs)', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.bls.gov/feed/bls_latest.rss', homeUrl: 'https://www.bls.gov' },
  { id: 'ecb-press', rank: 42, name: 'European Central Bank Press', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.ecb.europa.eu/rss/press.html', homeUrl: 'https://www.ecb.europa.eu' },
  { id: 'imf-news', rank: 43, name: 'IMF Global Economy News', category: 'Fed, Gov Bonds & Macro', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:imf.org+economy+OR+inflation&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://www.imf.org' },
  { id: 'world-bank', rank: 44, name: 'World Bank Open Data & Economy', category: 'Fed, Gov Bonds & Macro', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:worldbank.org+growth+OR+debt&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://data.worldbank.org' },
  { id: 'boe-news', rank: 45, name: 'Bank of England Releases', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.bankofengland.co.uk/rss/news', homeUrl: 'https://www.bankofengland.co.uk' },
  { id: 'cbo-reports', rank: 46, name: 'Congressional Budget Office', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.cbo.gov/publications/all/rss.xml', homeUrl: 'https://www.cbo.gov' },
  { id: 'bis-research', rank: 47, name: 'Bank for International Settlements', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://www.bis.org/doclist/bis_fsi_publs.rss', homeUrl: 'https://www.bis.org' },
  { id: 'treasurydirect', rank: 48, name: 'TreasuryDirect Auctions & I-Bonds', category: 'Fed, Gov Bonds & Macro', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=Treasury+auction+OR+T-bill+yield&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://www.treasurydirect.gov' },
  { id: 'bea-gdp', rank: 49, name: 'Bureau of Economic Analysis (GDP & PCE)', category: 'Fed, Gov Bonds & Macro', type: 'RSS', url: 'https://apps.bea.gov/rss/rss.xml', homeUrl: 'https://www.bea.gov' },
  { id: 'oecd-economy', rank: 50, name: 'OECD Economic Outlook', category: 'Fed, Gov Bonds & Macro', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=OECD+economic+outlook+rates&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://www.oecd.org' },

  // --- 4. Real Estate & REITs (12) ---
  { id: 'housingwire', rank: 51, name: 'HousingWire Mortgage & Real Estate', category: 'Real Estate & REITs', type: 'RSS', url: 'https://www.housingwire.com/feed/', homeUrl: 'https://housingwire.com', activePoll: true },
  { id: 'commercial-observer', rank: 52, name: 'Commercial Observer CRE Deals', category: 'Real Estate & REITs', type: 'RSS', url: 'https://commercialobserver.com/feed/', homeUrl: 'https://commercialobserver.com', activePoll: true },
  { id: 'calculated-risk', rank: 53, name: 'Calculated Risk Housing & Macro', category: 'Real Estate & REITs', type: 'RSS', url: 'https://www.calculatedriskblog.com/feeds/posts/default?alt=rss', homeUrl: 'https://calculatedriskblog.com', activePoll: true },
  { id: 'redfin-news', rank: 54, name: 'Redfin Housing Market Data', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:redfin.com/news+housing+OR+mortgage&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://redfin.com/news' },
  { id: 'biggerpockets', rank: 55, name: 'BiggerPockets Real Estate', category: 'Real Estate & REITs', type: 'RSS', url: 'https://www.biggerpockets.com/blog/feed', homeUrl: 'https://biggerpockets.com' },
  { id: 'globest', rank: 56, name: 'GlobeSt Commercial Real Estate', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:globest.com+OR+%22commercial+real+estate%22+REIT&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://globest.com' },
  { id: 'mortgage-news-daily', rank: 57, name: 'Mortgage News Daily Rates', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=%2230-year+mortgage+rate%22+housing&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://mortgagenewsdaily.com' },
  { id: 'nareit', rank: 58, name: 'Nareit REIT Market Data', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:reit.com+OR+REIT+dividend+yield&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://reit.com' },
  { id: 'realtor-research', rank: 59, name: 'Realtor.com Economic Research', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:realtor.com/research+home+prices&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://realtor.com/research' },
  { id: 'inman', rank: 60, name: 'Inman Real Estate', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=site:inman.com+real+estate&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://inman.com' },
  { id: 'corelogic', rank: 61, name: 'CoreLogic Property Insights', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=CoreLogic+home+price+index&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://corelogic.com' },
  { id: 'freddie-mac', rank: 62, name: 'Freddie Mac PMMS Mortgage Survey', category: 'Real Estate & REITs', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=%22Freddie+Mac%22+mortgage+rates&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://freddiemac.com' },

  // --- 5. Cybersecurity & Risk (12) ---
  { id: 'krebs', rank: 63, name: 'Krebs on Security', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://krebsonsecurity.com/feed/', homeUrl: 'https://krebsonsecurity.com', activePoll: true },
  { id: 'bleepingcomputer', rank: 64, name: 'BleepingComputer Security News', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.bleepingcomputer.com/feed/', homeUrl: 'https://bleepingcomputer.com', activePoll: true },
  { id: 'the-hacker-news', rank: 65, name: 'The Hacker News', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://feeds.feedburner.com/TheHackersNews', homeUrl: 'https://thehackernews.com', activePoll: true },
  { id: 'cisa-advisories', rank: 66, name: 'CISA Cybersecurity Advisories (US Gov)', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', homeUrl: 'https://www.cisa.gov', activePoll: true },
  { id: 'dark-reading', rank: 67, name: 'Dark Reading Enterprise Cyber', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.darkreading.com/rss.xml', homeUrl: 'https://darkreading.com' },
  { id: 'securityweek', rank: 68, name: 'SecurityWeek Cyber & Funding', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.securityweek.com/feed/', homeUrl: 'https://securityweek.com' },
  { id: 'schneier', rank: 69, name: 'Schneier on Security', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.schneier.com/feed/atom/', homeUrl: 'https://schneier.com' },
  { id: 'ars-security', rank: 70, name: 'Ars Technica Security', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://feeds.arstechnica.com/arstechnica/security', homeUrl: 'https://arstechnica.com/security' },
  { id: 'wired-security', rank: 71, name: 'WIRED Security', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.wired.com/feed/category/security/latest/rss', homeUrl: 'https://wired.com/category/security' },
  { id: 'cso-online', rank: 72, name: 'CSO Online Cyber Risk', category: 'Cybersecurity & Risk', type: 'RSS', url: 'https://www.csoonline.com/feed/', homeUrl: 'https://csoonline.com' },
  { id: 'nist-nvd', rank: 73, name: 'NIST National Vulnerability Wire', category: 'Cybersecurity & Risk', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=cybersecurity+stocks+OR+ransomware+breach+financial&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://nvd.nist.gov' },
  { id: 'mandiant', rank: 74, name: 'Google Cloud / Mandiant Threat Intel', category: 'Cybersecurity & Risk', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=Mandiant+OR+CrowdStrike+OR+Palo+Alto+Networks+cybersecurity&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://cloud.google.com/security' },

  // --- 6. AI & Tech Markets (10) ---
  { id: 'mit-tech-ai', rank: 75, name: 'MIT Technology Review AI', category: 'AI & Tech Markets', type: 'RSS', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', homeUrl: 'https://technologyreview.com', activePoll: true },
  { id: 'arxiv-ai', rank: 76, name: 'ArXiv Artificial Intelligence (cs.AI)', category: 'AI & Tech Markets', type: 'RSS', url: 'https://rss.arxiv.org/rss/cs.AI', homeUrl: 'https://arxiv.org/list/cs.AI/recent', activePoll: true },
  { id: 'hn-algolia', rank: 77, name: 'Hacker News Finance, AI & Tech API', category: 'AI & Tech Markets', type: 'PUBLIC_API', url: 'https://hn.algolia.com/api/v1/search_by_date?query=AI+OR+finance+OR+chips+OR+bonds&tags=story&hitsPerPage=12', homeUrl: 'https://news.ycombinator.com', activePoll: true },
  { id: 'venturebeat-ai', rank: 78, name: 'VentureBeat AI', category: 'AI & Tech Markets', type: 'RSS', url: 'https://venturebeat.com/category/ai/feed/', homeUrl: 'https://venturebeat.com' },
  { id: 'ars-tech', rank: 79, name: 'Ars Technica Technology', category: 'AI & Tech Markets', type: 'RSS', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', homeUrl: 'https://arstechnica.com' },
  { id: 'the-verge-ai', rank: 80, name: 'The Verge AI', category: 'AI & Tech Markets', type: 'RSS', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', homeUrl: 'https://theverge.com/ai-artificial-intelligence' },
  { id: 'ieee-spectrum', rank: 81, name: 'IEEE Spectrum AI & Chips', category: 'AI & Tech Markets', type: 'RSS', url: 'https://spectrum.ieee.org/feeds/feed.rss', homeUrl: 'https://spectrum.ieee.org' },
  { id: 'semiconductor-wire', rank: 82, name: 'Semiconductor & AI Hardware Wire', category: 'AI & Tech Markets', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=NVIDIA+OR+TSMC+OR+semiconductor+AI+chips&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://semianalysis.com', activePoll: true },
  { id: 'huggingface-blog', rank: 83, name: 'Hugging Face Open-Source AI', category: 'AI & Tech Markets', type: 'RSS', url: 'https://huggingface.co/blog/feed.xml', homeUrl: 'https://huggingface.co/blog' },
  { id: 'deepmind-blog', rank: 84, name: 'Google DeepMind Research', category: 'AI & Tech Markets', type: 'RSS', url: 'https://deepmind.google/blog/rss.xml', homeUrl: 'https://deepmind.google' },

  // --- 7. Portfolios & Quant Research (8) ---
  { id: 'arxiv-qfin', rank: 85, name: 'ArXiv Quantitative Finance (q-fin)', category: 'Portfolios & Quant', type: 'RSS', url: 'https://rss.arxiv.org/rss/q-fin', homeUrl: 'https://arxiv.org/list/q-fin/recent', activePoll: true },
  { id: 'a-wealth-of-common-sense', rank: 86, name: 'A Wealth of Common Sense', category: 'Portfolios & Quant', type: 'RSS', url: 'https://awealthofcommonsense.com/feed/', homeUrl: 'https://awealthofcommonsense.com', activePoll: true },
  { id: 'alpha-architect', rank: 87, name: 'Alpha Architect Factor Investing', category: 'Portfolios & Quant', type: 'RSS', url: 'https://alphaarchitect.com/feed/', homeUrl: 'https://alphaarchitect.com' },
  { id: 'cfa-enterprising', rank: 88, name: 'CFA Institute Enterprising Investor', category: 'Portfolios & Quant', type: 'RSS', url: 'https://blogs.cfainstitute.org/investor/feed/', homeUrl: 'https://blogs.cfainstitute.org/investor' },
  { id: 'quantocracy', rank: 89, name: 'Quantocracy Open Quant Mashup', category: 'Portfolios & Quant', type: 'RSS', url: 'https://quantocracy.com/feed/', homeUrl: 'https://quantocracy.com' },
  { id: 'portfolio-charts', rank: 90, name: 'Portfolio Charts Open Research', category: 'Portfolios & Quant', type: 'RSS', url: 'https://portfoliocharts.com/feed/', homeUrl: 'https://portfoliocharts.com' },
  { id: 'etf-com', rank: 91, name: 'ETF.com Flows & Portfolios', category: 'Portfolios & Quant', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=ETF+inflows+OR+index+fund+portfolio&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://etf.com' },
  { id: 'sec-13f', rank: 92, name: 'SEC EDGAR 13F Portfolio Holdings', category: 'Portfolios & Quant', type: 'ATOM', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=13F-HR&count=10&output=atom', homeUrl: 'https://www.sec.gov/edgar' },

  // --- 8. Prediction Markets & Digital Assets (8) ---
  { id: 'polymarket-gamma', rank: 93, name: 'Polymarket Live Gamma Orderbook API', category: 'Prediction & Digital Assets', type: 'PUBLIC_API', url: 'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=15&order=volume24hr&ascending=false', homeUrl: 'https://polymarket.com', activePoll: true },
  { id: 'coinbase-spot', rank: 94, name: 'Coinbase Live Crypto Spot API', category: 'Prediction & Digital Assets', type: 'PUBLIC_API', url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot', homeUrl: 'https://coinbase.com', activePoll: true },
  { id: 'coindesk', rank: 95, name: 'CoinDesk Digital Assets', category: 'Prediction & Digital Assets', type: 'RSS', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', homeUrl: 'https://coindesk.com', activePoll: true },
  { id: 'kalshi-wire', rank: 96, name: 'Kalshi CFTC Prediction Markets Wire', category: 'Prediction & Digital Assets', type: 'NEWS_WIRE', url: 'https://news.google.com/rss/search?q=Kalshi+OR+Polymarket+prediction+market&hl=en-US&gl=US&ceid=US:en', homeUrl: 'https://kalshi.com', activePoll: true },
  { id: 'cointelegraph', rank: 97, name: 'Cointelegraph Markets', category: 'Prediction & Digital Assets', type: 'RSS', url: 'https://cointelegraph.com/rss', homeUrl: 'https://cointelegraph.com' },
  { id: 'the-block', rank: 98, name: 'The Block Crypto Research', category: 'Prediction & Digital Assets', type: 'RSS', url: 'https://www.theblock.co/rss.xml', homeUrl: 'https://theblock.co' },
  { id: 'cme-commodities', rank: 99, name: 'CME Commodities & Futures Quotes', category: 'Prediction & Digital Assets', type: 'PUBLIC_API', url: 'https://query1.finance.yahoo.com/v8/finance/chart/ALI=F', homeUrl: 'https://cmegroup.com', activePoll: true },
  { id: 'defillama', rank: 100, name: 'DeFiLlama Open TVL & Yields API', category: 'Prediction & Digital Assets', type: 'PUBLIC_API', url: 'https://api.llama.fi/protocols', homeUrl: 'https://defillama.com' },
];

// ============================================================================
// XML / RSS / ATOM PARSER (Zero external deps)
// ============================================================================
function decodeEntities(input: string): string {
  return (input || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#8217;|&#x2019;/g, '’')
    .replace(/&#8216;|&#x2018;/g, '‘')
    .replace(/&#8220;|&#x201C;/g, '“')
    .replace(/&#8221;|&#x201D;/g, '”')
    .replace(/&#8211;|&#x2013;/g, '–')
    .replace(/&#8212;|&#x2014;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1]) : '';
}

function extractLink(block: string): string {
  const atomHref = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (atomHref && atomHref[1]) return atomHref[1].trim();
  const tagLink = extractTag(block, 'link');
  if (tagLink && tagLink.startsWith('http')) return tagLink;
  const guid = extractTag(block, 'guid');
  if (guid && guid.startsWith('http')) return guid;
  return '';
}

function formatRelativeTime(dateStr: string): { label: string; iso: string } {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) {
    return { label: 'Recent', iso: new Date().toISOString() };
  }
  const diffMs = Date.now() - parsed;
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return { label: `${mins}m ago`, iso: new Date(parsed).toISOString() };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { label: `${hrs}h ago`, iso: new Date(parsed).toISOString() };
  const days = Math.round(hrs / 24);
  if (days <= 14) return { label: `${days}d ago`, iso: new Date(parsed).toISOString() };
  return {
    label: new Date(parsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    iso: new Date(parsed).toISOString(),
  };
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'news';
  }
}

function leadTypeForCategory(cat: FeedCategory): LiveNewsStory['leadType'] {
  if (cat === 'VC, PE & Deal Rooms') return 'Deal / Filing';
  if (cat === 'Fed, Gov Bonds & Macro') return 'Fed / Macro';
  if (cat === 'Cybersecurity & Risk') return 'Security Advisory';
  if (cat === 'Portfolios & Quant') return 'Research Paper';
  if (cat === 'Prediction & Digital Assets') return 'Prediction Market';
  return 'News';
}

async function fetchRssOrAtomFeed(source: FinancialSourceDef, limit = 5): Promise<LiveNewsStory[]> {
  try {
    const resp = await fetch(source.url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      signal: AbortSignal.timeout(4200),
    });
    if (!resp.ok) return [];
    const xml = await resp.text();
    if (!xml || xml.length < 100) return [];

    const isAtom = /<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml);
    const blocks = isAtom
      ? xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
      : xml.match(/<item[\s\S]*?<\/item>/gi) || [];

    const items: LiveNewsStory[] = [];
    for (let i = 0; i < Math.min(limit, blocks.length); i++) {
      const b = blocks[i];
      const title = extractTag(b, 'title');
      const link = extractLink(b) || source.homeUrl;
      if (!title || title.length < 6) continue;

      const descRaw =
        extractTag(b, 'description') ||
        extractTag(b, 'summary') ||
        extractTag(b, 'content') ||
        '';
      const pubRaw =
        extractTag(b, 'pubDate') ||
        extractTag(b, 'updated') ||
        extractTag(b, 'published') ||
        extractTag(b, 'dc:date') ||
        '';
      const { label, iso } = formatRelativeTime(pubRaw);

      items.push({
        id: `${source.id}-${i}-${title.slice(0, 16).replace(/[^a-z0-9]/gi, '')}`,
        title: title.slice(0, 190),
        summary: (descRaw || `Latest update from ${source.name}.`).slice(0, 240),
        source: source.name,
        category: source.category,
        url: link,
        publishedAt: label,
        publishedIso: iso,
        domain: domainOf(link),
        leadType: leadTypeForCategory(source.category),
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchHackerNewsLive(): Promise<LiveNewsStory[]> {
  try {
    const resp = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=finance+OR+AI+OR+bonds+OR+cybersecurity+OR+housing&tags=story&hitsPerPage=8',
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(3500) }
    );
    if (!resp.ok) return [];
    const data: any = await resp.json();
    const hits = Array.isArray(data?.hits) ? data.hits : [];
    return hits
      .filter((h: any) => h?.title && (h?.url || h?.objectID))
      .slice(0, 6)
      .map((h: any, idx: number) => {
        const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
        const { label, iso } = formatRelativeTime(h.created_at || '');
        return {
          id: `hn-${h.objectID || idx}`,
          title: String(h.title).slice(0, 180),
          summary: `Community discussion (${h.points || 0} points, ${h.num_comments || 0} comments) on Hacker News.`,
          source: 'Hacker News Finance & Tech',
          category: 'AI & Tech Markets' as FeedCategory,
          url,
          publishedAt: label,
          publishedIso: iso,
          domain: domainOf(url),
          leadType: 'News' as const,
        };
      });
  } catch {
    return [];
  }
}

// ============================================================================
// FREE LIVE MARKET QUOTES (Yahoo Finance Chart API + Coinbase Spot)
// ============================================================================
const QUOTE_SYMBOLS: Array<{ symbol: string; name: string; category: string }> = [
  // Macro Indices & Commodities
  { symbol: '^GSPC', name: 'S&P 500', category: 'Index' },
  { symbol: '^IXIC', name: 'Nasdaq', category: 'Index' },
  { symbol: '^VIX', name: 'VIX Volatility', category: 'Index' },
  { symbol: '^TNX', name: '10Y Treasury Yield', category: 'Bonds' },
  { symbol: 'GC=F', name: 'Gold Futures', category: 'Commodities' },
  { symbol: 'CL=F', name: 'Crude Oil', category: 'Commodities' },
  { symbol: 'ALI=F', name: 'CME Aluminum', category: 'Commodities' },
  // Sector ETFs
  { symbol: 'XLK', name: 'Technology', category: 'Sector' },
  { symbol: 'XLB', name: 'Materials & Metals', category: 'Sector' },
  { symbol: 'XLF', name: 'Financials', category: 'Sector' },
  { symbol: 'XLE', name: 'Energy', category: 'Sector' },
  { symbol: 'XLRE', name: 'Real Estate (REITs)', category: 'Sector' },
  { symbol: 'XLV', name: 'Healthcare', category: 'Sector' },
  { symbol: 'TLT', name: '20Y US Treasury Bonds', category: 'Bonds' },
  { symbol: 'CIBR', name: 'Cybersecurity ETF', category: 'Cybersecurity' },
  // Liquid Stocks & ETFs for real research ideas
  { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'Equities' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', category: 'Equities' },
  { symbol: 'AAPL', name: 'Apple Inc', category: 'Equities' },
  { symbol: 'MSFT', name: 'Microsoft Corp', category: 'Equities' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Equities' },
  { symbol: 'AVGO', name: 'Broadcom Inc', category: 'Equities' },
  { symbol: 'PLTR', name: 'Palantir Technologies', category: 'Equities' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', category: 'Cybersecurity' },
  { symbol: 'PANW', name: 'Palo Alto Networks', category: 'Cybersecurity' },
  { symbol: 'AA', name: 'Alcoa Corp', category: 'Commodities' },
  { symbol: 'BALL', name: 'Ball Corp', category: 'Commodities' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Copper', category: 'Commodities' },
  { symbol: 'CCJ', name: 'Cameco Uranium', category: 'Commodities' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'Real Estate' },
  { symbol: 'O', name: 'Realty Income REIT', category: 'Real Estate' },
  { symbol: 'SHY', name: '1-3Y Treasury Bond ETF', category: 'Bonds' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'Equities' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'Equities' },
  { symbol: 'IBIT', name: 'iShares Bitcoin ETF', category: 'Crypto' },
  { symbol: 'JPM', name: 'JPMorgan Chase', category: 'Equities' },
  { symbol: 'PEP', name: 'PepsiCo Inc', category: 'Equities' },
  { symbol: 'TSLA', name: 'Tesla Inc', category: 'Equities' },
  { symbol: 'AMZN', name: 'Amazon.com', category: 'Equities' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', category: 'Equities' },
  { symbol: 'META', name: 'Meta Platforms', category: 'Equities' },
];

async function fetchYahooQuote(item: { symbol: string; name: string; category: string }): Promise<LiveQuote | null> {
  try {
    const encoded = encodeURIComponent(item.symbol);
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=5d`,
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(3500) }
    );
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const price = Number(meta.regularMarketPrice);
    const prev = Number(meta.chartPreviousClose || meta.previousClose || price);
    const changePct = prev > 0 ? Number((((price - prev) / prev) * 100).toFixed(2)) : 0;

    return {
      symbol: item.symbol,
      name: item.name,
      price: Number(price.toFixed(2)),
      changePct,
      currency: meta.currency || 'USD',
      category: item.category,
      marketState: meta.marketState,
    };
  } catch {
    return null;
  }
}

async function fetchCoinbaseBtc(): Promise<LiveQuote | null> {
  try {
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const amount = Number(json?.data?.amount);
    if (!Number.isFinite(amount)) return null;
    return {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      price: Number(amount.toFixed(2)),
      changePct: 0,
      currency: 'USD',
      category: 'Crypto',
    };
  } catch {
    return null;
  }
}

async function fetchUsTreasuryRates(): Promise<LiveTreasuryRate[]> {
  try {
    const resp = await fetch(
      'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=10',
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(3800) }
    );
    if (!resp.ok) return [];
    const json: any = await resp.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows
      .filter((r: any) => r?.security_desc && r?.avg_interest_rate_amt)
      .slice(0, 8)
      .map((r: any) => ({
        securityDesc: String(r.security_desc),
        avgInterestRateAmt: Number(r.avg_interest_rate_amt),
        recordDate: String(r.record_date || ''),
      }));
  } catch {
    return [];
  }
}

const SPORTS_NOISE_RE =
  /\b(vs\.?|nba|nfl|nhl|mlb|ufc|atp|wta|fifa|premier league|champions league|la liga|serie a|bundesliga|tennis|soccer|cricket|golf|boxing|ncaa|f1|grand prix|open:|spread:|o\/u|set winner|moneyline|fc |united fc|yokohama)\b/i;
const FINANCE_POLY_RE =
  /\b(fed|fomc|rate|interest|inflation|cpi|pce|gdp|recession|treasury|bond|yield|tariff|s&p|nasdaq|dow|stock|bitcoin|btc|eth|ethereum|solana|crypto|oil|gold|crude|housing|mortgage|ai |openai|nvidia|apple|tesla|microsoft|google|meta|ipo|sec |etf|economy|dollar|china|election|senate|congress|president|tax|debt|shutdown|war|ceasefire|opec)\b/i;

async function fetchLivePolymarkets(): Promise<LivePolymarketContract[]> {
  try {
    const resp = await fetch(
      'https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=80&order=volume24hr&ascending=false',
      { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(4500) }
    );
    if (!resp.ok) return [];
    const list: any = await resp.json();
    if (!Array.isArray(list)) return [];

    const financeMatches: LivePolymarketContract[] = [];
    const otherNonSports: LivePolymarketContract[] = [];

    for (const m of list) {
      if (!m?.question) continue;
      const question = String(m.question).slice(0, 150);
      if (SPORTS_NOISE_RE.test(question)) continue;

      let yesPrice = 0.5;
      let noPrice = 0.5;
      try {
        const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
        if (Array.isArray(prices) && prices.length >= 2) {
          yesPrice = Number(Number(prices[0]).toFixed(2));
          noPrice = Number(Number(prices[1]).toFixed(2));
        }
      } catch {
        // default 0.50
      }
      if (yesPrice <= 0.01 || yesPrice >= 0.99) continue;
      const slug = String(m.slug || m.id || '');
      const item: LivePolymarketContract = {
        id: String(m.id || slug),
        question,
        slug,
        url: slug ? `https://polymarket.com/event/${slug}` : 'https://polymarket.com',
        yesPrice,
        noPrice,
        volume24hr: Math.round(Number(m.volume24hr || m.volume || 0)),
        liquidity: Math.round(Number(m.liquidity || 0)),
        endDate: m.endDate || undefined,
      };
      if (FINANCE_POLY_RE.test(question)) {
        financeMatches.push(item);
      } else {
        otherNonSports.push(item);
      }
    }
    return [...financeMatches, ...otherNonSports].slice(0, 10);
  } catch {
    return [];
  }
}

// ============================================================================
// UNIFIED LIVE AGGREGATOR WITH 4-MINUTE CACHE
// ============================================================================
const CACHE_TTL_MS = 4 * 60 * 1000;
let cachedSnapshot: { data: LiveMarketSnapshot; expiresAt: number } | null = null;
let inflightSnapshot: Promise<LiveMarketSnapshot> | null = null;

export async function getLiveMarketSnapshot(forceRefresh = false): Promise<LiveMarketSnapshot> {
  if (!forceRefresh && cachedSnapshot && Date.now() < cachedSnapshot.expiresAt) {
    return cachedSnapshot.data;
  }
  if (!forceRefresh && inflightSnapshot) {
    return inflightSnapshot;
  }

  inflightSnapshot = (async () => {
    const activeRssSources = TOP_100_FINANCIAL_SOURCES.filter(
      (s) => s.activePoll && (s.type === 'RSS' || s.type === 'ATOM' || s.type === 'NEWS_WIRE')
    );

    const [rssResults, hnStories, quoteResults, btcQuote, treasuryRates, polymarkets] = await Promise.all([
      Promise.all(activeRssSources.map((src) => fetchRssOrAtomFeed(src, 5))),
      fetchHackerNewsLive(),
      Promise.all(QUOTE_SYMBOLS.map((q) => fetchYahooQuote(q))),
      fetchCoinbaseBtc(),
      fetchUsTreasuryRates(),
      fetchLivePolymarkets(),
    ]);

    let activeSourcesSucceeded = 0;
    const allStories: LiveNewsStory[] = [];
    const seenTitles = new Set<string>();

    for (const batch of rssResults) {
      if (batch.length > 0) activeSourcesSucceeded++;
      for (const st of batch) {
        const key = st.title.toLowerCase().slice(0, 60);
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          allStories.push(st);
        }
      }
    }

    if (hnStories.length > 0) {
      activeSourcesSucceeded++;
      for (const st of hnStories) {
        const key = st.title.toLowerCase().slice(0, 60);
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          allStories.push(st);
        }
      }
    }

    // Add live Polymarket top markets as clickable leads too
    if (polymarkets.length > 0) {
      activeSourcesSucceeded++;
      polymarkets.slice(0, 5).forEach((pm) => {
        allStories.push({
          id: `poly-${pm.id}`,
          title: `Polymarket (${Math.round(pm.yesPrice * 100)}¢ YES): ${pm.question}`,
          summary: `Live 24h trading volume $${pm.volume24hr.toLocaleString()} · Liquidity $${pm.liquidity.toLocaleString()} · Implied probability ${Math.round(pm.yesPrice * 100)}%.`,
          source: 'Polymarket Live Gamma API',
          category: 'Prediction & Digital Assets',
          url: pm.url,
          publishedAt: 'Live',
          publishedIso: new Date().toISOString(),
          domain: 'polymarket.com',
          leadType: 'Prediction Market',
        });
      });
    }

    // Sort breaking financial journalism newest first, keeping prediction market entries interleaved after news
    allStories.sort((a, b) => {
      const aPoly = a.leadType === 'Prediction Market' ? 1 : 0;
      const bPoly = b.leadType === 'Prediction Market' ? 1 : 0;
      if (aPoly !== bPoly) return aPoly - bPoly;
      return Date.parse(b.publishedIso) - Date.parse(a.publishedIso);
    });

    const quotes: Record<string, LiveQuote> = {};
    let yahooOk = false;
    for (const q of quoteResults) {
      if (q) {
        quotes[q.symbol] = q;
        yahooOk = true;
      }
    }
    if (yahooOk) activeSourcesSucceeded++;
    if (btcQuote) {
      quotes['BTC-USD'] = btcQuote;
      activeSourcesSucceeded++;
    }
    if (treasuryRates.length > 0) activeSourcesSucceeded++;

    const sectorDefs = [
      { symbol: 'XLK', sector: 'Technology' },
      { symbol: 'XLB', sector: 'Materials & Metals' },
      { symbol: 'XLF', sector: 'Financials' },
      { symbol: 'XLE', sector: 'Energy' },
      { symbol: 'XLRE', sector: 'Real Estate' },
      { symbol: 'TLT', sector: 'US Gov Bonds' },
      { symbol: 'CIBR', sector: 'Cybersecurity' },
      { symbol: 'XLV', sector: 'Healthcare' },
    ];
    const sectorEtfs = sectorDefs
      .filter((s) => quotes[s.symbol])
      .map((s) => ({
        sector: s.sector,
        symbol: s.symbol,
        performance: quotes[s.symbol].changePct,
        price: quotes[s.symbol].price,
      }));

    const secFilings = allStories.filter((s) => s.source.includes('SEC EDGAR'));

    const categoryCounts: Record<string, number> = {};
    for (const st of allStories) {
      categoryCounts[st.category] = (categoryCounts[st.category] || 0) + 1;
    }

    const snapshot: LiveMarketSnapshot = {
      fetchedAt: new Date().toISOString(),
      stories: allStories,
      quotes,
      sectorEtfs,
      treasuryRates,
      polymarkets,
      secFilings,
      activeSourcesSucceeded,
      totalCatalogSources: TOP_100_FINANCIAL_SOURCES.length,
      categoryCounts,
    };

    cachedSnapshot = {
      data: snapshot,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return snapshot;
  })();

  try {
    return await inflightSnapshot;
  } finally {
    inflightSnapshot = null;
  }
}

/** Match live RSS stories & quotes against a user's question to ground the AI agent with real live facts */
export function searchLiveLeadsForQuery(snapshot: LiveMarketSnapshot, query: string, limit = 8): LiveNewsStory[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['the', 'and', 'for', 'with', 'how', 'what', 'why', 'are', 'you', 'can', 'about', 'this', 'that'].includes(w));

  if (tokens.length === 0) return snapshot.stories.slice(0, limit);

  const scored = snapshot.stories.map((story) => {
    const hay = `${story.title} ${story.summary} ${story.source} ${story.category}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 3;
    }
    if (story.publishedAt === 'Live' || story.publishedAt.endsWith('m ago')) score += 1;
    return { story, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.story);
  return top.length >= 3 ? top : [...top, ...snapshot.stories.slice(0, limit - top.length)];
}
