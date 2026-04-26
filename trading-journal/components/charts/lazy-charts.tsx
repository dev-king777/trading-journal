"use client";

import dynamic from "next/dynamic";

function ChartSkeleton({ height = 320 }: { height?: number }) {
  return <div className="w-full animate-pulse rounded-xl bg-white/[0.03]" style={{ height }} />;
}

export const LazyEquityCurveChart = dynamic(
  () => import("@/components/charts/equity-curve-chart").then((module) => module.EquityCurveChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

export const LazyBreakdownBarChart = dynamic(
  () => import("@/components/charts/breakdown-bar-chart").then((module) => module.BreakdownBarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={280} />
  }
);
