"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/trades/queries";

export async function createChecklistItem(formData: FormData) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/settings?error=supabase-required");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("checklist_items").insert({
    user_id: user.id,
    label: String(formData.get("label") ?? ""),
    order: Number(formData.get("order") ?? 1)
  });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function createStrategyTag(formData: FormData) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/settings/strategies?error=supabase-required");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("strategy_tags").insert({
    user_id: user.id,
    name: String(formData.get("name") ?? ""),
    color: String(formData.get("color") ?? "#00d9ff"),
    description: String(formData.get("description") ?? "")
  });
  revalidatePath("/settings/strategies");
  redirect("/settings/strategies");
}

export async function clearActiveAccountTrades(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "DELETE") redirect("/settings?error=confirmation-required");

  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/settings?error=supabase-required");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const account = await getCurrentAccount();
  if (!account) redirect("/settings?error=no-active-account");

  const { error } = await supabase.from("trades").delete().eq("user_id", user.id).eq("account_id", account.id);
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/trades");
  revalidatePath("/accounts");
  redirect("/settings?cleared=1");
}
