"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { uploadDraftTradeScreenshot } from "@/app/actions/screenshots";
import { createTrade } from "@/app/actions/trades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assets, emotions, mistakeOptions, strategyTagOptions, tradeFormSchema, type TradeFormInput } from "@/lib/trades/schema";
import type { ChecklistItemRecord } from "@/types/trading";

const defaultOpenTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function TradeEntryForm({ checklistItems = [] }: { checklistItems?: ChecklistItemRecord[] }) {
  const router = useRouter();
  const [state, action] = useFormState(createTrade, null);
  const [pending, startTransition] = useTransition();
  const [optimisticQueued, queueOptimisticTrade] = useOptimistic(false, () => true);
  const [uploading, setUploading] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<TradeFormInput>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      pair: "EURUSD",
      direction: "buy",
      lotSize: 0.5,
      openTime: defaultOpenTime,
      strategyTags: "FVG, Liquidity Grab",
      checklistPassed: true,
      isBacktest: false
    }
  });

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Trade saved.");
      router.push("/trades");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [router, state]);

  async function uploadScreenshot(file: File) {
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setScreenshotPreview(localPreview);
    setScreenshotError(null);
    setValue("screenshotUrl", undefined);

    try {
      const formData = new FormData();
      formData.set("screenshot", file);
      const result = await uploadDraftTradeScreenshot(formData);

      if (!result.ok || !result.signedUrl || !result.path) {
        throw new Error(result.message ?? "Screenshot upload failed.");
      }

      setScreenshotPreview(result.signedUrl);
      setValue("screenshotUrl", result.path, { shouldDirty: true });
      toast.success("Screenshot uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Screenshot upload failed.";
      setScreenshotPreview(null);
      setScreenshotError(message);
      toast.error(message);
      setValue("screenshotUrl", undefined);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
    }
  }

  function submit(values: TradeFormInput) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, String(value));
      }
    });
    startTransition(() => {
      queueOptimisticTrade(true);
      action(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {state?.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}
      {optimisticQueued && pending ? (
        <div className="rounded-lg border border-profit/30 bg-profit/10 px-4 py-3 text-sm text-profit">
          Trade queued. Updating journal...
        </div>
      ) : null}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <CardHeader>
            <CardTitle>Execution</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Pair / Asset" error={errors.pair?.message}>
              <select className="h-10 w-full rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm" {...register("pair")}>
                {assets.map((asset) => <option key={asset}>{asset}</option>)}
              </select>
            </Field>
            <Field label="Direction" error={errors.direction?.message}>
              <select className="h-10 w-full rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm" {...register("direction")}>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </Field>
            <Field label="Entry price" error={errors.entryPrice?.message}>
              <Input type="number" step="0.00001" placeholder="1.08450" {...register("entryPrice")} />
            </Field>
            <Field label="Final P&L (manual)" error={errors.manualPnlAmount?.message}>
              <Input type="number" step="0.01" placeholder="Broker P&L for closed trades" {...register("manualPnlAmount")} />
            </Field>
            <Field label="Stop loss" error={errors.stopLoss?.message}>
              <Input type="number" step="0.00001" placeholder="1.08150" {...register("stopLoss")} />
            </Field>
            <Field label="Take profit" error={errors.takeProfit?.message}>
              <Input type="number" step="0.00001" placeholder="1.09050" {...register("takeProfit")} />
            </Field>
            <Field label="Lot / position size" error={errors.lotSize?.message}>
              <Input type="number" step="0.01" placeholder="0.50" {...register("lotSize")} />
            </Field>
            <Field label="Exit price" error={errors.exitPrice?.message}>
              <Input type="number" step="0.00001" placeholder="Optional until closed" {...register("exitPrice")} />
            </Field>
            <Field label="Open time" error={errors.openTime?.message}>
              <Input type="datetime-local" {...register("openTime")} />
            </Field>
            <Field label="Close time" error={errors.closeTime?.message}>
              <Input type="datetime-local" {...register("closeTime")} />
            </Field>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <Card>
          <CardHeader>
            <CardTitle>Context and psychology</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <Field label="Setup / Strategy tags">
              <Input list="strategy-tags" placeholder="FVG, Breakout" {...register("strategyTags")} />
              <datalist id="strategy-tags">
                {strategyTagOptions.map((tag) => <option key={tag} value={tag} />)}
              </datalist>
            </Field>
            <Field label="Emotional state">
              <select className="h-10 w-full rounded-md border border-input bg-[#0d0d14]/80 px-3 text-sm" {...register("emotionalState")}>
                <option value="">Select state</option>
                {emotions.map((emotion) => <option key={emotion} value={emotion}>{emotion}</option>)}
              </select>
            </Field>
            <Field label="Mistakes made">
              <Input list="mistakes" placeholder="FOMO, moved SL" {...register("mistakes")} />
              <datalist id="mistakes">
                {mistakeOptions.map((mistake) => <option key={mistake} value={mistake} />)}
              </datalist>
            </Field>
            <Field label="Screenshot upload">
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadScreenshot(file);
                }}
              />
              <input type="hidden" {...register("screenshotUrl")} />
              {uploading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Uploading screenshot...</p>
              ) : screenshotPreview ? (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-xs text-profit"><CheckCircle2 className="h-3 w-3" /> Screenshot ready</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screenshotPreview} alt="Trade screenshot preview" className="h-28 rounded-lg border border-white/10 object-cover" />
                </div>
              ) : screenshotError ? (
                <p className="text-xs text-destructive">{screenshotError}</p>
              ) : null}
            </Field>
            <div className="lg:col-span-2">
              <Field label="Notes / Description">
                <Textarea placeholder="What was the thesis? What invalidated it? What needs review?" {...register("notes")} />
              </Field>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("checklistPassed")} />
              Pre-trade checklist passed
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("isBacktest")} />
              Backtest trade
            </label>
          </CardContent>
        </Card>
      </motion.div>

      {checklistItems.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Pre-trade checklist gate</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {checklistItems.map((item) => (
              <label key={item.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked />
                {item.label}
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border border-white/10 bg-[#0a0a0f]/80 p-3 backdrop-blur-xl">
        <Button type="submit" disabled={pending || uploading}>{pending ? "Saving..." : "Log trade"}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
