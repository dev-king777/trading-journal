import { Document, Page, StyleSheet, Svg, Text, View, Polyline } from "@react-pdf/renderer";
import { format } from "date-fns";

import { calculateOverviewStats } from "@/lib/stats/calculations";
import { calculateMaxDrawdown, calculateStreaks } from "@/lib/stats/engine";
import { formatCurrency } from "@/lib/utils";
import type { AccountRecord, TradeRecord } from "@/types/trading";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#0a0a0f",
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  eyebrow: {
    color: "#00d9ff",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 9,
    marginBottom: 8
  },
  title: {
    fontSize: 34,
    lineHeight: 1.05,
    marginBottom: 12
  },
  muted: {
    color: "#a1a1aa"
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginVertical: 22
  },
  stat: {
    flex: 1,
    border: "1px solid #1f1f2e",
    backgroundColor: "#13131a",
    borderRadius: 10,
    padding: 14
  },
  statLabel: {
    color: "#a1a1aa",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  statValue: {
    marginTop: 8,
    fontSize: 20
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 18,
    marginBottom: 10
  },
  card: {
    border: "1px solid #1f1f2e",
    backgroundColor: "#13131a",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid #1f1f2e",
    paddingVertical: 7
  },
  th: {
    color: "#a1a1aa",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  cell: {
    flex: 1
  },
  pnlProfit: {
    color: "#00ffaa"
  },
  pnlLoss: {
    color: "#ff4d6d"
  }
});

function getEquityPoints(trades: TradeRecord[]) {
  const sorted = [...trades].sort((a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime());
  let cumulative = 0;
  const values = sorted.map((trade) => {
    cumulative += trade.pnlAmount;
    return cumulative;
  });

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const width = 480;
  const height = 140;

  return values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / (max - min || 1)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MonthlyReportDocument({
  month,
  name,
  account,
  trades,
  insight
}: {
  month: string;
  name: string;
  account: AccountRecord;
  trades: TradeRecord[];
  insight: string;
}) {
  const stats = calculateOverviewStats(trades);
  const drawdown = calculateMaxDrawdown(trades);
  const streaks = calculateStreaks(trades);
  const sortedByPnl = [...trades].filter((trade) => trade.result !== "open").sort((a, b) => b.pnlAmount - a.pnlAmount);
  const best = sortedByPnl[0];
  const worst = sortedByPnl[sortedByPnl.length - 1];

  return (
    <Document title={`EdgeJournal ${month} Report`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>EdgeJournal Monthly Performance</Text>
        <Text style={styles.title}>{month} Trading Report</Text>
        <Text style={styles.muted}>
          {name} · {account.name} · Generated {format(new Date(), "MMM d, yyyy")}
        </Text>

        <View style={styles.grid}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Win rate</Text>
            <Text style={styles.statValue}>{stats.winRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total P&L</Text>
            <Text style={[styles.statValue, stats.totalPnl >= 0 ? styles.pnlProfit : styles.pnlLoss]}>{formatCurrency(stats.totalPnl, account.currency)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Profit factor</Text>
            <Text style={styles.statValue}>{stats.profitFactor.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Max drawdown</Text>
            <Text style={styles.statValue}>{formatCurrency(drawdown, account.currency)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Current streak</Text>
            <Text style={styles.statValue}>{streaks.currentCount} {streaks.currentType}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Average R:R</Text>
            <Text style={styles.statValue}>{stats.averageRiskReward.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Equity Curve</Text>
        <View style={styles.card}>
          <Svg width={480} height={140} viewBox="0 0 480 140">
            <Polyline points={getEquityPoints(trades)} fill="none" stroke="#00d9ff" strokeWidth={3} />
          </Svg>
        </View>

        <Text style={styles.sectionTitle}>Best / Worst Trades</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Best trade</Text>
            <Text>{best ? `${best.pair} ${best.direction.toUpperCase()} · ${formatCurrency(best.pnlAmount, account.currency)}` : "No closed trades"}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Worst trade</Text>
            <Text>{worst ? `${worst.pair} ${worst.direction.toUpperCase()} · ${formatCurrency(worst.pnlAmount, account.currency)}` : "No closed trades"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Monthly Insight</Text>
        <View style={styles.card}>
          <Text style={styles.muted}>{insight}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>All Trades</Text>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.th]}>Date</Text>
          <Text style={[styles.cell, styles.th]}>Pair</Text>
          <Text style={[styles.cell, styles.th]}>Side</Text>
          <Text style={[styles.cell, styles.th]}>Session</Text>
          <Text style={[styles.cell, styles.th]}>R:R</Text>
          <Text style={[styles.cell, styles.th]}>P&L</Text>
        </View>
        {trades.map((trade) => (
          <View key={trade.id} style={styles.row}>
            <Text style={styles.cell}>{format(new Date(trade.openTime), "MMM d")}</Text>
            <Text style={styles.cell}>{trade.pair}</Text>
            <Text style={styles.cell}>{trade.direction.toUpperCase()}</Text>
            <Text style={styles.cell}>{trade.session}</Text>
            <Text style={styles.cell}>{trade.riskRewardRatio.toFixed(2)}</Text>
            <Text style={[styles.cell, trade.pnlAmount >= 0 ? styles.pnlProfit : styles.pnlLoss]}>{formatCurrency(trade.pnlAmount, account.currency)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
