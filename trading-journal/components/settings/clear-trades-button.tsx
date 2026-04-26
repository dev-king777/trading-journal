"use client";

import { Trash2, X } from "lucide-react";
import { useState } from "react";

import { clearActiveAccountTrades } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClearTradesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" /> Clear all trades for this account
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form action={clearActiveAccountTrades} className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0f] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-loss">Clear all trades?</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This deletes all trades for the active account only. The account stays intact and stats reset to zero.
            </p>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Type DELETE to confirm</label>
              <Input name="confirmation" autoComplete="off" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive">Delete trades</Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
