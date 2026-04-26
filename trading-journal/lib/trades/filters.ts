import type { TradeRecord } from "@/types/trading";

export type TradeFilters = {
  q?: string;
  pair?: string;
  session?: string;
  result?: string;
  tag?: string;
  from?: string;
  to?: string;
};

export function filterTrades(trades: TradeRecord[], filters: TradeFilters) {
  return trades.filter((trade) => {
    const query = filters.q?.toLowerCase().trim();
    const matchesQuery = !query || [trade.pair, trade.session, trade.result, trade.notes ?? "", ...trade.strategyTags].join(" ").toLowerCase().includes(query);
    const matchesPair = !filters.pair || filters.pair === "all" || trade.pair === filters.pair;
    const matchesSession = !filters.session || filters.session === "all" || trade.session === filters.session;
    const matchesResult = !filters.result || filters.result === "all" || trade.result === filters.result;
    const matchesTag = !filters.tag || filters.tag === "all" || trade.strategyTags.includes(filters.tag);
    const openedAt = new Date(trade.openTime).getTime();
    const matchesFrom = !filters.from || openedAt >= new Date(filters.from).getTime();
    const matchesTo = !filters.to || openedAt <= new Date(filters.to).getTime();

    return matchesQuery && matchesPair && matchesSession && matchesResult && matchesTag && matchesFrom && matchesTo;
  });
}
