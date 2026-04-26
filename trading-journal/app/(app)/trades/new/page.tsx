import Link from "next/link";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChecklistItems } from "@/lib/app-data/queries";
import { getCurrentAccount } from "@/lib/trades/queries";

const TradeEntryForm = dynamic(() => import("@/components/trade-form/trade-entry-form").then((module) => module.TradeEntryForm), {
  loading: () => <div className="h-[520px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
});

export default async function NewTradePage() {
  const [checklistItems, account] = await Promise.all([getChecklistItems(), getCurrentAccount()]);

  if (!account) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Create an account first</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">You need a trading account before logging trades.</p>
            <Button asChild>
              <Link href="/accounts">Create your first account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Badge>Fast logging</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Log a trade</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Required execution fields stay up top. Risk %, R:R, session, result, and P&L are calculated server-side on submit.
        </p>
      </div>
      <TradeEntryForm checklistItems={checklistItems} />
    </div>
  );
}
