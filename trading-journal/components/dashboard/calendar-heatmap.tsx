"use client";

import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { memo, useMemo } from "react";

import type { CalendarDay } from "@/lib/stats/engine";
import { cn, formatCurrency } from "@/lib/utils";

export const CalendarHeatmap = memo(function CalendarHeatmap({ data, month }: { data: CalendarDay[]; month?: Date }) {
  const currentMonth = useMemo(() => month ?? new Date(), [month]);
  const byDate = useMemo(() => new Map(data.map((day) => [day.date, day])), [data]);
  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);
  const blanks = useMemo(() => Array.from({ length: getDay(startOfMonth(currentMonth)) }), [currentMonth]);

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, index) => <div key={`blank-${index}`} />)}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const entry = byDate.get(key);
          const opacity = entry?.intensity ?? 0.1;
          return (
            <div
              key={key}
              title={entry ? `${key}: ${formatCurrency(entry.pnl)} across ${entry.trades} trades` : `${key}: no trades`}
              className={cn(
                "flex aspect-square min-h-20 flex-col justify-between rounded-md border border-white/5 p-2 transition-colors hover:border-primary/50",
                !entry && "bg-white/[0.04]"
              )}
              style={{
                backgroundColor: entry?.result === "profit"
                  ? `rgba(0,255,170,${opacity})`
                  : entry?.result === "loss"
                    ? `rgba(255,77,109,${opacity})`
                    : entry?.result === "breakeven"
                      ? `rgba(255,165,0,${opacity})`
                      : undefined
              }}
            >
              <span className="text-xs font-medium text-white/70">{format(day, "d")}</span>
              {entry ? (
                <span className="number text-sm font-semibold text-white">
                  {formatCurrency(entry.pnl)}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">No trades</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
