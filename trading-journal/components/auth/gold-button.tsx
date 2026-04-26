"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function GoldButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#d4a017]/70 focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      style={{
        background: "linear-gradient(135deg, #d4a017 0%, #b8860b 100%)",
        boxShadow: "0 0 0 0 rgba(212,160,23,0)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,160,23,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 rgba(212,160,23,0)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
