import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { getTrades } from "@/lib/trades/queries";

const CsvImporter = dynamic(() => import("@/components/imports/csv-importer").then((module) => module.CsvImporter), {
  loading: () => <div className="h-[420px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
});

export default async function TradeImportPage({ searchParams }: { searchParams: { error?: string } }) {
  const trades = await getTrades();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant={searchParams.error ? "destructive" : "default"}>{searchParams.error ?? "CSV import"}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Import trades</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Upload broker exports, preview normalized trades, catch duplicates, and save clean rows into the journal.
        </p>
      </div>
      <CsvImporter existingTrades={trades} />
    </div>
  );
}
