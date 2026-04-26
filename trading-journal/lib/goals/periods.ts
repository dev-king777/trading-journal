import { endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";

export type GoalType = "daily" | "weekly" | "monthly";

export function getGoalPeriod(type: GoalType, now = new Date()) {
  const options = { weekStartsOn: 1 as const };
  if (type === "daily") {
    const start = startOfDay(now);
    return { start, end: start };
  }
  if (type === "weekly") {
    return { start: startOfWeek(now, options), end: endOfWeek(now, options) };
  }
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export function getGoalPeriodKeys(type: GoalType, now = new Date()) {
  const period = getGoalPeriod(type, now);
  return {
    periodStart: format(period.start, "yyyy-MM-dd"),
    periodEnd: format(period.end, "yyyy-MM-dd")
  };
}

export function daysRemaining(type: GoalType, now = new Date()) {
  const { end } = getGoalPeriod(type, now);
  const endOfPeriod = new Date(end);
  endOfPeriod.setHours(23, 59, 59, 999);
  return Math.max(0, Math.ceil((endOfPeriod.getTime() - now.getTime()) / 86_400_000));
}
