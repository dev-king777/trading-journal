import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccounts, getCurrentAccount } from "@/lib/trades/queries";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase!.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const appUser = await getCurrentUser();
    if (!appUser.approved) {
      redirect("/pending");
    }
  }

  const [account, accounts] = await Promise.all([getCurrentAccount(), getAccounts()]);

  return <AppShell accountName={account?.name ?? "No account yet"} accounts={accounts} activeAccountId={account?.id}>{children}</AppShell>;
}
