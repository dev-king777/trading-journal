"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

export function GoalProgress({ progress }: { progress: number }) {
  useEffect(() => {
    if (progress >= 100) {
      confetti({ particleCount: 140, spread: 70, origin: { y: 0.72 } });
    }
  }, [progress]);

  return (
    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-primary to-profit" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}
