"use client";

import { format } from "date-fns";
import { Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { deleteTrade } from "@/app/actions/trades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { TradeRecord } from "@/types/trading";

const rowHeight = 58;
const viewportHeight = 620;
const overscan = 6;

export function VirtualTradesTable({ trades }: { trades: TradeRecord[] }) {
  const [scrollTop, setScrollTop] = useState(0);
  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(trades.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
    return { start, end };
  }, [scrollTop, trades.length]);
  const visibleTrades = trades.slice(range.start, range.end);

  return (
    <div
      className="max-h-[620px] overflow-auto"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      role="table"
      aria-rowcount={trades.length}
    >
      <div className="sticky top-0 z-10 grid grid-cols-[120px_1fr_86px_92px_160px_70px_110px_92px] gap-3 border-b border-white/10 bg-[#0a0a0f] px-4 py-3 text-sm font-medium text-muted-foreground">
        <div>Date</div>
        <div>Pair</div>
        <div>Side</div>
        <div>Session</div>
        <div>Tags</div>
        <div>R:R</div>
        <div className="text-right">P&L</div>
        <div className="text-right">Actions</div>
      </div>
      <div style={{ height: trades.length * rowHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${range.start * rowHeight}px)` }}>
          {visibleTrades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-[120px_1fr_86px_92px_160px_70px_110px_92px] items-center gap-3 border-b border-white/5 px-4 text-sm"
              style={{ height: rowHeight }}
              role="row"
            >
              <div className="text-muted-foreground">{format(new Date(trade.openTime), "MMM d, HH:mm")}</div>
              <div className="font-medium">
                <Link href={`/trades/${trade.id}`} className="hover:text-primary">{trade.pair}</Link>
              </div>
              <div><Badge variant={trade.direction === "buy" ? "profit" : "destructive"}>{trade.direction.toUpperCase()}</Badge></div>
              <div className="capitalize">{trade.session}</div>
              <div className="flex min-w-0 flex-wrap gap-1">
                {trade.strategyTags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
              <div className="number">{trade.riskRewardRatio.toFixed(2)}</div>
              <div className={cn("number text-right font-semibold", trade.pnlAmount >= 0 ? "text-profit" : "text-loss")}>
                {formatCurrency(trade.pnlAmount)}
              </div>
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/trades/${trade.id}`} aria-label={`Edit ${trade.pair}`}><Edit3 className="h-4 w-4" /></Link>
                </Button>
                <form action={deleteTrade}>
                  <input type="hidden" name="id" value={trade.id} />
                  <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-loss" aria-label={`Delete ${trade.pair}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
