import { type LucideIcon } from "lucide-react";

import { CountUp } from "@/components/shared/count-up";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  decimals,
  trend,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: string;
  icon: LucideIcon;
  tone?: "profit" | "loss" | "neutral";
}) {
  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <div
              className={cn(
                "number mt-3 text-3xl font-semibold",
                tone === "profit" && "text-profit",
                tone === "loss" && "text-loss"
              )}
            >
              <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 transition group-hover:border-primary/30 group-hover:text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}
