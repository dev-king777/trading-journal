import { NextResponse } from "next/server";

import { getTrades } from "@/lib/trades/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const trades = await getTrades();
  return NextResponse.json({ trades });
}
