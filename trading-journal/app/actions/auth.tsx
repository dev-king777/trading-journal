"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient, ensureUserProfile } from "@/lib/auth/current-user";
import { sendApprovalRequestEmail } from "@/lib/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20environment%20variables%20are%20required");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/signup?error=Supabase%20environment%20variables%20are%20required");
  }

  let userId: string | undefined;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    userId = data.user.id;
    await ensureUserProfile({ id: userId, email, user_metadata: { name } });
  } else {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    userId = data.user?.id;
    if (userId) await ensureUserProfile({ id: userId, email, user_metadata: { name } });
  }

  if (!userId) {
    redirect("/signup?error=Failed%20to%20create%20account");
  }

  // Mark user as pending approval and generate a one-time approval token
  const approvalToken = crypto.randomBytes(32).toString("hex");
  const admin = createSupabaseAdminClient();
  await admin.from("users").update({ approved: false, approval_token: approvalToken }).eq("id", userId);

  // Sign the user in so they have a valid session (but they'll be gated at /pending)
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`/login?error=${encodeURIComponent(signInError.message)}`);
  }

  // Notify admin by email (non-blocking — failure here shouldn't break signup)
  try {
    await sendApprovalRequestEmail({ userEmail: email, userName: name, approvalToken });
  } catch {
    // Email sending is best-effort; approval link still works via token
  }

  redirect("/pending");
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/forgot-password?sent=1");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?sent=1");
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
