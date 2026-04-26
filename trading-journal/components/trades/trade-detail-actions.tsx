"use client";

import { Edit3, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteTrade, updateTrade } from "@/app/actions/trades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TradeRecord } from "@/types/trading";

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function TradeDetailActions({ trade }: { trade: TradeRecord }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pending, startTransition] = useTransition();

  function submitUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateTrade(formData);
      if (result.ok) {
        toast.success(result.message);
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setEditing(true)}><Edit3 className="mr-2 h-4 w-4" /> Edit</Button>
        <Button type="button" variant="destructive" onClick={() => setDeleting(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form action={submitUpdate} className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-white/10 bg-[#0a0a0f] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit trade</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
            </div>
            <input type="hidden" name="id" value={trade.id} />
            <input type="hidden" name="screenshotUrl" value={trade.screenshotUrl ?? ""} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Pair"><Input name="pair" defaultValue={trade.pair} required /></Field>
              <Field label="Direction">
                <select name="direction" defaultValue={trade.direction} className="h-10 w-full rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </Field>
              <Field label="Entry price"><Input name="entryPrice" type="number" step="0.00001" defaultValue={trade.entryPrice} required /></Field>
              <Field label="Exit price"><Input name="exitPrice" type="number" step="0.00001" defaultValue={trade.exitPrice ?? ""} /></Field>
              <Field label="Final P&L (manual)"><Input name="manualPnlAmount" type="number" step="0.01" defaultValue={trade.manualPnlAmount ?? ""} /></Field>
              <Field label="Stop loss"><Input name="stopLoss" type="number" step="0.00001" defaultValue={trade.stopLoss ?? ""} required /></Field>
              <Field label="Take profit"><Input name="takeProfit" type="number" step="0.00001" defaultValue={trade.takeProfit ?? ""} required /></Field>
              <Field label="Lot size"><Input name="lotSize" type="number" step="0.01" defaultValue={trade.lotSize} required /></Field>
              <Field label="Open time"><Input name="openTime" type="datetime-local" defaultValue={toLocalDateTime(trade.openTime)} required /></Field>
              <Field label="Close time"><Input name="closeTime" type="datetime-local" defaultValue={toLocalDateTime(trade.closeTime)} /></Field>
              <Field label="Strategy tags"><Input name="strategyTags" defaultValue={trade.strategyTags.join(", ")} /></Field>
              <Field label="Emotion"><Input name="emotionalState" defaultValue={trade.emotionalState ?? ""} /></Field>
              <div className="xl:col-span-3">
                <Field label="Notes"><Textarea name="notes" defaultValue={trade.notes ?? ""} /></Field>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
            </div>
          </form>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a0f] p-5 shadow-2xl">
            <h2 className="text-xl font-semibold">Delete trade?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This permanently removes the trade and recalculates account stats.</p>
            <form action={deleteTrade} className="mt-5 flex justify-end gap-2">
              <input type="hidden" name="id" value={trade.id} />
              <Button type="button" variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
              <Button type="submit" variant="destructive">Delete</Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
