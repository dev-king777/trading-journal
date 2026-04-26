import { AlertTriangle } from "lucide-react";

import { calculateMaxDrawdown, calculateStreaks, calculateTotalPnl } from "@/lib/stats/engine";
import type { AccountRecord, TradeRecord } from "@/types/trading";

export function RiskAlertBanner({ trades, account }: { trades: TradeRecord[]; account: AccountRecord }) {
  const streaks = calculateStreaks(trades);
  const maxDrawdown = calculateMaxDrawdown(trades);
  const totalPnl = calculateTotalPnl(trades);
  const alerts: string[] = [];

  if (streaks.currentType === "loss" && streaks.currentCount >= 3) {
    alerts.push(`You are on a ${streaks.currentCount}-loss streak. Stop trading and review screenshots before the next entry.`);
  }

  if (account.maxDrawdownRule && maxDrawdown > account.startingBalance * (account.maxDrawdownRule / 100) * 0.8) {
    alerts.push(`Max drawdown is near your ${account.maxDrawdownRule}% prop-firm limit.`);
  }

  if (totalPnl < 0 && Math.abs(totalPnl) > account.startingBalance * 0.02) {
    alerts.push("Current period loss exceeds 2% of starting balance. Reduce risk until execution quality improves.");
  }

  if (!alerts.length) {
    alerts.push("No major risk alerts. Keep following checklist and avoid increasing risk after winners.");
  }

  return (
    <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-warning">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-medium">Risk monitor</div>
          <div className="mt-1 space-y-1 text-sm text-warning/90">
            {alerts.map((alert) => <p key={alert}>{alert}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
