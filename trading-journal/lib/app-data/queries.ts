import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGoalPeriodKeys, type GoalType } from "@/lib/goals/periods";
import type { ChecklistItemRecord, GoalRecord, StrategyTagRecord } from "@/types/trading";

const goalTypes: GoalType[] = ["daily", "weekly", "monthly"];

function normalizeGoal(goal: any): GoalRecord {
  return {
    id: goal.id,
    userId: goal.user_id,
    accountId: goal.account_id,
    type: goal.type,
    targetAmount: goal.target_amount === null ? null : Number(goal.target_amount),
    lossLimitAmount: goal.loss_limit_amount === null || goal.loss_limit_amount === undefined ? null : Number(goal.loss_limit_amount),
    targetPercent: goal.target_percent === null ? null : Number(goal.target_percent),
    periodStart: goal.period_start,
    periodEnd: goal.period_end,
    achieved: goal.achieved
  };
}

export async function getGoals(): Promise<GoalRecord[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("goals").select("*").eq("user_id", user.id).order("period_start", { ascending: false });
  if (error || !data?.length) return [];

  return data.map(normalizeGoal);
}

export async function ensureCurrentPeriodGoals(accountId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("account_id", accountId)
    .order("period_start", { ascending: false });

  if (error || !data?.length) return;

  const rowsToInsert = goalTypes.flatMap((type) => {
    const period = getGoalPeriodKeys(type);
    const hasCurrent = data.some((goal) => goal.type === type && goal.period_start === period.periodStart && goal.period_end === period.periodEnd);
    if (hasCurrent) return [];

    const template = data.find((goal) => goal.type === type);
    if (!template) return [];

    return [{
      user_id: user.id,
      account_id: accountId,
      type,
      target_amount: template.target_amount,
      loss_limit_amount: template.loss_limit_amount,
      target_percent: template.target_percent,
      period_start: period.periodStart,
      period_end: period.periodEnd,
      achieved: false
    }];
  });

  if (rowsToInsert.length) {
    await supabase.from("goals").insert(rowsToInsert);
  }
}

export async function getChecklistItems(): Promise<ChecklistItemRecord[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("checklist_items").select("*").eq("user_id", user.id).order("order");
  if (error || !data?.length) return [];

  return data.map((item) => ({ id: item.id, userId: item.user_id, label: item.label, order: item.order }));
}

export async function getStrategyTags(): Promise<StrategyTagRecord[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("strategy_tags").select("*").eq("user_id", user.id).order("name");
  if (error || !data?.length) return [];

  return data.map((tag) => ({ id: tag.id, userId: tag.user_id, name: tag.name, color: tag.color, description: tag.description }));
}
