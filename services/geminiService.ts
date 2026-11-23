import {
  MarketReport,
  ChatMessage,
  PlaidStatus,
  PalThesisSession,
  HypothesisWizardConfig,
  RostrHarnessRun,
  DiagridVirtualActor,
  SandboxExecutionResult,
  ComposioIntegration,
} from '../types';

export const fetchMarketAnalysis = async (
  thesisPrompt?: string,
  thesisLinks?: string[],
  wizardConfig?: Partial<HypothesisWizardConfig>
): Promise<MarketReport> => {
  const response = await fetch('/api/gemini/analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      thesis: thesisPrompt,
      links: thesisLinks,
      wizardConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const data: MarketReport = await response.json();
  return data;
};

export const executeRostrHarness = async (
  wizardConfig: HypothesisWizardConfig
): Promise<{
  rostrRun: RostrHarnessRun;
  palSession: PalThesisSession;
  wizardConfig: HypothesisWizardConfig;
  recommendations: any[];
  secondOrderChains: any[];
  omnichannelNodes: any[];
}> => {
  const response = await fetch('/api/rostr/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wizardConfig }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute ROSTR Autonomous Agent OS harness');
  }

  return response.json();
};

export const raiseDiagridActorEvent = async (
  action: 'RESUME_APPROVED' | 'SUSPEND_ZERO_COMPUTE',
  payload?: string
): Promise<DiagridVirtualActor> => {
  const response = await fetch('/api/rostr/diagrid/raise-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    throw new Error('Failed to send /raiseEvent to Diagrid Virtual Actor');
  }

  const data = await response.json();
  return data.diagridActor;
};

export const executeSandboxSkill = async (
  skillId: string,
  inputPayload: string
): Promise<SandboxExecutionResult> => {
  const response = await fetch('/api/sandbox/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillId, inputPayload }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute ROSTR skill in sandbox');
  }

  return response.json();
};

export const fetchComposioIntegrations = async (): Promise<ComposioIntegration[]> => {
  const response = await fetch('/api/composio/integrations');
  if (!response.ok) {
    throw new Error('Failed to load Composio integrations');
  }
  const data = await response.json();
  return data.integrations;
};

export const toggleComposioIntegration = async (id: string): Promise<ComposioIntegration[]> => {
  const response = await fetch('/api/composio/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error('Failed to toggle Composio connection');
  }
  const data = await response.json();
  return data.integrations;
};

export const executeComposioAction = async (
  id: string,
  action: string
): Promise<ComposioIntegration[]> => {
  const response = await fetch('/api/composio/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action }),
  });
  if (!response.ok) {
    throw new Error('Failed to execute Composio action');
  }
  const data = await response.json();
  return data.integrations;
};

export const fetchSupabaseStatus = async (): Promise<any> => {
  const response = await fetch('/api/supabase/status');
  if (!response.ok) {
    throw new Error('Failed to fetch Supabase database status');
  }
  return response.json();
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

export const fetchGrowthSimulation = async (
  initialCapital: number = 100,
  monthlyContribution: number = 25
): Promise<any> => {
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