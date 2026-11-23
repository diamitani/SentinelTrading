import { MarketReport, ChatMessage, PlaidStatus, PalThesisSession } from '../types';

export const fetchMarketAnalysis = async (
  thesisPrompt?: string,
  thesisLinks?: string[]
): Promise<MarketReport> => {
  const response = await fetch('/api/gemini/analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      thesis: thesisPrompt,
      links: thesisLinks,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const data: MarketReport = await response.json();
  return data;
};

export const submitPalThesis = async (
  prompt: string,
  links: string[],
  riskTolerance: string,
  capitalBudget: number
): Promise<PalThesisSession> => {
  const response = await fetch('/api/pal/intake', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      links,
      riskTolerance,
      capitalBudget,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to compile thesis through PAL intake engine');
  }

  const resJson = await response.json();
  return resJson.palSession;
};

export const fetchPlaidStatus = async (): Promise<PlaidStatus> => {
  const response = await fetch('/api/plaid/status');
  if (!response.ok) {
    throw new Error('Failed to retrieve Plaid institutional link status');
  }
  return response.json();
};

export const syncPlaidHoldings = async (): Promise<PlaidStatus> => {
  const response = await fetch('/api/plaid/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to sync Plaid balances and mark-to-market prices');
  }
  const data = await response.json();
  return data.state;
};

export const linkPlaidInstitution = async (institutionName: string): Promise<PlaidStatus> => {
  const response = await fetch('/api/plaid/item/public_token/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_token: 'public-sandbox-' + Math.random().toString(36).substring(2, 10),
      institution_name: institutionName,
    }),
  });
  if (!response.ok) {
    throw new Error('Plaid link exchange rejected');
  }
  return fetchPlaidStatus();
};

export const queryReportAgent = async (
  report: MarketReport,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        report,
        history,
        newMessage,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return err.text || 'Link failure. Unable to query trading core.';
    }

    const data = await response.json();
    return data.text || 'Quant terminal operational.';
  } catch (error) {
    console.error('Chat Agent Request Error:', error);
    return 'Link failure. Unable to query trading core.';
  }
};

export const fetchQaAuditReport = async (): Promise<any> => {
  const response = await fetch('/api/qa/audit');
  if (!response.ok) {
    throw new Error('Failed to fetch QA audit report');
  }
  return response.json();
};

export const fetchGrowthSimulation = async (initialCapital: number = 100, monthlyContribution: number = 25): Promise<any> => {
  const response = await fetch('/api/growth/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initialCapital,
      monthlyContribution,
      timeframeMonths: 12,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to run growth simulation');
  }
  return response.json();
};