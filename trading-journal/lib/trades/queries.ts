import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountRecord, TradeRecord } from "@/types/trading";

function getActiveAccountId() {
  return cookies().get("active_account_id")?.value ?? null;
}

function normalizeTrade(row: Record<string, unknown>): TradeRecord {
  return {
    id: String(row.id),
    externalId: row.external_id ? String(row.external_id) : null,
    userId: String(row.user_id),
    accountId: String(row.account_id),
    pair: String(row.pair),
    direction: row.direction as TradeRecord["direction"],
    entryPrice: Number(row.entry_price),
    exitPrice: row.exit_price === null ? null : Number(row.exit_price),
    stopLoss: row.stop_loss === null ? null : Number(row.stop_loss),
    takeProfit: row.take_profit === null ? null : Number(row.take_profit),
    lotSize: Number(row.lot_size),
    riskPercent: Number(row.risk_percent),
    riskRewardRatio: Number(row.risk_reward_ratio),
    openTime: String(row.open_time),
    closeTime: row.close_time ? String(row.close_time) : null,
    session: row.session as TradeRecord["session"],
    result: row.result as TradeRecord["result"],
    pnlAmount: Number(row.pnl_amount),
    calculatedPnlAmount: row.calculated_pnl_amount === null || row.calculated_pnl_amount === undefined ? null : Number(row.calculated_pnl_amount),
    manualPnlAmount: row.manual_pnl_amount === null || row.manual_pnl_amount === undefined ? null : Number(row.manual_pnl_amount),
    pnlPips: Number(row.pnl_pips),
    commission: Number(row.commission ?? 0),
    swap: Number(row.swap ?? 0),
    pnlPercent: Number(row.pnl_percent),
    strategyTags: (row.strategy_tags as string[] | null) ?? [],
    notes: row.notes ? String(row.notes) : null,
    screenshotUrl: row.screenshot_url ? String(row.screenshot_url) : null,
    emotionalState: row.emotional_state ? String(row.emotional_state) : null,
    mistakes: (row.mistakes as string[] | null) ?? [],
    checklistPassed: Boolean(row.checklist_passed),
    isBacktest: Boolean(row.is_backtest),
    createdAt: String(row.created_at)
  };
}

function extractScreenshotPath(value: string) {
  const marker = "/storage/v1/object/public/screenshots/";
  const signedMarker = "/storage/v1/object/sign/screenshots/";

  if (value.includes(marker)) {
    return decodeURIComponent(value.split(marker)[1]?.split("?")[0] ?? "");
  }

  if (value.includes(signedMarker)) {
    return decodeURIComponent(value.split(signedMarker)[1]?.split("?")[0] ?? "");
  }

  if (!value.startsWith("http")) {
    return value;
  }

  return null;
}

async function resolveScreenshotUrl(value: string | null, supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  if (!value) return null;

  const path = extractScreenshotPath(value);
  if (!path) return value;

  const storage = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createSupabaseAdminClient().storage
    : supabase.storage;

  const { data, error } = await storage.from("screenshots").createSignedUrl(path, 60 * 60);
  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  return value.startsWith("http") ? value : null;
}

export async function getCurrentAccount(): Promise<AccountRecord | null> {
  const accounts = await getAccounts();
  const activeAccountId = getActiveAccountId();
  return accounts.find((account) => account.id === activeAccountId) ?? accounts[0] ?? null;
}

async function getUserId() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user.id;
}

function normalizeAccount(row: Record<string, unknown>): AccountRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    type: row.type as AccountRecord["type"],
    startingBalance: Number(row.starting_balance),
    currentBalance: Number(row.current_balance),
    currency: String(row.currency),
    maxDrawdownRule: row.max_drawdown_rule === null ? null : Number(row.max_drawdown_rule),
    dailyLossRule: row.daily_loss_rule === null ? null : Number(row.daily_loss_rule),
    profitTarget: row.profit_target === null ? null : Number(row.profit_target),
    createdAt: String(row.created_at)
  };
}

export async function getAccounts(): Promise<AccountRecord[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const [{ data, error }, { data: tradeRows }] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("trades").select("account_id,pnl_amount").eq("user_id", userId)
  ]);

  if (error || !data?.length) {
    return [];
  }

  const pnlByAccount = new Map<string, number>();
  for (const trade of tradeRows ?? []) {
    const accountId = String(trade.account_id);
    pnlByAccount.set(accountId, (pnlByAccount.get(accountId) ?? 0) + Number(trade.pnl_amount ?? 0));
  }

  return data.map((row) => {
    const account = normalizeAccount(row);
    return {
      ...account,
      currentBalance: Number((account.startingBalance + (pnlByAccount.get(account.id) ?? 0)).toFixed(2))
    };
  });
}

export async function getTrades(): Promise<TradeRecord[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  let query = supabase.from("trades").select("*").eq("user_id", userId).order("open_time", { ascending: false });
  const activeAccountId = getActiveAccountId();
  if (activeAccountId) {
    query = query.eq("account_id", activeAccountId);
  }
  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => normalizeTrade(row));
}

export async function getAllTrades(): Promise<TradeRecord[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase.from("trades").select("*").eq("user_id", userId).order("open_time", { ascending: false });

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => normalizeTrade(row));
}

export async function getTradeById(id: string): Promise<TradeRecord | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from("trades").select("*").eq("user_id", user.id).eq("id", id).single();

  if (error || !data) {
    return null;
  }

  const trade = normalizeTrade(data);
  trade.screenshotUrl = await resolveScreenshotUrl(trade.screenshotUrl, supabase);
  return trade;
}
