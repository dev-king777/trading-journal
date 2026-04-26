"use client";

import { useCallback, useMemo, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TradeRecord } from "@/types/trading";

const filterNames = ["q", "from", "to", "pair", "session", "result", "tag"] as const;

export function TradeFilters({ trades }: { trades: TradeRecord[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pairs = useMemo(() => Array.from(new Set(trades.map((trade) => trade.pair))).sort(), [trades]);
  const tags = useMemo(() => Array.from(new Set(trades.flatMap((trade) => trade.strategyTags))).sort(), [trades]);

  const applyFilters = useCallback((form: HTMLFormElement, debounce = false) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const run = () => {
      const data = new FormData(form);
      const params = new URLSearchParams(searchParams.toString());

      for (const name of filterNames) {
        const value = String(data.get(name) ?? "");
        if (!value || value === "all") {
          params.delete(name);
        } else {
          params.set(name, value);
        }
      }

      startTransition(() => {
        router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
      });
    };

    if (debounce) {
      debounceRef.current = setTimeout(run, 300);
    } else {
      run();
    }
  }, [pathname, router, searchParams]);

  return (
    <form
      className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4 xl:grid-cols-7"
      onChange={(event) => applyFilters(event.currentTarget, event.target instanceof HTMLInputElement)}
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters(event.currentTarget);
      }}
    >
      <Input name="q" placeholder="Search..." defaultValue={searchParams.get("q") ?? ""} aria-label="Search trades" />
      <Input name="from" type="date" defaultValue={searchParams.get("from") ?? ""} aria-label="From date" />
      <Input name="to" type="date" defaultValue={searchParams.get("to") ?? ""} aria-label="To date" />
      <select name="pair" defaultValue={searchParams.get("pair") ?? "all"} className="h-10 rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm">
        <option value="all">All pairs</option>
        {pairs.map((pair) => <option key={pair}>{pair}</option>)}
      </select>
      <select name="session" defaultValue={searchParams.get("session") ?? "all"} className="h-10 rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm">
        <option value="all">All sessions</option>
        <option value="asian">Asian</option>
        <option value="london">London</option>
        <option value="overlap">Overlap</option>
        <option value="ny">NY</option>
      </select>
      <select name="result" defaultValue={searchParams.get("result") ?? "all"} className="h-10 rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm">
        <option value="all">All results</option>
        <option value="win">Win</option>
        <option value="loss">Loss</option>
        <option value="breakeven">Breakeven</option>
        <option value="open">Open</option>
      </select>
      <div className="flex gap-2">
        <select name="tag" defaultValue={searchParams.get("tag") ?? "all"} className="h-10 min-w-0 flex-1 rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm">
          <option value="all">All tags</option>
          {tags.map((tag) => <option key={tag}>{tag}</option>)}
        </select>
        <Button type="submit" disabled={pending}>{pending ? "..." : "Filter"}</Button>
      </div>
    </form>
  );
}
