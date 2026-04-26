"use client";

import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { importTrades } from "@/app/actions/imports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { detectImportFormat, formatColumnMaps, getDuplicateKey, importedTradeSchema, mapCsvRow, type ImportFormat, type ImportedTrade } from "@/lib/imports/csv";
import type { TradeRecord } from "@/types/trading";

const requiredFields = ["pair", "direction", "entryPrice", "exitPrice", "stopLoss", "takeProfit", "lotSize", "openTime", "closeTime"] as const;

export function CsvImporter({ existingTrades }: { existingTrades: TradeRecord[] }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [format, setFormat] = useState<ImportFormat>("tradingview");
  const [columnMap, setColumnMap] = useState<Record<string, string>>(formatColumnMaps.tradingview);
  const [errors, setErrors] = useState<string[]>([]);

  const existingKeys = useMemo(() => new Set(existingTrades.map(getDuplicateKey)), [existingTrades]);
  const mappedRows = useMemo(() => {
    const seen = new Set<string>();
    return rows.map((row, index) => {
      const mapped = mapCsvRow(row, columnMap);
      const parsed = importedTradeSchema.safeParse(mapped);
      const key = parsed.success ? getDuplicateKey(parsed.data) : "";
      const duplicate = parsed.success ? existingKeys.has(key) || seen.has(key) : false;
      if (parsed.success) {
        seen.add(key);
      }
      return { index, parsed, duplicate };
    });
  }, [columnMap, existingKeys, rows]);
  const preview = useMemo(() => mappedRows.slice(0, 100), [mappedRows]);

  const validTrades = mappedRows
    .filter((item): item is typeof item & { parsed: { success: true; data: ImportedTrade } } => item.parsed.success && !item.duplicate)
    .map((item) => item.parsed.data);

  function handleFormat(value: ImportFormat) {
    setFormat(value);
    setColumnMap(formatColumnMaps[value]);
  }

  function handleFile(file: File) {
    setErrors([]);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const detected = detectImportFormat(result.meta.fields ?? []);
        setRows(result.data);
        setHeaders(result.meta.fields ?? []);
        setFormat(detected);
        setColumnMap(formatColumnMaps[detected]);
        setErrors(result.errors.map((error) => `Row ${error.row}: ${error.message}`));
      },
      error: (error) => setErrors([error.message])
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload statement</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center transition hover:bg-primary/10">
            <UploadCloud className="mb-3 h-8 w-8 text-primary" />
            <span className="font-medium">Drop or choose CSV/HTM export</span>
            <span className="mt-1 text-sm text-muted-foreground">MT4, MT5, TradingView, FundedNext, or generic CSV</span>
            <Input className="hidden" type="file" accept=".csv,.htm,.html,text/csv,text/html" onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])} />
          </label>
          <div className="space-y-2">
            <Label>Detected format</Label>
            <Select value={format} onValueChange={(value) => handleFormat(value as ImportFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mt4">MetaTrader 4</SelectItem>
                <SelectItem value="mt5">MetaTrader 5</SelectItem>
                <SelectItem value="tradingview">TradingView</SelectItem>
                <SelectItem value="fundednext">FundedNext</SelectItem>
                <SelectItem value="generic">Generic CSV</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">For generic CSV, map the columns below before saving.</p>
          </div>
        </CardContent>
      </Card>

      {headers.length ? (
        <Card>
          <CardHeader><CardTitle>Column mapping</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {requiredFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label>{field}</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm"
                  value={columnMap[field] ?? ""}
                  onChange={(event) => setColumnMap((current) => ({ ...current, [field]: event.target.value }))}
                >
                  <option value="">Not mapped</option>
                  {headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {errors.length ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errors.map((error) => <div key={error}>{error}</div>)}
        </div>
      ) : null}

      {preview.length ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Preview</CardTitle>
            <form action={importTrades}>
              <input type="hidden" name="trades" value={JSON.stringify(validTrades)} />
              <ImportSubmitButton count={validTrades.length} />
            </form>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Net P&L</TableHead>
                  <TableHead>Open time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((item) => (
                  <TableRow key={item.index}>
                    <TableCell>
                      {item.duplicate ? <Badge variant="warning">Duplicate</Badge> : item.parsed.success ? <Badge variant="profit">Ready</Badge> : <Badge variant="destructive">Malformed</Badge>}
                    </TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.externalId ?? "-" : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.pair : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.direction : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.entryPrice : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.exitPrice ?? "Open" : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.pnlAmount ?? "Auto" : "-"}</TableCell>
                    <TableCell>{item.parsed.success ? item.parsed.data.openTime : item.parsed.error.errors[0]?.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ImportSubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={!count || pending}>{pending ? "Saving..." : `Save ${count} trades`}</Button>;
}
