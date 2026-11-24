// RAG DAL three-tier source credibility (paper §5.2).
//   Tier 1  Primary & authoritative   credibility 1.00
//   Tier 2  Verified & editorial      credibility 0.75
//   Tier 3  Community & UGC           credibility 0.40
// Adapted for markets: regulators, central banks, statistics agencies,
// exchanges and company filings are Tier 1.
import type { Tier } from './types.js';

export const TIER_CREDIBILITY: Record<Tier, number> = { 1: 1.0, 2: 0.75, 3: 0.4 };
export const TIER_LABEL: Record<Tier, string> = { 1: 'Official source', 2: 'Major news', 3: 'Community' };

const TIER1 = [
  'sec.gov', 'investor.gov', 'finra.org', 'federalreserve.gov', 'newyorkfed.org', 'stlouisfed.org',
  'treasury.gov', 'bls.gov', 'bea.gov', 'census.gov', 'cftc.gov', 'fdic.gov', 'irs.gov', 'eia.gov',
  'usda.gov', 'imf.org', 'worldbank.org', 'bis.org', 'oecd.org', 'ecb.europa.eu', 'bankofengland.co.uk',
  'cmegroup.com', 'nasdaq.com', 'nyse.com', 'theice.com', 'lme.com', 'cboe.com', 'sifma.org',
  'arxiv.org', 'nber.org', 'ssrn.com', 'britannica.com',
];

const TIER2 = [
  'reuters.com', 'apnews.com', 'bloomberg.com', 'wsj.com', 'ft.com', 'nytimes.com', 'economist.com',
  'cnbc.com', 'bbc.com', 'bbc.co.uk', 'barrons.com', 'marketwatch.com', 'morningstar.com',
  'spglobal.com', 'moodys.com', 'fitchratings.com', 'axios.com', 'washingtonpost.com', 'theguardian.com',
  'forbes.com', 'fortune.com', 'businessinsider.com', 'investopedia.com', 'kiplinger.com', 'nerdwallet.com',
  'techcrunch.com', 'spectrum.ieee.org', 'nature.com', 'science.org', 'gartner.com', 'mckinsey.com',
  'brookings.edu', 'piie.com', 'coindesk.com', 'theblock.co',
];

function matches(domain: string, list: string[]): boolean {
  return list.some((d) => domain === d || domain.endsWith('.' + d));
}

export function normalizeDomain(input: string): string {
  const s = (input || '').trim().toLowerCase();
  try {
    if (s.startsWith('http')) return new URL(s).hostname.replace(/^www\./, '');
  } catch {
    /* fall through */
  }
  return s.replace(/^www\./, '').split('/')[0];
}

/** Classify a domain into a credibility tier. */
export function tierOf(domainInput: string): Tier {
  const domain = normalizeDomain(domainInput);
  if (!domain) return 3;
  if (matches(domain, TIER1)) return 1;
  // Government and university sites (paper: ".gov, university repositories").
  if (/\.gov$|\.gov\.[a-z]{2}$|\.mil$|\.edu$|\.int$/.test(domain)) return 1;
  // Company investor-relations sites publish primary filings and results.
  if (/^(ir|investor|investors)\./.test(domain)) return 1;
  if (matches(domain, TIER2)) return 2;
  return 3;
}

/**
 * Gemini grounding returns a redirect URL plus a title that is usually the
 * publisher's domain. Use whichever looks like the real publisher.
 */
export function publisherDomain(uri: string, title?: string): string {
  const fromUri = normalizeDomain(uri);
  const looksLikeDomain = (t?: string) => !!t && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(t.trim());
  if (fromUri.includes('vertexaisearch') || fromUri.includes('googleusercontent') || !fromUri) {
    return looksLikeDomain(title) ? normalizeDomain(title!) : fromUri;
  }
  return fromUri;
}
