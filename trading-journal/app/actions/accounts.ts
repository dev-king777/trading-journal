"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureUserProfile } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createAccount(formData: FormData) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/accounts?error=Supabase%20environment%20variables%20are%20required");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  await ensureUserProfile(user);

  const name = String(formData.get("name") ?? "Trading Account");
  const startingBalance = Number(formData.get("startingBalance") ?? 10000);

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name,
    type: "personal",
    starting_balance: startingBalance,
    current_balance: startingBalance,
    currency: String(formData.get("currency") ?? "USD"),
    max_drawdown_rule: null,
    daily_loss_rule: null,
    profit_target: null
  });

  if (error) redirect(`/accounts?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/accounts");
  redirect("/dashboard");
}

export async function deleteAccount(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/accounts?error=Supabase%20environment%20variables%20are%20required");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/accounts");
  redirect("/accounts");
}
