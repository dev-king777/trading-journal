"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useMounted } from "@/hooks/use-mounted";
import { formatCurrency } from "@/lib/utils";
import type { GroupStats } from "@/lib/stats/engine";

export const BreakdownBarChart = memo(function BreakdownBarChart({ data, metric = "totalPnl" }: { data: GroupStats[]; metric?: "totalPnl" | "winRate" | "profitFactor" }) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-[280px] w-full animate-pulse rounded-xl bg-white/[0.03]" />;
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 8, right: 12, top: 16, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis stroke="#71717a" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#111118", border: "1px solid #1f1f2e", borderRadius: 12 }}
            formatter={(value) => [metric === "totalPnl" ? formatCurrency(Number(value)) : Number(value).toFixed(2), metric]}
          />
          <Bar dataKey={metric} fill="#00d9ff" radius={[8, 8, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
