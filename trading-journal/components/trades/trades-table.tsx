"use client";

import { format } from "date-fns";
import { Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteTrade, deleteTrades } from "@/app/actions/trades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VirtualTradesTable } from "@/components/trades/virtual-trades-table";
import { cn, formatCurrency } from "@/lib/utils";
import type { TradeRecord } from "@/types/trading";

export function TradesTable({ trades, compact = false }: { trades: TradeRecord[]; compact?: boolean }) {
  const visibleTrades = trades.slice(0, compact ? 8 : trades.length);
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => prev.size === visibleTrades.length ? new Set() : new Set(visibleTrades.map((t) => t.id)));
  }

  function bulkDelete() {
    if (!selected.size) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("ids", Array.from(selected).join(","));
      const result = await deleteTrades(formData);
      if (result.ok) {
        toast.success(result.message);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const allSelected = visibleTrades.length > 0 && selected.size === visibleTrades.length;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="font-semibold">{compact ? "Recent trades" : "Trade history"}</h2>
            <p className="text-sm text-muted-foreground">{trades.length} logged trades</p>
          </div>
          <div className="flex items-center gap-2">
            {!compact && selected.size > 0 ? (
              <Button variant="destructive" size="sm" disabled={pending} onClick={bulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete {selected.size}
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/trades/new">New trade</Link>
            </Button>
          </div>
        </div>
        {visibleTrades.length && !compact && trades.length > 100 ? (
          <VirtualTradesTable trades={trades} />
        ) : visibleTrades.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                {!compact ? (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-primary"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                ) : null}
                <TableHead>Date</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>R:R</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                {!compact ? <TableHead className="w-[92px] text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTrades.map((trade) => (
                <TableRow key={trade.id} className="cursor-pointer">
                  {!compact ? (
                    <TableCell className="w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-primary"
                        checked={selected.has(trade.id)}
                        onChange={() => toggleOne(trade.id)}
                        aria-label={`Select ${trade.pair}`}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">{format(new Date(trade.openTime), "MMM d, HH:mm")}</TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/trades/${trade.id}`} className="hover:text-primary">{trade.pair}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.direction === "buy" ? "profit" : "destructive"}>{trade.direction.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{trade.session}</TableCell>
                  <TableCell>
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {trade.strategyTags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="number">{trade.riskRewardRatio.toFixed(2)}</TableCell>
                  <TableCell className={cn("number text-right font-semibold", trade.pnlAmount >= 0 ? "text-profit" : "text-loss")}>
                    {formatCurrency(trade.pnlAmount)}
                  </TableCell>
                  {!compact ? (
                    <TableCell>
                      <div className="flex justify-end gap-1 opacity-70 transition hover:opacity-100">
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
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <h3 className="text-lg font-semibold">No trades yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Log your first trade to build your journal history.</p>
            <Button asChild className="mt-5">
              <Link href="/trades/new">Add one</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
