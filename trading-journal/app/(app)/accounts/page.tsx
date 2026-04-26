import { Trash2 } from "lucide-react";

import { createAccount, deleteAccount } from "@/app/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateProfitFactor, calculateWinRate } from "@/lib/stats/engine";
import { getAccounts, getAllTrades } from "@/lib/trades/queries";
import { formatCurrency } from "@/lib/utils";

export default async function AccountsPage({ searchParams }: { searchParams: { error?: string } }) {
  const [accounts, trades] = await Promise.all([getAccounts(), getAllTrades()]);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant={searchParams.error ? "destructive" : "default"}>{searchParams.error ?? "Accounts"}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Accounts</h1>
        <p className="mt-2 text-muted-foreground">Create and manage your trading accounts.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.length ? accounts.map((account) => {
            const accountTrades = trades.filter((trade) => trade.accountId === account.id);
            const netPnl = accountTrades.reduce((sum, trade) => sum + trade.pnlAmount, 0);
            const biggestWin = accountTrades.filter((trade) => trade.pnlAmount > 0).sort((a, b) => b.pnlAmount - a.pnlAmount)[0];
            const biggestLoss = accountTrades.filter((trade) => trade.pnlAmount < 0).sort((a, b) => a.pnlAmount - b.pnlAmount)[0];
            return (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="number text-3xl">{formatCurrency(account.currentBalance, account.currency)}</div>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">{account.type} / Start {formatCurrency(account.startingBalance, account.currency)}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Total trades" value={accountTrades.length} />
                    <Metric label="Win rate" value={`${calculateWinRate(accountTrades).toFixed(1)}%`} />
                    <Metric label="Biggest win" value={formatCurrency(biggestWin?.pnlAmount ?? 0, account.currency)} tone="profit" />
                    <Metric label="Biggest loss" value={formatCurrency(biggestLoss?.pnlAmount ?? 0, account.currency)} tone="loss" />
                    <Metric label="Net P&L" value={formatCurrency(netPnl, account.currency)} tone={netPnl >= 0 ? "profit" : "loss"} />
                    <Metric label="Profit factor" value={calculateProfitFactor(accountTrades).toFixed(2)} />
                  </div>
                  <form action={deleteAccount} className="mt-5">
                    <input type="hidden" name="id" value={account.id} />
                    <Button type="submit" variant="outline" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                  </form>
                </CardContent>
              </Card>
            );
          }) : (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">No accounts yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">Create your first trading account to start logging trades.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle>{accounts.length ? "Add account" : "Create your first account"}</CardTitle></CardHeader>
          <CardContent>
            <form action={createAccount} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" placeholder="Main account" required /></div>
              <div className="space-y-2"><Label>Balance</Label><Input name="startingBalance" type="number" min="0" step="0.01" defaultValue="10000" required /></div>
              <div className="space-y-2"><Label>Currency</Label><Input name="currency" defaultValue="USD" maxLength={3} /></div>
              <Button type="submit" className="w-full">Create account</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "profit" | "loss" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className={tone === "profit" ? "mt-1 font-medium text-profit" : tone === "loss" ? "mt-1 font-medium text-loss" : "mt-1 font-medium"}>{value}</div>
    </div>
  );
}
