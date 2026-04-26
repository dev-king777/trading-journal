import { calculateBySession, calculateOverview } from "@/lib/stats/engine";
import type { TradeRecord } from "@/types/trading";

export function getRuleBasedInsight(trades: TradeRecord[]) {
  if (!trades.length) {
    return "Log your first trades to start seeing local performance insights.";
  }

  const stats = calculateOverview(trades);
  const sessions = calculateBySession(trades).filter((item) => item.trades > 0);
  const bestSession = sessions.sort((a, b) => b.totalPnl - a.totalPnl)[0];

  if (stats.streaks.currentType === "loss" && stats.streaks.currentCount >= 2) {
    return `You are on a ${stats.streaks.currentCount}-trade losing streak. Reduce size and review screenshots before the next entry.`;
  }

  if (bestSession) {
    return `${bestSession.label} is currently your strongest session with ${bestSession.winRate}% win rate and ${bestSession.profitFactor} profit factor.`;
  }

  return `Your win rate is ${stats.winRate.toFixed(1)}% across ${stats.totalTrades} closed trades. Keep logging consistently before changing rules.`;
}
