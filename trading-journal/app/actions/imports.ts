"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateRiskPercent, calculateRiskRewardRatio, calculateTradePnl, deriveSession, inferResult } from "@/lib/stats/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { importedTradeSchema } from "@/lib/imports/csv";

export async function importTrades(formData: FormData) {
  const raw = String(formData.get("trades") ?? "[]");
  const parsed = zodParseImport(raw);

  if (!parsed.ok) {
    redirect(`/trades/import?error=${encodeURIComponent(parsed.message)}`);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/trades/import?error=supabase-required");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: account } = await supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at").limit(1).single();
  const { data: profile } = await supabase.from("users").select("timezone").eq("id", user.id).maybeSingle();
  const timezone = typeof profile?.timezone === "string" ? profile.timezone : "UTC";

  if (!account) {
    redirect("/accounts?error=create-account-first");
  }

  const externalIds = Array.from(new Set(parsed.trades.map((trade) => trade.externalId).filter((id): id is string => Boolean(id))));
  let existingExternalIds = new Set<string>();

  if (externalIds.length) {
    const { data: existing, error } = await supabase
      .from("trades")
      .select("external_id")
      .eq("user_id", user.id)
      .in("external_id", externalIds);

    if (error) {
      redirect(`/trades/import?error=${encodeURIComponent(error.message)}`);
    }

    existingExternalIds = new Set((existing ?? []).map((row) => String(row.external_id)).filter(Boolean));
  }

  const seenExternalIds = new Set<string>();
  const newTrades = parsed.trades.filter((trade) => {
    if (!trade.externalId) return true;
    if (existingExternalIds.has(trade.externalId) || seenExternalIds.has(trade.externalId)) return false;
    seenExternalIds.add(trade.externalId);
    return true;
  });

  if (!newTrades.length) {
    redirect("/trades/import?error=no-new-trades");
  }

  const rows = newTrades.map((trade) => {
    const openTime = new Date(trade.openTime);
    const calculatedPnl = calculateTradePnl({
      pair: trade.pair,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice ?? null,
      lotSize: trade.lotSize,
      accountBalance: Number(account.current_balance)
    });
    const pnlAmount = trade.pnlAmount ?? calculatedPnl.pnlAmount;
    const pnlPips = trade.pnlPips ?? calculatedPnl.pnlPips;
    const pnlPercent = Number(account.current_balance) > 0 ? Number(((pnlAmount / Number(account.current_balance)) * 100).toFixed(2)) : 0;

    return {
      external_id: trade.externalId ?? null,
      user_id: user.id,
      account_id: account.id,
      pair: trade.pair,
      direction: trade.direction,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice ?? null,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      lot_size: trade.lotSize,
      risk_percent: calculateRiskPercent({
        pair: trade.pair,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        lotSize: trade.lotSize,
        accountBalance: Number(account.current_balance)
      }),
      risk_reward_ratio: calculateRiskRewardRatio(trade.entryPrice, trade.stopLoss, trade.takeProfit),
      open_time: openTime.toISOString(),
      close_time: trade.closeTime ? new Date(trade.closeTime).toISOString() : null,
      session: deriveSession(openTime, timezone),
      result: trade.result ?? (trade.exitPrice ? inferResult(pnlAmount) : "open"),
      pnl_amount: pnlAmount,
      calculated_pnl_amount: calculatedPnl.pnlAmount,
      manual_pnl_amount: trade.pnlAmount ?? null,
      pnl_pips: pnlPips,
      pnl_percent: pnlPercent,
      commission: trade.commission ?? 0,
      swap: trade.swap ?? 0,
      strategy_tags: trade.strategyTags,
      notes: trade.notes || null,
      emotional_state: trade.emotionalState ?? null
    };
  });

  const { error } = await supabase.from("trades").insert(rows);

  if (error) {
    redirect(`/trades/import?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  redirect("/trades");
}

function zodParseImport(raw: string):
  | { ok: true; trades: ReturnType<typeof importedTradeSchema.parse>[] }
  | { ok: false; message: string } {
  try {
    const data = JSON.parse(raw) as unknown[];
    return { ok: true, trades: data.map((item) => importedTradeSchema.parse(item)) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Invalid import payload." };
  }
}
