import { Award, Flame, ShieldCheck } from "lucide-react";

import { calculateStreaks } from "@/lib/stats/engine";
import type { TradeRecord } from "@/types/trading";

export function AchievementStrip({ trades }: { trades: TradeRecord[] }) {
  const streaks = calculateStreaks(trades);
  const achievements = [
    { label: `${trades.length} trades logged`, icon: Award },
    { label: `Best win streak ${streaks.maxWins}`, icon: Flame },
    { label: `${trades.filter((trade) => trade.checklistPassed).length} checklist passes`, icon: ShieldCheck }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {achievements.map((achievement) => (
        <div key={achievement.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <achievement.icon className="h-5 w-5 text-profit" />
          <span className="text-sm">{achievement.label}</span>
        </div>
      ))}
    </div>
  );
}
