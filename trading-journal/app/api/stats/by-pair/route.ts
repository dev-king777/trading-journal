import { NextResponse } from "next/server";

import { calculateByPair } from "@/lib/stats/engine";
import { getTrades } from "@/lib/trades/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(calculateByPair(await getTrades()));
}
