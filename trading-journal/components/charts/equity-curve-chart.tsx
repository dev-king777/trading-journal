"use client";

import { memo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useMounted } from "@/hooks/use-mounted";
import { formatCurrency } from "@/lib/utils";
import type { EquityPoint } from "@/lib/stats/engine";

export const EquityCurveChart = memo(function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-[320px] w-full animate-pulse rounded-xl bg-white/[0.03]" />;
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 8, right: 12, top: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d9ff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#00d9ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis stroke="#71717a" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: "#111118", border: "1px solid #1f1f2e", borderRadius: 12 }}
            formatter={(value) => [formatCurrency(Number(value)), "Cumulative P&L"]}
          />
          <Area type="monotone" dataKey="cumulativePnl" stroke="#00d9ff" strokeWidth={3} fill="url(#equityGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
