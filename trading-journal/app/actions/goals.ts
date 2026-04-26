"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGoalPeriodKeys, type GoalType } from "@/lib/goals/periods";
import { getCurrentAccount } from "@/lib/trades/queries";

export async function upsertGoal(formData: FormData) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/goals?error=supabase-required");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await getCurrentAccount();
  if (!account) redirect("/accounts?error=create-account-first");

  const type = String(formData.get("type") ?? "monthly");
  const now = new Date();
  const periodStart = String(formData.get("periodStart") || now.toISOString().slice(0, 10));
  const periodEnd = String(formData.get("periodEnd") || now.toISOString().slice(0, 10));

  await supabase.from("goals").insert({
    user_id: user.id,
    account_id: account.id,
    type,
    target_amount: Number(formData.get("targetAmount") || 0) || null,
    target_percent: Number(formData.get("targetPercent") || 0) || null,
    period_start: periodStart,
    period_end: periodEnd,
    achieved: false
  });

  revalidatePath("/goals");
  redirect("/goals");
}

export async function saveGoalSet(formData: FormData) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/goals?error=supabase-required");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await getCurrentAccount();
  if (!account) redirect("/accounts?error=create-account-first");

  const types: GoalType[] = ["daily", "weekly", "monthly"];
  const rows = types.map((type) => {
    const period = getGoalPeriodKeys(type);
    return {
      user_id: user.id,
      account_id: account.id,
      type,
      target_amount: Number(formData.get(`${type}ProfitTarget`) || 0) || null,
      loss_limit_amount: Number(formData.get(`${type}LossLimit`) || 0) || null,
      target_percent: null,
      period_start: period.periodStart,
      period_end: period.periodEnd,
      achieved: false
    };
  });

  for (const row of rows) {
    await supabase
      .from("goals")
      .delete()
      .eq("user_id", user.id)
      .eq("account_id", account.id)
      .eq("type", row.type)
      .eq("period_start", row.period_start)
      .eq("period_end", row.period_end);
  }

  await supabase.from("goals").insert(rows);

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect("/goals");
}
