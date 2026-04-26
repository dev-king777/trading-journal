import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  onboardedAt: string | null;
  approved: boolean;
};

const anonymousUser: AppUser = {
  id: "",
  email: "",
  name: "Trader",
  onboardedAt: null,
  approved: false
};

export async function getCurrentUser(): Promise<AppUser> {
  const supabase = createSupabaseServerClient();

  if (!supabase || !hasSupabaseEnv()) {
    return anonymousUser;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return anonymousUser;
  }

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single();

  if (!data) {
    return {
      id: user.id,
      email: user.email ?? "",
      name: String(user.user_metadata.name ?? "Trader"),
      onboardedAt: null,
      approved: false
    };
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    onboardedAt: data.onboarded_at,
    approved: data.approved ?? false
  };
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function ensureUserProfile(user: { id: string; email?: string | null; user_metadata?: { name?: unknown } }) {
  const profile = {
    id: user.id,
    email: user.email ?? "",
    name: String(user.user_metadata?.name ?? "Trader"),
    timezone: "UTC",
    currency: "USD"
  };

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await createSupabaseAdminClient().from("users").upsert(profile);
    return;
  }

  const supabase = createSupabaseServerClient();
  await supabase?.from("users").upsert(profile);
}
