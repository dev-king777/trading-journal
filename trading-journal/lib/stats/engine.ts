import { format, getDay, parseISO } from "date-fns";

import type { TradeRecord, TradeResult, TradeSession } from "@/types/trading";

export type GroupStats = {
  key: string;
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  totalPnl: number;
  averageRiskReward: number;
};

export type EquityPoint = {
  date: string;
  pnl: number;
  cumulativePnl: number;
};

export type CalendarDay = {
  date: string;
  pnl: number;
  trades: number;
  result: "profit" | "loss" | "breakeven" | "none";
  intensity: number;
};

export type StreakStats = {
  currentType: "win" | "loss" | "none";
  currentCount: number;
  maxWins: number;
  maxLosses: number;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const sessionLabels: Record<TradeSession, string> = {
  asian: "Asian",
  london: "London",
  ny: "New York",
  overlap: "Overlap"
};

function closedTrades(trades: TradeRecord[]) {
  return trades.filter((trade) => trade.result !== "open");
}

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function calculateWinRate(trades: TradeRecord[]) {
  const closed = closedTrades(trades);
  if (!closed.length) return 0;
  return round((closed.filter((trade) => trade.result === "win").length / closed.length) * 100, 1);
}

export function calculateProfitFactor(trades: TradeRecord[]) {
  const closed = closedTrades(trades);
  const grossProfit = closed.filter((trade) => trade.pnlAmount > 0).reduce((sum, trade) => sum + trade.pnlAmount, 0);
  const grossLoss = Math.abs(closed.filter((trade) => trade.pnlAmount < 0).reduce((sum, trade) => sum + trade.pnlAmount, 0));
  if (!grossLoss) return grossProfit > 0 ? 99 : 0;
  return round(grossProfit / grossLoss, 2);
}

export function calculateAverageRR(trades: TradeRecord[]) {
  const closed = closedTrades(trades);
  if (!closed.length) return 0;
  return round(closed.reduce((sum, trade) => sum + trade.riskRewardRatio, 0) / closed.length, 2);
}

export function calculateMaxDrawdown(trades: TradeRecord[]) {
  const curve = calculateEquityCurve(trades);
  let peak = 0;
  let maxDrawdown = 0;

  for (const point of curve) {
    peak = Math.max(peak, point.cumulativePnl);
    maxDrawdown = Math.min(maxDrawdown, point.cumulativePnl - peak);
  }

  return round(Math.abs(maxDrawdown), 2);
}

export function calculateStreaks(trades: TradeRecord[]): StreakStats {
  const closed = [...closedTrades(trades)].sort((a, b) => new Date(a.closeTime ?? a.openTime).getTime() - new Date(b.closeTime ?? b.openTime).getTime());
  let currentType: StreakStats["currentType"] = "none";
  let currentCount = 0;
  let maxWins = 0;
  let maxLosses = 0;
  let runningType: TradeResult | null = null;
  let runningCount = 0;

  for (const trade of closed) {
    if (trade.result === "breakeven") {
      runningType = null;
      runningCount = 0;
      continue;
    }

    if (trade.result === runningType) {
      runningCount += 1;
    } else {
      runningType = trade.result;
      runningCount = 1;
    }

    if (trade.result === "win") maxWins = Math.max(maxWins, runningCount);
    if (trade.result === "loss") maxLosses = Math.max(maxLosses, runningCount);
  }

  const last = [...closed].reverse().find((trade) => trade.result === "win" || trade.result === "loss");
  if (last) {
    currentType = last.result === "win" ? "win" : "loss";
    currentCount = 0;
    for (const trade of [...closed].reverse()) {
      if (trade.result !== currentType) break;
      currentCount += 1;
    }
  }

  return { currentType, currentCount, maxWins, maxLosses };
}

function groupTrades(trades: TradeRecord[], getKey: (trade: TradeRecord) => string, getLabel = (key: string) => key): GroupStats[] {
  const groups = new Map<string, TradeRecord[]>();

  for (const trade of closedTrades(trades)) {
    const key = getKey(trade);
    groups.set(key, [...(groups.get(key) ?? []), trade]);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      key,
      label: getLabel(key),
      trades: group.length,
      wins: group.filter((trade) => trade.result === "win").length,
      losses: group.filter((trade) => trade.result === "loss").length,
      winRate: calculateWinRate(group),
      profitFactor: calculateProfitFactor(group),
      totalPnl: round(group.reduce((sum, trade) => sum + trade.pnlAmount, 0), 2),
      averageRiskReward: calculateAverageRR(group)
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

export function calculateBySession(trades: TradeRecord[]) {
  return groupTrades(trades, (trade) => trade.session, (key) => sessionLabels[key as TradeSession] ?? key);
}

export function calculateByPair(trades: TradeRecord[]) {
  return groupTrades(trades, (trade) => trade.pair);
}

export function calculateByDayOfWeek(trades: TradeRecord[]) {
  return groupTrades(trades, (trade) => String(getDay(parseISO(trade.openTime))), (key) => dayLabels[Number(key)] ?? key).sort((a, b) => Number(a.key) - Number(b.key));
}

export function calculateByStrategy(trades: TradeRecord[]) {
  const expanded = closedTrades(trades).flatMap((trade) => trade.strategyTags.map((tag) => ({ ...trade, strategyTags: [tag] })));
  return groupTrades(expanded, (trade) => trade.strategyTags[0] ?? "Untagged");
}

export function calculateByEmotion(trades: TradeRecord[]) {
  return groupTrades(trades.filter((trade) => trade.emotionalState), (trade) => trade.emotionalState ?? "Unknown");
}

export function calculateEquityCurve(trades: TradeRecord[]): EquityPoint[] {
  const daily = new Map<string, number>();

  for (const trade of closedTrades(trades)) {
    const key = format(parseISO(trade.closeTime ?? trade.openTime), "yyyy-MM-dd");
    daily.set(key, round((daily.get(key) ?? 0) + trade.pnlAmount, 2));
  }

  let cumulativePnl = 0;
  return Array.from(daily.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => {
      cumulativePnl = round(cumulativePnl + pnl, 2);
      return { date, pnl, cumulativePnl };
    });
}

export function calculateCalendarData(trades: TradeRecord[]): CalendarDay[] {
  const daily = new Map<string, { pnl: number; trades: number }>();

  for (const trade of closedTrades(trades)) {
    const key = format(parseISO(trade.closeTime ?? trade.openTime), "yyyy-MM-dd");
    const current = daily.get(key) ?? { pnl: 0, trades: 0 };
    daily.set(key, { pnl: round(current.pnl + trade.pnlAmount, 2), trades: current.trades + 1 });
  }

  const maxAbs = Math.max(...Array.from(daily.values()).map((value) => Math.abs(value.pnl)), 1);

  return Array.from(daily.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      pnl: value.pnl,
      trades: value.trades,
      result: value.pnl > 0 ? "profit" : value.pnl < 0 ? "loss" : "breakeven",
      intensity: Math.max(0.15, Math.min(1, Math.abs(value.pnl) / maxAbs))
    }));
}

export function calculateBiggestWinLoss(trades: TradeRecord[]) {
  const closed = closedTrades(trades);
  const biggestWin = closed.filter((trade) => trade.pnlAmount > 0).sort((a, b) => b.pnlAmount - a.pnlAmount)[0] ?? null;
  const biggestLoss = closed.filter((trade) => trade.pnlAmount < 0).sort((a, b) => a.pnlAmount - b.pnlAmount)[0] ?? null;
  const averageWin = closed.filter((trade) => trade.pnlAmount > 0);
  const averageLoss = closed.filter((trade) => trade.pnlAmount < 0);

  return {
    biggestWin,
    biggestLoss,
    averageWin: averageWin.length ? round(averageWin.reduce((sum, trade) => sum + trade.pnlAmount, 0) / averageWin.length, 2) : 0,
    averageLoss: averageLoss.length ? round(averageLoss.reduce((sum, trade) => sum + trade.pnlAmount, 0) / averageLoss.length, 2) : 0
  };
}

export function calculateTotalPnl(trades: TradeRecord[]) {
  return round(closedTrades(trades).reduce((sum, trade) => sum + trade.pnlAmount, 0), 2);
}

export function calculateOverview(trades: TradeRecord[]) {
  const closed = closedTrades(trades);
  const streaks = calculateStreaks(trades);
  const bySession = calculateBySession(trades);
  const byPair = calculateByPair(trades);
  const byDay = calculateByDayOfWeek(trades);

  return {
    totalTrades: closed.length,
    totalPnl: calculateTotalPnl(trades),
    winRate: calculateWinRate(trades),
    lossRate: closed.length ? round((closed.filter((trade) => trade.result === "loss").length / closed.length) * 100, 1) : 0,
    profitFactor: calculateProfitFactor(trades),
    averageRiskReward: calculateAverageRR(trades),
    maxDrawdown: calculateMaxDrawdown(trades),
    streaks,
    bestSession: bySession[0] ?? null,
    bestPair: byPair[0] ?? null,
    bestDay: byDay[0] ?? null,
    ...calculateBiggestWinLoss(trades)
  };
}
