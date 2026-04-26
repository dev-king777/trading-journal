"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  calculateRiskPercent,
  calculateRiskRewardRatio,
  calculateTradePnl,
  deriveSession,
  inferResult
} from "@/lib/stats/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { tradeFormSchema } from "@/lib/trades/schema";
import { getCurrentAccount } from "@/lib/trades/queries";

export async function createTrade(_: unknown, formData: FormData) {
  const parsed = tradeFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.errors[0]?.message ?? "Invalid trade data."
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase environment variables are required."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const account = await getCurrentAccount();

  if (!account) {
    return {
      ok: false,
      message: "Create an account before logging trades."
    };
  }

  const values = parsed.data;
  const openTime = new Date(values.openTime);
  const exitPrice = values.exitPrice ?? null;
  const pnl = calculateTradePnl({
    pair: values.pair,
    direction: values.direction,
    entryPrice: values.entryPrice,
    exitPrice,
    lotSize: values.lotSize,
    accountBalance: account.currentBalance
  });
  const finalPnlAmount = values.manualPnlAmount ?? 0;
  const pnlPercent = account.currentBalance > 0 ? Number(((finalPnlAmount / account.currentBalance) * 100).toFixed(2)) : 0;

  const row = {
    user_id: user.id,
    account_id: account.id,
    pair: values.pair,
    direction: values.direction,
    entry_price: values.entryPrice,
    exit_price: exitPrice,
    stop_loss: values.stopLoss,
    take_profit: values.takeProfit,
    lot_size: values.lotSize,
    risk_percent: calculateRiskPercent({
      pair: values.pair,
      entryPrice: values.entryPrice,
      stopLoss: values.stopLoss,
      lotSize: values.lotSize,
      accountBalance: account.currentBalance
    }),
    risk_reward_ratio: calculateRiskRewardRatio(values.entryPrice, values.stopLoss, values.takeProfit),
    open_time: openTime.toISOString(),
    close_time: values.closeTime ? new Date(values.closeTime).toISOString() : null,
    session: deriveSession(openTime),
    result: values.manualPnlAmount !== undefined ? inferResult(finalPnlAmount) : "open",
    pnl_amount: finalPnlAmount,
    calculated_pnl_amount: pnl.pnlAmount,
    manual_pnl_amount: values.manualPnlAmount ?? null,
    pnl_pips: pnl.pnlPips,
    pnl_percent: pnlPercent,
    strategy_tags: values.strategyTags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
    notes: values.notes || null,
    screenshot_url: values.screenshotUrl ?? null,
    emotional_state: values.emotionalState || null,
    mistakes: values.mistakes?.split(",").map((mistake) => mistake.trim()).filter(Boolean) ?? [],
    checklist_passed: Boolean(values.checklistPassed),
    is_backtest: Boolean(values.isBacktest)
  };

  const { error } = await supabase.from("trades").insert(row);

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/goals");
  revalidatePath("/accounts");
  return {
    ok: true,
    message: "Trade saved."
  };
}

export async function updateTrade(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = tradeFormSchema.safeParse(Object.fromEntries(formData));

  if (!id || !parsed.success) {
    return {
      ok: false,
      message: parsed.success ? "Missing trade id." : parsed.error.errors[0]?.message ?? "Invalid trade data."
    };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase environment variables are required." };

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing, error: existingError } = await supabase
    .from("trades")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existing) {
    return { ok: false, message: existingError?.message ?? "Trade not found." };
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", existing.account_id)
    .eq("user_id", user.id)
    .single();

  if (!account) return { ok: false, message: "Trade account not found." };

  const values = parsed.data;
  const openTime = new Date(values.openTime);
  const exitPrice = values.exitPrice ?? null;
  const calculatedPnl = calculateTradePnl({
    pair: values.pair,
    direction: values.direction,
    entryPrice: values.entryPrice,
    exitPrice,
    lotSize: values.lotSize,
    accountBalance: Number(account.current_balance)
  });
  const finalPnlAmount = values.manualPnlAmount ?? 0;
  const pnlPercent = Number(account.current_balance) > 0 ? Number(((finalPnlAmount / Number(account.current_balance)) * 100).toFixed(2)) : 0;

  const { error } = await supabase
    .from("trades")
    .update({
      pair: values.pair,
      direction: values.direction,
      entry_price: values.entryPrice,
      exit_price: exitPrice,
      stop_loss: values.stopLoss,
      take_profit: values.takeProfit,
      lot_size: values.lotSize,
      risk_percent: calculateRiskPercent({
        pair: values.pair,
        entryPrice: values.entryPrice,
        stopLoss: values.stopLoss,
        lotSize: values.lotSize,
        accountBalance: Number(account.current_balance)
      }),
      risk_reward_ratio: calculateRiskRewardRatio(values.entryPrice, values.stopLoss, values.takeProfit),
      open_time: openTime.toISOString(),
      close_time: values.closeTime ? new Date(values.closeTime).toISOString() : null,
      session: deriveSession(openTime),
      result: values.manualPnlAmount !== undefined ? inferResult(finalPnlAmount) : "open",
      pnl_amount: finalPnlAmount,
      calculated_pnl_amount: calculatedPnl.pnlAmount,
      manual_pnl_amount: values.manualPnlAmount ?? null,
      pnl_pips: calculatedPnl.pnlPips,
      pnl_percent: pnlPercent,
      strategy_tags: values.strategyTags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      notes: values.notes || null,
      screenshot_url: values.screenshotUrl ?? null,
      emotional_state: values.emotionalState || null,
      mistakes: values.mistakes?.split(",").map((mistake) => mistake.trim()).filter(Boolean) ?? [],
      checklist_passed: Boolean(values.checklistPassed),
      is_backtest: Boolean(values.isBacktest)
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/trades/${id}`);
  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/goals");
  revalidatePath("/accounts");
  return { ok: true, message: "Trade updated." };
}

export async function deleteTrades(formData: FormData) {
  const ids = String(formData.get("ids") ?? "").split(",").filter(Boolean);
  if (!ids.length) return { ok: false, message: "No trades selected." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Supabase env vars required." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("trades").delete().in("id", ids).eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/goals");
  revalidatePath("/accounts");
  return { ok: true, message: `${ids.length} trade${ids.length > 1 ? "s" : ""} deleted.` };
}

export async function deleteTrade(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect(`/trades/${id}?error=supabase-required`);

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/trades/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/goals");
  revalidatePath("/accounts");
  redirect("/trades");
}
