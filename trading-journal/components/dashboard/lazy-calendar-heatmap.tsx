"use client";

import dynamic from "next/dynamic";

export const LazyCalendarHeatmap = dynamic(
  () => import("@/components/dashboard/calendar-heatmap").then((module) => module.CalendarHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-[246px] w-full animate-pulse rounded-xl bg-white/[0.03]" />
  }
);
