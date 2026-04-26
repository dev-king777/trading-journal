import { format, parseISO } from "date-fns";
import dynamic from "next/dynamic";

import { saveGoalSet } from "@/app/actions/goals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureCurrentPeriodGoals, getGoals } from "@/lib/app-data/queries";
import { daysRemaining, getGoalPeriodKeys, type GoalType } from "@/lib/goals/periods";
import { getCurrentAccount, getTrades } from "@/lib/trades/queries";
import { formatCurrency } from "@/lib/utils";
import type { GoalRecord, TradeRecord } from "@/types/trading";

const GoalProgress = dynamic(() => import("@/components/goals/goal-progress").then((module) => module.GoalProgress), {
  loading: () => <div className="mt-5 h-3 animate-pulse rounded-full bg-white/10" />
});

const goalTypes: { type: GoalType; label: string }[] = [
  { type: "daily", label: "Daily" },
  { type: "weekly", label: "Weekly" },
  { type: "monthly", label: "Monthly" }
];

export default async function GoalsPage() {
  const [trades, account] = await Promise.all([getTrades(), getCurrentAccount()]);
  if (account) {
    await ensureCurrentPeriodGoals(account.id);
  }
  const goals = await getGoals();
  const currentGoals = new Map(goalTypes.map(({ type }) => {
    const period = getGoalPeriodKeys(type);
    const goal = goals
      .filter((item) => item.accountId === account?.id && item.type === type && item.periodStart === period.periodStart && item.periodEnd === period.periodEnd)
      .sort((a, b) => b.id.localeCompare(a.id))[0] ?? null;
    return [type, goal] as const;
  }));
  const history = goals.filter((goal) => {
    const period = getGoalPeriodKeys(goal.type);
    return goal.accountId === account?.id && (goal.periodStart !== period.periodStart || goal.periodEnd !== period.periodEnd);
  });

  return (
    <div className="space-y-6">
      <div>
        <Badge>Targets</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Goals</h1>
        <p className="mt-2 text-muted-foreground">Daily, weekly, and monthly targets refresh by period while older goals remain in history.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {goalTypes.map(({ type, label }) => (
          <GoalCard
            key={type}
            label={label}
            type={type}
            goal={currentGoals.get(type) ?? null}
            trades={trades}
            currency={account?.currency ?? "USD"}
          />
        ))}
      </div>

      <Card id="create-goal">
        <CardHeader><CardTitle>Set goals</CardTitle></CardHeader>
        <CardContent>
          {account ? (
            <form action={saveGoalSet} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {goalTypes.map(({ type, label }) => (
                  <div key={type} className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-semibold">{label}</h3>
                    <div className="space-y-2">
                      <Label>Profit target</Label>
                      <Input
                        name={`${type}ProfitTarget`}
                        type="number"
                        step="0.01"
                        placeholder={type === "daily" ? "100" : type === "weekly" ? "500" : "2000"}
                        defaultValue={currentGoals.get(type)?.targetAmount ?? ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max loss</Label>
                      <Input
                        name={`${type}LossLimit`}
                        type="number"
                        step="0.01"
                        placeholder={type === "daily" ? "50" : type === "weekly" ? "250" : "1000"}
                        defaultValue={currentGoals.get(type)?.lossLimitAmount ?? ""}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Save all goals</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Create a trading account before setting goals.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.length ? history.slice(0, 12).map((goal) => (
            <div key={goal.id} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm sm:grid-cols-[100px_1fr_1fr]">
              <span className="capitalize">{goal.type}</span>
              <span>{format(parseISO(goal.periodStart), "MMM d")} - {format(parseISO(goal.periodEnd), "MMM d, yyyy")}</span>
              <span>{formatCurrency(goal.targetAmount ?? 0, account?.currency ?? "USD")} target / {formatCurrency(goal.lossLimitAmount ?? 0, account?.currency ?? "USD")} max loss</span>
            </div>
          )) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">No archived goal periods yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoalCard({ label, type, goal, trades, currency }: { label: string; type: GoalType; goal: GoalRecord | null; trades: TradeRecord[]; currency: string }) {
  const period = getGoalPeriodKeys(type);
  const periodTrades = trades.filter((trade) => {
    const key = (trade.closeTime ?? trade.openTime).slice(0, 10);
    return key >= period.periodStart && key <= period.periodEnd;
  });
  const pnl = periodTrades.reduce((sum, trade) => sum + trade.pnlAmount, 0);
  const target = goal?.targetAmount ?? 0;
  const lossLimit = Math.abs(goal?.lossLimitAmount ?? 0);
  const progress = target > 0 ? Math.max(0, Math.min(100, (pnl / target) * 100)) : 0;
  const remaining = target - pnl;
  const days = daysRemaining(type);
  const message = getGoalMessage(type, pnl, target, lossLimit, days);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="number text-3xl">{progress.toFixed(1)}%</div>
            <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(pnl, currency)} / {formatCurrency(target, currency)}</p>
          </div>
          <Badge variant={pnl >= target && target > 0 ? "profit" : lossLimit > 0 && pnl <= -lossLimit ? "destructive" : "warning"}>{days} days left</Badge>
        </div>
        <GoalProgress progress={progress} />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        {lossLimit > 0 ? <p className="mt-2 text-xs text-muted-foreground">Max loss: -{formatCurrency(lossLimit, currency)}</p> : null}
      </CardContent>
    </Card>
  );
}

function getGoalMessage(type: GoalType, pnl: number, target: number, lossLimit: number, days: number) {
  const label = type === "daily" ? "daily" : type === "weekly" ? "weekly" : "monthly";
  if (lossLimit > 0 && pnl <= -lossLimit) return `Max ${label} loss hit. Stop trading for this period.`;
  if (target > 0 && pnl >= target) return `${label[0].toUpperCase()}${label.slice(1)} TP hit! ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} ${label === "daily" ? "today" : "this period"}.`;
  if (target > 0 && pnl >= target * 0.5) return `${Math.floor((pnl / target) * 100)}% to your ${label} target.`;
  if (target > 0) return `Need $${Math.max(0, target - pnl).toFixed(2)} more in ${days} days to hit ${label} goal.`;
  return `Set a ${label} profit target and max loss to start tracking.`;
}
