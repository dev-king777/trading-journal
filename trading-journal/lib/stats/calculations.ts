import type { Direction, TradeRecord, TradeSession } from "@/types/trading";
import { calculateOverview } from "./engine";

const PIP_VALUE_BY_PAIR: Record<string, number> = {
  EURUSD: 10,
  GBPUSD: 10,
  USDJPY: 9.1,
  XAUUSD: 1,
  BTCUSD: 1,
  ETHUSD: 1,
  NAS100: 1,
  US30: 1
};

export function calculateRiskRewardRatio(entry: number, stopLoss: number | null, takeProfit: number | null) {
  if (!stopLoss || !takeProfit) return 0;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  return risk === 0 ? 0 : Number((reward / risk).toFixed(2));
}

export function deriveSession(openTime: Date, timeZone = "UTC"): TradeSession {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone
  }).format(openTime));

  if (hour >= 0 && hour < 7) return "asian";
  if (hour >= 7 && hour < 12) return "london";
  if (hour >= 12 && hour < 16) return "overlap";
  return "ny";
}

export function calculateTradePnl(input: {
  pair: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number | null;
  lotSize: number;
  accountBalance: number;
}) {
  if (!input.exitPrice) {
    return { pnlAmount: 0, pnlPips: 0, pnlPercent: 0 };
  }

  const directionMultiplier = input.direction === "buy" ? 1 : -1;
  const pipSize = input.pair.includes("JPY") ? 0.01 : input.pair.includes("XAU") ? 0.1 : 0.0001;
  const pipValue = PIP_VALUE_BY_PAIR[input.pair] ?? 1;
  const pnlPips = ((input.exitPrice - input.entryPrice) / pipSize) * directionMultiplier;
  const pnlAmount = pnlPips * input.lotSize * pipValue;
  const pnlPercent = input.accountBalance > 0 ? (pnlAmount / input.accountBalance) * 100 : 0;

  return {
    pnlAmount: Number(pnlAmount.toFixed(2)),
    pnlPips: Number(pnlPips.toFixed(1)),
    pnlPercent: Number(pnlPercent.toFixed(2))
  };
}

export function calculateRiskPercent(input: {
  pair: string;
  entryPrice: number;
  stopLoss: number | null;
  lotSize: number;
  accountBalance: number;
}) {
  if (!input.stopLoss) return 0;
  const pipSize = input.pair.includes("JPY") ? 0.01 : input.pair.includes("XAU") ? 0.1 : 0.0001;
  const pipValue = PIP_VALUE_BY_PAIR[input.pair] ?? 1;
  const riskPips = Math.abs(input.entryPrice - input.stopLoss) / pipSize;
  const riskAmount = riskPips * input.lotSize * pipValue;
  return input.accountBalance > 0 ? Number(((riskAmount / input.accountBalance) * 100).toFixed(2)) : 0;
}

export function inferResult(pnlAmount: number): TradeRecord["result"] {
  if (pnlAmount > 0) return "win";
  if (pnlAmount < 0) return "loss";
  return "breakeven";
}

export function calculateOverviewStats(trades: TradeRecord[]) {
  return calculateOverview(trades);
}
