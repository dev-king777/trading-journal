import { TradeFilters } from "@/components/trades/trade-filters";
import { TradesTable } from "@/components/trades/trades-table";
import { Badge } from "@/components/ui/badge";
import { filterTrades, type TradeFilters as TradeFilterValues } from "@/lib/trades/filters";
import { getTrades } from "@/lib/trades/queries";

export default async function TradesPage({ searchParams }: { searchParams: TradeFilterValues }) {
  const trades = await getTrades();
  const filteredTrades = filterTrades(trades, searchParams);

  return (
    <div className="space-y-6">
      <div>
        <Badge>Journal</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Trades</h1>
        <p className="mt-2 text-muted-foreground">Search, filter, review, and drill into every execution record.</p>
      </div>
      <TradeFilters trades={trades} />
      <TradesTable trades={filteredTrades} />
    </div>
  );
}
