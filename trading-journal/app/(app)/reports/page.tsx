import { FileDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAccount, getTrades } from "@/lib/trades/queries";
import { calculateOverviewStats } from "@/lib/stats/calculations";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const [account, trades] = await Promise.all([getCurrentAccount(), getTrades()]);
  const stats = calculateOverviewStats(trades);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge>PDF exports</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Monthly reports</h1>
          <p className="mt-2 text-muted-foreground">Generate a clean performance packet for mentors, reviews, and prop-firm recaps.</p>
        </div>
        <Button asChild disabled={!account}>
          <a href="/api/reports/monthly"><FileDown className="mr-2 h-4 w-4" /> Download PDF</a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Win rate</CardTitle></CardHeader>
          <CardContent className="number text-3xl">{stats.winRate.toFixed(1)}%</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total P&L</CardTitle></CardHeader>
          <CardContent className="number text-3xl text-profit">{formatCurrency(stats.totalPnl, account?.currency ?? "USD")}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Profit factor</CardTitle></CardHeader>
          <CardContent className="number text-3xl">{stats.profitFactor.toFixed(2)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
