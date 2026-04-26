import { z } from "zod";

import type { TradeRecord } from "@/types/trading";

const nullablePositiveNumber = z.union([z.number().positive(), z.null()]);

export const importedTradeSchema = z.object({
  externalId: z.string().optional(),
  pair: z.string().min(1),
  direction: z.enum(["buy", "sell"]),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().positive().optional(),
  stopLoss: nullablePositiveNumber,
  takeProfit: nullablePositiveNumber,
  lotSize: z.coerce.number().positive(),
  openTime: z.string().min(1),
  closeTime: z.string().optional(),
  result: z.enum(["win", "loss", "breakeven", "open"]).optional(),
  pnlAmount: z.number().optional(),
  pnlPips: z.number().optional(),
  commission: z.number().optional(),
  swap: z.number().optional(),
  strategyTags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  emotionalState: z.string().nullable().optional()
});

export type ImportedTrade = z.infer<typeof importedTradeSchema>;

export type ImportFormat = "mt4" | "mt5" | "tradingview" | "fundednext" | "generic";

export const formatColumnMaps: Record<ImportFormat, Record<string, string>> = {
  mt4: {
    pair: "Symbol",
    direction: "Type",
    entryPrice: "Open Price",
    exitPrice: "Close Price",
    lotSize: "Size",
    openTime: "Open Time",
    closeTime: "Close Time"
  },
  mt5: {
    pair: "Symbol",
    direction: "Type",
    entryPrice: "Price",
    exitPrice: "Close Price",
    lotSize: "Volume",
    openTime: "Time",
    closeTime: "Close Time"
  },
  tradingview: {
    pair: "Symbol",
    direction: "Side",
    entryPrice: "Entry Price",
    exitPrice: "Exit Price",
    lotSize: "Qty",
    openTime: "Entry Time",
    closeTime: "Exit Time"
  },
  fundednext: {
    externalId: "Ticket ID",
    pair: "Symbol",
    direction: "Type",
    entryPrice: "Open Price",
    exitPrice: "Close Price",
    stopLoss: "SL",
    takeProfit: "TP",
    lotSize: "Lots",
    openTime: "Open Time",
    closeTime: "Close Time",
    pnlAmount: "Profit",
    pnlPips: "Pips",
    commission: "Commission",
    swap: "Swap"
  },
  generic: {}
};

function toNumber(value: unknown, fallback = 0) {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  if (!normalized) return fallback;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : fallback;
}

function optionalPrice(value: unknown) {
  const number = toNumber(value, NaN);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function normalizeBrokerDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const match = text.match(/^(\d{4})[.-](\d{2})[.-](\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return text;

  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export function detectImportFormat(headers: string[]): ImportFormat {
  const normalized = new Set(headers.map((header) => header.trim()));
  const isFundedNext = ["Ticket ID", "Open Time", "Profit", "Lots", "Symbol"].every((column) => normalized.has(column));
  if (isFundedNext) return "fundednext";
  return "tradingview";
}

export function normalizeDirection(value: unknown) {
  const text = String(value ?? "").toLowerCase();
  if (["buy", "long", "market buy"].some((token) => text.includes(token))) return "buy";
  if (["sell", "short", "market sell"].some((token) => text.includes(token))) return "sell";
  return null;
}

export function mapCsvRow(row: Record<string, string>, columnMap: Record<string, string>) {
  const direction = normalizeDirection(row[columnMap.direction]);
  const entryPrice = toNumber(row[columnMap.entryPrice]);
  const fallbackStop = direction === "buy" ? entryPrice * 0.995 : entryPrice * 1.005;
  const fallbackTarget = direction === "buy" ? entryPrice * 1.01 : entryPrice * 0.99;
  const hasBrokerPnl = Boolean(columnMap.pnlAmount);
  const grossPnl = hasBrokerPnl ? toNumber(row[columnMap.pnlAmount]) : undefined;
  const commission = hasBrokerPnl ? toNumber(row[columnMap.commission]) : undefined;
  const swap = hasBrokerPnl ? toNumber(row[columnMap.swap]) : undefined;
  const netPnl = grossPnl === undefined ? undefined : Number((grossPnl + (commission ?? 0) + (swap ?? 0)).toFixed(2));
  const stopLoss = hasBrokerPnl ? optionalPrice(row[columnMap.stopLoss]) : row[columnMap.stopLoss] ? toNumber(row[columnMap.stopLoss]) : fallbackStop;
  const takeProfit = hasBrokerPnl ? optionalPrice(row[columnMap.takeProfit]) : row[columnMap.takeProfit] ? toNumber(row[columnMap.takeProfit]) : fallbackTarget;

  return {
    externalId: row[columnMap.externalId] || undefined,
    pair: row[columnMap.pair] ?? "",
    direction,
    entryPrice,
    exitPrice: row[columnMap.exitPrice] ? toNumber(row[columnMap.exitPrice]) : undefined,
    stopLoss,
    takeProfit,
    lotSize: row[columnMap.lotSize] ? toNumber(row[columnMap.lotSize], 1) : 1,
    openTime: normalizeBrokerDate(row[columnMap.openTime]),
    closeTime: row[columnMap.closeTime] ? normalizeBrokerDate(row[columnMap.closeTime]) : undefined,
    result: grossPnl === undefined ? undefined : grossPnl > 0 ? "win" : grossPnl < 0 ? "loss" : "breakeven",
    pnlAmount: netPnl,
    pnlPips: columnMap.pnlPips ? toNumber(row[columnMap.pnlPips]) : undefined,
    commission,
    swap,
    strategyTags: row[columnMap.strategyTags] ? row[columnMap.strategyTags].split(",").map((tag) => tag.trim()) : [],
    notes: row[columnMap.notes] || "",
    emotionalState: null
  };
}

export function getDuplicateKey(trade: Pick<TradeRecord, "pair" | "direction" | "entryPrice" | "openTime"> & { externalId?: string | null }) {
  if (trade.externalId) {
    return `external:${trade.externalId}`;
  }
  return `${trade.pair}:${trade.direction}:${trade.entryPrice}:${new Date(trade.openTime).toISOString().slice(0, 16)}`;
}
