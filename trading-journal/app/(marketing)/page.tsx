import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (hasSupabaseEnv()) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase!.auth.getUser();

    redirect(user ? "/dashboard" : "/login");
  }

  redirect("/login");
}
