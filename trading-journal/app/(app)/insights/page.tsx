import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRuleBasedInsight } from "@/lib/insights/rules";
import { calculateByPair, calculateBySession, calculateOverview } from "@/lib/stats/engine";
import { getTrades } from "@/lib/trades/queries";
import { formatCurrency } from "@/lib/utils";

export default async function InsightsPage() {
  const trades = await getTrades();
  const overview = calculateOverview(trades);
  const insight = getRuleBasedInsight(trades);
  const bestSession = calculateBySession(trades).filter((item) => item.trades > 0).sort((a, b) => b.totalPnl - a.totalPnl)[0];
  const bestPair = calculateByPair(trades).filter((item) => item.trades > 0).sort((a, b) => b.totalPnl - a.totalPnl)[0];

  return (
    <div className="space-y-6">
      <div>
        <Badge>Local rules</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Insights</h1>
        <p className="mt-2 text-muted-foreground">Rule-based observations calculated from your trades on the server. No external API calls.</p>
      </div>

      {!trades.length ? (
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-semibold">No insights yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Log trades to generate local performance observations.</p>
            <Button asChild className="mt-5">
              <Link href="/trades/new">Log trade</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader><CardTitle>Current focus</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">{insight}</CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle>Closed trades</CardTitle></CardHeader>
              <CardContent className="number text-3xl">{overview.totalTrades}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Best session</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{bestSession?.label ?? "None"}</div>
                <p className="mt-1 text-sm text-muted-foreground">{bestSession ? formatCurrency(bestSession.totalPnl) : "No closed trades"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Best pair</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{bestPair?.label ?? "None"}</div>
                <p className="mt-1 text-sm text-muted-foreground">{bestPair ? formatCurrency(bestPair.totalPnl) : "No closed trades"}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
