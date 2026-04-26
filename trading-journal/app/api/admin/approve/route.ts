import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/auth/current-user";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token.", { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: user, error } = await admin
    .from("users")
    .select("id, email, name")
    .eq("approval_token", token)
    .single();

  if (error || !user) {
    return new NextResponse("Invalid or expired approval token.", { status: 404 });
  }

  const { error: updateError } = await admin
    .from("users")
    .update({ approved: true, approval_token: null })
    .eq("id", user.id);

  if (updateError) {
    return new NextResponse("Failed to approve user.", { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/pending?approved=1`);
}
