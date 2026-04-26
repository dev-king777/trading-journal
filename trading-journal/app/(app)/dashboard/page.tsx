import Link from "next/link";
import { BadgeDollarSign, FileDown, Flame, Percent, ShieldCheck, TrendingUp } from "lucide-react";

import { AchievementStrip } from "@/components/dashboard/achievement-strip";
import { InsightBanner } from "@/components/dashboard/insight-banner";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RiskAlertBanner } from "@/components/dashboard/risk-alert-banner";
import { LazyEquityCurveChart } from "@/components/charts/lazy-charts";
import { TradesTable } from "@/components/trades/trades-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureCurrentPeriodGoals, getGoals } from "@/lib/app-data/queries";
import { getGoalPeriodKeys } from "@/lib/goals/periods";
import { calculateEquityCurve, calculateOverview } from "@/lib/stats/engine";
import { getRuleBasedInsight } from "@/lib/insights/rules";
import { getCurrentAccount, getTrades } from "@/lib/trades/queries";
import { cn, formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [trades, account] = await Promise.all([getTrades(), getCurrentAccount()]);

  if (!account) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Card className="max-w-xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground">Create your first trading account to get started.</p>
            <Button asChild>
              <Link href="/accounts">Create your first account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  await ensureCurrentPeriodGoals(account.id);
  const goals = await getGoals();
  const stats = calculateOverview(trades);
  const equityCurve = calculateEquityCurve(trades);
  const insight = getRuleBasedInsight(trades);
  const todayPeriod = getGoalPeriodKeys("daily");
  const todayGoal = goals.find((goal) => goal.accountId === account.id && goal.type === "daily" && goal.periodStart === todayPeriod.periodStart && goal.periodEnd === todayPeriod.periodEnd);
  const todayPnl = trades
    .filter((trade) => (trade.closeTime ?? trade.openTime).slice(0, 10) === todayPeriod.periodStart)
    .reduce((sum, trade) => sum + trade.pnlAmount, 0);
  const todayTarget = todayGoal?.targetAmount ?? 0;
  const todayProgress = todayTarget > 0 ? Math.min(100, Math.max(0, (todayPnl / todayTarget) * 100)) : 0;
  const accountGrowth = account.currentBalance - account.startingBalance;
  const accountGrowthPercent = account.startingBalance > 0 ? (accountGrowth / account.startingBalance) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge>Brotherhood command desk</Badge>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-6xl">
            Brotherhood
            <span className="block bg-gradient-to-r from-primary via-profit to-white bg-clip-text text-transparent">Execution Room</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            One account, one mission: protect risk, track every execution, and compound the edge.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Balance</div>
            <div className="number text-2xl font-semibold">{formatCurrency(account.currentBalance, account.currency)}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Account %
            </div>
            <div className={cn("number text-2xl font-semibold", accountGrowthPercent >= 0 ? "text-profit" : "text-loss")}>
              {accountGrowthPercent >= 0 ? "+" : ""}{accountGrowthPercent.toFixed(2)}%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{formatCurrency(accountGrowth, account.currency)} from start</div>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/reports"><FileDown className="mr-2 h-4 w-4" /> Download PDF</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Today&apos;s goal</div>
            <div className="mt-1 text-lg font-semibold">{formatCurrency(todayPnl, account.currency)} / {formatCurrency(todayTarget, account.currency)} ({todayProgress.toFixed(0)}%)</div>
          </div>
          <div className="h-2 min-w-[220px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-profit" style={{ width: `${todayProgress}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Win rate" value={stats.winRate} suffix="%" decimals={1} trend={`${stats.totalTrades} closed trades`} icon={Percent} tone="profit" />
        <KpiCard label="Profit factor" value={stats.profitFactor} decimals={2} trend="Target is above 1.50" icon={ShieldCheck} />
        <KpiCard label="Total P&L" value={stats.totalPnl} prefix="$" decimals={2} trend="Closed trades only" icon={BadgeDollarSign} tone={stats.totalPnl >= 0 ? "profit" : "loss"} />
        <KpiCard
          label="Current streak"
          value={stats.streaks.currentCount}
          decimals={0}
          trend={stats.streaks.currentType === "none" ? "No active streak" : `${stats.streaks.currentType.toUpperCase()} streak`}
          icon={Flame}
          tone={stats.streaks.currentType === "loss" ? "loss" : "profit"}
        />
      </div>

      <RiskAlertBanner trades={trades} account={account} />
      <InsightBanner insight={insight} />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Equity curve</CardTitle>
          </CardHeader>
          <CardContent>
            <LazyEquityCurveChart data={equityCurve} />
          </CardContent>
        </Card>
      </div>

      <AchievementStrip trades={trades} />
      <TradesTable trades={trades.slice(0, 5)} compact />
    </div>
  );
}
