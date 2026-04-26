import { differenceInCalendarDays, endOfMonth, startOfMonth, subDays } from "date-fns";

import { calculateTotalPnl, calculateWinRate, calculateAverageRR } from "@/lib/stats/engine";
import type { TradeRecord } from "@/types/trading";

export type ProjectionWindow = 30 | 60 | 90;

export function calculateProjection(trades: TradeRecord[], window: ProjectionWindow = 30) {
  const now = new Date();
  const cutoff = subDays(now, window);
  const recent = trades.filter((trade) => new Date(trade.openTime) >= cutoff && trade.result !== "open");
  const pnl = calculateTotalPnl(recent);
  const activeDays = Math.max(1, differenceInCalendarDays(now, cutoff));
  const dailyPace = pnl / activeDays;
  const daysInMonth = Math.max(1, differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1);
  const elapsedMonthDays = Math.max(1, differenceInCalendarDays(now, startOfMonth(now)) + 1);
  const monthEndProjection = dailyPace * daysInMonth;
  const currentMonthPnl = calculateTotalPnl(
    trades.filter((trade) => new Date(trade.openTime) >= startOfMonth(now) && trade.result !== "open")
  );
  const currentPaceProjection = (currentMonthPnl / elapsedMonthDays) * daysInMonth;

  return {
    window,
    trades: recent.length,
    pnl: Number(pnl.toFixed(2)),
    dailyPace: Number(dailyPace.toFixed(2)),
    monthEndProjection: Number(monthEndProjection.toFixed(2)),
    currentPaceProjection: Number(currentPaceProjection.toFixed(2)),
    winRate: calculateWinRate(recent),
    averageRiskReward: calculateAverageRR(recent),
    consistencyMessage:
      recent.length < 100
        ? "Stats are directional. Build toward a 100-trade sample before treating projections as reliable."
        : "Sample size is mature enough to treat the projection as a useful baseline."
  };
}
