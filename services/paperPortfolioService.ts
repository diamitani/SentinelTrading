// ============================================================================
// Virtual Paper Portfolio Engine (Browser-persistent per user / guest)
// Lets everyday traders pick a realistic starting budget ($100 to $50,000+),
// place simulated paper trades, track live virtual P&L, close positions, and
// reset anytime—with zero real money at risk.
// ============================================================================

export interface PaperPosition {
  id: string;
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  instrument: string;
  shares: number;
  avgEntryPrice: number;
  currentPrice: number;
  costBasis: number;
  openedAt: string;
  notes?: string;
}

export interface ClosedPaperTrade {
  id: string;
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  shares: number;
  entryPrice: number;
  exitPrice: number;
  costBasis: number;
  proceeds: number;
  realizedPnL: number;
  realizedPnLPct: number;
  closedAt: string;
}

export interface PaperPortfolioState {
  startingBudget: number;
  cashBalance: number;
  positions: PaperPosition[];
  closedTrades: ClosedPaperTrade[];
  linkedBroker: string;
  budgetChosen: boolean;
  lastUpdated: string;
}

export interface PaperPortfolioSummary {
  totalValue: number;
  cashBalance: number;
  holdingsValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  totalReturnPct: number;
  totalPnL: number;
  totalPnLPct: number;
}

export const EVERYDAY_BUDGET_PRESETS = [100, 500, 1000, 5000, 10000, 25000, 50000] as const;

export const CONSUMER_BROKERS = [
  'Paper Trading Wallet (Built-in)',
  'Fidelity',
  'Charles Schwab',
  'Robinhood',
  'Vanguard',
  'Webull',
  'Interactive Brokers',
  'Coinbase',
] as const;

const storageKey = (userId: string) => `sentinel_paper_portfolio_v2_${userId}`;

export function createInitialPaperPortfolio(
  startingBudget = 1000,
  budgetChosen = false
): PaperPortfolioState {
  const safeBudget = Math.max(25, Math.round(Number(startingBudget) || 1000));
  return {
    startingBudget: safeBudget,
    cashBalance: safeBudget,
    positions: [],
    closedTrades: [],
    linkedBroker: 'Paper Trading Wallet (Built-in)',
    budgetChosen,
    lastUpdated: new Date().toISOString(),
  };
}

export function loadPaperPortfolio(userId: string, defaultBudget = 1000): PaperPortfolioState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as PaperPortfolioState;
      if (parsed && typeof parsed.cashBalance === 'number' && Array.isArray(parsed.positions)) {
        return {
          ...createInitialPaperPortfolio(parsed.startingBudget || defaultBudget, true),
          ...parsed,
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return createInitialPaperPortfolio(defaultBudget, false);
}

export function savePaperPortfolio(userId: string, state: PaperPortfolioState): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function migratePaperPortfolio(fromUserId: string, toUserId: string): void {
  if (!fromUserId || !toUserId || fromUserId === toUserId) return;
  try {
    const existingDest = localStorage.getItem(storageKey(toUserId));
    if (existingDest) return;
    const guestRaw = localStorage.getItem(storageKey(fromUserId));
    if (guestRaw) {
      localStorage.setItem(storageKey(toUserId), guestRaw);
    }
    const onboardingKeyFrom = `sentinel_onboarding_${fromUserId}`;
    const onboardingKeyTo = `sentinel_onboarding_${toUserId}`;
    const onboardingRaw = localStorage.getItem(onboardingKeyFrom);
    if (onboardingRaw && !localStorage.getItem(onboardingKeyTo)) {
      localStorage.setItem(onboardingKeyTo, onboardingRaw);
    }
  } catch {
    // ignore migration errors
  }
}

export function computePortfolioSummary(state: PaperPortfolioState): PaperPortfolioSummary {
  const holdingsValue = state.positions.reduce(
    (sum, p) => sum + p.shares * p.currentPrice,
    0
  );
  const totalCostBasis = state.positions.reduce((sum, p) => sum + p.costBasis, 0);
  const unrealizedPnL = holdingsValue - totalCostBasis;
  const unrealizedPnLPct =
    totalCostBasis > 0 ? Number(((unrealizedPnL / totalCostBasis) * 100).toFixed(2)) : 0;
  const realizedPnL = state.closedTrades.reduce((sum, t) => sum + t.realizedPnL, 0);
  const totalValue = Number((state.cashBalance + holdingsValue).toFixed(2));
  const totalReturnPct =
    state.startingBudget > 0
      ? Number((((totalValue - state.startingBudget) / state.startingBudget) * 100).toFixed(2))
      : 0;

  const totalPnL = Number((totalValue - state.startingBudget).toFixed(2));
  return {
    totalValue,
    cashBalance: Number(state.cashBalance.toFixed(2)),
    holdingsValue: Number(holdingsValue.toFixed(2)),
    unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
    unrealizedPnLPct,
    realizedPnL: Number(realizedPnL.toFixed(2)),
    totalReturnPct,
    totalPnL,
    totalPnLPct: totalReturnPct,
  };
}

export interface PaperTradeOrderInput {
  ticker: string;
  name?: string;
  action?: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  instrument?: string;
  entryPrice?: number;
  notes?: string;
}

export function placePaperTrade(
  state: PaperPortfolioState,
  order: PaperTradeOrderInput,
  dollarAmount: number
): PaperPortfolioState {
  const amount = Number(Number(dollarAmount).toFixed(2));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a valid dollar amount greater than $0.');
  }
  if (amount > state.cashBalance + 0.001) {
    throw new Error(
      `Not enough virtual cash. You have $${state.cashBalance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} available.`
    );
  }

  const price = Math.max(0.01, Number(order.entryPrice) || 50);
  const addedShares = Number((amount / price).toFixed(4));
  const ticker = order.ticker.toUpperCase();
  const action = order.action || 'BUY';
  const instrument = order.instrument || (action === 'CALL' || action === 'PUT' ? 'Option' : 'Stock');

  const existingIdx = state.positions.findIndex(
    (p) => p.ticker === ticker && p.action === action
  );

  let nextPositions: PaperPosition[];
  if (existingIdx >= 0) {
    const existing = state.positions[existingIdx];
    const nextShares = Number((existing.shares + addedShares).toFixed(4));
    const nextCostBasis = Number((existing.costBasis + amount).toFixed(2));
    const nextAvgEntry = Number((nextCostBasis / nextShares).toFixed(4));
    const updated: PaperPosition = {
      ...existing,
      shares: nextShares,
      costBasis: nextCostBasis,
      avgEntryPrice: nextAvgEntry,
      currentPrice: price,
      notes: order.notes || existing.notes,
    };
    nextPositions = state.positions.map((p, idx) => (idx === existingIdx ? updated : p));
  } else {
    const newPosition: PaperPosition = {
      id: `pos_${ticker}_${Date.now().toString(36)}`,
      ticker,
      name: order.name || ticker,
      action,
      instrument,
      shares: addedShares,
      avgEntryPrice: price,
      currentPrice: price,
      costBasis: amount,
      openedAt: new Date().toISOString(),
      notes: order.notes,
    };
    nextPositions = [newPosition, ...state.positions];
  }

  return {
    ...state,
    cashBalance: Number(Math.max(0, state.cashBalance - amount).toFixed(2)),
    positions: nextPositions,
    budgetChosen: true,
    lastUpdated: new Date().toISOString(),
  };
}

