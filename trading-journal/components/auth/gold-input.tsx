"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function GoldInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border px-3 py-2 text-sm text-white transition-all duration-200 placeholder:text-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        background: "rgba(19, 19, 26, 0.9)",
        borderColor: "rgba(212,160,23,0.25)"
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#d4a017";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,160,23,0.18), 0 0 22px rgba(212,160,23,0.16)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(212,160,23,0.25)";
        e.currentTarget.style.boxShadow = "none";
      }}
      {...props}
    />
  );
}
