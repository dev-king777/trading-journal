import { format } from "date-fns";
import { notFound } from "next/navigation";

import { uploadTradeScreenshot } from "@/app/actions/screenshots";
import { TradeDetailActions } from "@/components/trades/trade-detail-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTradeById } from "@/lib/trades/queries";
import { cn, formatCurrency } from "@/lib/utils";

export default async function TradeDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const trade = await getTradeById(params.id);

  if (!trade) {
    notFound();
  }

  const grossProfit = Number((trade.pnlAmount - trade.commission - trade.swap).toFixed(4));

  return (
    <div className="space-y-6">
      <div>
        <Badge variant={searchParams.error ? "destructive" : trade.pnlAmount >= 0 ? "profit" : "loss"}>{searchParams.error ?? trade.result}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{trade.pair} {trade.direction.toUpperCase()}</h1>
        <p className="mt-2 text-muted-foreground">{format(new Date(trade.openTime), "PPpp")} / {trade.session}</p>
        <div className="mt-4">
          <TradeDetailActions trade={trade} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Gross Profit</CardTitle></CardHeader><CardContent className={cn("number text-3xl", grossProfit >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(grossProfit)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Commission</CardTitle></CardHeader><CardContent className={cn("number text-3xl", trade.commission >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(trade.commission)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Swap</CardTitle></CardHeader><CardContent className={cn("number text-3xl", trade.swap >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(trade.swap)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Net P&L</CardTitle></CardHeader><CardContent className={cn("number text-3xl font-semibold", trade.pnlAmount >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(trade.pnlAmount)}</CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Manual P&L</CardTitle></CardHeader><CardContent className={cn("number text-3xl font-semibold", trade.pnlAmount >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(trade.manualPnlAmount ?? trade.pnlAmount)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Account %</CardTitle></CardHeader><CardContent className={cn("number text-3xl font-semibold", trade.pnlPercent >= 0 ? "text-profit" : "text-loss")}>{trade.pnlPercent.toFixed(2)}%</CardContent></Card>
        <Card><CardHeader><CardTitle>R:R</CardTitle></CardHeader><CardContent className="number text-3xl">{trade.riskRewardRatio.toFixed(2)}</CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Risk</CardTitle></CardHeader><CardContent className="number text-3xl">{trade.riskPercent.toFixed(2)}%</CardContent></Card>
        <Card><CardHeader><CardTitle>Pips</CardTitle></CardHeader><CardContent className="number text-3xl">{trade.pnlPips.toFixed(1)}</CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Card>
          <CardHeader><CardTitle>Execution details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Entry", trade.entryPrice],
              ["Exit", trade.exitPrice ?? "Open"],
              ["Stop loss", trade.stopLoss ?? "Not set"],
              ["Take profit", trade.takeProfit ?? "Not set"],
              ["Lot size", trade.lotSize],
              ["Emotion", trade.emotionalState ?? "Not logged"],
              ["External ID", trade.externalId ?? "None"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                <div className="mt-1 font-medium">{value}</div>
              </div>
            ))}
            <div className="sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</div>
              <p className="mt-2 text-sm text-zinc-300">{trade.notes ?? "No notes captured."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Execution screenshot</CardTitle></CardHeader>
          <CardContent>
            {trade.screenshotUrl ? (
              <div className="mb-4 space-y-3">
                <a href={trade.screenshotUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={trade.screenshotUrl}
                    alt={`${trade.pair} execution screenshot`}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[420px] w-full object-contain"
                  />
                </a>
                <Button asChild variant="outline" className="w-full">
                  <a href={trade.screenshotUrl} target="_blank" rel="noreferrer">Open full screenshot</a>
                </Button>
              </div>
            ) : (
              <div className="mb-4 grid h-64 place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-sm text-muted-foreground">No screenshot uploaded</div>
            )}
            <form action={uploadTradeScreenshot} className="space-y-3">
              <input type="hidden" name="tradeId" value={trade.id} />
              <Input name="screenshot" type="file" accept="image/*" />
              <Button type="submit" className="w-full">Upload screenshot</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