export function closePaperPosition(
  state: PaperPortfolioState,
  positionId: string
): { nextState: PaperPortfolioState; closedTrade: ClosedPaperTrade | null } {
  const pos = state.positions.find((p) => p.id === positionId);
  if (!pos) return { nextState: state, closedTrade: null };

  const proceeds = Number((pos.shares * pos.currentPrice).toFixed(2));
  const realizedPnL = Number((proceeds - pos.costBasis).toFixed(2));
  const realizedPnLPct =
    pos.costBasis > 0 ? Number(((realizedPnL / pos.costBasis) * 100).toFixed(2)) : 0;

  const closedTrade: ClosedPaperTrade = {
    id: `cls_${pos.ticker}_${Date.now().toString(36)}`,
    ticker: pos.ticker,
    name: pos.name,
    action: pos.action,
    shares: pos.shares,
    entryPrice: pos.avgEntryPrice,
    exitPrice: pos.currentPrice,
    costBasis: pos.costBasis,
    proceeds,
    realizedPnL,
    realizedPnLPct,
    closedAt: new Date().toISOString(),
  };

  return {
    closedTrade,
    nextState: {
      ...state,
      cashBalance: Number((state.cashBalance + proceeds).toFixed(2)),
      positions: state.positions.filter((p) => p.id !== positionId),
      closedTrades: [closedTrade, ...state.closedTrades].slice(0, 50),
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function simulatePriceRefresh(state: PaperPortfolioState): PaperPortfolioState {
  if (state.positions.length === 0) {
    return { ...state, lastUpdated: new Date().toISOString() };
  }
  const nextPositions = state.positions.map((pos) => {
    const pctMove = (Math.random() * 0.042) - 0.018; // -1.8% to +2.4% simulated move
    const nextPrice = Number(Math.max(0.01, pos.currentPrice * (1 + pctMove)).toFixed(2));
    return { ...pos, currentPrice: nextPrice };
  });
  return {
    ...state,
    positions: nextPositions,
    lastUpdated: new Date().toISOString(),
  };
}

export function resetPaperBudget(
  state: PaperPortfolioState,
  newStartingBudget: number,
  clearPositions = false
): PaperPortfolioState {
  const safeBudget = Math.max(25, Math.round(Number(newStartingBudget) || 1000));
  if (clearPositions || state.positions.length === 0) {
    return {
      ...state,
      startingBudget: safeBudget,
      cashBalance: safeBudget,
      positions: [],
      closedTrades: clearPositions ? [] : state.closedTrades,
      budgetChosen: true,
      lastUpdated: new Date().toISOString(),
    };
  }
  const delta = safeBudget - state.startingBudget;
  return {
    ...state,
    startingBudget: safeBudget,
    cashBalance: Number(Math.max(0, state.cashBalance + delta).toFixed(2)),
    budgetChosen: true,
    lastUpdated: new Date().toISOString(),
  };
}

export function linkConsumerBroker(
  state: PaperPortfolioState,
  brokerName: string
): PaperPortfolioState {
  return {
    ...state,
    linkedBroker: brokerName,
    lastUpdated: new Date().toISOString(),
  };
}
