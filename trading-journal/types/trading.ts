export type Direction = "buy" | "sell";
export type TradeSession = "asian" | "london" | "ny" | "overlap";
export type TradeResult = "win" | "loss" | "breakeven" | "open";
export type AccountType = "personal";

export type TradeRecord = {
  id: string;
  externalId: string | null;
  userId: string;
  accountId: string;
  pair: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  lotSize: number;
  riskPercent: number;
  riskRewardRatio: number;
  openTime: string;
  closeTime: string | null;
  session: TradeSession;
  result: TradeResult;
  pnlAmount: number;
  calculatedPnlAmount: number | null;
  manualPnlAmount: number | null;
  pnlPips: number;
  commission: number;
  swap: number;
  pnlPercent: number;
  strategyTags: string[];
  notes: string | null;
  screenshotUrl: string | null;
  emotionalState: string | null;
  mistakes: string[];
  checklistPassed: boolean;
  isBacktest: boolean;
  createdAt: string;
};

export type AccountRecord = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  startingBalance: number;
  currentBalance: number;
  currency: string;
  maxDrawdownRule: number | null;
  dailyLossRule: number | null;
  profitTarget: number | null;
  createdAt: string;
};

export type GoalRecord = {
  id: string;
  userId: string;
  accountId: string;
  type: "daily" | "weekly" | "monthly";
  targetAmount: number | null;
  lossLimitAmount: number | null;
  targetPercent: number | null;
  periodStart: string;
  periodEnd: string;
  achieved: boolean;
};

export type StrategyTagRecord = {
  id: string;
  userId: string;
  name: string;
  color: string;
  description: string | null;
};

export type ChecklistItemRecord = {
  id: string;
  userId: string;
  label: string;
  order: number;
};
