import { LazyBreakdownBarChart } from "@/components/charts/lazy-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateByDayOfWeek,
  calculateByEmotion,
  calculateByPair,
  calculateBySession,
  calculateByStrategy,
  calculateBiggestWinLoss,
  calculateMaxDrawdown
} from "@/lib/stats/engine";
import { getTrades } from "@/lib/trades/queries";
import { formatCurrency } from "@/lib/utils";

function BreakdownTable({ data }: { data: ReturnType<typeof calculateBySession> }) {
  return (
    <div className="mt-4 space-y-2">
      {data.slice(0, 6).map((item) => (
        <div key={item.key} className="grid grid-cols-[1fr_70px_90px_90px] gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
          <span className="font-medium">{item.label}</span>
          <span className="number text-muted-foreground">{item.winRate}%</span>
          <span className="number text-muted-foreground">PF {item.profitFactor}</span>
          <span className={item.totalPnl >= 0 ? "number text-profit" : "number text-loss"}>{formatCurrency(item.totalPnl)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AnalyticsPage() {
  const trades = await getTrades();

  if (trades.length < 5) {
    return (
      <div className="space-y-6">
        <div>
          <Badge>Analytics</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Performance breakdowns</h1>
        </div>
        <Card>
          <CardContent className="flex min-h-[280px] items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold">Log at least 5 trades to see breakdowns</h2>
              <p className="mt-2 text-sm text-muted-foreground">Analytics need a small sample before session, pair, and strategy stats are useful.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bySession = calculateBySession(trades);
  const byPair = calculateByPair(trades);
  const byDay = calculateByDayOfWeek(trades);
  const byStrategy = calculateByStrategy(trades);
  const byEmotion = calculateByEmotion(trades);
  const winLoss = calculateBiggestWinLoss(trades);
  const maxDrawdown = calculateMaxDrawdown(trades);

  const sections = [
    ["By Session", bySession],
    ["By Pair", byPair],
    ["By Day of Week", byDay],
    ["By Strategy", byStrategy],
    ["By Emotion", byEmotion]
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <Badge>Deep analytics</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Performance breakdowns</h1>
        <p className="mt-2 text-muted-foreground">Find the sessions, assets, setups, and mental states that actually pay you.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Biggest win</CardTitle></CardHeader>
          <CardContent className="number text-3xl text-profit">{formatCurrency(winLoss.biggestWin?.pnlAmount ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Biggest loss</CardTitle></CardHeader>
          <CardContent className="number text-3xl text-loss">{formatCurrency(winLoss.biggestLoss?.pnlAmount ?? 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Max drawdown</CardTitle></CardHeader>
          <CardContent className="number text-3xl">{formatCurrency(maxDrawdown)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map(([title, data]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyBreakdownBarChart data={data} />
              <BreakdownTable data={data} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
